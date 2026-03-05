import { Edit, Trash2, MoreVertical } from "lucide-react";
import { Button } from "../../../../../components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "../../../../../components/ui/dropdown-menu";
import { UnitActionsProps } from "../types";

export const UnitActions = ({
  unit,
  onEdit,
  onDelete,
}: UnitActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-8 w-8 p-0 flex-shrink-0 text-muted-foreground hover:text-foreground hover:bg-accent/50"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-popover border-border">
        <DropdownMenuItem 
          onClick={(e) => {
            e.stopPropagation();
            onEdit(unit);
          }} 
          className="text-foreground hover:bg-accent"
        >
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={(e) => {
            e.stopPropagation();
            onDelete(unit);
          }}
          className="text-red-600 dark:text-red-400 hover:bg-red-500/10"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
