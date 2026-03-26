import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CustomDialog } from "@/components/ui/custom-dialog";
import { StockFormFields } from "./StockFormFields";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const addStockSchema = yup.object({
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

type AddStockFormData = yup.InferType<typeof addStockSchema>;

interface AddStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variantName: string;
  onSubmit: (data: AddStockFormData) => Promise<void>;
  isSubmitting: boolean;
  users?: any[];
  onUserSelectionDialogOpen: () => void;
  isUserSelectionDialogOpen: boolean;
}

export const AddStockDialog = ({
  open,
  onOpenChange,
  variantName,
  onSubmit,
  isSubmitting,
  users,
  onUserSelectionDialogOpen,
  isUserSelectionDialogOpen,
}: AddStockDialogProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    control
  } = useForm<AddStockFormData>({
    resolver: yupResolver(addStockSchema) as any,
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

  const handleFormSubmit = async (data: AddStockFormData) => {
    await onSubmit(data);
    reset();
  };

  return (
    <CustomDialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) {
          reset();
        }
      }}
      customHeader={
        <div className="flex items-center gap-2">
          <Plus className="w-5 h-5 text-[var(--accent-primary)]" />
          <span>Add Stock Entry</span>
        </div>
      }
      description={`Add a new stock entry for ${variantName}. Each stock entry can have different pricing and supplier information.`}
      className="bg-[var(--glass-bg)] border-[var(--accent-border)]/30 backdrop-blur-xl max-w-2xl max-h-[90vh] overflow-y-auto"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              reset();
            }}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="add-stock-form"
            variant="accent"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding..." : "Add Stock"}
          </Button>
        </>
      }
    >
      <form id="add-stock-form" onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <StockFormFields
          register={register}
          control={control}
          errors={errors}
          users={users}
          isUserSelectionDialogOpen={isUserSelectionDialogOpen}
          onUserSelectionDialogOpen={onUserSelectionDialogOpen}
        />
      </form>
    </CustomDialog>
  );
};
