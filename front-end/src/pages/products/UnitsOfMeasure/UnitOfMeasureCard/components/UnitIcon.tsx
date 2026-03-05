import { Ruler } from "lucide-react";
import { cn } from "../../../../../components/ui/utils";
import { UnitIconProps } from "../types";

export const UnitIcon = ({ className }: UnitIconProps) => {
  return (
    <div className={cn(
      "flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-[var(--accent-primary)]/20 to-[var(--accent-primary)]/10 flex items-center justify-center border border-[var(--accent-border)]/30 group-hover:from-[var(--accent-primary)]/30 group-hover:to-[var(--accent-primary)]/20 transition-colors",
      className
    )}>
      <Ruler className="w-5 h-5 text-[var(--accent-primary)]" />
    </div>
  );
};
