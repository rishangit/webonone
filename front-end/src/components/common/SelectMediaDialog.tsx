import { useEffect, useState } from "react";
import { Image as ImageIcon, Upload } from "lucide-react";
import { toast } from "sonner";
import { CustomDialog } from "../ui/custom-dialog";
import { Button } from "../ui/button";
import { companyWebMediaService, getMediaFileUrl, MediaFile } from "@/services/companyWebMedia";
import { MediaUploadDialog } from "../../pages/website/MediaPage/components/MediaUploadDialog";

interface SelectMediaDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  selectedPath?: string;
  onSelect: (path: string) => void;
  title?: string;
  description?: string;
}

export const SelectMediaDialog = ({
  open,
  onOpenChange,
  companyId,
  selectedPath,
  onSelect,
  title = "Select media",
  description = "Select an image from media library or upload a new one.",
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
        description={description}
        icon={<ImageIcon className="w-5 h-5" />}
        sizeWidth="medium"
        sizeHeight="large"
        disableContentScroll
        footer={
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        }
      >
        <div className="flex flex-col flex-1 min-h-0 space-y-4 h-full">
          <div className="flex items-center justify-between rounded-md border border-[var(--glass-border)] bg-[var(--glass-bg)]/50 px-3 py-2 shrink-0">
            <p className="text-xs text-muted-foreground">
              Select an image
            </p>
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
            <div className="flex-1 min-h-0 overflow-auto rounded-md border border-[var(--glass-border)] bg-[var(--glass-bg)]/30 p-4 text-sm text-muted-foreground">
              Loading media...
            </div>
          ) : (
            <div className="flex-1 min-h-0 overflow-auto rounded-md border border-[var(--glass-border)] bg-[var(--glass-bg)]/30 p-2 pr-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
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
                        ? "border-[var(--accent-primary)] bg-[var(--accent-bg)] ring-1 ring-[var(--accent-primary)]/30"
                        : "border-[var(--glass-border)] bg-background/70 hover:border-[var(--accent-primary)]/60 hover:bg-[var(--accent-bg)]/40"
                    }`}
                  >
                    <div className="w-full aspect-square overflow-hidden rounded-sm bg-background/50">
                      <img src={url} alt={file.name} className="w-full h-full object-cover" />
                    </div>
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
