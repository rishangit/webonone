import { useEffect, useState } from "react";
import { Palette, Save } from "lucide-react";
import { CustomDialog } from "@/components/ui/custom-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ThemeColorSetting } from "@/services/companyWebThemes";

interface ColorSettingEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  value: ThemeColorSetting | null;
  onSave: (value: ThemeColorSetting) => void;
}

export const ColorSettingEditDialog = ({
  open,
  onOpenChange,
  title,
  value,
  onSave,
}: ColorSettingEditDialogProps) => {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#000000");

  useEffect(() => {
    if (!open) return;
    setName(value?.name || "");
    setColor(value?.color || "#000000");
  }, [open, value]);

  const canSave = name.trim().length > 0 && color.trim().length > 0;

  const handleSave = () => {
    if (!canSave) return;
    onSave({
      name: name.trim(),
      color: color.trim(),
    });
    onOpenChange(false);
  };

  return (
    <CustomDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description="Set a color name and value."
      icon={<Palette className="w-5 h-5" />}
      sizeWidth="small"
      sizeHeight="small"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-10 px-4 border-[var(--glass-border)] text-foreground hover:bg-accent"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={!canSave} variant="accent">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="color-setting-name">Color name</Label>
          <Input
            id="color-setting-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Primary"
            className="bg-[var(--input-background)] border-[var(--glass-border)]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="color-setting-value">Color value</Label>
          <div className="flex items-center gap-2">
            <Input
              id="color-setting-value"
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="h-10 w-14 p-1 bg-[var(--input-background)] border-[var(--glass-border)]"
            />
            <Input
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="#000000"
              className="bg-[var(--input-background)] border-[var(--glass-border)]"
            />
          </div>
        </div>
      </div>
    </CustomDialog>
  );
};
