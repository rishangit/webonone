import { Tag } from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";

interface ProductDetailTagsProps {
  tags: string[] | Array<{ id: string | number; name: string; color?: string; icon?: string }>;
}

export const ProductDetailTags = ({ tags }: ProductDetailTagsProps) => {
  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
      <h3 className="font-semibold text-foreground mb-4">Tags</h3>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => {
          // Handle both string tags (legacy) and Tag objects
          const tagObj = typeof tag === 'string' 
            ? { id: index.toString(), name: tag, color: '#3B82F6', icon: undefined }
            : tag;
          return (
            <Badge 
              key={tagObj.id || index} 
              variant="outline" 
              className="text-xs"
              style={{ 
                backgroundColor: `${tagObj.color || '#3B82F6'}20`, 
                color: tagObj.color || '#3B82F6',
                borderColor: `${tagObj.color || '#3B82F6'}40`
              }}
            >
              <Tag className="w-3 h-3 mr-1" />
              {tagObj.name}
            </Badge>
          );
        })}
      </div>
    </Card>
  );
};
