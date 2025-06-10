# Standard library imports
import asyncio
import logging
# Third-party imports
from scripts.es_to_kura import load_chats_to_kura

# Kura imports
from kura import (
    CheckpointManager,
    generate_base_clusters_from_conversation_summaries,
    reduce_clusters_from_base_clusters,
    reduce_dimensionality_from_clusters,
    summarise_conversations,
)
from kura.cluster import Cluster, ClusterModel
from kura.meta_cluster import MetaClusterModel
from kura.summarisation import SummaryModel
from kura.embedding import OpenAIEmbeddingModel
from kura.types import Conversation, ConversationSummary
from kura.dimensionality import HDBUMAP


# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)

# Config
gpt_model: str = "openai/gpt-4.1-mini"
max_concurrent_requests: int = 100
chats_index: str = "elasticgpt-chats-prod"
total_records: int = 35000
batch_size: int = 500
sleep_seconds: float = 30.0
embedding_sleep_seconds: float = 5.0

# Cluster config
max_clusters: int = 20

# Models
summary_model: SummaryModel = SummaryModel(
    model=gpt_model, max_concurrent_requests=max_concurrent_requests
)
cluster_model: ClusterModel = ClusterModel(
    model=gpt_model, max_concurrent_requests=max_concurrent_requests,
    embedding_model=OpenAIEmbeddingModel(sleep_seconds=embedding_sleep_seconds)
)
meta_cluster_model: MetaClusterModel = MetaClusterModel(
    model=gpt_model,
    max_concurrent_requests=max_concurrent_requests,
    max_clusters=max_clusters,
)
dimensionality_model: HDBUMAP = HDBUMAP()
checkpoint_manager: CheckpointManager = CheckpointManager("./checkpoint", enabled=True)


# Run pipeline
async def analyze():
    # Load conversations
    conversations: list[Conversation] = load_chats_to_kura(
        n_records=total_records, index_name=chats_index
    )

    if len(conversations) == 0:
        logging.error("No conversations loaded")
        return f"No conversations loaded: Please check the config."
    
    summaries: list[ConversationSummary] = await summarise_conversations(
        conversations,
        model=summary_model,
        checkpoint_manager=checkpoint_manager,
        batch_size=batch_size,
        sleep_seconds=sleep_seconds
    )

    clusters: list[Cluster] = await generate_base_clusters_from_conversation_summaries(
        summaries, model=cluster_model, checkpoint_manager=checkpoint_manager,
        batch_size=batch_size,
        sleep_seconds=sleep_seconds
    )

    # reduced = await reduce_clusters_from_base_clusters(
    #     clusters,
    #     model=meta_cluster_model,
    #     checkpoint_manager=checkpoint_manager,
    # )

    # projected = await reduce_dimensionality_from_clusters(
    #     reduced,
    #     model=dimensionality_model,
    #     checkpoint_manager=checkpoint_manager,
    # )

    return clusters

if __name__ == "__main__":
    asyncio.run(analyze())