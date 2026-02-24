import { Bug, Sparkles } from "lucide-react";
import { CustomDialog } from "../../components/ui/custom-dialog";
import { Badge } from "../../components/ui/badge";
import { BacklogItem } from '../../services/backlog';
import { formatAvatarUrl } from "../../utils";

interface BacklogViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: BacklogItem | null;
}

export const BacklogViewDialog = ({ 
  open, 
  onOpenChange, 
  item
}: BacklogViewDialogProps) => {
  if (!item) return null;

  const TypeIcon = item.type === 'Issue' ? Bug : Sparkles;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New':
        return 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30';
      case 'Active':
        return 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30';
      case 'Done':
        return 'bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30';
      default:
        return '';
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'Urgent':
        return 'bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30';
      case 'High':
        return 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30';
      case 'Medium':
        return 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30';
      case 'Low':
        return 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border border-gray-500/30';
      default:
        return 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border border-gray-500/30';
    }
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  return (
    <CustomDialog 
      open={open} 
      onOpenChange={onOpenChange}
      title="View Backlog Item"
      description="View details of the issue or feature request"
      icon={<TypeIcon className="w-5 h-5" />}
      maxWidth="max-w-3xl"
      footer={
        <div className="flex items-center justify-end">
          <button
            onClick={() => onOpenChange(false)}
            className="px-4 py-2 text-sm font-medium text-foreground bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-md hover:bg-accent transition-colors"
          >
            Close
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            <div 
              className={`w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0 ${
                item.type === 'Issue' 
                  ? 'bg-red-500/20 text-red-600 dark:text-red-400' 
                  : 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
              }`}
            >
              <TypeIcon className="w-8 h-8" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-semibold text-foreground mb-2">{item.title}</h2>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={getStatusColor(item.status)}>
                  {item.status}
                </Badge>
                <Badge className={getPriorityColor(item.priority)}>
                  {item.priority || 'Medium'}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {item.type}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-foreground">Description</h3>
          <div className="p-4 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg">
            <p className="text-foreground whitespace-pre-wrap">{item.description}</p>
          </div>
        </div>

        {/* Screenshot */}
        {item.screenshotPath && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-foreground">Screenshot</h3>
            <div className="border border-[var(--glass-border)] rounded-lg overflow-hidden">
              <img 
                src={formatAvatarUrl(item.screenshotPath)} 
                alt="Screenshot" 
                className="w-full h-auto max-h-96 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          </div>
        )}

        {/* Metadata */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[var(--glass-border)]">
          <div>
            <p className="text-sm text-muted-foreground mb-1">Created</p>
            <p className="text-sm font-medium text-foreground">{formatDate(item.createdAt)}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground mb-1">Last Updated</p>
            <p className="text-sm font-medium text-foreground">{formatDate(item.updatedAt)}</p>
          </div>
          {item.creator && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Created By</p>
              <p className="text-sm font-medium text-foreground">{item.creator.name}</p>
            </div>
          )}
        </div>
      </div>
    </CustomDialog>
  );
};
