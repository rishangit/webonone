export interface Company {
  id: string;
  name: string;
  description: string;
  contactPerson?: string;
  email: string;
  phone: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  category?: string;
  subCategory?: string;
  employees?: string;
  companySize?: string;
  status: "pending" | "approved" | "rejected";
  submittedDate: string;
  approvedDate?: string;
  rejectedDate?: string;
  rejectionReason?: string;
  logo?: string;
  isActive?: boolean | number | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface CompanyDetailPageProps {
  companyId: string;
  onBack: () => void;
  initialTab?: "profile" | "services" | "products";
  selectedServiceId?: string;
  selectedProductId?: string;
}
