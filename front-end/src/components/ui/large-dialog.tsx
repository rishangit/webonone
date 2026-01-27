"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";

import { cn } from "./utils";

function LargeDialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="large-dialog" {...props} />;
}

const LargeDialogTrigger = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Trigger>,
  React.ComponentProps<typeof DialogPrimitive.Trigger>
>(({ ...props }, ref) => (
  <DialogPrimitive.Trigger ref={ref} data-slot="large-dialog-trigger" {...props} />
));
LargeDialogTrigger.displayName = DialogPrimitive.Trigger.displayName;

function LargeDialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="large-dialog-portal" {...props} />;
}

const LargeDialogClose = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Close>,
  React.ComponentProps<typeof DialogPrimitive.Close>
>(({ ...props }, ref) => (
  <DialogPrimitive.Close ref={ref} data-slot="large-dialog-close" {...props} />
));
LargeDialogClose.displayName = DialogPrimitive.Close.displayName;

const LargeDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentProps<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    data-slot="large-dialog-overlay"
    className={cn(
      "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/80 backdrop-blur-md",
      className,
    )}
    {...props}
  />
));
LargeDialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const LargeDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentProps<typeof DialogPrimitive.Content> & {
    hideCloseButton?: boolean;
  }
>(({ className, children, hideCloseButton, ...props }, ref) => {
  // Generate a unique ID for the dialog if aria-describedby is not provided
  const dialogId = React.useId();
  const { "aria-describedby": ariaDescribedBy, ...restProps } = props;
  const describedBy = (ariaDescribedBy && ariaDescribedBy !== undefined && ariaDescribedBy !== "undefined")
    ? ariaDescribedBy 
    : `large-dialog-description-${dialogId || Math.random().toString(36).substring(2)}`;
  
  return (
    <LargeDialogPortal data-slot="large-dialog-portal">
      <LargeDialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        data-slot="large-dialog-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[2vh] left-[2vw] z-50 grid w-[96vw] h-[96vh] max-w-[96vw] max-h-[96vh] gap-4 rounded-xl border shadow-2xl duration-300",
          className,
        )}
        {...restProps}
        aria-describedby={describedBy}
      >
        {children}
        {!hideCloseButton && (
          <DialogPrimitive.Close className="absolute top-4 right-4 text-muted-foreground hover:text-foreground hover:bg-accent/50 inline-flex items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-8 w-8 flex-shrink-0 z-10">
            <X className="w-4 h-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
        
        {/* Always add a fallback description for accessibility */}
        <DialogPrimitive.Description id={describedBy} className="sr-only">
          Large dialog content
        </DialogPrimitive.Description>
      </DialogPrimitive.Content>
    </LargeDialogPortal>
  );
});
LargeDialogContent.displayName = DialogPrimitive.Content.displayName;

const LargeDialogHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="large-dialog-header"
    className={cn("flex flex-col gap-2 text-left", className)}
    {...props}
  />
));
LargeDialogHeader.displayName = "LargeDialogHeader";

const LargeDialogFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    data-slot="large-dialog-footer"
    className={cn(
      "flex flex-row justify-end gap-2",
      className,
    )}
    {...props}
  />
));
LargeDialogFooter.displayName = "LargeDialogFooter";

const LargeDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentProps<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    data-slot="large-dialog-title"
    className={cn("text-xl leading-none font-semibold", className)}
    {...props}
  />
));
LargeDialogTitle.displayName = DialogPrimitive.Title.displayName;

const LargeDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentProps<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    data-slot="large-dialog-description"
    className={cn("text-muted-foreground text-base", className)}
    {...props}
  />
));
LargeDialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  LargeDialog,
  LargeDialogClose,
  LargeDialogContent,
  LargeDialogDescription,
  LargeDialogFooter,
  LargeDialogHeader,
  LargeDialogOverlay,
  LargeDialogPortal,
  LargeDialogTitle,
  LargeDialogTrigger,
};