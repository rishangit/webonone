import { Badge } from "../../../../components/ui/badge";
import { ServiceStatusProps } from "../types";

export const ServiceStatus = ({ status, getStatusColor, variant = "grid" }: ServiceStatusProps) => {
  const statusClass = getStatusColor(status);
  
  if (variant === "list") {
    return (
      <Badge className={`${statusClass} text-xs border`}>
        {status}
      </Badge>
    );
  }

  return (
    <Badge className={`${statusClass} backdrop-blur-sm border`}>
      {status}
    </Badge>
  );
};
