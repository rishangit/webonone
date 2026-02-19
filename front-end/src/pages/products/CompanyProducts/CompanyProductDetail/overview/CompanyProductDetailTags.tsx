import { Tag } from "lucide-react";
import { Card } from "../../../../../components/ui/card";
import { Badge } from "../../../../../components/ui/badge";

interface CompanyProductDetailTagsProps {
  tags: string[] | Array<{ id: string | number; name: string; color?: string }>;
}

export const CompanyProductDetailTags = ({ tags }: CompanyProductDetailTagsProps) => {
  if (!tags || tags.length === 0) {
    return null;
  }

  return (
    <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
      <h3 className="font-semibold text-foreground mb-4">Tags</h3>
      <p className="text-xs text-muted-foreground mb-2">
        Tags are inherited from the system product.
      </p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag, index) => {
          const tagObj = typeof tag === 'string' 
            ? { id: index.toString(), name: tag, color: '#3B82F6' }
            : tag;
          return (
            <Badge 
              key={tagObj.id || index} 
              variant="outline" 
              className="text-xs"
              style={{ 
                backgroundColor: `${tagObj.color}20`, 
                color: tagObj.color,
                borderColor: `${tagObj.color}40`
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
