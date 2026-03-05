export interface CompanyRegistrationWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface CompanyFormData {
  companyName: string;
  description: string;
  contactPerson: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  tagIds: string[];
  employees: string;
  logo?: string;
  selectedEntities?: string[] | null;
}

export interface WizardStep {
  id: string;
  title: string;
  stepNumber: number;
}
