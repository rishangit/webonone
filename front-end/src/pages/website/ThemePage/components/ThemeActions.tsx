import { Edit, MoreVertical, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { CompanyWebTheme } from "@/services/companyWebThemes";

export interface ThemeActionsProps {
  theme: CompanyWebTheme;
  onEdit: (theme: CompanyWebTheme) => void;
  onSetDefault: (theme: CompanyWebTheme) => void;
  onDelete: (theme: CompanyWebTheme) => void;
}

export const ThemeActions = ({
  theme,
  onEdit,
  onSetDefault,
  onDelete,
}: ThemeActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground hover:bg-accent"
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
        <DropdownMenuItem onClick={() => onEdit(theme)}>
          <Edit className="w-4 h-4 mr-2" />
          Edit
        </DropdownMenuItem>
        {!theme.isDefault && (
          <DropdownMenuItem onClick={() => onSetDefault(theme)}>
            <Star className="w-4 h-4 mr-2" />
            Set as Default
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => onDelete(theme)}
          variant="destructive"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
