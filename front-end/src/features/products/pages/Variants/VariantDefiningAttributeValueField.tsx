import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProductRelatedAttribute } from "@/features/products/services/productRelatedAttributes";

const inputSm = "bg-[var(--input-background)] border-[var(--glass-border)] text-foreground text-sm h-9";

export interface VariantDefiningAttributeValueFieldProps {
  valueDataType: ProductRelatedAttribute["valueDataType"];
  value: string;
  onChange: (value: string) => void;
  /** When non-empty, value is chosen from this list (variant add/edit). */
  variantOptionValues?: string[] | null;
  readOnly?: boolean;
  /** Tighter control for selector rows (e.g. wizard step 1). */
  compact?: boolean;
}

export function VariantDefiningAttributeValueField({
  valueDataType,
  value,
  onChange,
  variantOptionValues,
  readOnly = false,
  compact = false,
}: VariantDefiningAttributeValueFieldProps) {
  const options = (variantOptionValues ?? []).map((s) => String(s).trim()).filter(Boolean);
  let displayOptions = [...options];
  const trimmedCurrent = (value ?? "").trim();
  if (trimmedCurrent && !displayOptions.includes(trimmedCurrent)) {
    displayOptions = [...displayOptions, trimmedCurrent];
  }
  const useOptions = displayOptions.length > 0;

  if (useOptions) {
    return (
      <Select value={value || undefined} onValueChange={onChange} disabled={readOnly}>
        <SelectTrigger
          className={`${inputSm} w-full min-w-0 ${compact ? "h-9" : ""}`}
          aria-label="Attribute value"
        >
          <SelectValue placeholder="Select value…" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border max-h-60">
          {displayOptions.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (valueDataType === "number") {
    return (
      <Input
        type="number"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter number…"
        disabled={readOnly}
        className={`${inputSm} ${compact ? "w-48" : "w-full"}`}
      />
    );
  }

  if (valueDataType === "boolean") {
    return (
      <Select
        value={value === "" ? undefined : value}
        onValueChange={onChange}
        disabled={readOnly}
      >
        <SelectTrigger className={`${inputSm} ${compact ? "w-48" : "w-full"}`} aria-label="Boolean value">
          <SelectValue placeholder="Select…" />
        </SelectTrigger>
        <SelectContent className="bg-popover border-border">
          <SelectItem value="true">True</SelectItem>
          <SelectItem value="false">False</SelectItem>
        </SelectContent>
      </Select>
    );
  }

  if (valueDataType === "date") {
    return (
      <Input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={readOnly}
        className={`${inputSm} ${compact ? "w-48" : "w-full"}`}
      />
    );
  }

  if (valueDataType === "json") {
    return (
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter JSON…"
        disabled={readOnly}
        rows={compact ? 2 : 4}
        className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground text-sm disabled:opacity-50"
      />
    );
  }

  return (
    <Input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Enter value…"
      disabled={readOnly}
      className={`${inputSm} ${compact ? "w-48" : "w-full"}`}
    />
  );
}
