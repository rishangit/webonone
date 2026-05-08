import { StaffCardProps } from "../types";
import { StaffCardView } from "./StaffCardView";
import { StaffListView } from "./StaffListView";

export const StaffCard = ({ member, viewMode, onView, onDelete }: StaffCardProps) => {
  if (viewMode === "grid") {
    return <StaffCardView member={member} onView={onView} onDelete={onDelete} />;
  }
  
  return <StaffListView member={member} onView={onView} onDelete={onDelete} />;
};
