import { Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProductTagsProps } from "../types";
import { Tag as TagType } from "@/services/products";

export const ProductTags = ({ tags, variant = "grid" }: ProductTagsProps) => {
  if (!tags || tags.length === 0) {
    return (
      <div className={`flex items-center gap-2 text-xs text-muted-foreground ${variant === "list" ? "" : "mb-4"}`}>
        <Tag className="w-3 h-3" />
        <span>{variant === "list" ? "No tags" : "No tags assigned"}</span>
      </div>
    );
  }

  const maxTags = variant === "list" ? 4 : 3;
  const remainingCount = tags.length > maxTags ? tags.length - maxTags : 0;

  return (
    <div className={`flex flex-wrap gap-1 ${variant === "list" ? "" : "mb-4"}`}>
      {tags.slice(0, maxTags).map((tag, index) => {
        const tagObj = typeof tag === 'string' 
          ? { id: index, name: tag, color: '#3B82F6', icon: undefined }
          : tag as TagType;
        return (
          <Badge
            key={tagObj.id || index}
            variant="secondary"
            className="text-xs"
            style={{ 
              backgroundColor: `${tagObj.color}20`, 
              color: tagObj.color,
              borderColor: `${tagObj.color}40`
            }}
          >
            {tagObj.icon && <span className="mr-1">{tagObj.icon}</span>}
            {tagObj.name}
          </Badge>
        );
      })}
      {remainingCount > 0 && (
        <Badge variant="outline" className="text-xs">
          {variant === "list" ? `+${remainingCount} more` : `+${remainingCount}`}
        </Badge>
      )}
    </div>
  );
};
