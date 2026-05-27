import { Eye, Trash2 } from "lucide-react";
import { CardKebabTrigger, type CardKebabTriggerVariant } from "@/components/common/CardKebabTrigger";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { CompanyProduct } from '@/features/products/services/productApi';

interface ProductActionsProps {
  product: CompanyProduct;
  onView?: (product: CompanyProduct) => void;
  onDelete?: (product: CompanyProduct) => void;
  hideActions?: boolean;
  triggerVariant?: CardKebabTriggerVariant;
}

export const ProductActions = ({
  product,
  onView,
  onDelete,
  hideActions = false,
  triggerVariant = "overlay",
}: ProductActionsProps) => {
  // Don't render actions menu for regular users
  if (hideActions) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <CardKebabTrigger variant={triggerVariant} />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-popover border-border" align="end" onClick={(e) => e.stopPropagation()}>
        {onView && (
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onView(product); }} className="text-popover-foreground hover:bg-sidebar-accent">
            <Eye className="w-4 h-4 mr-2" />
            View Details
          </DropdownMenuItem>
        )}
        {onDelete && (
          <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onDelete(product); }} className="text-destructive hover:bg-destructive/10">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
