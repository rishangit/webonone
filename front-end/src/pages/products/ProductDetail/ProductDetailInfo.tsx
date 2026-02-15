import { Card } from "../../../components/ui/card";
import { Label } from "../../../components/ui/label";
import { Separator } from "../../../components/ui/separator";
import { DateTime } from "../../../components/common/DateTime";

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
  stock?: {
    current: number;
    unit: string;
  };
  [key: string]: any;
}

interface ProductDetailInfoProps {
  product: SystemProduct | CompanyProduct;
}

export const ProductDetailInfo = ({ product }: ProductDetailInfoProps) => {
  return (
    <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
      <h3 className="font-semibold text-foreground mb-4">Product Information</h3>
      <div className="space-y-4">
        <div>
          <Label className="text-muted-foreground">Description</Label>
          <p className="text-foreground mt-1">{product.description}</p>
        </div>
        
        <Separator />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(product as any).usageCount !== undefined && (
            <div>
              <Label className="text-muted-foreground">Used by</Label>
              <p className="text-foreground">{(product as any).usageCount} companies</p>
            </div>
          )}
          {(product as any).stock && (
            <div>
              <Label className="text-muted-foreground">Stock</Label>
              <p className="text-foreground">{(product as any).stock.current} {(product as any).stock.unit}</p>
            </div>
          )}
          {(product as any).createdDate && (
            <div>
              <Label className="text-muted-foreground">Created</Label>
              <p className="text-foreground">
                <DateTime date={(product as any).createdDate} />
              </p>
            </div>
          )}
          {(product as any).lastModified && (
            <div>
              <Label className="text-muted-foreground">Last Modified</Label>
              <p className="text-foreground">
                <DateTime date={(product as any).lastModified} />
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
