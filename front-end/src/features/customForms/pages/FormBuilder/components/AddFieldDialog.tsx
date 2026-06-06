import { CustomDialog } from '@/components/ui/custom-dialog';
import { Button } from '@/components/ui/button';
import { getFieldModules } from '../fields/registry';
import type { FormFieldType } from '@/features/customForms/types';

interface AddFieldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (type: FormFieldType) => void;
}

export const AddFieldDialog = ({ open, onOpenChange, onSelect }: AddFieldDialogProps) => (
  <CustomDialog
    open={open}
    onOpenChange={onOpenChange}
    title="Add field"
    description="Choose a field type to add to the form canvas."
    footer={
      <Button type="button" variant="outline" className="h-10 px-4 border-[var(--glass-border)]" onClick={() => onOpenChange(false)}>
        Cancel
      </Button>
    }
  >
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {getFieldModules().map((mod) => (
        <button
          key={mod.type}
          type="button"
          className="text-left p-4 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] hover:bg-accent/50 transition-colors"
          onClick={() => {
            onSelect(mod.type);
            onOpenChange(false);
          }}
        >
          <p className="font-medium text-foreground">{mod.label}</p>
          <p className="text-sm text-muted-foreground mt-1">{mod.description}</p>
        </button>
      ))}
    </div>
  </CustomDialog>
);
