import { useState, useEffect } from "react";
import { Save, Type } from "lucide-react";
import { CustomDialog } from "@/components/ui/custom-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface ThemeTextStyle {
  styleName: string;
  googleFontUrl: string;
  fontFamily: string;
  /** @deprecated Font Setting tab no longer edits size; use Text Setting. Persisted as empty. */
  fontSize?: string;
}

interface TextStyleEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  styleKey: string | null;
  styleLabel: string;
  value: ThemeTextStyle | null;
  onSave: (styleKey: string, style: ThemeTextStyle) => void;
  disabled?: boolean;
}

export function TextStyleEditDialog({
  open,
  onOpenChange,
  styleKey,
  styleLabel,
  value,
  onSave,
  disabled = false,
}: TextStyleEditDialogProps) {
  const [styleName, setStyleName] = useState("");
  const [googleFontUrl, setGoogleFontUrl] = useState("");
  const [fontFamily, setFontFamily] = useState("");
  const [isFontFamilyTouched, setIsFontFamilyTouched] = useState(false);

  useEffect(() => {
    if (open && value) {
      setStyleName(value.styleName || styleLabel);
      setGoogleFontUrl(value.googleFontUrl || "");
      setFontFamily(value.fontFamily || "");
      setIsFontFamilyTouched(!!value.fontFamily);
    } else if (open) {
      setStyleName(styleLabel);
      setGoogleFontUrl("");
      setFontFamily("");
      setIsFontFamilyTouched(false);
    }
  }, [open, value, styleLabel]);

  // Auto-generate font family from Google font link when not manually edited
  useEffect(() => {
    if (!googleFontUrl) return;
    if (isFontFamilyTouched) return;

    try {
      const url = new URL(googleFontUrl);
      const familyParam = url.searchParams.get("family");
      if (!familyParam) return;

      // family=Roboto:wght@400;700 or Pinyon+Script
      const familyPart = familyParam.split(":")[0];
      const decoded = familyPart.replace(/\+/g, " ");

      if (decoded && !fontFamily) {
        setFontFamily(decoded);
      }
    } catch {
      // If not a valid URL, ignore auto-generation
    }
  }, [googleFontUrl, fontFamily, isFontFamilyTouched]);

  const handleApply = () => {
    if (!styleKey) return;
    onSave(styleKey, {
      styleName: styleName || styleLabel,
      googleFontUrl,
      fontFamily,
      fontSize: "",
    });
    onOpenChange(false);
  };

  if (!styleKey) return null;

  return (
    <CustomDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Edit font style"
      description={`Configure font family for ${styleLabel}. Font size is set per text style in the Text Setting tab.`}
      icon={<Type className="w-5 h-5" />}
      sizeWidth="small"
      sizeHeight="large"
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
          <Button type="button" variant="accent" onClick={handleApply} disabled={disabled}>
            <Save className="w-4 h-4 mr-2" />
            Apply
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="style-name">Style name</Label>
          <Input
            id="style-name"
            value={styleName}
            onChange={(e) => setStyleName(e.target.value)}
            placeholder="e.g. H1"
            className="bg-[var(--input-background)] border-[var(--glass-border)]"
            disabled={disabled}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="google-font-link">Google font link</Label>
          <Input
            id="google-font-link"
            type="url"
            value={googleFontUrl}
            onChange={(e) => setGoogleFontUrl(e.target.value)}
            placeholder="https://fonts.googleapis.com/css2?family=Pinyon+Script&display=swap"
            className="bg-[var(--input-background)] border-[var(--glass-border)]"
            disabled={disabled}
          />
          <p className="text-xs text-muted-foreground">
            Link for the Google Font (e.g. Pinyon Script, Roboto).
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="font-family">Font Family * (auto-generated)</Label>
          <Input
            id="font-family"
            value={fontFamily}
            onChange={(e) => {
              setFontFamily(e.target.value);
              setIsFontFamilyTouched(true);
            }}
            placeholder="Pinyon Script, cursive"
            className="bg-[var(--input-background)] border-[var(--glass-border)]"
            disabled={disabled}
          />
          <p className="text-xs text-muted-foreground">
            This will auto-fill from the Google font link. You can override it manually if needed.
          </p>
        </div>
        {googleFontUrl && (
          <div className="rounded-lg border border-[var(--glass-border)] p-4">
            <p className="text-xs text-muted-foreground mb-2">Preview</p>
            <link rel="stylesheet" href={googleFontUrl} />
            <p
              style={{
                fontFamily: fontFamily || "inherit",
                fontSize: "1rem",
              }}
            >
              Sample text in {styleLabel}
            </p>
          </div>
        )}
      </div>
    </CustomDialog>
  );
}
