import { ClipboardList } from 'lucide-react';
import { CustomDialog } from '@/components/ui/custom-dialog';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/common/EmptyState';
import type { CompanyCustomForm } from '@/features/customForms/services/companyCustomForms';

interface SelectCustomFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  forms: CompanyCustomForm[];
  loading?: boolean;
  onSelect: (form: CompanyCustomForm) => void;
}

export const SelectCustomFormDialog = ({
  open,
  onOpenChange,
  forms,
  loading,
  onSelect,
}: SelectCustomFormDialogProps) => (
  <CustomDialog
    open={open}
    onOpenChange={onOpenChange}
    title="Select form"
    description="Choose a form to fill for this appointment."
    icon={<ClipboardList className="w-5 h-5" />}
    footer={
      <Button
        type="button"
        variant="outline"
        className="h-10 px-4 border-[var(--glass-border)]"
        onClick={() => onOpenChange(false)}
      >
        Cancel
      </Button>
    }
  >
    {loading ? (
      <p className="text-sm text-muted-foreground py-8 text-center">Loading forms...</p>
    ) : forms.length === 0 ? (
      <EmptyState
        icon={ClipboardList}
        title="No active forms"
        description="Create and activate custom forms in Company Settings → Manage forms."
        className="!p-6 border-0 shadow-none bg-transparent"
      />
    ) : (
      <div className="space-y-2 max-h-[50vh] overflow-y-auto">
        {forms.map((form) => (
          <button
            key={form.id}
            type="button"
            className="w-full text-left p-4 rounded-lg border border-[var(--glass-border)] hover:bg-accent/50 transition-colors"
            onClick={() => {
              onSelect(form);
              onOpenChange(false);
            }}
          >
            <p className="font-medium text-foreground">{form.name}</p>
            {form.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{form.description}</p>
            )}
          </button>
        ))}
      </div>
    )}
  </CustomDialog>
);
