import { useEffect, useMemo, useRef, useState } from "react";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  productRelatedAttributesService,
  type ProductRelatedAttribute,
} from "@/features/products/services/productRelatedAttributes";
import { productRelatedAttributeValuesService } from "@/features/products/services/productRelatedAttributeValues";
import { unitsOfMeasureService, type UnitsOfMeasure } from "@/features/products/services/unitsOfMeasure";
import type { CompanyProductVariant } from "@/features/products/services/companyProductVariants";

type ValueMap = Record<string, string>;

interface CompanyProductAttributesDisplayProps {
  systemProductId: string | null;
  variants?: CompanyProductVariant[];
  variantsLoading?: boolean;
  selectedVariantId?: string | null;
  onVariantSelect?: (variant: CompanyProductVariant | null) => void;
}

export const CompanyProductAttributesDisplay = ({
  systemProductId,
  variants = [],
  variantsLoading = false,
  selectedVariantId = null,
  onVariantSelect,
}: CompanyProductAttributesDisplayProps) => {
  const [productAttributes, setProductAttributes] = useState<ProductRelatedAttribute[]>([]);
  const [variantValues, setVariantValues] = useState<Record<string, ValueMap>>({});
  const [picks, setPicks] = useState<ValueMap>({});
  const [unitsOfMeasure, setUnitsOfMeasure] = useState<UnitsOfMeasure[]>([]);
  const [loadingAttrs, setLoadingAttrs] = useState(false);
  const [loadingValues, setLoadingValues] = useState(false);
  const userPickedRef = useRef(false);

  // Fetch product-related attributes + units of measure
  useEffect(() => {
    let cancelled = false;
    if (!systemProductId) {
      setProductAttributes([]);
      return () => {};
    }
    setLoadingAttrs(true);
    Promise.all([
      productRelatedAttributesService.getAttributesByProductId(systemProductId),
      unitsOfMeasureService.getActiveUnits(),
    ])
      .then(([attrs, units]) => {
        if (cancelled) return;
        setProductAttributes(attrs);
        setUnitsOfMeasure(units);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        console.error("Failed to load product attributes:", err);
        setProductAttributes([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingAttrs(false);
      });
    return () => {
      cancelled = true;
    };
  }, [systemProductId]);

  // Fetch attribute values for every company variant.
  // Each company variant maps to its own values, falling back to the linked
  // system variant's values when a particular attribute isn't overridden.
  useEffect(() => {
    let cancelled = false;
    if (!variants || variants.length === 0) {
      setVariantValues({});
      return () => {};
    }
    setLoadingValues(true);

    const loadVariantMap = async (
      v: CompanyProductVariant,
    ): Promise<{ id: string; map: ValueMap }> => {
      const map: ValueMap = {};
      try {
        const companyRows = await productRelatedAttributeValuesService.getValuesByVariantId(v.id);
        for (const row of companyRows) {
          const val = row.attributeValue?.trim() ?? "";
          if (val) map[row.productRelatedAttributeId] = val;
        }
      } catch {
        // fall through to system fallback
      }
      if (v.systemProductVariantId) {
        try {
          const sysRows = await productRelatedAttributeValuesService.getValuesByVariantId(
            v.systemProductVariantId,
          );
          for (const row of sysRows) {
            const val = row.attributeValue?.trim() ?? "";
            if (val && !map[row.productRelatedAttributeId]) {
              map[row.productRelatedAttributeId] = val;
            }
          }
        } catch {
          // ignore
        }
      }
      return { id: v.id, map };
    };

    Promise.all(variants.map(loadVariantMap))
      .then((results) => {
        if (cancelled) return;
        const next: Record<string, ValueMap> = {};
        for (const r of results) next[r.id] = r.map;
        setVariantValues(next);
      })
      .finally(() => {
        if (!cancelled) setLoadingValues(false);
      });
    return () => {
      cancelled = true;
    };
  }, [variants]);

  // Variant-defining attributes that have multiple predefined option values
  const selectableAttrs = useMemo(
    () =>
      productAttributes.filter(
        (attr) => Array.isArray(attr.variantOptionValues) && attr.variantOptionValues.length > 1,
      ),
    [productAttributes],
  );

  // Sync picks from currently selected variant when the user has not interacted
  useEffect(() => {
    if (userPickedRef.current) return;
    if (!selectedVariantId) return;
    const map = variantValues[selectedVariantId];
    if (map) setPicks(map);
  }, [selectedVariantId, variantValues]);

  // Initial auto-select: pick default (or first) variant if none is selected yet
  useEffect(() => {
    if (userPickedRef.current) return;
    if (selectedVariantId) return;
    if (variantsLoading || loadingValues) return;
    if (variants.length === 0) return;
    const target = variants.find((v) => v.isDefault) ?? variants[0];
    if (!target) return;
    const map = variantValues[target.id];
    if (!map) return;
    setPicks(map);
    onVariantSelect?.(target);
  }, [
    selectedVariantId,
    variants,
    variantsLoading,
    loadingValues,
    variantValues,
    onVariantSelect,
  ]);

  const findMatchingVariant = (next: ValueMap): CompanyProductVariant | null => {
    const required = selectableAttrs.map((a) => a.id);
    if (required.length === 0) return null;
    if (required.some((id) => !next[id])) return null;
    const match = variants.find((v) => {
      const map = variantValues[v.id] || {};
      return required.every((id) => map[id] === next[id]);
    });
    return match ?? null;
  };

  const handlePick = (productRelatedAttributeId: string, value: string) => {
    userPickedRef.current = true;
    const next: ValueMap = { ...picks, [productRelatedAttributeId]: value };
    setPicks(next);
    const match = findMatchingVariant(next);
    if (match) onVariantSelect?.(match);
  };

  const getUnit = (unitOfMeasureId: string | null | undefined) => {
    if (!unitOfMeasureId) return null;
    return unitsOfMeasure.find((u) => u.id === unitOfMeasureId) ?? null;
  };

  const formatValue = (value: string, dataType?: string, unitOfMeasureId?: string | null) => {
    if (!value) return "—";
    const unit = getUnit(unitOfMeasureId);
    const unitSymbol = unit ? unit.symbol : "";
    switch (dataType) {
      case "number":
        return `${value}${unitSymbol ? ` ${unitSymbol}` : ""}`;
      case "boolean":
        return value === "true" ? "Yes" : value === "false" ? "No" : value;
      case "date":
        try {
          return new Date(value).toLocaleDateString();
        } catch {
          return value;
        }
      default:
        return `${value}${unitSymbol ? ` ${unitSymbol}` : ""}`;
    }
  };

  if (!systemProductId) return null;

  if (loadingAttrs) {
    return (
      <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
        <h3 className="font-semibold text-foreground mb-4">Product Attributes</h3>
        <div className="text-sm text-muted-foreground">Loading attributes…</div>
      </Card>
    );
  }

  if (productAttributes.length === 0) {
    return (
      <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
        <h3 className="font-semibold text-foreground mb-4">Product Attributes</h3>
        <div className="text-sm text-muted-foreground">No attributes assigned to this product.</div>
      </Card>
    );
  }

  const matchedVariant = findMatchingVariant(picks);
  const allPicked = selectableAttrs.every((a) => picks[a.id]);

  // For non-pickable rows, show values from the matched variant when available;
  // otherwise fall back to the externally selected variant.
  const valuesSource: ValueMap = matchedVariant
    ? variantValues[matchedVariant.id] ?? {}
    : selectedVariantId
      ? variantValues[selectedVariantId] ?? {}
      : {};

  return (
    <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
      <h3 className="font-semibold text-foreground mb-4">Product Attributes</h3>

      <div className="space-y-3">
        {productAttributes.map((attr, index) => {
          const options = (attr.variantOptionValues ?? []).filter(Boolean);
          const isPickable = options.length > 1;
          const fixedSingleOption = options.length === 1 ? options[0] : "";
          const pickValue = picks[attr.id] ?? "";
          const displayValue = (valuesSource[attr.id] ?? "") || fixedSingleOption;
          const unit = getUnit(attr.unitOfMeasure);

          return (
            <div key={attr.id}>
              <div className="flex items-center justify-between gap-3">
                <Label className="text-sm font-medium text-foreground">
                  {attr.attributeName || "Attribute"}
                  {unit && (
                    <span className="text-muted-foreground font-normal ml-1">({unit.symbol})</span>
                  )}
                </Label>
                <div className="text-sm text-foreground flex-shrink-0">
                  {isPickable ? (
                    <Select
                      value={pickValue || undefined}
                      onValueChange={(v) => handlePick(attr.id, v)}
                      disabled={variantsLoading || loadingValues}
                    >
                      <SelectTrigger
                        className="w-44 sm:w-56 bg-[var(--input-background)] border-[var(--glass-border)] text-foreground h-9"
                        aria-label={attr.attributeName ?? "Attribute"}
                      >
                        <SelectValue placeholder="Select…" />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border">
                        {options.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : displayValue ? (
                    <span className="font-medium">
                      {formatValue(displayValue, attr.valueDataType, attr.unitOfMeasure)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground italic">No value set</span>
                  )}
                </div>
              </div>
              {index < productAttributes.length - 1 && <Separator className="mt-3" />}
            </div>
          );
        })}
      </div>

      {selectableAttrs.length > 0 && (
        <div className="mt-4 pt-3 border-t border-[var(--glass-border)] space-y-2">
          {matchedVariant ? (
            <>
              <div className="flex items-center justify-between gap-3">
                <Label className="text-muted-foreground">Variant</Label>
                <span className="text-foreground">{matchedVariant.name}</span>
              </div>
              {matchedVariant.sku && (
                <div className="flex items-center justify-between gap-3">
                  <Label className="text-muted-foreground">SKU</Label>
                  <span className="text-foreground">{matchedVariant.sku}</span>
                </div>
              )}
              <div className="flex items-center gap-2 pt-1 flex-wrap">
                {matchedVariant.isDefault && (
                  <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30 text-xs">
                    <Star className="w-3 h-3 mr-1 fill-current" /> Default
                  </Badge>
                )}
                {!matchedVariant.isActive && (
                  <Badge variant="outline" className="text-xs border-[var(--glass-border)]">
                    Inactive
                  </Badge>
                )}
              </div>
            </>
          ) : (
            <p className="text-muted-foreground">
              {allPicked
                ? "No variant matches this combination."
                : "Select a value for each attribute to see the matching variant."}
            </p>
          )}
        </div>
      )}
    </Card>
  );
};
