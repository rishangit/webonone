import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { AlertCircle } from "lucide-react";
import { VariantForm } from "./VariantForm";
import { SystemProductVariantSelector } from "./SystemProductVariantSelector";
import { ProductVariant as SystemProductVariant } from "../../services/productVariants";
import { CompanyProductVariant } from "../../services/companyProductVariants";
import { variantSchema, VariantFormData } from "../../schemas/variantValidation";

interface VariantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'add' | 'edit' | 'view';
  variant?: CompanyProductVariant | null;
  systemProductId?: string | null;
  variantMode?: 'system' | 'company'; // Whether this is for system products or company products
  onSave?: (variantData: VariantFormData) => Promise<void>;
  onCancel?: () => void;
}

export const VariantDialog = ({
  open,
  onOpenChange,
  mode,
  variant,
  systemProductId,
  variantMode = 'company',
  onSave,
  onCancel
}: VariantDialogProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    control,
    watch,
    setValue
  } = useForm<VariantFormData>({
    resolver: yupResolver(variantSchema),
    defaultValues: {
      name: '',
      sku: '',
      color: '',
      size: '',
      sizeUnit: 'ml',
      weight: '',
      weightUnit: 'g',
      material: '',
      type: 'service',
      isDefault: false,
      systemProductVariantId: undefined
    },
    mode: 'onBlur'
  });

  // Initialize form data when dialog opens or variant changes
  useEffect(() => {
    if (open) {
      if (mode === 'edit' || mode === 'view') {
        if (variant) {
          // Parse size and weight from variant
          const sizeMatch = variant.size?.match(/^(\d+)(ml|L)$/i);
          const weightMatch = variant.weight?.match(/^(\d+)(mg|g|kg)$/i);
          
          reset({
            name: variant.name || '',
            sku: variant.sku || '',
            color: variant.color || '',
            size: sizeMatch ? sizeMatch[1] : variant.size || '',
            sizeUnit: sizeMatch?.[2]?.toLowerCase() === 'l' ? 'L' : 'ml',
            weight: weightMatch ? weightMatch[1] : variant.weight || '',
            weightUnit: weightMatch?.[2]?.toLowerCase() === 'kg' ? 'kg' : 
                       weightMatch?.[2]?.toLowerCase() === 'mg' ? 'mg' : 'g',
            material: variant.material || '',
            type: variant.type || 'service',
            isDefault: variant.isDefault || false,
            systemProductVariantId: variant.systemProductVariantId
          });
        }
      } else {
        // Reset for add mode
        reset({
          name: '',
          sku: '',
          color: '',
          size: '',
          sizeUnit: 'ml',
          weight: '',
          weightUnit: 'g',
          material: '',
          type: 'service',
          isDefault: false,
          systemProductVariantId: undefined
        });
      }
    }
  }, [open, mode, variant, reset]);

  const onSubmit = async (data: VariantFormData) => {
    if (mode === 'view' || !onSave) return;
    
    try {
      await onSave(data);
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving variant:', error);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onOpenChange(false);
  };

  const isReadOnly = mode === 'view';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[var(--glass-bg)] border-[var(--glass-border)] backdrop-blur-xl max-w-3xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-[var(--glass-border)]">
          <DialogTitle className="text-foreground text-lg font-semibold">
            {mode === 'add' ? 'Add New Variant' : mode === 'edit' ? 'Edit Variant' : 'View Variant'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm mt-1.5">
            {mode === 'add' 
              ? 'Add a new variant to this product. Pricing and stock are managed separately in the Stock Details page.'
              : mode === 'edit'
              ? 'Edit variant details. Pricing and stock are managed separately in the Stock Details page.'
              : 'View variant details. Pricing and stock are managed separately in the Stock Details page.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 px-6 py-4">
          <form onSubmit={handleSubmit(onSubmit)} id="variant-form" className="space-y-6">
            {/* System Product Variant Selector - Only show for add mode with system product */}
            {mode === 'add' && systemProductId && (
              <div className="space-y-2">
                <Label htmlFor="system-variant-selector" className="text-foreground">
                  Select System Product Variant <span className="text-red-500">*</span>
                </Label>
                <SystemProductVariantSelector
                  productId={systemProductId}
                  value={watch('systemProductVariantId') || null}
                  onChange={(variantId, systemVariant) => {
                    if (systemVariant) {
                      // Parse size and weight from system variant
                      const sizeMatch = systemVariant.size?.match(/^(\d+)(ml|L)$/i);
                      const weightMatch = systemVariant.weight?.match(/^(\d+)(mg|g|kg)$/i);
                      
                      // Populate variant details from system variant
                      setValue('systemProductVariantId', variantId || undefined);
                      setValue('name', systemVariant.name);
                      setValue('color', systemVariant.color || '');
                      setValue('size', sizeMatch ? sizeMatch[1] : '');
                      setValue('sizeUnit', sizeMatch?.[2]?.toLowerCase() === 'l' ? 'L' : 'ml');
                      setValue('weight', weightMatch ? weightMatch[1] : '');
                      setValue('weightUnit', weightMatch?.[2]?.toLowerCase() === 'kg' ? 'kg' : 
                               weightMatch?.[2]?.toLowerCase() === 'mg' ? 'mg' : 'g');
                      setValue('material', systemVariant.material || '');
                    } else {
                      // Clear system variant and reset variant details
                      setValue('systemProductVariantId', undefined);
                      setValue('name', '');
                      setValue('color', '');
                      setValue('size', '');
                      setValue('sizeUnit', 'ml');
                      setValue('weight', '');
                      setValue('weightUnit', 'g');
                      setValue('material', '');
                    }
                  }}
                  className="mt-1"
                  placeholder="Select a variant from system product..."
                />
                {mode === 'add' && systemProductId && !watch('systemProductVariantId') && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Please select a system product variant to add to this product. Variant details will be populated automatically from the selected system variant. If you need to add a new system variant, use the "Add New Variant" button in the dropdown.
                  </p>
                )}
                {mode === 'add' && systemProductId && watch('systemProductVariantId') && watch('name') && (
                  <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                    <p className="text-sm text-blue-600 dark:text-blue-400">
                      <strong>Selected:</strong> {watch('name')}
                      {watch('color') && ` - ${watch('color')}`}
                      {watch('size') && ` (${watch('size')}${watch('sizeUnit') || 'ml'})`}
                    </p>
                    <p className="text-xs text-blue-500/80 dark:text-blue-300/80 mt-1">
                      Variant details are populated from the system product. You can configure the product type and set it as default below.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* System Product Variant Display - Show for edit/view mode with system product */}
            {(mode === 'edit' || mode === 'view') && systemProductId && variant?.systemProductVariantId && (
              <div className="space-y-2">
                <Label htmlFor="system-variant-display" className="text-foreground">
                  System Product Variant {mode === 'edit' && (
                    <span className="text-muted-foreground text-xs font-normal ml-1">(Read-only)</span>
                  )}
                </Label>
                <SystemProductVariantSelector
                  productId={systemProductId}
                  value={variant.systemProductVariantId || null}
                  onChange={() => {}} // Read-only
                  disabled={true}
                  className="mt-1"
                  placeholder="System variant (cannot be changed)"
                />
              </div>
            )}

            {/* System Product Variant Display - Show for view mode even if no system variant (for custom products) */}
            {mode === 'view' && systemProductId && !variant?.systemProductVariantId && (
              <div className="space-y-2">
                <Label htmlFor="system-variant-display" className="text-foreground">System Product Variant</Label>
                <div className="p-2.5 text-muted-foreground bg-[var(--input-background)] border border-[var(--glass-border)] rounded-md">
                  Custom variant (not linked to system product)
                </div>
              </div>
            )}

            <VariantForm
              register={register}
              control={control}
              errors={errors}
              watch={watch}
              setValue={setValue}
              showDefaultCheckbox={true}
              skuLabel="SKU * (Auto-generated)"
              mode={variantMode}
              hideVariantDetails={mode === 'add' && !!systemProductId}
              hideSku={variantMode === 'system' ? false : true}
              readOnly={isReadOnly}
              systemProductId={systemProductId}
              variant={variant || (mode === 'add' && watch('systemProductVariantId') ? { 
                systemProductVariantId: watch('systemProductVariantId') 
              } as CompanyProductVariant : null)}
            />
          </form>
        </div>

        <DialogFooter className="px-6 pb-6 pt-4 border-t border-[var(--glass-border)]">
          {mode !== 'view' && (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
                className="border-[var(--glass-border)] bg-[var(--input-background)] hover:bg-[var(--accent-bg)] hover:border-[var(--accent-border)] hover:text-[var(--accent-text)] text-foreground transition-all duration-200"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                form="variant-form"
                disabled={isSubmitting}
                variant="accent"
                className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:from-[var(--accent-primary-hover)] hover:to-[var(--accent-primary)] text-[var(--accent-button-text)] shadow-lg shadow-[var(--accent-primary)]/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isSubmitting ? 'Saving...' : mode === 'add' ? 'Add Variant' : 'Save Changes'}
              </Button>
            </>
          )}
          {mode === 'view' && (
            <Button
              type="button"
              onClick={handleCancel}
              variant="accent"
              className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:from-[var(--accent-primary-hover)] hover:to-[var(--accent-primary)] text-[var(--accent-button-text)] shadow-lg shadow-[var(--accent-primary)]/25 transition-all duration-200"
            >
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

