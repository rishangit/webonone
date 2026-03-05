import { Badge } from "../../../../../components/ui/badge";

interface Tag {
  id?: string;
  name: string;
  color?: string;
  icon?: string;
}

interface ProductTagsProps {
  tags: (string | Tag)[];
  maxVisible?: number;
}

export const ProductTags = ({ tags, maxVisible = 3 }: ProductTagsProps) => {
  if (!tags || tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1">
      {tags.slice(0, maxVisible).map((tag, index) => {
        const tagObj = typeof tag === 'string' 
          ? { id: index.toString(), name: tag, color: '#3B82F6', icon: undefined }
          : tag;
        return (
          <Badge
            key={tagObj.id || index}
            variant="secondary"
            className="text-xs"
            style={{ 
              backgroundColor: `${tagObj.color || '#3B82F6'}20`, 
              color: tagObj.color || '#3B82F6',
              borderColor: `${tagObj.color || '#3B82F6'}40`
            }}
          >
            {tagObj.icon && <span className="mr-1">{tagObj.icon}</span>}
            {tagObj.name}
          </Badge>
        );
      })}
      {tags.length > maxVisible && (
        <Badge variant="outline" className="text-xs">
          +{tags.length - maxVisible}
        </Badge>
      )}
    </div>
  );
};
