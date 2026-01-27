import React, { ReactNode } from "react";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon | ReactNode;
  title: string;
  description: string | ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "accent" | "outline" | "ghost" | "link";
    icon?: LucideIcon | ReactNode;
  };
  className?: string;
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) => {
  // Render icon - Lucide icons are function components, render them directly
  // This matches the pattern used in SpacesPage
  const renderIcon = () => {
    if (!Icon) return null;
    
    // If Icon is a function (Lucide icon component), render it as JSX
    if (typeof Icon === "function") {
      const IconComponent = Icon as React.ComponentType<{ className?: string }>;
      return <IconComponent className="w-12 h-12 text-muted-foreground mx-auto mb-4" />;
    }
    
    // If it's already a React element, use it directly
    if (React.isValidElement(Icon)) {
      return Icon;
    }
    
    // For primitive types, wrap them
    if (typeof Icon === "string" || typeof Icon === "number") {
      return (
        <div className="w-12 h-12 text-muted-foreground mx-auto mb-4 flex items-center justify-center">
          {Icon}
        </div>
      );
    }
    
    return null;
  };

  // Render action icon
  const renderActionIcon = () => {
    if (!action?.icon) return null;
    
    const ActionIcon = action.icon;
    
    // If ActionIcon is a function (Lucide icon component), render it as JSX
    if (typeof ActionIcon === "function") {
      const ActionIconComponent = ActionIcon as React.ComponentType<{ className?: string }>;
      return <ActionIconComponent className="w-4 h-4 mr-2" />;
    }
    
    // If it's already a React element, use it directly
    if (React.isValidElement(ActionIcon)) {
      return ActionIcon;
    }
    
    // For primitive types only
    if (typeof ActionIcon === "string" || typeof ActionIcon === "number") {
      return <span className="mr-2">{String(ActionIcon)}</span>;
    }
    
    return null;
  };

  return (
    <Card className={`p-12 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] text-center ${className}`}>
      {renderIcon()}
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      {typeof description === "string" ? (
        <p className="text-muted-foreground mb-4">{description}</p>
      ) : (
        <div className="text-muted-foreground mb-4">{description}</div>
      )}
      {action && (
        <div>
          <Button
            onClick={action.onClick}
            variant={action.variant || "accent"}
            className="w-auto inline-flex"
          >
            {renderActionIcon()}
            {action.label}
          </Button>
        </div>
      )}
    </Card>
  );
};
