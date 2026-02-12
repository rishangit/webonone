"use client";

import * as React from "react";
import { X } from "lucide-react";
import { useIsMobile } from "../ui/use-mobile";
import { cn } from "../ui/utils";

interface RightPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export const RightPanel = ({
  open,
  onOpenChange,
  title,
  children,
  className,
  contentClassName,
}: RightPanelProps) => {
  const isMobile = useIsMobile();

  // Debug: Log when component renders
  React.useEffect(() => {
    console.log('[RightPanel] Component rendered, open state:', open);
  }, [open]);

  // Handle close function - direct call to ensure it works
  const handleClose = React.useCallback((e?: React.MouseEvent) => {
    console.log('[RightPanel] handleClose called', { e, open });
    if (e) {
      e.preventDefault();
      e.stopPropagation();
      console.log('[RightPanel] Event prevented and stopped');
    }
    console.log('[RightPanel] Calling onOpenChange(false)');
    onOpenChange(false);
    console.log('[RightPanel] onOpenChange(false) called');
  }, [onOpenChange, open]);

  // Handle escape key to close (must be called before conditional returns)
  React.useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onOpenChange(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onOpenChange]);

  // Don't render panel at all when closed to ensure it's truly hidden
  if (!open) {
    return null;
  }

  return (
    <>
      {/* Mobile overlay - similar to left sidebar */}
      {isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={handleClose}
        />
      )}

      {/* Right Panel - works same way on mobile and desktop, like left sidebar */}
      <div
        className={cn(
          "fixed top-16 right-0 bottom-0 z-50 w-80 sm:w-96 bg-background border-l border-border shadow-lg overflow-y-auto transform transition-transform duration-300 ease-in-out translate-x-0",
          contentClassName
        )}
        onClick={(e) => {
          console.log('[RightPanel] Panel div clicked', { event: e, target: e.target });
          e.stopPropagation();
        }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b border-border p-4 flex items-center justify-between">
          {title && (
            <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          )}
          <button
            onClick={(e) => {
              console.log('[RightPanel] Close button clicked', { 
                event: e, 
                currentTarget: e.currentTarget,
                open 
              });
              handleClose(e);
            }}
            onMouseDown={(e) => {
              console.log('[RightPanel] Close button mouseDown', { event: e });
            }}
            className="h-8 w-8 cursor-pointer rounded-md hover:bg-accent hover:text-accent-foreground flex items-center justify-center transition-colors"
            type="button"
            aria-label="Close panel"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
        </div>

        {/* Content */}
        <div className={cn("p-4", className)}>{children}</div>
      </div>
    </>
  );
};
