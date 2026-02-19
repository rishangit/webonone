import { ArrowLeft, Package, Edit, Save, X } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { CompanyProduct } from "../../../../services/companyProducts";

interface CompanyProductDetailHeaderProps {
  product: CompanyProduct;
  isEditing: boolean;
  loading: boolean;
  isAvailableForPurchase: boolean;
  onBack: () => void;
  onEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export const CompanyProductDetailHeader = ({
  product,
  isEditing,
  loading,
  isAvailableForPurchase,
  onBack,
  onEdit,
  onSave,
  onCancel,
}: CompanyProductDetailHeaderProps) => {
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
          <h1 className="text-2xl font-semibold text-foreground">{product.name || 'Unknown Product'}</h1>
          <p className="text-muted-foreground">{product.sku ? `SKU: ${product.sku}` : 'Company Product'}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge className={isAvailableForPurchase ? "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30" : "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30"}>
          {isAvailableForPurchase ? "Active" : "Inactive"}
        </Badge>
        <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30">
          <Package className="w-3 h-3 mr-1" />
          Company Product
        </Badge>
        {!isEditing ? (
          <Button onClick={onEdit} variant="accent" size="sm">
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button onClick={onCancel} variant="outline" size="sm">
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={onSave} variant="accent" size="sm" disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
