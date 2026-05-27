"use client";

import * as React from "react";
import * as AvatarPrimitive from "@radix-ui/react-avatar";

import { cn } from "./utils";

/** Accent ring on all avatars — override only for documented exceptions (e.g. ring-offset). */
export const AVATAR_ACCENT_RING_CLASS = "ring-2 ring-[var(--accent-border)]";

function Avatar({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-14 shrink-0 overflow-hidden rounded-full",
        AVATAR_ACCENT_RING_CLASS,
        className,
      )}
      {...props}
    />
  );
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full object-cover", className)}
      {...props}
    />
  );
}

function AvatarFallback({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className,
      )}
      {...props}
    />
  );
}

/** Default avatar when no size class is passed — 56×56px. */
export const DEFAULT_AVATAR_CLASS = "w-14 h-14";

/** Compact avatar for selectors, menus, notifications, calendar — 32×32px. */
export const COMPACT_AVATAR_CLASS = "w-8 h-8";
export const COMPACT_AVATAR_FALLBACK_CLASS = "text-xs font-medium";

/** Leading entity image on card (grid hero) and list rows — 96×96px. */
export const CARD_LIST_AVATAR_CLASS = "w-24 h-24";
export const CARD_LIST_AVATAR_FALLBACK_CLASS = "text-2xl font-semibold";

export { Avatar, AvatarImage, AvatarFallback };
