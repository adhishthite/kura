#!/usr/bin/env python3
"""
Simple script to load ES chats and convert to Kura conversations
"""

import os
import logging
from datetime import datetime

from dotenv import load_dotenv
from elasticsearch import Elasticsearch
from kura.types import Conversation, Message
from tqdm import tqdm

logger = logging.getLogger(__name__)

load_dotenv()

# ES connection
ES_URL = os.getenv("ES_URL")
ES_API_KEY = os.getenv("ES_API_KEY")

def load_chats_to_kura(n_records=None, index_name="chats"):
    """
    Load n records from ES and transform to Kura conversations
    
    Args:
        n_records: Number of records to load (None = all)
        index_name: ES index name
    
    Returns:
        List of Kura Conversation objects
    """
    
    # Connect to ES
    logger.info(f"Connecting to Elasticsearch at {ES_URL}")
    es = Elasticsearch(
        [ES_URL],
        api_key=ES_API_KEY,
        verify_certs=True
    )
    
    logger.info(f"🔍 Loading {n_records if n_records else 'all'} chats from ES...")
    
    # Get data from ES - use scroll API for large datasets
    all_hits = []
    
    try:
        if n_records and n_records <= 10000:
            # Use regular search for small datasets
            logger.info("Using regular search API")
            query = {
                "query": {"match_all": {}},
                "sort": [{"createdAt": {"order": "desc"}}],
                "size": n_records
            }
            response = es.search(index=index_name, body=query)
            all_hits = response["hits"]["hits"]
            logger.info(f"📊 Retrieved {len(all_hits)} documents from ES")
            
        else:
            # Use scroll API for large datasets or when loading all
            logger.info("Using scroll API for large dataset")
            query = {
                "query": {"match_all": {}},
                "sort": [{"createdAt": {"order": "desc"}}]
            }
            
            # Initial search with scroll
            scroll_size = 500  # Number of docs per scroll batch
            logger.info(f"Starting scroll with batch size: {scroll_size}")
            
            query["size"] = scroll_size

            response = es.search(
                index=index_name,
                body=query,
                scroll='2m',  # Keep search context alive for 2 minutes
            )
            
            scroll_id = response['_scroll_id']
            scroll_hits = response['hits']['hits']
            all_hits.extend(scroll_hits)
            
            logger.info(f"📊 Initial scroll batch: {len(scroll_hits)} documents")
            
            # Continue scrolling until no more results or reached n_records
            batch_count = 1
            while len(scroll_hits) > 0:
                # Check if we've reached the requested number of records
                if n_records and len(all_hits) >= n_records:
                    # Truncate to exact number requested
                    all_hits = all_hits[:n_records]
                    logger.info(f"🎯 Reached target of {n_records} records, stopping scroll")
                    break
                    
                # Get next batch
                response = es.scroll(scroll_id=scroll_id, scroll='2m')
                scroll_id = response['_scroll_id']
                scroll_hits = response['hits']['hits']
                all_hits.extend(scroll_hits)
                
                batch_count += 1
                logger.info(f"📊 Scroll batch {batch_count}: {len(scroll_hits)} documents (total: {len(all_hits)})")
            
            # Clear the scroll context
            try:
                es.clear_scroll(scroll_id=scroll_id)
                logger.info("🧹 Cleared scroll context")
            except Exception as scroll_error:
                logger.warning(f"Failed to clear scroll context: {scroll_error}")
                
            logger.info(f"📊 Total retrieved: {len(all_hits)} documents from ES")
            
    except Exception as e:
        logger.error(f"Failed to retrieve documents from ES: {e}")
        return []
    
    # Transform to Kura conversations
    logger.info("🔄 Starting transformation to Kura conversations...")
    conversations = []
    
    for hit in tqdm(all_hits, desc="Converting to Kura conversations"):
        source = hit["_source"]
        
        # Parse datetime
        try:
            created_at = datetime.fromisoformat(source["createdAt"].replace("+00:00", "+00:00"))
        except Exception as e:
            logger.warning(f"Failed to parse createdAt for chat id {source.get('id')}: {e}. Using current time.")
            created_at = datetime.now()
        
        # Transform messages
        messages = []
        for msg in source.get("messages", []):
            role = "user" if msg["role"] == "user" else "assistant"
            content = msg.get("content", "")
            msg_time = msg.get("timestamp", datetime.now().isoformat())
            
            # Create Kura message
            kura_msg = Message(
                role=role,
                content=content,
                created_at=msg_time
            )
            messages.append(kura_msg)
        
        # Create Kura conversation
        try:
            conv = Conversation(
                id=source["id"],
                chat_id=source["id"],
                created_at=created_at,
                messages=messages,
                metadata={
                    "title": source.get("title"),
                    "user_hash": source.get("userHash"),
                }
            )
            conversations.append(conv)
            
        except Exception as e:
            logger.error(f"Failed to create Kura conversation for chat {source.get('id')}: {e}")
            continue
    
    # Verification
    logger.info("✅ Transformation complete!")
    logger.info(f"📈 ES documents loaded: {len(all_hits)}")
    logger.info(f"📈 Kura conversations created: {len(conversations)}")
    if len(all_hits) > 0:
        logger.info(f"📈 Success rate: {len(conversations)/len(all_hits)*100:.1f}%")
    else:
        logger.info("📈 Success rate: N/A (no hits)")
    
    return conversations

# Usage examples
if __name__ == "__main__":
    # Load records for testing
    conversations: list[Conversation] = load_chats_to_kura(
        n_records=10,
        index_name="chats"
    )
    
    # Show first conversation
    if conversations:
        conv: Conversation = conversations[0]
        logger.info("🔍 Sample conversation:")
        logger.info(f"   ID: {conv.chat_id}")
        logger.info(f"   Title: {conv.metadata.get('title')}")
        logger.info(f"   Messages: {len(conv.messages)}")
        if conv.messages:
            logger.info(f"   First message: {conv.messages[0].content[:100]}...")
        
        # Show some stats
        total_messages = sum(len(c.messages) for c in conversations)
        logger.info("📊 Overall stats:")
        logger.info(f"   Total conversations: {len(conversations)}")
        logger.info(f"   Total messages: {total_messages}")
        logger.info(f"   Avg messages per conversation: {total_messages/len(conversations):.1f}")