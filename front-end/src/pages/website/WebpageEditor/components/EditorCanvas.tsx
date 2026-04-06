import { useState, useEffect, useRef, useLayoutEffect, useCallback, type ReactNode } from "react";
import {
  EditorContent,
  ViewMode,
  ContentBlock,
  ContentContainerSettings,
  BreakpointName,
  resolveBlockLayout,
} from "../types";
import { ResizableContentBlock } from "./ResizableContentBlock";
import { WebpageContentRenderer } from "./WebpageContentRenderer";
import type { ThemeButtonSetting, ThemeTextSetting } from "@/services/companyWebThemes";
import type { CompanyWebPage } from "@/services/companyWebPages";
import type { AddonRenderContext } from "../addons/types";
import { Button } from "@/components/ui/button";
import { LayoutTemplate, Pencil } from "lucide-react";

/* eslint-disable jsx-a11y/no-static-element-interactions -- editor canvas hit targets for clear-selection */

/** At most one of: a content block, or an addon inside a block. */
export type EditorSelection =
  | { type: "block"; id: string }
  | { type: "addon"; blockId: string; addonId: string };

export interface AddonEditRequest {
  blockId: string;
  addonId: string;
  requestId: string;
}

interface EditorCanvasProps {
  content: EditorContent;
  viewMode?: ViewMode;
  contentBlocks?: ContentBlock[];
  activeBreakpointName?: BreakpointName;
  selection?: EditorSelection | null;
  onSelectionChange?: (selection: EditorSelection | null) => void;
  canvasPreviewWidthPx?: number;
  canvasMinHeightPx?: number;
  onCanvasMinHeightPxChange?: (heightPx: number) => void;
  contentContainer?: ContentContainerSettings;
  onEditContentContainer?: () => void;
  companyId?: string;
  themeTextSettings?: ThemeTextSetting[];
  themeButtonSettings?: ThemeButtonSetting[];
  companyWebPages?: CompanyWebPage[];
  addonRenderContext?: AddonRenderContext;
  onUpdateBlock?: (block: ContentBlock, shouldPersist?: boolean, markDirty?: boolean) => void;
  onDeleteBlock?: (id: string) => void;
  requestedAddonEdit?: AddonEditRequest | null;
  onAddonEditRequestHandled?: (requestId: string) => void;
}

