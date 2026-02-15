import { Edit, Trash2, MoreVertical, Star, Settings, CheckCircle2, XCircle } from "lucide-react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../components/ui/dropdown-menu";
import { ProductVariant as SystemProductVariant } from "../../../services/productVariants";

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

interface ProductVariantCardProps {
  variant: SystemProductVariant | LegacyProductVariant;
  isSelected: boolean;
  productType: "system" | "company";
  isSuperAdmin?: boolean;
  onSelect: () => void;
  onEdit?: (variant: SystemProductVariant | LegacyProductVariant) => void;
  onDelete?: (variantId: string) => void;
  onToggleStatus?: (variant: SystemProductVariant) => void;
  onToggleVerification?: (variant: SystemProductVariant) => void;
  onSetDefault?: (variant: SystemProductVariant) => void;
  onUpdate?: (variantId: string, updates: Partial<LegacyProductVariant>) => void;
}

export const ProductVariantCard = ({
  variant,
  isSelected,
  productType,
  isSuperAdmin = false,
  onSelect,
  onEdit,
  onDelete,
  onToggleStatus,
  onToggleVerification,
  onSetDefault,
  onUpdate,
}: ProductVariantCardProps) => {
  const isSystemVariant = productType === "system";
  const systemVariant = variant as SystemProductVariant;
  const legacyVariant = variant as LegacyProductVariant;

  return (
    <Card 
      className={`p-4 border transition-all duration-200 hover:shadow-md cursor-pointer ${
        isSystemVariant && systemVariant.isDefault 
          ? 'ring-2 ring-blue-500/50 bg-blue-500/5' 
          : isSelected 
            ? 'ring-2 ring-[var(--accent-primary)] bg-[var(--accent-bg)]' 
            : 'bg-card hover:bg-accent/50'
      }`}
      onClick={onSelect}
    >
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-foreground leading-tight">{variant.name}</h4>
              {isSystemVariant && systemVariant.isDefault && (
                <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30 text-xs">
                  <Star className="w-3 h-3 mr-1 fill-current" /> Default
                </Badge>
              )}
              {isSystemVariant && (
                <Badge className={systemVariant.isVerified ? "bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30" : "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30"}>
                  {systemVariant.isVerified ? (
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
              <Badge className={variant.isActive ? "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30" : "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30"}>
                {variant.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            {variant.sku && (
              <p className="text-xs text-muted-foreground mb-2">SKU: {variant.sku}</p>
            )}
            {legacyVariant.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{legacyVariant.description}</p>
            )}
            {/* Removed hardcoded fields: color, size, weight, material
                These are now stored in product_related_attributes_values
                Attribute values should be loaded and displayed separately if needed */}
            {legacyVariant.dimensions && (
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                <span>Dimensions: {legacyVariant.dimensions}</span>
              </div>
            )}
          </div>
          {isSystemVariant && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onEdit(variant);
                  }}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                )}
                {!systemVariant.isDefault && onSetDefault && (
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onSetDefault(systemVariant);
                  }}>
                    <Star className="w-4 h-4 mr-2" />
                    Set as Default
                  </DropdownMenuItem>
                )}
                {isSuperAdmin && onToggleVerification && (
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onToggleVerification(systemVariant);
                  }}>
                    {systemVariant.isVerified ? (
                      <>
                        <XCircle className="w-4 h-4 mr-2" />
                        Unverify
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                        Verify
                      </>
                    )}
                  </DropdownMenuItem>
                )}
                {onToggleStatus && (
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onToggleStatus(systemVariant);
                  }}>
                    <Settings className="w-4 h-4 mr-2" />
                    {variant.isActive ? 'Deactivate' : 'Activate'}
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem 
                    className="text-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(variant.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Variant Details - Show when selected (for company variants) */}
        {!isSystemVariant && isSelected && legacyVariant && (
          <div className="mt-4 pt-4 border-t border-border">
            <h5 className="font-medium text-foreground mb-3">Variant Details</h5>
            {/* Removed hardcoded fields display: color, size, weight, material
                These are now stored in product_related_attributes_values
                Attribute values should be loaded and displayed separately if needed */}
            {legacyVariant.dimensions && (
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Dimensions:</span>
                  <span className="text-foreground ml-2">{legacyVariant.dimensions}</span>
                </div>
              </div>
            )}
            {legacyVariant.notes && (
              <div className="mt-3">
                <span className="text-muted-foreground text-sm">Notes:</span>
                <p className="text-foreground text-sm mt-1">{legacyVariant.notes}</p>
              </div>
            )}
            
            {/* Variant Management Buttons - Only for company owners */}
            {onUpdate && (
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdate(variant.id, { isActive: !variant.isActive });
                  }}
                  className="flex-1"
                >
                  {variant.isActive ? 'Deactivate' : 'Activate'}
                </Button>
                {onDelete && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Are you sure you want to remove this variant?')) {
                        onDelete(variant.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};
