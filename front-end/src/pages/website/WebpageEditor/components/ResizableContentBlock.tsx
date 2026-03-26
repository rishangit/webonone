import { useState, useRef, useEffect } from "react";
import { ContentAddon, ContentBlock } from "../types";
import { X, Pencil, Plus, Move, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { ContentBlockSettingsDialog } from "./ContentBlockSettingsDialog";
import { AddAddonDialog, getAddonModuleByType } from "../addons";
import { clampStackZIndex, defaultLayoutForNewAddon, nextAddonStackZIndex } from "../addons/addonGridUtils";
import type { ThemeButtonSetting, ThemeTextSetting } from "../../../../services/companyWebThemes";
import type { CompanyWebPage } from "../../../../services/companyWebPages";
import type { AddonRenderContext } from "../addons/types";
import { AddonGridEditor } from "./AddonGridEditor";

// Shared drag lock between all content blocks on the page.
// If a second block starts dragging, this prevents the first block's
// (still-attached) mousemove handlers from updating the grid.
let activeDragBlockId: string | null = null;

interface ResizableContentBlockProps {
  block: ContentBlock;
  /** True when this content block is the sole selected item (not when an addon is selected). */
  isSelected?: boolean;
  /** Set when selection is an addon in this block; only that addon gets drag/resize/edit chrome. */
  selectedAddonId?: string | null;
  onSelectBlock?: () => void;
  onSelectAddon?: (addonId: string) => void;
  onUpdate: (block: ContentBlock, shouldPersist?: boolean, markDirty?: boolean) => void;
  onDelete?: (id: string) => void;
  gridColumnWidth: number;
  gridRowHeight: number;
  companyId?: string;
  themeTextSettings?: ThemeTextSetting[];
  themeButtonSettings?: ThemeButtonSetting[];
  companyWebPages?: CompanyWebPage[];
  addonRenderContext?: AddonRenderContext;
}

type ResizeHandle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw' | null;

export const ResizableContentBlock = ({
  block,
  isSelected = false,
  selectedAddonId = null,
  onSelectBlock,
  onSelectAddon,
  onUpdate,
  onDelete,
  gridColumnWidth,
  gridRowHeight,
  companyId,
  themeTextSettings,
  themeButtonSettings,
  companyWebPages,
  addonRenderContext,
}: ResizableContentBlockProps) => {
  const [isResizing, setIsResizing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandle>(null);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [startGrid, setStartGrid] = useState({
    gridRowStart: 1,
    gridColumnStart: 1,
    rowSpan: 2,
    colSpan: 4,
  });
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [dragStartGrid, setDragStartGrid] = useState({ gridRowStart: 1, gridColumnStart: 1 });
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [addAddonDialogOpen, setAddAddonDialogOpen] = useState(false);
  const [editingAddonId, setEditingAddonId] = useState<string | null>(null);
  const blockRef = useRef<HTMLDivElement>(null);
  const onUpdateRef = useRef(onUpdate);
  const blockSnapshotRef = useRef(block);
  const dragRafRef = useRef<number | null>(null);
  const dragLastAppliedGridRef = useRef<{ gridRowStart: number; gridColumnStart: number } | null>(null);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    blockSnapshotRef.current = block;
  }, [block]);

  const gridRowStart = block.gridRowStart ?? 1;
  const gridColumnStart = block.gridColumnStart ?? 1;
  const rowSpan = block.rowSpan ?? 2;
  const colSpan = Math.max(1, Math.min(12, block.colSpan ?? 4));
  const blockHeight = rowSpan * gridRowHeight;
  const bgColor = block.settings?.backgroundColor;
  const addons = block.addons || [];
  const editingAddon = editingAddonId ? addons.find((addon) => addon.id === editingAddonId) : null;
  const editingAddonModule = editingAddon ? getAddonModuleByType(editingAddon.type) : undefined;

  const startDrag = (e: React.MouseEvent) => {
    if (!isSelected) return;
    e.preventDefault();
    e.stopPropagation();
    if (isDragging) return;

    activeDragBlockId = block.id;
    const targetId = block.id;

    const startPos = { x: e.clientX, y: e.clientY };
    const startGrid = {
      gridRowStart: block.gridRowStart ?? 1,
      gridColumnStart: block.gridColumnStart ?? 1,
    };
    const colSpanAtStart = Math.max(1, Math.min(12, block.colSpan ?? 4));

    setIsDragging(true);
    setDragStartPos(startPos);
    setDragStartGrid(startGrid);
    dragLastAppliedGridRef.current = { ...startGrid };

    let latestMouse: { x: number; y: number } | null = null;

    const applyDrag = () => {
      if (activeDragBlockId !== targetId) return;
      if (!latestMouse) return;
      const deltaX = latestMouse.x - startPos.x;
      const deltaY = latestMouse.y - startPos.y;
      const deltaCols = Math.round(deltaX / gridColumnWidth);
      const deltaRows = Math.round(deltaY / gridRowHeight);

      let newColStart = Math.max(1, Math.min(13 - colSpanAtStart, startGrid.gridColumnStart + deltaCols));
      let newRowStart = Math.max(1, startGrid.gridRowStart + deltaRows);

      const last = dragLastAppliedGridRef.current;
      if (last && last.gridColumnStart === newColStart && last.gridRowStart === newRowStart) {
        return;
      }

      dragLastAppliedGridRef.current = { gridRowStart: newRowStart, gridColumnStart: newColStart };

      const currentBlock = blockSnapshotRef.current;
      if (currentBlock.id !== targetId) return;
      onUpdateRef.current({
        ...currentBlock,
        gridRowStart: newRowStart,
        gridColumnStart: newColStart,
      }, false, false);
    };

    const onMouseMove = (ev: MouseEvent) => {
      latestMouse = { x: ev.clientX, y: ev.clientY };
      if (dragRafRef.current != null) return;
      dragRafRef.current = window.requestAnimationFrame(() => {
        dragRafRef.current = null;
        applyDrag();
      });
    };

    const onMouseUp = () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      if (dragRafRef.current != null) {
        window.cancelAnimationFrame(dragRafRef.current);
        dragRafRef.current = null;
      }
      latestMouse = null;
      const last = dragLastAppliedGridRef.current;
      setIsDragging(false);

      // Mark editor as dirty once (not on every mousemove).
      if (last) {
        const currentBlock = blockSnapshotRef.current;
        onUpdateRef.current(
          {
            ...currentBlock,
            gridRowStart: last.gridRowStart,
            gridColumnStart: last.gridColumnStart,
          },
          false,
          true
        );
      }

      dragLastAppliedGridRef.current = null;
      if (activeDragBlockId === targetId) {
        activeDragBlockId = null;
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const handleMouseDown = (e: React.MouseEvent, handle: ResizeHandle) => {
    if (!isSelected) return;
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);
    setStartPos({ x: e.clientX, y: e.clientY });
    setStartGrid({
      gridRowStart: block.gridRowStart ?? 1,
      gridColumnStart: block.gridColumnStart ?? 1,
      rowSpan: block.rowSpan ?? 2,
      colSpan: Math.max(1, Math.min(12, block.colSpan ?? 4)),
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) onDelete(block.id);
  };

  const bumpBlockZIndex = (delta: number) => {
    onUpdate(
      {
        ...block,
        zIndex: clampStackZIndex((block.zIndex ?? 0) + delta),
      },
      true,
      true
    );
  };

  const handleAddAddon = (addon: ContentAddon) => {
    const layout = defaultLayoutForNewAddon(addons);
    const withLayout: ContentAddon = {
      ...addon,
      layout,
      zIndex: nextAddonStackZIndex(addons),
    };
    onUpdate(
      {
        ...block,
        addons: [...addons, withLayout],
      },
      true
    );
    setEditingAddonId(withLayout.id);
  };

  const handleUpdateAddon = (updatedAddon: ContentAddon) => {
    onUpdate({
      ...block,
      addons: addons.map((addon) => (addon.id === updatedAddon.id ? updatedAddon : addon)),
    }, true);
  };

  const handleDeleteAddon = (addonId: string) => {
    onUpdate({
      ...block,
      addons: addons.filter((addon) => addon.id !== addonId),
    }, true);
    if (editingAddonId === addonId) {
      setEditingAddonId(null);
    }
  };

  const emitGridUpdate = (updates: Partial<Pick<ContentBlock, 'gridRowStart' | 'gridColumnStart' | 'rowSpan' | 'colSpan'>>) => {
    onUpdate({
      ...block,
      gridRowStart: updates.gridRowStart ?? gridRowStart,
      gridColumnStart: updates.gridColumnStart ?? gridColumnStart,
      rowSpan: updates.rowSpan ?? rowSpan,
      colSpan: updates.colSpan ?? colSpan,
    });
  };

  // Resize: update rowSpan/colSpan and optionally gridRowStart/gridColumnStart
  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startPos.x;
      const deltaY = e.clientY - startPos.y;
      const deltaCols = Math.round(deltaX / gridColumnWidth);
      const deltaRows = Math.round(deltaY / gridRowHeight);

      let newRowStart = startGrid.gridRowStart;
      let newColStart = startGrid.gridColumnStart;
      let newRowSpan = startGrid.rowSpan;
      let newColSpan = startGrid.colSpan;

      if (resizeHandle === 'e' || resizeHandle === 'ne' || resizeHandle === 'se') {
        newColSpan = Math.max(1, Math.min(13 - startGrid.gridColumnStart, startGrid.colSpan + deltaCols));
      }
      if (resizeHandle === 'w' || resizeHandle === 'nw' || resizeHandle === 'sw') {
        const colChange = deltaCols;
        newColStart = Math.max(1, startGrid.gridColumnStart + colChange);
        newColSpan = Math.max(1, startGrid.colSpan - colChange);
        if (newColStart + newColSpan > 13) {
          newColSpan = 13 - newColStart;
        }
      }
      if (resizeHandle === 's' || resizeHandle === 'se' || resizeHandle === 'sw') {
        newRowSpan = Math.max(1, startGrid.rowSpan + deltaRows);
      }
      if (resizeHandle === 'n' || resizeHandle === 'ne' || resizeHandle === 'nw') {
        // Top-edge resize should move the top boundary with the mouse:
        // drag up -> smaller rowStart, larger rowSpan; drag down -> larger rowStart, smaller rowSpan.
        const rowChange = deltaRows;
        if (startGrid.rowSpan - rowChange >= 1 && startGrid.gridRowStart + rowChange >= 1) {
          newRowStart = startGrid.gridRowStart + rowChange;
          newRowSpan = startGrid.rowSpan - rowChange;
        }
      }

      newColSpan = Math.max(1, Math.min(12, newColSpan));
      if (newColStart + newColSpan > 13) newColStart = 13 - newColSpan;
      newColStart = Math.max(1, newColStart);

      emitGridUpdate({
        gridRowStart: newRowStart,
        gridColumnStart: newColStart,
        rowSpan: newRowSpan,
        colSpan: newColSpan,
      });
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      setResizeHandle(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, resizeHandle, startPos, startGrid, block, onUpdate, gridColumnWidth, gridRowHeight]);

  // Drag: update gridRowStart and gridColumnStart
  useEffect(() => {
    // Cleanup RAF if component unmounts mid-drag.
    return () => {
      if (dragRafRef.current != null) {
        window.cancelAnimationFrame(dragRafRef.current);
        dragRafRef.current = null;
      }
    };
  }, []);

  return (
    <>
      <div
        ref={blockRef}
        className={`relative border-2 shadow-lg group transition-opacity w-full ${
          isDragging ? 'opacity-80 shadow-2xl' : ''
        } ${!bgColor ? 'bg-white' : ''} ${
          isSelected
            ? 'border-[var(--accent-primary)]'
            : 'border-[var(--border)]'
        }`}
        onMouseDown={() => onSelectBlock?.()}
        style={{
          width: '100%',
          height: `${blockHeight}px`,
          minWidth: `${gridColumnWidth}px`,
          minHeight: `${gridRowHeight}px`,
          cursor: isDragging ? 'grabbing' : isResizing ? 'auto' : 'default',
          userSelect: isDragging || isResizing ? 'none' : 'auto',
          ...(bgColor ? { backgroundColor: bgColor } : {}),
        }}
      >
      <div
        className={`w-full h-full overflow-auto ${!bgColor ? 'bg-white' : ''}`}
        style={{
          cursor: 'default',
          /* Reserve space for vertical scrollbar so right-edge UI (addon east resize) is not covered */
          scrollbarGutter: 'stable',
          ...(bgColor ? { backgroundColor: bgColor } : {}),
        }}
      >
        <div
          className="relative h-full min-h-0 p-2 flex flex-col"
          style={
            isSelected
              ? {
                  borderWidth: 1,
                  borderStyle: 'solid',
                  borderColor: 'var(--accent-border)',
                  backgroundColor: 'color-mix(in oklab, var(--accent-primary) 10%, transparent)',
                }
              : {
                  borderWidth: 1,
                  borderStyle: 'solid',
                  borderColor: 'var(--border)',
                  backgroundColor: 'color-mix(in oklab, var(--accent-primary) 4%, transparent)',
                }
          }
        >
          {isSelected && (
          <div
            className="edit-button delete-button move-button absolute left-2 right-2 top-2 z-50 flex min-h-9 items-center justify-end gap-1.5 px-1.5 py-1"
            style={{
              borderWidth: 1,
              borderStyle: 'solid',
              borderColor: 'var(--accent-border)',
              backgroundColor: 'color-mix(in oklab, var(--accent-bg) 88%, transparent)',
            }}
            onMouseDown={(e) => {
              e.stopPropagation();
              onSelectBlock?.();
            }}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 rounded-md border border-[var(--glass-border)] bg-[var(--glass-bg)]/90 backdrop-blur-sm text-[var(--accent-text)] hover:bg-[var(--accent-bg)] hover:border-[var(--accent-primary)]/40 hover:text-[var(--accent-text)]"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setAddAddonDialogOpen(true);
              }}
              aria-label="Add addon"
            >
              <Plus className="w-4 h-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 rounded-md border border-[var(--glass-border)] bg-[var(--glass-bg)]/90 backdrop-blur-sm text-[var(--accent-text)] hover:bg-[var(--accent-bg)] hover:border-[var(--accent-primary)]/40 hover:text-[var(--accent-text)] move-button cursor-grab active:cursor-grabbing"
              onMouseDown={startDrag}
              aria-label="Move content element"
            >
              <Move className="w-4 h-4" strokeWidth={2.25} aria-hidden />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 rounded-md border border-[var(--glass-border)] bg-[var(--glass-bg)]/90 backdrop-blur-sm text-[var(--accent-text)] hover:bg-[var(--accent-bg)] hover:border-[var(--accent-primary)]/40 hover:text-[var(--accent-text)]"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                bumpBlockZIndex(1);
              }}
              aria-label="Bring content element forward (increase z-index)"
              title="Layer up"
            >
              <ChevronUp className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 rounded-md border border-[var(--glass-border)] bg-[var(--glass-bg)]/90 backdrop-blur-sm text-[var(--accent-text)] hover:bg-[var(--accent-bg)] hover:border-[var(--accent-primary)]/40 hover:text-[var(--accent-text)]"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                bumpBlockZIndex(-1);
              }}
              aria-label="Send content element backward (decrease z-index)"
              title="Layer down"
            >
              <ChevronDown className="w-4 h-4" />
            </Button>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 rounded-md border border-[var(--glass-border)] bg-[var(--glass-bg)]/90 backdrop-blur-sm text-[var(--accent-text)] hover:bg-[var(--accent-bg)] hover:border-[var(--accent-primary)]/40 hover:text-[var(--accent-text)]"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSettingsDialogOpen(true);
              }}
              aria-label="Edit content block settings"
            >
              <Pencil className="w-4 h-4" />
            </Button>
            {onDelete && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 rounded-md border border-[var(--glass-border)] bg-[var(--glass-bg)]/90 backdrop-blur-sm text-muted-foreground hover:bg-destructive hover:text-white hover:border-destructive/50"
                onClick={handleDelete}
                aria-label="Delete content block"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
          )}

          <div className={`h-full ${isSelected ? 'pt-10' : ''}`}>
          {block.content && block.content !== 'New Content Block' ? (
            <div className="p-3">{block.content}</div>
          ) : null}

          <div className="flex-1 min-h-0 h-full overflow-auto">
            <AddonGridEditor
              block={block}
              addons={addons}
              selectedAddonId={selectedAddonId}
              onSelectAddon={(id) => onSelectAddon?.(id)}
              gridColumnWidth={gridColumnWidth}
              gridRowHeight={gridRowHeight}
              companyId={companyId}
              themeTextSettings={themeTextSettings}
              themeButtonSettings={themeButtonSettings}
              companyWebPages={companyWebPages}
              addonRenderContext={addonRenderContext}
              onUpdateAddons={(next, shouldPersist, markDirty) => {
                onUpdate(
                  { ...block, addons: next },
                  shouldPersist ?? false,
                  markDirty ?? true
                );
              }}
              onEditAddon={(id) => {
                onSelectAddon?.(id);
                setEditingAddonId(id);
              }}
              onDeleteAddon={handleDeleteAddon}
            />
          </div>
          </div>
        </div>
      </div>

      {/* Resize handles */}
      {isSelected && (
        <>
          <div className="resize-handle absolute top-0 left-0 right-0 h-4 cursor-ns-resize hover:bg-blue-400/50 transition-colors z-30" style={{ cursor: 'ns-resize' }} onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'n'); }} />
          <div className="resize-handle absolute bottom-0 left-0 right-0 h-4 cursor-ns-resize hover:bg-blue-400/50 transition-colors z-30" style={{ cursor: 'ns-resize' }} onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 's'); }} />
          <div className="resize-handle absolute top-0 left-0 bottom-0 w-4 cursor-ew-resize hover:bg-blue-400/50 transition-colors z-30" style={{ cursor: 'ew-resize' }} onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'w'); }} />
          <div className="resize-handle absolute top-0 right-0 bottom-0 w-4 cursor-ew-resize hover:bg-blue-400/50 transition-colors z-30" style={{ cursor: 'ew-resize' }} onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'e'); }} />
          <div className="resize-handle absolute top-0 left-0 w-5 h-5 cursor-nwse-resize hover:bg-blue-500/70 transition-colors z-30 rounded-br" style={{ cursor: 'nwse-resize' }} onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'nw'); }} />
          <div className="resize-handle absolute top-0 right-0 w-5 h-5 cursor-nesw-resize hover:bg-blue-500/70 transition-colors z-30 rounded-bl" style={{ cursor: 'nesw-resize' }} onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'ne'); }} />
          <div className="resize-handle absolute bottom-0 left-0 w-5 h-5 cursor-nesw-resize hover:bg-blue-500/70 transition-colors z-30 rounded-tr" style={{ cursor: 'nesw-resize' }} onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'sw'); }} />
          <div className="resize-handle absolute bottom-0 right-0 w-5 h-5 cursor-nwse-resize hover:bg-blue-500/70 transition-colors z-30 rounded-tl" style={{ cursor: 'nwse-resize' }} onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'se'); }} />
        </>
      )}
    </div>

      <ContentBlockSettingsDialog
        open={settingsDialogOpen}
        onOpenChange={setSettingsDialogOpen}
        block={block}
        onSave={(updated) => onUpdate(updated)}
      />

      <AddAddonDialog
        open={addAddonDialogOpen}
        onOpenChange={setAddAddonDialogOpen}
        contentElementId={block.id}
        companyId={companyId}
        onAddonAdded={handleAddAddon}
      />

      {editingAddon && editingAddonModule && (
        <editingAddonModule.EditComponent
          open={!!editingAddonId}
          onOpenChange={(isOpen) => {
            if (!isOpen) setEditingAddonId(null);
          }}
          addon={editingAddon}
          companyId={companyId}
          contentElementId={block.id}
          onSave={handleUpdateAddon}
          themeTextSettings={themeTextSettings}
          themeButtonSettings={themeButtonSettings}
          companyWebPages={companyWebPages}
        />
      )}
    </>
  );
};
