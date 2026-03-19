import { useState, useRef } from "react";
import { Upload, FileUp, Loader2 } from "lucide-react";
import { CustomDialog } from "../../../../components/ui/custom-dialog";
import FileUpload from "../../../../components/ui/file-upload";
import { Button } from "../../../../components/ui/button";
import { ProgressBar } from "../../../../components/ui/progress-bar";
import { companyWebMediaService } from "../../../../services/companyWebMedia";
import { toast } from "sonner";

export interface MediaUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  currentPath: string;
  onUploadComplete: () => void;
}

export const MediaUploadDialog = ({
  open,
  onOpenChange,
  companyId,
  currentPath,
  onUploadComplete,
}: MediaUploadDialogProps) => {
  const [uploadingMulti, setUploadingMulti] = useState(false);
  const [multiProgress, setMultiProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const folderPath = `companies/${companyId}/web/media${currentPath ? `/${currentPath}` : ""}`;

  const handleFileUploaded = (filePath: string, fileUrl: string) => {
    onUploadComplete();
    onOpenChange(false);
  };

  const handleMultiFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected?.length || !companyId) return;
    setUploadingMulti(true);
    setMultiProgress(0);
    try {
      await companyWebMediaService.upload(companyId, currentPath, Array.from(selected));
      setMultiProgress(100);
      toast.success(`${selected.length} file(s) uploaded`);
      onUploadComplete();
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploadingMulti(false);
      setMultiProgress(0);
      e.target.value = "";
      fileInputRef.current?.value && (fileInputRef.current.value = "");
    }
  };

  const cropAspectPresets = [
    { label: "Hero banner 16:9", value: 16 / 9 },
    { label: "Blog/content 4:3", value: 4 / 3 },
    { label: "Product images 1:1", value: 1 },
    { label: "Portrait photos 3:4", value: 3 / 4 },
    { label: "Portrait photos 2:3", value: 2 / 3 },
    { label: "Ultra wide sections 21:9", value: 21 / 9 },
  ];

  return (
    <CustomDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Upload"
      description="Upload an image (with crop) or multiple files. Image upload shows progress."
      icon={<Upload className="w-5 h-5" />}
      maxWidth="max-w-lg"
      noContentPadding
    >
      <div className="p-6 pt-0 space-y-6">
        <div>
          <FileUpload
            onFileUploaded={handleFileUploaded}
            folderPath={folderPath}
            label="Choose image (crop & progress)"
            accept="image/*"
            maxSize={10}
            className="w-full"
            disabled={uploadingMulti}
            cropAspectPresets={cropAspectPresets}
          />
          <p className="text-xs text-muted-foreground mt-2 text-center">
            JPG, PNG, GIF. Opens crop tool and shows upload progress.
          </p>
        </div>

        <div className="border-t border-[var(--glass-border)] pt-4">
          <p className="text-sm font-medium text-foreground mb-2">Or upload multiple files</p>
          {uploadingMulti ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Uploading…
              </div>
              <ProgressBar value={multiProgress || 50} variant="upload" />
            </div>
          ) : (
            <>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="sr-only"
                onChange={handleMultiFileSelect}
                id="media-multi-upload"
              />
              <Button
                type="button"
                variant="outline"
                className="w-full bg-[var(--glass-bg)] border-[var(--glass-border)]"
                onClick={() => fileInputRef.current?.click()}
              >
                <FileUp className="w-4 h-4 mr-2" />
                Choose files (no crop)
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Any file type. No crop or progress bar.
              </p>
            </>
          )}
        </div>
      </div>
    </CustomDialog>
  );
};
