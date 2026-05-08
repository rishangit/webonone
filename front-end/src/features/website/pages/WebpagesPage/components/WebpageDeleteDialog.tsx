import { Trash2 } from "lucide-react";
import { CustomDialog } from "@/components/ui/custom-dialog";
import { Button } from "@/components/ui/button";
import { WebpageDeleteDialogProps } from "../types";

const cancelFooterClass =
  "h-10 px-4 border-[var(--glass-border)] text-foreground hover:bg-accent";

export const WebpageDeleteDialog = ({
  open,
  onOpenChange,
  webPage,
  onDelete,
}: WebpageDeleteDialogProps) => {
  return (
    <CustomDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Webpage"
      sizeWidth="auto"
      maxWidth="max-w-md"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            className={cancelFooterClass}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" variant="destructive" onClick={onDelete}>
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      }
    >
      <p className="text-sm text-foreground">
        Are you sure you want to delete &quot;{webPage?.name ?? ""}&quot;? This action cannot be undone.
      </p>
    </CustomDialog>
  );
};
