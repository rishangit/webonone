import type { CSSProperties } from 'react';
import type { FormField, FormFieldLayout } from '../types/formDefinition';

const DEFAULT_ROW_SPAN = 2;
const DEFAULT_COL_SPAN = 6;

export function isValidLayout(l: FormFieldLayout | undefined): l is FormFieldLayout {
  if (!l) return false;
  const { gridRowStart, gridColumnStart, rowSpan, colSpan } = l;
  if (
    gridRowStart < 1 ||
    gridColumnStart < 1 ||
    rowSpan < 1 ||
    colSpan < 1 ||
    colSpan > 12 ||
    gridColumnStart + colSpan > 13
  ) {
    return false;
  }
  return true;
}

export function clampFieldLayout(l: FormFieldLayout): FormFieldLayout {
  const colSpan = Math.max(1, Math.min(12, l.colSpan));
  const gridColumnStart = Math.max(1, Math.min(13 - colSpan, l.gridColumnStart));
  const rowSpan = Math.max(1, l.rowSpan);
  const gridRowStart = Math.max(1, l.gridRowStart);
  return { gridRowStart, gridColumnStart, rowSpan, colSpan };
}

export function layoutToGridStyle(l: FormFieldLayout): CSSProperties {
  return {
    gridColumn: `${l.gridColumnStart} / span ${l.colSpan}`,
    gridRow: `${l.gridRowStart} / span ${l.rowSpan}`,
  };
}

export function layoutRowEnd(l: FormFieldLayout): number {
  return l.gridRowStart + l.rowSpan;
}

export function maxLayoutRowEnd(fields: FormField[]): number {
  let max = 0;
  for (const f of fields) {
    if (f.layout) max = Math.max(max, layoutRowEnd(f.layout));
  }
  return max;
}

export function ensureFieldLayouts(fields: FormField[]): FormField[] {
  let maxEnd = 0;
  const clamped = fields.map((field) => {
    if (isValidLayout(field.layout)) {
      const l = clampFieldLayout(field.layout);
      maxEnd = Math.max(maxEnd, layoutRowEnd(l));
      return { ...field, layout: l };
    }
    return field;
  });

  let rowCursor = maxEnd > 0 ? maxEnd : 1;

  return clamped.map((field) => {
    if (field.layout) return field;
    const layout = clampFieldLayout({
      gridRowStart: rowCursor,
      gridColumnStart: 1,
      rowSpan: DEFAULT_ROW_SPAN,
      colSpan: DEFAULT_COL_SPAN,
    });
    rowCursor = layoutRowEnd(layout);
    return { ...field, layout };
  });
}

export function clampStackZIndex(z: number | undefined): number {
  if (z === undefined || !Number.isFinite(z)) return 0;
  return Math.max(0, Math.min(99, Math.round(z)));
}

/** Canvas-local stacking only — keep well below app modals (z-50+). */
const CANVAS_Z_STRIDE = 1;

export function computeFieldDisplayZIndex(
  field: FormField,
  index: number,
  isSelected: boolean,
  suppressBoost = false
): number {
  const base = clampStackZIndex(field.zIndex) * CANVAS_Z_STRIDE + index + 1;
  if (suppressBoost) return base;
  return isSelected ? base + 1 : base;
}
