import { Edit, ExternalLink, MoreVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { WebpageActionsProps } from "../types";

export const WebpageActions = ({
  webPage,
  onEdit,
  onBrowse,
  onDelete,
}: WebpageActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:bg-[var(--accent-bg)] text-muted-foreground hover:text-[var(--accent-text)] flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="bg-popover border-border"
        align="end"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuItem onClick={() => onEdit(webPage)}>
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onBrowse(webPage)}>
          <ExternalLink className="w-4 h-4 mr-2" />
          Browse
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onDelete(webPage)}
          className="text-red-500 hover:bg-red-500/10"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
