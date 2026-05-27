import { Edit, Trash2, Eye, Settings } from "lucide-react";
import { CardKebabTrigger, type CardKebabTriggerVariant } from "@/components/common/CardKebabTrigger";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { ProductActionsProps } from "../types";

export const ProductActions = ({
  product,
  onViewProduct,
  onEdit,
  onDelete,
  onToggleStatus,
  triggerVariant = "overlay",
}: ProductActionsProps & { triggerVariant?: CardKebabTriggerVariant }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <CardKebabTrigger variant={triggerVariant} />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-popover border-border" align="end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewProduct?.(product.id); }}>
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(product); }}>
          <Edit className="w-4 h-4 mr-2" />
          Edit Product
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onToggleStatus(product.id); }}>
          <Settings className="w-4 h-4 mr-2" />
          {product.isActive ? "Deactivate" : "Activate"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          onClick={(e) => { e.stopPropagation(); onDelete(product); }}
          className="text-red-500 hover:bg-red-500/10"
          disabled={product.usageCount > 0}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
