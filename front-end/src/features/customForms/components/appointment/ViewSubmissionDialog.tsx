import { ClipboardList } from 'lucide-react';
import { CustomDialog } from '@/components/ui/custom-dialog';
import { Button } from '@/components/ui/button';
import type { CompanyCustomFormSubmission } from '@/features/customForms/services/companyCustomFormSubmissions';
import type { CompanyCustomForm } from '@/features/customForms/services/companyCustomForms';
import { FormFieldsRenderer } from '@/features/customForms/pages/FormBuilder/components/FormFieldsRenderer';

interface ViewSubmissionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  submission: CompanyCustomFormSubmission | null;
  form: CompanyCustomForm | null;
}

export const ViewSubmissionDialog = ({
  open,
  onOpenChange,
  submission,
  form,
}: ViewSubmissionDialogProps) => {
  if (!submission) return null;

  return (
    <CustomDialog
      open={open}
      onOpenChange={onOpenChange}
      title={submission.formName || form?.name || 'Form submission'}
      description={
        submission.createdAt
          ? `Submitted ${new Date(submission.createdAt).toLocaleString()}${submission.submittedByName ? ` by ${submission.submittedByName}` : ''}`
          : undefined
      }
      icon={<ClipboardList className="w-5 h-5" />}
      sizeWidth="large"
      footer={
        <Button
          type="button"
          variant="outline"
          className="h-10 px-4 border-[var(--glass-border)]"
          onClick={() => onOpenChange(false)}
        >
          Close
        </Button>
      }
    >
      {form ? (
        <FormFieldsRenderer
          fields={form.definition.fields}
          context="fill"
          values={submission.values}
          disabled
        />
      ) : (
        <pre className="text-xs bg-muted/30 p-3 rounded overflow-auto">
          {JSON.stringify(submission.values, null, 2)}
        </pre>
      )}
    </CustomDialog>
  );
};
