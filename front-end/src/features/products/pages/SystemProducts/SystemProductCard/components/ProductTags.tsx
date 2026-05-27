import { Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProductTagsProps } from "../types";
import type { Tag as TagType } from "@/features/products/types/product.types";

export const ProductTags = ({ tags, variant = "grid", maxVisible }: ProductTagsProps & { maxVisible?: number }) => {
  const limit = maxVisible ?? (variant === "list" ? 4 : 3);

  if (!tags || tags.length === 0) {
    if (variant === "list") {
      return null;
    }
    return (
      <div className="mb-4 flex items-center gap-2 text-xs text-muted-foreground">
        <Tag className="h-3 w-3" />
        <span>No tags assigned</span>
      </div>
    );
  }

  const remainingCount = tags.length > limit ? tags.length - limit : 0;

  return (
    <>
      {tags.slice(0, limit).map((tag, index) => {
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
    </>
  );
};
