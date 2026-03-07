import { Building, CheckCircle, XCircle, Clock } from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { Badge } from "../../../../components/ui/badge";
import { CardTitle } from "../../../../components/common/CardTitle";
import { DateDisplay } from "../../../../components/common/DateDisplay";
import { Company } from "../types";

interface CompanyStatusCardProps {
  company: Company;
}

export const CompanyStatusCard = ({ company }: CompanyStatusCardProps) => {
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
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  return (
    <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
      <CardTitle title="Company Status" icon={Building} className="mb-4" />
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {getStatusIcon(company.status)}
          <div>
            <p className="font-medium text-foreground">
              {company.status === "approved" ? "Approved & Active" : 
               company.status === "rejected" ? "Rejected" : 
               "Pending Approval"}
            </p>
            <p className="text-sm text-muted-foreground">
              {company.status === "approved" ? "Ready to accept appointments" : 
               company.status === "rejected" ? "Application has been rejected" : 
               "Awaiting admin approval"}
            </p>
          </div>
        </div>
        <Badge className={`${getStatusColor(company.status)} border`}>
          <span className="flex items-center gap-1">
            {getStatusIcon(company.status)}
            {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
          </span>
        </Badge>
      </div>
    </Card>
  );
};
