import { useRef, useLayoutEffect, useState } from "react";
import { ContentBlock, resolveBlockLayout, getBreakpointFromWidth } from "../types";

interface WebpageContentRendererProps {
  contentBlocks: ContentBlock[];
  css?: string;
  js?: string;
  html?: string;
  defaultContainerWidth?: number;
  rowHeight?: number;
  showBorders?: boolean;
}

/**
 * Reusable component to render webpage content using grid layout.
 * Resolves each block's layout for the current viewport breakpoint (sm, md, lg, xl, 2xl).
 * Used in both Visual mode and PublicWebPage.
 */
export const WebpageContentRenderer = ({
  contentBlocks,
  css = '',
  js = '',
  html = '',
  defaultContainerWidth = 1200,
  rowHeight = 60,
  showBorders = false,
}: WebpageContentRendererProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(defaultContainerWidth);

  useLayoutEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
    };
    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, [defaultContainerWidth]);

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
    <div ref={containerRef} className="w-full">
      {css && <style dangerouslySetInnerHTML={{ __html: css }} />}

      {resolvedBlocks.length > 0 ? (
        <div
          className="grid grid-cols-12 gap-0 w-full"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, minmax(0, 1fr))',
            width: '100%',
            boxSizing: 'border-box',
            gridAutoRows: 'min-content',
            minHeight: containerHeight,
          }}
        >
          {resolvedBlocks.map((block) => {
            const rowStart = block.gridRowStart ?? 1;
            const colStart = block.gridColumnStart ?? 1;
            const rSpan = block.rowSpan ?? 2;
            const cSpan = block.colSpan ?? 4;

            return (
              <div
                key={block.id}
                className="relative"
                style={{
                  gridRow: `${rowStart} / span ${rSpan}`,
                  gridColumn: `${colStart} / span ${cSpan}`,
                  minHeight: `${rSpan * rowHeight}px`,
                }}
              >
                <div
                  className={`relative w-full h-full p-4 ${!block.settings?.backgroundColor ? 'bg-white' : ''} ${
                    showBorders ? 'border-2 border-blue-500 shadow-lg' : ''
                  }`}
                  style={{
                    minHeight: `${rSpan * rowHeight}px`,
                    boxSizing: 'border-box',
                    overflow: 'auto',
                    wordWrap: 'break-word',
                    ...(block.settings?.backgroundColor ? { backgroundColor: block.settings.backgroundColor } : {}),
                  }}
                  dangerouslySetInnerHTML={{ __html: block.content || 'Content Block' }}
                />
              </div>
            );
          })}
        </div>
      ) : html ? (
        <div dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <div className="p-8 text-center text-muted-foreground">
          <p>No content to display.</p>
        </div>
      )}

      {js && <script dangerouslySetInnerHTML={{ __html: js }} />}
    </div>
  );
};
