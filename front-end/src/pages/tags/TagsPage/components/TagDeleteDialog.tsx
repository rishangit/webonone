import { AlertTriangle } from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { TagDeleteDialogProps } from "../types";

export const TagDeleteDialog = ({ open, onOpenChange, tag, onDelete, loading }: TagDeleteDialogProps) => {
  if (!open || !tag) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] max-w-md w-full mx-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Delete Tag</h3>
            <p className="text-sm text-muted-foreground">This action cannot be undone</p>
          </div>
        </div>
        <p className="text-foreground mb-6">
          Are you sure you want to delete <strong>{tag.name}</strong>? 
          {tag.usageCount > 0 && (
            <span className="block mt-2 text-sm text-yellow-600">
              This tag is currently used {tag.usageCount} {tag.usageCount === 1 ? 'time' : 'times'}. 
              You may want to deactivate it instead.
            </span>
          )}
        </p>
        <div className="flex items-center justify-end gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive"
            onClick={onDelete}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </Card>
    </div>
  );
};
