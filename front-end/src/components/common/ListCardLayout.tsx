import type { CSSProperties, ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Mail, Phone } from "lucide-react";
import { cn } from "@/components/ui/utils";
import {
  LIST_CARD_LIST_CONTENT_CLASS,
  LIST_CARD_LIST_MEDIA_CLASS,
} from "@/components/common/CardKebabTrigger";

/** Three-column detail rows (list card content area). */
export const LIST_CARD_DETAIL_GRID_CLASS = "grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-3";

/** Low-contrast separator between upper and lower detail blocks. */
export const LIST_CARD_DETAIL_DIVIDER_CLASS = "border-t border-[var(--glass-border)]/40 my-3";

/** Fixed-width media column (left); matches grid card hero height. */
export function ListCardMediaColumn({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn(LIST_CARD_LIST_MEDIA_CLASS, className)}>{children}</div>;
}

/** Details column (right of media). */
export function ListCardContent({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn(LIST_CARD_LIST_CONTENT_CLASS, className)}>{children}</div>;
}

interface ListCardCoverImageProps {
  src: string;
  alt: string;
  className?: string;
}

/** Full-bleed cover image inside {@link ListCardMediaColumn}. */
export function ListCardCoverImage({ src, alt, className }: ListCardCoverImageProps) {
  return (
    <img
      src={src}
      alt={alt}
      className={cn("absolute inset-0 h-full w-full object-cover", className)}
    />
  );
}

interface ListCardBlurredMediaProps {
  backgroundImageUrl: string;
  children?: ReactNode;
  topLeft?: ReactNode;
  overlayClassName?: string;
}

