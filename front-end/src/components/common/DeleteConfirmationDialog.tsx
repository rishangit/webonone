import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  itemName?: string;
  itemType?: string; // e.g., "Product", "Company", "Tag", etc.
  description?: string;
  confirmButtonText?: string;
  cancelButtonText?: string;
  isLoading?: boolean;
}

export const DeleteConfirmationDialog = ({
  open,
  onOpenChange,
  onConfirm,
  title,
  itemName,
  itemType = "item",
  description,
  confirmButtonText,
  cancelButtonText = "Cancel",
  isLoading = false
}: DeleteConfirmationDialogProps) => {
  const defaultTitle = title || `Delete ${itemType}`;
  const defaultDescription = description || 
    (itemName 
      ? `Are you sure you want to delete "${itemName}"? This action cannot be undone and will remove all associated data.`
      : `Are you sure you want to delete this ${itemType.toLowerCase()}? This action cannot be undone and will remove all associated data.`
    );
  const defaultConfirmText = confirmButtonText || `Delete ${itemType}`;

  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-[var(--glass-bg)] border-[var(--glass-border)] backdrop-blur-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground">{defaultTitle}</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            {defaultDescription}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            className="border-[var(--glass-border)] text-foreground hover:bg-accent"
            onClick={handleCancel}
            disabled={isLoading}
          >
            {cancelButtonText}
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleConfirm}
            className="bg-red-500 hover:bg-red-600 text-white"
            disabled={isLoading}
          >
            {isLoading ? "Deleting..." : defaultConfirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};



















