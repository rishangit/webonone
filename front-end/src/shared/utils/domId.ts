/** Build a stable kebab-case DOM id from segments. */
export function buildDomId(...segments: string[]): string {
  return segments
    .flatMap((s) => s.split(/[-_\s/]+/))
    .filter(Boolean)
    .map((s) => s.replace(/[^a-zA-Z0-9]/g, "").toLowerCase())
    .join("-");
}

/** Fixed global ids for the authenticated app shell (one instance per document). */
export const APP_LAYOUT_ID = {
  root: buildDomId("app", "layout-root"),
  body: buildDomId("app", "layout-body"),
  header: buildDomId("app", "layout-header"),
  sidebar: buildDomId("app", "layout-sidebar"),
  sidebarNav: buildDomId("app", "layout-sidebar-nav"),
  mainContent: buildDomId("app", "layout-main-content"),
  mobileOverlay: buildDomId("app", "layout-mobile-overlay"),
} as const;

/** Derive dialog section ids from a dialog root id. */
export function dialogSectionIds(dialogId: string) {
  return {
    header: `${dialogId}-header`,
    body: `${dialogId}-body`,
    footer: `${dialogId}-footer`,
  } as const;
}

/** Derive panel section ids from a panel root id. */
export function panelSectionIds(panelId: string) {
  return {
    header: `${panelId}-header`,
    body: `${panelId}-body`,
  } as const;
}
