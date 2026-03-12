import { useState, useEffect } from "react";
import { ContentBlock, ContentBlockSettings } from "../types";
import { CustomDialog } from "../../../../components/ui/custom-dialog";
import { TabSwitcher } from "../../../../components/ui/tab-switcher";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Button } from "../../../../components/ui/button";
import { Settings2 } from "lucide-react";

export type ContentBlockSettingsTab = "basic" | "advanced";

interface ContentBlockSettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  block: ContentBlock | null;
  onSave: (block: ContentBlock) => void;
}

const DEFAULT_BG = "#ffffff";

export function ContentBlockSettingsDialog({
  open,
  onOpenChange,
  block,
  onSave,
}: ContentBlockSettingsDialogProps) {
  const [activeTab, setActiveTab] = useState<ContentBlockSettingsTab>("basic");
  const [backgroundColor, setBackgroundColor] = useState<string>(DEFAULT_BG);

  useEffect(() => {
    if (block) {
      setBackgroundColor(block.settings?.backgroundColor ?? DEFAULT_BG);
    }
  }, [block, open]);

  const handleApply = () => {
    if (!block) return;
    const settings: ContentBlockSettings = {
      ...block.settings,
      backgroundColor: backgroundColor || undefined,
    };
    if (!backgroundColor || backgroundColor === DEFAULT_BG) {
      delete settings.backgroundColor;
    }
    onSave({ ...block, settings: Object.keys(settings).length > 0 ? settings : undefined });
    onOpenChange(false);
  };

  if (!block) return null;

  return (
    <CustomDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Content element settings"
      description="Configure appearance and options for this block."
      icon={<Settings2 className="w-5 h-5" />}
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
      <div className="space-y-4">
        <TabSwitcher
          tabs={[
            { value: "basic", label: "Basic setting" },
            { value: "advanced", label: "Advanced setting" },
          ]}
          activeTab={activeTab}
          onTabChange={(v) => setActiveTab(v as ContentBlockSettingsTab)}
        />

        {activeTab === "basic" && (
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="block-bg-color">Background color</Label>
              <div className="flex items-center gap-2">
                <Input
                  id="block-bg-color"
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
              <p className="text-xs text-muted-foreground">
                Pick a color or enter a hex value (e.g. #ffffff).
              </p>
            </div>
            <div
              className="rounded-lg border border-[var(--glass-border)] p-4"
              style={{ backgroundColor }}
            >
              <p className="text-sm text-muted-foreground">Preview</p>
            </div>
          </div>
        )}

        {activeTab === "advanced" && (
          <div className="pt-2 text-sm text-muted-foreground">
            Advanced options will be available here.
          </div>
        )}
      </div>
    </CustomDialog>
  );
}
