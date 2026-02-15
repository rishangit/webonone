import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { CustomDialog } from "../ui/custom-dialog";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { AlertCircle, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { VariantForm } from "./VariantForm";
import { SystemProductVariantSelector } from "./SystemProductVariantSelector";
import { VariantAttributeValues } from "./VariantAttributeValues";
import { VariantAttributeSelector } from "./VariantAttributeSelector";
import { ProductVariant as SystemProductVariant } from "../../services/productVariants";
import { CompanyProductVariant } from "../../services/companyProductVariants";
import { variantSchema, VariantFormData } from "../../schemas/variantValidation";
import { productRelatedAttributeValuesService } from "../../services/productRelatedAttributeValues";
import { toast } from "sonner";

interface VariantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'add' | 'edit' | 'view';
  variant?: CompanyProductVariant | null;
  systemProductId?: string | null;
  productId?: string | null; // Product ID for fetching attributes (for system products)
  variantMode?: 'system' | 'company'; // Whether this is for system products or company products
  onSave?: (variantData: VariantFormData, attributeValues?: Record<string, string>) => Promise<void>;
  onCancel?: () => void;
}

export const VariantDialog = ({
  open,
  onOpenChange,
  mode,
  variant,
  systemProductId,
  productId,
  variantMode = 'company',
  onSave,
  onCancel
}: VariantDialogProps) => {
  const [attributeValues, setAttributeValues] = useState<Record<string, string>>({});
  const [variantDefiningAttributes, setVariantDefiningAttributes] = useState<string[]>([]);
  const [loadingAttributeValues, setLoadingAttributeValues] = useState(false);
  const [productAttributes, setProductAttributes] = useState<any[]>([]);
  // Wizard state - only for 'add' mode
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 2;
  
  // Calculate wizard mode early (before useEffects that use it)
  const isWizardMode = (mode === 'add' || mode === 'edit') && variantMode === 'system' && productId;
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
      type: 'service',
      isDefault: false,
      systemProductVariantId: undefined,
      variantDefiningAttributes: [],
      variantAttributeValues: {}
    },
    mode: 'onBlur'
  });

  // Load attribute values and variant-defining attributes when editing/viewing a variant
  useEffect(() => {
    const loadAttributeValues = async () => {
      if (open && productId) {
        if (variant?.id && (mode === 'edit' || mode === 'view')) {
          setLoadingAttributeValues(true);
          try {
            // Load attribute values
            const values = await productRelatedAttributeValuesService.getValuesByVariantId(variant.id);
            const valuesMap: Record<string, string> = {};
            values.forEach((val) => {
              valuesMap[val.productRelatedAttributeId] = val.attributeValue || "";
            });
            setAttributeValues(valuesMap);

            // Load variant-defining attributes
            const { productRelatedAttributesService } = await import("../../services/productRelatedAttributes");
            const attrs = await productRelatedAttributesService.getAttributesByProductId(productId);
            setProductAttributes(attrs);
            
            // For edit mode: determine which variant-defining attributes have values for this variant
            // These are the ones that define this specific variant
            const variantDefiningAttrs = attrs.filter(attr => attr.isVariantDefining);
            const selectedVariantDefiningAttrIds = variantDefiningAttrs
              .filter(attr => {
                // Check if this attribute has a value for this variant
                const value = valuesMap[attr.id];
                return value && value.trim() !== '';
              })
              .map(attr => attr.attributeId);
            
            // If we have selected variant-defining attributes, use those; otherwise use all variant-defining attributes
            setVariantDefiningAttributes(
              selectedVariantDefiningAttrIds.length > 0 
                ? selectedVariantDefiningAttrIds 
                : variantDefiningAttrs.map(attr => attr.attributeId)
            );
            
            // Start on step 1 for edit mode (wizard)
            if (mode === 'edit') {
              setCurrentStep(1);
            }
          } catch (error) {
            console.error("Error loading attribute values:", error);
          } finally {
            setLoadingAttributeValues(false);
          }
        } else if (open && mode === 'add') {
          // Load variant-defining attributes for add mode (to show which are already marked)
          try {
            const { productRelatedAttributesService } = await import("../../services/productRelatedAttributes");
            const attrs = await productRelatedAttributesService.getAttributesByProductId(productId);
            setProductAttributes(attrs);
            const variantDefiningAttrIds = attrs
              .filter(attr => attr.isVariantDefining)
              .map(attr => attr.attributeId);
            setVariantDefiningAttributes(variantDefiningAttrIds);
          } catch (error) {
            console.error("Error loading variant-defining attributes:", error);
          }
          // Reset attribute values for add mode
          setAttributeValues({});
          // Reset wizard step
          setCurrentStep(1);
        }
      }
    };

    loadAttributeValues();
  }, [open, variant?.id, mode, productId]);

  // Reset wizard step when dialog closes or when mode changes
  useEffect(() => {
    if (!open) {
      setCurrentStep(1);
    } else if (open && mode === 'edit' && isWizardMode) {
      // For edit mode, start on step 1 but allow navigation
      setCurrentStep(1);
    }
  }, [open, mode, isWizardMode]);

  // Initialize form data when dialog opens or variant changes
  useEffect(() => {
    if (open) {
      if (mode === 'edit' || mode === 'view') {
        if (variant) {
          reset({
            name: variant.name || '',
            sku: variant.sku || '',
            type: variant.type || 'service',
            isDefault: variant.isDefault || false,
            systemProductVariantId: variant.systemProductVariantId,
            variantDefiningAttributes: [],
            variantAttributeValues: {}
          });
        }
      } else {
        // Reset for add mode
        reset({
          name: '',
          sku: '',
          type: 'service',
          isDefault: false,
          systemProductVariantId: undefined,
          variantDefiningAttributes: [],
          variantAttributeValues: {}
        });
      }
    }
  }, [open, mode, variant, reset]);

  const handleAttributeValueChange = async (productRelatedAttributeId: string, value: string) => {
    setAttributeValues((prev) => {
      const newValues = {
        ...prev,
        [productRelatedAttributeId]: value,
      };
      
      // Auto-generate SKU when attribute values change (only in step 1 of wizard mode)
      if (isWizardMode && currentStep === 1 && productId && setValue) {
        // Debounce SKU generation to avoid too many calls
        setTimeout(() => generateSKUFromAttributes(newValues), 300);
      }
      
      return newValues;
    });
  };

  const generateSKUFromAttributes = async (currentAttributeValues: Record<string, string>) => {
    if (!productId || variantMode !== 'system' || !setValue || productAttributes.length === 0) return;

    try {
      // Get variant-defining attributes and their values
      const variantDefiningAttrs = productAttributes.filter(attr => 
        variantDefiningAttributes.includes(attr.attributeId)
      );

      // Build attribute values array for SKU generation
      const attributeValuesForSKU = variantDefiningAttrs
        .map(attr => {
          const value = currentAttributeValues[attr.id] || '';
          return {
            attributeName: attr.attributeName || '',
            value: value
          };
        })
        .filter(attr => attr.value && attr.value.trim() !== '');

      // Generate SKU if we have attribute values
      if (attributeValuesForSKU.length > 0) {
        const { generateVariantSKUFromAttributes } = await import("../../utils/skuGenerator");
        // Try to get product name, fallback to variant name or 'Product'
        let productName = 'Product';
        try {
          const { productsService } = await import("../../services/products");
          const product = await productsService.getProduct(productId);
          productName = product?.name || watch('name') || 'Product';
        } catch {
          productName = watch('name') || 'Product';
        }
        const generatedSKU = generateVariantSKUFromAttributes(productName, undefined, attributeValuesForSKU);
        setValue('sku', generatedSKU, { shouldValidate: false });
      } else if (variantDefiningAttributes.length === 0) {
        // If no variant-defining attributes selected, clear SKU or set default
        setValue('sku', '', { shouldValidate: false });
      }
    } catch (error) {
      console.error("Error generating SKU from attributes:", error);
    }
  };

  const handleVariantDefiningAttributeSelect = (attributeId: string, isSelected: boolean) => {
    const isWizard = (mode === 'add' || mode === 'edit') && variantMode === 'system' && productId;
    
    if (isSelected) {
      setVariantDefiningAttributes((prev) => {
        const updated = [...prev, attributeId];
        // Regenerate SKU when variant-defining attributes change (only in step 1 of wizard)
        if (isWizard && currentStep === 1 && setValue) {
          setTimeout(() => generateSKUFromAttributes(attributeValues), 100);
        }
        return updated;
      });
    } else {
      setVariantDefiningAttributes((prev) => {
        const updated = prev.filter((id) => id !== attributeId);
        // Regenerate SKU after removing attribute (only in step 1 of wizard)
        if (isWizard && currentStep === 1 && setValue) {
          setTimeout(() => generateSKUFromAttributes(attributeValues), 100);
        }
        return updated;
      });
    }
  };

  const onSubmit = async (data: VariantFormData) => {
    if (mode === 'view' || !onSave) return;
    
    try {
      // Pass variant defining attributes and their values to onSave handler
      // The parent component will handle saving both variant and attribute values
      const variantData = {
        ...data,
        variantDefiningAttributes: variantDefiningAttributes,
        variantAttributeValues: attributeValues,
      };
      const attributeValuesToSave = productId && variantMode === 'system' ? attributeValues : undefined;
      await onSave(variantData, attributeValuesToSave);
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving variant:', error);
      toast.error("Failed to save variant or attribute values");
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    setCurrentStep(1);
    onOpenChange(false);
  };

  const isReadOnly = mode === 'view';

  // Step validation
  const canProceedToNextStep = () => {
    if (currentStep === 1) {
      // Step 1: At least one variant-defining attribute must be selected with a value
      if (variantDefiningAttributes.length === 0) {
        return false;
      }
      // Check if all selected variant-defining attributes have values
      const hasAllValues = variantDefiningAttributes.every(attrId => {
        const productAttr = productAttributes.find(pa => pa.attributeId === attrId);
        if (!productAttr) return false;
        const value = attributeValues[productAttr.id];
        return value && value.trim() !== '';
      });
      
      return hasAllValues;
    }
    if (currentStep === 2) {
      // Step 2: Name and SKU are required
      const name = watch('name');
      const sku = watch('sku');
      return !!(name && name.trim() && sku && sku.trim());
    }
    return false;
  };

  const handleNext = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    // Prevent form submission
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    if (currentStep === 1) {
      // For add mode, validate step 1
      if (mode === 'add' && !canProceedToNextStep()) {
        toast.error("Please select at least one variant-defining attribute and set its value");
        return;
      }
      
      // Auto-generate SKU before moving to step 2 (if not already set in edit mode)
      if (mode === 'add' || !watch('sku') || watch('sku')?.trim() === '') {
        await generateSKUFromAttributes(attributeValues);
      }
      
      // Auto-generate variant name from attribute values if name is empty (only in add mode)
      if (mode === 'add') {
        const currentName = watch('name');
        if (!currentName || currentName.trim() === '') {
          const variantDefiningAttrs = productAttributes.filter(attr => 
            variantDefiningAttributes.includes(attr.attributeId)
          );
          
          const nameParts = variantDefiningAttrs
            .map(attr => {
              const value = attributeValues[attr.id] || '';
              if (value && value.trim()) {
                return `${attr.attributeName}: ${value}`;
              }
              return null;
            })
            .filter(Boolean);
          
          if (nameParts.length > 0) {
            setValue('name', nameParts.join(' - '));
          }
        }
      }
      
      setCurrentStep(2);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Step Indicator Component
  const StepIndicator = () => {
    if (!isWizardMode) return null;
    
    return (
      <div className="flex items-center justify-center mb-6">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step <= currentStep 
                ? 'bg-[var(--accent-primary)] text-[var(--accent-button-text)]' 
                : 'bg-muted text-muted-foreground'
            }`}>
              {step < currentStep ? (
                <Check className="w-4 h-4" />
              ) : (
                step
              )}
            </div>
            {step < totalSteps && (
              <div className={`w-12 h-0.5 mx-2 ${
                step < currentStep ? 'bg-[var(--accent-primary)]' : 'bg-muted'
              }`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  const getStepTitle = () => {
    if (!isWizardMode) return '';
    switch (currentStep) {
      case 1: return "Select Attributes for Variant";
      case 2: return "Variant Name & SKU";
      default: return "";
    }
  };

  const dialogTitle = mode === 'add' ? 'Add New Variant' : mode === 'edit' ? 'Edit Variant' : 'View Variant';
  const dialogDescription = mode === 'add' 
    ? 'Add a new variant to this product. Pricing and stock are managed separately in the Stock Details page.'
    : mode === 'edit'
    ? 'Edit variant details. Pricing and stock are managed separately in the Stock Details page.'
    : 'View variant details. Pricing and stock are managed separately in the Stock Details page.';

  const footerContent = (
    <>
      {isWizardMode ? (
        // Wizard mode footer (for add mode)
        <div className="flex items-center justify-between w-full">
          <Button
            type="button"
            variant="outline"
            onClick={currentStep === 1 ? handleCancel : handlePrevious}
            disabled={isSubmitting}
            className="border-[var(--glass-border)] bg-[var(--input-background)] hover:bg-[var(--accent-bg)] hover:border-[var(--accent-border)] hover:text-[var(--accent-text)] text-foreground transition-all duration-200"
          >
            {currentStep === 1 ? (
              'Cancel'
            ) : (
              <>
                <ChevronLeft className="w-4 h-4 mr-2" />
                Previous
              </>
            )}
          </Button>
          {currentStep === totalSteps ? (
            <Button
              type="submit"
              form="variant-form"
              disabled={isSubmitting || (mode === 'add' && !canProceedToNextStep())}
              variant="accent"
              className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:from-[var(--accent-primary-hover)] hover:to-[var(--accent-primary)] text-[var(--accent-button-text)] shadow-lg shadow-[var(--accent-primary)]/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {isSubmitting ? 'Saving...' : mode === 'add' ? 'Add Variant' : 'Save Changes'}
            </Button>
          ) : (
            <Button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleNext(e);
              }}
              disabled={isSubmitting || (mode === 'add' && !canProceedToNextStep())}
              variant="accent"
              className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:from-[var(--accent-primary-hover)] hover:to-[var(--accent-primary)] text-[var(--accent-button-text)] shadow-lg shadow-[var(--accent-primary)]/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      ) : (
        // Regular mode footer (for edit/view mode)
        <>
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
        </>
      )}
    </>
  );

  return (
    <CustomDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isWizardMode ? getStepTitle() : dialogTitle}
      description={isWizardMode ? `Step ${currentStep} of ${totalSteps}` : dialogDescription}
      className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[var(--glass-bg)] border-[var(--glass-border)] backdrop-blur-xl"
      footer={footerContent}
      disableContentScroll={true}
    >
      <div className="space-y-6">
        {isWizardMode && <StepIndicator />}
        
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
                      // Populate variant details from system variant
                      setValue('systemProductVariantId', variantId || undefined);
                      setValue('name', systemVariant.name);
                    } else {
                      // Clear system variant and reset variant details
                      setValue('systemProductVariantId', undefined);
                      setValue('name', '');
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
                    </p>
                    <p className="text-xs text-blue-500/80 dark:text-blue-300/80 mt-1">
                      Variant name is populated from the system product. Select attributes below to define this variant.
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

            {/* Wizard Mode: Show step content */}
            {isWizardMode ? (
              <>
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">Select Attributes for Variant</h3>
                      <p className="text-sm text-muted-foreground">
                        Select one or more variant-defining attributes and set their values. These attributes will be used to generate the variant name and SKU.
                      </p>
                    </div>
                    {productId && (
                      <VariantAttributeSelector
                        productId={productId}
                        selectedAttributes={attributeValues}
                        variantDefiningAttributes={variantDefiningAttributes}
                        onAttributeSelect={handleVariantDefiningAttributeSelect}
                        onValueChange={handleAttributeValueChange}
                        readOnly={isReadOnly}
                      />
                    )}
                  </div>
                )}
                
                {currentStep === 2 && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">Variant Name & SKU</h3>
                      <p className="text-sm text-muted-foreground">
                        Enter the variant name and the SKU will be auto-generated from the selected attributes. You can edit both fields if needed.
                      </p>
                    </div>
                    
                    {/* Variant Name Field */}
                    <div className="space-y-2">
                      <Label htmlFor="variant-name" className="text-foreground">
                        Variant Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="variant-name"
                        {...register('name')}
                        placeholder="e.g., Color: Red - Size: Large"
                        className={`bg-[var(--input-background)] border-[var(--glass-border)] text-foreground placeholder:text-muted-foreground ${
                          errors?.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                        }`}
                      />
                      {errors?.name && (
                        <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.name.message}
                        </p>
                      )}
                    </div>

                    {/* SKU Field with Regenerate Button */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="variant-sku" className="text-foreground">
                          SKU <span className="text-red-500">*</span>
                        </Label>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            await generateSKUFromAttributes(attributeValues);
                            toast.success("SKU regenerated from selected attributes");
                          }}
                          className="text-xs border-[var(--glass-border)] bg-[var(--input-background)] hover:bg-[var(--accent-bg)]"
                        >
                          Regenerate SKU
                        </Button>
                      </div>
                      <Input
                        id="variant-sku"
                        {...register('sku')}
                        placeholder="Auto-generated from selected attributes"
                        className={`bg-[var(--input-background)] border-[var(--glass-border)] text-foreground placeholder:text-muted-foreground ${
                          errors?.sku ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''
                        }`}
                      />
                      {errors?.sku && (
                        <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.sku.message}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        SKU is generated from the selected variant-defining attributes. Click "Regenerate SKU" to update it.
                      </p>
                    </div>

                    {/* Default Variant Checkbox */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="isDefault-wizard"
                          checked={watch('isDefault') || false}
                          onChange={(e) => setValue('isDefault', e.target.checked)}
                          className="w-4 h-4 rounded border-[var(--glass-border)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)]"
                        />
                        <Label htmlFor="isDefault-wizard" className="text-sm text-foreground cursor-pointer">
                          Set as default variant
                        </Label>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Regular Mode: Show all fields at once (for edit/view) */}
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

                {/* Variant Defining Attributes - Only show for system products in edit mode */}
                {productId && variantMode === 'system' && mode === 'edit' && (
                  <div className="border-t border-[var(--glass-border)] pt-6">
                    <VariantAttributeSelector
                      productId={productId}
                      selectedAttributes={attributeValues}
                      variantDefiningAttributes={variantDefiningAttributes}
                      onAttributeSelect={handleVariantDefiningAttributeSelect}
                      onValueChange={handleAttributeValueChange}
                      readOnly={isReadOnly}
                    />
                  </div>
                )}
              </>
            )}

            {/* Other Product Attribute Values - Only show for system products in view mode (not in wizard) */}
            {productId && variantMode === 'system' && mode === 'view' && !isWizardMode && (
              <div className="border-t border-[var(--glass-border)] pt-6">
                <VariantAttributeValues
                  productId={productId}
                  variantId={variant?.id || null}
                  attributeValues={attributeValues}
                  onChange={handleAttributeValueChange}
                  excludeAttributeIds={variantDefiningAttributes}
                  readOnly={isReadOnly}
                />
              </div>
            )}
          </form>
      </div>
    </CustomDialog>
  );
};

