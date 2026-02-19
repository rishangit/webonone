import { CompanyProduct } from "../../../../../services/companyProducts";
import { CompanyProductVariant } from "../../../../../services/companyProductVariants";
import { VariantFormData } from "../../../../../schemas/variantValidation";
import { CompanyProductVariantList } from "./CompanyProductVariantList";

interface CompanyProductVariantsTabProps {
  product: CompanyProduct;
  variants: CompanyProductVariant[];
  variantsLoading: boolean;
  selectedVariantId: string | null;
  onVariantSelect: (variant: CompanyProductVariant | null) => void;
  onDeleteVariant: (variantId: string) => void;
  onSetAsDefault: (variant: CompanyProductVariant) => void;
  onViewStockDetails: (variant: CompanyProductVariant) => void;
  onSaveVariant: (variantData: VariantFormData) => Promise<void>;
}

export const CompanyProductVariantsTab = ({
  product,
  variants,
  variantsLoading,
  selectedVariantId,
  onVariantSelect,
  onDeleteVariant,
  onSetAsDefault,
  onViewStockDetails,
  onSaveVariant,
}: CompanyProductVariantsTabProps) => {
  return (
    <div className="space-y-6">
      <CompanyProductVariantList
        variants={variants}
        variantsLoading={variantsLoading}
        selectedVariantId={selectedVariantId}
        systemProductId={product?.systemProductId || null}
        onVariantSelect={onVariantSelect}
        onAddVariant={() => {}}
        onEditVariant={() => {}}
        onViewVariant={() => {}}
        onDeleteVariant={onDeleteVariant}
        onSetAsDefault={onSetAsDefault}
        onViewStockDetails={onViewStockDetails}
        onSaveVariant={onSaveVariant}
      />
    </div>
  );
};
