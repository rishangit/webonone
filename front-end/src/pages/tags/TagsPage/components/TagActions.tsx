import { MoreVertical, Edit, Trash2, CheckCircle, X } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../../../../components/ui/dropdown-menu";
import { TagActionsProps } from "../types";

export const TagActions = ({ tag, onEdit, onDelete, onToggleStatus }: TagActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-popover border-border">
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
