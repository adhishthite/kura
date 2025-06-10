"use client";

import { useState, lazy, Suspense } from "react";

import UploadForm from "./components/upload-form";
import type {
  ConversationClustersList,
  ConversationsList,
  ConversationSummariesList,
} from "./types/kura";
import {
  type ConversationInfo,
  ConversationInfoSchema,
  type ClusterTreeNode,
} from "./types/cluster";
import { buildClusterTree, flattenClusterTree } from "./lib/tree";
import { Card, CardContent, CardHeader, CardTitle } from "./components/ui/card";
import { Upload } from "lucide-react";
import Header from "./components/header";

// Lazy load heavy components
const ClusterTree = lazy(() => import("./components/cluster-tree"));
const ClusterDetails = lazy(() => import("./components/cluster-details"));
const ClusterMap = lazy(() => import("./components/cluster-map"));

function App() {
  const [conversations, setConversations] = useState<ConversationsList | null>(
    null
  );
  const [summaries, setSummaries] = useState<ConversationSummariesList | null>(
    null
  );
  const [clusters, setClusters] = useState<ConversationClustersList | null>(
    null
  );
  const [conversationMetadataMap, setConversationMetadataMap] = useState<
    Map<string, ConversationInfo>
  >(new Map());

  const [clusterTree, setClusterTree] = useState<ClusterTreeNode | null>(null);
  const [selectedCluster, setSelectedCluster] =
    useState<ClusterTreeNode | null>(null);

  const [flatClusterNodes, setFlatClusterNodes] = useState<ClusterTreeNode[]>(
    []
  );

  const resetVisualisations = () => {
    setConversations(null);
    setSummaries(null);
    setClusters(null);
    setConversationMetadataMap(new Map());
    setClusterTree(null);
    setSelectedCluster(null);
  };

  const handleVisualiseClusters = () => {
    if (!clusters || !conversations) return;
    const metadataMap = new Map<string, ConversationInfo>();
    for (const conversation of conversations) {
      const summary = summaries?.find(
        (sum) => sum.chat_id === conversation.chat_id
      )?.summary;
      if (!summary) {
        throw new Error(
          `No summary found for conversation ${conversation.chat_id}`
        );
      }

      const conversationWithSummary = ConversationInfoSchema.parse({
        ...conversation,
        summary,
      });

      metadataMap.set(conversation.chat_id, conversationWithSummary);
    }

    // Create this so we can quickly compute the cluster metadata
    setConversationMetadataMap(metadataMap);

    // Now we build a tree of clusters
    const clusterTree = buildClusterTree(clusters, null, 0);
    setClusterTree(clusterTree);

    const flatClusterNodes = flattenClusterTree(clusterTree, []);
    setFlatClusterNodes(flatClusterNodes);
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-background via-background to-muted/20 overflow-hidden">
      <Header onReset={clusterTree ? resetVisualisations : undefined} />

      {!clusterTree && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-2xl">
            <div className="text-center mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-chart-1 flex items-center justify-center shadow-lg">
                <Upload className="h-8 w-8 text-primary-foreground" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Start Your Analysis</h2>
              <p className="text-muted-foreground">
                Upload your conversation data files to begin clustering and
                visualization
              </p>
            </div>
            <UploadForm
              setConversations={setConversations}
              conversations={conversations}
              setSummaries={setSummaries}
              summaries={summaries}
              setClusters={setClusters}
              clusters={clusters}
              handleVisualiseClusters={handleVisualiseClusters}
            />
          </div>
        </div>
      )}

      {clusterTree && (
        <div className="flex-1 p-6 overflow-hidden">
          {/* Main container with proper height distribution */}
          <div className="h-full flex flex-col gap-6">
            {/* Top row - 50% height */}
            <div className="flex-1 grid grid-cols-2 gap-6 min-h-0">
              {/* Top Left - Cluster Hierarchy */}
              <Card className="flex flex-col shadow-sm border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="pb-4 bg-gradient-to-r from-accent/5 to-transparent border-b flex-shrink-0">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-lg font-semibold flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-chart-1 animate-pulse"></div>
                      Cluster Hierarchy
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-4 overflow-hidden min-h-0">
                  {clusterTree ? (
                    <>
                      <div className="text-xs text-muted-foreground mb-2 flex-shrink-0">
                        Tree loaded: {clusterTree.children.length || 0}{" "}
                        top-level clusters
                      </div>
                      <div className="h-full overflow-hidden">
                        <Suspense fallback={<div className="flex items-center justify-center h-full text-muted-foreground">Loading cluster tree...</div>}>
                          <ClusterTree
                            clusterTree={clusterTree}
                            onSelectCluster={setSelectedCluster}
                          />
                        </Suspense>
                      </div>
                    </>
                  ) : (
                    <div className="text-muted-foreground text-center py-8">
                      No cluster tree loaded yet
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Top Right - Cluster Visualization */}
              <Card className="flex flex-col shadow-sm border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="pb-4 bg-gradient-to-r from-accent/5 to-transparent border-b flex-shrink-0">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-chart-2 animate-pulse"></div>
                    Cluster Visualization
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-4 overflow-hidden min-h-0">
                  {selectedCluster && clusters ? (
                    <div className="h-full w-full">
                      <Suspense fallback={<div className="flex items-center justify-center h-full text-muted-foreground">Loading cluster map...</div>}>
                        <ClusterMap
                          clusters={flatClusterNodes.filter(
                            (item) => item.level === selectedCluster.level
                          )}
                        />
                      </Suspense>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                      Select a cluster to view the map
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Bottom row - 50% height with 2 cards side by side */}
            <div className="flex-1 grid grid-cols-2 gap-6 min-h-0">
              {/* Bottom Left - Cluster Details */}
              <Card className="flex flex-col shadow-sm border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="pb-4 bg-gradient-to-r from-accent/5 to-transparent border-b flex-shrink-0">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-chart-3 animate-pulse"></div>
                    {selectedCluster ? "Cluster Details" : "Select a Cluster"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-4 overflow-hidden min-h-0">
                  {selectedCluster ? (
                    <Suspense fallback={<div className="flex items-center justify-center h-full text-muted-foreground">Loading cluster details...</div>}>
                      <ClusterDetails
                        selectedCluster={selectedCluster}
                        conversationMetadataMap={conversationMetadataMap}
                        showConversations={false}
                      />
                    </Suspense>
                  ) : (
                    <div className="text-muted-foreground text-center py-8">
                      Select a cluster from the hierarchy to view details
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Bottom Right - Conversations */}
              <Card className="flex flex-col shadow-sm border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm overflow-hidden">
                <CardHeader className="pb-4 bg-gradient-to-r from-accent/5 to-transparent border-b flex-shrink-0">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-chart-4 animate-pulse"></div>
                    Conversations
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 p-4 overflow-hidden min-h-0">
                  {selectedCluster ? (
                    <Suspense fallback={<div className="flex items-center justify-center h-full text-muted-foreground">Loading conversations...</div>}>
                      <ClusterDetails
                        selectedCluster={selectedCluster}
                        conversationMetadataMap={conversationMetadataMap}
                        showConversations={true}
                      />
                    </Suspense>
                  ) : (
                    <div className="text-muted-foreground text-center py-8">
                      Select a cluster to view conversations
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
