import { BackButton } from "@/components/common/BackButton";
import type { CompanyProduct } from "@/services/companyProducts";

interface CompanyProductDetailHeaderProps {
  product: CompanyProduct;
  onBack: () => void;
}

export const CompanyProductDetailHeader = ({
  product,
  onBack,
}: CompanyProductDetailHeaderProps) => {
  const productName = product.name || "Unknown Product";
  const productSubtitle = product.sku ? `SKU: ${product.sku}` : "Company Product";

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <BackButton onClick={onBack} />
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{productName}</h1>
          <p className="text-muted-foreground">{productSubtitle}</p>
        </div>
      </div>
    </div>
  );
};