export const EditorCanvas = ({
  content,
  viewMode = "visual",
  contentBlocks = [],
  activeBreakpointName = "2xl",
  selection: selectionProp,
  onSelectionChange,
  canvasPreviewWidthPx,
  canvasMinHeightPx = 900,
  onCanvasMinHeightPxChange,
  contentContainer,
  onEditContentContainer,
  companyId,
  themeTextSettings,
  themeButtonSettings,
  companyWebPages,
  addonRenderContext = "editor",
  onUpdateBlock,
  onDeleteBlock,
  requestedAddonEdit,
  onAddonEditRequestHandled,
}: EditorCanvasProps) => {
  const [localContent, setLocalContent] = useState(content);
  const canvasRef = useRef<HTMLDivElement>(null);
  const canvasHeightDragRef = useRef<{ startY: number; startHeight: number } | null>(null);
  const [containerWidth, setContainerWidth] = useState(1200);
  const [internalSelection, setInternalSelection] = useState<EditorSelection | null>(null);
  const isSelectionControlled = selectionProp !== undefined;
  const selection = isSelectionControlled ? selectionProp : internalSelection;

  const updateSelection = (next: EditorSelection | null) => {
    if (!isSelectionControlled) setInternalSelection(next);
    onSelectionChange?.(next);
  };

  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  useEffect(() => {
    if (!selection) return;
    if (selection.type === "block") {
      if (!contentBlocks.some((b) => b.id === selection.id)) {
        updateSelection(null);
      }
    } else {
      const block = contentBlocks.find((b) => b.id === selection.blockId);
      if (!block?.addons?.some((a) => a.id === selection.addonId)) {
        updateSelection(null);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- updateSelection intentionally omitted
  }, [contentBlocks, selection, isSelectionControlled]);

  useLayoutEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setContainerWidth(el.clientWidth);
    });
    ro.observe(el);
    setContainerWidth(el.clientWidth);
    return () => ro.disconnect();
  }, [viewMode, canvasPreviewWidthPx, contentBlocks.length]);

  const clampCanvasHeight = useCallback((h: number) => Math.min(6000, Math.max(1, Math.round(h))), []);

  const startCanvasHeightDrag = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!onCanvasMinHeightPxChange) return;
      canvasHeightDragRef.current = { startY: e.clientY, startHeight: canvasMinHeightPx };
      const onMove = (ev: MouseEvent) => {
        const drag = canvasHeightDragRef.current;
        if (!drag) return;
        const delta = ev.clientY - drag.startY;
        onCanvasMinHeightPxChange(clampCanvasHeight(drag.startHeight + delta));
      };
      const onUp = () => {
        canvasHeightDragRef.current = null;
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [canvasMinHeightPx, clampCanvasHeight, onCanvasMinHeightPxChange]
  );

  const previewShell = (children: ReactNode) => (
    <div className="flex-1 min-h-0 w-full relative bg-gray-100 overflow-auto">
      <div
        className={`p-5 ${canvasPreviewWidthPx != null ? "flex justify-center" : ""}`}
      >
        <div
          className="relative flex flex-col shadow-sm border border-border/30 rounded-sm bg-white"
          style={
            canvasPreviewWidthPx != null
              ? { width: canvasPreviewWidthPx, maxWidth: "100%", minWidth: 0 }
              : { width: "100%" }
          }
        >
          <div
            ref={canvasRef}
            className="relative bg-white rounded-t-sm overflow-hidden"
            style={{
              minHeight: canvasMinHeightPx,
              width: "100%",
            }}
          >
            {children}
          </div>
          {onCanvasMinHeightPxChange && (
            <button
              type="button"
              aria-label="Resize content container height"
              className="shrink-0 h-9 w-full cursor-ns-resize rounded-b-sm border-t border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-sm flex items-center justify-center gap-2 text-xs text-muted-foreground hover:bg-[var(--accent-bg)]/50 select-none"
              onMouseDown={startCanvasHeightDrag}
            >
              <span className="inline-block h-1 w-10 rounded-full bg-muted-foreground/40" aria-hidden />
              <span>Drag to resize content container height</span>
              <span className="text-muted-foreground/80 tabular-nums">{canvasMinHeightPx}px</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (viewMode === "edit") {
    const columnWidth = containerWidth / 12;
    const rowHeight = 60;
    const STRIP = 36;
    const showStrip = !!onEditContentContainer;
    const innerEditMinHeight = Math.max(1, canvasMinHeightPx - (showStrip ? STRIP : 0));
    const gridRowLineCount = Math.min(200, Math.ceil(innerEditMinHeight / rowHeight) + 20);

    return previewShell(
      <div
        className="relative w-full flex flex-col"
        style={{
          minHeight: canvasMinHeightPx,
          ...(contentContainer?.backgroundColor
            ? { backgroundColor: contentContainer.backgroundColor }
            : {}),
        }}
      >
        {showStrip && (
          <div className="shrink-0 flex items-center justify-between gap-2 px-2 py-1.5 border-b border-dashed border-[var(--glass-border)] bg-muted/20">
            <div className="flex items-center gap-2 min-w-0">
              <LayoutTemplate className="w-4 h-4 shrink-0 text-muted-foreground" aria-hidden />
              <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                Content container
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 gap-1.5 px-2 text-xs border border-[var(--glass-border)] bg-[var(--glass-bg)]/90"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onEditContentContainer?.();
              }}
            >
              <Pencil className="w-3 h-3" />
              Edit
            </Button>
          </div>
        )}
        <div
          className="relative w-full flex-1 min-h-0"
          style={{ minHeight: innerEditMinHeight }}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              updateSelection(null);
            }
          }}
        >
          <div
            className="absolute inset-0 grid grid-cols-12 gap-0 w-full"
            style={{
              zIndex: -1,
              display: "grid",
              gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
              width: "100%",
              boxSizing: "border-box",
              minHeight: innerEditMinHeight,
            }}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={`col-bg-${i}`}
                className="col-span-1 bg-blue-50/5"
                style={{ minHeight: innerEditMinHeight }}
              />
            ))}
          </div>

          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
            {Array.from({ length: 13 }).map((_, i) => {
              const leftPosition = (i * 100) / 12;
              return (
                <div
                  key={`col-line-${i}`}
                  className="absolute top-0 bottom-0 w-px"
                  style={{
                    left: `${leftPosition}%`,
                    borderLeft: "1px dashed rgba(96, 165, 250, 0.45)",
                  }}
                />
              );
            })}

            {Array.from({ length: gridRowLineCount }).map((_, i) => (
              <div
                key={`row-line-${i}`}
                className="absolute left-0 right-0 h-px border-t border-dashed border-blue-300/20"
                style={{ top: `${i * rowHeight}px` }}
              />
            ))}

            {Array.from({ length: 12 }).map((_, i) => {
              const leftPosition = ((i + 0.5) * 100) / 12;
              return (
                <div
                  key={`col-number-${i}`}
                  className="absolute top-2 text-xs text-blue-500 font-mono bg-white/80 px-1 rounded pointer-events-none"
                  style={{ left: `${leftPosition}%`, transform: "translateX(-50%)", zIndex: 1 }}
                >
                  {i + 1}
                </div>
              );
            })}
          </div>

          <div
            className="relative grid grid-cols-12 gap-0 w-full"
            onMouseDown={(e) => {
              if (e.target === e.currentTarget) {
                updateSelection(null);
              }
            }}
            style={{
              zIndex: 10,
              display: "grid",
              gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
              width: "100%",
              boxSizing: "border-box",
              gridAutoRows: `${rowHeight}px`,
              minHeight: innerEditMinHeight,
            }}
          >
            {contentBlocks.map((block) => {
              const resolved = resolveBlockLayout(block, activeBreakpointName, rowHeight, containerWidth);
              const blockToShow: ContentBlock = {
                ...block,
                gridRowStart: resolved.gridRowStart,
                gridColumnStart: resolved.gridColumnStart,
                rowSpan: resolved.rowSpan,
                colSpan: resolved.colSpan,
              };
              return (
                <div
                  key={block.id}
                  className="relative"
                  style={{
                    gridRow: `${resolved.gridRowStart} / span ${resolved.rowSpan}`,
                    gridColumn: `${resolved.gridColumnStart} / span ${resolved.colSpan}`,
                    minHeight: `${resolved.rowSpan * rowHeight}px`,
                    zIndex: block.zIndex ?? 0,
                  }}
                >
                  <ResizableContentBlock
                    block={blockToShow}
                    activeBreakpointName={activeBreakpointName}
                    isSelected={selection?.type === "block" && selection.id === block.id}
                    selectedAddonId={
                      selection?.type === "addon" && selection.blockId === block.id
                        ? selection.addonId
                        : null
                    }
                    onSelectBlock={() => updateSelection({ type: "block", id: block.id })}
                    onSelectAddon={(addonId) =>
                      updateSelection({
                        type: "addon",
                        blockId: block.id,
                        addonId,
                      })
                    }
                    onUpdate={(updatedBlock, shouldPersist, markDirty) =>
                      onUpdateBlock?.(updatedBlock, shouldPersist, markDirty)
                    }
                    onDelete={onDeleteBlock}
                    gridColumnWidth={columnWidth}
                    gridRowHeight={rowHeight}
                    companyId={companyId}
                    themeTextSettings={themeTextSettings}
                    themeButtonSettings={themeButtonSettings}
                    companyWebPages={companyWebPages}
                    addonRenderContext={addonRenderContext}
                    requestedEditAddonId={
                      requestedAddonEdit?.blockId === block.id ? requestedAddonEdit.addonId : null
                    }
                    requestedEditNonce={
                      requestedAddonEdit?.blockId === block.id ? requestedAddonEdit.requestId : null
                    }
                    onRequestedEditHandled={onAddonEditRequestHandled}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === "visual") {
    const rowHeight = 60;
    const resolvedBlocks = contentBlocks.map((b) => {
      const r = resolveBlockLayout(b, activeBreakpointName, rowHeight, containerWidth);
      return { ...b, ...r };
    });
    const maxY =
      resolvedBlocks.length > 0
        ? Math.max(
            ...resolvedBlocks.map(
              (b) => ((b.gridRowStart ?? 1) + (b.rowSpan ?? 1) - 1) * rowHeight
            ),
            0
          )
        : 0;
    const containerHeight = Math.max(maxY, canvasMinHeightPx);

    return previewShell(
      <div className="w-full relative" style={{ minHeight: containerHeight }}>
        <WebpageContentRenderer
          contentBlocks={contentBlocks}
          contentContainer={contentContainer}
          css={localContent.css}
          js={localContent.js}
          html={localContent.html}
          companyId={companyId}
          themeTextSettings={themeTextSettings}
          themeButtonSettings={themeButtonSettings}
          companyWebPages={companyWebPages}
          addonRenderContext={addonRenderContext}
          defaultContainerWidth={containerWidth}
          rowHeight={rowHeight}
          showBorders={true}
          breakpoint={activeBreakpointName}
        />
      </div>
    );
  }

  return null;
};
