import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Move, Pencil, X, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { getAddonModuleByType } from "../addons/registry";
import type { ThemeButtonSetting, ThemeTextSetting } from "../../../../services/companyWebThemes";
import type { CompanyWebPage } from "../../../../services/companyWebPages";
import type { AddonRenderContext } from "../addons/types";
import type { AddonGridLayout, ContentAddon, ContentBlock } from "../types";
import {
  clampAddonLayout,
  clampStackZIndex,
  computeAddonDisplayZIndex,
  ensureAddonLayouts,
  layoutToGridStyle,
  maxLayoutRowEnd,
} from "../addons/addonGridUtils";

type ResizeHandle = "n" | "s" | "e" | "w" | "ne" | "nw" | "se" | "sw";

let activeAddonDragKey: string | null = null;

interface AddonGridEditorProps {
  block: ContentBlock;
  addons: ContentAddon[];
  /** Only this addon may be dragged/resized; must match global editor selection. */
  selectedAddonId?: string | null;
  onSelectAddon?: (addonId: string) => void;
  gridColumnWidth: number;
  gridRowHeight: number;
  companyId?: string;
  themeTextSettings?: ThemeTextSetting[];
  themeButtonSettings?: ThemeButtonSetting[];
  companyWebPages?: CompanyWebPage[];
  addonRenderContext?: AddonRenderContext;
  onUpdateAddons: (next: ContentAddon[], shouldPersist?: boolean, markDirty?: boolean) => void;
  onEditAddon: (id: string) => void;
  onDeleteAddon: (id: string) => void;
}

