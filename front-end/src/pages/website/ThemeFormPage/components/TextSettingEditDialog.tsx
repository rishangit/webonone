import { useEffect, useMemo, useState } from "react";
import { CustomDialog } from "@/components/ui/custom-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Type } from "lucide-react";
import type {
  ThemeColorSetting,
  ThemeFontSetting,
} from "@/services/companyWebThemes";

export interface ThemeTextSettingItem {
  styleName: string; // display name for the text style
  fontTypeStyleName: string; // references a font styleName from Font Setting tab
  fontSize: string; // px/rem/etc
  fontColor: string; // hex from Colors tab
}

interface TextSettingEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  textKey: string | null;
  value: ThemeTextSettingItem | null;
  onSave: (textKey: string, value: ThemeTextSettingItem) => void;
  disabled?: boolean;
  fontTypeOptions: ThemeFontSetting[];
  colorOptions: ThemeColorSetting[];
  textLabel: string;
}

export const TextSettingEditDialog = ({
  open,
  onOpenChange,
  textKey,
  value,
  onSave,
  disabled = false,
  fontTypeOptions,
  colorOptions,
  textLabel,
}: TextSettingEditDialogProps) => {
  const [styleName, setStyleName] = useState("");
  const [fontTypeStyleName, setFontTypeStyleName] = useState("");
  const [fontSize, setFontSize] = useState("1rem");
  const [fontColor, setFontColor] = useState("#000000");

  const defaultFont = useMemo(
    () => fontTypeOptions.find((f) => !!f.styleName)?.styleName || "",
    [fontTypeOptions]
  );

  const defaultColor = useMemo(
    () => colorOptions.find((c) => !!c.color)?.color || "#000000",
    [colorOptions]
  );

  const validFontTypeOptions = useMemo(
    () => fontTypeOptions.filter((f) => !!f.styleName),
    [fontTypeOptions]
  );

  const validColorOptions = useMemo(
    () => colorOptions.filter((c) => !!c.color),
    [colorOptions]
  );

  useEffect(() => {
    if (!open) return;

    if (value) {
      setStyleName(value.styleName || textLabel);
      setFontTypeStyleName(value.fontTypeStyleName || defaultFont);
      setFontSize(value.fontSize || "1rem");
      setFontColor(value.fontColor || defaultColor);
    } else {
      setStyleName(textLabel);
      setFontTypeStyleName(defaultFont);
      setFontSize("1rem");
      setFontColor(defaultColor);
    }
  }, [open, value, textLabel, defaultFont, defaultColor]);

  const canSave =
    !disabled &&
    !!textKey &&
    styleName.trim().length > 0 &&
    !!fontTypeStyleName &&
    !!fontSize.trim() &&
    !!fontColor.trim();

  const handleApply = () => {
    if (!textKey) return;
    if (!canSave) return;
    onSave(textKey, {
      styleName: styleName.trim(),
      fontTypeStyleName,
      fontSize: fontSize.trim(),
      fontColor,
    });
    onOpenChange(false);
  };

  if (!textKey) return null;

  return (
    <CustomDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit text style"
      description="Choose a font type, set size and color."
      icon={<Type className="w-5 h-5" />}
      maxWidth="max-w-lg"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={disabled}
          >
            Cancel
          </Button>
          <Button
            onClick={handleApply}
            disabled={!canSave}
            className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:from-[var(--accent-primary-hover)] hover:to-[var(--accent-primary)] text-[var(--accent-button-text)]"
          >
            Apply
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="text-style-name">Text style name</Label>
          <Input
            id="text-style-name"
            value={styleName}
            onChange={(e) => setStyleName(e.target.value)}
            placeholder="e.g. CTA Button Text"
            className="bg-[var(--input-background)] border-[var(--glass-border)]"
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label>Font type</Label>
          <Select
            value={fontTypeStyleName}
            onValueChange={(v) => setFontTypeStyleName(v)}
            disabled={disabled || fontTypeOptions.length === 0}
          >
            <SelectTrigger className="w-full bg-[var(--input-background)] border-[var(--glass-border)]">
              <SelectValue placeholder="Select font type" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {validFontTypeOptions.map((f) => (
                <SelectItem key={f.styleName} value={f.styleName}>
                  {f.styleName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {validFontTypeOptions.length === 0 && (
            <p className="text-xs text-muted-foreground">No font types yet</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="text-font-size">Font size</Label>
          <Input
            id="text-font-size"
            value={fontSize}
            onChange={(e) => setFontSize(e.target.value)}
            placeholder="e.g. 18px, 1rem, 2rem"
            className="bg-[var(--input-background)] border-[var(--glass-border)]"
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label>Font color</Label>
          <Select
            value={fontColor}
            onValueChange={(v) => setFontColor(v)}
            disabled={disabled || colorOptions.length === 0}
          >
            <SelectTrigger className="w-full bg-[var(--input-background)] border-[var(--glass-border)]">
              <SelectValue placeholder="Select color" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {validColorOptions.map((c) => (
                <SelectItem key={c.name} value={c.color}>
                  {c.name} ({c.color})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {validColorOptions.length === 0 && (
            <p className="text-xs text-muted-foreground">No colors yet</p>
          )}
        </div>

        <div className="rounded-lg border border-[var(--glass-border)] p-4">
          <p className="text-xs text-muted-foreground mb-2">Preview</p>
          <p
            className="w-full overflow-hidden"
            style={{
              fontFamily: (() => {
                const font = fontTypeOptions.find(
                  (f) => f.styleName === fontTypeStyleName
                );
                return font?.fontFamily ? `${font.fontFamily}, sans-serif` : undefined;
              })(),
              fontSize: fontSize || "1rem",
              color: fontColor || "#000000",
            }}
          >
            The quick brown fox jumps over the lazy dog
          </p>
        </div>
      </div>
    </CustomDialog>
  );
};

