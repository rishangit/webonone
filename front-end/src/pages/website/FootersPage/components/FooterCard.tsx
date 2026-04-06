import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PanelBottom, MoreVertical, Pencil, Star, Trash2 } from "lucide-react";
import type { CompanyWebFooter } from "@/services/companyWebFooters";

interface FooterCardProps {
  footer: CompanyWebFooter;
  onEditDesigner: (footer: CompanyWebFooter) => void;
  onSetDefault: (footer: CompanyWebFooter) => void;
  onDelete: (footer: CompanyWebFooter) => void;
}

export const FooterCard = ({
  footer,
  onEditDesigner,
  onSetDefault,
  onDelete,
}: FooterCardProps) => {
  return (
    <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div className="p-2 rounded-lg bg-gradient-to-br from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/10 shrink-0">
            <PanelBottom className="w-4 h-4 text-[var(--accent-primary)]" />
          </div>
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-foreground truncate">{footer.name}</h3>
            <div className="flex flex-wrap items-center gap-2 mt-2">
              {footer.isDefault && (
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
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground hover:bg-accent"
              aria-label="Footer actions"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-52 bg-popover border-border"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenuItem onClick={() => onEditDesigner(footer)}>
              <Pencil className="w-4 h-4 mr-2" />
              Edit with designer
            </DropdownMenuItem>
            {!footer.isDefault && (
              <DropdownMenuItem onClick={() => onSetDefault(footer)}>
                <Star className="w-4 h-4 mr-2" />
                Set as default
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(footer)}
              variant="destructive"
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
