import { Card } from "@/components/ui/card";
import { TagViewProps } from "../types";
import { TagIconComponent } from "./TagIcon";
import { TagStatus } from "./TagStatus";
import { TagActions } from "./TagActions";
import { TagInfo } from "./TagInfo";

export const TagListView = ({ tag, onEdit, onDelete, onToggleStatus }: TagViewProps) => {
  return (
    <Card 
      className="backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200"
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <TagIconComponent tag={tag} variant="list" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-foreground truncate">{tag.name}</h3>
                <TagStatus isActive={tag.isActive} />
              </div>
              <TagInfo tag={tag} variant="list" />
            </div>
          </div>
          <TagActions tag={tag} onEdit={onEdit} onDelete={onDelete} onToggleStatus={onToggleStatus} />
        </div>
      </div>
    </Card>
  );
};
