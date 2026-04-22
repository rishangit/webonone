import { Calendar, Clock, Briefcase, Users, MapPin, User, FileText, CheckCircle } from "lucide-react";

export interface AppointmentWizardProps {
  currentUser: any;
  selectedDate?: Date;
  selectedTime?: string;
  selectedServiceId?: string;
  selectedUserId?: string;
  companyIdOverride?: string;
  trigger?: React.ReactNode;
}

export interface WizardStep {
  id: string;
  title: string;
  icon: typeof Calendar;
}

export interface StepComponentProps {
  currentStep: number;
  steps: WizardStep[];
  appointmentDate?: Date;
  setAppointmentDate: (date: Date | undefined) => void;
  appointmentTime: string;
  setAppointmentTime: (time: string) => void;
  selectedService: string;
  setSelectedService: (service: string) => void;
  selectedStaff: string;
  setSelectedStaff: (staff: string) => void;
  preferredStaff: string[];
  setPreferredStaff: (staff: string[]) => void;
  selectedSpace: string;
  setSelectedSpace: (space: string) => void;
  selectedUser: string;
  setSelectedUser: (user: string) => void;
  notes: string;
  setNotes: (notes: string) => void;
  clientSearchQuery: string;
  setClientSearchQuery: (query: string) => void;
  serviceSearchQuery: string;
  setServiceSearchQuery: (query: string) => void;
  serviceViewMode: "grid" | "list";
  setServiceViewMode: (mode: "grid" | "list") => void;
  spaceSearchQuery: string;
  setSpaceSearchQuery: (query: string) => void;
  spaceViewMode: "grid" | "list";
  setSpaceViewMode: (mode: "grid" | "list") => void;
  isCompanyOwner: boolean;
  companyId?: string;
  companyCurrency: any;
}
