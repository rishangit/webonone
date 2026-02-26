import { Users, Tag as TagIcon } from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { Space } from "../../../../services/spaces";

interface SpaceDetailInfoProps {
  space: Space;
}

export const SpaceDetailInfo = ({ space }: SpaceDetailInfoProps) => {
  return (
    <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] w-full">
      <div className="space-y-4 w-full">
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-2 break-words">{space.name}</h2>
          {space.description && (
            <p className="text-muted-foreground break-words">{space.description}</p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-[var(--accent-text)] flex-shrink-0" />
            <span className="text-muted-foreground">Capacity:</span>
            <span className="text-foreground font-medium">{space.capacity} people</span>
          </div>
        </div>

        {space.tags && space.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <TagIcon className="w-4 h-4 text-muted-foreground mt-1 flex-shrink-0" />
            {space.tags.map((tag, index) => (
              <Badge 
                key={tag.id || index} 
                variant="outline"
                className="bg-[var(--glass-bg)] border-[var(--glass-border)]"
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};
