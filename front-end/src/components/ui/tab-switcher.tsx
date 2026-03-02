import { Button } from "./button";
import { cn } from "./utils";

interface TabOption {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface TabSwitcherProps {
  tabs: TabOption[];
  activeTab: string;
  onTabChange: (value: string) => void;
  className?: string;
}

export function TabSwitcher({ tabs, activeTab, onTabChange, className }: TabSwitcherProps) {
  return (
    <div className={cn(
      "flex items-center gap-1 backdrop-blur-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg p-1 h-9 w-fit",
      className
    )}>
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.value;
        
        return (
          <Button
            key={tab.value}
            variant={isActive ? "accent" : "ghost"}
            size="sm"
            onClick={() => onTabChange(tab.value)}
            className={cn(
              "h-7 px-3",
              isActive 
                ? "bg-gradient-to-r from-[var(--accent-secondary)] to-[var(--accent-primary)] text-[var(--accent-button-text)] hover:from-[var(--accent-primary-hover)] hover:to-[var(--accent-primary)] shadow-lg shadow-[var(--accent-secondary)]/25 transition-all duration-200" 
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {Icon && <Icon className="w-4 h-4 mr-1" />}
            {tab.label}
          </Button>
        );
      })}
    </div>
  );
}
