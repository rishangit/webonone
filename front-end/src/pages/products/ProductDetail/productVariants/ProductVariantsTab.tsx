import { ProductVariantList } from "./ProductVariantList";
import { ProductVariantAddForm } from "./ProductVariantAddForm";
import { VariantDialog } from "../../Variants/VariantDialog";
import { ProductVariant as SystemProductVariant } from "../../../../services/productVariants";
import { CompanyProductVariant } from "../../../../services/companyProductVariants";
import { VariantFormData } from "../../../../schemas/variantValidation";

interface LegacyProductVariant {
  id: string;
  name: string;
  description?: string;
  sku: string;
  isActive: boolean;
  color?: string;
  size?: string;
  weight?: string;
  dimensions?: string;
  material?: string;
  notes?: string;
}

interface ProductVariantsTabProps {
  productType: "system" | "company";
  productId: string;
  systemVariants: SystemProductVariant[];
  companyVariants?: LegacyProductVariant[];
  variantsLoading: boolean;
  selectedVariantId: string | null;
  isSuperAdmin?: boolean;
  isAddingVariant: boolean;
  newVariant: VariantFormData;
  variantDialogOpen: boolean;
  variantDialogMode: 'add' | 'edit';
  variantDialogVariant: CompanyProductVariant | null;
  onVariantSelect: (variant: SystemProductVariant | LegacyProductVariant | null) => void;
  onAddVariant: () => void;
  onEditVariant?: (variant: SystemProductVariant | LegacyProductVariant) => void;
  onDeleteVariant?: (variantId: string) => void;
  onToggleVariantStatus?: (variant: SystemProductVariant) => void;
  onToggleVariantVerification?: (variant: SystemProductVariant) => void;
  onSetDefaultVariant?: (variant: SystemProductVariant) => void;
  onUpdateVariant?: (variantId: string, updates: Partial<LegacyProductVariant>) => void;
  onSaveVariant: (variantData: VariantFormData, attributeValues?: Record<string, string>) => Promise<void>;
  onSetIsAddingVariant: (isAdding: boolean) => void;
  onSetNewVariant: (variant: VariantFormData) => void;
  onSetVariantDialogOpen: (open: boolean) => void;
  onSetVariantDialogMode: (mode: 'add' | 'edit') => void;
  onSetVariantDialogVariant: (variant: CompanyProductVariant | null) => void;
  onAddCompanyVariant?: () => void;
}

export const ProductVariantsTab = ({
  productType,
  productId,
  systemVariants,
  companyVariants = [],
  variantsLoading,
  selectedVariantId,
  isSuperAdmin = false,
  isAddingVariant,
  newVariant,
  variantDialogOpen,
  variantDialogMode,
  variantDialogVariant,
  onVariantSelect,
  onAddVariant,
  onEditVariant,
  onDeleteVariant,
  onToggleVariantStatus,
  onToggleVariantVerification,
  onSetDefaultVariant,
  onUpdateVariant,
  onSaveVariant,
  onSetIsAddingVariant,
  onSetNewVariant,
  onSetVariantDialogOpen,
  onSetVariantDialogMode,
  onSetVariantDialogVariant,
  onAddCompanyVariant,
}: ProductVariantsTabProps) => {
  return (
    <div className="space-y-6">
      <ProductVariantList
        productType={productType}
        systemVariants={systemVariants}
        companyVariants={companyVariants}
        variantsLoading={variantsLoading}
        selectedVariantId={selectedVariantId}
        isSuperAdmin={isSuperAdmin}
        onVariantSelect={onVariantSelect}
        onAddVariant={onAddVariant}
        onEditVariant={onEditVariant}
        onDeleteVariant={onDeleteVariant}
        onToggleVariantStatus={onToggleVariantStatus}
        onToggleVariantVerification={onToggleVariantVerification}
        onSetDefaultVariant={onSetDefaultVariant}
        onUpdateVariant={onUpdateVariant}
      />

      {/* Variant Dialog for Add/Edit/View */}
      {productType === "system" && (
        <VariantDialog
          open={variantDialogOpen}
          onOpenChange={onSetVariantDialogOpen}
          mode={variantDialogMode}
          variant={variantDialogVariant}
          systemProductId={null} // System products don't have a parent system product
          productId={productId} // Pass productId to fetch attributes
          variantMode="system"
          onSave={onSaveVariant}
          onCancel={() => {
            onSetVariantDialogVariant(null);
          }}
        />
      )}

      {/* Add Variant Form - Only for company owners */}
      {productType === "company" && isAddingVariant && (
        <ProductVariantAddForm
          formData={newVariant}
          onFormDataChange={onSetNewVariant}
          onSubmit={onAddCompanyVariant || onAddVariant}
          onCancel={() => {
            onSetIsAddingVariant(false);
            onSetNewVariant({
              name: '',
              sku: '',
              type: 'sell',
              isDefault: false,
              variantDefiningAttributes: [],
              variantAttributeValues: {}
            });
          }}
        />
      )}
    </div>
  );
};
