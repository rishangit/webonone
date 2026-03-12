import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { EditorContent, ViewMode, ContentBlock, BreakpointName, resolveBlockLayout, getBreakpointFromWidth } from "../types";
import { ResizableContentBlock } from "./ResizableContentBlock";
import { WebpageContentRenderer } from "./WebpageContentRenderer";

interface EditorCanvasProps {
  content: EditorContent;
  viewMode?: ViewMode;
  contentBlocks?: ContentBlock[];
  activeBreakpointName?: BreakpointName;
  onUpdateBlock?: (block: ContentBlock) => void;
  onDeleteBlock?: (id: string) => void;
}

export const EditorCanvas = ({
  content,
  viewMode = 'visual',
  contentBlocks = [],
  activeBreakpointName = '2xl',
  onUpdateBlock,
  onDeleteBlock,
}: EditorCanvasProps) => {
  const [localContent, setLocalContent] = useState(content);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(1200);

  useEffect(() => {
    setLocalContent(content);
  }, [content]);

  // Update container width dynamically for responsive grid (for both edit and visual modes)
  useLayoutEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth;
        setContainerWidth(width);
      }
    };
    
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [viewMode, containerRef]);

  // Edit mode with 12-column Tailwind grid
  if (viewMode === 'edit') {
    const columnWidth = containerWidth / 12;
    const rowHeight = 60;

    return (
      <div 
        className="flex-1 min-h-0 w-full relative bg-gray-100 overflow-auto" 
        ref={containerRef}
      >
        {/* Full width canvas - treated as the page with Tailwind grid */}
        <div className="w-full bg-white relative min-h-screen p-5">
          {/* Canvas Container - relative positioning for content layer */}
          <div className="relative w-full min-h-screen">
            
            {/* Grid Background Canvas - absolute, z-index -1 (behind everything) */}
            <div 
              className="absolute inset-0 grid grid-cols-12 gap-0 w-full min-h-screen"
              style={{ 
                zIndex: -1,
                display: 'grid', 
                gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
                width: '100%',
                boxSizing: 'border-box'
              }}
            >
              {/* Grid Column Backgrounds - 12 columns */}
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={`col-bg-${i}`}
                  className="col-span-1 bg-blue-50/5"
                  style={{ minHeight: '100vh' }}
                />
              ))}
            </div>

            {/* Guidelines Layer - absolute, behind content */}
            <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
              {/* Vertical Column Lines */}
              <div className="relative w-full h-full">
                {Array.from({ length: 13 }).map((_, i) => {
                  const leftPosition = (i * 100) / 12;
                  return (
                    <div
                      key={`col-line-${i}`}
                      className="absolute top-0 bottom-0 w-px border-l border-dashed border-blue-200/40"
                      style={{ left: `${leftPosition}%` }}
                    />
                  );
                })}
              </div>

              {/* Horizontal Row Lines */}
              {Array.from({ length: 100 }).map((_, i) => (
                <div
                  key={`row-line-${i}`}
                  className="absolute left-0 right-0 h-px border-t border-dashed border-blue-300/20"
                  style={{ top: `${i * rowHeight}px` }}
                />
              ))}

              {/* Column Number Indicators */}
              {Array.from({ length: 12 }).map((_, i) => {
                const leftPosition = ((i + 0.5) * 100) / 12;
                return (
                  <div
                    key={`col-number-${i}`}
                    className="absolute top-2 text-xs text-blue-500 font-mono bg-white/80 px-1 rounded pointer-events-none"
                    style={{ left: `${leftPosition}%`, transform: 'translateX(-50%)', zIndex: 1 }}
                  >
                    {i + 1}
                  </div>
                );
              })}
            </div>

            {/* Content Edit Layer - relative positioning, content flows in grid */}
            <div 
              className="relative grid grid-cols-12 gap-0 w-full min-h-screen"
              style={{ 
                zIndex: 10,
                display: 'grid', 
                gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
                width: '100%',
                boxSizing: 'border-box',
                gridAutoRows: 'min-content'
              }}
            >
            {/* Content Blocks - layout resolved for active breakpoint; use grid-area (row/col/rowSpan/colSpan) directly */}
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
                    }}
                  >
                    <ResizableContentBlock
                      block={blockToShow}
                      onUpdate={onUpdateBlock || (() => {})}
                      onDelete={onDeleteBlock}
                      gridColumnWidth={columnWidth}
                      gridRowHeight={rowHeight}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Visual mode - preview; resolve block layout for current viewport breakpoint
  if (viewMode === 'visual') {
    const rowHeight = 60;
    const breakpoint = getBreakpointFromWidth(containerWidth);
    const resolvedBlocks = contentBlocks.map((b) => {
      const r = resolveBlockLayout(b, breakpoint, rowHeight, containerWidth);
      return { ...b, ...r };
    });
    const maxY = resolvedBlocks.length > 0
      ? Math.max(...resolvedBlocks.map((b) => ((b.gridRowStart ?? 1) + (b.rowSpan ?? 1) - 1) * rowHeight), 0)
      : 0;
    const containerHeight = Math.max(maxY + 200, 1000);

    return (
      <div 
        className="flex-1 min-h-0 w-full relative bg-gray-100 overflow-auto"
        ref={containerRef}
      >
        <div 
          className="w-full bg-white relative min-h-screen p-5"
          style={{ minHeight: containerHeight }}
        >
          <WebpageContentRenderer
            contentBlocks={resolvedBlocks}
            css={localContent.css}
            js={localContent.js}
            html={localContent.html}
            defaultContainerWidth={containerWidth}
            rowHeight={rowHeight}
            showBorders={true}
          />
        </div>
      </div>
    );
  }

  return null;
};
