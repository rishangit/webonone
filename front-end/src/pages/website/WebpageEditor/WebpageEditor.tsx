import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronRight, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchWebPageRequest,
  fetchWebPagesRequest,
  updateWebPageRequest,
  clearError,
} from "@/store/slices/companyWebPagesSlice";
import { fetchThemesRequest } from "@/store/slices/companyWebThemesSlice";
import {
  EditorContent,
  EditorState,
  ViewMode,
  ContentBlock,
  BreakpointName,
  TAILWIND_MIN_WIDTH_PX,
  getBreakpointFromWidth,
} from "./types";
import { EditorToolbar, EditorCanvas } from "./components";
import {
  pickCompanyThemeForTextStyles,
  getThemeTextSettingsList,
  getThemeButtonSettingsList,
} from "./addons/themeTextSettings";
import { ensureAddonLayouts } from "./addons/addonGridUtils";
import { toast } from "sonner";
import { nanoid } from "nanoid";
import type { EditorSelection } from "./components/EditorCanvas";

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
  const [editorSelection, setEditorSelection] = useState<EditorSelection | null>(null);
  const [expandedBlocks, setExpandedBlocks] = useState<Record<string, boolean>>({});

  /** Layout being edited (canvas width + layoutByBreakpoint key) — independent of browser width. */
  const [editorBreakpoint, setEditorBreakpoint] = useState<BreakpointName>(() =>
    typeof window !== "undefined" ? getBreakpointFromWidth(window.innerWidth) : "2xl"
  );

  const activeBreakpointName: BreakpointName = editorBreakpoint;

  const breakpoints: { name: BreakpointName; width: number }[] = [
    { name: "sm", width: TAILWIND_MIN_WIDTH_PX.sm },
    { name: "md", width: TAILWIND_MIN_WIDTH_PX.md },
    { name: "lg", width: TAILWIND_MIN_WIDTH_PX.lg },
    { name: "xl", width: TAILWIND_MIN_WIDTH_PX.xl },
    { name: "2xl", width: TAILWIND_MIN_WIDTH_PX["2xl"] },
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
    setExpandedBlocks((prev) => {
      const next: Record<string, boolean> = {};
      for (const block of contentBlocks) {
        next[block.id] = prev[block.id] ?? true;
      }
      return next;
    });
  }, [contentBlocks]);

  useEffect(() => {
    if (!editorSelection) return;
    if (editorSelection.type === "block") {
      if (!contentBlocks.some((b) => b.id === editorSelection.id)) {
        setEditorSelection(null);
      }
      return;
    }
    const block = contentBlocks.find((b) => b.id === editorSelection.blockId);
    if (!block?.addons?.some((a) => a.id === editorSelection.addonId)) {
      setEditorSelection(null);
    }
  }, [contentBlocks, editorSelection]);

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

          <div className="flex items-center gap-3 flex-wrap justify-end">
            <div
              className="flex items-center gap-1 px-2 py-1.5 bg-background/50 rounded-lg border border-[var(--glass-border)]"
              role="tablist"
              aria-label="Editor breakpoint"
            >
              {breakpoints.map((bp) => {
                const isEditing = editorBreakpoint === bp.name;
                return (
                  <Button
                    key={bp.name}
                    type="button"
                    variant={isEditing ? "default" : "ghost"}
                    size="sm"
                    className={`h-7 px-2 text-xs font-mono ${
                      isEditing
                        ? "bg-[var(--accent-primary)] text-[var(--accent-button-text)]"
                        : "text-muted-foreground"
                    }`}
                    onClick={() => setEditorBreakpoint(bp.name)}
                    title={`Edit ${bp.name} (${bp.width}px wide canvas)`}
                  >
                    {bp.name}
                  </Button>
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
        <EditorToolbar
          onSave={handleSave}
          onPreview={handlePreview}
          isSaving={editorState.isSaving}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onAddContent={viewMode === 'edit' ? handleAddContent : undefined}
        />
      </div>

      {/* Content Tree + Editor Canvas */}
      <div className="flex-1 min-h-0 overflow-hidden flex w-full">
        {viewMode === "edit" && (
          <aside className="w-72 shrink-0 border-r border-[var(--glass-border)] bg-[var(--glass-bg)]/70 backdrop-blur-sm overflow-auto">
            <div className="p-3 border-b border-[var(--glass-border)] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[var(--accent-text)]" />
              <span className="text-sm font-medium text-foreground">Content Tree</span>
            </div>
            <div className="p-2 space-y-1">
              {contentBlocks.map((block) => {
                const isBlockSelected =
                  editorSelection?.type === "block" && editorSelection.id === block.id;
                const isAddonSelectedInBlock =
                  editorSelection?.type === "addon" && editorSelection.blockId === block.id;
                const isExpanded = expandedBlocks[block.id] ?? true;
                const titleText = block.content?.trim()
                  ? block.content.replace(/\s+/g, " ").slice(0, 28)
                  : "Content element";
                return (
                  <div key={block.id}>
                    <button
                      type="button"
                      className={`w-full flex items-center gap-2 text-left px-2 py-1.5 rounded text-xs transition-colors ${
                        isBlockSelected || isAddonSelectedInBlock
                          ? "bg-[var(--accent-bg)] text-[var(--accent-text)]"
                          : "text-muted-foreground hover:bg-[var(--accent-bg)] hover:text-[var(--accent-text)]"
                      }`}
                      onClick={() => {
                        setEditorSelection({ type: "block", id: block.id });
                        setExpandedBlocks((prev) => ({ ...prev, [block.id]: !isExpanded }));
                      }}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 md:w-4 md:h-4 shrink-0" />
                      ) : (
                        <ChevronRight className="w-5 h-5 md:w-4 md:h-4 shrink-0" />
                      )}
                      <span className="truncate">{titleText}</span>
                    </button>
                    {isExpanded && (
                      <div className="ml-7 mr-1 mb-1.5 mt-1 space-y-1">
                        {(block.addons || []).map((addon) => {
                          const isAddonSelected =
                            editorSelection?.type === "addon" &&
                            editorSelection.blockId === block.id &&
                            editorSelection.addonId === addon.id;
                          return (
                            <button
                              key={addon.id}
                              type="button"
                              className={`w-full flex items-center gap-2 text-left px-2 py-1.5 rounded text-xs transition-colors ${
                                isAddonSelected
                                  ? "bg-[var(--accent-bg)] text-[var(--accent-text)]"
                                  : "text-muted-foreground hover:bg-[var(--accent-bg)] hover:text-[var(--accent-text)]"
                              }`}
                              onClick={() =>
                                setEditorSelection({
                                  type: "addon",
                                  blockId: block.id,
                                  addonId: addon.id,
                                })
                              }
                            >
                              <span className="truncate">
                                {addon.type} addon
                              </span>
                            </button>
                          );
                        })}
                        {!block.addons?.length && (
                          <div className="w-full flex items-center gap-2 text-left px-2 py-1.5 rounded text-xs text-muted-foreground/80">
                            <span className="truncate">No addons</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>
        )}

        <div className="flex-1 min-h-0 overflow-hidden flex flex-col w-full">
          <EditorCanvas
            content={editorState.content}
            viewMode={viewMode}
            contentBlocks={contentBlocks}
            activeBreakpointName={activeBreakpointName}
            selection={editorSelection}
            onSelectionChange={setEditorSelection}
            canvasPreviewWidthPx={TAILWIND_MIN_WIDTH_PX[editorBreakpoint]}
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
    </div>
  );
};
