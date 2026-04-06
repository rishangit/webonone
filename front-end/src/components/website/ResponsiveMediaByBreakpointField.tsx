import { useState, useMemo } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { getMediaFileUrl } from "@/services/companyWebMedia";
import { SelectMediaDialog } from "@/components/common/SelectMediaDialog";
import type { BreakpointName } from "@/pages/website/WebpageEditor/types";
import { ResponsiveBreakpointTabs } from "./ResponsiveBreakpointTabs";
import { resolvePathForBreakpoint } from "@/pages/website/WebpageEditor/responsiveBreakpointUtils";

export interface ResponsiveMediaByBreakpointFieldProps {
  companyId: string;
  /** Per-breakpoint media paths; empty string clears a slot. */
  value: Partial<Record<BreakpointName, string>>;
  onChange: (next: Partial<Record<BreakpointName, string>>) => void;
  /** Pre–per-breakpoint single path; used as fallback when a breakpoint has no asset. */
  legacyPath?: string;
  label?: string;
  selectDialogTitle?: string;
  disabled?: boolean;
}

const resolveUrl = (companyId: string, path: string) =>
  path ? getMediaFileUrl(companyId, path) : "";

/**
 * Pick or upload a different image per responsive breakpoint (sm–2xl).
 * Reusable for image addons and any future media-by-viewport flows.
 */
export function ResponsiveMediaByBreakpointField({
  companyId,
  value,
  onChange,
  legacyPath = "",
  label = "Image media by screen size",
  selectDialogTitle = "Select image media",
  disabled = false,
}: ResponsiveMediaByBreakpointFieldProps) {
  const [activeBp, setActiveBp] = useState<BreakpointName>("2xl");
  const [selectOpen, setSelectOpen] = useState(false);

  const pathForActive = useMemo(
    () => resolvePathForBreakpoint(value, legacyPath, activeBp),
    [value, legacyPath, activeBp]
  );

  const previewUrl = useMemo(
    () => (pathForActive ? resolveUrl(companyId, pathForActive) : ""),
    [companyId, pathForActive]
  );

  const directForActive = value[activeBp]?.trim() ?? "";

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <ResponsiveBreakpointTabs activeTab={activeBp} onTabChange={setActiveBp} />
      </div>
      <p className="text-xs text-muted-foreground">
        Choose an image for each breakpoint. Empty slots use the legacy image or the nearest other size.
      </p>

      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground font-mono">{activeBp}</span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || !companyId}
          onClick={() => setSelectOpen(true)}
        >
          <Pencil className="w-4 h-4 mr-2" />
          {directForActive ? "Change" : "Select"}
        </Button>
      </div>

      {previewUrl ? (
        <div className="rounded-md border border-[var(--glass-border)] p-3">
          <img
            src={previewUrl}
            alt=""
            className="max-h-36 w-auto max-w-full rounded-sm object-contain"
          />
          <p className="text-xs text-muted-foreground mt-2 truncate">{pathForActive}</p>
        </div>
      ) : (
        <div className="rounded-md border border-dashed border-[var(--glass-border)] p-3 text-xs text-muted-foreground">
          No image for this breakpoint yet. Select one or rely on fallback paths.
        </div>
      )}

      <SelectMediaDialog
        open={selectOpen}
        onOpenChange={setSelectOpen}
        companyId={companyId}
        selectedPath={pathForActive}
        title={selectDialogTitle}
        onSelect={(path) => {
          onChange({ ...value, [activeBp]: path });
          setSelectOpen(false);
        }}
      />
    </div>
  );
}
