import { XCircle } from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { Company } from "../types";

interface CompanyRejectionCardProps {
  company: Company;
}

export const CompanyRejectionCard = ({ company }: CompanyRejectionCardProps) => {
  if (company.status !== "rejected" || !company.rejectionReason) {
    return null;
  }

  return (
    <Card className="p-6 backdrop-blur-sm bg-red-500/10 border border-red-500/30">
      <h3 className="font-medium text-red-400 mb-4 flex items-center gap-2">
        <XCircle className="w-5 h-5" />
        Rejection Reason
      </h3>
      <p className="text-foreground">{company.rejectionReason}</p>
    </Card>
  );
};
