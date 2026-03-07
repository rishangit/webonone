import { CompanyDetailPage } from "./CompanyDetail";

interface CompanyProfilePageProps {
  companyId: string;
  onBack: () => void;
}

export function CompanyProfilePage({ companyId, onBack }: CompanyProfilePageProps) {
  return <CompanyDetailPage companyId={companyId} onBack={onBack} />;
}
