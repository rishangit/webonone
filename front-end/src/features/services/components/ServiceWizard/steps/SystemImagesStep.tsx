import { Upload } from "lucide-react";
import { Label } from "@/components/ui/label";
import FileUpload from "@/components/ui/file-upload";
import { ServiceWizardImageGrid } from "../components/ServiceWizardImageGrid";

export interface SystemImagesStepProps {
  images: string[];
  onFileUploaded: (path: string) => void;
  onRemoveImage: (index: number) => void;
  onMoveImageUp: (index: number) => void;
  onMoveImageDown: (index: number) => void;
}

export function SystemImagesStep({ images, onFileUploaded, onRemoveImage, onMoveImageUp, onMoveImageDown }: SystemImagesStepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="flex items-center gap-2 text-foreground">
          <Upload className="w-4 h-4" /> Add images
        </Label>
        <FileUpload onFileUploaded={onFileUploaded} onFileDeleted={() => {}} folderPath="system/services" label="Upload image" maxSize={10} />
      </div>
      <p className="text-sm text-muted-foreground">First image in the list is the primary thumbnail. Use arrows to reorder.</p>
      <ServiceWizardImageGrid
        images={images}
        onRemove={onRemoveImage}
        onMoveUp={onMoveImageUp}
        onMoveDown={onMoveImageDown}
        altPrefix="system-service"
      />
    </div>
  );
}
