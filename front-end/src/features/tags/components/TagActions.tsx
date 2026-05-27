import { Edit, Trash2, CheckCircle, X } from "lucide-react";
import { CardKebabTrigger } from "@/components/common/CardKebabTrigger";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { TagActionsProps } from "@/features/tags/types";

export const TagActions = ({
  tag,
  onEdit,
  onDelete,
  onToggleStatus,
  triggerVariant = "overlay",
}: TagActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <CardKebabTrigger variant={triggerVariant} />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-popover border-border" onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem onClick={() => onEdit(tag)}>
          <Edit className="w-4 h-4 mr-2" />
          Edit Tag
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onToggleStatus(tag)}>
          {tag.isActive ? (
            <>
              <X className="w-4 h-4 mr-2" />
              Deactivate
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Activate
            </>
          )}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onDelete(tag)}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
