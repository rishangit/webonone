import { Stethoscope, Pencil, Trash2, Eye, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CardGridKebabSlot } from "@/components/common/CardGridKebabSlot";
import {
  CardKebabTrigger,
  LIST_CARD_GRID_SHELL,
  LIST_CARD_HERO_HEIGHT_CLASS,
  LIST_CARD_LIST_SHELL,
} from "@/components/common/CardKebabTrigger";
import {
  ListCardContent,
  ListCardCoverImage,
  ListCardDetailDivider,
  ListCardDetailField,
  ListCardDetailGrid,
  ListCardDetailsHeader,
  ListCardMediaColumn,
  CARD_PRICE_TEXT_CLASS,
  ListCardPriceFooter,
} from "@/components/common/ListCardLayout";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
      className={viewMode === "grid" ? LIST_CARD_GRID_SHELL : LIST_CARD_LIST_SHELL}
      onClick={() => onView(service)}
    >
      {viewMode === "grid" ? (
        <>
          <div className={`relative ${LIST_CARD_HERO_HEIGHT_CLASS} bg-muted overflow-hidden`}>
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
            <CardGridKebabSlot>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <CardKebabTrigger variant="overlay" />
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
            </CardGridKebabSlot>
          </div>
          <div className="p-6">
            <h3 className="font-semibold text-foreground truncate">{service.name}</h3>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2 min-h-[40px]">
              {service.description || "No description provided"}
            </p>
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Used by {service.usageCount || 0}</span>
              {service.defaultPrice != null && (
                <span className={CARD_PRICE_TEXT_CLASS}>
                  ${Number(service.defaultPrice).toFixed(2)}
                </span>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          <ListCardMediaColumn>
            {primaryImage ? (
              <ListCardCoverImage src={primaryImageUrl} alt={service.name} />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                <Stethoscope className="w-8 h-8" />
              </div>
            )}
          </ListCardMediaColumn>
          <ListCardContent>
            <ListCardDetailsHeader
              title={service.name}
              description={service.description || "No description provided"}
              status={
                <Badge className={service.isActive ? "bg-green-500/20 text-green-600 border-green-500/30" : "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30"}>
                  {service.isActive ? "Active" : "Inactive"}
                </Badge>
              }
              actions={
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <CardKebabTrigger variant="default" />
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
              }
            />
            <ListCardDetailGrid>
              <ListCardDetailField
                icon={Users}
                label="Used by"
                value={`${service.usageCount || 0} companies`}
              />
              <ListCardDetailField label="ID" value={service.id} />
            </ListCardDetailGrid>
            <ListCardDetailDivider />
            <ListCardDetailGrid>
              <ListCardDetailField label="Verified" value={service.isVerified ? "Yes" : "No"} />
              <ListCardDetailField label="Duration" value={service.defaultDuration ? `${service.defaultDuration} min` : "—"} />
              <ListCardDetailField label="Tags" value={service.tags?.length ? `${service.tags.length} assigned` : "—"} />
            </ListCardDetailGrid>
            {service.defaultPrice != null ? (
              <ListCardPriceFooter label={`$${Number(service.defaultPrice).toFixed(2)}`} />
            ) : null}
          </ListCardContent>
        </>
      )}
    </Card>
  );
}
