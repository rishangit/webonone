import { Plus, Library } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ServicesPageHeaderProps {
  isSuperAdmin: boolean;
  onAddCompanyService?: () => void;
  onAddSystemService?: () => void;
}

export function ServicesPageHeader({ isSuperAdmin, onAddCompanyService, onAddSystemService }: ServicesPageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Services</h1>
        <p className="text-muted-foreground mt-1">Manage your service offerings and appointments</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {isSuperAdmin && onAddSystemService && (
          <Button onClick={onAddSystemService} variant="accent">
            <Library className="w-4 h-4 mr-2" />
            Add system service
          </Button>
        )}
        {!isSuperAdmin && onAddCompanyService && (
          <Button onClick={onAddCompanyService} variant="accent">
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        )}
      </div>
    </div>
  );
}
