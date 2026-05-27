"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/components/ui/utils";
import { formatAvatarUrl } from "@/shared/utils";
import { showcaseAvatarImageUrl, showcaseUser } from "../../fixtures";

const INITIALS = `${showcaseUser.firstName?.[0] ?? ""}${showcaseUser.lastName?.[0] ?? ""}`;
const IMAGE_SRC = formatAvatarUrl(showcaseAvatarImageUrl, showcaseUser.firstName, showcaseUser.lastName);

/** Sizes used across the app (className on `Avatar` root). */
const AVATAR_SIZES = [
  { label: "32px", className: "w-8 h-8", usage: "Compact rows · header, selectors, notifications, calendar", fallbackClass: "text-xs" },
  { label: "56px", className: "w-14 h-14", usage: "Default · dialogs, wizard, detail headers", fallbackClass: "text-base" },
  { label: "96px", className: "w-24 h-24", usage: "Card & list views (standard)", fallbackClass: "text-2xl font-semibold" },
  { label: "128px", className: "w-32 h-32", usage: "Profile page header", fallbackClass: "text-3xl font-semibold" },
] as const;

const accentFallbackClasses = "bg-[var(--accent-bg)] text-[var(--accent-text)]";

interface ShowcaseAvatarProps {
  sizeClass: string;
  fallbackClass: string;
  withImage?: boolean;
}

function ShowcaseAvatar({
  sizeClass,
  fallbackClass,
  withImage = false,
}: ShowcaseAvatarProps) {
  return (
    <Avatar className={sizeClass}>
      {withImage ? (
        <AvatarImage src={IMAGE_SRC} alt={`${showcaseUser.firstName} ${showcaseUser.lastName}`} />
      ) : null}
      <AvatarFallback className={cn(accentFallbackClasses, fallbackClass)}>
        {INITIALS}
      </AvatarFallback>
    </Avatar>
  );
}

export function AvatarSection() {
  return (
    <section id="showcase-controls-avatar" className="space-y-6 scroll-mt-24">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Avatar</h2>
        <p className="text-sm text-muted-foreground mt-1">
          <code className="text-xs">@/components/ui/avatar</code> — round avatars with{" "}
          <code className="text-xs">ring-2 ring-[var(--accent-border)]</code>,{" "}
          <code className="text-xs">formatAvatarUrl</code>, and accent initials fallback (card / list use 96px).
        </p>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Initials fallback · all sizes</h3>
        <div className="flex flex-wrap items-end gap-6 p-4 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)]">
          {AVATAR_SIZES.map((size) => (
            <div key={size.label} className="flex flex-col items-center gap-2 min-w-[4.5rem]">
              <ShowcaseAvatar sizeClass={size.className} fallbackClass={size.fallbackClass} />
              <span className="text-xs font-medium text-foreground">{size.label}</span>
              <span className="text-[10px] text-muted-foreground text-center leading-tight max-w-[5.5rem]">
                {size.usage}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">With image</h3>
        <div className="flex flex-wrap items-center gap-6 p-4 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)]">
          {(["w-8 h-8", "w-14 h-14", "w-24 h-24"] as const).map((sizeClass) => (
            <ShowcaseAvatar
              key={sizeClass}
              sizeClass={sizeClass}
              fallbackClass={
                sizeClass === "w-8 h-8" ? "text-xs" : sizeClass === "w-14 h-14" ? "text-base" : "text-2xl font-semibold"
              }
              withImage
            />
          ))}
        </div>
      </div>
    </section>
  );
}
