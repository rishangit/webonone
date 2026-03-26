import { Plus } from "lucide-react";
import { CustomDialog } from "@/components/ui/custom-dialog";
import { Button } from "@/components/ui/button";
import { getAddonModules } from "../registry";
import { ContentAddon } from "../../types";

interface AddAddonDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contentElementId: string;
  companyId?: string;
  onAddonAdded: (addon: ContentAddon) => void;
}

export const AddAddonDialog = ({
  open,
  onOpenChange,
  contentElementId,
  companyId,
  onAddonAdded,
}: AddAddonDialogProps) => {
  const modules = getAddonModules();

  return (
    <CustomDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add addon"
      description="Select an addon module to attach to this content element."
      icon={<Plus className="w-5 h-5" />}
      sizeWidth="medium"
      sizeHeight="medium"
    >
      <div className="space-y-3">
        {modules.map((module) => (
          <button
            key={module.type}
            type="button"
            onClick={() => {
              const addon = module.createDefaultAddon({ companyId, contentElementId });
              onAddonAdded(addon);
              onOpenChange(false);
            }}
            className="w-full rounded-md border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4 text-left transition-colors hover:border-[var(--accent-primary)]/60 hover:bg-[var(--accent-bg)]"
          >
            <p className="text-sm font-semibold text-foreground">{module.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{module.description}</p>
          </button>
        ))}
        <div className="flex justify-end pt-1">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </div>
    </CustomDialog>
  );
};
