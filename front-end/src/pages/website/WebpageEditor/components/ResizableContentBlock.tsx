import { useState, useRef, useEffect } from "react";
import { ContentBlock } from "../types";
import { X, Pencil } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { ContentBlockSettingsDialog } from "./ContentBlockSettingsDialog";

interface ResizableContentBlockProps {
  block: ContentBlock;
  onUpdate: (block: ContentBlock) => void;
  onDelete?: (id: string) => void;
  gridColumnWidth: number;
  gridRowHeight: number;
}

type ResizeHandle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw' | null;

export const ResizableContentBlock = ({
  block,
  onUpdate,
  onDelete,
  gridColumnWidth,
  gridRowHeight,
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
  const blockRef = useRef<HTMLDivElement>(null);

  const gridRowStart = block.gridRowStart ?? 1;
  const gridColumnStart = block.gridColumnStart ?? 1;
  const rowSpan = block.rowSpan ?? 2;
  const colSpan = Math.max(1, Math.min(12, block.colSpan ?? 4));
  const blockHeight = rowSpan * gridRowHeight;
  const bgColor = block.settings?.backgroundColor;

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

  const handleContentMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains('resize-handle') || target.closest('.delete-button') || target.closest('.edit-button')) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragStartPos({ x: e.clientX, y: e.clientY });
    setDragStartGrid({
      gridRowStart: block.gridRowStart ?? 1,
      gridColumnStart: block.gridColumnStart ?? 1,
    });
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) onDelete(block.id);
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
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartPos.x;
      const deltaY = e.clientY - dragStartPos.y;
      const deltaCols = Math.round(deltaX / gridColumnWidth);
      const deltaRows = Math.round(deltaY / gridRowHeight);
      const newColStart = Math.max(1, Math.min(13 - colSpan, dragStartGrid.gridColumnStart + deltaCols));
      const newRowStart = Math.max(1, dragStartGrid.gridRowStart + deltaRows);
      emitGridUpdate({ gridRowStart: newRowStart, gridColumnStart: newColStart });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragStartPos, dragStartGrid, colSpan, block, onUpdate, gridColumnWidth, gridRowHeight]);

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
          cursor: isDragging ? 'grabbing' : isResizing ? 'auto' : 'grab',
          userSelect: isDragging || isResizing ? 'none' : 'auto',
          ...(bgColor ? { backgroundColor: bgColor } : {}),
        }}
      >
        <div
          className="edit-button delete-button absolute top-2 right-2 z-40 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity"
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
        className={`w-full h-full p-4 overflow-auto ${!bgColor ? 'bg-white' : ''}`}
        style={{
          cursor: isDragging ? 'grabbing' : 'grab',
          ...(bgColor ? { backgroundColor: bgColor } : {}),
        }}
        onMouseDown={handleContentMouseDown}
      >
        {block.content || 'Content Block'}
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
    </>
  );
};
