import { useState, useEffect, useRef } from "react";
import { Search, X, Check, ChevronDown, CheckCircle2, XCircle, Plus } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Icon } from "../../../components/common/Icon";
import { Input } from "../../../components/ui/input";
import { Badge } from "../../../components/ui/badge";
import { Label } from "../../../components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../../../components/ui/popover";
import { productVariantsService, ProductVariant } from "../../../services/productVariants";
import { VariantFormData } from "../../../schemas/variantValidation";
import { toast } from "sonner";
import { VariantDialog } from "./VariantDialog";

interface SystemProductVariantSelectorProps {
  productId: string;
  value: string | null; // systemProductVariantId
  onChange: (variantId: string | null, variant: ProductVariant | null) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  productName?: string; // System product name for SKU generation
  productSKU?: string; // System product SKU for SKU generation
  companyProductId?: string | null; // Company product ID for auto-creating company variant
  onSystemVariantCreated?: (systemVariantId: string) => void; // Callback when system variant is created
}

export const SystemProductVariantSelector = ({
  productId,
  value,
  onChange,
  disabled = false,
  className = "",
  placeholder = "Select variant",
  productName,
  productSKU,
  companyProductId,
  onSystemVariantCreated
}: SystemProductVariantSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [popoverWidth, setPopoverWidth] = useState<number | undefined>(undefined);
  const [showAddDialog, setShowAddDialog] = useState(false);

  // Fetch variants when component mounts or productId changes
  useEffect(() => {
    if (productId) {
      const fetchVariants = async () => {
        setLoading(true);
        setError(null);
        try {
          const fetchedVariants = await productVariantsService.getVariantsByProductId(productId);
          setVariants(fetchedVariants);
        } catch (err: any) {
          setError(err.message || "Failed to load variants");
          setVariants([]);
        } finally {
          setLoading(false);
        }
      };
      fetchVariants();
    } else {
      setVariants([]);
    }
  }, [productId]);

  // Reset search when popover closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
    }
  }, [isOpen]);

  // Focus search input when popover opens and set width
  useEffect(() => {
    if (isOpen) {
      // Set popover width to match trigger width
      if (triggerRef.current) {
        const width = triggerRef.current.offsetWidth;
        setPopoverWidth(width);
      }
      // Focus search input
      if (searchInputRef.current) {
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 100);
      }
    }
  }, [isOpen]);

  // Filter variants based on search term
  const filteredVariants = variants.filter(variant =>
    variant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    variant.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    variant.color?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    variant.size?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedVariant = variants.find(v => v.id === value);

  const handleSelect = (variant: ProductVariant) => {
    onChange(variant.id, variant);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange(null, null);
  };

  // Handle save variant from VariantDialog
  const handleSaveVariant = async (variantData: VariantFormData, attributeValues?: Record<string, string>) => {
    try {
      const { productVariantsService } = await import("../../../services/productVariants");
      const { productRelatedAttributesService } = await import("../../../services/productRelatedAttributes");
      const { productRelatedAttributeValuesService } = await import("../../../services/productRelatedAttributeValues");
      const { companyProductVariantsService } = await import("../../../services/companyProductVariants");

      // Extract variant defining attributes and their values
      const variantDefiningAttributeIds = (variantData as any).variantDefiningAttributes || [];
      const variantAttributeValues = (variantData as any).variantAttributeValues || attributeValues || {};

      // Step 1: Create system product variant
      const systemVariantData = {
        productId,
        name: variantData.name,
        sku: variantData.sku,
        isDefault: variantData.isDefault || false,
        isActive: true,
        isVerified: false // Company owners create unverified variants
      };

      const createdSystemVariant = await productVariantsService.createVariant(systemVariantData);
      
      // Step 2: Save variant-defining attributes and attribute values for system variant
      if (createdSystemVariant.id) {
        try {
          const productAttributes = await productRelatedAttributesService.getAttributesByProductId(productId);
          
          // Update variant-defining status for all attributes
          for (const attr of productAttributes) {
            const shouldBeVariantDefining = variantDefiningAttributeIds.includes(attr.attributeId);
            if (attr.isVariantDefining !== shouldBeVariantDefining) {
              await productRelatedAttributesService.updateAttribute(attr.id, {
                isVariantDefining: shouldBeVariantDefining
              });
            }
          }

          // Save attribute values if provided
          if (variantAttributeValues && Object.keys(variantAttributeValues).length > 0) {
            const valuesToSave = productAttributes
              .map((attr) => ({
                productRelatedAttributeId: attr.id,
                attributeValue: variantAttributeValues[attr.id] || null,
              }))
              .filter((v) => v.attributeValue !== null && v.attributeValue !== "");

            if (valuesToSave.length > 0) {
              await productRelatedAttributeValuesService.bulkUpsertValues(createdSystemVariant.id, valuesToSave);
            }
          }
        } catch (error: any) {
          console.error("Error saving attribute values:", error);
          toast.error("Variant created but failed to save attribute values");
        }
      }

      // Step 3: If companyProductId is provided, automatically create company variant
      if (companyProductId && createdSystemVariant.id) {
        try {
          const existingVariants = await companyProductVariantsService.getVariantsByCompanyProductId(companyProductId);
          const willBeOnlyVariant = existingVariants.length === 0;

          const companyVariantData: any = {
            companyProductId,
            systemProductVariantId: createdSystemVariant.id,
            type: variantData.type || 'service',
            isActive: true,
            isDefault: willBeOnlyVariant ? true : (variantData.isDefault || false)
          };

          await companyProductVariantsService.createVariant(companyVariantData);
        } catch (error: any) {
          console.error("Error creating company variant:", error);
          toast.error("System variant created but failed to create company variant");
        }
      }

      // Refresh variants list
      const fetchedVariants = await productVariantsService.getVariantsByProductId(productId);
      setVariants(fetchedVariants);
      
      // Find the newly created variant in the refreshed list
      const newVariant = fetchedVariants.find(v => v.id === createdSystemVariant.id);
      
      // Select the newly created variant
      if (newVariant) {
        onChange(createdSystemVariant.id, newVariant);
      } else {
        onChange(createdSystemVariant.id, createdSystemVariant);
      }
      
      // Close dialog
      setShowAddDialog(false);
      
      // Call callback if provided
      if (onSystemVariantCreated && createdSystemVariant.id) {
        onSystemVariantCreated(createdSystemVariant.id);
      }
      
      toast.success("Variant added successfully. It will be verified by system admin.");
    } catch (error: any) {
      console.error('Error creating variant:', error);
      toast.error(error?.message || "Failed to add variant");
      throw error;
    }
  };

  return (
    <>
      {/* Add New Variant Dialog - Render outside Popover to avoid conflicts */}
      {productId && (
        <VariantDialog
          open={showAddDialog}
          onOpenChange={(open) => {
            setShowAddDialog(open);
            if (!open) {
              // Reset form when dialog closes
              setIsOpen(false);
            }
          }}
          mode="add"
          variant={null}
          systemProductId={null} // Not selecting from existing system variants
          productId={productId} // Pass productId to enable wizard mode
          variantMode="system" // This is for creating system variants
          companyProductId={companyProductId} // Pass companyProductId for auto-creating company variant
          onSave={handleSaveVariant}
          onCancel={() => {
            setShowAddDialog(false);
          }}
        />
      )}
      
      <div className={className}>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={triggerRef}
            variant="outline"
            role="combobox"
            disabled={disabled || !productId || loading}
            className="w-full justify-between bg-[var(--input-background)] border-[var(--glass-border)] text-foreground hover:bg-accent"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {selectedVariant ? (
                <span className="truncate">
                  {selectedVariant.name}
                  {selectedVariant.color && ` - ${selectedVariant.color}`}
                  {selectedVariant.size && ` (${selectedVariant.size})`}
                </span>
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {selectedVariant && (
                <X
                  className="h-4 w-4 shrink-0 opacity-50 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                />
              )}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0 bg-popover border-border"
          align="start"
          style={{ width: popoverWidth ? `${popoverWidth}px` : undefined }}
        >
          <div className="p-2 border-b border-border">
            <div className="relative">
              <Icon icon={Search} size="sm" color="muted" className="absolute left-2 top-1/2 transform -translate-y-1/2" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search variants..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          <div className="max-h-[300px] overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Loading variants...
              </div>
            ) : error ? (
              <div className="p-4 text-center text-sm text-red-500">
                {error}
              </div>
            ) : filteredVariants.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                {searchTerm ? "No variants found" : "No variants available"}
              </div>
            ) : (
              <>
                {filteredVariants.map((variant) => (
                  <div
                    key={variant.id}
                    className="flex items-center justify-between p-2 hover:bg-accent cursor-pointer"
                    onClick={() => handleSelect(variant)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium text-foreground truncate">
                          {variant.name}
                        </span>
                        {variant.isDefault && (
                          <Badge variant="outline" className="text-xs">
                            Default
                          </Badge>
                        )}
                        <Badge className={variant.isVerified ? "bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30 text-xs" : "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30 text-xs"}>
                          {variant.isVerified ? (
                            <>
                              <Icon icon={CheckCircle2} size="xs" className="mr-1" /> Verified
                            </>
                          ) : (
                            <>
                              <Icon icon={XCircle} size="xs" className="mr-1" /> Pending
                            </>
                          )}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                        {variant.sku && <span>SKU: {variant.sku}</span>}
                        {variant.color && <span>• Color: {variant.color}</span>}
                        {variant.size && <span>• Size: {variant.size}</span>}
                      </div>
                    </div>
                    {value === variant.id && (
                      <Icon icon={Check} size="sm" color="primary" />
                    )}
                  </div>
                ))}
              </>
            )}
            
            {/* Add New Variant Button */}
            <div className="p-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                className="w-full justify-start text-sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  // Close popover and open dialog
                  setIsOpen(false);
                  // Small delay to ensure popover closes first
                  requestAnimationFrame(() => {
                    setShowAddDialog(true);
                  });
                }}
              >
                <Icon icon={Plus} size="sm" className="mr-2" />
                Add New Variant
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      </div>
    </>
  );
};

