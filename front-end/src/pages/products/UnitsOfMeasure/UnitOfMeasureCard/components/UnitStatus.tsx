import { Badge } from "../../../../../components/ui/badge";
import { UnitStatusProps } from "../types";

export const UnitStatus = ({ isActive, className = "" }: UnitStatusProps) => {
  return (
    <Badge 
      className={
        isActive 
          ? `bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30 ${className}`
          : `bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30 ${className}`
      }
    >
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
};
