import { MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ThemeColorSetting } from "@/services/companyWebThemes";

interface ColorsTabProps {
  items: Record<string, ThemeColorSetting>;
  onAdd: () => void;
  onEdit: (key: string) => void;
  onDelete: (key: string) => void;
}

export const ColorsTab = ({
  items,
  onAdd,
  onEdit,
  onDelete,
}: ColorsTabProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button type="button" variant="accent" onClick={onAdd}>
          <Plus className="w-4 h-4 mr-2" />
          Add Color
        </Button>
      </div>
      <div className="space-y-2">
        {Object.entries(items).map(([key, color]) => {
          return (
            <div
              key={key}
              className="w-full text-left rounded-lg border p-3 transition border-[var(--glass-border)] hover:border-[var(--accent-border)]"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <p className="font-medium text-foreground truncate">{color.name}</p>
                  <div
                    className="w-6 h-6 rounded border border-[var(--glass-border)]"
                    style={{ backgroundColor: color.color }}
                  />
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
              <p className="text-xs text-muted-foreground">{color.color}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};
