import { Badge } from "../../../../components/ui/badge";
import { StaffRoleProps } from "../types";
import { getRoleColor } from "../utils";

export const StaffRole = ({ role }: StaffRoleProps) => {
  if (!role) return null;
  
  return (
    <Badge className={getRoleColor(role)} variant="outline">
      {role}
    </Badge>
  );
};
