import { MoreVertical, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ServiceDetailTabToolbarProps {
  title: string;
  showMenu: boolean;
  onEditSection: () => void;
}

export function ServiceDetailTabToolbar({ title, showMenu, onEditSection }: ServiceDetailTabToolbarProps) {
  return (
    <div className="flex items-center justify-between gap-4 mb-4">
      <h3 className="text-lg font-semibold text-foreground">{title}</h3>
      {showMenu && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border-border" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={onEditSection}>
              <Pencil className="w-4 h-4 mr-2" />
              Edit this section
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
