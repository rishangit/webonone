import { ChevronDown, ChevronUp, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatAvatarUrl } from "@/shared/utils";

export interface ServiceWizardImageGridProps {
  images: string[];
  onRemove: (index: number) => void;
  /** Prefix for img alt text, e.g. "service" → "service-0" */
  altPrefix?: string;
  /** When set, show reorder controls (first image stays primary). */
  onMoveUp?: (index: number) => void;
  onMoveDown?: (index: number) => void;
}

export function ServiceWizardImageGrid({
  images,
  onRemove,
  altPrefix = "service",
  onMoveUp,
  onMoveDown,
}: ServiceWizardImageGridProps) {
  const reorderEnabled = Boolean(onMoveUp && onMoveDown);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {images.map((img, idx) => (
        <div
          key={`${img}-${idx}`}
          className="relative flex flex-col overflow-hidden rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-sm"
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden">
            <img src={formatAvatarUrl(img)} alt={`${altPrefix}-${idx}`} className="h-full w-full object-cover" />
          </div>
          <div className="p-3 text-xs text-muted-foreground flex flex-col gap-2 border-t border-[var(--glass-border)]">
            <div className="flex items-center justify-between gap-1">
              <span>{idx === 0 ? "Primary" : `Image ${idx + 1}`}</span>
              <Button type="button" variant="ghost" size="sm" className="text-destructive h-auto px-2 shrink-0" onClick={() => onRemove(idx)}>
                Remove
              </Button>
            </div>
            {reorderEnabled && onMoveUp && onMoveDown && (
              <div className="flex items-center justify-end gap-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 border-[var(--glass-border)]"
                  disabled={idx === 0}
                  onClick={() => onMoveUp(idx)}
                  aria-label="Move image up"
                >
                  <ChevronUp className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 px-2 border-[var(--glass-border)]"
                  disabled={idx >= images.length - 1}
                  onClick={() => onMoveDown(idx)}
                  aria-label="Move image down"
                >
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      ))}
      {images.length === 0 && (
        <div className="col-span-full text-sm text-muted-foreground rounded-lg border border-dashed border-[var(--glass-border)] bg-[var(--glass-bg)] p-6 text-center backdrop-blur-sm">
          <ImageIcon className="mx-auto mb-2 h-8 w-8 opacity-50" aria-hidden />
          <p>No images added yet.</p>
        </div>
      )}
    </div>
  );
}
