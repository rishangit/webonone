import { ClipboardList, Copy, Edit, Layout, MoreVertical, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CompanyCustomForm } from '@/features/customForms/services/companyCustomForms';

interface CustomFormCardProps {
  form: CompanyCustomForm;
  onEditMeta: (form: CompanyCustomForm) => void;
  onOpenBuilder: (form: CompanyCustomForm) => void;
  onDuplicate: (form: CompanyCustomForm) => void;
  onDelete: (form: CompanyCustomForm) => void;
}

export const CustomFormCard = ({
  form,
  onEditMeta,
  onOpenBuilder,
  onDuplicate,
  onDelete,
}: CustomFormCardProps) => {
  return (
    <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-accent/50 transition-all group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/10">
              <ClipboardList className="w-4 h-4 text-[var(--accent-primary)]" />
            </div>
            <h3 className="text-lg font-semibold text-foreground truncate">{form.name}</h3>
          </div>
          {form.isActive ? (
            <Badge className="mb-2 bg-[var(--accent-bg)] text-[var(--accent-text)] border border-[var(--accent-border)] text-xs">
              Active
            </Badge>
          ) : (
            <Badge variant="secondary" className="mb-2 text-xs">
              Inactive
            </Badge>
          )}
          {form.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{form.description}</p>
          )}
          <p className="text-xs text-muted-foreground mt-2">
            {form.definition?.fields?.length ?? 0} field(s)
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground hover:bg-accent"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="bg-popover border-border"
            align="end"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenuItem onClick={() => onOpenBuilder(form)}>
              <Layout className="w-4 h-4 mr-2" />
              Open builder
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEditMeta(form)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicate(form)}>
              <Copy className="w-4 h-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onDelete(form)}
              className="text-red-600 dark:text-red-400"
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
