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
import { Sparkles } from "lucide-react";
import type {
  ThemeButtonSetting,
  ThemeColorSetting,
} from "@/services/companyWebThemes";
import type { ThemeTextSettingItem } from "./TextSettingEditDialog";

interface ButtonEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buttonKey: string | null;
  buttonLabel: string;
  value: ThemeButtonSetting | null;
  onSave: (buttonKey: string, value: ThemeButtonSetting) => void;
  disabled?: boolean;
  colorOptions: ThemeColorSetting[];
  textStyleOptions: ThemeTextSettingItem[];
}

export const ButtonEditDialog = ({
  open,
  onOpenChange,
  buttonKey,
  buttonLabel,
  value,
  onSave,
  disabled = false,
  colorOptions,
  textStyleOptions,
}: ButtonEditDialogProps) => {
  const [buttonName, setButtonName] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("");
  const [fontColor, setFontColor] = useState("");
  const [borderColor, setBorderColor] = useState("");
  const [textStyleName, setTextStyleName] = useState("");
  const [borderRadius, setBorderRadius] = useState("8px");

  const colorDefault = useMemo(() => colorOptions[0]?.color || "#000000", [colorOptions]);
  const fontDefault = useMemo(() => colorOptions[1]?.color || "#ffffff", [colorOptions]);
  const borderDefault = useMemo(() => colorOptions[0]?.color || "#000000", [colorOptions]);
  const validColorOptions = useMemo(
    () => colorOptions.filter((c) => !!c.color),
    [colorOptions]
  );
  const validTextStyleOptions = useMemo(
    () => textStyleOptions.filter((ts) => !!ts.styleName),
    [textStyleOptions]
  );

  useEffect(() => {
    if (!open) return;

    if (value) {
      setButtonName(value.buttonName || buttonLabel);
      setBackgroundColor(value.backgroundColor || colorDefault);
      setFontColor(value.fontColor || fontDefault);
      setBorderColor(value.borderColor || borderDefault);
      setTextStyleName(value.textStyleName || "");
      setBorderRadius(value.borderRadius || "8px");
    } else {
      setButtonName(buttonLabel);
      setBackgroundColor(colorDefault);
      setFontColor(fontDefault);
      setBorderColor(borderDefault);
      setTextStyleName(validTextStyleOptions[0]?.styleName || "");
      setBorderRadius("8px");
    }
  }, [
    open,
    value,
    buttonLabel,
    colorDefault,
    fontDefault,
    borderDefault,
    validTextStyleOptions,
  ]);

  const canSave =
    !disabled &&
    !!buttonKey &&
    buttonName.trim().length > 0 &&
    !!backgroundColor &&
    !!fontColor &&
    !!borderColor &&
    !!textStyleName &&
    borderRadius.trim().length > 0;

  const handleApply = () => {
    if (!buttonKey) return;
    if (!canSave) return;

    onSave(buttonKey, {
      buttonName: buttonName.trim(),
      backgroundColor,
      fontColor,
      borderColor,
      textStyleName,
      borderRadius: borderRadius.trim(),
    });
    onOpenChange(false);
  };

  if (!buttonKey) return null;

  return (
    <CustomDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Configure button"
      description="Pick colors and a text style for the button."
      icon={<Sparkles className="w-5 h-5" />}
      maxWidth="max-w-lg"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={disabled}>
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
          <Label htmlFor="button-name">Button name</Label>
          <Input
            id="button-name"
            value={buttonName}
            onChange={(e) => setButtonName(e.target.value)}
            placeholder="e.g. Primary CTA"
            className="bg-[var(--input-background)] border-[var(--glass-border)]"
            disabled={disabled}
          />
        </div>

        <div className="space-y-2">
          <Label>Button text style</Label>
          <Select
            value={textStyleName}
            onValueChange={(v) => setTextStyleName(v)}
            disabled={disabled || textStyleOptions.length === 0}
          >
            <SelectTrigger className="w-full bg-[var(--input-background)] border-[var(--glass-border)]">
              <SelectValue placeholder="Select a text style" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {validTextStyleOptions.map((ts) => (
                <SelectItem key={ts.styleName} value={ts.styleName}>
                  {ts.styleName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {validTextStyleOptions.length === 0 && (
            <p className="text-xs text-muted-foreground">No text styles yet</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Background color</Label>
            <Select
              value={backgroundColor}
              onValueChange={(v) => setBackgroundColor(v)}
              disabled={disabled || colorOptions.length === 0}
            >
              <SelectTrigger className="w-full bg-[var(--input-background)] border-[var(--glass-border)]">
                <SelectValue placeholder="Pick a color" />
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

          <div className="space-y-2">
            <Label>Font color</Label>
            <Select
              value={fontColor}
              onValueChange={(v) => setFontColor(v)}
              disabled={disabled || colorOptions.length === 0}
            >
              <SelectTrigger className="w-full bg-[var(--input-background)] border-[var(--glass-border)]">
                <SelectValue placeholder="Pick a color" />
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
        </div>

        <div className="space-y-2">
          <Label>Border color</Label>
          <Select
            value={borderColor}
            onValueChange={(v) => setBorderColor(v)}
            disabled={disabled || colorOptions.length === 0}
          >
            <SelectTrigger className="w-full bg-[var(--input-background)] border-[var(--glass-border)]">
              <SelectValue placeholder="Pick a color" />
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

        <div className="space-y-2">
          <Label htmlFor="border-radius">Border radius</Label>
          <Input
            id="border-radius"
            value={borderRadius}
            onChange={(e) => setBorderRadius(e.target.value)}
            placeholder="e.g. 8px"
            className="bg-[var(--input-background)] border-[var(--glass-border)]"
            disabled={disabled}
          />
        </div>
      </div>
    </CustomDialog>
  );
};

