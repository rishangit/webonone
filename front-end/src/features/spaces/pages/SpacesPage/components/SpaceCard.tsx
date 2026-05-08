import { SpaceCardProps } from "../types";
import { SpaceCardView } from "./SpaceCardView";
import { SpaceListView } from "./SpaceListView";

export const SpaceCard = ({ space, viewMode, onView, onEdit, onDelete }: SpaceCardProps) => {
  if (viewMode === "grid") {
    return <SpaceCardView space={space} onView={onView} onEdit={onEdit} onDelete={onDelete} />;
  }
  
  return <SpaceListView space={space} onView={onView} onEdit={onEdit} onDelete={onDelete} />;
};
