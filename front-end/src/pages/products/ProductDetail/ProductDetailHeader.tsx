import { ArrowLeft, Package, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { Product } from "../../../services/products";

interface SystemProduct {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  usageCount: number;
  createdDate: string;
  lastModified: string;
  tags: string[];
}

interface CompanyProduct {
  id: string;
  name: string;
  description: string;
  status: "Active" | "Low Stock" | "Out of Stock" | "Discontinued";
  [key: string]: any;
}

interface ProductDetailHeaderProps {
  product: SystemProduct | CompanyProduct;
  productType: "system" | "company";
  currentSystemProduct?: Product | null;
  onBack: () => void;
}

export const ProductDetailHeader = ({
  product,
  productType,
  currentSystemProduct,
  onBack,
}: ProductDetailHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <Button 
          variant="outline" 
          size="icon"
          onClick={onBack}
          className="bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{product.name}</h1>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {productType === "system" && currentSystemProduct && (
          <Badge className={currentSystemProduct.isVerified ? "bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30" : "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30"}>
            {currentSystemProduct.isVerified ? (
              <>
                <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
              </>
            ) : (
              <>
                <XCircle className="w-3 h-3 mr-1" /> Pending
              </>
            )}
          </Badge>
        )}
        <Badge className={(product as any).isActive || (product as any).status === "Active" ? "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30" : "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30"}>
          {(product as any).isActive || (product as any).status === "Active" ? "Active" : "Inactive"}
        </Badge>
        <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30">
          <Package className="w-3 h-3 mr-1" />
          {productType === "company" ? "Company Product" : "System Product"}
        </Badge>
      </div>
    </div>
  );
};
