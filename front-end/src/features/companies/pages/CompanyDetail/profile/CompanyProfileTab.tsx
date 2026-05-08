import { CheckCircle, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Company } from "../types";
import {
  CompanyProfileCard,
  CompanyContactCard,
  CompanyLocationCard,
  CompanyRejectionCard,
} from "../components";

interface CompanyProfileTabProps {
  company: Company;
  loading?: boolean;
  onApprove?: () => void;
  onReject?: (reason: string) => void;
  rejectionReason?: string;
  onRejectionReasonChange?: (reason: string) => void;
  showRejectionForm?: boolean;
  onShowRejectionForm?: (show: boolean) => void;
}

export const CompanyProfileTab = ({
  company,
  loading = false,
  onApprove,
  onReject,
  rejectionReason = "",
  onRejectionReasonChange,
  showRejectionForm = false,
  onShowRejectionForm,
}: CompanyProfileTabProps) => {
  const handleReject = () => {
    if (!rejectionReason.trim()) {
      return;
    }
    onReject?.(rejectionReason);
  };

  return (
    <div className="space-y-6">
      {/* Main Content */}
      <div className="space-y-6">
        <CompanyProfileCard company={company} />
        <CompanyContactCard company={company} />
        <CompanyLocationCard company={company} />
        <CompanyRejectionCard company={company} />
      </div>

      {/* Rejection Form Modal */}
      {showRejectionForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] shadow-2xl">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Reject Application</h3>
              <p className="text-muted-foreground mb-4">Please provide a reason for rejecting this company registration:</p>
              
              <Textarea
                placeholder="Enter rejection reason..."
                value={rejectionReason}
                onChange={(e) => onRejectionReasonChange?.(e.target.value)}
                className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground placeholder:text-muted-foreground resize-none mb-4"
                rows={4}
              />
              
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline"
                  onClick={() => onShowRejectionForm?.(false)}
                  className="flex-1 bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground hover:bg-accent hover:text-foreground"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleReject}
                  disabled={loading || !rejectionReason.trim()}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white disabled:opacity-50"
                >
                  {loading ? "Rejecting..." : "Reject Application"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
