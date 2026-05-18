import { useEffect } from "react";
import { toast } from "sonner";
import { useAppSelector } from "@/store/hooks";
import { UserRole, isRole } from "@/shared/types/user";
import { CompanyServiceWizard } from "./CompanyServiceWizard";
import { SystemCatalogWizard } from "./SystemCatalogWizard";
import type { ServiceWizardDialogProps } from "./types";

export function ServiceWizardDialog(props: ServiceWizardDialogProps) {
  const { user } = useAppSelector((state) => state.auth);
  const canManageSystemCatalog = isRole(user?.role, UserRole.SYSTEM_ADMIN);
  const { open, onOpenChange, catalog } = props;

  useEffect(() => {
    if (!open) return;
    if (catalog === "system" && !canManageSystemCatalog) {
      toast.error("You do not have permission to manage system services.");
      onOpenChange(false);
    }
  }, [open, catalog, canManageSystemCatalog, onOpenChange]);

  if (catalog === "system" && !canManageSystemCatalog) {
    return null;
  }

  if (catalog === "company") {
    return <CompanyServiceWizard {...props} />;
  }

  return <SystemCatalogWizard {...props} />;
}
