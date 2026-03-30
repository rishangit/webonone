import { useEffect, useMemo, useState } from "react";
import { Outlet, useParams } from "react-router-dom";
import { companyWebHeadersService, type CompanyWebHeader } from "@/services/companyWebHeaders";
import { companyWebFootersService, type CompanyWebFooter } from "@/services/companyWebFooters";
import { companyWebThemesService, type CompanyWebTheme } from "@/services/companyWebThemes";
import { companyWebPagesService, type CompanyWebPage } from "@/services/companyWebPages";
import { ContentAddon, ContentBlock, type ContentContainerSettings } from "./WebpageEditor/types";
import { WebpageContentRenderer } from "./WebpageEditor/components/WebpageContentRenderer";
import { ensureAddonLayouts } from "./WebpageEditor/addons/addonGridUtils";
import {
  pickCompanyThemeForTextStyles,
  getThemeTextSettingsList,
  getThemeButtonSettingsList,
} from "./WebpageEditor/addons/themeTextSettings";

export type PublicWebsiteOutletContext = {
  companyId: string;
  companyThemes: CompanyWebTheme[];
  companyWebPagesList: CompanyWebPage[];
};

/**
 * Public site shell: default header and footer stay mounted while child routes swap page body (SPA-style).
 */
export const PublicWebsiteLayout = () => {
  const { companyId } = useParams<{ companyId: string }>();
  const [defaultHeader, setDefaultHeader] = useState<CompanyWebHeader | null>(null);
  const [headerBlocks, setHeaderBlocks] = useState<ContentBlock[]>([]);
  const [headerEditorContent, setHeaderEditorContent] = useState<{
    html: string;
    css: string;
    js?: string;
  } | null>(null);
  const [defaultFooter, setDefaultFooter] = useState<CompanyWebFooter | null>(null);
  const [footerBlocks, setFooterBlocks] = useState<ContentBlock[]>([]);
  const [footerEditorContent, setFooterEditorContent] = useState<{
    html: string;
    css: string;
    js?: string;
  } | null>(null);
  const [companyThemes, setCompanyThemes] = useState<CompanyWebTheme[]>([]);
  const [companyWebPagesList, setCompanyWebPagesList] = useState<CompanyWebPage[]>([]);
  const themeTextSettings = useMemo(() => {
    const theme = pickCompanyThemeForTextStyles(companyThemes);
    return getThemeTextSettingsList(theme);
  }, [companyThemes]);

  const themeButtonSettings = useMemo(() => {
    const theme = pickCompanyThemeForTextStyles(companyThemes);
    return getThemeButtonSettingsList(theme);
  }, [companyThemes]);

  const headerContentContainer = useMemo((): ContentContainerSettings | undefined => {
    const raw = defaultHeader?.content as { contentContainer?: ContentContainerSettings } | null | undefined;
    return raw?.contentContainer;
  }, [defaultHeader]);

  const footerContentContainer = useMemo((): ContentContainerSettings | undefined => {
    const raw = defaultFooter?.content as { contentContainer?: ContentContainerSettings } | null | undefined;
    return raw?.contentContainer;
  }, [defaultFooter]);

  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      if (!companyId) {
        setDefaultHeader(null);
        setHeaderBlocks([]);
        setHeaderEditorContent(null);
        setDefaultFooter(null);
        setFooterBlocks([]);
        setFooterEditorContent(null);
        setCompanyThemes([]);
        setCompanyWebPagesList([]);
        return;
      }
      try {
        const header = await companyWebHeadersService.getDefaultHeaderPublic(companyId);
        if (cancelled) return;
        setDefaultHeader(header);

        let footer: Awaited<ReturnType<typeof companyWebFootersService.getDefaultFooterPublic>> = null;
        try {
          footer = await companyWebFootersService.getDefaultFooterPublic(companyId);
        } catch {
          footer = null;
        }
        if (cancelled) return;
        setDefaultFooter(footer);

        let themes: CompanyWebTheme[] = [];
        let pages: CompanyWebPage[] = [];
        try {
          themes = (await companyWebThemesService.getThemes(companyId)) ?? [];
        } catch {
          themes = [];
        }
        try {
          pages = (await companyWebPagesService.getWebPages(companyId)) ?? [];
        } catch {
          pages = [];
        }
        if (cancelled) return;
        setCompanyThemes(themes);
        setCompanyWebPagesList(pages);

        if (header?.content) {
          const saved = header.content;
          if (saved.blocks && Array.isArray(saved.blocks)) {
            const normalized = saved.blocks.map((block) => ({
              ...block,
              addons: ensureAddonLayouts((block.addons || []) as ContentAddon[]),
            })) as ContentBlock[];
            setHeaderBlocks(normalized);
          } else {
            setHeaderBlocks([]);
          }
          setHeaderEditorContent({
            html: saved.html || "",
            css: saved.css || "",
            js: saved.js || "",
          });
        } else {
          setHeaderBlocks([]);
          setHeaderEditorContent(null);
        }

        if (footer?.content) {
          const saved = footer.content;
          if (saved.blocks && Array.isArray(saved.blocks)) {
            const normalized = saved.blocks.map((block) => ({
              ...block,
              addons: ensureAddonLayouts((block.addons || []) as ContentAddon[]),
            })) as ContentBlock[];
            setFooterBlocks(normalized);
          } else {
            setFooterBlocks([]);
          }
          setFooterEditorContent({
            html: saved.html || "",
            css: saved.css || "",
            js: saved.js || "",
          });
        } else {
          setFooterBlocks([]);
          setFooterEditorContent(null);
        }
      } catch {
        if (!cancelled) {
          setDefaultHeader(null);
          setHeaderBlocks([]);
          setHeaderEditorContent(null);
          setDefaultFooter(null);
          setFooterBlocks([]);
          setFooterEditorContent(null);
          setCompanyThemes([]);
          setCompanyWebPagesList([]);
        }
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [companyId]);

  const outletContext = useMemo<PublicWebsiteOutletContext | null>(() => {
    if (!companyId) return null;
    return {
      companyId,
      companyThemes,
      companyWebPagesList,
    };
  }, [companyId, companyThemes, companyWebPagesList]);

  const defaultContainerWidth = 1200;
  const rowHeight = 60;
  const showHeaderChrome =
    defaultHeader &&
    (headerBlocks.length > 0 || (headerEditorContent && (headerEditorContent.html || headerEditorContent.css)));

  const showFooterChrome =
    defaultFooter &&
    (footerBlocks.length > 0 || (footerEditorContent && (footerEditorContent.html || footerEditorContent.css)));

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {showHeaderChrome && (
        <header className="sticky top-0 z-40 w-full bg-white shadow-sm border-b border-gray-200">
          <WebpageContentRenderer
            contentBlocks={headerBlocks}
            contentContainer={headerContentContainer}
            css={headerEditorContent?.css}
            js={headerEditorContent?.js}
            html={headerEditorContent?.html}
            companyId={companyId}
            themeTextSettings={themeTextSettings}
            themeButtonSettings={themeButtonSettings}
            companyWebPages={companyWebPagesList}
            addonRenderContext="published"
            defaultContainerWidth={defaultContainerWidth}
            rowHeight={rowHeight}
            showBorders={false}
          />
        </header>
      )}
      <div className="flex-1 min-h-0 w-full">
        {companyId && outletContext ? <Outlet context={outletContext} /> : null}
      </div>
      {showFooterChrome && (
        <footer className="mt-auto z-30 w-full bg-white shadow-[0_-1px_3px_rgba(0,0,0,0.06)] border-t border-gray-200">
          <WebpageContentRenderer
            contentBlocks={footerBlocks}
            contentContainer={footerContentContainer}
            css={footerEditorContent?.css}
            js={footerEditorContent?.js}
            html={footerEditorContent?.html}
            companyId={companyId}
            themeTextSettings={themeTextSettings}
            themeButtonSettings={themeButtonSettings}
            companyWebPages={companyWebPagesList}
            addonRenderContext="published"
            defaultContainerWidth={defaultContainerWidth}
            rowHeight={rowHeight}
            showBorders={false}
          />
        </footer>
      )}
    </div>
  );
};
