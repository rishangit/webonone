import { CheckCircle, XCircle } from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { CardTitle } from "../../../../components/common/CardTitle";
import { Company } from "../types";

interface CompanyAdminActionsCardProps {
  company: Company;
  loading?: boolean;
  onApprove?: () => void;
  onShowRejectionForm?: () => void;
}

export const CompanyAdminActionsCard = ({
  company,
  loading = false,
  onApprove,
  onShowRejectionForm,
}: CompanyAdminActionsCardProps) => {
  if (company.status !== "pending") {
    return null;
  }

  return (
    <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
      <CardTitle title="Admin Actions" icon={CheckCircle} className="mb-4" />
      <div className="space-y-3">
        <Button 
          onClick={onApprove}
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/25 text-white disabled:opacity-50"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          {loading ? "Approving..." : "Approve Company"}
        </Button>
        <Button 
          variant="outline"
          onClick={onShowRejectionForm}
          disabled={loading}
          className="w-full bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300 disabled:opacity-50"
        >
          <XCircle className="w-4 h-4 mr-2" />
          Reject Application
        </Button>
      </div>
    </Card>
  );
};
