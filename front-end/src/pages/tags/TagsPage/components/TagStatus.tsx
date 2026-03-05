import { CheckCircle, X } from "lucide-react";
import { Badge } from "../../../../components/ui/badge";
import { TagStatusProps } from "../types";

export const TagStatus = ({ isActive }: TagStatusProps) => {
  return (
    <Badge 
      variant={isActive ? "default" : "secondary"}
      className={isActive ? "bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30" : ""}
    >
      {isActive ? (
        <>
          <CheckCircle className="w-3 h-3 mr-1" />
          Active
        </>
      ) : (
        <>
          <X className="w-3 h-3 mr-1" />
          Inactive
        </>
      )}
    </Badge>
  );
};
