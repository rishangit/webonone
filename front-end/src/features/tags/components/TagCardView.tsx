import { Tag as TagLucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CardGridKebabSlot } from "@/components/common/CardGridKebabSlot";
import { LIST_CARD_GRID_SHELL, LIST_CARD_HERO_HEIGHT_CLASS } from "@/components/common/CardKebabTrigger";
import { TagViewProps } from "@/features/tags/types";
import { TagStatus } from "./TagStatus";
import { TagActions } from "./TagActions";

export const TagCardView = ({ tag, onEdit, onDelete, onToggleStatus }: TagViewProps) => {
  return (
    <Card className={LIST_CARD_GRID_SHELL}>
      <div className={`relative ${LIST_CARD_HERO_HEIGHT_CLASS} overflow-hidden`}>
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${tag.color}40 0%, ${tag.color}15 50%, transparent 100%)`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/25" />

        <div className="absolute inset-0 flex items-center justify-center">
          <div
            className="w-24 h-24 rounded-2xl flex items-center justify-center ring-2 ring-[var(--accent-border)] backdrop-blur-sm"
            style={{ backgroundColor: `${tag.color}30`, color: tag.color }}
          >
            {tag.icon ? (
              <span className="text-4xl" aria-hidden>
                {tag.icon}
              </span>
            ) : (
              <TagLucideIcon className="w-10 h-10" />
            )}
          </div>
        </div>

        <div className="absolute top-3 left-3">
          <TagStatus isActive={tag.isActive} />
        </div>

        <CardGridKebabSlot>
          <TagActions
            tag={tag}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleStatus={onToggleStatus}
            triggerVariant="overlay"
          />
        </CardGridKebabSlot>
      </div>

      <div className="p-6 space-y-3">
        <div>
          <h3 className="font-semibold text-foreground truncate">{tag.name}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {tag.description || "No description"}
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          Used {tag.usageCount} {tag.usageCount === 1 ? "time" : "times"}
        </p>
      </div>
    </Card>
  );
};
