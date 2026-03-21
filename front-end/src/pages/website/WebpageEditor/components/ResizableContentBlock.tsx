import { useState, useRef, useEffect } from "react";
import { ContentAddon, ContentBlock } from "../types";
import { X, Pencil, Plus, GripVertical } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { ContentBlockSettingsDialog } from "./ContentBlockSettingsDialog";
import { AddAddonDialog, getAddonModuleByType } from "../addons";
import type { ThemeTextSetting } from "../../../../services/companyWebThemes";

// Shared drag lock between all content blocks on the page.
// If a second block starts dragging, this prevents the first block's
// (still-attached) mousemove handlers from updating the grid.
let activeDragBlockId: string | null = null;

interface ResizableContentBlockProps {
  block: ContentBlock;
  onUpdate: (block: ContentBlock, shouldPersist?: boolean, markDirty?: boolean) => void;
  onDelete?: (id: string) => void;
  gridColumnWidth: number;
  gridRowHeight: number;
  companyId?: string;
  themeTextSettings?: ThemeTextSetting[];
}

type ResizeHandle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw' | null;

export const ResizableContentBlock = ({
  block,
  onUpdate,
  onDelete,
  gridColumnWidth,
  gridRowHeight,
  companyId,
  themeTextSettings,
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
  const [hoveredAddonId, setHoveredAddonId] = useState<string | null>(null);
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

  const handleAddAddon = (addon: ContentAddon) => {
    onUpdate({
      ...block,
      addons: [...addons, addon],
    }, true);
    setEditingAddonId(addon.id);
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
        const rowChange = -deltaRows;
        if (startGrid.rowSpan + rowChange >= 1 && startGrid.gridRowStart + rowChange >= 1) {
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
        className={`relative border-2 border-blue-500 shadow-lg group transition-opacity w-full ${
          isDragging ? 'opacity-80 shadow-2xl' : ''
        } ${!bgColor ? 'bg-white' : ''}`}
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
          className="edit-button delete-button move-button absolute top-2 right-2 z-40 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-md border border-[var(--glass-border)] bg-[var(--glass-bg)]/90 backdrop-blur-sm text-[var(--accent-text)] hover:bg-[var(--accent-bg)] hover:border-[var(--accent-primary)]/40 hover:text-[var(--accent-text)]"
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
            className="h-8 w-8 rounded-md border border-[var(--glass-border)] bg-[var(--glass-bg)]/90 backdrop-blur-sm text-muted-foreground hover:bg-[var(--accent-bg)] hover:border-[var(--accent-primary)]/40 hover:text-[var(--accent-text)] move-button cursor-grab active:cursor-grabbing"
            onMouseDown={startDrag}
            aria-label="Move content element"
          >
            <GripVertical className="w-4 h-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-md border border-[var(--glass-border)] bg-[var(--glass-bg)]/90 backdrop-blur-sm text-[var(--accent-text)] hover:bg-[var(--accent-bg)] hover:border-[var(--accent-primary)]/40 hover:text-[var(--accent-text)]"
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
              className="h-8 w-8 rounded-md border border-[var(--glass-border)] bg-[var(--glass-bg)]/90 backdrop-blur-sm text-muted-foreground hover:bg-destructive hover:text-white hover:border-destructive/50"
              onClick={handleDelete}
              aria-label="Delete content block"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

      <div
        className={`w-full h-full overflow-auto ${!bgColor ? 'bg-white' : ''}`}
        style={{
          cursor: 'default',
          ...(bgColor ? { backgroundColor: bgColor } : {}),
        }}
      >
        <div className="h-full flex flex-col min-h-0">
          {block.content && block.content !== 'New Content Block' ? (
            <div className="p-4">{block.content}</div>
          ) : null}

          <div className="flex-1 min-h-0 overflow-hidden">
            {addons.length ? (
              addons.length === 1 ? (
                (() => {
                  const addon = addons[0];
                  const module = getAddonModuleByType(addon.type);
                  if (!module) return null;
                  const RenderComponent = module.RenderComponent;
                  return (
                    <div
                      className="relative w-full h-full min-h-0 overflow-hidden"
                      onMouseEnter={() => setHoveredAddonId(addon.id)}
                      onMouseLeave={() => setHoveredAddonId((prev) => (prev === addon.id ? null : prev))}
                    >
                      <div
                        className={`absolute top-2 left-2 z-[60] flex items-center gap-1.5 transition-opacity pointer-events-auto ${
                          hoveredAddonId === addon.id ? "opacity-100" : "opacity-0"
                        }`}
                        onMouseDown={(e) => e.stopPropagation()}
                      >
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-md border border-[var(--glass-border)] bg-[var(--glass-bg)]/90 backdrop-blur-sm text-[var(--accent-text)] hover:bg-[var(--accent-bg)] hover:border-[var(--accent-primary)]/40 hover:text-[var(--accent-text)]"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setEditingAddonId(addon.id);
                          }}
                          aria-label="Edit addon"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-md border border-[var(--glass-border)] bg-[var(--glass-bg)]/90 backdrop-blur-sm text-muted-foreground hover:bg-destructive hover:text-white hover:border-destructive/50"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDeleteAddon(addon.id);
                          }}
                          aria-label="Delete addon"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      <RenderComponent
                        addon={addon}
                        companyId={companyId}
                        themeTextSettings={themeTextSettings}
                      />
                    </div>
                  );
                })()
              ) : (
                <div className="h-full overflow-auto">
                  {addons.map((addon) => {
                    const module = getAddonModuleByType(addon.type);
                    if (!module) return null;
                    const RenderComponent = module.RenderComponent;

                    return (
                      <div
                        key={addon.id}
                        className="relative w-full"
                        onMouseEnter={() => setHoveredAddonId(addon.id)}
                        onMouseLeave={() => setHoveredAddonId((prev) => (prev === addon.id ? null : prev))}
                      >
                        <div
                          className={`absolute top-2 left-2 z-[60] flex items-center gap-1.5 transition-opacity pointer-events-auto ${
                            hoveredAddonId === addon.id ? "opacity-100" : "opacity-0"
                          }`}
                          onMouseDown={(e) => e.stopPropagation()}
                        >
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-md border border-[var(--glass-border)] bg-[var(--glass-bg)]/90 backdrop-blur-sm text-[var(--accent-text)] hover:bg-[var(--accent-bg)] hover:border-[var(--accent-primary)]/40 hover:text-[var(--accent-text)]"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setEditingAddonId(addon.id);
                            }}
                            aria-label="Edit addon"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-md border border-[var(--glass-border)] bg-[var(--glass-bg)]/90 backdrop-blur-sm text-muted-foreground hover:bg-destructive hover:text-white hover:border-destructive/50"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleDeleteAddon(addon.id);
                            }}
                            aria-label="Delete addon"
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>

                        <RenderComponent
                          addon={addon}
                          companyId={companyId}
                          themeTextSettings={themeTextSettings}
                        />
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              <div className="h-full min-h-[80px] flex items-center justify-center text-xs text-muted-foreground">
                No addons yet. Hover to add an addon.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resize handles */}
      <div className="resize-handle absolute top-0 left-0 right-0 h-4 cursor-ns-resize hover:bg-blue-400/50 transition-colors z-30" style={{ cursor: 'ns-resize' }} onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'n'); }} />
      <div className="resize-handle absolute bottom-0 left-0 right-0 h-4 cursor-ns-resize hover:bg-blue-400/50 transition-colors z-30" style={{ cursor: 'ns-resize' }} onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 's'); }} />
      <div className="resize-handle absolute top-0 left-0 bottom-0 w-4 cursor-ew-resize hover:bg-blue-400/50 transition-colors z-30" style={{ cursor: 'ew-resize' }} onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'w'); }} />
      <div className="resize-handle absolute top-0 right-0 bottom-0 w-4 cursor-ew-resize hover:bg-blue-400/50 transition-colors z-30" style={{ cursor: 'ew-resize' }} onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'e'); }} />
      <div className="resize-handle absolute top-0 left-0 w-5 h-5 cursor-nwse-resize hover:bg-blue-500/70 transition-colors z-30 rounded-br" style={{ cursor: 'nwse-resize' }} onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'nw'); }} />
      <div className="resize-handle absolute top-0 right-0 w-5 h-5 cursor-nesw-resize hover:bg-blue-500/70 transition-colors z-30 rounded-bl" style={{ cursor: 'nesw-resize' }} onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'ne'); }} />
      <div className="resize-handle absolute bottom-0 left-0 w-5 h-5 cursor-nesw-resize hover:bg-blue-500/70 transition-colors z-30 rounded-tr" style={{ cursor: 'nesw-resize' }} onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'sw'); }} />
      <div className="resize-handle absolute bottom-0 right-0 w-5 h-5 cursor-nwse-resize hover:bg-blue-500/70 transition-colors z-30 rounded-tl" style={{ cursor: 'nwse-resize' }} onMouseDown={(e) => { e.stopPropagation(); handleMouseDown(e, 'se'); }} />
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
        />
      )}
    </>
  );
};
