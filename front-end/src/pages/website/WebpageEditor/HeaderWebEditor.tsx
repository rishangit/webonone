import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchWebPagesRequest } from "@/store/slices/companyWebPagesSlice";
import { fetchThemesRequest } from "@/store/slices/companyWebThemesSlice";
import { companyWebHeadersService, type CompanyWebHeader } from "@/services/companyWebHeaders";
import { VisualWebEditor } from "./VisualWebEditor";
import { webPageContentToSnapshot, type SavedVisualContent } from "./webpageContentMigration";
import {
  pickCompanyThemeForTextStyles,
  getThemeTextSettingsList,
  getThemeButtonSettingsList,
} from "./addons/themeTextSettings";
import { toast } from "sonner";

interface HeaderWebEditorProps {
  fullWidth?: boolean;
}

export const HeaderWebEditor = (props: HeaderWebEditorProps = {}) => {
  const { fullWidth = false } = props;
  const { headerId } = useParams<{ headerId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { webPages } = useAppSelector((state) => state.companyWebPages);
  const { themes: companyThemes } = useAppSelector((state) => state.companyWebThemes);

  const [header, setHeader] = useState<CompanyWebHeader | null>(null);
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
    if (!header) return null;
    return webPageContentToSnapshot(header.content as SavedVisualContent);
  }, [header]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      if (!headerId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await companyWebHeadersService.getHeaderById(headerId);
        if (!cancelled) {
          setHeader(data);
          if (data.companyId) {
            dispatch(fetchThemesRequest({ companyId: data.companyId }));
            dispatch(fetchWebPagesRequest({ companyId: data.companyId }));
          }
        }
      } catch (e: unknown) {
        if (!cancelled) {
          toast.error(e instanceof Error ? e.message : "Failed to load header");
          setHeader(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [dispatch, headerId]);

  const handlePreview = () => {
    if (!header?.companyId) {
      toast.error("Cannot preview: missing company");
      return;
    }
    const first = webPages.find((p) => p.companyId === header.companyId);
    const path = first?.url
      ? first.url.startsWith("/")
        ? first.url
        : `/${first.url}`
      : "/";
    window.open(
      `${window.location.origin}/web/${header.companyId}${path}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const handleBack = () => {
    navigate("/system/web/headers");
  };

  if (!loading && headerId && !header) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-background p-6">
        <p className="text-muted-foreground">Header not found or you no longer have access.</p>
        <Button variant="accent" onClick={handleBack}>
          Back to headers
        </Button>
      </div>
    );
  }

  return (
    <VisualWebEditor
      fullWidth={fullWidth}
      title={header?.name || "Header designer"}
      subtitle={!fullWidth ? "Site header layout" : undefined}
      companyId={header?.companyId}
      themeTextSettings={themeTextSettings}
      themeButtonSettings={themeButtonSettings}
      companyWebPages={webPages}
      resetKey={header?.id ?? headerId ?? ""}
      loadedSnapshot={loadedSnapshot}
      isEntityReady={!!header && !loading}
      saveSuccessMessage="Header saved successfully!"
      onSave={async (snapshot) => {
        if (!headerId || !header) {
          toast.error("Header not found");
          return;
        }
        await companyWebHeadersService.updateHeader(headerId, {
          content: {
            blocks: snapshot.contentBlocks as unknown as Array<Record<string, unknown>>,
            contentContainer: snapshot.contentContainer,
            html: snapshot.editorContent.html,
            css: snapshot.editorContent.css,
            js: snapshot.editorContent.js || "",
          },
        });
        const next = await companyWebHeadersService.getHeaderById(headerId);
        setHeader(next);
      }}
      onPreview={handlePreview}
      onBack={handleBack}
    />
  );
};
