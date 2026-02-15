import { Controller, UseFormRegister, Control, FieldErrors, UseFormWatch, UseFormSetValue } from "react-hook-form";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { AlertCircle } from "lucide-react";
import { VariantFormData } from "../../schemas/variantValidation";
import { CompanyProductVariant } from "../../services/companyProductVariants";

interface VariantFormProps {
  // React Hook Form props (optional - for use with react-hook-form)
  register?: UseFormRegister<VariantFormData>;
  control?: Control<VariantFormData>;
  errors?: FieldErrors<VariantFormData>;
  watch?: UseFormWatch<VariantFormData>;
  setValue?: UseFormSetValue<VariantFormData>;
  // Controlled component props (optional - for use without react-hook-form)
  variant?: VariantFormData | CompanyProductVariant | null;
  onChange?: (field: keyof VariantFormData, value: any) => void;
  onDefaultChange?: (isDefault: boolean) => void;
  showDefaultCheckbox?: boolean;
  skuLabel?: string;
  showDescription?: boolean;
  description?: string;
  onDescriptionChange?: (description: string) => void;
  showNotes?: boolean;
  notes?: string;
  onNotesChange?: (notes: string) => void;
  mode?: 'system' | 'company';
  hideVariantDetails?: boolean;
  hideSku?: boolean;
  readOnly?: boolean;
  systemProductId?: string | null;
}

