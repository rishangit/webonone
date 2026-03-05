import { Card } from "../../../../components/ui/card";
import { SpaceViewProps } from "../types";
import { SpaceImage } from "./SpaceImage";
import { SpaceStatus } from "./SpaceStatus";
import { SpaceActions } from "./SpaceActions";
import { SpaceInfo } from "./SpaceInfo";

export const SpaceListView = ({ space, onView, onEdit, onDelete }: SpaceViewProps) => {
  return (
    <Card 
      className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-300 hover:shadow-lg hover:shadow-[var(--glass-shadow)] cursor-pointer"
      onClick={(e) => {
        // Don't navigate if clicking on dropdown or button
        if ((e.target as HTMLElement).closest('button, [role="menuitem"]')) {
          return;
        }
        onView(space);
      }}
    >
      <div className="flex items-center gap-6">
        <SpaceImage imageUrl={space.imageUrl} spaceName={space.name} variant="list" />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-lg font-semibold text-foreground">{space.name}</h3>
            </div>
            <div className="flex items-center gap-2">
              <SpaceStatus status={space.status} variant="list" />
            </div>
          </div>
          
          <SpaceInfo space={space} variant="list" />
          
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-2">
              <SpaceActions space={space} onView={onView} onEdit={onEdit} onDelete={onDelete} />
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
