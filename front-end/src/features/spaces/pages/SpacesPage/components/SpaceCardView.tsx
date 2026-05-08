import { Card } from "@/components/ui/card";
import { SpaceViewProps } from "../types";
import { SpaceImage } from "./SpaceImage";
import { SpaceStatus } from "./SpaceStatus";
import { SpaceActions } from "./SpaceActions";
import { SpaceInfo } from "./SpaceInfo";

export const SpaceCardView = ({ space, onView, onEdit, onDelete }: SpaceViewProps) => {
  return (
    <Card 
      className="overflow-hidden backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-300 hover:shadow-lg hover:shadow-[var(--glass-shadow)] group cursor-pointer"
      onClick={(e) => {
        // Don't navigate if clicking on dropdown or button
        if ((e.target as HTMLElement).closest('button, [role="menuitem"]')) {
          return;
        }
        onView(space);
      }}
    >
      <div className="relative">
        <SpaceImage imageUrl={space.imageUrl} spaceName={space.name} variant="grid" />
        <SpaceStatus status={space.status} variant="grid" />
        <div className="absolute top-3 right-3">
          <SpaceActions space={space} onView={onView} onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">{space.name}</h3>
          </div>
        </div>

        <SpaceInfo space={space} variant="grid" />
      </div>
    </Card>
  );
};
