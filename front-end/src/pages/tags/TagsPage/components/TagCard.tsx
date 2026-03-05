import { TagCardProps } from "../types";
import { TagCardView } from "./TagCardView";
import { TagListView } from "./TagListView";

export const TagCard = ({ tag, viewMode, onEdit, onDelete, onToggleStatus }: TagCardProps) => {
  if (viewMode === "grid") {
    return <TagCardView tag={tag} onEdit={onEdit} onDelete={onDelete} onToggleStatus={onToggleStatus} />;
  }
  
  return <TagListView tag={tag} onEdit={onEdit} onDelete={onDelete} onToggleStatus={onToggleStatus} />;
};
