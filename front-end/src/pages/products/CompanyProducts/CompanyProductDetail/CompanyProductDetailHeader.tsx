import { Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BackButton } from "@/components/common/BackButton";
import { CompanyProduct } from "@/services/companyProducts";

interface CompanyProductDetailHeaderProps {
  product: CompanyProduct;
  onBack: () => void;
}

export const CompanyProductDetailHeader = ({
  product,
  onBack,
}: CompanyProductDetailHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <BackButton onClick={onBack} />
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{product.name || 'Unknown Product'}</h1>
          <p className="text-muted-foreground">{product.sku ? `SKU: ${product.sku}` : 'Company Product'}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge className={product.isAvailableForPurchase ? "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30" : "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30"}>
          {product.isAvailableForPurchase ? "Active" : "Inactive"}
        </Badge>
        <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30">
          <Package className="w-3 h-3 mr-1" />
          Company Product
        </Badge>
      </div>
    </div>
  );
};
