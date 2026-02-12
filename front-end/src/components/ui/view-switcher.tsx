import { LayoutGrid, List } from "lucide-react";
import { Button } from "./button";

interface ViewSwitcherProps {
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  className?: string;
}

export function ViewSwitcher({ viewMode, onViewModeChange, className }: ViewSwitcherProps) {
  return (
    <div className={`flex items-center backdrop-blur-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg p-1 h-9 ${className || ""}`}>
      <Button
        variant={viewMode === "grid" ? "accent" : "ghost"}
        onClick={() => onViewModeChange("grid")}
        className="h-7 px-3"
      >
        <LayoutGrid className="w-4 h-4" />
      </Button>
      <Button
        variant={viewMode === "list" ? "accent" : "ghost"}
        onClick={() => onViewModeChange("list")}
        className="h-7 px-3"
      >
        <List className="w-4 h-4" />
      </Button>
    </div>
  );
}