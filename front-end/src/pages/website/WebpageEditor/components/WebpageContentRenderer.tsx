import { useRef, useLayoutEffect, useState } from "react";
import { ContentBlock, resolveBlockLayout, getBreakpointFromWidth } from "../types";
import { ContentAddonsRenderer } from "../addons";
import type { ThemeButtonSetting, ThemeTextSetting } from "../../../../services/companyWebThemes";
import type { CompanyWebPage } from "../../../../services/companyWebPages";
import type { AddonRenderContext } from "../addons/types";

interface WebpageContentRendererProps {
  contentBlocks: ContentBlock[];
  css?: string;
  js?: string;
  html?: string;
  companyId?: string;
  themeTextSettings?: ThemeTextSetting[];
  themeButtonSettings?: ThemeButtonSetting[];
  companyWebPages?: CompanyWebPage[];
  addonRenderContext?: AddonRenderContext;
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
  companyId,
  themeTextSettings,
  themeButtonSettings,
  companyWebPages,
  addonRenderContext = "published",
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
            const safeContentHtml =
              block.content && block.content !== 'New Content Block' ? block.content : '';

            return (
              <div
                key={block.id}
                className="relative"
                style={{
                  gridRow: `${rowStart} / span ${rSpan}`,
                  gridColumn: `${colStart} / span ${cSpan}`,
                  height: `${rSpan * rowHeight}px`,
                  minHeight: `${rSpan * rowHeight}px`,
                  zIndex: block.zIndex ?? 0,
                }}
              >
                <div
                  className={`relative w-full h-full ${!block.settings?.backgroundColor ? 'bg-white' : ''} ${
                    showBorders ? 'border-2 border-blue-500 shadow-lg' : ''
                  }`}
                  style={{
                    height: `${rSpan * rowHeight}px`,
                    minHeight: `${rSpan * rowHeight}px`,
                    boxSizing: 'border-box',
                    // Visual/public mode should not show block scrollbars when content fits.
                    overflow: 'hidden',
                    wordWrap: 'break-word',
                    ...(block.settings?.backgroundColor ? { backgroundColor: block.settings.backgroundColor } : {}),
                  }}
                >
                  {safeContentHtml ? (
                    <div className="w-full h-full min-h-0 flex flex-col">
                      <div dangerouslySetInnerHTML={{ __html: safeContentHtml }} />
                      <div className="flex-1 min-h-0 overflow-hidden">
                        <ContentAddonsRenderer
                          addons={block.addons}
                          companyId={companyId}
                          themeTextSettings={themeTextSettings}
                          themeButtonSettings={themeButtonSettings}
                          companyWebPages={companyWebPages}
                          addonRenderContext={addonRenderContext}
                          breakpoint={breakpoint}
                          rowHeight={rowHeight}
                        />
                      </div>
                    </div>
                  ) : (
                    <ContentAddonsRenderer
                      addons={block.addons}
                      companyId={companyId}
                      themeTextSettings={themeTextSettings}
                      themeButtonSettings={themeButtonSettings}
                      companyWebPages={companyWebPages}
                      addonRenderContext={addonRenderContext}
                      breakpoint={breakpoint}
                      rowHeight={rowHeight}
                    />
                  )}
                </div>
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
