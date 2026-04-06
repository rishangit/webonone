import React, { ReactNode, useMemo } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "./utils";
import { Icon } from "../common/Icon";

type CustomDialogSize = "small" | "medium" | "large" | "xlarge" | "auto";

// Dialog width presets (percent of overlay) or intrinsic width for `auto` (handled in width memo).
const sizeWidthClasses: Record<CustomDialogSize, string> = {
  small: "w-1/2",
  medium: "w-2/3",
  large: "w-3/4",
  xlarge: "w-5/6",
  auto: "",
};

// Dialog height presets (percent of overlay) or intrinsic height for `auto`.
const sizeHeightClasses: Record<CustomDialogSize, string> = {
  small: "h-1/3",
  medium: "h-1/2",
  large: "h-3/4",
  xlarge: "h-9/10",
  /** Grows with content; overall shell still capped by max-h below. */
  auto: "h-auto",
};

interface CustomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  icon?: ReactNode;
  customHeader?: ReactNode; // For completely custom header layout
  children: ReactNode;
  footer?: ReactNode;
  /**
   * Dialog width preset. Use `"auto"` to size to content (capped by viewport and `maxWidth`).
   * Percent widths (`small`–`xlarge`) fill that fraction of the overlay.
   */
  sizeWidth?: CustomDialogSize;
  /**
   * Dialog height preset. Use `"auto"` for height from content (e.g. short confirmations).
   * If omitted and `sizeWidth` is `"auto"`, height defaults to `"auto"`.
   */
  sizeHeight?: CustomDialogSize;
  /**
   * When `sizeWidth` is `"auto"`: Tailwind max-width class for the content-sized panel (default `max-w-lg`).
   * When `sizeWidth` is a percent preset (legacy): if set and not the default `max-w-lg`, applies as `sm:{maxWidth}` instead of the percent width class.
   */
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
  sizeWidth = "medium",
  sizeHeight,
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

  /** When width is auto and height omitted, default height to auto (compact dialogs). */
  const effectiveSizeHeight: CustomDialogSize =
    sizeHeight !== undefined ? sizeHeight : sizeWidth === "auto" ? "auto" : sizeWidth;

  const isAutoHeight = effectiveSizeHeight === "auto";

  const effectiveWidthClass = useMemo(() => {
    if (sizeWidth === "auto") {
      return cn("w-fit", maxWidth);
    }
    if (maxWidth && maxWidth !== "max-w-lg") {
      return `sm:${maxWidth}`;
    }
    return sizeWidthClasses[sizeWidth];
  }, [sizeWidth, maxWidth]);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
        <div className="fixed inset-0 z-50 w-full h-full px-2 py-2 sm:px-4 sm:py-4 pointer-events-none flex justify-center items-center">
          <DialogPrimitive.Content
            className={cn(
              "bg-background dark:bg-[var(--glass-bg)] border-[var(--glass-border)] backdrop-blur-sm rounded-lg shadow-lg",
              "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 border duration-200",
              "flex flex-col pointer-events-auto max-h-[calc(100vh-1rem)]",
              effectiveWidthClass,
              sizeHeightClasses[effectiveSizeHeight],
              className
            )}
            style={{ maxHeight: "calc(100vh - 1rem)" }}
            aria-describedby={description ? describedBy : undefined}
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
                    {description && (
                      <DialogPrimitive.Description
                        id={describedBy}
                        className="text-muted-foreground text-sm mt-1"
                      >
                        {description}
                      </DialogPrimitive.Description>
                    )}
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
            disableContentScroll
              ? "overflow-hidden"
              : isAutoHeight
                ? "min-h-0 shrink overflow-y-auto max-h-[calc(100vh-10rem)]"
                : "flex-1 min-h-0 overflow-y-auto",
            !disableContentScroll && "custom-scrollbar",
            noContentPadding ? "" : ((title || description || icon || customHeader) ? "p-6" : "p-6 pt-6")
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