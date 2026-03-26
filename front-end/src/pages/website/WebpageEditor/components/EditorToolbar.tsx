import { Save, Eye, FileText, Edit, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface EditorToolbarProps {
  onSave: () => void;
  onPreview?: () => void;
  isSaving?: boolean;
  viewMode?: 'visual' | 'edit';
  onViewModeChange?: (mode: 'visual' | 'edit') => void;
  onAddContent?: () => void;
}

export const EditorToolbar = ({
  onSave,
  onPreview,
  isSaving = false,
  viewMode = 'visual',
  onViewModeChange,
  onAddContent,
}: EditorToolbarProps) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-[var(--glass-border)] bg-[var(--glass-bg)] backdrop-blur-sm">
      <div className="flex items-center gap-2">
        {/* View Mode Toggle */}
        {onViewModeChange && (
          <>
            <Button
              variant={viewMode === 'visual' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('visual')}
              className={viewMode === 'visual' ? 'bg-[var(--accent-bg)] text-[var(--accent-text)]' : ''}
            >
              <FileText className="w-4 h-4 mr-2" />
              Visual
            </Button>
            <Button
              variant={viewMode === 'edit' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange('edit')}
              className={viewMode === 'edit' ? 'bg-[var(--accent-bg)] text-[var(--accent-text)]' : ''}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </>
        )}
        
        {/* Add Content Button - Only show in edit mode */}
        {onAddContent && viewMode === 'edit' && (
          <>
            <Separator orientation="vertical" className="h-6 mx-2" />
            <Button
              onClick={onAddContent}
              size="sm"
              className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:from-[var(--accent-primary-hover)] hover:to-[var(--accent-primary)] text-[var(--accent-button-text)]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Content
            </Button>
          </>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Preview */}
        {onPreview && (
          <Button
            variant="outline"
            size="sm"
            onClick={onPreview}
            className="border-[var(--glass-border)] hover:bg-[var(--accent-bg)]"
          >
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
        )}

        {/* Save */}
        <Button
          onClick={onSave}
          disabled={isSaving}
          className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:from-[var(--accent-primary-hover)] hover:to-[var(--accent-primary)] text-[var(--accent-button-text)]"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save'}
        </Button>
      </div>
    </div>
  );
};
