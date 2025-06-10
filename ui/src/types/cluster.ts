import { z } from "zod";
import { ConversationSchema, ConversationClusterSchema } from "./kura";

export const ConversationInfoSchema = ConversationSchema.extend({
  summary: z.string(),
});

export type ClusterTreeNode = z.infer<typeof ConversationClusterSchema> & {
  children: ClusterTreeNode[];
  depth?: number;
};

export const ClusterTreeNodeSchema: z.ZodType<ClusterTreeNode> = ConversationClusterSchema.extend({
  children: z.lazy(() => z.array(ClusterTreeNodeSchema)),
  depth: z.number().optional(),
});

export const ConversationInfoListSchema = z.array(ConversationInfoSchema);
export type ConversationInfoList = z.infer<typeof ConversationInfoListSchema>;
export type ConversationInfo = z.infer<typeof ConversationInfoSchema>;
