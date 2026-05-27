import React, { ReactNode } from "react";
import type { VariantProps } from "class-variance-authority";
import { Card } from "../ui/card";
import { Button, buttonVariants } from "../ui/button";
import { LucideIcon } from "lucide-react";
import { Icon } from "./Icon";

interface EmptyStateProps {
  icon: LucideIcon | ReactNode;
  title: string;
  description: string | ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    variant?: VariantProps<typeof buttonVariants>["variant"];
    icon?: LucideIcon | ReactNode;
  };
  className?: string;
}

export const EmptyState = ({
  icon: displayIcon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) => {
  // Render icon - Lucide icons are function components, render them directly
  // This matches the pattern used in SpacesPage
  const renderIcon = () => {
    if (!displayIcon) return null;
    
    // If displayIcon is a function (Lucide icon component), render it using Icon component
    if (typeof displayIcon === "function") {
      const IconComponent = displayIcon as LucideIcon;
      return <Icon icon={IconComponent} size="xl" color="muted" className="mx-auto mb-4" />;
    }
    
    // If it's already a React element, use it directly
    if (React.isValidElement(displayIcon)) {
      return displayIcon;
    }
    
    // For primitive types, wrap them
    if (typeof displayIcon === "string" || typeof displayIcon === "number") {
      return (
        <div className="w-12 h-12 text-muted-foreground mx-auto mb-4 flex items-center justify-center">
          {displayIcon}
        </div>
      );
    }
    
    return null;
  };

  // Render action icon
  const renderActionIcon = () => {
    if (!action?.icon) return null;
    
    const ActionIcon = action.icon;
    
    // If ActionIcon is a function (Lucide icon component), render it using Icon component
    if (typeof ActionIcon === "function") {
      const ActionIconComponent = ActionIcon as LucideIcon;
      return <Icon icon={ActionIconComponent} size="sm" className="mr-2" />;
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
