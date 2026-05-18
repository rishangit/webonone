import type { CreateSystemServiceData, SystemService } from "@/features/services/services/systemServices";
import { ServiceWizardDialog } from "./ServiceWizard";

export type SystemServiceWizardDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initialService?: SystemService | null;
  initialStepIndex?: number;
  onSave: (payload: CreateSystemServiceData) => void;
};

/** System catalog wizard — implemented via {@link ServiceWizardDialog} (`catalog: "system"`) with role checks inside. */
export function SystemServiceWizardDialog({ mode, initialService, initialStepIndex, ...rest }: SystemServiceWizardDialogProps) {
  const title = mode === "edit" ? "Edit System Service" : "Create System Service";

  return (
    <ServiceWizardDialog
      {...rest}
      catalog="system"
      mode={mode}
      title={title}
      initialSystemService={initialService ?? null}
      initialStepIndex={initialStepIndex}
    />
  );
}
