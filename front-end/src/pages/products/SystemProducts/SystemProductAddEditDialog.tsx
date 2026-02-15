import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { CustomDialog } from "../../../components/ui/custom-dialog";
import { Package } from "lucide-react";
import FileUpload from "../../../components/ui/file-upload";
import { TagSelector } from "../../../components/tags/TagSelector";
import { formatAvatarUrl } from "../../../utils";

interface SystemProductAddEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: {
    // Removed brand field
    name: string;
    description: string;
    imageUrl: string;
    isActive: boolean;
    tagIds: string[];
  };
  onFormDataChange: (data: {
    // Removed brand field
    name: string;
    description: string;
    imageUrl: string;
    isActive: boolean;
    tagIds: string[];
  }) => void;
  onSubmit: () => void;
  onImageUploaded: (filePath: string, fileUrl: string) => void;
  onImageDeleted: () => void;
  loading?: boolean;
}

export const SystemProductAddEditDialog = ({
  open,
  onOpenChange,
  formData,
  onFormDataChange,
  onSubmit,
  onImageUploaded,
  onImageDeleted,
  loading = false,
}: SystemProductAddEditDialogProps) => {
  return (
    <CustomDialog 
      open={open} 
      onOpenChange={onOpenChange}
      title="Edit System Product"
      description="Update product information and settings"
      icon={<Package className="w-5 h-5" />}
      maxWidth="max-w-2xl"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            size="default"
            className="h-10 px-4 border-[var(--glass-border)] text-foreground hover:bg-accent"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={onSubmit}
            size="default"
            variant="accent"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Product"}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Product Name */}
        <div className="space-y-2">
          <Label className="text-foreground">Product Name *</Label>
          <Input
            value={formData.name}
            onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
            placeholder="Product name"
            className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground text-lg py-3"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label className="text-foreground">Description</Label>
          <Textarea
            value={formData.description}
            onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
            placeholder="High-quality nitrile examination gloves for medical procedures"
            className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground min-h-[80px]"
            rows={3}
          />
        </div>

        {/* Product Image */}
        <div className="space-y-2">
          <Label className="text-foreground">Product Image</Label>
          <FileUpload
            onFileUploaded={onImageUploaded}
            onFileDeleted={onImageDeleted}
            currentImagePath={formData.imageUrl}
            currentImageUrl={formData.imageUrl ? formatAvatarUrl(formData.imageUrl) : undefined}
            folderPath="products"
            label="Upload Product Image"
            maxSize={5}
            className="w-full"
          />
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label className="text-foreground">Tags</Label>
          <TagSelector
            value={formData.tagIds}
            onChange={(tagIds) => {
              onFormDataChange({ ...formData, tagIds });
            }}
            placeholder="Select tags for this product"
          />
          <p className="text-xs text-muted-foreground">
            Select one or more tags that best describe this product. You can search for tags in the dropdown.
          </p>
        </div>

        {/* Active Status */}
        <div className="space-y-2">
          <Label className="text-foreground">Status</Label>
          <Select 
            value={formData.isActive ? "active" : "inactive"} 
            onValueChange={(value) => onFormDataChange({ ...formData, isActive: value === "active" })}
          >
            <SelectTrigger className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </CustomDialog>
  );
};
