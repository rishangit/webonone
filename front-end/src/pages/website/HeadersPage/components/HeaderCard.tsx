import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LayoutPanelTop, MoreVertical, Pencil, Star, Trash2 } from "lucide-react";
import type { CompanyWebHeader } from "@/services/companyWebHeaders";

interface HeaderCardProps {
  header: CompanyWebHeader;
  onEditDesigner: (header: CompanyWebHeader) => void;
  onSetDefault: (header: CompanyWebHeader) => void;
  onDelete: (header: CompanyWebHeader) => void;
}

export const HeaderCard = ({
  header,
  onEditDesigner,
  onSetDefault,
  onDelete,
}: HeaderCardProps) => {
  return (
    <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="p-2 rounded-lg bg-gradient-to-br from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/10 shrink-0">
            <LayoutPanelTop className="w-4 h-4 text-[var(--accent-primary)]" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-foreground truncate">{header.name}</h3>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {header.isDefault && (
                <Badge className="bg-[var(--accent-bg)] text-[var(--accent-text)] border border-[var(--accent-border)] px-2 py-0.5 text-xs font-semibold">
                  Default
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Used on the public site when set as default.
            </p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0 h-9 w-9" aria-label="Header actions">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-52 border-[var(--glass-border)] bg-[var(--glass-bg)]">
            <DropdownMenuItem
              className="cursor-pointer"
              onClick={() => onEditDesigner(header)}
            >
              <Pencil className="w-4 h-4 mr-2" />
              Edit with designer
            </DropdownMenuItem>
            {!header.isDefault && (
              <DropdownMenuItem className="cursor-pointer" onClick={() => onSetDefault(header)}>
                <Star className="w-4 h-4 mr-2" />
                Set as default
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:text-destructive"
              onClick={() => onDelete(header)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </Card>
  );
};
