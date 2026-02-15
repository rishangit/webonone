import { useNavigate } from "react-router-dom";
import { Edit, Trash2, MoreVertical, Eye, Settings, CheckCircle, AlertTriangle, Tag } from "lucide-react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "../../../components/ui/dropdown-menu";
import { ImageWithFallback } from "../../../components/figma/ImageWithFallback";
import { DateDisplay } from "../../../components/common/DateDisplay";
import { formatAvatarUrl } from "../../../utils";
import { Tag as TagType } from "../../../services/products";

interface SystemProduct {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  isVerified: boolean;
  usageCount: number;
  createdDate: string;
  lastModified: string;
  tags: string[] | TagType[];
  companyProductId?: string;
  systemProductId?: string;
  type?: 'sell' | 'service' | 'both';
  costPrice?: number;
  sellPrice?: number;
  currentStock?: number;
  minStock?: number;
  maxStock?: number;
  stockUnit?: string;
  isAvailableForPurchase?: boolean;
  notes?: string;
}

interface SystemProductCardProps {
  product: SystemProduct;
  onViewProduct?: (productId: string) => void;
  onEdit: (product: SystemProduct) => void;
  onDelete: (product: SystemProduct) => void;
  onToggleStatus: (productId: string) => void;
}

export const SystemProductCard = ({
  product,
  onViewProduct,
  onEdit,
  onDelete,
  onToggleStatus,
}: SystemProductCardProps) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/system/system-products/${product.id}`);
  };

  return (
    <Card 
      className="overflow-hidden backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-300 hover:shadow-lg hover:shadow-[var(--glass-shadow)] group cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="relative h-48 overflow-hidden">
        <ImageWithFallback
          src={product.imageUrl ? (product.imageUrl.startsWith('http') ? product.imageUrl : formatAvatarUrl(product.imageUrl)) : undefined}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          fallbackSrc="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop"
        />
        <div className="absolute top-3 right-3 flex gap-1 flex-wrap">
          <Badge className={product.isActive ? "bg-green-500/20 text-green-400 backdrop-blur-sm border border-green-500/30" : "bg-gray-500/20 text-gray-400 backdrop-blur-sm border border-gray-500/30"}>
            {product.isActive ? "Active" : "Inactive"}
          </Badge>
          <Badge className={product.isVerified ? "bg-purple-500/20 text-purple-600 dark:text-purple-400 backdrop-blur-sm border border-purple-500/30" : "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 backdrop-blur-sm border border-yellow-500/30"}>
            {product.isVerified ? (
              <>
                <CheckCircle className="w-3 h-3 mr-1" />
                Verified
              </>
            ) : (
              <>
                <AlertTriangle className="w-3 h-3 mr-1" />
                Unverified
              </>
            )}
          </Badge>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-card-foreground mb-1 truncate">{product.name}</h3>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-card-foreground hover:bg-sidebar-accent flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-popover border-border" align="end">
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onViewProduct?.(product.id); }}>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(product); }}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Product
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onToggleStatus(product.id); }}>
                <Settings className="w-4 h-4 mr-2" />
                {product.isActive ? "Deactivate" : "Activate"}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={(e) => { e.stopPropagation(); onDelete(product); }}
                className="text-red-500 hover:bg-red-500/10"
                disabled={product.usageCount > 0}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Usage:</span>
            <span className="text-card-foreground">{product.usageCount} companies</span>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        </div>

        {/* Tags Section */}
        <div className="mb-4">
          {product.tags && product.tags.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {product.tags.slice(0, 3).map((tag, index) => {
                // Handle both string tags (legacy) and Tag objects
                const tagObj = typeof tag === 'string' 
                  ? { id: index, name: tag, color: '#3B82F6', icon: undefined }
                  : tag;
                return (
                  <Badge
                    key={tagObj.id || index}
                    variant="secondary"
                    className="text-xs"
                    style={{ 
                      backgroundColor: `${tagObj.color}20`, 
                      color: tagObj.color,
                      borderColor: `${tagObj.color}40`
                    }}
                  >
                    {tagObj.icon && <span className="mr-1">{tagObj.icon}</span>}
                    {tagObj.name}
                  </Badge>
                );
              })}
              {product.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{product.tags.length - 3}
                </Badge>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Tag className="w-3 h-3" />
              <span>No tags assigned</span>
            </div>
          )}
        </div>

        <div className="pt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Modified: <DateDisplay date={product.lastModified} /></span>
            <span>ID: {product.id}</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
