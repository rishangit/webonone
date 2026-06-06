import { DeleteConfirmationDialog } from '@/components/common/DeleteConfirmationDialog';
import { CompanyCustomForm } from '@/features/customForms/services/companyCustomForms';

interface CustomFormDeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: CompanyCustomForm | null;
  onConfirm: () => void;
}

export const CustomFormDeleteDialog = ({
  open,
  onOpenChange,
  form,
  onConfirm,
}: CustomFormDeleteDialogProps) => (
  <DeleteConfirmationDialog
    open={open}
    onOpenChange={onOpenChange}
    title="Delete custom form"
    description={
      form
        ? `Are you sure you want to delete "${form.name}"? Submissions linked to this form may be affected.`
        : undefined
    }
    onConfirm={onConfirm}
  />
);
