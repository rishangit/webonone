import { Mail, Phone, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/shared/utils";
import {
  ListCardContactEmail,
  ListCardContactGrid,
  ListCardContactPhone,
  ListCardDetailDivider,
  ListCardDetailField,
  ListCardDetailGrid,
} from "@/components/common/ListCardLayout";
import { StaffInfoProps } from "../types";
import { StaffRole } from "./StaffRole";

export const StaffInfo = ({ member, variant = "grid" }: StaffInfoProps) => {
  if (variant === "list") {
    return (
      <>
        <ListCardContactGrid>
          <ListCardContactEmail email={member.email} />
          <ListCardContactPhone phone={member.phone} />
          <ListCardDetailField
            icon={Calendar}
            label="Joined"
            value={member.joinDate ? formatDate(member.joinDate) : "—"}
          />
        </ListCardContactGrid>
        <ListCardDetailDivider />
        <ListCardDetailGrid>
          <ListCardDetailField label="Department" value={member.department ?? "—"} />
          <ListCardDetailField label="Last active" value={member.lastActive} />
        </ListCardDetailGrid>
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
          <span>Joined {member.joinDate ? formatDate(member.joinDate) : "—"}</span>
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
