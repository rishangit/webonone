import type { LucideIcon } from "lucide-react";
import type { Service, CreateServiceData } from "@/features/services/services";
import type { CompanyProduct } from "@/features/products/services/productApi";
import type { CreateSystemServiceData, SystemService } from "@/features/services/services/systemServices";

export interface ServiceWizardStep {
  id: string;
  title: string;
  icon: LucideIcon;
}

/** Wizard-state row for the products linked to a service in step 3. `discount` is in-wizard UI state (0–100). */
export type DefaultProductRow = { companyProductId: string; quantity: number; discount?: number };

export type CompanyWizardProps = {
  catalog: "company";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  companyId: string;
  availableProducts: CompanyProduct[];
  initialService?: Service | null;
  /** Prefill from catalog when creating from the system-service picker. */
  selectedSystemCatalog?: SystemService | null;
  /** Open wizard on a specific step (e.g. detail page “Edit gallery”). */
  initialStepIndex?: number;
  onSave: (payload: CreateServiceData) => void;
};

export type SystemWizardProps = {
  catalog: "system";
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  mode: "create" | "edit";
  initialSystemService?: SystemService | null;
  initialStepIndex?: number;
  onSave: (payload: CreateSystemServiceData) => void;
};

export type ServiceWizardDialogProps = CompanyWizardProps | SystemWizardProps;
