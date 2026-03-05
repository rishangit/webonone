import { Badge } from "../../../../components/ui/badge";
import { StaffStatusProps } from "../types";
import { getStatusColor } from "../utils";

export const StaffStatus = ({ status }: StaffStatusProps) => {
  return (
    <Badge className={getStatusColor(status)}>
      {status}
    </Badge>
  );
};
