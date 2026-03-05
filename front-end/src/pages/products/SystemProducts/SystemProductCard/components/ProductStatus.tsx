import { CheckCircle, AlertTriangle } from "lucide-react";
import { Badge } from "../../../../../components/ui/badge";
import { ProductStatusProps } from "../types";

export const ProductStatus = ({ isActive, isVerified, variant = "grid" }: ProductStatusProps) => {
  if (variant === "list") {
    return (
      <div className="flex items-center gap-2 flex-shrink-0">
        <Badge className={isActive ? "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30" : "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
        <Badge className={isVerified ? "bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30" : "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30"}>
          {isVerified ? (
            <>
              <CheckCircle className="w-3 h-3 mr-1" />
              Verified
            </>
          ) : (
            <>
              <AlertTriangle className="w-3 h-3 mr-1" />
              Unverified
            </>
          )}
        </Badge>
      </div>
    );
  }

  return (
    <div className="flex gap-1 flex-wrap">
      <Badge className={isActive ? "bg-green-500/20 text-green-400 backdrop-blur-sm border border-green-500/30" : "bg-gray-500/20 text-gray-400 backdrop-blur-sm border border-gray-500/30"}>
        {isActive ? "Active" : "Inactive"}
      </Badge>
      <Badge className={isVerified ? "bg-purple-500/20 text-purple-600 dark:text-purple-400 backdrop-blur-sm border border-purple-500/30" : "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 backdrop-blur-sm border border-yellow-500/30"}>
        {isVerified ? (
          <>
            <CheckCircle className="w-3 h-3 mr-1" />
            Verified
          </>
        ) : (
          <>
            <AlertTriangle className="w-3 h-3 mr-1" />
            Unverified
          </>
        )}
      </Badge>
    </div>
  );
};
