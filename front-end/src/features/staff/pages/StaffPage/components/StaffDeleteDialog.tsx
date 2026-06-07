import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogAction } from "@/components/ui/alert-dialog";
import { StaffDeleteDialogProps } from "../types";

export const StaffDeleteDialog = ({ open, onOpenChange, member, onDelete }: StaffDeleteDialogProps) => {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-[var(--glass-bg)] border-[var(--glass-border)] backdrop-blur-sm">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground">Remove Staff Member</AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            {member 
              ? `Are you sure you want to remove ${member.firstName || ''} ${member.lastName || ''} from your team? This action cannot be undone.`
              : 'Are you sure you want to remove this staff member? This action cannot be undone.'
            }
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel 
            className="border-[var(--glass-border)] text-foreground hover:bg-accent"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onDelete}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Remove Staff Member
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
