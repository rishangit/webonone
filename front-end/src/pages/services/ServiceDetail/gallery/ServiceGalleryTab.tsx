import { useState, useEffect } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import FileUpload from "../../../../components/ui/file-upload";
import { formatAvatarUrl } from "../../../../utils";
import { Service } from "../../../../services/services";
import { servicesService } from "../../../../services/services";
import { toast } from "sonner";
import { useAppDispatch } from "../../../../store/hooks";
import { fetchServiceRequest } from "../../../../store/slices/servicesSlice";

interface ServiceGalleryTabProps {
  service: Service;
  companyId?: string;
  onServiceUpdate?: (updatedService: Service) => void;
}

export const ServiceGalleryTab = ({ service, companyId, onServiceUpdate }: ServiceGalleryTabProps) => {
  const dispatch = useAppDispatch();
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  // Load gallery images from service (stored as JSON array in a field or separate)
  useEffect(() => {
    // For now, we'll use a gallery field if it exists, or initialize as empty array
    // In the future, this could be stored in service.galleryImages or similar
    if (service && (service as any).galleryImages) {
      try {
        const images = typeof (service as any).galleryImages === 'string' 
          ? JSON.parse((service as any).galleryImages) 
          : (service as any).galleryImages;
        setGalleryImages(Array.isArray(images) ? images : []);
      } catch (error) {
        console.error('Error parsing gallery images:', error);
        setGalleryImages([]);
      }
    } else {
      setGalleryImages([]);
    }
  }, [service]);

  const handleImageUpload = async (filePath: string) => {
    try {
      setUploading(true);
      const updatedGallery = [...galleryImages, filePath];
      
      // Update service with new gallery images
      await servicesService.updateService(service.id, {
        galleryImages: updatedGallery,
      } as any);
      
      setGalleryImages(updatedGallery);
      
      // Update service object with new gallery images
      if (onServiceUpdate) {
        onServiceUpdate({
          ...service,
          galleryImages: updatedGallery,
        } as any);
      }
      
      toast.success("Image added to gallery");
    } catch (error: any) {
      console.error('Error uploading gallery image:', error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleImageDelete = async (imageIndex: number) => {
    try {
      setUploading(true);
      const updatedGallery = galleryImages.filter((_, index) => index !== imageIndex);
      
      await servicesService.updateService(service.id, {
        galleryImages: updatedGallery,
      } as any);
      
      setGalleryImages(updatedGallery);
      
      // Update service object with new gallery images
      if (onServiceUpdate) {
        onServiceUpdate({
          ...service,
          galleryImages: updatedGallery,
        } as any);
      }
      
      toast.success("Image removed from gallery");
    } catch (error: any) {
      console.error('Error deleting gallery image:', error);
      toast.error(error.message || "Failed to delete image");
    } finally {
      setUploading(false);
    }
  };

  const folderPath = companyId 
    ? `companies/${companyId}/services/${service.id}/gallery`
    : `services/${service.id}/gallery`;

  return (
    <div className="space-y-6">
      {/* Upload New Image */}
      <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5 text-[var(--accent-text)]" />
          Upload Gallery Images
        </h3>
        <FileUpload
          onFileUploaded={(filePath, fileUrl) => handleImageUpload(filePath)}
          onFileDeleted={() => {}}
          currentImagePath={undefined}
          currentImageUrl={undefined}
          folderPath={folderPath}
          label="Upload Gallery Image"
          maxSize={10}
          className="w-full"
          disabled={uploading}
        />
        <p className="text-sm text-muted-foreground mt-2">
          Upload multiple images to showcase your service. Images will be displayed in the gallery.
        </p>
      </Card>

      {/* Gallery Grid */}
      {galleryImages.length > 0 ? (
        <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[var(--accent-text)]" />
            Gallery Images ({galleryImages.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {galleryImages.map((imagePath, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                  <img
                    src={formatAvatarUrl(imagePath)}
                    alt={`Gallery image ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleImageDelete(index)}
                  disabled={uploading}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card className="p-12 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] text-center">
          <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">No gallery images yet. Upload images to get started.</p>
        </Card>
      )}
    </div>
  );
};
