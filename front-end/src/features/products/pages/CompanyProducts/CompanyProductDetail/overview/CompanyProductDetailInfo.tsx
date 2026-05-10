import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { DateTime } from "@/components/common/DateTime";
import type { CompanyProduct } from "@/features/products/services/productApi";

interface CompanyProductDetailInfoProps {
  product: CompanyProduct;
}

export const CompanyProductDetailInfo = ({ product }: CompanyProductDetailInfoProps) => {
  return (
    <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
      <h3 className="font-semibold text-foreground mb-4">Product Information</h3>
      <div className="space-y-4">
        <div>
          <Label className="text-muted-foreground">Description</Label>
          <p className="text-foreground mt-1">
            {product.description || "No description available"}
          </p>
        </div>

        <div className="space-y-4">
          {product.sku && (
            <div>
              <Label className="text-muted-foreground">SKU</Label>
              <p className="text-foreground">{product.sku}</p>
            </div>
          )}
          {product.createdAt && (
            <div>
              <Label className="text-muted-foreground">Created</Label>
              <p className="text-foreground">
                <DateTime date={product.createdAt} />
              </p>
            </div>
          )}
          {product.updatedAt && (
            <div>
              <Label className="text-muted-foreground">Last Modified</Label>
              <p className="text-foreground">
                <DateTime date={product.updatedAt} />
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
