import { useEffect, useRef, useState } from "react";
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
  const [hoveredAddonId, setHoveredAddonId] = useState<string | null>(null);
  const [draggingAddonId, setDraggingAddonId] = useState<string | null>(null);
  const addonsRef = useRef(addons);
  const onUpdateAddonsRef = useRef(onUpdateAddons);
  const dragRafRef = useRef<number | null>(null);
  const dragLastRef = useRef<AddonGridLayout | null>(null);
  const resizeRafRef = useRef<number | null>(null);
  const resizePendingRef = useRef<{
    addonId: string;
    layout: AddonGridLayout;
  } | null>(null);

  const [resizeState, setResizeState] = useState<{
    addonId: string;
    handle: ResizeHandle;
    startPos: { x: number; y: number };
    startLayout: AddonGridLayout;
  } | null>(null);

  useEffect(() => {
    addonsRef.current = addons;
  }, [addons]);

  useEffect(() => {
    onUpdateAddonsRef.current = onUpdateAddons;
  }, [onUpdateAddons]);

  const normalized = ensureAddonLayouts(addons);
  const maxRow = maxLayoutRowEnd(normalized);
  const gridMinHeight = Math.max(maxRow, 1) * gridRowHeight;

  const blockAddonKey = `${block.id}`;

  const startAddonDrag = (addonId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const addon = addonsRef.current.find((a) => a.id === addonId);
    if (!addon?.layout) return;

    const dragKey = `${blockAddonKey}:${addonId}`;
    activeAddonDragKey = dragKey;

    const startPos = { x: e.clientX, y: e.clientY };
    const startLayout = { ...addon.layout };
    dragLastRef.current = startLayout;
    setDraggingAddonId(addonId);

    const applyDrag = () => {
      if (activeAddonDragKey !== dragKey) return;
      const latest = dragLastRef.current;
      if (!latest) return;
      const next = addonsRef.current.map((a) => (a.id === addonId ? { ...a, layout: latest } : a));
      addonsRef.current = next;
      onUpdateAddonsRef.current(next, false, false);
    };

    const onMouseMove = (ev: MouseEvent) => {
      const deltaX = ev.clientX - startPos.x;
      const deltaY = ev.clientY - startPos.y;
      const deltaCols = Math.round(deltaX / gridColumnWidth);
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

      const final = dragLastRef.current;
      dragLastRef.current = null;

      if (activeAddonDragKey === dragKey) {
        activeAddonDragKey = null;
      }

      setDraggingAddonId(null);

      // Overlap allowed: apply final position only (no swap with other addons).
      if (final) {
        const merged = addonsRef.current.map((a) => (a.id === addonId ? { ...a, layout: final } : a));
        addonsRef.current = merged;
        onUpdateAddonsRef.current(merged, true, true);
      }
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
    e.preventDefault();
    e.stopPropagation();
    const addon = addonsRef.current.find((a) => a.id === addonId);
    if (!addon?.layout) return;
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

    const applyResize = () => {
      const pending = resizePendingRef.current;
      if (!pending || pending.addonId !== addonId) return;
      const next = addonsRef.current.map((a) =>
        a.id === addonId ? { ...a, layout: pending.layout } : a
      );
      addonsRef.current = next;
      onUpdateAddonsRef.current(next, false, false);
      resizePendingRef.current = null;
    };

    const onMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startPos.x;
      const deltaY = e.clientY - startPos.y;
      const deltaCols = Math.round(deltaX / gridColumnWidth);
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
        const rowChange = -deltaRows;
        if (startLayout.rowSpan + rowChange >= 1 && startLayout.gridRowStart + rowChange >= 1) {
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

      resizePendingRef.current = { addonId, layout: nextLayout };

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
      applyResize();
      setResizeState(null);
      onUpdateAddonsRef.current(addonsRef.current, true, true);
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
      resizePendingRef.current = null;
    };
  }, [resizeState, gridColumnWidth, gridRowHeight]);

  return (
    <div
      className="relative w-full min-h-0 p-1"
      style={{ minHeight: `${gridMinHeight}px` }}
    >
      <div
        className="grid w-full grid-cols-12 gap-1"
        style={{
          gridAutoRows: `${gridRowHeight}px`,
          minHeight: `${gridMinHeight}px`,
        }}
      >
        {normalized.map((addon, stackIndex) => {
          const module = getAddonModuleByType(addon.type);
          if (!module || !addon.layout) return null;
          const RenderComponent = module.RenderComponent;
          const l = addon.layout;

          const interaction: "drag" | "hover" | "resize" | "none" =
            draggingAddonId === addon.id
              ? "drag"
              : hoveredAddonId === addon.id
                ? "hover"
                : resizeState?.addonId === addon.id
                  ? "resize"
                  : "none";
          const stackZ = computeAddonDisplayZIndex(addon, stackIndex, interaction);

          return (
            <div
              key={addon.id}
              className={`relative min-h-0 overflow-hidden rounded-sm border border-dashed border-blue-300/40 bg-white/30 group/addon transition-shadow ${
                resizeState?.addonId === addon.id
                  ? "ring-2 ring-blue-500 ring-offset-1 shadow-lg z-10"
                  : ""
              }`}
              style={{ ...layoutToGridStyle(l), zIndex: stackZ }}
              onMouseEnter={() => setHoveredAddonId(addon.id)}
              onMouseLeave={() => setHoveredAddonId((prev) => (prev === addon.id ? null : prev))}
            >
              <div
                className={`absolute top-1 left-1 z-50 flex items-center gap-1 transition-opacity pointer-events-auto ${
                  hoveredAddonId === addon.id ? "opacity-100" : "opacity-0"
                }`}
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

              <div className="relative h-full min-h-0 w-full overflow-hidden pt-10">
                <RenderComponent
                  addon={addon}
                  companyId={companyId}
                  themeTextSettings={themeTextSettings}
                  themeButtonSettings={themeButtonSettings}
                  companyWebPages={companyWebPages}
                  addonRenderContext={addonRenderContext}
                />
              </div>

              {/* Resize handles — same sizes / styling as content element (ResizableContentBlock) */}
              <div
                className="resize-handle pointer-events-auto absolute top-0 left-0 right-0 z-40 h-4 cursor-ns-resize hover:bg-blue-400/50 transition-colors"
                style={{ cursor: "ns-resize" }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  startAddonResize(addon.id, "n", e);
                }}
              />
              <div
                className="resize-handle pointer-events-auto absolute bottom-0 left-0 right-0 z-40 h-4 cursor-ns-resize hover:bg-blue-400/50 transition-colors"
                style={{ cursor: "ns-resize" }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  startAddonResize(addon.id, "s", e);
                }}
              />
              <div
                className="resize-handle pointer-events-auto absolute top-0 bottom-0 left-0 z-40 w-4 cursor-ew-resize hover:bg-blue-400/50 transition-colors"
                style={{ cursor: "ew-resize" }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  startAddonResize(addon.id, "w", e);
                }}
              />
              <div
                className="resize-handle pointer-events-auto absolute top-0 right-0 bottom-0 z-40 w-4 cursor-ew-resize hover:bg-blue-400/50 transition-colors"
                style={{ cursor: "ew-resize" }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  startAddonResize(addon.id, "e", e);
                }}
              />
              <div
                className="resize-handle pointer-events-auto absolute top-0 left-0 z-40 h-5 w-5 cursor-nwse-resize hover:bg-blue-500/70 transition-colors rounded-br"
                style={{ cursor: "nwse-resize" }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  startAddonResize(addon.id, "nw", e);
                }}
              />
              <div
                className="resize-handle pointer-events-auto absolute top-0 right-0 z-40 h-5 w-5 cursor-nesw-resize hover:bg-blue-500/70 transition-colors rounded-bl"
                style={{ cursor: "nesw-resize" }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  startAddonResize(addon.id, "ne", e);
                }}
              />
              <div
                className="resize-handle pointer-events-auto absolute bottom-0 left-0 z-40 h-5 w-5 cursor-nesw-resize hover:bg-blue-500/70 transition-colors rounded-tr"
                style={{ cursor: "nesw-resize" }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  startAddonResize(addon.id, "sw", e);
                }}
              />
              <div
                className="resize-handle pointer-events-auto absolute bottom-0 right-0 z-40 h-5 w-5 cursor-nwse-resize hover:bg-blue-500/70 transition-colors rounded-tl"
                style={{ cursor: "nwse-resize" }}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  startAddonResize(addon.id, "se", e);
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
