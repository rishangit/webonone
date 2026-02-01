import { useState, useEffect, useRef } from "react";
import { Search, X, Check, ChevronDown, CheckCircle2, XCircle, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { Icon } from "../common/Icon";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Label } from "../ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CustomDialog } from "../ui/custom-dialog";
import { productVariantsService, ProductVariant, CreateProductVariantData } from "../../services/productVariants";
import { VariantForm } from "./VariantForm";
import { VariantFormData } from "../../schemas/variantValidation";
import { toast } from "sonner";
import { generateVariantSKU } from "../../utils/skuGenerator";

interface SystemProductVariantSelectorProps {
  productId: string;
  value: string | null; // systemProductVariantId
  onChange: (variantId: string | null, variant: ProductVariant | null) => void;
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  productName?: string; // System product name for SKU generation
  productSKU?: string; // System product SKU for SKU generation
}

export const SystemProductVariantSelector = ({
  productId,
  value,
  onChange,
  disabled = false,
  className = "",
  placeholder = "Select variant",
  productName,
  productSKU
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
  const [newVariantData, setNewVariantData] = useState<VariantFormData>({
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
    price: { cost: 0, sell: 0 },
    stock: { current: 0, minimum: 10, maximum: 100, unit: 'pieces' }
  });
  const [isCreating, setIsCreating] = useState(false);

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

  const handleAddNewVariant = async () => {
    if (!newVariantData.name || !newVariantData.sku) {
      toast.error("Variant name and SKU are required");
      return;
    }

    setIsCreating(true);
    try {
      // Combine size and sizeUnit, weight and weightUnit
      const size = newVariantData.size && newVariantData.sizeUnit 
        ? `${newVariantData.size}${newVariantData.sizeUnit}` 
        : newVariantData.size || undefined;
      const weight = newVariantData.weight && newVariantData.weightUnit 
        ? `${newVariantData.weight}${newVariantData.weightUnit}` 
        : newVariantData.weight || undefined;

      const variantData: CreateProductVariantData = {
        productId: productId,
        name: newVariantData.name,
        sku: newVariantData.sku,
        color: newVariantData.color || undefined,
        size: size,
        weight: weight,
        material: newVariantData.material || undefined,
        isDefault: newVariantData.isDefault || false,
        isActive: true,
        isVerified: false // Company owners create unverified variants
      };

      const createdVariant = await productVariantsService.createVariant(variantData);
      
      // Refresh variants list
      const fetchedVariants = await productVariantsService.getVariantsByProductId(productId);
      setVariants(fetchedVariants);
      
      // Select the newly created variant
      onChange(createdVariant.id, createdVariant);
      
      // Close dialog and reset form
      setShowAddDialog(false);
      setNewVariantData({
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
        price: { cost: 0, sell: 0 },
        stock: { current: 0, minimum: 10, maximum: 100, unit: 'pieces' }
      });
      
      toast.success("Variant added successfully. It will be verified by system admin.");
    } catch (error: any) {
      console.error('Error creating variant:', error);
      toast.error(error?.message || "Failed to add variant");
    } finally {
      setIsCreating(false);
    }
  };

  // Auto-generate SKU when variant details change
  const handleVariantDataChange = (field: keyof VariantFormData, value: any) => {
    const updated = { ...newVariantData, [field]: value };
    
    // Auto-generate SKU when variant details change
    if (field === 'name' || field === 'color' || field === 'size' || field === 'sizeUnit') {
      if (updated.name && updated.name.trim()) {
        updated.sku = generateVariantSKU(
          productName || 'Product',
          productSKU,
          {
            name: updated.name,
            color: updated.color,
            size: updated.size,
            sizeUnit: updated.sizeUnit
          }
        );
      }
    }
    
    setNewVariantData(updated);
  };

  return (
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
                variant="outline"
                className="w-full justify-start text-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAddDialog(true);
                  setIsOpen(false);
                }}
              >
                <Icon icon={Plus} size="sm" className="mr-2" />
                Add New Variant
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Add New Variant Dialog */}
      <CustomDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        title="Add New System Product Variant"
        description="This variant will be saved as unverified and will need to be verified by a system admin."
        maxWidth="max-w-lg"
        className="max-h-[90vh] overflow-y-auto bg-[var(--glass-bg)] border-[var(--glass-border)]"
      >
        <div className="space-y-4 py-4">
          <VariantForm
            variant={newVariantData}
            onChange={handleVariantDataChange}
            onDefaultChange={(isDefault) => {
              setNewVariantData(prev => ({ ...prev, isDefault }));
            }}
            showDefaultCheckbox={true}
            skuLabel="SKU * (Auto-generated)"
            mode="system"
            hideSku={false}
          />
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => {
              setShowAddDialog(false);
              setNewVariantData({
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
                price: { cost: 0, sell: 0 },
                stock: { current: 0, minimum: 10, maximum: 100, unit: 'pieces' }
              });
            }}
            disabled={isCreating}
            className="flex-1 border-[var(--glass-border)] hover:border-[var(--accent-border)] hover:bg-[var(--accent-bg)] text-foreground"
          >
            Cancel
          </Button>
          <Button
            onClick={handleAddNewVariant}
            disabled={isCreating || !newVariantData.name || !newVariantData.sku}
            className="flex-1 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:from-[var(--accent-primary-hover)] hover:to-[var(--accent-primary)] text-[var(--accent-button-text)] shadow-lg shadow-[var(--accent-primary)]/25 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? "Adding..." : "Add Variant"}
          </Button>
        </div>
      </CustomDialog>
    </div>
  );
};

