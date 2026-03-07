import { Building, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { BackButton } from "../../../components/common/BackButton";

interface Company {
  id: string;
  name: string;
  status: "pending" | "approved" | "rejected";
}

interface CompanyDetailHeaderProps {
  company: Company;
  onBack: () => void;
}

export const CompanyDetailHeader = ({
  company,
  onBack,
}: CompanyDetailHeaderProps) => {
  const getStatusColor = (status: Company["status"]) => {
    switch (status) {
      case "approved":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "rejected":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusIcon = (status: Company["status"]) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <BackButton onClick={onBack} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-foreground break-words">
              {company.name}
            </h1>
            <Badge className={`${getStatusColor(company.status)} border`}>
              <span className="flex items-center gap-1">
                {getStatusIcon(company.status)}
                {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
              </span>
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground truncate">
            Company ID: {company.id}
          </p>
        </div>
      </div>
    </div>
  );
};
