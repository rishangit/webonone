import { ProductVariantList } from "./ProductVariantList";
import { VariantDialog } from "../../Variants/VariantDialog";
import { ProductVariant as SystemProductVariant } from "@/services/productVariants";
import { CompanyProductVariant } from "@/services/companyProductVariants";
import { VariantFormData } from "@/schemas/variantValidation";

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
  onSetVariantDialogOpen: (open: boolean) => void;
  onSetVariantDialogVariant: (variant: CompanyProductVariant | null) => void;
}

export const ProductVariantsTab = ({
  productType,
  productId,
  systemVariants,
  companyVariants = [],
  variantsLoading,
  selectedVariantId,
  isSuperAdmin = false,
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
  onSetVariantDialogOpen,
  onSetVariantDialogVariant,
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

      {/* Single Add/Edit dialog for both system and company variants */}
      <VariantDialog
        open={variantDialogOpen}
        onOpenChange={onSetVariantDialogOpen}
        mode={variantDialogMode}
        variant={variantDialogVariant}
        systemProductId={null}
        productId={productType === "system" ? productId : null}
        variantMode={productType}
        onSave={onSaveVariant}
        onCancel={() => {
          onSetVariantDialogVariant(null);
        }}
      />
    </div>
  );
};
