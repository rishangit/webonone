import { Card } from "@/components/ui/card";
import { TagViewProps } from "../types";
import { TagIconComponent } from "./TagIcon";
import { TagStatus } from "./TagStatus";
import { TagActions } from "./TagActions";

export const TagCardView = ({ tag, onEdit, onDelete, onToggleStatus }: TagViewProps) => {
  return (
    <Card 
      className="backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--glass-shadow)]"
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-1">
            <TagIconComponent tag={tag} variant="grid" />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">{tag.name}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">{tag.description || 'No description'}</p>
            </div>
          </div>
          <TagActions tag={tag} onEdit={onEdit} onDelete={onDelete} onToggleStatus={onToggleStatus} />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <TagStatus isActive={tag.isActive} />
            <span className="text-xs text-muted-foreground">
              Used {tag.usageCount} {tag.usageCount === 1 ? 'time' : 'times'}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};
