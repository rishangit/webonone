import { Eye, Trash2 } from "lucide-react";
import { CardKebabTrigger } from "@/components/common/CardKebabTrigger";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { StaffActionsProps } from "../types";

export const StaffActions = ({ member, onView, onDelete, triggerVariant = "overlay" }: StaffActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <CardKebabTrigger variant={triggerVariant} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-popover border-border" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem onClick={() => onView(member)}>
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="text-red-600 dark:text-red-400"
          onClick={() => onDelete(member)}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
