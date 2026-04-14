import { useEffect } from "react";
import { Edit, Plus, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomDialog } from "@/components/ui/custom-dialog";
import { StockFormFields } from "./StockFormFields";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { CompanyProductStock } from "@/services/companyProductStock";

const stockSchema = yup.object({
  quantity: yup
    .number()
    .typeError("Quantity must be a number")
    .required("Quantity is required")
    .min(1, "Quantity must be at least 1")
    .integer("Quantity must be a whole number")
    .transform((_value, originalValue) => {
      if (originalValue === "" || originalValue == null || originalValue === undefined) {
        return undefined;
      }
      const num = Number(originalValue);
      return isNaN(num) ? undefined : num;
    }),
  costPrice: yup
    .number()
    .typeError("Cost price must be a number")
    .required("Cost price is required")
    .min(0, "Cost price must be 0 or greater")
    .transform((_value, originalValue) => {
      if (originalValue === "" || originalValue == null || originalValue === undefined) {
        return undefined;
      }
      const num = Number(originalValue);
      return isNaN(num) ? undefined : num;
    }),
  sellPrice: yup
    .number()
    .nullable()
    .optional()
    .min(0, "Sell price must be 0 or greater")
    .transform((value) => (value === "" || value === null || value === undefined ? null : value)),
  purchaseDate: yup
    .date()
    .nullable()
    .optional()
    .transform((value, originalValue) => {
      if (originalValue === "" || originalValue == null || originalValue === undefined) {
        return null;
      }
      if (value instanceof Date && !isNaN(value.getTime())) {
        return value;
      }
      if (typeof originalValue === "string") {
        const parsed = new Date(originalValue);
        return isNaN(parsed.getTime()) ? null : parsed;
      }
      return null;
    }),
  expiryDate: yup
    .date()
    .nullable()
    .optional()
    .transform((value, originalValue) => {
      if (originalValue === "" || originalValue == null || originalValue === undefined) {
        return null;
      }
      if (value instanceof Date && !isNaN(value.getTime())) {
        return value;
      }
      if (typeof originalValue === "string") {
        const parsed = new Date(originalValue);
        return isNaN(parsed.getTime()) ? null : parsed;
      }
      return null;
    }),
  supplierId: yup.string().optional().nullable().transform((value) => value || null),
  batchNumber: yup.string().optional().nullable().transform((value) => value || null),
});

type StockFormData = yup.InferType<typeof stockSchema>;

interface AddEditStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "add" | "edit";
  variantName: string;
  editingStockEntry?: CompanyProductStock | null;
  onSubmit: (data: StockFormData) => Promise<void>;
  isSubmitting: boolean;
  users?: any[];
  onUserSelectionDialogOpen: (open: boolean) => void;
  isUserSelectionDialogOpen: boolean;
  title?: string;
  description?: string;
  submitLabel?: string;
}

export const AddEditStockDialog = ({
  open,
  onOpenChange,
  mode,
  variantName,
  editingStockEntry,
  onSubmit,
  isSubmitting,
  users,
  onUserSelectionDialogOpen,
  isUserSelectionDialogOpen,
  title,
  description,
  submitLabel,
}: AddEditStockDialogProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control,
  } = useForm<StockFormData>({
    resolver: yupResolver(stockSchema) as any,
    defaultValues: {
      quantity: undefined,
      costPrice: undefined,
      sellPrice: null,
      purchaseDate: null,
      expiryDate: null,
      supplierId: null,
      batchNumber: null,
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && editingStockEntry) {
      reset({
        quantity: editingStockEntry.quantity,
        costPrice: editingStockEntry.costPrice,
        sellPrice: editingStockEntry.sellPrice || null,
        purchaseDate: editingStockEntry.purchaseDate ? new Date(editingStockEntry.purchaseDate) : null,
        expiryDate: editingStockEntry.expiryDate ? new Date(editingStockEntry.expiryDate) : null,
        supplierId: editingStockEntry.supplierId || null,
        batchNumber: editingStockEntry.batchNumber || null,
      });
      return;
    }

    reset({
      quantity: undefined,
      costPrice: undefined,
      sellPrice: null,
      purchaseDate: null,
      expiryDate: null,
      supplierId: null,
      batchNumber: null,
    });
  }, [open, mode, editingStockEntry, reset]);

  const handleFormSubmit = async (data: StockFormData) => {
    await onSubmit(data);
    reset();
  };

  const dialogTitle = title || (mode === "add" ? "Add Stock Entry" : "Edit Stock Entry");
  const dialogDescription =
    description ||
    (mode === "add"
      ? `Add a new stock entry for ${variantName}. Each stock entry can have different pricing and supplier information.`
      : `Update stock entry information for ${variantName}.`);
  const dialogSubmitLabel = submitLabel || (mode === "add" ? "Add Stock" : "Update Stock");
  const submittingLabel = mode === "add" ? "Adding..." : "Updating...";
  const formId = mode === "add" ? "add-stock-form" : "edit-stock-form";

  return (
    <CustomDialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) {
          reset();
        }
      }}
      title={dialogTitle}
      icon={mode === "add" ? <Plus className="w-5 h-5" /> : <Edit className="w-5 h-5" />}
      description={dialogDescription}
      sizeWidth="small"
      sizeHeight="medium"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            size="default"
            onClick={() => {
              onOpenChange(false);
              reset();
            }}
            disabled={isSubmitting}
            className="h-10 px-4 border-[var(--glass-border)] text-foreground hover:bg-accent"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form={formId}
            variant="accent"
            size="default"
            disabled={isSubmitting}
            className="h-10 px-4"
          >
            <Save className="w-4 h-4 mr-2" />
            {isSubmitting ? submittingLabel : dialogSubmitLabel}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <StockFormFields
          register={register}
          control={control}
          errors={errors}
          users={users}
          isUserSelectionDialogOpen={isUserSelectionDialogOpen}
          onUserSelectionDialogOpen={onUserSelectionDialogOpen}
          formId={mode === "edit" ? "edit-" : ""}
        />
      </form>
    </CustomDialog>
  );
};

