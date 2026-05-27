import { forwardRef } from "react";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/components/ui/utils";

/** Shared grid card shell used on list pages. */
export const LIST_CARD_GRID_SHELL =
  "overflow-hidden backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-300 hover:shadow-lg hover:shadow-[var(--glass-shadow)] group cursor-pointer";

/** Shared list-row card shell: horizontal layout, kebab top-right on content. */
export const LIST_CARD_LIST_SHELL =
  "relative flex flex-row items-stretch overflow-hidden backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-300 hover:shadow-lg hover:shadow-[var(--glass-shadow)] cursor-pointer";

/** Fixed width for list-row left media column (skeletons reference this). */
export const LIST_CARD_LIST_MEDIA_WIDTH_CLASS = "w-56";

/** Fixed-width left media column (aligns with grid card h-48 hero). */
export const LIST_CARD_LIST_MEDIA_CLASS =
  `relative ${LIST_CARD_LIST_MEDIA_WIDTH_CLASS} flex-shrink-0 self-stretch min-h-48 overflow-hidden bg-muted`;

/** Right-hand details column (actions live in-flow in {@link ListCardDetailsHeader}). */
export const LIST_CARD_LIST_CONTENT_CLASS =
  "flex flex-1 min-w-0 min-h-48 flex-col justify-start p-6";

/** @deprecated Use LIST_CARD_LIST_CONTENT_CLASS */
export const LIST_CARD_LIST_BODY_CLASS = LIST_CARD_LIST_CONTENT_CLASS;

/** Standard media hero height for grid cards. */
export const LIST_CARD_HERO_HEIGHT_CLASS = "h-48";

export const CARD_KEBAB_OVERLAY_TRIGGER_CLASS =
  "h-8 w-8 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm border border-white/20";

export const CARD_KEBAB_DEFAULT_TRIGGER_CLASS =
  "h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent";

export type CardKebabTriggerVariant = "overlay" | "default";

export interface CardKebabTriggerProps
  extends Omit<React.ComponentPropsWithoutRef<typeof Button>, "variant" | "size"> {
  variant?: CardKebabTriggerVariant;
  "aria-label"?: string;
}

export const CardKebabTrigger = forwardRef<HTMLButtonElement, CardKebabTriggerProps>(
  function CardKebabTrigger(
    {
      variant = "overlay",
      className,
      "aria-label": ariaLabel = "More actions",
      onClick,
      ...props
    },
    ref
  ) {
    return (
      <Button
        ref={ref}
        type="button"
        variant="ghost"
        size="icon"
        aria-label={ariaLabel}
        className={cn(
          variant === "overlay" ? CARD_KEBAB_OVERLAY_TRIGGER_CLASS : CARD_KEBAB_DEFAULT_TRIGGER_CLASS,
          className
        )}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(e);
        }}
        {...props}
      >
        <MoreVertical className="w-4 h-4" />
      </Button>
    );
  }
);

CardKebabTrigger.displayName = "CardKebabTrigger";
