import { Eye, Edit, Copy, Archive, Trash2 } from "lucide-react";
import { CardKebabTrigger } from "@/components/common/CardKebabTrigger";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ServiceActionsProps } from "../types";

export const ServiceActions = ({
  service,
  onView,
  onEdit,
  onDelete,
  onDuplicate,
  onArchive,
  hideActions = false,
  triggerVariant = "overlay",
}: ServiceActionsProps) => {
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
