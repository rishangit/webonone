import { Eye, Edit, Trash2 } from "lucide-react";
import { CardKebabTrigger } from "@/components/common/CardKebabTrigger";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { SpaceActionsProps } from "../types";

export const SpaceActions = ({ space, onView, onEdit, onDelete, triggerVariant = "overlay" }: SpaceActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <CardKebabTrigger variant={triggerVariant} />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-popover border-border" align="end" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem onClick={() => onView(space)}>
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(space)}>
          <Edit className="w-4 h-4 mr-2" />
          Edit Space
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="text-red-600 dark:text-red-400"
          onClick={() => onDelete(space)}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
