import { useState, useEffect } from "react";
import { Building, CreditCard, Package, User } from "lucide-react";
import { Card } from "../../../components/ui/card";
import { TabSwitcher } from "../../../components/ui/tab-switcher";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { fetchCompanyRequest, clearError, approveCompanyRequest, rejectCompanyRequest } from "../../../store/slices/companiesSlice";
import { toast } from "sonner";
import { BackButton } from "../../../components/common/BackButton";
import { CompanyDetailHeader } from "./CompanyDetailHeader";
import { CompanyProfileTab } from "./profile";
import { CompanyServicesTab } from "./services";
import { CompanyProductsTab } from "./products";
import { CompanyStatusCard, CompanyAccountCard, CompanyAdminActionsCard } from "./components";
import { Company } from "./types";

interface CompanyDetailPageProps {
  companyId: string;
  onBack: () => void;
}

export const CompanyDetailPage = ({ companyId, onBack }: CompanyDetailPageProps) => {
  const dispatch = useAppDispatch();
  const { companies: reduxCompanies, currentCompany, loading, error } = useAppSelector((state) => state.companies);
  
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("profile");

  // Find company from Redux store
  const reduxCompany = reduxCompanies.find(comp => comp.id === companyId) || 
                      (currentCompany && currentCompany.id === companyId ? currentCompany : null);

  // Fetch company if not found in store
  useEffect(() => {
    if (!reduxCompany && companyId) {
      dispatch(fetchCompanyRequest(companyId));
    }
  }, [reduxCompany, companyId, dispatch]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Transform Redux company data to match the expected format
  const transformCompanyData = (companyData: any): Company | null => {
    if (!companyData) return null;

    const city = companyData.city || "";
    const state = companyData.state || "";
    const country = companyData.country || "";
    const postalCode = companyData.postalCode || "";
    const address = companyData.address || "";

    // Map isActive to status
    let status: "pending" | "approved" | "rejected" = "pending";
    const isActiveValue = companyData.isActive;
    
    if (isActiveValue === true || isActiveValue === 1) {
      status = "approved";
    } else if (isActiveValue === false || isActiveValue === 0) {
      status = "pending";
    } else if (isActiveValue === null || isActiveValue === undefined) {
      status = "pending";
    }

    return {
      id: companyData.id,
      name: companyData.name,
      description: companyData.description || "",
      contactPerson: companyData.contactPerson || "",
      email: companyData.email || "",
      phone: companyData.phone || "",
      website: companyData.website || "",
      address: address,
      city: city,
      state: state,
      country: country,
      postalCode: postalCode,
      latitude: companyData.latitude !== undefined && companyData.latitude !== null ? companyData.latitude : null,
      longitude: companyData.longitude !== undefined && companyData.longitude !== null ? companyData.longitude : null,
      category: companyData.category || "",
      subCategory: companyData.subcategory || "",
      employees: companyData.companySize || "",
      status: status,
      submittedDate: companyData.createdAt || new Date().toISOString(),
      logo: companyData.logo || "",
      isActive: companyData.isActive
    };
  };

  const company = transformCompanyData(reduxCompany || currentCompany);

  const handleApprove = () => {
    if (!company) return;
    
    dispatch(approveCompanyRequest(company.id));
    setTimeout(() => {
      dispatch(fetchCompanyRequest(company.id));
    }, 500);
  };

  const handleReject = (reason: string) => {
    if (!company) return;
    
    if (!reason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    
    dispatch(rejectCompanyRequest({ id: company.id, reason }));
    setShowRejectionForm(false);
    setRejectionReason("");
    
    setTimeout(() => {
      dispatch(fetchCompanyRequest(company.id));
    }, 500);
  };

  // Show loading state
  if (loading && !company) {
    return (
      <div className="flex-1 p-4 lg:p-6 flex items-center justify-center">
        <Card className="p-8 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] text-center">
          <div className="flex flex-col items-center gap-3">
            <Building className="w-12 h-12 text-muted-foreground animate-pulse" />
            <h3 className="text-lg font-semibold text-foreground">Loading company...</h3>
            <p className="text-muted-foreground">Please wait while we fetch the data</p>
          </div>
        </Card>
      </div>
    );
  }

  // Show error state if company not found
  if (!company) {
    return (
      <div className="flex-1 p-4 lg:p-6 flex items-center justify-center">
        <Card className="p-8 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] text-center">
          <div className="flex flex-col items-center gap-3">
            <Building className="w-12 h-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground">Company not found</h3>
            <p className="text-muted-foreground mb-4">The company you're looking for doesn't exist or has been removed.</p>
            <BackButton onClick={onBack} label="Back to Companies" />
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-6 w-full">
      <CompanyDetailHeader company={company} onBack={onBack} />

      <div className="w-full space-y-6">
        <TabSwitcher
          tabs={[
            { value: "profile", label: "Profile", icon: User },
            { value: "services", label: "Services", icon: CreditCard },
            { value: "products", label: "Products", icon: Package },
          ]}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {activeTab === "profile" && (
          <div className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <CompanyProfileTab
                  company={company}
                  loading={loading}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  rejectionReason={rejectionReason}
                  onRejectionReasonChange={setRejectionReason}
                  showRejectionForm={showRejectionForm}
                  onShowRejectionForm={setShowRejectionForm}
                />
              </div>
              <div className="space-y-6">
                <CompanyStatusCard company={company} />
                <CompanyAdminActionsCard
                  company={company}
                  loading={loading}
                  onApprove={handleApprove}
                  onShowRejectionForm={() => setShowRejectionForm(true)}
                />
                <CompanyAccountCard company={company} />
              </div>
            </div>
          </div>
        )}

        {activeTab === "services" && (
          <div className="mt-6">
            <CompanyServicesTab companyId={companyId} />
          </div>
        )}

        {activeTab === "products" && (
          <div className="mt-6">
            <CompanyProductsTab companyId={companyId} />
          </div>
        )}
      </div>
    </div>
  );
};
