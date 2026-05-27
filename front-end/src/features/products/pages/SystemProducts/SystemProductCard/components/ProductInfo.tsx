import { Users } from "lucide-react";
import { DateDisplay } from "@/components/common/DateDisplay";
import { ListCardDetailField, ListCardDetailGrid } from "@/components/common/ListCardLayout";
import { ProductInfoProps } from "../types";

export const ProductInfo = ({ product, variant = "grid" }: ProductInfoProps) => {
  if (variant === "list") {
    return (
      <>
        <ListCardDetailGrid>
          <ListCardDetailField
            icon={Users}
            label="Usage"
            value={`${product.usageCount} companies`}
          />
          <ListCardDetailField label="Modified">
            <DateDisplay date={product.lastModified} className="text-sm font-medium text-foreground" />
          </ListCardDetailField>
          <ListCardDetailField label="Type" value={product.type ?? "—"} />
          <ListCardDetailField label="ID" value={product.id} />
        </ListCardDetailGrid>
      </>
    );
  }

  return (
    <div className="space-y-3 mb-4">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Usage:</span>
        <span className="text-card-foreground">{product.usageCount} companies</span>
      </div>
      <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
      <div className="pt-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Modified: <DateDisplay date={product.lastModified} /></span>
          <span>ID: {product.id}</span>
        </div>
      </div>
    </div>
  );
};
