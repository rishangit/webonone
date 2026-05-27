import type { ReactNode } from "react";
import { cn } from "@/components/ui/utils";

interface CardGridKebabSlotProps {
  children?: ReactNode;
  /** Status badge(s) shown to the left of the kebab in list/card top-right. */
  status?: ReactNode;
  className?: string;
}

/** Top-right actions: optional status tag(s) then kebab menu (list rows). */
export function CardGridKebabSlot({ children, status, className }: CardGridKebabSlotProps) {
  if (!children && !status) {
    return null;
  }

  return (
    <div className={cn("absolute top-3 right-3 z-10 flex items-center gap-2", className)}>
      {status ? (
        <div className="flex max-w-[min(12rem,calc(100vw-8rem))] flex-wrap items-center justify-end gap-1">
          {status}
        </div>
      ) : null}
      {children}
    </div>
  );
}
