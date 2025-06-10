import {
  ConversationClustersList,
  ConversationsList,
  ConversationSummariesList,
} from "@/types/kura";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import {
  parseConversationClusterFile,
  parseConversationFile,
  parseConversationSummaryFile,
} from "@/lib/parse";
import { Button } from "./ui/button";

type UploadFormProps = {
  setConversations: (conversations: ConversationsList) => void;
  conversations: ConversationsList | null;
  setSummaries: (summaries: ConversationSummariesList) => void;
  summaries: ConversationSummariesList | null;
  setClusters: (clusters: ConversationClustersList) => void;
  clusters: ConversationClustersList | null;
  handleVisualiseClusters: () => void;
};

const UploadForm = ({
  setConversations,
  conversations,
  setSummaries,
  summaries,
  setClusters,
  clusters,
  handleVisualiseClusters,
}: UploadFormProps) => {
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!files) return;

    for (const file of files) {
      if (file.name === "conversations.json") {
        console.log("Parsing conversation file");
        const conversations = await parseConversationFile(file);
        if (conversations) {
          setConversations(conversations);
        }
      }

      if (file.name === "summaries.jsonl") {
        console.log("Parsing conversation summary file");
        const summaries = await parseConversationSummaryFile(file);
        if (summaries) {
          setSummaries(summaries);
        }
      }

      if (file.name === "dimensionality.jsonl") {
        console.log("Parsing conversation cluster file");
        const clusters = await parseConversationClusterFile(file);
        if (clusters) {
          setClusters(clusters);
        }
      }
    }
  };

  return (
    <Card className="w-full shadow-lg border-0 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm">
      <CardHeader className="text-center space-y-2 pb-6">
        <CardTitle className="text-xl font-semibold">Load Checkpoint</CardTitle>
        <CardDescription className="text-base">
          Select the checkpoint directory created by Kura
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        <div className="space-y-2">
          <Input
            type="file"
            multiple
            // @ts-expect-error - nonstandard attribute used for directory upload
            webkitdirectory=""
            className="cursor-pointer h-12 text-center border-dashed border-2 hover:border-primary/50 transition-colors"
            accept=""
            onChange={handleFileChange}
          />
          <p className="text-xs text-muted-foreground text-center y-2">
            Choose Files • No file chosen
          </p>
        </div>

        {conversations && summaries && clusters && (
          <div className="space-y-4 p-4 bg-muted/50 rounded-lg border">
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                Data Successfully Loaded
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {conversations.length} conversations • {summaries?.length}{" "}
                summaries • {clusters?.length} clusters
              </p>
            </div>
            <Button
              className="w-full h-11 font-medium"
              onClick={handleVisualiseClusters}
            >
              Visualise Clusters
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UploadForm;
