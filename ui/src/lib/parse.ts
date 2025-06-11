import {
  ConversationsList,
  ConversationListSchema,
  ConversationSummariesList,
  ConversationSummaryListSchema,
  ConversationClustersList,
  ConversationClusterListSchema,
} from "@/types/kura";

export const parseConversationFile = async (
  file: File
): Promise<ConversationsList | null> => {
  try {
    console.log("📄 Parsing conversations.json, file size:", file.size, "bytes");
    const text = await file.text();
    console.log("📄 File content length:", text.length, "characters");
    const conversations = JSON.parse(text);
    console.log("📄 Parsed", conversations.length, "conversations");
    const parsedConversations = ConversationListSchema.safeParse(conversations);
    if (!parsedConversations.success) {
      console.error(
        "❌ Error parsing conversation file",
        parsedConversations.error
      );
      return null;
    }
    console.log("✅ Conversations file parsed successfully");
    return parsedConversations.data;
  } catch (error) {
    console.error("❌ Error parsing conversation file", error);
    return null;
  }
};

export const parseConversationSummaryFile = async (
  file: File
): Promise<ConversationSummariesList | null> => {
  try {
    console.log("📄 Parsing summaries.jsonl, file size:", file.size, "bytes");
    const text = await file.text();
    console.log("📄 File content length:", text.length, "characters");
    const lines = text.split("\n").filter((line) => line.trim() !== "");
    console.log("📄 Found", lines.length, "non-empty lines");
    const summaries = lines.map((line) => JSON.parse(line));
    console.log("📄 Parsed", summaries.length, "summaries");

    const parsedSummaries = ConversationSummaryListSchema.safeParse(summaries);
    if (!parsedSummaries.success) {
      console.error(
        "❌ Error parsing conversation summary file",
        parsedSummaries.error
      );
      return null;
    }
    console.log("✅ Summaries file parsed successfully");
    return parsedSummaries.data;
  } catch (error) {
    console.error("❌ Error parsing conversation summary file", error);
    return null;
  }
};

export const parseConversationClusterFile = async (
  file: File
): Promise<ConversationClustersList | null> => {
  try {
    console.log("📄 Parsing dimensionality.jsonl, file size:", file.size, "bytes");
    const text = await file.text();
    console.log("📄 File content length:", text.length, "characters");
    const lines = text.split("\n").filter((line) => line.trim() !== "");
    console.log("📄 Found", lines.length, "non-empty lines");
    const clusters = lines.map((line) => JSON.parse(line));
    console.log("📄 Parsed", clusters.length, "clusters");

    const parsedClusters = ConversationClusterListSchema.safeParse(clusters);
    if (!parsedClusters.success) {
      console.error(
        "❌ Error parsing conversation cluster file",
        parsedClusters.error
      );
      return null;
    }
    console.log("✅ Clusters file parsed successfully");
    return parsedClusters.data;
  } catch (error) {
    console.error("❌ Error parsing conversation cluster file", error);
    return null;
  }
};
