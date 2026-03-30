import { useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { CustomDialog } from "@/components/ui/custom-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { PanelBottom } from "lucide-react";

const schema = yup.object({
  name: yup.string().min(1, "Name is required").max(255).required(),
  isDefault: yup.boolean().required(),
});

export type AddFooterFormValues = {
  name: string;
  isDefault: boolean;
};

interface AddFooterDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: AddFooterFormValues) => void | Promise<void>;
  isSubmitting?: boolean;
}

export const AddFooterDialog = ({
  open,
  onOpenChange,
  onSubmit,
  isSubmitting = false,
}: AddFooterDialogProps) => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AddFooterFormValues>({
    resolver: yupResolver(schema),
    defaultValues: { name: "", isDefault: false },
  });

  const isDefault = watch("isDefault");

  useEffect(() => {
    if (open) {
      reset({ name: "", isDefault: false });
    }
  }, [open, reset]);

  const submit: SubmitHandler<AddFooterFormValues> = async (values) => {
    await onSubmit(values);
  };

  const footer = (
    <>
      <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
        Cancel
      </Button>
      <Button type="submit" form="add-footer-form" variant="accent" disabled={isSubmitting}>
        {isSubmitting ? "Saving…" : "Create"}
      </Button>
    </>
  );

  return (
    <CustomDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add footer"
      description="Create a named footer. You can design it in the visual editor."
      icon={<PanelBottom className="w-5 h-5" />}
      sizeWidth="small"
      sizeHeight="small"
      footer={footer}
    >
      <form id="add-footer-form" className="space-y-4" onSubmit={handleSubmit(submit)}>
        <div className="space-y-2">
          <Label htmlFor="footer-name">Name</Label>
          <Input
            id="footer-name"
            placeholder="Main footer"
            className="bg-[var(--input-background)] border-[var(--glass-border)]"
            {...register("name")}
          />
          {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="footer-default"
            checked={!!isDefault}
            onCheckedChange={(c) => setValue("isDefault", c === true, { shouldDirty: true })}
          />
          <Label htmlFor="footer-default" className="text-sm font-normal cursor-pointer">
            Set as default site footer
          </Label>
        </div>
      </form>
    </CustomDialog>
  );
};
