import { useState, useEffect } from "react";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import FileUpload from "@/components/ui/file-upload";
import { formatAvatarUrl } from "../../../../utils";
import { Service, servicesService } from "@/features/services/services";
import { toast } from "sonner";
import { CardTitle } from "@/components/common/CardTitle";
import { EmptyState } from "@/components/common/EmptyState";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface ServiceGalleryTabProps {
  service: Service;
  companyId?: string;
  canEditGallery?: boolean;
  onServiceUpdate?: (updatedService: Service) => void;
  /** When set, used as FileUpload folder path instead of deriving from companyId + service.id */
  galleryUploadFolderPath?: string;
  /** When set, gallery mutations persist via this callback instead of company `servicesService.updateService` */
  persistGalleryImages?: (images: string[]) => Promise<void>;
}

export const ServiceGalleryTab = ({
  service,
  companyId,
  canEditGallery = false,
  onServiceUpdate,
  galleryUploadFolderPath,
  persistGalleryImages,
}: ServiceGalleryTabProps) => {
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Load gallery images from service (stored as JSON array in a field or separate)
  useEffect(() => {
    const imgs = service.images || (service.image ? [service.image] : []);
    setGalleryImages(Array.isArray(imgs) ? imgs : []);
  }, [service]);

  const handleImageUpload = async (filePath: string) => {
    try {
      setUploading(true);
      const updatedGallery = [...galleryImages, filePath];
      
      if (persistGalleryImages) {
        await persistGalleryImages(updatedGallery);
      } else {
        await servicesService.updateService(service.id, { images: updatedGallery } as any);
      }
      
      setGalleryImages(updatedGallery);
      
      // Update service object with new gallery images
      if (onServiceUpdate) {
        onServiceUpdate({
          ...service,
          images: updatedGallery,
          image: updatedGallery[0] || "",
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

      if (persistGalleryImages) {
        await persistGalleryImages(updatedGallery);
      } else {
        await servicesService.updateService(service.id, { images: updatedGallery } as any);
      }

      setGalleryImages(updatedGallery);
      
      // Update service object with new gallery images
      if (onServiceUpdate) {
        onServiceUpdate({
          ...service,
          images: updatedGallery,
          image: updatedGallery[0] || "",
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

  const folderPath =
    galleryUploadFolderPath ||
    (companyId ? `companies/${companyId}/services/${service.id}/gallery` : `services/${service.id}/gallery`);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = galleryImages.findIndex((img) => img === active.id);
    const newIndex = galleryImages.findIndex((img) => img === over.id);
    if (oldIndex < 0 || newIndex < 0) return;
    const reordered = arrayMove(galleryImages, oldIndex, newIndex);
    setGalleryImages(reordered);
    try {
      if (persistGalleryImages) {
        await persistGalleryImages(reordered);
      } else {
        await servicesService.updateService(service.id, { images: reordered } as any);
      }
      if (onServiceUpdate) {
        onServiceUpdate({ ...service, images: reordered, image: reordered[0] || "" } as any);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to save image order");
    }
  };

  const SortableImage = ({ imagePath, index }: { imagePath: string; index: number }) => {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: imagePath });
    const style = { transform: CSS.Transform.toString(transform), transition };
    return (
      <div ref={setNodeRef} style={style} className="relative group" {...attributes} {...listeners}>
        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
          <img
            src={formatAvatarUrl(imagePath)}
            alt={`Gallery ${index + 1}`}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute left-2 bottom-2 text-xs bg-black/60 text-white px-2 py-1 rounded">
          {index === 0 ? "Primary" : `#${index + 1}`}
        </div>
        {canEditGallery && (
          <Button
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => handleImageDelete(index)}
            disabled={uploading}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {canEditGallery && (
        <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
          <CardTitle title="Upload Gallery Images" icon={Upload}  />
          <FileUpload
            onFileUploaded={(filePath) => handleImageUpload(filePath)}
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
            Upload multiple images. Drag images below to reorder. First image is the primary image.
          </p>
        </Card>
      )}

      {/* Gallery Grid */}
      {galleryImages.length > 0 ? (
        <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
          <CardTitle title={`Gallery Images (${galleryImages.length})`} icon={ImageIcon}  />
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={galleryImages} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {galleryImages.map((imagePath, index) => (
                  <SortableImage key={`${imagePath}-${index}`} imagePath={imagePath} index={index} />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </Card>
      ) : (
        <EmptyState
          icon={ImageIcon}
          title="No gallery images"
          description={
            canEditGallery
              ? "Upload images using the section above to build your service gallery."
              : "No gallery images have been added for this service yet."
          }
        />
      )}
    </div>
  );
};
