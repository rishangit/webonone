import { Eye, Trash2, MoreVertical } from "lucide-react";
import { Button } from "../../../../../components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../../../components/ui/dropdown-menu";
import { CompanyProduct } from "../../../../../services/companyProducts";

interface ProductActionsProps {
  product: CompanyProduct;
  onView?: (product: CompanyProduct) => void;
  onDelete?: (product: CompanyProduct) => void;
  hideActions?: boolean; // Hide actions menu for regular users
}

export const ProductActions = ({ product, onView, onDelete, hideActions = false }: ProductActionsProps) => {
  // Don't render actions menu for regular users
  if (hideActions) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
        <Button variant="ghost" size="icon" className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm border border-white/20">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-popover border-border" align="end">
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
