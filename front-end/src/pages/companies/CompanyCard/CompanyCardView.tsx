import { DateDisplay } from "@/components/common/DateDisplay";
import { CompanyViewProps } from "./types";
import { CompanyCardHeader } from "./components/CompanyCardHeader";
import { CompanyDetails } from "./components/CompanyDetails";
import { CompanyActions } from "./components/CompanyActions";
import { CompanyOwnerInfo } from "./components/CompanyOwnerInfo";
import { useAppSelector } from "@/store/hooks";
import { isRole, UserRole } from "@/types/user";

export const CompanyCardView = ({
  company,
  onViewCompany
}: CompanyViewProps) => {
  const { user } = useAppSelector((state) => state.auth);
  const isSuperAdmin = isRole(user?.role, UserRole.SYSTEM_ADMIN);

  // Determine status from isActive if status is not explicitly set or needs validation
  const getActualStatus = (): "pending" | "approved" | "rejected" => {
    if (company.status && ['pending', 'approved', 'rejected'].includes(company.status)) {
      const isActiveValue = company.isActive;
      
      if ((isActiveValue === true || isActiveValue === 1) && company.status !== 'approved') {
        return 'approved';
      }
      
      if ((isActiveValue === false || isActiveValue === 0 || isActiveValue === null || isActiveValue === undefined) 
          && company.status === 'approved') {
        return 'pending';
      }
      
      return company.status;
    }
    
    const isActiveValue = company.isActive;
    if (isActiveValue === true || isActiveValue === 1) {
      return 'approved';
    } else if (isActiveValue === false || isActiveValue === 0) {
      return 'pending';
    } else {
      return 'pending';
    }
  };

  const actualStatus = getActualStatus();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30';
      case 'pending': return 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30';
    }
  };

  return (
    <div className="space-y-4">
      <CompanyCardHeader
        company={company}
        getStatusColor={getStatusColor}
        actualStatus={actualStatus}
      />
      
      <CompanyDetails company={company} />
      
      {/* Owner Information - Show for super admin */}
      {isSuperAdmin && <CompanyOwnerInfo company={company} />}
      
      <div className="flex items-center justify-between pt-2">
        <span className="text-xs text-muted-foreground">
          <DateDisplay date={company.submittedDate} />
        </span>
        
        <CompanyActions
          company={company}
          onViewCompany={onViewCompany}
          actualStatus={actualStatus}
        />
      </div>
    </div>
  );
};
