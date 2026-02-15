import { useNavigate } from "react-router-dom";
import { Edit, Trash2, MoreVertical, Eye, Settings, CheckCircle, AlertTriangle, Tag, Users } from "lucide-react";
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

interface SystemProductListItemProps {
  product: SystemProduct;
  onViewProduct?: (productId: string) => void;
  onEdit: (product: SystemProduct) => void;
  onDelete: (product: SystemProduct) => void;
  onToggleStatus: (productId: string) => void;
}

export const SystemProductListItem = ({
  product,
  onViewProduct,
  onEdit,
  onDelete,
  onToggleStatus,
}: SystemProductListItemProps) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/system/system-products/${product.id}`);
  };

  return (
    <Card 
      className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--glass-shadow)] cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <ImageWithFallback
            src={product.imageUrl ? (product.imageUrl.startsWith('http') ? product.imageUrl : formatAvatarUrl(product.imageUrl)) : undefined}
            alt={product.name}
            className="w-20 h-16 object-cover rounded-lg"
            fallbackSrc="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=80&h=64&fit=crop"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div className="min-w-0 flex-1 mr-2">
              <h3 className="font-medium text-foreground text-base sm:text-lg truncate">{product.name}</h3>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              <Badge className={product.isActive ? "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30" : "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30"}>
                {product.isActive ? "Active" : "Inactive"}
              </Badge>
              <Badge className={product.isVerified ? "bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30" : "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30"}>
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
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="w-8 h-8 hover:bg-accent text-muted-foreground hover:text-foreground"
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
                    className="text-red-600 dark:text-red-400"
                    disabled={product.usageCount > 0}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4 flex-shrink-0" />
              <span className="truncate">{product.usageCount} companies</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span className="truncate"><DateDisplay date={product.lastModified} /></span>
            </div>
          </div>

          <p className="text-sm text-foreground mb-3 line-clamp-2">{product.description}</p>

          {/* Tags Section */}
          <div className="flex flex-wrap gap-1">
            {product.tags && product.tags.length > 0 ? (
              <>
                {product.tags.slice(0, 4).map((tag, index) => {
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
                {product.tags.length > 4 && (
                  <Badge variant="outline" className="text-xs">
                    +{product.tags.length - 4} more
                  </Badge>
                )}
              </>
            ) : (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Tag className="w-3 h-3" />
                <span>No tags</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
