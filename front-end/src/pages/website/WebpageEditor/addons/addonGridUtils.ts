import type { CSSProperties } from "react";
import type { AddonGridLayout, ContentAddon } from "../types";

const DEFAULT_ROW_SPAN = 2;
const DEFAULT_COL_SPAN = 12;

export function isValidLayout(l: AddonGridLayout | undefined): l is AddonGridLayout {
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

export function clampAddonLayout(l: AddonGridLayout): AddonGridLayout {
  const colSpan = Math.max(1, Math.min(12, l.colSpan));
  const gridColumnStart = Math.max(1, Math.min(13 - colSpan, l.gridColumnStart));
  const rowSpan = Math.max(1, l.rowSpan);
  const gridRowStart = Math.max(1, l.gridRowStart);
  return { gridRowStart, gridColumnStart, rowSpan, colSpan };
}

export function layoutToGridStyle(l: AddonGridLayout): CSSProperties {
  return {
    gridColumn: `${l.gridColumnStart} / span ${l.colSpan}`,
    gridRow: `${l.gridRowStart} / span ${l.rowSpan}`,
  };
}

/** Row index of the first line after this layout (exclusive). */
export function layoutRowEnd(l: AddonGridLayout): number {
  return l.gridRowStart + l.rowSpan;
}

export function maxLayoutRowEnd(addons: ContentAddon[]): number {
  let max = 0;
  for (const a of addons) {
    if (a.layout) max = Math.max(max, layoutRowEnd(a.layout));
  }
  return max;
}

/**
 * Assigns a default stacked layout for addons missing `layout` (legacy data).
 */
export function ensureAddonLayouts(addons: ContentAddon[]): ContentAddon[] {
  let maxEnd = 0;
  const clamped = addons.map((addon) => {
    if (isValidLayout(addon.layout)) {
      const l = clampAddonLayout(addon.layout);
      maxEnd = Math.max(maxEnd, layoutRowEnd(l));
      return { ...addon, layout: l };
    }
    return addon;
  });

  let rowCursor = maxEnd > 0 ? maxEnd : 1;

  return clamped.map((addon) => {
    if (addon.layout) return addon;
    const layout = clampAddonLayout({
      gridRowStart: rowCursor,
      gridColumnStart: 1,
      rowSpan: DEFAULT_ROW_SPAN,
      colSpan: DEFAULT_COL_SPAN,
    });
    rowCursor = layoutRowEnd(layout);
    return { ...addon, layout };
  });
}

export function defaultLayoutForNewAddon(addons: ContentAddon[]): AddonGridLayout {
  const normalized = ensureAddonLayouts(addons);
  const nextRow = maxLayoutRowEnd(normalized) + 1;
  return clampAddonLayout({
    gridRowStart: nextRow,
    gridColumnStart: 1,
    rowSpan: DEFAULT_ROW_SPAN,
    colSpan: DEFAULT_COL_SPAN,
  });
}

/** Clamp manual stacking values from UI (+ / − buttons). */
export const ADDON_Z_MIN = 0;
export const ADDON_Z_MAX = 9999;

export function clampStackZIndex(z: number): number {
  return Math.max(ADDON_Z_MIN, Math.min(ADDON_Z_MAX, z));
}

const Z_BOOST_DRAG = 1_000_000;
const Z_BOOST_HOVER = 100_000;
const Z_BOOST_RESIZE = 50_000;

/** CSS `z-index` for an addon cell (stored zIndex + tie-break + interaction). */
export function computeAddonDisplayZIndex(
  addon: ContentAddon,
  stackIndex: number,
  interaction: "drag" | "hover" | "resize" | "none"
): number {
  const base = (addon.zIndex ?? 0) * 100 + stackIndex;
  const boost =
    interaction === "drag"
      ? Z_BOOST_DRAG
      : interaction === "hover"
        ? Z_BOOST_HOVER
        : interaction === "resize"
          ? Z_BOOST_RESIZE
          : 0;
  return base + boost;
}
