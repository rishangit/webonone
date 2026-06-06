import type { AppointmentHistoryItem } from "@/features/appointments/services/appointmentHistory";

export interface UserHistoryLineItem {
  name?: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
  unit?: string;
}

export interface TransformedUserHistoryRecord extends AppointmentHistoryItem {
  recordId: string;
  appointmentId: string | null;
  saleDate: Date;
  serviceItems: UserHistoryLineItem[];
  productItems: UserHistoryLineItem[];
  itemCount: number;
}

export interface UserHistoryProfileData {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  firstName?: string;
  lastName?: string;
  joinDate: string;
  createdAt?: string;
}
