import type { CSSProperties } from "react";
import type { AddonGridLayout, BreakpointName, ContentAddon } from "../types";

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

export function resolveAddonLayout(
  addon: ContentAddon,
  breakpoint: BreakpointName = "2xl"
): AddonGridLayout | undefined {
  const fromMap = addon.layoutByBreakpoint?.[breakpoint];
  if (isValidLayout(fromMap)) return clampAddonLayout(fromMap);
  if (isValidLayout(addon.layout)) return clampAddonLayout(addon.layout);
  return undefined;
}

export function withAddonLayoutForBreakpoint(
  addon: ContentAddon,
  breakpoint: BreakpointName,
  layout: AddonGridLayout
): ContentAddon {
  const clamped = clampAddonLayout(layout);
  return {
    ...addon,
    layout: breakpoint === "2xl" ? clamped : addon.layout ?? clamped,
    layoutByBreakpoint: {
      ...(addon.layoutByBreakpoint ?? {}),
      [breakpoint]: clamped,
    },
  };
}

/** Normalize `layout` to the active breakpoint value and backfill missing map entries. */
export function ensureAddonLayoutsForBreakpoint(
  addons: ContentAddon[],
  breakpoint: BreakpointName = "2xl"
): ContentAddon[] {
  const seeded = ensureAddonLayouts(addons);
  return seeded.map((addon) => {
    const resolved = resolveAddonLayout(addon, breakpoint) ?? addon.layout;
    if (!resolved) return addon;
    // Runtime projection: render/edit against the active breakpoint layout.
    // Do not mutate layoutByBreakpoint here; persistence happens on explicit updates.
    return {
      ...addon,
      layout: resolved,
    };
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

/** Highest stored stacking value among addons in a block (for assigning the next layer). */
export function maxStoredAddonZIndex(addons: ContentAddon[]): number {
  let m = 0;
  for (const a of addons) {
    if (a.zIndex != null && a.zIndex > m) m = a.zIndex;
  }
  return m;
}

/** Next `zIndex` for a newly added addon so it starts on its own layer above existing ones. */
export function nextAddonStackZIndex(addons: ContentAddon[]): number {
  return clampStackZIndex(maxStoredAddonZIndex(addons) + 1);
}

/** Multiplier so stored `zIndex` always beats array-order tie-break (max ~100 addons). */
const Z_INDEX_LAYER_STRIDE = 1000;

/**
 * Max value from `(zIndex × stride) + stackIndex`. Interaction boosts sit above this so
 * selected/drag/resize never paint under another addon; stored `addon.zIndex` is unchanged.
 */
const MAX_ADDON_BASE_LAYER = ADDON_Z_MAX * Z_INDEX_LAYER_STRIDE + 1000;

const Z_BOOST_SELECTED = MAX_ADDON_BASE_LAYER + 1;
const Z_BOOST_RESIZE = MAX_ADDON_BASE_LAYER + 2;
const Z_BOOST_DRAG = MAX_ADDON_BASE_LAYER + 3;

export type AddonDisplayInteraction = "drag" | "selected" | "resize" | "none";

/** CSS `z-index`: stored stacking + temporary interaction lift (not persisted). */
export function computeAddonDisplayZIndex(
  addon: ContentAddon,
  stackIndex: number,
  interaction: AddonDisplayInteraction
): number {
  const base = (addon.zIndex ?? 0) * Z_INDEX_LAYER_STRIDE + stackIndex;
  const boost =
    interaction === "drag"
      ? Z_BOOST_DRAG
      : interaction === "selected"
        ? Z_BOOST_SELECTED
        : interaction === "resize"
          ? Z_BOOST_RESIZE
          : 0;
  return base + boost;
}
