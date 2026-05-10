import { useEffect, useState } from "react";
import { ListChecks, Plus, Save, Trash2 } from "lucide-react";
import { CustomDialog } from "@/components/ui/custom-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  productRelatedAttributesService,
  type ProductRelatedAttribute,
} from "@/features/products/services/productRelatedAttributes";
import { toast } from "sonner";

export interface SetProductAttributeVariantOptionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productRelatedAttribute: ProductRelatedAttribute | null;
  onSaved: () => void;
}

function normalizeList(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values) {
    const t = v.trim();
    if (!t || seen.has(t)) continue;
    seen.add(t);
    out.push(t);
  }
  return out;
}

export function SetProductAttributeVariantOptionsDialog({
  open,
  onOpenChange,
  productRelatedAttribute,
  onSaved,
}: SetProductAttributeVariantOptionsDialogProps) {
  const [rows, setRows] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open && productRelatedAttribute) {
      const initial = productRelatedAttribute.variantOptionValues ?? [];
      setRows(initial.length > 0 ? [...initial] : []);
      setDraft("");
    }
  }, [open, productRelatedAttribute]);

  const titleName = productRelatedAttribute?.attributeName ?? "Attribute";

  const footer = (
    <>
      <Button
        type="button"
        variant="outline"
        size="default"
        className="h-10 px-4 border-[var(--glass-border)] text-foreground hover:bg-accent"
        disabled={saving}
        onClick={() => onOpenChange(false)}
      >
        Cancel
      </Button>
      <Button
        type="button"
        variant="accent"
        size="default"
        className="h-10"
        disabled={saving || !productRelatedAttribute}
        onClick={async () => {
          if (!productRelatedAttribute) return;
          const normalized = normalizeList(rows);
          setSaving(true);
          try {
            await productRelatedAttributesService.updateAttribute(productRelatedAttribute.id, {
              variantOptionValues: normalized.length > 0 ? normalized : null,
            });
            toast.success("Variant values saved");
            onSaved();
            onOpenChange(false);
          } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Failed to save";
            toast.error(msg);
          } finally {
            setSaving(false);
          }
        }}
      >
        <Save className="w-4 h-4 mr-2" />
        {saving ? "Saving…" : "Save"}
      </Button>
    </>
  );

  return (
    <CustomDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Set variant values"
      description={`Define one or more allowed values for “${titleName}”. Variants with this attribute as variant-defining will pick from this list.`}
      icon={<ListChecks className="w-5 h-5" />}
      sizeWidth="small"
      sizeHeight="medium"
      footer={footer}
    >
      <div className="space-y-4">
        <div>
          <Label className="text-foreground text-sm">Add a value</Label>
          <p className="text-xs text-muted-foreground mt-1">
            Type a value and press Enter or click Add. Added values appear in the list below.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 sm:items-center">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                const t = draft.trim();
                if (!t) return;
                if (rows.some((r) => r.trim() === t)) {
                  setDraft("");
                  return;
                }
                setRows((prev) => [...prev, t]);
                setDraft("");
              }
            }}
            placeholder="New value"
            className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground h-10 flex-1"
          />
          <Button
            type="button"
            variant="outline"
            className="h-10 border-[var(--glass-border)] shrink-0"
            disabled={!productRelatedAttribute || draft.trim().length === 0}
            onClick={() => {
              const t = draft.trim();
              if (!t) return;
              if (rows.some((r) => r.trim() === t)) {
                setDraft("");
                return;
              }
              setRows((prev) => [...prev, t]);
              setDraft("");
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add value
          </Button>
        </div>

        <div>
          <Label className="text-foreground text-sm">Added values</Label>
          <p className="text-xs text-muted-foreground mt-1">
            {rows.length === 0
              ? "No values yet. Add one above."
              : "Edit a value inline or remove it. Empty rows are ignored when you save."}
          </p>
        </div>

        <ScrollArea className="max-h-[min(40vh,260px)] pr-3">
          <div className="space-y-2">
            {rows.map((row, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  value={row}
                  onChange={(e) => {
                    const next = [...rows];
                    next[index] = e.target.value;
                    setRows(next);
                  }}
                  placeholder={`Value ${index + 1}`}
                  className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground h-10"
                  disabled={!productRelatedAttribute}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 shrink-0 text-[oklch(0.637_0.237_25.331)] hover:text-[oklch(0.637_0.237_25.331)] hover:bg-red-500/10"
                  aria-label="Remove value"
                  onClick={() => setRows((prev) => prev.filter((_, i) => i !== index))}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </CustomDialog>
  );
}
