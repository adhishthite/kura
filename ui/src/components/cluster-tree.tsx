import { ClusterTreeNode } from "@/types/cluster";
import { useState, useCallback, useEffect } from "react";
import { ChevronRight, ChevronDown, Expand, Shrink } from "lucide-react";
import { Button } from "./ui/button";

type Props = {
  clusterTree: ClusterTreeNode;
  indent?: number;
  onSelectCluster?: (cluster: ClusterTreeNode) => void;
  globalExpandState?: 'expand' | 'collapse' | null;
  onToggleGlobalExpand?: () => void;
};

type TreeControlsProps = {
  onExpandAll: () => void;
  onCollapseAll: () => void;
};

function TreeControls({ onExpandAll, onCollapseAll }: TreeControlsProps) {
  return (
    <div className="flex items-center gap-1 mb-3 pb-2 border-b">
      <Button
        variant="ghost"
        size="sm"
        onClick={onExpandAll}
        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
      >
        <Expand className="h-3 w-3 mr-1" />
        Expand All
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onCollapseAll}
        className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
      >
        <Shrink className="h-3 w-3 mr-1" />
        Collapse All
      </Button>
    </div>
  );
}

const ClusterTree = ({ clusterTree, indent = 0, onSelectCluster, globalExpandState }: Props) => {
  // Expand root level nodes by default (indent = 0 or children of Root)
  const [isExpanded, setIsExpanded] = useState(indent <= 12 || clusterTree.name === "Root");
  const [globalExpandApplied, setGlobalExpandApplied] = useState<'expand' | 'collapse' | null>(null);
  
  const toggleExpand = () => setIsExpanded(!isExpanded);

  // Handle global expand/collapse
  useEffect(() => {
    if (globalExpandState && globalExpandState !== globalExpandApplied) {
      if (globalExpandState === 'expand') {
        setIsExpanded(true);
      } else if (globalExpandState === 'collapse') {
        setIsExpanded(clusterTree.name === "Root"); // Keep root expanded
      }
      setGlobalExpandApplied(globalExpandState);
    }
  }, [globalExpandState, globalExpandApplied, clusterTree.name]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    toggleExpand();
    if (onSelectCluster) {
      onSelectCluster(clusterTree);
    }
  };

  // Don't render the node itself if it's Root, just its children
  if (clusterTree.name === "Root") {
    return (
      <div className="text-left">
        {clusterTree.children?.map((child: ClusterTreeNode, index: number) => (
          <ClusterTree
            key={child.id || index}
            clusterTree={child}
            indent={0}
            onSelectCluster={onSelectCluster}
            globalExpandState={globalExpandState}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="text-left">
      <div
        className="flex items-center hover:bg-accent/50 rounded-lg px-3 py-2 cursor-pointer transition-all duration-200 hover:shadow-sm border border-transparent hover:border-border/50"
        style={{ paddingLeft: `${indent + 12}px` }}
        onClick={handleClick}
      >
        {clusterTree.children && clusterTree.children.length > 0 ? (
          <div className="flex-shrink-0 mr-2">
            {isExpanded ? (
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            )}
          </div>
        ) : (
          <div className="w-5" />
        )}
        <div className="font-medium text-sm text-wrap flex-1 min-w-0">
          <span className="truncate block leading-tight">{clusterTree.name}</span>
          {clusterTree.count > 0 && (
            <span className="text-xs text-muted-foreground font-normal mt-0.5 block">
              {clusterTree.count} conversations
            </span>
          )}
        </div>
      </div>

      {isExpanded &&
        clusterTree.children &&
        clusterTree.children.length > 0 && (
          <div className="pl-4 border-l-2 border-accent/20 ml-4 mt-1 space-y-1">
            {clusterTree.children.map(
              (child: ClusterTreeNode, index: number) => (
                <ClusterTree
                  key={child.id || index}
                  clusterTree={child}
                  indent={indent + 12}
                  onSelectCluster={onSelectCluster}
                  globalExpandState={globalExpandState}
                />
              )
            )}
          </div>
        )}
    </div>
  );
};

// Main component wrapper that includes controls
type ClusterTreeWithControlsProps = {
  clusterTree: ClusterTreeNode;
  onSelectCluster?: (cluster: ClusterTreeNode) => void;
};

export default function ClusterTreeWithControls({ clusterTree, onSelectCluster }: ClusterTreeWithControlsProps) {
  const [globalExpandState, setGlobalExpandState] = useState<'expand' | 'collapse' | null>(null);

  const handleExpandAll = useCallback(() => {
    setGlobalExpandState('expand');
    // Reset after a short delay to allow for future expand operations
    setTimeout(() => setGlobalExpandState(null), 100);
  }, []);

  const handleCollapseAll = useCallback(() => {
    setGlobalExpandState('collapse');
    // Reset after a short delay to allow for future collapse operations
    setTimeout(() => setGlobalExpandState(null), 100);
  }, []);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-shrink-0">
        <TreeControls onExpandAll={handleExpandAll} onCollapseAll={handleCollapseAll} />
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        <ClusterTree
          clusterTree={clusterTree}
          onSelectCluster={onSelectCluster}
          globalExpandState={globalExpandState}
        />
      </div>
    </div>
  );
}

export { ClusterTree };
