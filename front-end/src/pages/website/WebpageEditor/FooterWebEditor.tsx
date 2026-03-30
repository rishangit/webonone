import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchWebPagesRequest } from "@/store/slices/companyWebPagesSlice";
import { fetchThemesRequest } from "@/store/slices/companyWebThemesSlice";
import { companyWebFootersService, type CompanyWebFooter } from "@/services/companyWebFooters";
import { VisualWebEditor } from "./VisualWebEditor";
import { webPageContentToSnapshot, type SavedVisualContent } from "./webpageContentMigration";
import {
  pickCompanyThemeForTextStyles,
  getThemeTextSettingsList,
  getThemeButtonSettingsList,
} from "./addons/themeTextSettings";
import { toast } from "sonner";

interface FooterWebEditorProps {
  fullWidth?: boolean;
}

export const FooterWebEditor = (props: FooterWebEditorProps = {}) => {
  const { fullWidth = false } = props;
  const { footerId } = useParams<{ footerId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { webPages } = useAppSelector((state) => state.companyWebPages);
  const { themes: companyThemes } = useAppSelector((state) => state.companyWebThemes);

  const [footer, setFooter] = useState<CompanyWebFooter | null>(null);
  const [loading, setLoading] = useState(true);

  const themeTextSettings = useMemo(() => {
    const theme = pickCompanyThemeForTextStyles(companyThemes);
    return getThemeTextSettingsList(theme);
  }, [companyThemes]);

  const themeButtonSettings = useMemo(() => {
    const theme = pickCompanyThemeForTextStyles(companyThemes);
    return getThemeButtonSettingsList(theme);
  }, [companyThemes]);

  const loadedSnapshot = useMemo(() => {
    if (!footer) return null;
    return webPageContentToSnapshot(footer.content as SavedVisualContent);
  }, [footer]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!footerId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await companyWebFootersService.getFooterById(footerId);
        if (!cancelled) {
          setFooter(data);
          if (data.companyId) {
            dispatch(fetchThemesRequest({ companyId: data.companyId }));
            dispatch(fetchWebPagesRequest({ companyId: data.companyId }));
          }
        }
      } catch (e: unknown) {
        if (!cancelled) {
          toast.error(e instanceof Error ? e.message : "Failed to load footer");
          setFooter(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [dispatch, footerId]);

  const handlePreview = () => {
    if (!footer?.companyId) {
      toast.error("Cannot preview: missing company");
      return;
    }
    const first = webPages.find((p) => p.companyId === footer.companyId);
    const path = first?.url
      ? first.url.startsWith("/")
        ? first.url
        : `/${first.url}`
      : "/";
    window.open(
      `${window.location.origin}/web/${footer.companyId}${path}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleBack = () => {
    navigate("/system/web/footers");
  };

  if (!loading && footerId && !footer) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-background p-6">
        <p className="text-muted-foreground">Footer not found or you no longer have access.</p>
        <Button variant="accent" onClick={handleBack}>
          Back to footers
        </Button>
      </div>
    );
  }

  return (
    <VisualWebEditor
      fullWidth={fullWidth}
      title={footer?.name || "Footer designer"}
      subtitle={!fullWidth ? "Site footer layout" : undefined}
      companyId={footer?.companyId}
      themeTextSettings={themeTextSettings}
      themeButtonSettings={themeButtonSettings}
      companyWebPages={webPages}
      resetKey={footer?.id ?? footerId ?? ""}
      loadedSnapshot={loadedSnapshot}
      isEntityReady={!!footer && !loading}
      saveSuccessMessage="Footer saved successfully!"
      onSave={async (snapshot) => {
        if (!footerId || !footer) {
          toast.error("Footer not found");
          return;
        }
        await companyWebFootersService.updateFooter(footerId, {
          content: {
            blocks: snapshot.contentBlocks as unknown as Array<Record<string, unknown>>,
            contentContainer: snapshot.contentContainer,
            html: snapshot.editorContent.html,
            css: snapshot.editorContent.css,
            js: snapshot.editorContent.js || "",
          },
        });
        const next = await companyWebFootersService.getFooterById(footerId);
        setFooter(next);
      }}
      onPreview={handlePreview}
      onBack={handleBack}
    />
  );
};