export const AddonGridEditor = ({
  block,
  addons,
  selectedAddonId = null,
  onSelectAddon,
  gridColumnWidth,
  gridRowHeight,
  companyId,
  themeTextSettings,
  themeButtonSettings,
  companyWebPages,
  addonRenderContext,
  onUpdateAddons,
  onEditAddon,
  onDeleteAddon,
}: AddonGridEditorProps) => {
  const [draggingAddonId, setDraggingAddonId] = useState<string | null>(null);
  const [liveLayout, setLiveLayout] = useState<{ addonId: string; layout: AddonGridLayout } | null>(null);
  const addonsRef = useRef(addons);
  const onUpdateAddonsRef = useRef(onUpdateAddons);
  const interactionBaseAddonsRef = useRef<ContentAddon[] | null>(null);
  const dragRafRef = useRef<number | null>(null);
  const dragLastRef = useRef<AddonGridLayout | null>(null);
  const resizeRafRef = useRef<number | null>(null);
  const resizeLastRef = useRef<AddonGridLayout | null>(null);

  const [resizeState, setResizeState] = useState<{
    addonId: string;
    handle: ResizeHandle;
    startPos: { x: number; y: number };
    startLayout: AddonGridLayout;
  } | null>(null);

  /** Measured width of one subgrid column (addons use a 12-col grid inside the block, not the page grid). */
  const addonGridRef = useRef<HTMLDivElement>(null);
  const addonColumnWidthPxRef = useRef(Math.max(1, gridColumnWidth));

  const measureAddonColumnWidth = () => {
    const el = addonGridRef.current;
    if (!el) return;
    const w = el.clientWidth;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    const gapsBetweenCols = 11;
    addonColumnWidthPxRef.current = Math.max(4, (w - gapsBetweenCols * gap) / 12);
  };

  useLayoutEffect(() => {
    const el = addonGridRef.current;
    if (!el) return;
    measureAddonColumnWidth();
    const ro = new ResizeObserver(measureAddonColumnWidth);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    // Keep ref normalized so interaction math doesn't depend on legacy/missing layouts.
    addonsRef.current = ensureAddonLayouts(addons);
  }, [addons]);

  useEffect(() => {
    onUpdateAddonsRef.current = onUpdateAddons;
  }, [onUpdateAddons]);

  useEffect(() => {
    return () => {
      if (dragRafRef.current != null) {
        window.cancelAnimationFrame(dragRafRef.current);
        dragRafRef.current = null;
      }
      if (resizeRafRef.current != null) {
        window.cancelAnimationFrame(resizeRafRef.current);
        resizeRafRef.current = null;
      }
    };
  }, []);

  const normalized = useMemo(() => ensureAddonLayouts(addons), [addons]);
  const isInteracting = Boolean(draggingAddonId || resizeState);
  const renderBaseAddons =
    isInteracting && interactionBaseAddonsRef.current
      ? interactionBaseAddonsRef.current
      : normalized;

  /** Paint order: lower zIndex first in DOM; explicit style.zIndex still controls overlap. */
  const displayAddons = useMemo(
    () =>
      [...renderBaseAddons].sort(
        (a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0) || a.id.localeCompare(b.id)
      ),
    [renderBaseAddons]
  );

  const maxRow = Math.max(
    maxLayoutRowEnd(renderBaseAddons),
    liveLayout ? liveLayout.layout.gridRowStart + liveLayout.layout.rowSpan : 0
  );
  const gridMinHeight = Math.max(maxRow, 1) * gridRowHeight;

  useEffect(() => {
    if (draggingAddonId || resizeState) return;
    // If any addon arrives without a concrete layout, persist normalized layouts once.
    // `normalized` is memoized so this does not run every render (only when `addons` changes).
    const hasLayoutMismatch =
      addons.length !== normalized.length ||
      addons.some((addon, idx) => {
        const next = normalized[idx];
        if (!addon.layout || !next.layout) return addon.layout !== next.layout;
        return (
          addon.layout.gridRowStart !== next.layout.gridRowStart ||
          addon.layout.gridColumnStart !== next.layout.gridColumnStart ||
          addon.layout.rowSpan !== next.layout.rowSpan ||
          addon.layout.colSpan !== next.layout.colSpan
        );
      });
    if (hasLayoutMismatch) {
      onUpdateAddonsRef.current(normalized, false, false);
    }
  }, [addons, normalized, draggingAddonId, resizeState]);

  const blockAddonKey = `${block.id}`;

  const startAddonDrag = (addonId: string, e: React.MouseEvent) => {
    if (selectedAddonId !== addonId) return;
    e.preventDefault();
    e.stopPropagation();
    const addon = addonsRef.current.find((a) => a.id === addonId);
    if (!addon?.layout) return;

    const dragKey = `${blockAddonKey}:${addonId}`;
    activeAddonDragKey = dragKey;

    const startPos = { x: e.clientX, y: e.clientY };
    const startLayout = { ...addon.layout };
    dragLastRef.current = startLayout;
    interactionBaseAddonsRef.current = ensureAddonLayouts(addonsRef.current);
    setDraggingAddonId(addonId);
    measureAddonColumnWidth();

    let latestMouse: { x: number; y: number } | null = null;

    const applyDrag = () => {
      if (activeAddonDragKey !== dragKey) return;
      if (!latestMouse) return;
      const deltaX = latestMouse.x - startPos.x;
      const deltaY = latestMouse.y - startPos.y;
      const colW = addonColumnWidthPxRef.current || gridColumnWidth;
      const deltaCols = Math.round(deltaX / colW);
      const deltaRows = Math.round(deltaY / gridRowHeight);

      const nextLayout = clampAddonLayout({
        ...startLayout,
        gridColumnStart: startLayout.gridColumnStart + deltaCols,
        gridRowStart: startLayout.gridRowStart + deltaRows,
      });

      const last = dragLastRef.current;
      if (last && last.gridColumnStart === nextLayout.gridColumnStart && last.gridRowStart === nextLayout.gridRowStart) {
        return;
      }

      dragLastRef.current = nextLayout;
      setLiveLayout({ addonId, layout: nextLayout });
    };

    const onMouseMove = (ev: MouseEvent) => {
      latestMouse = { x: ev.clientX, y: ev.clientY };
      if (dragRafRef.current != null) return;
      dragRafRef.current = window.requestAnimationFrame(() => {
        dragRafRef.current = null;
        applyDrag();
      });
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      if (dragRafRef.current != null) {
        window.cancelAnimationFrame(dragRafRef.current);
        dragRafRef.current = null;
      }

      latestMouse = null;
      const final = dragLastRef.current;
      dragLastRef.current = null;

      if (activeAddonDragKey === dragKey) {
        activeAddonDragKey = null;
      }

      setDraggingAddonId(null);

      // Overlap allowed: final position only; mark dirty once (same as content block drag).
      if (final) {
        const merged = addonsRef.current.map((a) => (a.id === addonId ? { ...a, layout: final } : a));
        addonsRef.current = merged;
        onUpdateAddonsRef.current(merged, false, true);
      }
      setLiveLayout(null);
      interactionBaseAddonsRef.current = null;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const bumpAddonZIndex = (addonId: string, delta: number) => {
    const next = addonsRef.current.map((a) => {
      if (a.id !== addonId) return a;
      return { ...a, zIndex: clampStackZIndex((a.zIndex ?? 0) + delta) };
    });
    addonsRef.current = next;
    onUpdateAddons(next, true, true);
  };

  const startAddonResize = (addonId: string, handle: ResizeHandle, e: React.MouseEvent) => {
    if (selectedAddonId !== addonId) return;
    e.preventDefault();
    e.stopPropagation();
    const addon = addonsRef.current.find((a) => a.id === addonId);
    if (!addon?.layout) return;
    measureAddonColumnWidth();
    resizeLastRef.current = { ...addon.layout };
    interactionBaseAddonsRef.current = ensureAddonLayouts(addonsRef.current);
    setResizeState({
      addonId,
      handle,
      startPos: { x: e.clientX, y: e.clientY },
      startLayout: { ...addon.layout },
    });
  };

  useEffect(() => {
    if (!resizeState) return;

    const { addonId, handle, startPos, startLayout } = resizeState;

    let latestMouse: { x: number; y: number } | null = null;

    const applyResize = () => {
      if (!latestMouse) return;
      const deltaX = latestMouse.x - startPos.x;
      const deltaY = latestMouse.y - startPos.y;
      const colW = addonColumnWidthPxRef.current || gridColumnWidth;
      const deltaCols = Math.round(deltaX / colW);
      const deltaRows = Math.round(deltaY / gridRowHeight);

      let newRowStart = startLayout.gridRowStart;
      let newColStart = startLayout.gridColumnStart;
      let newRowSpan = startLayout.rowSpan;
      let newColSpan = startLayout.colSpan;

      if (handle === "e" || handle === "ne" || handle === "se") {
        newColSpan = Math.max(1, Math.min(13 - startLayout.gridColumnStart, startLayout.colSpan + deltaCols));
      }
      if (handle === "w" || handle === "nw" || handle === "sw") {
        const colChange = deltaCols;
        newColStart = Math.max(1, startLayout.gridColumnStart + colChange);
        newColSpan = Math.max(1, startLayout.colSpan - colChange);
        if (newColStart + newColSpan > 13) {
          newColSpan = 13 - newColStart;
        }
      }
      if (handle === "s" || handle === "se" || handle === "sw") {
        newRowSpan = Math.max(1, startLayout.rowSpan + deltaRows);
      }
      if (handle === "n" || handle === "ne" || handle === "nw") {
        const rowChange = deltaRows;
        if (startLayout.rowSpan - rowChange >= 1 && startLayout.gridRowStart + rowChange >= 1) {
          newRowStart = startLayout.gridRowStart + rowChange;
          newRowSpan = startLayout.rowSpan - rowChange;
        }
      }

      newColSpan = Math.max(1, Math.min(12, newColSpan));
      if (newColStart + newColSpan > 13) newColStart = 13 - newColSpan;
      newColStart = Math.max(1, newColStart);

      const nextLayout = clampAddonLayout({
        gridRowStart: newRowStart,
        gridColumnStart: newColStart,
        rowSpan: newRowSpan,
        colSpan: newColSpan,
      });

      const last = resizeLastRef.current;
      if (
        last &&
        last.gridColumnStart === nextLayout.gridColumnStart &&
        last.gridRowStart === nextLayout.gridRowStart &&
        last.colSpan === nextLayout.colSpan &&
        last.rowSpan === nextLayout.rowSpan
      ) {
        return;
      }
      resizeLastRef.current = nextLayout;
      setLiveLayout({ addonId, layout: nextLayout });
    };

    const onMouseMove = (e: MouseEvent) => {
      latestMouse = { x: e.clientX, y: e.clientY };
      if (resizeRafRef.current != null) return;
      resizeRafRef.current = window.requestAnimationFrame(() => {
        resizeRafRef.current = null;
        applyResize();
      });
    };

    const onMouseUp = () => {
      if (resizeRafRef.current != null) {
        window.cancelAnimationFrame(resizeRafRef.current);
        resizeRafRef.current = null;
      }
      latestMouse = null;
      const final = resizeLastRef.current;
      resizeLastRef.current = null;
      if (final) {
        const merged = addonsRef.current.map((a) => (a.id === addonId ? { ...a, layout: final } : a));
        addonsRef.current = merged;
        onUpdateAddonsRef.current(merged, false, true);
      }
      setLiveLayout(null);
      interactionBaseAddonsRef.current = null;
      setResizeState(null);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      if (resizeRafRef.current != null) {
        window.cancelAnimationFrame(resizeRafRef.current);
        resizeRafRef.current = null;
      }
    };
  }, [resizeState, gridColumnWidth, gridRowHeight]);

  return (
    <div
      className="relative w-full min-h-0"
      style={{ minHeight: `${gridMinHeight}px` }}
    >
      <div
        ref={addonGridRef}
        className="grid w-full grid-cols-12 gap-0"
        style={{
          position: "relative",
          isolation: "isolate",
          gridAutoRows: `${gridRowHeight}px`,
          minHeight: `${gridMinHeight}px`,
        }}
      >
        {/* 12-column guide lines (same style as page editor) */}
        <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
          <div className="relative w-full h-full">
            {Array.from({ length: 13 }).map((_, i) => {
              const leftPosition = (i * 100) / 12;
              return (
                <div
                  key={`addon-col-line-${i}`}
                  className="absolute top-0 bottom-0 w-px border-l border-dashed border-blue-200/40"
                  style={{ left: `${leftPosition}%` }}
                />
              );
            })}
          </div>
          {Array.from({ length: Math.max(maxRow + 1, 2) }).map((_, i) => (
            <div
              key={`addon-row-line-${i}`}
              className="absolute left-0 right-0 h-px border-t border-dashed border-blue-300/20"
              style={{ top: `${i * gridRowHeight}px` }}
            />
          ))}
        </div>

        {displayAddons.map((addon, stackIndex) => {
          const module = getAddonModuleByType(addon.type);
          if (!module || !addon.layout) return null;
          const RenderComponent = module.RenderComponent;
          const l =
            liveLayout?.addonId === addon.id
              ? liveLayout.layout
              : addon.layout;

          const interaction =
            draggingAddonId === addon.id
              ? "drag"
              : resizeState?.addonId === addon.id
                ? "resize"
                : selectedAddonId === addon.id
                  ? "selected"
                  : "none";
          const isAddonSelected = selectedAddonId === addon.id;
          const stackZ = computeAddonDisplayZIndex(addon, stackIndex, interaction);

          return (
            <div
              key={addon.id}
              className={`relative min-h-0 overflow-hidden rounded-sm border bg-white/30 group/addon transition-shadow ${
                draggingAddonId === addon.id ? "opacity-80 shadow-2xl" : ""
              } ${
                isAddonSelected
                  ? "border-[var(--accent-primary)] shadow-md ring-1 ring-[var(--accent-primary)]/30"
                  : "border-dashed border-blue-300/40"
              }`}
              style={{
                ...layoutToGridStyle(l),
                zIndex: stackZ,
                cursor:
                  draggingAddonId === addon.id
                    ? "grabbing"
                    : resizeState?.addonId === addon.id
                      ? "auto"
                      : "default",
                userSelect: draggingAddonId === addon.id || resizeState?.addonId === addon.id ? "none" : "auto",
              }}
              onMouseDown={(e) => {
                e.stopPropagation();
                onSelectAddon?.(addon.id);
              }}
            >
              {isAddonSelected && (
              <div
                className="absolute top-1 right-1 flex items-center gap-1 pointer-events-auto"
                style={{ zIndex: 200 }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-md border border-[var(--glass-border)] bg-[var(--glass-bg)]/90 backdrop-blur-sm text-[var(--accent-text)] hover:bg-[var(--accent-bg)] hover:border-[var(--accent-primary)]/40 hover:text-[var(--accent-text)] cursor-grab active:cursor-grabbing"
                  onMouseDown={(e) => startAddonDrag(addon.id, e)}
                  aria-label="Move addon"
                >
                  <Move className="h-4 w-4" strokeWidth={2.25} aria-hidden />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-md border border-[var(--glass-border)] bg-[var(--glass-bg)]/90 backdrop-blur-sm text-[var(--accent-text)] hover:bg-[var(--accent-bg)] hover:border-[var(--accent-primary)]/40 hover:text-[var(--accent-text)]"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    bumpAddonZIndex(addon.id, 1);
                  }}
                  aria-label="Bring addon forward (increase z-index)"
                  title="Layer up"
                >
                  <ChevronUp className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-md border border-[var(--glass-border)] bg-[var(--glass-bg)]/90 backdrop-blur-sm text-[var(--accent-text)] hover:bg-[var(--accent-bg)] hover:border-[var(--accent-primary)]/40 hover:text-[var(--accent-text)]"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    bumpAddonZIndex(addon.id, -1);
                  }}
                  aria-label="Send addon backward (decrease z-index)"
                  title="Layer down"
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-md border border-[var(--glass-border)] bg-[var(--glass-bg)]/90 backdrop-blur-sm text-[var(--accent-text)] hover:bg-[var(--accent-bg)] hover:border-[var(--accent-primary)]/40 hover:text-[var(--accent-text)]"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onEditAddon(addon.id);
                  }}
                  aria-label="Edit addon"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-md border border-[var(--glass-border)] bg-[var(--glass-bg)]/90 backdrop-blur-sm text-muted-foreground hover:bg-destructive hover:text-white hover:border-destructive/50"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDeleteAddon(addon.id);
                  }}
                  aria-label="Delete addon"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              )}

              <div
                className={`relative h-full min-h-0 w-full overflow-hidden ${
                  isAddonSelected ? "pt-10" : ""
                }`}
                style={{ zIndex: 0 }}
              >
                <RenderComponent
                  addon={addon}
                  companyId={companyId}
                  themeTextSettings={themeTextSettings}
                  themeButtonSettings={themeButtonSettings}
                  companyWebPages={companyWebPages}
                  addonRenderContext={addonRenderContext}
                />
              </div>

              {/* After body in DOM + inline z-index so handles always receive events (Tailwind z-[n] may not emit). */}
              {isAddonSelected && (
              <>
              <div
                className="resize-handle pointer-events-auto absolute top-0 left-0 right-0 h-4 hover:bg-blue-400/50 transition-colors"
                style={{ zIndex: 150, cursor: "ns-resize" }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  startAddonResize(addon.id, "n", e);
                }}
              />
              <div
                className="resize-handle pointer-events-auto absolute bottom-0 left-0 right-0 h-4 hover:bg-blue-400/50 transition-colors"
                style={{ zIndex: 150, cursor: "ns-resize" }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  startAddonResize(addon.id, "s", e);
                }}
              />
              <div
                className="resize-handle pointer-events-auto absolute top-0 bottom-0 left-0 w-4 hover:bg-blue-400/50 transition-colors"
                style={{ zIndex: 150, cursor: "ew-resize" }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  startAddonResize(addon.id, "w", e);
                }}
              />
              <div
                className="resize-handle pointer-events-auto absolute top-0 bottom-0 w-4 hover:bg-blue-400/50 transition-colors"
                style={{ zIndex: 180, cursor: "ew-resize", right: 0 }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  startAddonResize(addon.id, "e", e);
                }}
              />
              <div
                className="resize-handle pointer-events-auto absolute top-0 left-0 h-5 w-5 hover:bg-blue-500/70 transition-colors rounded-br"
                style={{ zIndex: 150, cursor: "nwse-resize" }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  startAddonResize(addon.id, "nw", e);
                }}
              />
              <div
                className="resize-handle pointer-events-auto absolute top-0 h-5 w-5 hover:bg-blue-500/70 transition-colors rounded-bl"
                style={{ zIndex: 180, cursor: "nesw-resize", right: 0 }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  startAddonResize(addon.id, "ne", e);
                }}
              />
              <div
                className="resize-handle pointer-events-auto absolute bottom-0 left-0 h-5 w-5 hover:bg-blue-500/70 transition-colors rounded-tr"
                style={{ zIndex: 150, cursor: "nesw-resize" }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  startAddonResize(addon.id, "sw", e);
                }}
              />
              <div
                className="resize-handle pointer-events-auto absolute bottom-0 h-5 w-5 hover:bg-blue-500/70 transition-colors rounded-tl"
                style={{ zIndex: 180, cursor: "nwse-resize", right: 0 }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  startAddonResize(addon.id, "se", e);
                }}
              />
              </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