/** Blurred background + centered foreground (avatar/logo), like grid card heroes. */
export function ListCardBlurredMedia({
  backgroundImageUrl,
  children,
  topLeft,
  overlayClassName,
}: ListCardBlurredMediaProps) {
  return (
    <>
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${backgroundImageUrl})`,
          filter: "blur(20px)",
          transform: "scale(1.1)",
        }}
      />
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/40",
          overlayClassName
        )}
      />
      {topLeft ? <div className="absolute top-3 left-3 z-10">{topLeft}</div> : null}
      {children ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center">{children}</div>
      ) : null}
    </>
  );
}

interface ListCardColorHeroProps {
  style?: CSSProperties;
  children: ReactNode;
  topLeft?: ReactNode;
}

/** Colored gradient hero (e.g. tags) inside list media column. */
export function ListCardColorHero({ style, children, topLeft }: ListCardColorHeroProps) {
  return (
    <>
      <div className="absolute inset-0" style={style} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/25" />
      {topLeft ? <div className="absolute top-3 left-3 z-10">{topLeft}</div> : null}
      <div className="absolute inset-0 z-10 flex items-center justify-center">{children}</div>
    </>
  );
}

/** Status badge(s) + kebab grouped for list card header trailing. */
export function ListCardHeaderActions({
  status,
  actions,
  className,
}: {
  status?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  if (!status && !actions) {
    return null;
  }

  return (
    <div className={cn("flex shrink-0 items-center gap-2", className)} onClick={(e) => e.stopPropagation()}>
      {status ? <div className="flex flex-wrap items-center justify-end gap-1">{status}</div> : null}
      {actions}
    </div>
  );
}

/** Title + description block; status, tags, and menu stay in-flow (no card overlay). */
export function ListCardDetailsHeader({
  title,
  description,
  trailing,
  status,
  actions,
  tags,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  /** Extra trailing chip (e.g. variant count) beside status/actions. */
  trailing?: ReactNode;
  status?: ReactNode;
  actions?: ReactNode;
  /** Entity tag chips — rendered under description, above detail grids. */
  tags?: ReactNode;
  className?: string;
}) {
  const topTrailing =
    trailing || status || actions ? (
      <div className="flex shrink-0 items-start gap-2">
        {trailing ? <div className="shrink-0">{trailing}</div> : null}
        <ListCardHeaderActions status={status} actions={actions} />
      </div>
    ) : null;

  return (
    <div className={cn("mb-3 min-w-0", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold text-foreground">{title}</h3>
          {description ? (
            <div className="mt-1 line-clamp-2 text-sm text-muted-foreground">{description}</div>
          ) : null}
        </div>
        {topTrailing}
      </div>
      {tags ? <div className="mt-2 flex flex-wrap items-center gap-1">{tags}</div> : null}
    </div>
  );
}

export function ListCardDetailDivider({ className }: { className?: string }) {
  return <div role="separator" className={cn(LIST_CARD_DETAIL_DIVIDER_CLASS, className)} />;
}

export function ListCardDetailGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={cn(LIST_CARD_DETAIL_GRID_CLASS, className)}>{children}</div>;
}

export function ListCardDetailField({
  icon: Icon,
  label,
  value,
  children,
  className,
}: {
  icon?: LucideIcon;
  label?: string;
  value?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  if (children) {
    return <div className={cn("min-w-0", className)}>{children}</div>;
  }

  return (
    <div className={cn("flex min-w-0 items-center gap-2 text-sm", className)}>
      {Icon ? <Icon className="h-4 w-4 shrink-0 text-[var(--accent-text)]" /> : null}
      {label ? <span className="shrink-0 text-muted-foreground">{label}</span> : null}
      <span className="min-w-0 truncate font-medium text-foreground">{value}</span>
    </div>
  );
}

/** Primary row-1 grid (email / phone / tertiary columns). */
export function ListCardContactGrid({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <ListCardDetailGrid className={className}>{children}</ListCardDetailGrid>;
}

/** Column 1 — email contact field. */
export function ListCardContactEmail({
  email,
  className,
}: {
  email?: string | null;
  className?: string;
}) {
  return (
    <ListCardDetailField
      icon={Mail}
      label="Email"
      value={email?.trim() ? email : "—"}
      className={className}
    />
  );
}

/** Column 2 — phone contact field. */
export function ListCardContactPhone({
  phone,
  className,
}: {
  phone?: string | null;
  className?: string;
}) {
  return (
    <ListCardDetailField
      icon={Phone}
      label="Phone"
      value={phone?.trim() ? phone : "—"}
      className={className}
    />
  );
}

/** @deprecated Prefer `tags` on {@link ListCardDetailsHeader}. */
export function ListCardTagsRow({
  children,
  emptyLabel,
  className,
}: {
  children?: ReactNode;
  emptyLabel?: string;
  className?: string;
}) {
  const hasChildren = children != null && (Array.isArray(children) ? children.length > 0 : true);

  if (!hasChildren && !emptyLabel) {
    return null;
  }

  return (
    <div className={cn("mt-2 flex flex-wrap items-center gap-1", className)}>
      {hasChildren ? children : <span className="text-xs text-muted-foreground">{emptyLabel}</span>}
    </div>
  );
}

/** Primary price on list/grid cards — plain accent text (not a badge). */
export const CARD_PRICE_TEXT_CLASS =
  "text-xl font-semibold leading-tight text-[var(--accent-text)] tabular-nums";

/** Price on dark media overlays (grid card hero). */
export const CARD_PRICE_OVERLAY_TEXT_CLASS = cn(CARD_PRICE_TEXT_CLASS, "drop-shadow-sm");

/** Bottom-right price anchor inside the detail column. */
export function ListCardPriceFooter({
  children,
  label,
  className,
  priceClassName,
}: {
  children?: ReactNode;
  label?: ReactNode;
  className?: string;
  priceClassName?: string;
}) {
  if (children == null && label == null) {
    return null;
  }

  return (
    <div className={cn("mt-auto flex justify-end pt-3", className)}>
      {children ?? (
        <span className={cn(CARD_PRICE_TEXT_CLASS, priceClassName)}>{label}</span>
      )}
    </div>
  );
}
