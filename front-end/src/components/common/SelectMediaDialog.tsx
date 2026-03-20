import { useEffect, useState } from "react";
import { Image as ImageIcon, Upload } from "lucide-react";
import { toast } from "sonner";
import { CustomDialog } from "../ui/custom-dialog";
import { Button } from "../ui/button";
import { companyWebMediaService, getMediaFileUrl, MediaFile } from "../../services/companyWebMedia";
import { MediaUploadDialog } from "../../pages/website/MediaPage/components/MediaUploadDialog";

interface SelectMediaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  selectedPath?: string;
  onSelect: (path: string) => void;
  title?: string;
}

export const SelectMediaDialog = ({
  open,
  onOpenChange,
  companyId,
  selectedPath,
  onSelect,
  title = "Select media",
}: SelectMediaDialogProps) => {
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const loadMedia = async () => {
    if (!companyId) return;
    setLoadingMedia(true);
    try {
      const media = await companyWebMediaService.list(companyId, "");
      setMediaFiles(media.files.filter((file) => file.isImage));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load media");
      setMediaFiles([]);
    } finally {
      setLoadingMedia(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    loadMedia();
  }, [open, companyId]);

  return (
    <>
      <CustomDialog
        open={open}
        onOpenChange={onOpenChange}
        title={title}
        description="Select an image from media library or upload a new one."
        icon={<ImageIcon className="w-5 h-5" />}
        maxWidth="max-w-4xl"
        footer={
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="flex items-center justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setUploadDialogOpen(true)}
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload media
            </Button>
          </div>

          {loadingMedia ? (
            <div className="text-sm text-muted-foreground">Loading media...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-h-80 overflow-auto pr-1">
              {mediaFiles.map((file) => {
                const url = getMediaFileUrl(companyId, file.path);
                const isSelected = selectedPath === file.path;
                return (
                  <button
                    key={file.path}
                    type="button"
                    onClick={() => {
                      onSelect(file.path);
                      onOpenChange(false);
                    }}
                    className={`rounded-md border p-2 text-left transition-colors ${
                      isSelected
                        ? "border-[var(--accent-primary)] bg-[var(--accent-bg)]"
                        : "border-[var(--glass-border)] hover:border-[var(--accent-primary)]/60"
                    }`}
                  >
                    <img src={url} alt={file.name} className="w-full h-24 object-cover rounded-sm mb-2" />
                    <p className="text-xs text-foreground truncate">{file.name}</p>
                  </button>
                );
              })}

              {!mediaFiles.length && (
                <div className="col-span-full rounded-md border border-dashed border-[var(--glass-border)] p-4 text-sm text-muted-foreground">
                  No image media found. Upload one to continue.
                </div>
              )}
            </div>
          )}
        </div>
      </CustomDialog>

      <MediaUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        companyId={companyId}
        currentPath=""
        onUploadComplete={loadMedia}
      />
    </>
  );
};
