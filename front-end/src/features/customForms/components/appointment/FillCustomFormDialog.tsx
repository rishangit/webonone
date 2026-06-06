import { useEffect, useState } from 'react';
import { ClipboardList, Save } from 'lucide-react';
import { CustomDialog } from '@/components/ui/custom-dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { CompanyCustomForm } from '@/features/customForms/services/companyCustomForms';
import type { FormFieldValues } from '@/features/customForms/types';
import { FormFieldsRenderer } from '@/features/customForms/pages/FormBuilder/components/FormFieldsRenderer';
import { validateFormValues } from '@/features/customForms/utils/validateFormValues';
import { companyCustomFormSubmissionsService } from '@/features/customForms/services/companyCustomFormSubmissions';

interface FillCustomFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: CompanyCustomForm | null;
  companyId: string;
  appointmentId: string;
  clientId?: string | null;
  onSaved: () => void;
}

export const FillCustomFormDialog = ({
  open,
  onOpenChange,
  form,
  companyId,
  appointmentId,
  clientId,
  onSaved,
}: FillCustomFormDialogProps) => {
  const [values, setValues] = useState<FormFieldValues>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setValues({});
      setErrors({});
    }
  }, [open, form?.id]);

  const handleSave = async () => {
    if (!form) return;
    const fieldErrors = validateFormValues(form.definition.fields, values);
    if (Object.keys(fieldErrors).length > 0) {
      setErrors(fieldErrors);
      toast.error('Please fix validation errors');
      return;
    }
    setSaving(true);
    try {
      await companyCustomFormSubmissionsService.createSubmission({
        companyId,
        formId: form.id,
        appointmentId,
        clientId: clientId ?? null,
        values,
      });
      toast.success('Form saved');
      onSaved();
      onOpenChange(false);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to save form');
    } finally {
      setSaving(false);
    }
  };

  if (!form) return null;

  return (
    <CustomDialog
      open={open}
      onOpenChange={onOpenChange}
      title={form.name}
      description="Fill in the form fields below."
      icon={<ClipboardList className="w-5 h-5" />}
      sizeWidth="large"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            className="h-10 px-4 border-[var(--glass-border)]"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" variant="accent" className="h-10" disabled={saving} onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <FormFieldsRenderer
          fields={form.definition.fields}
          context="fill"
          rowHeightPx={form.definition.canvas?.rowHeightPx ?? 60}
          values={values}
          onValueChange={(fieldId, value) => {
            setValues((prev) => ({ ...prev, [fieldId]: value }));
            setErrors((prev) => {
              const next = { ...prev };
              delete next[fieldId];
              return next;
            });
          }}
        />
        {Object.keys(errors).length > 0 && (
          <p className="text-sm text-destructive">Some fields need attention before saving.</p>
        )}
      </div>
    </CustomDialog>
  );
};
