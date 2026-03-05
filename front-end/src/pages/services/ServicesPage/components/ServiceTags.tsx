import { Badge } from "../../../../components/ui/badge";
import { ServiceTagsProps } from "../types";

export const ServiceTags = ({ tags }: Omit<ServiceTagsProps, 'renderTags'>) => {
  if (!tags || tags.length === 0) return null;
  
  return (
    <div className="flex flex-wrap gap-1 mb-4">
      {tags.slice(0, 3).map((tag, index) => {
        const tagObj = typeof tag === 'string' 
          ? { id: index.toString(), name: tag, color: '#3B82F6', icon: undefined }
          : tag;
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
      {tags.length > 3 && (
        <Badge variant="outline" className="text-xs">
          +{tags.length - 3}
        </Badge>
      )}
    </div>
  );
};
