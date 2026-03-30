import { useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchWebPageRequest,
  fetchWebPagesRequest,
  updateWebPageRequest,
  clearError,
} from "@/store/slices/companyWebPagesSlice";
import { fetchThemesRequest } from "@/store/slices/companyWebThemesSlice";
import { VisualWebEditor } from "./VisualWebEditor";
import { webPageContentToSnapshot, type SavedVisualContent } from "./webpageContentMigration";
import {
  pickCompanyThemeForTextStyles,
  getThemeTextSettingsList,
  getThemeButtonSettingsList,
} from "./addons/themeTextSettings";
import { toast } from "sonner";
import type { UpdateWebPageData } from "@/services/companyWebPages";

interface WebpageEditorProps {
  fullWidth?: boolean;
}

export const WebpageEditor = (props: WebpageEditorProps = {}) => {
  const { fullWidth = false } = props;
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentWebPage, webPages, error, loading } = useAppSelector((state) => state.companyWebPages);
  const { themes: companyThemes } = useAppSelector((state) => state.companyWebThemes);

  const themeTextSettings = useMemo(() => {
    const theme = pickCompanyThemeForTextStyles(companyThemes);
    return getThemeTextSettingsList(theme);
  }, [companyThemes]);

  const themeButtonSettings = useMemo(() => {
    const theme = pickCompanyThemeForTextStyles(companyThemes);
    return getThemeButtonSettingsList(theme);
  }, [companyThemes]);

  const loadedSnapshot = useMemo(() => {
    if (!currentWebPage) return null;
    return webPageContentToSnapshot(currentWebPage.content as SavedVisualContent);
  }, [currentWebPage]);

  useEffect(() => {
    if (pageId) {
      dispatch(fetchWebPageRequest(pageId));
    }
  }, [dispatch, pageId]);

  useEffect(() => {
    if (currentWebPage?.companyId) {
      dispatch(fetchThemesRequest({ companyId: currentWebPage.companyId }));
      dispatch(fetchWebPagesRequest({ companyId: currentWebPage.companyId }));
    }
  }, [dispatch, currentWebPage?.companyId]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handlePreview = () => {
    if (!currentWebPage?.companyId || !currentWebPage?.url) {
      toast.error("Cannot preview page: missing company or page URL");
      return;
    }

    const normalizedPath = currentWebPage.url.startsWith("/")
      ? currentWebPage.url
      : `/${currentWebPage.url}`;
    const previewUrl = `${window.location.origin}/web/${currentWebPage.companyId}${normalizedPath}`;

    window.open(previewUrl, "_blank", "noopener,noreferrer");
  };

  const handleBack = () => {
    navigate("/system/web/webpages");
  };

  if (!loading && pageId && !currentWebPage) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 bg-background p-6">
        <p className="text-muted-foreground">Webpage not found or you no longer have access.</p>
        <Button variant="accent" onClick={handleBack}>
          Back to webpages
        </Button>
      </div>
    );
  }

  return (
    <VisualWebEditor
      fullWidth={fullWidth}
      title={currentWebPage?.name || "Webpage Editor"}
      subtitle={!fullWidth ? currentWebPage?.url || "Edit your webpage" : undefined}
      companyId={currentWebPage?.companyId}
      themeTextSettings={themeTextSettings}
      themeButtonSettings={themeButtonSettings}
      companyWebPages={webPages}
      resetKey={currentWebPage?.id ?? pageId ?? ""}
      loadedSnapshot={loadedSnapshot}
      isEntityReady={!!currentWebPage && !loading}
      suppressSuccessToast
      saveSuccessMessage="Webpage saved successfully!"
      onSave={(snapshot) => {
        if (!pageId || !currentWebPage) {
          toast.error("Webpage not found");
          return;
        }
        dispatch(
          updateWebPageRequest({
            id: pageId,
            data: {
              name: currentWebPage.name,
              url: currentWebPage.url,
              isActive: currentWebPage.isActive,
              content: {
                blocks: snapshot.contentBlocks as NonNullable<UpdateWebPageData["content"]>["blocks"],
                contentContainer: snapshot.contentContainer,
                html: snapshot.editorContent.html,
                css: snapshot.editorContent.css,
                js: snapshot.editorContent.js || "",
              },
            },
          })
        );
      }}
      onPreview={handlePreview}
      onBack={handleBack}
    />
  );
};
