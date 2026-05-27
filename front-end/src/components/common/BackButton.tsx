import { ArrowLeft } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../ui/utils";

interface BackButtonProps {
  onClick: () => void;
  label?: string;
  variant?: "outline" | "ghost";
  size?: "sm" | "icon";
  className?: string;
}

export const BackButton = ({
  onClick,
  label = "Back",
  variant = "outline",
  size = "sm",
  className,
}: BackButtonProps) => {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      className={cn(
        "border-[var(--glass-border)] text-foreground hover:bg-[var(--accent-bg)] flex-shrink-0",
        size === "icon" && "bg-[var(--glass-bg)]",
        className
      )}
    >
      <ArrowLeft
        className={cn("w-4 h-4 shrink-0", size === "sm" && label ? "mr-2" : undefined)}
      />
      {size === "sm" && label ? label : null}
    </Button>
  );
};
