import { useNavigate } from "react-router-dom";
import { Card } from "../../../../components/ui/card";
import { StaffViewProps } from "../types";
import { StaffAvatar } from "./StaffAvatar";
import { StaffStatus } from "./StaffStatus";
import { StaffActions } from "./StaffActions";
import { StaffInfo } from "./StaffInfo";

export const StaffListView = ({ member, onView, onDelete }: StaffViewProps) => {
  const navigate = useNavigate();

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[role="menuitem"]') || target.closest('[data-radix-popper-content-wrapper]')) {
      return;
    }
    navigate(`/system/staff/${member.id}`);
  };

  return (
    <Card 
      className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex items-center gap-4">
        <StaffAvatar member={member} variant="list" />
        
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-foreground">{member.firstName || ''} {member.lastName || ''}</h3>
              <p className="text-[var(--accent-text)] text-sm">{member.role || 'Staff Member'}</p>
            </div>
            <div className="flex items-center gap-2">
              <StaffStatus status={member.status} />
              <StaffActions member={member} onView={onView} onDelete={onDelete} />
            </div>
          </div>
          
          <StaffInfo member={member} variant="list" />
        </div>
      </div>
    </Card>
  );
};
