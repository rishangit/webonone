import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Tag as TagIcon } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { CustomDialog } from "../../components/ui/custom-dialog";
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { 
  createTagRequest, 
  updateTagRequest,
  clearTagsError
} from '../../store/slices/tagsSlice';
import { Tag, CreateTagData } from '../../services/tags';
import { toast } from "sonner";

const tagSchema = yup.object({
  name: yup.string().required("Tag name is required").min(2, "Name must be at least 2 characters"),
  description: yup.string().optional(),
  color: yup.string().matches(/^#[0-9A-F]{6}$/i, "Color must be a valid hex color"),
  icon: yup.string().optional(),
  isActive: yup.boolean().optional(),
});

interface TagFormData {
  name: string;
  description: string;
  color: string;
  icon: string;
  isActive: boolean;
}

interface TagFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "add" | "edit";
  tag?: Tag | null;
  onSuccess?: () => void;
}

const defaultColors = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#F59E0B', // Amber
  '#EF4444', // Red
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
];

export const TagFormDialog = ({ 
  open, 
  onOpenChange, 
  mode = "add",
  tag,
  onSuccess
}: TagFormDialogProps) => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.tags);
  
  const tagForm = useForm<TagFormData>({
    resolver: yupResolver(tagSchema),
    defaultValues: {
      name: '',
      description: '',
      color: '#3B82F6',
      icon: '',
      isActive: true
    }
  });

  // Reset form when dialog opens/closes or tag changes
  useEffect(() => {
    if (open) {
      if (mode === "edit" && tag) {
        tagForm.reset({
          name: tag.name,
          description: tag.description || '',
          color: tag.color || '#3B82F6',
          icon: tag.icon || '',
          isActive: tag.isActive
        });
      } else {
        tagForm.reset({
          name: '',
          description: '',
          color: '#3B82F6',
          icon: '',
          isActive: true
        });
      }
    }
  }, [open, mode, tag, tagForm]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearTagsError());
    }
  }, [error, dispatch]);

  const handleSave = (data: TagFormData) => {
    if (mode === "add") {
      const requestData: CreateTagData = {
        name: data.name,
        description: data.description || undefined,
        color: data.color,
        icon: data.icon || undefined,
        isActive: data.isActive
      };
      
      dispatch(createTagRequest(requestData));
      setTimeout(() => {
        onOpenChange(false);
        if (onSuccess) onSuccess();
      }, 500);
    } else if (mode === "edit" && tag) {
      dispatch(updateTagRequest({
        id: tag.id,
        data: {
          name: data.name,
          description: data.description || undefined,
          color: data.color,
          icon: data.icon || undefined,
          isActive: data.isActive
        }
      }));
      setTimeout(() => {
        onOpenChange(false);
        if (onSuccess) onSuccess();
      }, 500);
    }
  };

  return (
    <CustomDialog 
      open={open} 
      onOpenChange={onOpenChange}
      title={mode === "edit" ? "Edit Tag" : "Add Tag"}
      description={mode === "edit" ? "Update tag information" : "Create a new tag for companies and products"}
      icon={<TagIcon className="w-5 h-5" />}
      maxWidth="max-w-2xl"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            size="default"
            className="h-10 px-4 border-[var(--glass-border)] text-foreground hover:bg-accent"
          >
            Cancel
          </Button>
          <Button 
            onClick={tagForm.handleSubmit(handleSave)}
            size="default"
            variant="accent"
            disabled={loading}
          >
            {loading ? "Saving..." : mode === "edit" ? "Update Tag" : "Create Tag"}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Tag Name */}
        <div className="space-y-2">
          <Label htmlFor="tag-name" className="text-foreground">Tag Name *</Label>
          <Input
            id="tag-name"
            {...tagForm.register("name")}
            placeholder="Enter tag name"
            className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
          />
          {tagForm.formState.errors.name && (
            <p className="text-sm text-red-500">{tagForm.formState.errors.name.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="tag-description" className="text-foreground">Description</Label>
          <Textarea
            id="tag-description"
            {...tagForm.register("description")}
            placeholder="Enter tag description"
            className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground min-h-[80px]"
            rows={3}
          />
        </div>

        {/* Color Selection */}
        <div className="space-y-2">
          <Label htmlFor="tag-color" className="text-foreground">Color *</Label>
          <div className="flex items-center gap-4">
            <Input
              id="tag-color"
              type="color"
              {...tagForm.register("color")}
              className="w-20 h-10 bg-[var(--input-background)] border-[var(--glass-border)] cursor-pointer"
            />
            <Input
              type="text"
              {...tagForm.register("color")}
              placeholder="#3B82F6"
              className="flex-1 bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {defaultColors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => tagForm.setValue("color", color)}
                className="w-8 h-8 rounded border-2 border-transparent hover:border-foreground transition-colors"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
          </div>
          {tagForm.formState.errors.color && (
            <p className="text-sm text-red-500">{tagForm.formState.errors.color.message}</p>
          )}
        </div>

        {/* Icon */}
        <div className="space-y-2">
          <Label htmlFor="tag-icon" className="text-foreground">Icon (Emoji)</Label>
          <Input
            id="tag-icon"
            {...tagForm.register("icon")}
            placeholder="🏷️ (optional)"
            maxLength={10}
            className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
          />
          <p className="text-xs text-muted-foreground">Enter an emoji or icon character (optional)</p>
        </div>

        {/* Active Status */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="tag-active"
            {...tagForm.register("isActive")}
            className="w-4 h-4 rounded border-[var(--glass-border)] bg-[var(--input-background)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)]"
          />
          <Label htmlFor="tag-active" className="text-foreground cursor-pointer">
            Active (Tag will be available for use)
          </Label>
        </div>

        {/* Preview */}
        <div className="space-y-2">
          <Label className="text-foreground">Preview</Label>
          <div className="p-4 rounded-lg border border-[var(--glass-border)] bg-[var(--input-background)]">
            <div className="flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                style={{ 
                  backgroundColor: `${tagForm.watch("color") || '#3B82F6'}20`, 
                  color: tagForm.watch("color") || '#3B82F6' 
                }}
              >
                {tagForm.watch("icon") || <TagIcon className="w-4 h-4" />}
              </div>
              <span className="font-medium text-foreground">
                {tagForm.watch("name") || "Tag Name"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </CustomDialog>
  );
};

