import { useState, useEffect, useCallback, useRef } from "react";
import { ArrowLeft, ChevronDown, ChevronRight, Layers, LayoutTemplate, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  EditorContent,
  EditorState,
  ViewMode,
  ContentBlock,
  ContentContainerSettings,
  BreakpointName,
  TAILWIND_MIN_WIDTH_PX,
  getBreakpointFromWidth,
} from "./types";
import { EditorToolbar, EditorCanvas, ContentContainerSettingsDialog } from "./components";
import { toast } from "sonner";
import { nanoid } from "nanoid";
import type { EditorSelection } from "./components/EditorCanvas";

function readStoredCanvasHeight(): number {
  if (typeof window === "undefined") return 960;
  try {
    const raw = localStorage.getItem("webpageEditorCanvasMinHeight");
    const n = raw ? parseInt(raw, 10) : NaN;
    if (Number.isFinite(n)) {
      return Math.min(6000, Math.max(1, n));
    }
  } catch {
    /* ignore */
  }
  return Math.round(Math.min(window.innerHeight * 0.85, 2000));
}
import type { ThemeButtonSetting, ThemeTextSetting } from "@/services/companyWebThemes";
import type { CompanyWebPage } from "@/services/companyWebPages";

export interface VisualWebEditorSnapshot {
  contentBlocks: ContentBlock[];
  editorContent: EditorContent;
  contentContainer?: ContentContainerSettings;
}

export interface VisualWebEditorProps {
  fullWidth?: boolean;
  title: string;
  subtitle?: string;
  companyId?: string;
  themeTextSettings: ThemeTextSetting[];
  themeButtonSettings: ThemeButtonSetting[];
  companyWebPages: CompanyWebPage[];
  /** Hydrate editor when entity loads or changes */
  resetKey: string;
  loadedSnapshot: VisualWebEditorSnapshot | null;
  isEntityReady: boolean;
  saveSuccessMessage?: string;
  /** When true, do not toast on save (e.g. Redux epic already toasts). */
  suppressSuccessToast?: boolean;
  onSave: (snapshot: VisualWebEditorSnapshot) => void | Promise<void>;
  onPreview?: () => void;
  onBack: () => void;
}

