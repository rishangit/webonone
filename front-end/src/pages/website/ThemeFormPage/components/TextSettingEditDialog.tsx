import { useEffect, useMemo, useState } from "react";
import { CustomDialog } from "@/components/ui/custom-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResponsiveBreakpointTabs } from "@/components/website/ResponsiveBreakpointTabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, Type } from "lucide-react";
import type {
  ThemeColorSetting,
  ThemeFontSetting,
} from "@/services/companyWebThemes";

export interface ThemeTextSettingItem {
  styleName: string; // display name for the text style
  fontTypeStyleName: string; // references a font styleName from Font Setting tab
  fontSize: string; // px/rem/etc
  fontSizeByBreakpoint?: Partial<Record<ThemeTextSizeBreakpoint, string>>;
  fontColor: string; // hex from Colors tab
}

type ThemeTextSizeBreakpoint = "sm" | "md" | "lg" | "xl" | "2xl";

const BREAKPOINT_TABS: ThemeTextSizeBreakpoint[] = ["sm", "md", "lg", "xl", "2xl"];

const buildDefaultFontSizes = (base: string = "1rem"): Record<ThemeTextSizeBreakpoint, string> => ({
  sm: base,
  md: base,
  lg: base,
  xl: base,
  "2xl": base,
});

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
  const [fontSizes, setFontSizes] = useState<Record<ThemeTextSizeBreakpoint, string>>(
    buildDefaultFontSizes("1rem")
  );
  const [activeSizeTab, setActiveSizeTab] = useState<ThemeTextSizeBreakpoint>("2xl");
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
      const fallback = value.fontSize || "1rem";
      setFontSizes({
        ...buildDefaultFontSizes(fallback),
        ...(value.fontSizeByBreakpoint ?? {}),
      });
      setActiveSizeTab("2xl");
      setFontColor(value.fontColor || defaultColor);
    } else {
      setStyleName(textLabel);
      setFontTypeStyleName(defaultFont);
      setFontSizes(buildDefaultFontSizes("1rem"));
      setActiveSizeTab("2xl");
      setFontColor(defaultColor);
    }
  }, [open, value, textLabel, defaultFont, defaultColor]);

  const canSave =
    !disabled &&
    !!textKey &&
    styleName.trim().length > 0 &&
    !!fontTypeStyleName &&
    BREAKPOINT_TABS.every((bp) => !!fontSizes[bp]?.trim()) &&
    !!fontColor.trim();

  const handleApply = () => {
    if (!textKey) return;
    if (!canSave) return;
    onSave(textKey, {
      styleName: styleName.trim(),
      fontTypeStyleName,
      fontSize: fontSizes["2xl"].trim(),
      fontSizeByBreakpoint: Object.fromEntries(
        BREAKPOINT_TABS.map((bp) => [bp, fontSizes[bp].trim()])
      ) as Record<ThemeTextSizeBreakpoint, string>,
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
      sizeWidth="medium"
      sizeHeight="large"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-10 px-4 border-[var(--glass-border)] text-foreground hover:bg-accent"
            onClick={() => onOpenChange(false)}
            disabled={disabled}
          >
            Cancel
          </Button>
          <Button type="button" variant="accent" onClick={handleApply} disabled={!canSave}>
            <Save className="w-4 h-4 mr-2" />
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
          <Label>Font size by screen size</Label>
          <ResponsiveBreakpointTabs
            activeTab={activeSizeTab}
            onTabChange={(v) => setActiveSizeTab(v as ThemeTextSizeBreakpoint)}
          />
          <Input
            id="text-font-size"
            value={fontSizes[activeSizeTab]}
            onChange={(e) =>
              setFontSizes((prev) => ({
                ...prev,
                [activeSizeTab]: e.target.value,
              }))
            }
            placeholder={`e.g. 18px, 1rem, 2rem for ${activeSizeTab}`}
            className="bg-[var(--input-background)] border-[var(--glass-border)]"
            disabled={disabled}
          />
          <p className="text-xs text-muted-foreground">
            Set font size for each breakpoint. Page editor uses these values on matching screen size.
          </p>
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
              fontSize: fontSizes[activeSizeTab] || "1rem",
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

