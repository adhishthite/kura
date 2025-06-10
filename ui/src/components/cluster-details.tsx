"use client";

import type { ClusterTreeNode, ConversationInfo } from "../types/cluster";
import { useState } from "react";
import ConversationDialog from "./conversation-dialog";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface ClusterDetailsProps {
  selectedCluster: ClusterTreeNode | null;
  conversationMetadataMap: Map<string, ConversationInfo>;
  showConversations?: boolean;
}

interface MetadataSummaryProps {
  aggregatedMetadata: Record<string, unknown[]>;
}

function MetadataSummary({ aggregatedMetadata }: MetadataSummaryProps) {
  const [aggregationMode, setAggregationMode] = useState<"individual" | "list">(
    "individual"
  );

  if (Object.keys(aggregatedMetadata).length === 0) return null;

  return (
    <div className="space-y-3 border-t border-accent/20 pt-4 mt-4 bg-accent/5 rounded-lg p-4">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-xs font-semibold">Metadata Summary</h4>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Aggregation:</span>
          <Button
            variant={aggregationMode === "individual" ? "default" : "outline"}
            size="sm"
            onClick={() => setAggregationMode("individual")}
            className="h-6 px-2 text-xs"
          >
            Individual
          </Button>
          <Button
            variant={aggregationMode === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setAggregationMode("list")}
            className="h-6 px-2 text-xs"
          >
            List
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-2">
        {Object.entries(aggregatedMetadata).map(([key, values]) => {
          // Count occurrences based on aggregation mode
          const valueCounts = values.reduce(
            (acc: Record<string, number>, val: unknown) => {
              if (Array.isArray(val) && aggregationMode === "individual") {
                // For individual mode, count each item in the array separately
                val.forEach((item: unknown) => {
                  const itemStr = String(item);
                  acc[itemStr] = (acc[itemStr] || 0) + 1;
                });
              } else {
                // For list mode or non-array values, count the whole value
                const valueStr = Array.isArray(val)
                  ? val.join(", ")
                  : String(val);
                acc[valueStr] = (acc[valueStr] || 0) + 1;
              }
              return acc;
            },
            {}
          );

          return (
            <div key={key} className="text-xs">
              <span className="font-medium">{key}:</span>{" "}
              <div className="flex flex-wrap gap-1 mt-1">
                {Object.entries(valueCounts).map(([value, count]) => (
                  <Badge
                    key={`${key}-${value}`}
                    variant="secondary"
                    className="text-[10px] h-5 px-2 bg-chart-4/10 text-chart-4 border-chart-4/20 hover:bg-chart-4/20"
                  >
                    {value}
                    <span className="ml-1 text-muted-foreground">
                      ({count})
                    </span>
                  </Badge>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ClusterDetails({
  selectedCluster,
  conversationMetadataMap,
  showConversations = false,
}: ClusterDetailsProps) {
  const [selectedConversation, setSelectedConversation] =
    useState<ConversationInfo | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  if (!selectedCluster) return null;

  // Get the actual conversation objects from the metadata map
  const chats = selectedCluster.chat_ids
    ?.map((id: string) => {
      return conversationMetadataMap.get(id);
    })
    .filter(Boolean) as ConversationInfo[];

  const aggregatedMetadata = chats.reduce(
    (acc: Record<string, unknown[]>, chat: ConversationInfo) => {
      if (!chat || !chat.metadata) return acc;

      // Iterate through each metadata key-value pair
      Object.entries(chat.metadata).forEach(([key, value]) => {
        if (!acc[key]) {
          // Initialize the array for this key
          acc[key] = [];
        }

        // If the value is already an array, store it as a nested array
        if (Array.isArray(value)) {
          acc[key].push(value);
        } else {
          // For primitive types (string, number, boolean), add to array
          acc[key].push(value);
        }
      });

      return acc;
    },
    {}
  );

  const handleConversationClick = (conversation: ConversationInfo) => {
    setSelectedConversation(conversation);
    setIsDialogOpen(true);
  };

  // If showing conversations only, render just the conversations list
  if (showConversations) {
    return (
      <div className="h-full flex flex-col overflow-hidden">
        <div className="text-sm text-muted-foreground mb-3 flex-shrink-0">
          {chats.length} conversations in this cluster
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {chats.map((item: ConversationInfo) => (
            <div
              key={item.chat_id}
              className="p-4 border border-accent/10 rounded-lg cursor-pointer hover:bg-accent/5 hover:border-accent/20 transition-all duration-200 hover:shadow-sm bg-gradient-to-r from-card to-transparent"
              onClick={() => handleConversationClick(item)}
            >
              <p className="text-xs text-muted-foreground mb-2 font-mono opacity-60">
                {item.chat_id}
              </p>
              <p className="text-sm leading-relaxed text-foreground line-clamp-3">
                {item.summary}
              </p>
            </div>
          ))}
        </div>

        {/* Conversation Dialog */}
        {selectedConversation && (
          <ConversationDialog
            conversation={selectedConversation}
            isOpen={isDialogOpen}
            onOpenChange={setIsDialogOpen}
          />
        )}
      </div>
    );
  }

  // Otherwise, render cluster details only
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Fixed header section */}
      <div className="flex-shrink-0 space-y-3">
        <div className="p-4 bg-gradient-to-r from-accent/5 to-transparent rounded-lg border border-accent/10">
          <h3 className="font-semibold text-lg leading-tight text-foreground">
            {selectedCluster.name}
          </h3>
          {selectedCluster.description && (
            <p className="text-sm text-muted-foreground leading-relaxed mt-2">
              {selectedCluster.description}
            </p>
          )}
          <div className="flex items-center gap-6 text-xs mt-3">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-chart-2"></div>
              <span className="font-medium text-foreground">Level:</span>
              <span className="text-muted-foreground">
                {selectedCluster.level}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-chart-3"></div>
              <span className="font-medium text-foreground">
                Conversations:
              </span>
              <span className="text-muted-foreground">
                {selectedCluster.chat_ids?.length}
              </span>
            </div>
          </div>
          {selectedCluster.id && (
            <p className="text-xs text-muted-foreground font-mono opacity-60 mt-2">
              {selectedCluster.id}
            </p>
          )}
        </div>
      </div>

      {/* Scrollable metadata section */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-2">
        <MetadataSummary aggregatedMetadata={aggregatedMetadata} />
      </div>
    </div>
  );
}
