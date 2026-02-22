import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Bug, Sparkles } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { CustomDialog } from "../../components/ui/custom-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import FileUpload from "../../components/ui/file-upload";
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { 
  createBacklogItemRequest, 
  updateBacklogItemRequest,
  clearBacklogError
} from '../../store/slices/backlogSlice';
import { BacklogItem, CreateBacklogItemData } from '../../services/backlog';
import { toast } from "sonner";
import { formatAvatarUrl } from "../../utils";

const backlogSchema = yup.object({
  title: yup.string().required("Title is required").min(3, "Title must be at least 3 characters"),
  description: yup.string().required("Description is required").min(10, "Description must be at least 10 characters"),
  type: yup.string().oneOf(['Issue', 'Feature'], "Type must be either Issue or Feature").required("Type is required"),
  screenshotPath: yup.string().nullable().optional(),
}).required();

interface BacklogFormData {
  title: string;
  description: string;
  type: 'Issue' | 'Feature';
  screenshotPath: string | null;
}

interface BacklogFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode?: "add" | "edit";
  item?: BacklogItem | null;
  onSuccess?: () => void;
}

export const BacklogFormDialog = ({ 
  open, 
  onOpenChange, 
  mode = "add",
  item,
  onSuccess
}: BacklogFormDialogProps) => {
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.backlog);
  const [screenshotPath, setScreenshotPath] = useState<string | null>(null);
  
  const backlogForm = useForm<BacklogFormData>({
    resolver: yupResolver(backlogSchema) as any,
    defaultValues: {
      title: '',
      description: '',
      type: 'Issue' as 'Issue' | 'Feature',
      screenshotPath: null
    }
  });

  // Reset form when dialog opens/closes or item changes
  useEffect(() => {
    if (open) {
      if (mode === "edit" && item) {
        backlogForm.reset({
          title: item.title,
          description: item.description,
          type: item.type,
          screenshotPath: item.screenshotPath || null
        });
        setScreenshotPath(item.screenshotPath || null);
      } else {
        backlogForm.reset({
          title: '',
          description: '',
          type: 'Issue',
          screenshotPath: null
        });
        setScreenshotPath(null);
      }
    }
  }, [open, mode, item, backlogForm]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearBacklogError());
    }
  }, [error, dispatch]);

  const handleScreenshotUploaded = (filePath: string) => {
    setScreenshotPath(filePath);
    backlogForm.setValue('screenshotPath', filePath);
  };

  const handleScreenshotDeleted = () => {
    setScreenshotPath(null);
    backlogForm.setValue('screenshotPath', null);
  };

  const handleSave = (data: BacklogFormData) => {
    if (mode === "add") {
      const requestData: CreateBacklogItemData = {
        title: data.title,
        description: data.description,
        type: data.type,
        screenshotPath: screenshotPath || null
      };
      
      dispatch(createBacklogItemRequest(requestData));
      setTimeout(() => {
        onOpenChange(false);
        if (onSuccess) onSuccess();
      }, 500);
    } else if (mode === "edit" && item) {
      dispatch(updateBacklogItemRequest({
        id: item.id,
        data: {
          title: data.title,
          description: data.description,
          type: data.type,
          screenshotPath: screenshotPath || null
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
      title={mode === "edit" ? "Edit Backlog Item" : "Log Issue / Request Feature"}
      description={mode === "edit" ? "Update backlog item information" : "Create a new issue or feature request"}
      icon={mode === "edit" ? <Bug className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
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
            onClick={() => backlogForm.handleSubmit(handleSave)()}
            size="default"
            variant="accent"
            disabled={loading}
          >
            {loading ? "Saving..." : mode === "edit" ? "Update Item" : "Submit"}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="backlog-title" className="text-foreground">Title *</Label>
          <Input
            id="backlog-title"
            {...backlogForm.register("title")}
            placeholder="Enter a brief title for the issue or feature"
            className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
          />
          {backlogForm.formState.errors.title && (
            <p className="text-sm text-red-500">{backlogForm.formState.errors.title.message}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="backlog-description" className="text-foreground">Description *</Label>
          <Textarea
            id="backlog-description"
            {...backlogForm.register("description")}
            placeholder="Provide a detailed description of the issue or feature request..."
            className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground !min-h-[120px] resize-y"
            rows={5}
          />
          {backlogForm.formState.errors.description && (
            <p className="text-sm text-red-500">{backlogForm.formState.errors.description.message}</p>
          )}
        </div>

        {/* Type */}
        <div className="space-y-2">
          <Label htmlFor="backlog-type" className="text-foreground">Type *</Label>
          <Controller
            name="type"
            control={backlogForm.control}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger 
                  id="backlog-type"
                  className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
                >
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="Issue">
                    <div className="flex items-center gap-2">
                      <Bug className="w-4 h-4" />
                      <span>Issue</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="Feature">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span>Feature</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {backlogForm.formState.errors.type && (
            <p className="text-sm text-red-500">{backlogForm.formState.errors.type.message}</p>
          )}
        </div>

        {/* Screenshot Upload */}
        <div className="space-y-2">
          <Label className="text-foreground">Screenshot (Optional)</Label>
          <FileUpload
            onFileUploaded={handleScreenshotUploaded}
            onFileDeleted={handleScreenshotDeleted}
            currentImagePath={screenshotPath || undefined}
            currentImageUrl={screenshotPath ? formatAvatarUrl(screenshotPath) : undefined}
            folderPath="backlog"
            label="Upload Screenshot"
            maxSize={5}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground">
            Upload a screenshot to help illustrate the issue or feature request (optional)
          </p>
        </div>
      </div>
    </CustomDialog>
  );
};
