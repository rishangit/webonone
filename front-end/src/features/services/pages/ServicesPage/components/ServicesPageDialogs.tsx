import type { CreateServiceData, Service as ServiceType } from "@/features/services/services";
import type { CreateSystemServiceData, SystemService } from "@/features/services/services/systemServices";
import type { CompanyProduct } from "@/shared/services/products-company-public";
import { ServiceWizardDialog, SelectSystemServiceDialog, SystemServiceWizardDialog } from "@/features/services/components";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export interface ServicesPageDialogsProps {
  isDeleteDialogOpen: boolean;
  onDeleteDialogOpenChange: (open: boolean) => void;
  selectedService: ServiceType | null;
  onConfirmDelete: () => void;
  companyScopeId: string | undefined;
  isCompanyWizardOpen: boolean;
  onCompanyWizardOpenChange: (open: boolean) => void;
  wizardService: ServiceType | null;
  companyProducts: CompanyProduct[];
  selectedSystemCatalog: SystemService | null;
  companyWizardInitialStep?: number;
  onCompanyWizardSave: (payload: CreateServiceData) => void;
  isSystemCatalogWizardOpen: boolean;
  onSystemCatalogWizardOpenChange: (open: boolean) => void;
  onSystemCatalogWizardSave: (payload: CreateSystemServiceData) => void;
  systemPickerOpen: boolean;
  onSystemPickerOpenChange: (open: boolean) => void;
  onSystemPickerSelect: (service: SystemService) => void;
  catalogRefreshKey: number;
  nestedSystemWizardOpen: boolean;
  onNestedSystemWizardOpenChange: (open: boolean) => void;
  onNestedSystemWizardSave: (payload: CreateSystemServiceData) => void;
}

export function ServicesPageDialogs({
  isDeleteDialogOpen,
  onDeleteDialogOpenChange,
  selectedService,
  onConfirmDelete,
  companyScopeId,
  isCompanyWizardOpen,
  onCompanyWizardOpenChange,
  wizardService,
  companyProducts,
  selectedSystemCatalog,
  companyWizardInitialStep = 0,
  onCompanyWizardSave,
  isSystemCatalogWizardOpen,
  onSystemCatalogWizardOpenChange,
  onSystemCatalogWizardSave,
  systemPickerOpen,
  onSystemPickerOpenChange,
  onSystemPickerSelect,
  catalogRefreshKey,
  nestedSystemWizardOpen,
  onNestedSystemWizardOpenChange,
  onNestedSystemWizardSave,
}: ServicesPageDialogsProps) {
  return (
    <>
      <SelectSystemServiceDialog
        open={systemPickerOpen}
        onOpenChange={onSystemPickerOpenChange}
        onSelectService={onSystemPickerSelect}
        onRequestCreateCatalog={() => onNestedSystemWizardOpenChange(true)}
        catalogRefreshKey={catalogRefreshKey}
      />

      <SystemServiceWizardDialog
        open={nestedSystemWizardOpen}
        onOpenChange={onNestedSystemWizardOpenChange}
        mode="create"
        initialService={null}
        onSave={onNestedSystemWizardSave}
      />

      {companyScopeId && (
        <ServiceWizardDialog
          catalog="company"
          open={isCompanyWizardOpen}
          onOpenChange={onCompanyWizardOpenChange}
          title={wizardService ? "Edit Service Wizard" : "Create Service Wizard"}
          companyId={companyScopeId}
          availableProducts={companyProducts}
          initialService={wizardService}
          selectedSystemCatalog={wizardService ? null : selectedSystemCatalog}
          initialStepIndex={companyWizardInitialStep}
          onSave={onCompanyWizardSave}
        />
      )}

      <ServiceWizardDialog
        catalog="system"
        open={isSystemCatalogWizardOpen}
        onOpenChange={onSystemCatalogWizardOpenChange}
        title="Create System Service"
        mode="create"
        initialSystemService={null}
        onSave={onSystemCatalogWizardSave}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={onDeleteDialogOpenChange}>
        <AlertDialogContent className="bg-[var(--glass-bg)] border-[var(--glass-border)] backdrop-blur-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Service</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete &quot;{selectedService?.name}&quot;? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[var(--glass-border)] text-foreground hover:bg-accent">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={onConfirmDelete} className="bg-red-500 hover:bg-red-600 text-white">
              Delete Service
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
