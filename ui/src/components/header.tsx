"use client";

import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Network, Sparkles, RotateCcw, Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "./theme-provider";

interface HeaderProps {
  onReset?: () => void;
}

export default function Header({ onReset }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const getThemeIcon = () => {
    if (theme === "light") return <Sun className="h-4 w-4" />;
    if (theme === "dark") return <Moon className="h-4 w-4" />;
    return <Monitor className="h-4 w-4" />;
  };

  const getThemeLabel = () => {
    if (theme === "light") return "Light";
    if (theme === "dark") return "Dark";
    return "System";
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 sm:px-6 lg:px-8">
        {/* Left side - Logo and title */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-chart-1 shadow-lg ring-1 ring-primary/20">
            <Network className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text">
              Kura
            </h1>
            <p className="text-xs text-muted-foreground leading-none">
              Conversation Cluster Analysis
            </p>
          </div>
        </div>

        {/* Right side - Status and Actions */}
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {/* Status badge - Hide on very small screens */}
          <Badge
            variant="secondary"
            className="hidden xs:flex gap-1.5 px-2 sm:px-3 py-1 bg-accent/50 hover:bg-accent/70 transition-colors"
          >
            <Sparkles className="h-3 w-3 text-chart-1" />
            <span className="text-xs font-medium">Interactive Mode</span>
          </Badge>

          {/* Reset button */}
          {onReset && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              className="gap-2 text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200"
            >
              <RotateCcw className="h-4 w-4" />
              <span className="hidden sm:inline">New Analysis</span>
              <span className="sm:hidden">Reset</span>
            </Button>
          )}

          {/* Theme toggle button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="text-muted-foreground hover:text-foreground hover:bg-accent/50 transition-all duration-200 h-8 w-8"
            title={`Current theme: ${getThemeLabel()}. Click to cycle themes.`}
          >
            {getThemeIcon()}
          </Button>
        </div>
      </div>
    </header>
  );
}
