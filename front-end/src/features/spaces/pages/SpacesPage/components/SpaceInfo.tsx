import { Users, Calendar } from "lucide-react";
import { SpaceInfoProps } from "../types";

export const SpaceInfo = ({ space, variant = "grid" }: SpaceInfoProps) => {
  if (variant === "list") {
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>Capacity: {space.capacity}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>{space.appointments?.today || 0} appointments today</span>
          </div>
        </div>
        
        {space.description && (
          <p className="text-sm text-foreground mb-3 line-clamp-1">{space.description}</p>
        )}
      </>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Users className="w-4 h-4" />
        <span>Capacity: {space.capacity} people</span>
      </div>

      {space.description && (
        <p className="text-sm text-foreground line-clamp-2">{space.description}</p>
      )}
    </div>
  );
};
