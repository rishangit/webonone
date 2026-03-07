import { MoreVertical, Eye, Edit, Copy, Archive, Trash2 } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../../../../components/ui/dropdown-menu";
import { ServiceActionsProps } from "../types";

export const ServiceActions = ({
  service,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  onArchive,
  hideActions = false,
}: ServiceActionsProps) => {
  // Don't render actions menu for regular users
  if (hideActions) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm border border-white/20"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-popover border-border" align="end">
        <DropdownMenuItem onClick={() => onView(service)}>
          <Eye className="w-4 h-4 mr-2" />
          View Details
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onEdit(service)}>
          <Edit className="w-4 h-4 mr-2" />
          Edit Service
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onDuplicate(service)}>
          <Copy className="w-4 h-4 mr-2" />
          Duplicate
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onArchive(service)}>
          <Archive className="w-4 h-4 mr-2" />
          {service.status === "Inactive" ? "Restore" : "Archive"}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => onDelete(service)}
          className="text-red-500 hover:bg-red-500/10"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
