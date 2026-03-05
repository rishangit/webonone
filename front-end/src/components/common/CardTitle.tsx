import { LucideIcon } from "lucide-react";
import { cn } from "../ui/utils";

interface CardTitleProps {
  title: string;
  icon?: LucideIcon | React.ComponentType<{ className?: string }>;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  className?: string;
  iconClassName?: string;
}

export const CardTitle = ({ 
  title, 
  icon: Icon, 
  as: Component = "h2",
  className,
  iconClassName
}: CardTitleProps) => {
  return (
    <Component className={cn(
      "text-lg font-semibold text-foreground mb-4 flex items-center gap-2",
      className
    )}>
      {Icon && (
        <Icon className={cn(
          "w-5 h-5 text-[var(--accent-text)] flex-shrink-0",
          iconClassName
        )} />
      )}
      {title}
    </Component>
  );
};
