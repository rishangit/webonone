import { Clock, CheckCircle, Building } from "lucide-react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Company } from "../../../services/companies";
import { CompanyCard } from "./CompanyCard";
import { CompanyRegistrationSection } from "./CompanyRegistrationSection";

interface CompaniesTabProps {
  userId?: string;
  isSystemAdmin: boolean;
  companiesLoading: boolean;
  pendingCompanies: Company[];
  approvedCompanies: Company[];
  rejectedCompanies: Company[];
  loggingIn: string | null;
  onViewDetails: (companyId: string) => void;
  onEditDetails: (companyId: string) => void;
  onDelete: (company: { id: string; name: string }) => void;
  onApprove?: (companyId: string) => void;
  onReject?: (companyId: string) => void;
  onLogin?: (companyId: string) => void;
  onRegisterCompany?: () => void;
}

export const CompaniesTab = ({
  userId,
  isSystemAdmin,
  companiesLoading,
  pendingCompanies,
  approvedCompanies,
  rejectedCompanies,
  loggingIn,
  onViewDetails,
  onEditDetails,
  onDelete,
  onApprove,
  onReject,
  onLogin,
  onRegisterCompany,
}: CompaniesTabProps) => {
  return (
    <div className="space-y-6">
      {/* Company Registration */}
      <CompanyRegistrationSection show={!userId && !isSystemAdmin} />

      {/* Company Registration Requests */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            {isSystemAdmin ? 'Company Registration Requests' : 'Company Registration Status'}
          </h2>
          <p className="text-muted-foreground text-sm">
            {isSystemAdmin 
              ? 'Manage company registration requests and their approval status'
              : 'View the status of your company registration requests'}
          </p>
        </div>

        {/* Pending Requests */}
        {pendingCompanies.length > 0 && (
          <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-yellow-500" />
              <h3 className="font-semibold text-foreground">Pending Requests ({pendingCompanies.length})</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {pendingCompanies.map((company) => (
                <CompanyCard
                  key={company.id}
                  company={company}
                  status="pending"
                  isSystemAdmin={isSystemAdmin}
                  companiesLoading={companiesLoading}
                  loggingIn={loggingIn}
                  onViewDetails={onViewDetails}
                  onEditDetails={onEditDetails}
                  onDelete={onDelete}
                  onApprove={onApprove}
                  onReject={onReject}
                />
              ))}
            </div>
          </Card>
        )}

        {/* Approved Companies */}
        {approvedCompanies.length > 0 && (
          <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <h3 className="font-semibold text-foreground">Approved Companies ({approvedCompanies.length})</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {approvedCompanies.map((company) => (
                <CompanyCard
                  key={company.id}
                  company={company}
                  status="approved"
                  isSystemAdmin={isSystemAdmin}
                  companiesLoading={companiesLoading}
                  loggingIn={loggingIn}
                  onViewDetails={onViewDetails}
                  onEditDetails={onEditDetails}
                  onDelete={onDelete}
                  onLogin={onLogin}
                />
              ))}
            </div>
          </Card>
        )}

        {/* No requests message */}
        {pendingCompanies.length === 0 && approvedCompanies.length === 0 && !companiesLoading && (
          <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] text-center">
            <Building className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              {isSystemAdmin 
                ? 'No company registration requests'
                : 'You have not registered any companies yet'}
            </p>
            {!isSystemAdmin && onRegisterCompany && (
              <Button
                variant="outline"
                className="mt-4"
                onClick={onRegisterCompany}
              >
                <Building className="w-4 h-4 mr-2" />
                Register Your Company
              </Button>
            )}
          </Card>
        )}

        {/* Loading state */}
        {companiesLoading && (
          <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-primary)] mx-auto"></div>
            <p className="text-muted-foreground mt-2">Loading companies...</p>
          </Card>
        )}
      </div>
    </div>
  );
};
