import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Network, Sparkles } from "lucide-react";

interface HeaderProps {
  onReset?: () => void;
}

export default function Header({ onReset }: HeaderProps) {
  return (
    <div className="flex-shrink-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-6">
        {/* Left side - Logo and title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-chart-1 shadow-lg">
            <Network className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">Kura</h1>
            <p className="text-xs text-muted-foreground">
              Conversation Cluster Analysis
            </p>
          </div>
        </div>

        {/* Center - Status badges */}
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="gap-1">
            <Sparkles className="h-3 w-3" />
            Interactive Mode
          </Badge>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          {onReset && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onReset}
              className="text-muted-foreground hover:text-foreground"
            >
              New Analysis
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}