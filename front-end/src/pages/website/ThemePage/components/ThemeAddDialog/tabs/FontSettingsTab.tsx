import { MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ThemeTextStyle } from "@/pages/website/ThemeFormPage/components";

interface FontSettingsTabProps {
  items: Record<string, ThemeTextStyle>;
  onAdd: () => void;
  onEdit: (key: string) => void;
  onDelete: (key: string) => void;
}

export const FontSettingsTab = ({ items, onAdd, onEdit, onDelete }: FontSettingsTabProps) => {
  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button type="button" variant="accent" onClick={onAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Font Style
        </Button>
      </div>
      {Object.entries(items).map(([key, style]) => {
        return (
          <div
            key={key}
            className="w-full rounded-lg border p-3 transition border-[var(--glass-border)] hover:border-[var(--accent-border)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-foreground">{style.styleName}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {style.fontFamily || "No font family"} - {style.fontSize || "No size"}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-[var(--accent-bg)] text-muted-foreground hover:text-[var(--accent-text)]"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-popover border-border" align="end">
                  <DropdownMenuItem onClick={() => onEdit(key)}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(key)}
                    className="text-red-500 hover:bg-red-500/10"
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
