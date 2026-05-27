import { Users, Calendar } from "lucide-react";
import {
  ListCardDetailDivider,
  ListCardDetailField,
  ListCardDetailGrid,
} from "@/components/common/ListCardLayout";
import { SpaceInfoProps } from "../types";

export const SpaceInfo = ({ space, variant = "grid" }: SpaceInfoProps) => {
  if (variant === "list") {
    return (
      <>
        <ListCardDetailGrid>
          <ListCardDetailField icon={Users} label="Capacity" value={`${space.capacity} people`} />
          <ListCardDetailField
            icon={Calendar}
            label="Today"
            value={`${space.appointments?.today ?? 0} appointments`}
          />
          <ListCardDetailField
            label="This week"
            value={`${space.appointments?.thisWeek ?? 0} appointments`}
          />
        </ListCardDetailGrid>
        <ListCardDetailDivider />
        <ListCardDetailGrid>
          <ListCardDetailField
            label="Updated"
            value={space.updatedAt ? new Date(space.updatedAt).toLocaleDateString() : "—"}
          />
          <ListCardDetailField label="ID" value={space.id} />
        </ListCardDetailGrid>
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
