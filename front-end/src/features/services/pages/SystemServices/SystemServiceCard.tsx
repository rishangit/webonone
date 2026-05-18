import { Stethoscope, MoreVertical, Pencil, Trash2, Eye } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/components/ui/utils";
import { formatAvatarUrl } from "@/shared/utils";
import type { SystemService } from "@/features/services/services/systemServices";
import { getPrimaryImagePath } from "@/features/services/utils/serviceMedia";

export interface SystemServiceCardProps {
  service: SystemService;
  viewMode: "grid" | "list";
  onView: (service: SystemService) => void;
  onEdit: (service: SystemService) => void;
  onDelete: (service: SystemService) => void;
}

export function SystemServiceCard({ service, viewMode, onView, onEdit, onDelete }: SystemServiceCardProps) {
  const primaryImage = getPrimaryImagePath(service.images, service.image);
  const primaryImageUrl = primaryImage ? formatAvatarUrl(primaryImage) : "";

  return (
    <Card
      className={cn(
        "overflow-hidden backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] cursor-pointer hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200",
        viewMode === "list" && "p-4"
      )}
      onClick={() => onView(service)}
    >
      {viewMode === "grid" ? (
        <>
          <div className="relative h-40 bg-muted">
            {primaryImage ? (
              <img src={primaryImageUrl} alt={service.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <Stethoscope className="w-8 h-8" />
              </div>
            )}
            <div className="absolute top-3 left-3 flex gap-2">
              <Badge className={service.isActive ? "bg-green-500/20 text-green-600" : "bg-gray-500/20 text-gray-200"}>
                {service.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <div className="absolute top-3 right-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm border border-white/20"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-popover border-border" align="end" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenuItem onClick={() => onView(service)}>
                    <Eye className="w-4 h-4 mr-2" />
                    View details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(service)}>
                    <Pencil className="w-4 h-4 mr-2" />
                    Edit Service
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onDelete(service)} className="text-red-600 dark:text-red-400">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Service
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="p-4">
            <h3 className="font-semibold text-foreground truncate">{service.name}</h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2 min-h-[40px]">
              {service.description || "No description provided"}
            </p>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Used by {service.usageCount || 0}</span>
              {service.defaultPrice != null && (
                <span className="font-medium text-foreground">${Number(service.defaultPrice).toFixed(2)}</span>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="flex items-start gap-4">
          <div className="w-20 h-16 rounded-md bg-muted overflow-hidden flex-shrink-0">
            {primaryImage ? (
              <img src={primaryImageUrl} alt={service.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <Stethoscope className="w-5 h-5" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-semibold text-foreground truncate">{service.name}</h3>
              <div className="flex items-center gap-2">
                <Badge className={service.isActive ? "bg-green-500/20 text-green-600" : "bg-gray-500/20 text-gray-200"}>
                  {service.isActive ? "Active" : "Inactive"}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-popover border-border" align="end" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenuItem onClick={() => onView(service)}>
                      <Eye className="w-4 h-4 mr-2" />
                      View details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEdit(service)}>
                      <Pencil className="w-4 h-4 mr-2" />
                      Edit Service
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onDelete(service)} className="text-red-600 dark:text-red-400">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Service
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{service.description || "No description provided"}</p>
          </div>
        </div>
      )}
    </Card>
  );
}
