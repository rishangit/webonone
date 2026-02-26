import { ArrowLeft, FileText, Edit, Trash2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../components/ui/dropdown-menu";
import { Service } from "../../../services/services";

interface ServiceDetailHeaderProps {
  service: Service;
  isCompanyOwner: boolean;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const ServiceDetailHeader = ({
  service,
  isCompanyOwner,
  onBack,
  onEdit,
  onDelete,
}: ServiceDetailHeaderProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-50 border-green-200 text-green-700 dark:bg-green-950 dark:border-green-800 dark:text-green-300";
      case "Inactive":
        return "bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300";
      case "Draft":
        return "bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-300";
      default:
        return "bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        <Button
          variant="outline"
          size="sm"
          onClick={onBack}
          className="border-[var(--glass-border)] text-foreground hover:bg-[var(--accent-bg)] flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold text-foreground break-words">{service.name}</h1>
          <p className="text-sm text-muted-foreground truncate">Service ID: {service.id}</p>
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
                Edit Service
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                onClick={onDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Service
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
};
