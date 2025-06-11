import { ClusterTreeNode, ClusterTreeNodeSchema } from "@/types/cluster";
import { ConversationClustersList } from "@/types/kura";

export const flattenClusterTree = (
  node: ClusterTreeNode,
  acc: ClusterTreeNode[]
) => {
  acc.push(node);
  node.children.forEach((child: ClusterTreeNode) =>
    flattenClusterTree(child, acc)
  );
  return acc;
};

export const buildClusterTree = (
  clusters: ConversationClustersList,
  parent_id: string | null,
  depth: number
): ClusterTreeNode => {
  if (depth === 0) {
    console.log("🌳 Building cluster tree with", clusters.length, "clusters");
  }
  
  const children = clusters.filter((c) => c.parent_id === parent_id);
  console.log(`🌳 At depth ${depth}, parent_id=${parent_id}, found ${children.length} children`);

  const parent = clusters.find((c) => c.id === parent_id) ?? {
    name: "Root",
    id: "root",
    description: "Root",
    chat_ids: [],
    x_coord: 0,
    y_coord: 0,
    count: 0,
    level: depth,
    parent_id: null,
  };

  const data = ClusterTreeNodeSchema.safeParse({
    ...parent,
    children: children.map((c) => buildClusterTree(clusters, c.id, depth + 1)),
  });

  if (!data.success) {
    console.error("❌ Failed to parse cluster tree node:", data.error);
    throw new Error("Failed to build cluster tree");
  }

  return {
    ...data.data,
    level: depth,
  };
};
