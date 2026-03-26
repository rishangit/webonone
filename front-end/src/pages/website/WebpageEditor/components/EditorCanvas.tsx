import { useState, useEffect, useRef, useLayoutEffect, type ReactNode } from "react";
import {
  EditorContent,
  ViewMode,
  ContentBlock,
  BreakpointName,
  resolveBlockLayout,
} from "../types";
import { ResizableContentBlock } from "./ResizableContentBlock";
import { WebpageContentRenderer } from "./WebpageContentRenderer";
import type { ThemeButtonSetting, ThemeTextSetting } from "../../../../services/companyWebThemes";
import type { CompanyWebPage } from "../../../../services/companyWebPages";
import type { AddonRenderContext } from "../addons/types";

/** At most one of: a content block, or an addon inside a block. */
export type EditorSelection =
  | { type: "block"; id: string }
  | { type: "addon"; blockId: string; addonId: string };

interface EditorCanvasProps {
  content: EditorContent;
  viewMode?: ViewMode;
  contentBlocks?: ContentBlock[];
  activeBreakpointName?: BreakpointName;
  /** Tailwind min-width (px) — canvas is centered at this width so editing matches that breakpoint without resizing the browser. */
  canvasPreviewWidthPx?: number;
  companyId?: string;
  themeTextSettings?: ThemeTextSetting[];
  themeButtonSettings?: ThemeButtonSetting[];
  companyWebPages?: CompanyWebPage[];
  addonRenderContext?: AddonRenderContext;
  onUpdateBlock?: (block: ContentBlock, shouldPersist?: boolean, markDirty?: boolean) => void;
  onDeleteBlock?: (id: string) => void;
}

export const EditorCanvas = ({
  content,
  viewMode = "visual",
  contentBlocks = [],
  activeBreakpointName = "2xl",
  canvasPreviewWidthPx,
  companyId,
  themeTextSettings,
  themeButtonSettings,
  companyWebPages,
  addonRenderContext = "editor",
  onUpdateBlock,
  onDeleteBlock,
}: EditorCanvasProps) => {
  const [localContent, setLocalContent] = useState(content);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1200);
  const [selection, setSelection] = useState<EditorSelection | null>(null);

  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  useEffect(() => {
    if (!selection) return;
    if (selection.type === "block") {
      if (!contentBlocks.some((b) => b.id === selection.id)) {
        setSelection(null);
      }
    } else {
      const block = contentBlocks.find((b) => b.id === selection.blockId);
      if (!block?.addons?.some((a) => a.id === selection.addonId)) {
        setSelection(null);
      }
    }
  }, [contentBlocks, selection]);

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

  const previewShell = (children: ReactNode) => (
    <div className="flex-1 min-h-0 w-full relative bg-gray-100 overflow-auto">
      <div
        className={`min-h-full p-5 ${canvasPreviewWidthPx != null ? "flex justify-center" : ""}`}
      >
        <div
          ref={canvasRef}
          className="relative bg-white min-h-screen shadow-sm border border-border/30 rounded-sm"
          style={
            canvasPreviewWidthPx != null
              ? { width: canvasPreviewWidthPx, maxWidth: "100%", minWidth: 0 }
              : { width: "100%" }
          }
        >
          {children}
        </div>
      </div>
    </div>
  );

  // Edit mode with 12-column Tailwind grid
  if (viewMode === "edit") {
    const columnWidth = containerWidth / 12;
    const rowHeight = 60;

    return previewShell(
      <div
        className="relative w-full min-h-screen"
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) {
            setSelection(null);
          }
        }}
      >
        {/* Grid Background Canvas - absolute, z-index -1 (behind everything) */}
        <div
          className="absolute inset-0 grid grid-cols-12 gap-0 w-full min-h-screen"
          style={{
            zIndex: -1,
            display: "grid",
            gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={`col-bg-${i}`}
              className="col-span-1 bg-blue-50/5"
              style={{ minHeight: "100vh" }}
            />
          ))}
        </div>

        {/* Guidelines Layer */}
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

          {Array.from({ length: 100 }).map((_, i) => (
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

        {/* Content Edit Layer */}
        <div
          className="relative grid grid-cols-12 gap-0 w-full min-h-screen"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setSelection(null);
            }
          }}
          style={{
            zIndex: 10,
            display: "grid",
            gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
            width: "100%",
            boxSizing: "border-box",
            gridAutoRows: `${rowHeight}px`,
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
                  onSelectBlock={() => setSelection({ type: "block", id: block.id })}
                  onSelectAddon={(addonId) =>
                    setSelection({
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
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Visual mode — same canvas width + breakpoint as edit mode
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
    const containerHeight = Math.max(maxY + 200, 1000);

    return previewShell(
      <div className="w-full relative min-h-screen p-5" style={{ minHeight: containerHeight }}>
        <WebpageContentRenderer
          contentBlocks={contentBlocks}
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
