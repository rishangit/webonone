import { useState, useEffect } from "react";
import { Package } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { CustomDialog } from "../../../components/ui/custom-dialog";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { fetchTagsRequest } from "../../../store/slices/tagsSlice";
import { createSystemProductRequest, clearError as clearSystemProductsError } from "../../../store/slices/systemProductsSlice";
import FileUpload from "../../../components/ui/file-upload";
import { formatAvatarUrl } from "../../../utils";
import { TagSelector } from "../../../components/tags/TagSelector";

interface CreateSystemProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductCreated: (productData: any) => void;
}

export function CreateSystemProductDialog({ 
  open, 
  onOpenChange, 
  onProductCreated
}: CreateSystemProductDialogProps) {
  const dispatch = useAppDispatch();
  const { tags } = useAppSelector((state) => state.tags);
  const { loading: productsLoading, error: productsError } = useAppSelector((state) => state.systemProducts);

  // Load tags when dialog opens
  useEffect(() => {
    if (open && tags.length === 0) {
      dispatch(fetchTagsRequest({ active: true }));
    }
  }, [open, tags.length, dispatch]);

  // Clear product error when dialog opens
  useEffect(() => {
    if (open) {
      dispatch(clearSystemProductsError());
    }
  }, [open, dispatch]);

  // Show error toast if product creation fails
  useEffect(() => {
    if (productsError) {
      toast.error(productsError);
      dispatch(clearSystemProductsError());
    }
  }, [productsError, dispatch]);

  // Track if we're creating a product
  const [isCreating, setIsCreating] = useState(false);

  // Handle successful product creation - listen to Redux state changes
  useEffect(() => {
    // Only close dialog if we were creating and now it's done
    if (isCreating && !productsLoading && !productsError) {
      // Product creation is handled by the epic which shows toast
      // Close the dialog after a short delay to allow Redux to process
      const timer = setTimeout(() => {
        if (onProductCreated) {
          // The product will be in the Redux store, but we'll let the parent component
          // refresh the list instead of passing data back
          onProductCreated({});
        }
        resetForm();
        setIsCreating(false);
        onOpenChange(false);
      }, 500);
      
      return () => clearTimeout(timer);
    }
    
    // Reset creating flag if there's an error
    if (isCreating && productsError) {
      setIsCreating(false);
    }
  }, [isCreating, productsLoading, productsError, onProductCreated, onOpenChange]);

  const [formData, setFormData] = useState({
    // Removed brand field
    name: "",
    description: "",
    imageUrl: "", // Will store relative path
    isActive: true,
    tagIds: [] as string[]
  });

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setFormData({
        // Removed brand field
        name: "",
        description: "",
        imageUrl: "",
        isActive: true,
        tagIds: []
      });
    }
  }, [open]);

  const handleImageUploaded = (filePath: string, _fileUrl: string) => {
    // Save the relative file path (not the full URL) to the form data
    setFormData(prev => ({ ...prev, imageUrl: filePath }));
  };

  const handleImageDeleted = () => {
    // Remove the image from the form data
    setFormData(prev => ({ ...prev, imageUrl: "" }));
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      toast.error("Product name is required");
      return;
    }

    // Prepare product data for API
    const productData = {
      // Removed brand field
      name: formData.name.trim(),
      description: formData.description || undefined,
      imageUrl: formData.imageUrl || undefined,
      isActive: formData.isActive,
      tagIds: formData.tagIds.length > 0 ? formData.tagIds : undefined
    };
    
    // Set creating flag before dispatching
    setIsCreating(true);
    
    // Dispatch Redux action to create system product
    dispatch(createSystemProductRequest(productData));
  };

  const resetForm = () => {
    setFormData({
      // Removed brand field
      name: "",
      description: "",
      imageUrl: "",
      isActive: true,
      tagIds: []
    });
    setIsCreating(false);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  return (
    <CustomDialog 
      open={open} 
      onOpenChange={onOpenChange}
      title="Create System Product"
      description="Create a new product template for companies to use"
      icon={<Package className="w-5 h-5" />}
      maxWidth="max-w-2xl"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={handleClose}
            size="default"
            className="h-10 px-4 border-[var(--glass-border)] text-foreground hover:bg-accent"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            size="default"
            variant="accent"
            disabled={productsLoading}
          >
            {productsLoading ? "Creating..." : "Create Product"}
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
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Product name"
              className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground text-lg py-3"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-foreground">Description</Label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="High-quality nitrile examination gloves for medical procedures"
              className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground min-h-[80px]"
              rows={3}
            />
          </div>

          {/* Product Image */}
          <div className="space-y-2">
            <Label className="text-foreground">Product Image</Label>
            <FileUpload
              onFileUploaded={handleImageUploaded}
              onFileDeleted={handleImageDeleted}
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
                setFormData(prev => ({ ...prev, tagIds }));
              }}
              placeholder="Select tags for this product"
            />
            <p className="text-xs text-muted-foreground">
              Select one or more tags that best describe this product. You can search for tags in the dropdown.
            </p>
          </div>

        </div>
    </CustomDialog>
  );
}