/* eslint-disable jsx-a11y/no-static-element-interactions -- form builder canvas clear selection */
import { useState, useEffect } from 'react';
import { Eye, EyeOff, Plus, Save } from 'lucide-react';
import { cn } from '@/components/ui/utils';
import { BackButton } from '@/components/common/BackButton';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import type { FormDefinition, FormField, FormFieldType } from '@/features/customForms/types';
import { DEFAULT_FORM_DEFINITION } from '@/features/customForms/types/formDefinition';
import { ensureFieldLayouts, maxLayoutRowEnd } from '@/features/customForms/utils/fieldGridUtils';
import { getFieldModuleByType } from './fields/registry';
import { AddFieldDialog } from './components/AddFieldDialog';
import { FormFieldGridEditor } from './components/FormFieldGridEditor';
import { FormFieldsRenderer } from './components/FormFieldsRenderer';

export interface VisualFormEditorSnapshot {
  definition: FormDefinition;
}

interface VisualFormEditorProps {
  title: string;
  resetKey: string;
  loadedSnapshot: VisualFormEditorSnapshot | null;
  isEntityReady: boolean;
  onSave: (snapshot: VisualFormEditorSnapshot) => void | Promise<void>;
  onBack: () => void;
}

type ViewMode = 'edit' | 'preview';

export const VisualFormEditor = ({
  title,
  resetKey,
  loadedSnapshot,
  isEntityReady,
  onSave,
  onBack,
}: VisualFormEditorProps) => {
  const [definition, setDefinition] = useState<FormDefinition>(DEFAULT_FORM_DEFINITION);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('edit');
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [addFieldOpen, setAddFieldOpen] = useState(false);
  const [editFieldId, setEditFieldId] = useState<string | null>(null);

  useEffect(() => {
    if (loadedSnapshot?.definition) {
      setDefinition({
        ...DEFAULT_FORM_DEFINITION,
        ...loadedSnapshot.definition,
        fields: ensureFieldLayouts(loadedSnapshot.definition.fields ?? []),
      });
      setIsDirty(false);
      setSelectedFieldId(null);
    }
  }, [resetKey, loadedSnapshot]);

  const rowHeight = definition.canvas?.rowHeightPx ?? 60;
  const minHeight = definition.canvas?.minHeightPx ?? 720;

  const handleAddField = (type: FormFieldType) => {
    const mod = getFieldModuleByType(type);
    if (!mod) return;
    const field = mod.createDefaultField();
    const nextRow = maxLayoutRowEnd(definition.fields) + 1;
    field.layout = {
      ...field.layout,
      gridRowStart: nextRow,
      gridColumnStart: 1,
      colSpan: 6,
      rowSpan: 2,
    };
    setDefinition((d) => ({
      ...d,
      fields: [...d.fields, field],
    }));
    setSelectedFieldId(field.id);
    setIsDirty(true);
  };

  const handleUpdateFields = (fields: FormField[], markDirty = true) => {
    setDefinition((d) => ({ ...d, fields }));
    if (markDirty) setIsDirty(true);
  };

  const handleDeleteField = (id: string) => {
    setDefinition((d) => ({ ...d, fields: d.fields.filter((f) => f.id !== id) }));
    if (selectedFieldId === id) setSelectedFieldId(null);
    setIsDirty(true);
  };

  const handleSaveField = (updated: FormField) => {
    setDefinition((d) => ({
      ...d,
      fields: d.fields.map((f) => (f.id === updated.id ? updated : f)),
    }));
    setIsDirty(true);
    setEditFieldId(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave({
        definition: {
          ...definition,
          version: 1,
          fields: ensureFieldLayouts(definition.fields),
        },
      });
      setIsDirty(false);
      toast.success('Form layout saved');
    } catch {
      toast.error('Failed to save form');
    } finally {
      setIsSaving(false);
    }
  };

  const editingField = editFieldId
    ? definition.fields.find((f) => f.id === editFieldId)
    : null;
  const EditComponent = editingField
    ? getFieldModuleByType(editingField.type)?.EditComponent
    : null;
  const isModalOpen = Boolean(editFieldId) || addFieldOpen;

  return (
    <div className="flex flex-col h-full min-h-0 bg-background">
      <div className="flex items-center justify-between gap-4 p-4 border-b border-[var(--glass-border)] shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <BackButton onClick={onBack} />
          <div className="min-w-0">
            <h1 className="text-lg font-semibold truncate">{title}</h1>
            {isDirty && <span className="text-xs text-muted-foreground">Unsaved changes</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button type="button" variant="outline" size="sm" onClick={() => setAddFieldOpen(true)}>
            <Plus className="w-4 h-4 mr-1" />
            Add field
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setViewMode(viewMode === 'edit' ? 'preview' : 'edit')}
          >
            {viewMode === 'edit' ? (
              <>
                <Eye className="w-4 h-4 mr-1" />
                Preview
              </>
            ) : (
              <>
                <EyeOff className="w-4 h-4 mr-1" />
                Edit
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="accent"
            size="sm"
            disabled={!isEntityReady || isSaving || !isDirty}
            onClick={handleSave}
          >
            <Save className="w-4 h-4 mr-1" />
            Save
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div
          className={cn(
            'mx-auto max-w-5xl rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] p-4 relative z-0 transition-opacity',
            isModalOpen && 'pointer-events-none opacity-40'
          )}
          style={{ minHeight }}
          role="presentation"
          onMouseDown={() => !isModalOpen && setSelectedFieldId(null)}
        >
          {!isEntityReady ? (
            <p className="text-muted-foreground text-center py-12">Loading form...</p>
          ) : viewMode === 'preview' ? (
            <FormFieldsRenderer
              fields={definition.fields}
              context="preview"
              rowHeightPx={rowHeight}
            />
          ) : (
            <FormFieldGridEditor
              fields={definition.fields}
              selectedFieldId={selectedFieldId}
              onSelectField={setSelectedFieldId}
              gridRowHeight={rowHeight}
              suppressInteractionBoost={isModalOpen}
              onUpdateFields={handleUpdateFields}
              onEditField={setEditFieldId}
              onDeleteField={handleDeleteField}
            />
          )}
        </div>
      </div>

      <AddFieldDialog open={addFieldOpen} onOpenChange={setAddFieldOpen} onSelect={handleAddField} />

      {editingField && EditComponent && (
        <EditComponent
          field={editingField}
          open={Boolean(editFieldId)}
          onOpenChange={(open) => !open && setEditFieldId(null)}
          onSave={handleSaveField}
        />
      )}
    </div>
  );
};