export const VisualWebEditor = ({
  fullWidth = false,
  title,
  subtitle,
  companyId,
  themeTextSettings,
  themeButtonSettings,
  companyWebPages,
  resetKey,
  loadedSnapshot,
  isEntityReady,
  saveSuccessMessage = "Saved successfully!",
  suppressSuccessToast = false,
  onSave,
  onPreview,
  onBack,
}: VisualWebEditorProps) => {
  const [editorState, setEditorState] = useState<EditorState>({
    content: { html: "", css: "", js: "" },
    isDirty: false,
    isSaving: false,
  });

  const [viewMode, setViewMode] = useState<ViewMode>("visual");
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  const [editorSelection, setEditorSelection] = useState<EditorSelection | null>(null);
  const [expandedBlocks, setExpandedBlocks] = useState<Record<string, boolean>>({});
  const [contentContainer, setContentContainer] = useState<ContentContainerSettings>(() => ({
    minHeightPx: readStoredCanvasHeight(),
  }));
  const [contentContainerDialogOpen, setContentContainerDialogOpen] = useState(false);
  /** Content tree: expand/collapse content elements under the container parent */
  const [contentContainerTreeExpanded, setContentContainerTreeExpanded] = useState(true);

  const [editorBreakpoint, setEditorBreakpoint] = useState<BreakpointName>(() =>
    typeof window !== "undefined" ? getBreakpointFromWidth(window.innerWidth) : "2xl"
  );

  const activeBreakpointName: BreakpointName = editorBreakpoint;

  const contentBlocksRef = useRef(contentBlocks);
  const editorStateRef = useRef(editorState);
  const contentContainerRef = useRef(contentContainer);
  const hydratedEntityKeyRef = useRef<string | null>(null);
  contentBlocksRef.current = contentBlocks;
  editorStateRef.current = editorState;
  contentContainerRef.current = contentContainer;

  const canvasMinHeightPx = contentContainer.minHeightPx ?? readStoredCanvasHeight();

  const persistCanvasHeightToStorage = (px: number) => {
    try {
      localStorage.setItem("webpageEditorCanvasMinHeight", String(px));
    } catch {
      /* ignore */
    }
  };

  const setCanvasMinHeightPx = (h: number) => {
    const clamped = Math.min(6000, Math.max(1, Math.round(h)));
    setContentContainer((prev) => ({ ...prev, minHeightPx: clamped }));
    persistCanvasHeightToStorage(clamped);
    setEditorState((prev) => ({ ...prev, isDirty: true }));
  };

  const breakpoints: { name: BreakpointName; width: number }[] = [
    { name: "sm", width: TAILWIND_MIN_WIDTH_PX.sm },
    { name: "md", width: TAILWIND_MIN_WIDTH_PX.md },
    { name: "lg", width: TAILWIND_MIN_WIDTH_PX.lg },
    { name: "xl", width: TAILWIND_MIN_WIDTH_PX.xl },
    { name: "2xl", width: TAILWIND_MIN_WIDTH_PX["2xl"] },
  ];

  useEffect(() => {
    if (!loadedSnapshot || !isEntityReady) return;
    if (hydratedEntityKeyRef.current === resetKey) return;
    setContentBlocks(loadedSnapshot.contentBlocks);
    setEditorState({
      content: loadedSnapshot.editorContent,
      isDirty: false,
      isSaving: false,
    });
    const cc = loadedSnapshot.contentContainer;
    setContentContainer((prev) => ({
      minHeightPx: cc?.minHeightPx ?? prev.minHeightPx ?? readStoredCanvasHeight(),
      ...(cc?.backgroundColor ? { backgroundColor: cc.backgroundColor } : {}),
    }));
    if (cc?.minHeightPx) {
      persistCanvasHeightToStorage(cc.minHeightPx);
    }
    hydratedEntityKeyRef.current = resetKey;
  }, [resetKey, loadedSnapshot, isEntityReady]);

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

  const handleAddContent = () => {
    const defaultColSpan = 4;
    const defaultRowSpan = 2;
    const newBlock: ContentBlock = {
      id: nanoid(10),
      content: "",
      type: "text",
      gridRowStart: 1 + contentBlocks.length * defaultRowSpan,
      gridColumnStart: 1,
      rowSpan: defaultRowSpan,
      colSpan: defaultColSpan,
    };
    setContentBlocks([...contentBlocks, newBlock]);
    setEditorState((prev) => ({ ...prev, isDirty: true }));
  };

  const buildSnapshot = useCallback(
    (blocks: ContentBlock[], content: EditorContent, cc: ContentContainerSettings): VisualWebEditorSnapshot => {
      const minHeightPx = cc.minHeightPx ?? readStoredCanvasHeight();
      return {
        contentBlocks: blocks.map(({ width: _w, ...block }) => ({
          ...block,
          colSpan: block.colSpan || 4,
        })),
        editorContent: {
          html: content.html,
          css: content.css,
          js: content.js || "",
        },
        contentContainer: {
          minHeightPx,
          ...(cc.backgroundColor ? { backgroundColor: cc.backgroundColor } : {}),
        },
      };
    },
    []
  );

  const persistBlocksToDatabase = (blocksToPersist: ContentBlock[]) => {
    const blocks = blocksToPersist.length ? blocksToPersist : contentBlocksRef.current;
    const snapshot = buildSnapshot(
      blocks,
      editorStateRef.current.content,
      contentContainerRef.current
    );
    setEditorState((prev) => ({ ...prev, isSaving: true }));
    void Promise.resolve(onSave(snapshot)).then(
      () => {
        setEditorState((p) => ({ ...p, isDirty: false, isSaving: false }));
        if (!suppressSuccessToast) {
          toast.success(saveSuccessMessage);
        }
      },
      () => {
        toast.error("Failed to save");
        setEditorState((p) => ({ ...p, isSaving: false }));
      }
    );
  };

  const handleUpdateBlock = (
    updatedBlock: ContentBlock,
    shouldPersist: boolean = false,
    markDirty: boolean = true
  ) => {
    const gridUpdate = {
      gridRowStart: updatedBlock.gridRowStart ?? 1,
      gridColumnStart: updatedBlock.gridColumnStart ?? 1,
      rowSpan: updatedBlock.rowSpan ?? 2,
      colSpan: Math.max(1, Math.min(12, updatedBlock.colSpan ?? 4)),
    };

    const nextBlocks = contentBlocksRef.current.map((block) => {
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
        ...(activeBreakpointName === "2xl" ? gridUpdate : {}),
        settings: "settings" in updatedBlock ? updatedBlock.settings : block.settings,
        ...("zIndex" in updatedBlock ? { zIndex: updatedBlock.zIndex } : {}),
      };
    });
    setContentBlocks(nextBlocks);

    if (shouldPersist) {
      persistBlocksToDatabase(nextBlocks);
    } else if (markDirty) {
      setEditorState((prev) => ({ ...prev, isDirty: true }));
    }
  };

  const handleDeleteBlock = (id: string) => {
    setContentBlocks(contentBlocks.filter((block) => block.id !== id));
    setEditorState((prev) => ({ ...prev, isDirty: true }));
  };

  const handleSave = () => {
    const snapshot = buildSnapshot(
      contentBlocksRef.current,
      editorStateRef.current.content,
      contentContainerRef.current
    );
    setEditorState((prev) => ({ ...prev, isSaving: true }));
    void Promise.resolve(onSave(snapshot)).then(
      () => {
        setEditorState((p) => ({
          ...p,
          isDirty: false,
          isSaving: false,
        }));
        if (!suppressSuccessToast) {
          toast.success(saveSuccessMessage);
        }
      },
      () => {
        toast.error("Failed to save");
        setEditorState((p) => ({ ...p, isSaving: false }));
      }
    );
  };

  const handleBack = () => {
    if (editorState.isDirty) {
      if (window.confirm("You have unsaved changes. Are you sure you want to leave?")) {
        if (fullWidth) {
          window.close();
        } else {
          onBack();
        }
      }
    } else {
      if (fullWidth) {
        window.close();
      } else {
        onBack();
      }
    }
  };

  if (!isEntityReady) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading…</p>
      </div>
    );
  }

  return (
    <div className={`${fullWidth ? "w-full" : ""} h-screen flex flex-col bg-background overflow-hidden`}>
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
              <h1 className="text-lg font-bold text-foreground">{title}</h1>
              {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
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
            <Button variant="ghost" size="sm" onClick={handleBack} className="hover:bg-[var(--accent-bg)]">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Close
            </Button>
          )}
        </div>
        <EditorToolbar
          onSave={handleSave}
          onPreview={onPreview}
          isSaving={editorState.isSaving}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          onAddContent={viewMode === "edit" ? handleAddContent : undefined}
        />
      </div>

      <div className="flex-1 min-h-0 overflow-hidden flex w-full">
        {viewMode === "edit" && (
          <aside className="w-72 shrink-0 border-r border-[var(--glass-border)] bg-[var(--glass-bg)]/70 backdrop-blur-sm overflow-auto">
            <div className="p-3 border-b border-[var(--glass-border)] flex items-center gap-2">
              <Layers className="w-4 h-4 text-[var(--accent-text)]" />
              <span className="text-sm font-medium text-foreground">Content Tree</span>
            </div>
            <div className="p-2">
              <div className="rounded-md border border-[var(--glass-border)] bg-background/30 overflow-hidden">
                <div className="flex items-stretch gap-1 px-1 py-1.5">
                  <button
                    type="button"
                    className="shrink-0 px-1 flex items-center text-muted-foreground hover:text-foreground"
                    aria-expanded={contentContainerTreeExpanded}
                    aria-label={contentContainerTreeExpanded ? "Collapse content elements" : "Expand content elements"}
                    onClick={(e) => {
                      e.stopPropagation();
                      setContentContainerTreeExpanded((v) => !v);
                    }}
                  >
                    {contentContainerTreeExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  <div className="flex min-w-0 flex-1 items-center gap-2">
                    <LayoutTemplate className="w-4 h-4 shrink-0 text-[var(--accent-text)]" aria-hidden />
                    <div className="min-w-0 flex flex-col gap-0.5">
                      <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
                        Content container
                      </span>
                      <span className="text-xs font-medium text-foreground truncate">Page / header surface</span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-8 shrink-0 gap-1 px-2 text-xs"
                    title="Edit content container (height, background)"
                    onClick={(e) => {
                      e.stopPropagation();
                      setContentContainerDialogOpen(true);
                    }}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    Edit
                  </Button>
                </div>
                {contentContainerTreeExpanded && (
                  <div className="border-t border-[var(--glass-border)]/70 px-1 pb-2 pt-1 space-y-1">
                    {contentBlocks.length === 0 ? (
                      <div className="px-2 py-2 text-[11px] text-muted-foreground">
                        No content elements yet — use &quot;Add content element&quot; in the toolbar.
                      </div>
                    ) : (
                      contentBlocks.map((block) => {
                        const isBlockSelected =
                          editorSelection?.type === "block" && editorSelection.id === block.id;
                        const isAddonSelectedInBlock =
                          editorSelection?.type === "addon" && editorSelection.blockId === block.id;
                        const isExpanded = expandedBlocks[block.id] ?? true;
                        const titleText = block.content?.trim()
                          ? block.content.replace(/\s+/g, " ").slice(0, 28)
                          : "Content element";
                        return (
                          <div key={block.id} className="rounded-md border border-[var(--glass-border)]/60 bg-background/20">
                            <button
                              type="button"
                              className={`w-full flex items-center gap-2 text-left px-2 py-1.5 rounded-t-md text-xs transition-colors ${
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
                                <ChevronDown className="w-4 h-4 shrink-0" />
                              ) : (
                                <ChevronRight className="w-4 h-4 shrink-0" />
                              )}
                              <span className="min-w-0 flex flex-col gap-0.5 text-left">
                                <span className="text-[10px] uppercase tracking-wide opacity-80">
                                  Content element
                                </span>
                                <span className="truncate font-medium">{titleText}</span>
                              </span>
                            </button>
                            {isExpanded && (
                              <div className="ml-6 mr-1 mb-1.5 mt-0 space-y-0.5 border-t border-[var(--glass-border)]/40 pt-1">
                                {(block.addons || []).map((addon) => {
                                  const isAddonSelected =
                                    editorSelection?.type === "addon" &&
                                    editorSelection.blockId === block.id &&
                                    editorSelection.addonId === addon.id;
                                  return (
                                    <button
                                      key={addon.id}
                                      type="button"
                                      className={`w-full flex items-center gap-2 text-left px-2 py-1 rounded text-xs transition-colors ${
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
                                      <span className="truncate capitalize">{addon.type} addon</span>
                                    </button>
                                  );
                                })}
                                {!block.addons?.length && (
                                  <div className="w-full px-2 py-1.5 text-[11px] text-muted-foreground/80">
                                    No addons
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
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
            canvasMinHeightPx={canvasMinHeightPx}
            onCanvasMinHeightPxChange={setCanvasMinHeightPx}
            contentContainer={contentContainer}
            onEditContentContainer={
              viewMode === "edit" ? () => setContentContainerDialogOpen(true) : undefined
            }
            companyId={companyId}
            themeTextSettings={themeTextSettings}
            themeButtonSettings={themeButtonSettings}
            companyWebPages={companyWebPages}
            addonRenderContext="editor"
            onUpdateBlock={handleUpdateBlock}
            onDeleteBlock={handleDeleteBlock}
          />
        </div>
      </div>

      <ContentContainerSettingsDialog
        open={contentContainerDialogOpen}
        onOpenChange={setContentContainerDialogOpen}
        settings={contentContainer}
        fallbackMinHeightPx={canvasMinHeightPx}
        onSave={(next) => {
          setContentContainer((prev) => ({ ...prev, ...next }));
          if (next.minHeightPx != null) {
            persistCanvasHeightToStorage(next.minHeightPx);
          }
          setEditorState((prev) => ({ ...prev, isDirty: true }));
        }}
      />
    </div>
  );
};
