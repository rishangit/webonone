import { FileText, Image, Package, SlidersHorizontal } from "lucide-react";
import type { ServiceWizardStep } from "./types";

export function getCompanyWizardSteps(): ServiceWizardStep[] {
  return [
    { id: "company-basic", title: "Basics", icon: FileText },
    { id: "company-images", title: "Images", icon: Image },
    { id: "company-products", title: "Products & pricing", icon: Package },
  ];
}

export function getSystemCatalogWizardSteps(): ServiceWizardStep[] {
  return [
    { id: "system-basic", title: "Basics", icon: FileText },
    { id: "system-images", title: "Images", icon: Image },
    { id: "system-defaults", title: "Schedule & status", icon: SlidersHorizontal },
  ];
}
