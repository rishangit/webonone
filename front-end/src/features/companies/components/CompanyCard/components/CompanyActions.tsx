import { Eye, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardKebabTrigger } from "@/components/common/CardKebabTrigger";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { approveCompanyRequest, rejectCompanyRequest, fetchCompaniesRequest } from "@/features/companies/store";
import { isRole, UserRole } from "@/shared/types/user";
import { Company } from "../types";

interface CompanyActionsProps {
  company: Company;
  onViewCompany: (companyId: string) => void;
  actualStatus: "pending" | "approved" | "rejected";
  triggerVariant?: "overlay" | "default";
  showViewButton?: boolean;
}

export const CompanyActions = ({
  company,
  onViewCompany,
  actualStatus,
  triggerVariant = "default",
  showViewButton = true,
}: CompanyActionsProps) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const isSuperAdmin = isRole(user?.role, UserRole.SYSTEM_ADMIN);

  return (
    <div className="flex items-center gap-2">
      {showViewButton && !isSuperAdmin && (
        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onViewCompany(company.id);
          }}
          className="bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent text-foreground hover:text-foreground"
        >
          <Eye className="w-4 h-4 mr-2" />
          View
        </Button>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <CardKebabTrigger variant={triggerVariant} />
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-popover border-border" align="end" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem
            onClick={(e) => {
              e.stopPropagation();
              onViewCompany(company.id);
            }}
          >
            <Eye className="w-4 h-4 mr-2" />
            View Full Profile
          </DropdownMenuItem>
          {actualStatus === "pending" && isSuperAdmin && (
            <>
              <DropdownMenuItem
                className="text-green-600 dark:text-green-400"
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch(approveCompanyRequest(company.id));
                  setTimeout(() => {
                    dispatch(fetchCompaniesRequest({}));
                  }, 1000);
                }}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve Company
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 dark:text-red-400"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm("Are you sure you want to reject this company registration?")) {
                    dispatch(rejectCompanyRequest({ id: company.id }));
                    setTimeout(() => {
                      dispatch(fetchCompaniesRequest({}));
                    }, 1000);
                  }
                }}
              >
                <XCircle className="w-4 h-4 mr-2" />
                Reject Company
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
