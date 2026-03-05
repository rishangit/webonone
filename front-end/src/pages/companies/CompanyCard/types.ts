export interface Tag {
  id: number;
  name: string;
  color: string;
  icon?: string;
}

export interface Owner {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  avatar?: string;
}

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
  category?: string;
  subCategory?: string;
  employees?: string;
  status: "pending" | "approved" | "rejected";
  submittedDate: string;
  logo?: string;
  isActive?: boolean | number | null;
  tags?: Tag[];
  owner?: Owner | null;
}

export interface CompanyCardProps {
  company: Company;
  onViewCompany: (companyId: string) => void;
}

export interface CompanyViewProps {
  company: Company;
  onViewCompany: (companyId: string) => void;
}
