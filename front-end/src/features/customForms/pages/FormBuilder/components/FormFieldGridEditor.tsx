/* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/no-noninteractive-element-interactions -- form builder canvas drag/resize targets */
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Move, Pencil, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { FormField, FormFieldLayout } from '@/features/customForms/types';
import {
  clampFieldLayout,
  computeFieldDisplayZIndex,
  ensureFieldLayouts,
  layoutToGridStyle,
  maxLayoutRowEnd,
} from '@/features/customForms/utils/fieldGridUtils';
import { getFieldModuleByType } from '../fields/registry';

type ResizeHandle = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

let activeFieldDragId: string | null = null;

interface FormFieldGridEditorProps {
  fields: FormField[];
  selectedFieldId: string | null;
  onSelectField: (id: string) => void;
  gridRowHeight: number;
  showGuides?: boolean;
  /** When a modal is open, keep fields below dialog layer and hide edit chrome. */
  suppressInteractionBoost?: boolean;
  onUpdateFields: (next: FormField[], markDirty?: boolean) => void;
  onEditField: (id: string) => void;
  onDeleteField: (id: string) => void;
}

export const FormFieldGridEditor = ({
  fields,
  selectedFieldId,
  onSelectField,
  gridRowHeight,
  showGuides = true,
  suppressInteractionBoost = false,
  onUpdateFields,
  onEditField,
  onDeleteField,
}: FormFieldGridEditorProps) => {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [liveLayout, setLiveLayout] = useState<{ fieldId: string; layout: FormFieldLayout } | null>(null);
  const fieldsRef = useRef(fields);
  const onUpdateRef = useRef(onUpdateFields);
  const gridRef = useRef<HTMLDivElement>(null);
  const colWidthRef = useRef(40);
  const dragRafRef = useRef<number | null>(null);
  const dragLastRef = useRef<FormFieldLayout | null>(null);
  const resizeRafRef = useRef<number | null>(null);
  const resizeLastRef = useRef<FormFieldLayout | null>(null);
  const [resizeState, setResizeState] = useState<{
    fieldId: string;
    handle: ResizeHandle;
    startPos: { x: number; y: number };
    startLayout: FormFieldLayout;
  } | null>(null);

  const measureColWidth = () => {
    const el = gridRef.current;
    if (!el) return;
    const computed = getComputedStyle(el);
    const first = computed.gridTemplateColumns.trim().split(/\s+/)[0];
    const px = Number.parseFloat(first);
    if (Number.isFinite(px) && px > 0) {
      colWidthRef.current = px;
      return;
    }
    const gap = parseFloat(computed.columnGap) || 0;
    colWidthRef.current = Math.max(1, (el.clientWidth - 11 * gap) / 12);
  };

  useLayoutEffect(() => {
    const el = gridRef.current;
    if (!el) return;
    measureColWidth();
    const ro = new ResizeObserver(measureColWidth);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    fieldsRef.current = ensureFieldLayouts(fields);
  }, [fields]);

  useEffect(() => {
    onUpdateRef.current = onUpdateFields;
  }, [onUpdateFields]);

  const normalized = useMemo(() => ensureFieldLayouts(fields), [fields]);
  const displayFields = useMemo(
    () => [...normalized].sort((a, b) => (a.zIndex ?? 0) - (b.zIndex ?? 0) || a.id.localeCompare(b.id)),
    [normalized]
  );

  const maxRow = Math.max(
    maxLayoutRowEnd(displayFields),
    liveLayout ? liveLayout.layout.gridRowStart + liveLayout.layout.rowSpan : 0
  );
  const gridMinHeight = Math.max(maxRow, 1) * gridRowHeight;

  const applyLayout = (fieldId: string, layout: FormFieldLayout) => {
    const merged = fieldsRef.current.map((f) => (f.id === fieldId ? { ...f, layout } : f));
    fieldsRef.current = merged;
    onUpdateRef.current(merged, true);
  };

  const startDrag = (fieldId: string, e: React.MouseEvent) => {
    if (selectedFieldId !== fieldId) return;
    e.preventDefault();
    e.stopPropagation();
    const field = fieldsRef.current.find((f) => f.id === fieldId);
    if (!field?.layout) return;
    activeFieldDragId = fieldId;
    const startPos = { x: e.clientX, y: e.clientY };
    const startLayout = { ...field.layout };
    dragLastRef.current = startLayout;
    setDraggingId(fieldId);
    measureColWidth();

    let latest: { x: number; y: number } | null = null;

    const apply = () => {
      if (activeFieldDragId !== fieldId || !latest) return;
      const deltaCols = Math.round((latest.x - startPos.x) / colWidthRef.current);
      const deltaRows = Math.round((latest.y - startPos.y) / gridRowHeight);
      const next = clampFieldLayout({
        ...startLayout,
        gridColumnStart: startLayout.gridColumnStart + deltaCols,
        gridRowStart: startLayout.gridRowStart + deltaRows,
      });
      if (
        dragLastRef.current?.gridColumnStart === next.gridColumnStart &&
        dragLastRef.current?.gridRowStart === next.gridRowStart
      ) {
        return;
      }
      dragLastRef.current = next;
      setLiveLayout({ fieldId, layout: next });
    };

    const onMove = (ev: MouseEvent) => {
      latest = { x: ev.clientX, y: ev.clientY };
      if (dragRafRef.current != null) return;
      dragRafRef.current = requestAnimationFrame(() => {
        dragRafRef.current = null;
        apply();
      });
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      if (dragRafRef.current) cancelAnimationFrame(dragRafRef.current);
      const final = dragLastRef.current;
      dragLastRef.current = null;
      activeFieldDragId = null;
      setDraggingId(null);
      if (final) applyLayout(fieldId, final);
      setLiveLayout(null);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const startResize = (fieldId: string, handle: ResizeHandle, e: React.MouseEvent) => {
    if (selectedFieldId !== fieldId) return;
    e.preventDefault();
    e.stopPropagation();
    const field = fieldsRef.current.find((f) => f.id === fieldId);
    if (!field?.layout) return;
    measureColWidth();
    resizeLastRef.current = { ...field.layout };
    setResizeState({ fieldId, handle, startPos: { x: e.clientX, y: e.clientY }, startLayout: { ...field.layout } });
  };

  useEffect(() => {
    if (!resizeState) return;
    const { fieldId, handle, startPos, startLayout } = resizeState;
    let latest: { x: number; y: number } | null = null;

    const apply = () => {
      if (!latest) return;
      const deltaCols = Math.round((latest.x - startPos.x) / colWidthRef.current);
      const deltaRows = Math.round((latest.y - startPos.y) / gridRowHeight);
      let { gridRowStart, gridColumnStart, rowSpan, colSpan } = startLayout;

      if (handle.includes('e')) colSpan = Math.max(1, Math.min(13 - startLayout.gridColumnStart, startLayout.colSpan + deltaCols));
      if (handle.includes('w')) {
        gridColumnStart = Math.max(1, startLayout.gridColumnStart + deltaCols);
        colSpan = Math.max(1, startLayout.colSpan - deltaCols);
        if (gridColumnStart + colSpan > 13) colSpan = 13 - gridColumnStart;
      }
      if (handle.includes('s')) rowSpan = Math.max(1, startLayout.rowSpan + deltaRows);
      if (handle.includes('n') && startLayout.rowSpan - deltaRows >= 1) {
        gridRowStart = startLayout.gridRowStart + deltaRows;
        rowSpan = startLayout.rowSpan - deltaRows;
      }

      const next = clampFieldLayout({ gridRowStart, gridColumnStart, rowSpan, colSpan });
      resizeLastRef.current = next;
      setLiveLayout({ fieldId, layout: next });
    };

    const onMove = (ev: MouseEvent) => {
      latest = { x: ev.clientX, y: ev.clientY };
      if (resizeRafRef.current != null) return;
      resizeRafRef.current = requestAnimationFrame(() => {
        resizeRafRef.current = null;
        apply();
      });
    };

    const onUp = () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      if (resizeRafRef.current) cancelAnimationFrame(resizeRafRef.current);
      const final = resizeLastRef.current;
      resizeLastRef.current = null;
      if (final) applyLayout(fieldId, final);
      setLiveLayout(null);
      setResizeState(null);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [resizeState, gridRowHeight]);

  const handles: ResizeHandle[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];

  return (
    <div className="relative w-full isolate z-0" style={{ minHeight: gridMinHeight }}>
      <div
        ref={gridRef}
        className="grid w-full grid-cols-12 gap-0 relative"
        style={{
          gridAutoRows: `${gridRowHeight}px`,
          minHeight: gridMinHeight,
        }}
      >
        {showGuides && (
          <div className="absolute inset-0 pointer-events-none z-0">
            {Array.from({ length: 13 }).map((_, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 w-px border-l border-dashed border-blue-300/30"
                style={{ left: `${(i * 100) / 12}%` }}
              />
            ))}
          </div>
        )}

        {displayFields.length === 0 && (
          <div className="col-span-12 flex items-center justify-center text-sm text-muted-foreground py-12">
            Add fields to build your form layout
          </div>
        )}

        {displayFields.map((field, index) => {
          const mod = getFieldModuleByType(field.type);
          if (!mod || !field.layout) return null;
          const l = liveLayout?.fieldId === field.id ? liveLayout.layout : field.layout;
          const isSelected = selectedFieldId === field.id;
          const showChrome = isSelected && !suppressInteractionBoost;
          const z = computeFieldDisplayZIndex(field, index, isSelected, suppressInteractionBoost);

          return (
            <div
              key={field.id}
              className={`relative min-h-0 p-2 rounded-sm border bg-background/80 ${
                isSelected
                  ? 'border-[var(--accent-primary)] ring-1 ring-[var(--accent-primary)]/30'
                  : 'border-dashed border-[var(--glass-border)]'
              } ${draggingId === field.id ? 'opacity-80 shadow-lg' : ''}`}
              style={{ ...layoutToGridStyle(l), zIndex: z }}
              onMouseDown={(e) => {
                e.stopPropagation();
                onSelectField(field.id);
              }}
            >
              {showChrome && (
                <div
                  className="absolute top-1 right-1 flex gap-1 z-10"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 cursor-grab"
                    onMouseDown={(e) => startDrag(field.id, e)}
                  >
                    <Move className="h-3 w-3" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => onEditField(field.id)}>
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-red-600"
                    onClick={() => onDeleteField(field.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
              <div className="pointer-events-none h-full overflow-hidden">
                <mod.RenderComponent field={field} context="editor" />
              </div>
              {showChrome &&
                handles.map((h) => (
                  <button
                    key={h}
                    type="button"
                    aria-label={`Resize ${h}`}
                    className="absolute w-2 h-2 bg-[var(--accent-primary)] border border-white rounded-sm z-10 p-0"
                    style={{
                      top: h.includes('n') ? 0 : h.includes('s') ? '100%' : '50%',
                      left: h.includes('w') ? 0 : h.includes('e') ? '100%' : '50%',
                      transform: 'translate(-50%, -50%)',
                      cursor: `${h}-resize`,
                    }}
                    onMouseDown={(e) => startResize(field.id, h, e)}
                  />
                ))}
            </div>
          );
        })}
      </div>
    </div>
  );
};
