import { useState, useEffect } from "react";
import type { ContentContainerSettings } from "../types";
import { CustomDialog } from "@/components/ui/custom-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { LayoutTemplate } from "lucide-react";

const DEFAULT_BG = "#ffffff";

interface ContentContainerSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: ContentContainerSettings | null;
  /** When height input is empty, this value is applied (e.g. current canvas height). */
  fallbackMinHeightPx: number;
  onSave: (next: ContentContainerSettings) => void;
}

export function ContentContainerSettingsDialog({
  open,
  onOpenChange,
  settings,
  fallbackMinHeightPx,
  onSave,
}: ContentContainerSettingsDialogProps) {
  const [backgroundColor, setBackgroundColor] = useState<string>(DEFAULT_BG);
  const [minHeightInput, setMinHeightInput] = useState<string>("");

  useEffect(() => {
    if (!open) return;
    setBackgroundColor(settings?.backgroundColor ?? DEFAULT_BG);
    const mh = settings?.minHeightPx;
    setMinHeightInput(mh != null && mh > 0 ? String(mh) : "");
  }, [settings, open]);

  const handleApply = () => {
    const parsed = parseInt(minHeightInput.trim(), 10);
    const minHeightPx = Number.isFinite(parsed) && parsed > 0
      ? Math.min(6000, Math.max(1, parsed))
      : Math.min(6000, Math.max(1, Math.round(fallbackMinHeightPx)));

    const next: ContentContainerSettings = { minHeightPx };
    if (backgroundColor && backgroundColor !== DEFAULT_BG) {
      next.backgroundColor = backgroundColor;
    }
    onSave(next);
    onOpenChange(false);
  };

  return (
    <CustomDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Content container settings"
      description="Sets height and optional background for the whole page or header design area. Same dialog pattern as content element settings."
      icon={<LayoutTemplate className="w-5 h-5" />}
      maxWidth="max-w-md"
      footer={
        <>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleApply}>Apply</Button>
        </>
      }
    >
      <div className="space-y-4 pt-1">
        <div className="space-y-2">
          <Label htmlFor="cc-min-h">Design area height (px)</Label>
          <Input
            id="cc-min-h"
            type="number"
            min={1}
            max={6000}
            placeholder="e.g. 960"
            value={minHeightInput}
            onChange={(e) => setMinHeightInput(e.target.value)}
            className="bg-[var(--input-background)] border-[var(--glass-border)]"
          />
          <p className="text-xs text-muted-foreground">
            Matches the white canvas in the editor. You can also drag the resize strip under the canvas.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="cc-bg">Background color</Label>
          <div className="flex items-center gap-2">
            <Input
              id="cc-bg"
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="w-14 h-10 p-1 bg-[var(--input-background)] border border-[var(--glass-border)] cursor-pointer rounded"
            />
            <Input
              type="text"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              placeholder="#ffffff"
              className="flex-1 font-mono text-sm bg-[var(--input-background)] border-[var(--glass-border)]"
            />
          </div>
        </div>

        <div
          className="rounded-lg border border-[var(--glass-border)] p-4"
          style={{ backgroundColor }}
        >
          <p className="text-sm text-muted-foreground">Preview</p>
        </div>
      </div>
    </CustomDialog>
  );
}
