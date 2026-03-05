import { Mail, Phone, Calendar } from "lucide-react";
import { Badge } from "../../../../components/ui/badge";
import { formatDate } from "../../../../utils";
import { StaffInfoProps } from "../types";
import { StaffRole } from "./StaffRole";

export const StaffInfo = ({ member, variant = "grid" }: StaffInfoProps) => {
  if (variant === "list") {
    return (
      <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Mail className="w-4 h-4" />
            <span className="truncate">{member.email}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Phone className="w-4 h-4" />
            <span>{member.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <span>Joined {formatDate(member.joinDate)}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <StaffRole role={member.role} />
            {member.department && (
              <Badge variant="outline" className="text-muted-foreground">
                {member.department}
              </Badge>
            )}
          </div>
          <span className="text-xs text-muted-foreground">
            Last active: {member.lastActive}
          </span>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="space-y-3 mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="w-4 h-4" />
          <span className="truncate">{member.email}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Phone className="w-4 h-4" />
          <span>{member.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>Joined {formatDate(member.joinDate)}</span>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <StaffRole role={member.role} />
        {member.department && (
          <Badge variant="outline" className="text-muted-foreground">
            {member.department}
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Last active: {member.lastActive}</span>
      </div>
    </>
  );
};