export const VariantForm = ({
  register,
  control,
  errors,
  watch,
  setValue,
  variant: variantProp,
  onChange,
  onDefaultChange,
  showDefaultCheckbox = true,
  skuLabel = "SKU *",
  showDescription = false,
  description = "",
  onDescriptionChange,
  showNotes = false,
  notes = "",
  onNotesChange,
  mode = 'company',
  hideVariantDetails = false,
  hideSku = false,
  readOnly = false,
  systemProductId,
}: VariantFormProps) => {
  const isSystemMode = mode === 'system';
  
  // Determine if we're using react-hook-form or controlled component pattern
  const isReactHookFormMode = !!watch && !!register && !!control && !!setValue;
  
  // Helper function to get field value
  const getFieldValue = (fieldName: keyof VariantFormData): any => {
    if (isReactHookFormMode) {
      return watch!(fieldName);
    }
    return (variantProp as VariantFormData)?.[fieldName] ?? '';
  };
  
  // Helper function to handle field change
  const handleFieldChange = (fieldName: keyof VariantFormData, value: any) => {
    if (isReactHookFormMode) {
      setValue!(fieldName, value);
    } else if (onChange) {
      onChange(fieldName, value);
    }
  };
  
  // Get isDefault value based on the pattern being used
  const isDefault = isReactHookFormMode 
    ? watch!('isDefault') 
    : (variantProp as VariantFormData)?.isDefault || false;
  
  const isSystemVariant = systemProductId && (variantProp as CompanyProductVariant)?.systemProductVariantId;
  // Only disable fields if in view mode (read-only) or if it's a system variant in add mode
  // In edit mode, allow editing even for system variants
  const shouldDisableFields = readOnly;

  return (
    <div className="space-y-4">
      {!hideVariantDetails && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground">Variant Name <span className="text-red-500">*</span></Label>
            <Input
              id="name"
              {...(register ? register('name') : {})}
              value={isReactHookFormMode ? undefined : getFieldValue('name')}
              onChange={(e) => {
                if (!isReactHookFormMode) {
                  handleFieldChange('name', e.target.value);
                }
              }}
              placeholder="e.g., Premium Hair Shampoo - Dry Hair"
              disabled={shouldDisableFields}
              readOnly={readOnly}
              className={`bg-[var(--input-background)] border-[var(--glass-border)] text-foreground placeholder:text-muted-foreground ${readOnly ? 'cursor-default' : ''} ${errors?.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
            />
            {errors?.name && !readOnly && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.name.message}
              </p>
            )}
          </div>
          {showDefaultCheckbox && (
            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={isDefault || false}
                  onChange={(e) => {
                    // Always allow changing default status, even when variant details are read-only
                    if (isReactHookFormMode) {
                      setValue!('isDefault', e.target.checked);
                    } else if (onDefaultChange) {
                      onDefaultChange(e.target.checked);
                    }
                  }}
                  className="w-4 h-4 rounded border-[var(--glass-border)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)]"
                  disabled={false}
                />
                <Label htmlFor="isDefault" className="text-sm text-foreground cursor-pointer">
                  Set as default variant
                </Label>
              </div>
            </div>
          )}
        </div>
      )}

      {hideVariantDetails && showDefaultCheckbox && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isDefault-hidden"
              checked={isDefault || false}
              onChange={(e) => {
                // Always allow changing default status, even when variant details are read-only
                if (isReactHookFormMode) {
                  setValue!('isDefault', e.target.checked);
                } else if (onDefaultChange) {
                  onDefaultChange(e.target.checked);
                }
              }}
              className="w-4 h-4 rounded border-[var(--glass-border)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)]"
              disabled={false}
            />
            <Label htmlFor="isDefault-hidden" className="text-sm text-foreground cursor-pointer">
              Set as default variant
            </Label>
          </div>
        </div>
      )}

      {showDescription && (
        <div className="space-y-2">
          <Label htmlFor="variant-description" className="text-foreground">Description</Label>
          <textarea
            id="variant-description"
            value={description}
            onChange={(e) => onDescriptionChange?.(e.target.value)}
            className="w-full px-3 py-2 bg-[var(--input-background)] border border-[var(--glass-border)] rounded-md text-foreground placeholder:text-muted-foreground resize-none"
            rows={3}
            placeholder="Describe this variant..."
          />
        </div>
      )}

      {showNotes && (
        <div className="space-y-2">
          <Label htmlFor="variant-notes" className="text-foreground">Notes</Label>
          <textarea
            id="variant-notes"
            value={notes}
            onChange={(e) => onNotesChange?.(e.target.value)}
            className="w-full px-3 py-2 bg-[var(--input-background)] border border-[var(--glass-border)] rounded-md text-foreground placeholder:text-muted-foreground resize-none"
            rows={2}
            placeholder="Additional notes about this variant..."
          />
        </div>
      )}
      
      {/* Product Type - Only show for company mode */}
      {/* Product type should always be editable, even when variant details are read-only */}
      {!isSystemMode && (
        <div className="md:col-span-2 border-t border-[var(--glass-border)] pt-4 mt-4">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="type" className="text-foreground">Product Type <span className="text-red-500">*</span></Label>
                {isReactHookFormMode && control ? (
                  <Controller
                    name="type"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value || 'service'}
                        onValueChange={(value: "sell" | "service" | "both") => field.onChange(value)}
                        disabled={false}
                      >
                        <SelectTrigger 
                          id="type"
                          disabled={false}
                          className={`bg-[var(--input-background)] border-[var(--glass-border)] text-foreground hover:bg-[var(--accent-bg)] hover:border-[var(--accent-border)] ${errors?.type ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="service">Service Use Only</SelectItem>
                          <SelectItem value="sell">For Sale Only</SelectItem>
                          <SelectItem value="both">Both</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                ) : (
                  <Select
                    value={getFieldValue('type') || 'service'}
                    onValueChange={(value: "sell" | "service" | "both") => handleFieldChange('type', value)}
                    disabled={false}
                  >
                    <SelectTrigger 
                      id="type"
                      disabled={false}
                      className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground hover:bg-[var(--accent-bg)] hover:border-[var(--accent-border)]"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="service">Service Use Only</SelectItem>
                      <SelectItem value="sell">For Sale Only</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                {errors?.type && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.type.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="minStock" className="text-foreground">Min Stock</Label>
                <Input
                  id="minStock"
                  type="number"
                  min="0"
                  value={isReactHookFormMode ? undefined : ((variantProp as any)?.stock?.minimum ?? 10)}
                  onChange={(e) => {
                    if (!isReactHookFormMode && onChange) {
                      const currentStock = (variantProp as any)?.stock || { current: 0, minimum: 10, maximum: 100, unit: "pieces" };
                      onChange('stock' as keyof VariantFormData, {
                        ...currentStock,
                        minimum: parseInt(e.target.value) || 0
                      });
                    }
                  }}
                  placeholder="e.g., 10"
                  disabled={shouldDisableFields}
                  readOnly={readOnly}
                  className={`bg-[var(--input-background)] border-[var(--glass-border)] text-foreground placeholder:text-muted-foreground ${readOnly ? 'cursor-default' : ''}`}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxStock" className="text-foreground">Max Stock</Label>
                <Input
                  id="maxStock"
                  type="number"
                  min="0"
                  value={isReactHookFormMode ? undefined : ((variantProp as any)?.stock?.maximum ?? 100)}
                  onChange={(e) => {
                    if (!isReactHookFormMode && onChange) {
                      const currentStock = (variantProp as any)?.stock || { current: 0, minimum: 10, maximum: 100, unit: "pieces" };
                      onChange('stock' as keyof VariantFormData, {
                        ...currentStock,
                        maximum: parseInt(e.target.value) || 0
                      });
                    }
                  }}
                  placeholder="e.g., 100"
                  disabled={shouldDisableFields}
                  readOnly={readOnly}
                  className={`bg-[var(--input-background)] border-[var(--glass-border)] text-foreground placeholder:text-muted-foreground ${readOnly ? 'cursor-default' : ''}`}
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Note: Pricing and stock are managed separately in the Stock Details page
            </p>
          </div>
        </div>
      )}
      
      {/* SKU Field - Only show if not hiding variant details and not hiding SKU */}
      {!hideVariantDetails && !hideSku && (
        <div className="space-y-2">
          <Label htmlFor="sku" className="text-foreground">{skuLabel}</Label>
          <Input
            id="sku"
            {...(register ? register('sku') : {})}
            value={isReactHookFormMode ? undefined : getFieldValue('sku')}
            onChange={(e) => {
              if (!isReactHookFormMode) {
                handleFieldChange('sku', e.target.value);
              }
            }}
            placeholder="Auto-generated from variant details"
            disabled={readOnly || isSystemVariant}
            className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground placeholder:text-muted-foreground"
          />
          <p className="text-xs text-muted-foreground">
            SKU is automatically generated from variant details above
          </p>
        </div>
      )}
    </div>
  );
};
