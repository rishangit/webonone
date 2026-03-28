import { CustomDialog } from "@/components/ui/custom-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TagSelector } from "@/components/tags/TagSelector";
import FileUpload from "@/components/ui/file-upload";
import { formatAvatarUrl } from "../../../../utils";
import { SpaceAddEditDialogProps, Space } from "../types";

export const SpaceAddEditDialog = ({
  open,
  onOpenChange,
  isEdit,
  formData,
  onFormDataChange,
  onSave,
  companyId,
  onImageUploaded,
  onImageDeleted
}: SpaceAddEditDialogProps) => {
  const handleChange = (field: keyof typeof formData, value: any) => {
    onFormDataChange({ [field]: value });
  };

  return (
    <CustomDialog
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit Space" : "Add New Space"}
      description={isEdit ? "Update space information and settings." : "Create a new space for your organization."}
      sizeWidth="medium"
      sizeHeight="large"
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
            variant="accent"
            onClick={onSave}
            size="default"
          >
            {isEdit ? "Update Space" : "Create Space"}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="space-y-3">
          <Label className="text-foreground">Space Image</Label>
          <FileUpload
            onFileUploaded={onImageUploaded}
            onFileDeleted={onImageDeleted}
            currentImagePath={formData.imageUrl}
            currentImageUrl={formData.imageUrl ? formatAvatarUrl(formData.imageUrl) : undefined}
            folderPath={companyId ? `companies/${companyId}/spaces` : 'companies/spaces'}
            label="Upload Space Image"
            maxSize={10}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="name" className="text-foreground">Space Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="Enter space name"
              className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="capacity" className="text-foreground">Capacity *</Label>
            <Input
              id="capacity"
              type="number"
              min="1"
              value={formData.capacity}
              onChange={(e) => handleChange("capacity", e.target.value)}
              placeholder="Number of people"
              className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label htmlFor="status" className="text-foreground">Status</Label>
            <Select 
              value={formData.status} 
              onValueChange={(value: Space["status"]) => handleChange("status", value)}
            >
              <SelectTrigger className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
                <SelectItem value="Maintenance">Maintenance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-3">
          <Label className="text-foreground">Tags</Label>
          <TagSelector
            value={formData.tagIds}
            onChange={(tagIds) => handleChange("tagIds", tagIds)}
            placeholder="Select tags for this space"
          />
        </div>

        <div className="space-y-3">
          <Label htmlFor="description" className="text-foreground">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange("description", e.target.value)}
            placeholder="Describe the space and its features"
            className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
            rows={3}
          />
        </div>
      </div>
    </CustomDialog>
  );
};
