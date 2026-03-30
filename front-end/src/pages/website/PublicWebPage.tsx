import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation, useOutletContext } from "react-router-dom";
import { companyWebPagesService, type CompanyWebPage } from "@/services/companyWebPages";
import { companyWebThemesService, type CompanyWebTheme } from "@/services/companyWebThemes";
import { ContentAddon, ContentBlock, type ContentContainerSettings } from "./WebpageEditor/types";
import { WebpageContentRenderer } from "./WebpageEditor/components/WebpageContentRenderer";
import { ensureAddonLayouts } from "./WebpageEditor/addons/addonGridUtils";
import {
  pickCompanyThemeForTextStyles,
  getThemeTextSettingsList,
  getThemeButtonSettingsList,
} from "./WebpageEditor/addons/themeTextSettings";
import type { PublicWebsiteOutletContext } from "./PublicWebsiteLayout";

/**
 * Single published page body. Rendered inside `PublicWebsiteLayout` (outlet) so the header stays mounted.
 */
export const PublicWebPage = () => {
  const { companyId, "*": pageUrlSplat } = useParams<{ companyId: string; "*": string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const outlet = useOutletContext<PublicWebsiteOutletContext | null>();

  const [webPage, setWebPage] = useState<CompanyWebPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [editorContent, setEditorContent] = useState<{ html: string; css: string; js?: string } | null>(null);
  const [localThemes, setLocalThemes] = useState<CompanyWebTheme[]>([]);
  const [localPagesList, setLocalPagesList] = useState<CompanyWebPage[]>([]);

  const companyThemes = outlet?.companyThemes ?? localThemes;
  const companyWebPagesList = outlet?.companyWebPagesList ?? localPagesList;

  const themeTextSettings = useMemo(() => {
    const theme = pickCompanyThemeForTextStyles(companyThemes);
    return getThemeTextSettingsList(theme);
  }, [companyThemes]);

  const themeButtonSettings = useMemo(() => {
    const theme = pickCompanyThemeForTextStyles(companyThemes);
    return getThemeButtonSettingsList(theme);
  }, [companyThemes]);

  const pageContentContainer = useMemo((): ContentContainerSettings | undefined => {
    const raw = webPage?.content as { contentContainer?: ContentContainerSettings } | null | undefined;
    return raw?.contentContainer;
  }, [webPage]);

  const getPageUrl = () => {
    if (pageUrlSplat) {
      return pageUrlSplat.startsWith("/") ? pageUrlSplat : `/${pageUrlSplat}`;
    }

    const pathParts = location.pathname.split("/");
    const webIndex = pathParts.indexOf("web");
    if (webIndex !== -1 && pathParts.length > webIndex + 2) {
      const urlParts = pathParts.slice(webIndex + 2);
      return `/${urlParts.join("/")}`;
    }
    return "/";
  };

  useEffect(() => {
    const fetchWebPage = async () => {
      if (!companyId) {
        setError("Missing company ID");
        setLoading(false);
        return;
      }

      const pageUrl = getPageUrl();

      try {
        setLoading(true);
        const page = await companyWebPagesService.getWebPageByCompanyAndUrl(companyId, pageUrl);

        if (!page) {
          setError("Page not found");
          setLoading(false);
          return;
        }

        setWebPage(page);

        if (!outlet) {
          try {
            const themes = await companyWebThemesService.getThemes(page.companyId);
            setLocalThemes(themes ?? []);
          } catch {
            setLocalThemes([]);
          }

          try {
            const pages = await companyWebPagesService.getWebPages(page.companyId);
            setLocalPagesList(pages ?? []);
          } catch {
            setLocalPagesList([]);
          }
        }

        if (page.content) {
          const savedContent = page.content;

          if (savedContent.blocks && Array.isArray(savedContent.blocks)) {
            const normalizedBlocks = savedContent.blocks.map((block) => ({
              ...block,
              addons: ensureAddonLayouts((block.addons || []) as ContentAddon[]),
            })) as ContentBlock[];
            setContentBlocks(normalizedBlocks);
          }

          setEditorContent({
            html: savedContent.html || "",
            css: savedContent.css || "",
            js: savedContent.js || "",
          });
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Failed to load webpage");
      } finally {
        setLoading(false);
      }
    };

    void fetchWebPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- outlet from layout; avoid refetch on context identity change
  }, [companyId, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent-primary)] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading page…</p>
        </div>
      </div>
    );
  }

  if (error || !webPage) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Page Not Found</h1>
          <p className="text-muted-foreground mb-4">{error || "The requested page could not be found."}</p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="text-[var(--accent-primary)] hover:underline"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const defaultContainerWidth = 1200;
  const rowHeight = 60;

  return (
    <div className="w-full relative">
      {contentBlocks.length > 0 || editorContent?.html ? (
        <WebpageContentRenderer
          contentBlocks={contentBlocks}
          contentContainer={pageContentContainer}
          css={editorContent?.css}
          js={editorContent?.js}
          html={editorContent?.html}
          companyId={webPage.companyId}
          themeTextSettings={themeTextSettings}
          themeButtonSettings={themeButtonSettings}
          companyWebPages={companyWebPagesList}
          addonRenderContext="published"
          defaultContainerWidth={defaultContainerWidth}
          rowHeight={rowHeight}
          showBorders={false}
        />
      ) : (
        <div className="p-8">
          <h1 className="text-3xl font-bold text-foreground mb-4">{webPage.name}</h1>
          <p className="text-muted-foreground">
            Page content will be displayed here. Edit the page in the editor to add content.
          </p>
        </div>
      )}
    </div>
  );
};
