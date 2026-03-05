import { CustomDialog } from "../../../../components/ui/custom-dialog";
import { Label } from "../../../../components/ui/label";
import { Badge } from "../../../../components/ui/badge";
import { SpaceViewDialogProps } from "../types";
import { getImageUrl, getStatusColor } from "../utils";
import { Space } from "../../../../services/spaces";

export const SpaceViewDialog = ({ open, onOpenChange, space }: SpaceViewDialogProps) => {
  if (!space) return null;

  return (
    <CustomDialog
      open={open}
      onOpenChange={onOpenChange}
      title={space.name}
      description={space.description || "Space details"}
      maxWidth="max-w-4xl"
      className="h-[90vh]"
    >
      <div className="space-y-6">
        <div className="w-full h-48 rounded-lg overflow-hidden">
          <img 
            src={getImageUrl(space)} 
            alt={space.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground">Capacity</Label>
            <p className="text-foreground font-medium">{space.capacity} people</p>
          </div>
          <div className="space-y-2">
            <Label className="text-muted-foreground">Status</Label>
            <Badge className={getStatusColor(space.status)}>
              {space.status}
            </Badge>
          </div>
        </div>

        {space.description && (
          <div className="space-y-2">
            <Label className="text-muted-foreground">Description</Label>
            <p className="text-foreground">{space.description}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
          <div className="text-center p-4 bg-[var(--glass-bg)] rounded-lg">
            <p className="text-2xl font-bold text-foreground">{space.appointments?.today || 0}</p>
            <p className="text-sm text-muted-foreground">Appointments Today</p>
          </div>
          <div className="text-center p-4 bg-[var(--glass-bg)] rounded-lg">
            <p className="text-2xl font-bold text-foreground">{space.appointments?.thisWeek || 0}</p>
            <p className="text-sm text-muted-foreground">This Week</p>
          </div>
        </div>
      </div>
    </CustomDialog>
  );
};
