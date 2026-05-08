import { CompanyDetailPage } from "./CompanyDetail";

interface CompanyProfilePageProps {
  companyId: string;
  onBack: () => void;
  initialTab?: "profile" | "services" | "products";
  selectedServiceId?: string;
  selectedProductId?: string;
}

export function CompanyProfilePage({
  companyId,
  onBack,
  initialTab,
  selectedServiceId,
  selectedProductId,
}: CompanyProfilePageProps) {
  return (
    <CompanyDetailPage
      companyId={companyId}
      onBack={onBack}
      initialTab={initialTab}
      selectedServiceId={selectedServiceId}
      selectedProductId={selectedProductId}
    />
  );
}
