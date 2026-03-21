import { useState, useEffect, useLayoutEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Monitor } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  fetchWebPageRequest,
  fetchWebPagesRequest,
  updateWebPageRequest,
  clearError,
} from "../../../store/slices/companyWebPagesSlice";
import { fetchThemesRequest } from "../../../store/slices/companyWebThemesSlice";
import { EditorContent, EditorState, ViewMode, ContentBlock, BreakpointName } from "./types";
import { EditorToolbar, EditorCanvas } from "./components";
import {
  pickCompanyThemeForTextStyles,
  getThemeTextSettingsList,
  getThemeButtonSettingsList,
} from "./addons/themeTextSettings";
import { ensureAddonLayouts } from "./addons/addonGridUtils";
import { toast } from "sonner";
import { nanoid } from "nanoid";

interface WebpageEditorProps {
  fullWidth?: boolean; // If true, editor opens in full width without sidebar
}

export const WebpageEditor = (props: WebpageEditorProps = {}) => {
  const { fullWidth = false } = props;
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentWebPage, webPages, error } = useAppSelector((state) => state.companyWebPages);
  const { themes: companyThemes } = useAppSelector((state) => state.companyWebThemes);

  const themeTextSettings = useMemo(() => {
    const theme = pickCompanyThemeForTextStyles(companyThemes);
    return getThemeTextSettingsList(theme);
  }, [companyThemes]);

  const themeButtonSettings = useMemo(() => {
    const theme = pickCompanyThemeForTextStyles(companyThemes);
    return getThemeButtonSettingsList(theme);
  }, [companyThemes]);

  const [editorState, setEditorState] = useState<EditorState>({
    content: { html: '', css: '', js: '' },
    isDirty: false,
    isSaving: false,
  });

  const [viewMode, setViewMode] = useState<ViewMode>('visual');
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [screenWidth, setScreenWidth] = useState(0);

  // Track screen width for responsive breakpoint indicator
  useLayoutEffect(() => {
    const updateScreenWidth = () => {
      setScreenWidth(window.innerWidth);
    };
    
    updateScreenWidth();
    window.addEventListener('resize', updateScreenWidth);
    return () => window.removeEventListener('resize', updateScreenWidth);
  }, []);

  // Determine active Tailwind breakpoint (sm, md, lg, xl, 2xl)
  const getActiveBreakpoint = (): { name: BreakpointName; width: number; active: true } => {
    if (screenWidth >= 1536) return { name: '2xl', width: 1536, active: true };
    if (screenWidth >= 1280) return { name: 'xl', width: 1280, active: true };
    if (screenWidth >= 1024) return { name: 'lg', width: 1024, active: true };
    if (screenWidth >= 768) return { name: 'md', width: 768, active: true };
    if (screenWidth >= 640) return { name: 'sm', width: 640, active: true };
    return { name: 'sm', width: 640, active: true };
  };

  const activeBreakpoint = getActiveBreakpoint();
  const activeBreakpointName: BreakpointName = activeBreakpoint.name;
  const breakpoints = [
    { name: 'sm', width: 640 },
    { name: 'md', width: 768 },
    { name: 'lg', width: 1024 },
    { name: 'xl', width: 1280 },
    { name: '2xl', width: 1536 },
  ];

  // Fetch webpage data
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

  // Initialize editor content from webpage
  useEffect(() => {
    if (currentWebPage) {
      // Load saved content if available
      if (currentWebPage.content) {
        const savedContent = currentWebPage.content;
        
        // Load content blocks and ensure colSpan is set
        if (savedContent.blocks && Array.isArray(savedContent.blocks)) {
          // Migrate old blocks to use colSpan instead of width
          const migratedBlocks = savedContent.blocks.map((block: any) => {
            let next = { ...block };
            // If colSpan is missing, calculate it from width (backward compatibility)
            if (!next.colSpan && next.width) {
              const defaultContainerWidth = 1200;
              const columnWidth = defaultContainerWidth / 12;
              const colSpan = Math.round(next.width / columnWidth);
              next = { ...next, colSpan: Math.max(1, Math.min(12, colSpan)) };
            }
            next = { ...next, colSpan: next.colSpan || 4 };
            const rawAddons = Array.isArray(next.addons) ? next.addons : [];
            return {
              ...next,
              addons: ensureAddonLayouts(rawAddons),
            };
          });
          setContentBlocks(migratedBlocks);
        } else {
          setContentBlocks([]);
        }
        
        // Load HTML, CSS, JS
        const initialContent: EditorContent = {
          html: savedContent.html || '',
          css: savedContent.css || '',
          js: savedContent.js || '',
        };
        setEditorState({
          content: initialContent,
          isDirty: false,
          isSaving: false,
        });
      } else {
        // Initialize with empty content - user will add blocks
        const initialContent: EditorContent = {
          html: '',
          css: '',
          js: '',
        };
        setEditorState({
          content: initialContent,
          isDirty: false,
          isSaving: false,
        });
        setContentBlocks([]);
      }
    }
  }, [currentWebPage]);

  useEffect(() => {
    if (error) {
      console.error("Webpage error:", error);
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleAddContent = () => {
    const defaultColSpan = 4;
    const defaultRowSpan = 2;
    const newBlock: ContentBlock = {
      id: nanoid(10),
      content: '',
      type: 'text',
      gridRowStart: 1 + contentBlocks.length * defaultRowSpan,
      gridColumnStart: 1,
      rowSpan: defaultRowSpan,
      colSpan: defaultColSpan,
    };
    setContentBlocks([...contentBlocks, newBlock]);
    setEditorState((prev) => ({ ...prev, isDirty: true }));
  };

  const persistBlocksToDatabase = (blocksToPersist: ContentBlock[]) => {
    if (!pageId || !currentWebPage) {
      toast.error("Webpage not found");
      return;
    }

    setEditorState((prev) => ({ ...prev, isSaving: true }));

    const blocksToSave = blocksToPersist.map(({ width, ...block }) => ({
      ...block,
      colSpan: block.colSpan || 4,
    }));

    const contentData: any = {
      blocks: blocksToSave,
      html: editorState.content.html,
      css: editorState.content.css,
      js: editorState.content.js || '',
    };

    dispatch(
      updateWebPageRequest({
        id: pageId,
        data: {
          name: currentWebPage.name,
          url: currentWebPage.url,
          isActive: currentWebPage.isActive,
          content: contentData,
        },
      })
    );

    setEditorState((prev) => ({
      ...prev,
      isDirty: false,
      isSaving: false,
    }));

    toast.success("Addon saved successfully!");
  };

  const handleUpdateBlock = (updatedBlock: ContentBlock, shouldPersist: boolean = false, markDirty: boolean = true) => {
    const gridUpdate = {
      gridRowStart: updatedBlock.gridRowStart ?? 1,
      gridColumnStart: updatedBlock.gridColumnStart ?? 1,
      rowSpan: updatedBlock.rowSpan ?? 2,
      colSpan: Math.max(1, Math.min(12, updatedBlock.colSpan ?? 4)),
    };

    let nextBlocks: ContentBlock[] = [];
    setContentBlocks((prev) => {
      nextBlocks = prev.map((block) => {
        if (block.id !== updatedBlock.id) return block;
        const layoutByBreakpoint = {
          ...block.layoutByBreakpoint,
          [activeBreakpointName]: gridUpdate,
        };
        return {
          ...block,
          content: updatedBlock.content ?? block.content,
          type: updatedBlock.type ?? block.type,
          addons: updatedBlock.addons ?? block.addons,
          layoutByBreakpoint,
          ...(activeBreakpointName === '2xl' ? gridUpdate : {}),
          // Preserve settings (e.g. backgroundColor) from dialog updates; allow clearing when dialog sends settings
          settings: 'settings' in updatedBlock ? updatedBlock.settings : block.settings,
          ...('zIndex' in updatedBlock ? { zIndex: updatedBlock.zIndex } : {}),
        };
      });
      return nextBlocks;
    });

    if (shouldPersist) {
      persistBlocksToDatabase(nextBlocks.length ? nextBlocks : contentBlocks);
    } else {
      if (markDirty) {
        setEditorState((prev) => ({ ...prev, isDirty: true }));
      }
    }
  };

  const handleDeleteBlock = (id: string) => {
    setContentBlocks(contentBlocks.filter(block => block.id !== id));
    setEditorState((prev) => ({ ...prev, isDirty: true }));
  };

  const handleSave = async () => {
    if (!pageId || !currentWebPage) {
      toast.error("Webpage not found");
      return;
    }

    setEditorState((prev) => ({ ...prev, isSaving: true }));

    try {
      const blocksToSave = contentBlocks.map(({ width, ...block }) => ({
        ...block,
        colSpan: block.colSpan || 4,
      }));
      const contentData: any = {
        blocks: blocksToSave,
        html: editorState.content.html,
        css: editorState.content.css,
        js: editorState.content.js || '',
      };

      dispatch(updateWebPageRequest({
        id: pageId,
        data: {
          name: currentWebPage.name,
          url: currentWebPage.url,
          isActive: currentWebPage.isActive,
          content: contentData, // Save as JSON
        },
      }));

      setEditorState((prev) => ({
        ...prev,
        isDirty: false,
        isSaving: false,
      }));

      toast.success("Webpage saved successfully!");
    } catch (err) {
      console.error("Error saving webpage:", err);
      toast.error("Failed to save webpage");
      setEditorState((prev) => ({ ...prev, isSaving: false }));
    }
  };

  const handlePreview = () => {
    if (!currentWebPage?.companyId || !currentWebPage?.url) {
      toast.error("Cannot preview page: missing company or page URL");
      return;
    }

    const normalizedPath = currentWebPage.url.startsWith('/')
      ? currentWebPage.url
      : `/${currentWebPage.url}`;
    const previewUrl = `${window.location.origin}/web/${currentWebPage.companyId}${normalizedPath}`;

    window.open(previewUrl, '_blank', 'noopener,noreferrer');
  };

  const handleBack = () => {
    if (editorState.isDirty) {
      if (window.confirm("You have unsaved changes. Are you sure you want to leave?")) {
        if (fullWidth) {
          window.close();
        } else {
          navigate('/system/web/webpages');
        }
      }
    } else {
      if (fullWidth) {
        window.close();
      } else {
        navigate('/system/web/webpages');
      }
    }
  };

  return (
    <div className={`${fullWidth ? 'w-full' : ''} h-screen flex flex-col bg-background overflow-hidden`}>
      {/* Toolbar - At top for full width mode */}
      <div className="flex-shrink-0 border-b border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-sm">
        <div className="flex items-center justify-between p-3">
          <div className="flex items-center gap-4">
            {!fullWidth && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="hover:bg-[var(--accent-bg)]"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <div>
              <h1 className="text-lg font-bold text-foreground">
                {currentWebPage?.name || 'Webpage Editor'}
              </h1>
              {!fullWidth && (
                <p className="text-sm text-muted-foreground">
                  {currentWebPage?.url || 'Edit your webpage'}
                </p>
              )}
            </div>
          </div>

          {/* Screen Size Indicator */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-background/50 rounded-lg border border-[var(--glass-border)]">
              <Monitor className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-mono text-foreground min-w-[60px]">
                {screenWidth}px
              </span>
              <div className="h-4 w-px bg-border mx-1" />
              <div className="flex items-center gap-1.5">
                {breakpoints.map((bp) => {
                  const isActive = activeBreakpoint.name === bp.name;
                  return (
                    <Badge
                      key={bp.name}
                      variant={isActive ? 'default' : 'outline'}
                      className={`text-xs font-mono px-2 py-0.5 ${
                        isActive
                          ? 'bg-[var(--accent-primary)] text-[var(--accent-button-text)] border-[var(--accent-primary)]'
                          : 'bg-transparent text-muted-foreground border-border'
                      }`}
                    >
                      {bp.name}
                    </Badge>
                  );
                })}
              </div>
            </div>

            {fullWidth && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="hover:bg-[var(--accent-bg)]"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Close
              </Button>
            )}
          </div>
        </div>
        <EditorToolbar
          onSave={handleSave}
          onPreview={handlePreview}
          isSaving={editorState.isSaving}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onAddContent={viewMode === 'edit' ? handleAddContent : undefined}
        />
      </div>

      {/* Editor Canvas - Full width */}
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col w-full">
        <EditorCanvas
          content={editorState.content}
          viewMode={viewMode}
          contentBlocks={contentBlocks}
          activeBreakpointName={activeBreakpointName}
          companyId={currentWebPage?.companyId}
          themeTextSettings={themeTextSettings}
          themeButtonSettings={themeButtonSettings}
          companyWebPages={webPages}
          addonRenderContext="editor"
          onUpdateBlock={handleUpdateBlock}
          onDeleteBlock={handleDeleteBlock}
        />
      </div>
    </div>
  );
};
