import { useEffect } from 'react';
import { ClipboardList, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { CustomDialog } from '@/components/ui/custom-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { CompanyCustomForm } from '@/features/customForms/services/companyCustomForms';

const schema = yup.object({
  name: yup.string().required('Form name is required'),
  description: yup.string().optional(),
  isActive: yup.boolean().optional(),
});

type FormData = yup.InferType<typeof schema>;

interface CustomFormMetaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form?: CompanyCustomForm | null;
  onSubmit: (data: FormData) => void;
  loading?: boolean;
}

export const CustomFormMetaDialog = ({
  open,
  onOpenChange,
  form,
  onSubmit,
  loading = false,
}: CustomFormMetaDialogProps) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: yupResolver(schema) as any,
    defaultValues: { name: '', description: '', isActive: true },
  });

  const isActive = !!watch('isActive');

  useEffect(() => {
    if (open) {
      reset({
        name: form?.name ?? '',
        description: form?.description ?? '',
        isActive: form?.isActive ?? true,
      });
    }
  }, [open, form, reset]);

  return (
    <CustomDialog
      open={open}
      onOpenChange={onOpenChange}
      title={form ? 'Edit form details' : 'Create custom form'}
      description="Name and status for this form template."
      icon={<ClipboardList className="w-5 h-5" />}
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
          <Button
            type="button"
            variant="accent"
            className="h-10"
            disabled={loading}
            onClick={handleSubmit(onSubmit)}
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="form-name">Name</Label>
          <Input
            id="form-name"
            className="mt-1 bg-[var(--input-background)] border-[var(--glass-border)]"
            {...register('name')}
          />
          {errors.name && (
            <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="form-description">Description</Label>
          <Textarea
            id="form-description"
            className="mt-1 bg-[var(--input-background)] border-[var(--glass-border)]"
            rows={3}
            {...register('description')}
          />
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="form-active"
            checked={isActive}
            onCheckedChange={(v) => setValue('isActive', Boolean(v))}
          />
          <Label htmlFor="form-active">Active (available when filling on appointments)</Label>
        </div>
      </div>
    </CustomDialog>
  );
};
