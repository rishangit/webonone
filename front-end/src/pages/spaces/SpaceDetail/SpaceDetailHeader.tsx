import { FileText, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { BackButton } from "@/components/common/BackButton";
import { Space } from "@/services/spaces";

interface SpaceDetailHeaderProps {
  space: Space;
  isCompanyOwner: boolean;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const SpaceDetailHeader = ({
  space,
  isCompanyOwner,
  onBack,
  onEdit,
  onDelete,
}: SpaceDetailHeaderProps) => {

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <BackButton onClick={onBack} />
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold text-foreground break-words">{space.name}</h1>
          <p className="text-sm text-muted-foreground truncate">Space ID: {space.id}</p>
        </div>
      </div>
      {isCompanyOwner && (
        <div className="flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-[var(--glass-border)]">
                <FileText className="w-4 h-4 mr-2" />
                Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover border-border">
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Space
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                onClick={onDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Space
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
};
