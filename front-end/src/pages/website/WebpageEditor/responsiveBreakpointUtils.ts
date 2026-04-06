import type { BreakpointName } from "./types";

/** Tailwind-aligned breakpoints (sm → 2xl), same order as theme text font sizes. */
export const RESPONSIVE_BREAKPOINT_ORDER: readonly BreakpointName[] = [
  "sm",
  "md",
  "lg",
  "xl",
  "2xl",
];

/**
 * Resolve a per-breakpoint media path (e.g. image) for the active viewport breakpoint.
 * 1) Exact key in `byBreakpoint`
 * 2) Legacy single `legacyPath` (pre–per-breakpoint saves)
 * 3) Nearest defined path: same or smaller breakpoint, then larger
 */
export function resolvePathForBreakpoint(
  byBreakpoint: Partial<Record<BreakpointName, string>> | undefined,
  legacyPath: string | undefined,
  breakpoint: BreakpointName
): string {
  const direct = byBreakpoint?.[breakpoint]?.trim();
  if (direct) return direct;

  const legacy = legacyPath?.trim();
  if (legacy) return legacy;

  const order = RESPONSIVE_BREAKPOINT_ORDER as BreakpointName[];
  const idx = order.indexOf(breakpoint);

  for (let i = idx; i >= 0; i--) {
    const p = byBreakpoint?.[order[i]]?.trim();
    if (p) return p;
  }
  for (let i = idx + 1; i < order.length; i++) {
    const p = byBreakpoint?.[order[i]]?.trim();
    if (p) return p;
  }
  return "";
}
