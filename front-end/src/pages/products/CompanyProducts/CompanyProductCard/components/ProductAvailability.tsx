import { CheckCircle, AlertTriangle } from "lucide-react";
import { Badge } from "../../../../../components/ui/badge";

interface ProductAvailabilityProps {
  availabilityStatus: {
    isAvailable: boolean;
    text: string;
  };
}

export const ProductAvailability = ({ availabilityStatus }: ProductAvailabilityProps) => {
  return (
    <Badge className={availabilityStatus.isAvailable ? "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30" : "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30"}>
      {availabilityStatus.isAvailable ? (
        <>
          <CheckCircle className="w-3 h-3 mr-1" />
          {availabilityStatus.text}
        </>
      ) : (
        <>
          <AlertTriangle className="w-3 h-3 mr-1" />
          {availabilityStatus.text}
        </>
      )}
    </Badge>
  );
};
