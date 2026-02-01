import React, { ReactNode, useMemo } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "./utils";
import { Icon } from "../common/Icon";

interface CustomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  icon?: ReactNode;
  customHeader?: ReactNode; // For completely custom header layout
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
  className?: string;
  disableContentScroll?: boolean;
  hideCloseButton?: boolean;
  noContentPadding?: boolean; // Disable default content padding
  hideHeader?: boolean; // Hide the header completely
}

export function CustomDialog({
  open,
  onOpenChange,
  title,
  description,
  icon,
  customHeader,
  children,
  footer,
  maxWidth = "max-w-lg",
  className,
  disableContentScroll = false,
  hideCloseButton = false,
  noContentPadding = false,
  hideHeader = false
}: CustomDialogProps) {
  // Generate a unique ID for the dialog description
  const dialogId = React.useId();
  const describedBy = useMemo(() => {
    const id = dialogId || Math.random().toString(36).substring(2, 11);
    return `dialog-description-${id}`;
  }, [dialogId]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <div className="fixed inset-0 z-50 w-full h-full px-2 py-2 sm:px-0 sm:py-0 pointer-events-none flex justify-center items-center">
          <DialogPrimitive.Content
            className={cn(
              "bg-[var(--glass-bg)] border-[var(--glass-border)] backdrop-blur-sm rounded-lg shadow-lg",
              "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 border duration-200",
              "h-[calc(100vh-1rem)] max-h-[calc(100vh-1rem)] flex flex-col pointer-events-auto",
              // Use w-full on mobile, but respect maxWidth on desktop
              "w-full sm:w-auto",
              maxWidth.includes('w-[') || maxWidth.includes('max-w-') 
                ? `sm:${maxWidth}` 
                : `sm:${maxWidth}`,
              className
            )}
            style={{ height: 'calc(100vh - 1rem)', maxHeight: 'calc(100vh - 1rem)' }}
            aria-describedby={describedBy}
          >
          {/* Header */}
          {!hideHeader && (title || description || icon || customHeader) && (
            <div className="p-6 pb-4 pr-12 sm:pr-16 border-b border-[var(--glass-border)] relative">
              {customHeader ? (
                customHeader
              ) : (
                <div className="flex items-center gap-3">
                  {icon && <div className="text-[var(--accent-text)] flex-shrink-0">{icon}</div>}
                  <div className="min-w-0 flex-1">
                    {title && (
                      <DialogPrimitive.Title className="text-foreground text-lg font-semibold leading-none">
                        {title}
                      </DialogPrimitive.Title>
                    )}
                    <DialogPrimitive.Description 
                      id={describedBy} 
                      className={description ? "text-muted-foreground text-sm mt-1" : "sr-only"}
                    >
                      {description || "Dialog content"}
                    </DialogPrimitive.Description>
                  </div>
                </div>
              )}
              {!hideCloseButton && (
                <DialogPrimitive.Close className="absolute top-4 right-4 text-muted-foreground hover:text-foreground hover:bg-accent/50 inline-flex items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-8 w-8 flex-shrink-0">
                  <Icon icon={X} size="sm" color="muted" />
                  <span className="sr-only">Close</span>
                </DialogPrimitive.Close>
              )}
            </div>
          )}

          {/* Content */}
          <div className={cn(
            "flex-1 min-h-0",
            noContentPadding ? "" : ((title || description || icon || customHeader) ? "p-6" : "p-6 pt-6"),
            disableContentScroll ? "overflow-hidden" : "overflow-y-auto custom-scrollbar"
          )}>
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="px-6 py-3 border-t border-[var(--glass-border)]">
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                {footer}
              </div>
            </div>
          )}
          </DialogPrimitive.Content>
        </div>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}