import { Tag as TagLucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LIST_CARD_LIST_SHELL } from "@/components/common/CardKebabTrigger";
import {
  ListCardColorHero,
  ListCardContent,
  ListCardDetailsHeader,
  ListCardMediaColumn,
} from "@/components/common/ListCardLayout";
import { TagViewProps } from "@/features/tags/types";
import { TagStatus } from "./TagStatus";
import { TagActions } from "./TagActions";
import { TagInfo } from "./TagInfo";

export const TagListView = ({ tag, onEdit, onDelete, onToggleStatus }: TagViewProps) => {
  return (
    <Card className={LIST_CARD_LIST_SHELL}>
      <ListCardMediaColumn>
        <ListCardColorHero
          style={{
            background: `linear-gradient(135deg, ${tag.color}40 0%, ${tag.color}15 50%, transparent 100%)`,
          }}
        >
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
        </ListCardColorHero>
      </ListCardMediaColumn>

      <ListCardContent>
        <ListCardDetailsHeader
          title={tag.name}
          description={tag.description}
          status={<TagStatus isActive={tag.isActive} />}
          actions={
            <TagActions
              tag={tag}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleStatus={onToggleStatus}
              triggerVariant="default"
            />
          }
        />
        <TagInfo tag={tag} variant="list" />
      </ListCardContent>
    </Card>
  );
};
