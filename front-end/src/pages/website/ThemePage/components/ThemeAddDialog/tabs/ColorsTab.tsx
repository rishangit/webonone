import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ThemeColorSetting } from "@/services/companyWebThemes";

interface ColorsTabProps {
  items: Record<string, ThemeColorSetting>;
  selectedKey: string | null;
  onSelect: (key: string) => void;
  onChangeItem: (key: string, value: ThemeColorSetting) => void;
  onAdd: () => void;
  onDelete: (key: string) => void;
}

export const ColorsTab = ({
  items,
  selectedKey,
  onSelect,
  onChangeItem,
  onAdd,
  onDelete,
}: ColorsTabProps) => {
  const selectedItem = selectedKey ? items[selectedKey] : null;

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
          const isSelected = selectedKey === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              className={`w-full text-left rounded-lg border p-3 transition ${
                isSelected
                  ? "border-[var(--accent-border)] bg-[var(--accent-bg)]"
                  : "border-[var(--glass-border)] hover:border-[var(--accent-border)]"
              }`}
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
                      className="h-8 w-8 hover:bg-[var(--accent-bg)] text-muted-foreground hover:text-[var(--accent-text)]"
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
                    <DropdownMenuItem onClick={() => onSelect(key)}>
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
              <p className="text-xs text-muted-foreground">{color.color}</p>
            </button>
          );
        })}
      </div>

      {selectedItem && selectedKey && (
        <div className="rounded-lg border border-[var(--glass-border)] p-4 space-y-3">
          <div className="space-y-2">
            <Label>Color name</Label>
            <Input
              value={selectedItem.name}
              onChange={(e) =>
                onChangeItem(selectedKey, { ...selectedItem, name: e.target.value })
              }
              className="bg-[var(--input-background)] border-[var(--glass-border)]"
            />
          </div>
          <div className="space-y-2">
            <Label>Color value</Label>
            <Input
              type="color"
              value={selectedItem.color}
              onChange={(e) =>
                onChangeItem(selectedKey, { ...selectedItem, color: e.target.value })
              }
              className="w-14 h-10 p-1 bg-[var(--input-background)] border-[var(--glass-border)]"
            />
          </div>
        </div>
      )}
    </div>
  );
};
