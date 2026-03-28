import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { companyWebPagesService } from "@/services/companyWebPages";
import { CompanyWebPage } from "@/services/companyWebPages";
import { companyWebThemesService, type CompanyWebTheme } from "@/services/companyWebThemes";
import { ContentAddon, ContentBlock } from "./WebpageEditor/types";
import { WebpageContentRenderer } from "./WebpageEditor/components/WebpageContentRenderer";
import { ensureAddonLayouts } from "./WebpageEditor/addons/addonGridUtils";
import {
  pickCompanyThemeForTextStyles,
  getThemeTextSettingsList,
  getThemeButtonSettingsList,
} from "./WebpageEditor/addons/themeTextSettings";

export const PublicWebPage = () => {
  const { companyId, '*': pageUrlSplat } = useParams<{ companyId: string; '*': string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [webPage, setWebPage] = useState<CompanyWebPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [editorContent, setEditorContent] = useState<{ html: string; css: string; js?: string } | null>(null);
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

  // Extract pageUrl from the pathname or splat parameter
  const getPageUrl = () => {
    if (pageUrlSplat) {
      // If splat parameter exists, use it and ensure it starts with /
      return pageUrlSplat.startsWith('/') ? pageUrlSplat : `/${  pageUrlSplat}`;
    }
    
    // Fallback: extract from pathname
    const pathParts = location.pathname.split('/');
    const webIndex = pathParts.indexOf('web');
    if (webIndex !== -1 && pathParts.length > webIndex + 2) {
      // Get everything after companyId
      const urlParts = pathParts.slice(webIndex + 2);
      return `/${  urlParts.join('/')}`;
    }
    return '/';
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

        // Allow viewing inactive pages (for preview/testing)
        // In production, you might want to check isActive here
        setWebPage(page);

        try {
          const themes = await companyWebThemesService.getThemes(page.companyId);
          setCompanyThemes(themes ?? []);
        } catch {
          setCompanyThemes([]);
        }

        try {
          const pages = await companyWebPagesService.getWebPages(page.companyId);
          setCompanyWebPagesList(pages ?? []);
        } catch {
          setCompanyWebPagesList([]);
        }
        
        // Load content blocks and editor content from saved data
        if (page.content) {
          const savedContent = page.content;
          
          // Load content blocks
          if (savedContent.blocks && Array.isArray(savedContent.blocks)) {
            const normalizedBlocks = savedContent.blocks.map((block) => ({
              ...block,
              addons: ensureAddonLayouts((block.addons || []) as ContentAddon[]),
            })) as ContentBlock[];
            setContentBlocks(normalizedBlocks);
          }
          
          // Load HTML, CSS, JS
          setEditorContent({
            html: savedContent.html || '',
            css: savedContent.css || '',
            js: savedContent.js || '',
          });
        }
        
      } catch (err: any) {
        console.error("Error fetching webpage:", err);
        setError(err.message || "Failed to load webpage");
      } finally {
        setLoading(false);
      }
    };

    fetchWebPage();
  }, [companyId, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent-primary)] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading page...</p>
        </div>
      </div>
    );
  }

  if (error || !webPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">Page Not Found</h1>
          <p className="text-muted-foreground mb-4">{error || "The requested page could not be found."}</p>
          <button
            onClick={() => navigate(-1)}
            className="text-[var(--accent-primary)] hover:underline"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Render the webpage content using the same grid layout as Visual mode
  const defaultContainerWidth = 1200;
  const rowHeight = 60;
  
  // Calculate container height based on content blocks
  const maxY = contentBlocks.length > 0 
    ? Math.max(...contentBlocks.map((block) => (block.y ?? 0) + (block.height ?? 0)), 0)
    : 0;
  const containerHeight = Math.max(maxY + 200, 1000);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Full width canvas - treated as the page */}
      <div 
        className="w-full bg-white relative min-h-screen"
        style={{ 
          minHeight: containerHeight,
        }}
      >
        {/* Reuse WebpageContentRenderer component (same as Visual mode) */}
        {contentBlocks.length > 0 || editorContent?.html ? (
          <WebpageContentRenderer
            contentBlocks={contentBlocks}
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
            <p className="text-muted-foreground">Page content will be displayed here. Edit the page in the editor to add content.</p>
          </div>
        )}
      </div>
    </div>
  );
};
