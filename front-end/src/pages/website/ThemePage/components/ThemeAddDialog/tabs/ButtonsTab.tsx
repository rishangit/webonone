import { MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ThemeButtonSetting } from "@/services/companyWebThemes";

interface ButtonsTabProps {
  items: Record<string, ThemeButtonSetting>;
  onAdd: () => void;
  onEdit: (key: string) => void;
  onDelete: (key: string) => void;
}

export const ButtonsTab = ({ items, onAdd, onEdit, onDelete }: ButtonsTabProps) => {
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button type="button" variant="accent" onClick={onAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Button
        </Button>
      </div>
      {Object.entries(items).map(([key, button]) => {
        return (
          <div
            key={key}
            className="w-full rounded-lg border p-3 transition border-[var(--glass-border)] hover:border-[var(--accent-border)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-foreground">{button.buttonName}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {button.textStyleName} - BG {button.backgroundColor} - Text {button.fontColor}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
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
                  <DropdownMenuItem onClick={() => onEdit(key)}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onDelete(key)}
                    variant="destructive"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        );
      })}
    </div>
  );
};
