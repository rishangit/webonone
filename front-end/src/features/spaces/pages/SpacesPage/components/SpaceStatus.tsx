import { Badge } from "@/components/ui/badge";
import { SpaceStatusProps } from "../types";
import { getStatusColor } from "../utils";

export const SpaceStatus = ({ status, variant = "grid" }: SpaceStatusProps) => {
  const statusColor = getStatusColor(status);
  
  if (variant === "list") {
    return (
      <Badge className={`${statusColor} border`}>
        {status}
      </Badge>
    );
  }

  return (
    <div className="absolute top-3 left-3">
      <Badge className={`${statusColor} backdrop-blur-sm border`}>
        {status}
      </Badge>
    </div>
  );
};
