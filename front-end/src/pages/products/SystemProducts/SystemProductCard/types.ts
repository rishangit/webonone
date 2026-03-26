import { Tag } from "@/services/products";

export interface SystemProduct {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  isVerified: boolean;
  usageCount: number;
  createdDate: string;
  lastModified: string;
  tags: string[] | Tag[];
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

export interface SystemProductCardProps {
  product: SystemProduct;
  onViewProduct?: (productId: string) => void;
  onEdit: (product: SystemProduct) => void;
  onDelete: (product: SystemProduct) => void;
  onToggleStatus: (productId: string) => void;
  viewMode?: "grid" | "list";
}

export interface SystemProductViewProps {
  product: SystemProduct;
  onViewProduct?: (productId: string) => void;
  onEdit: (product: SystemProduct) => void;
  onDelete: (product: SystemProduct) => void;
  onToggleStatus: (productId: string) => void;
}

export interface ProductImageProps {
  imageUrl: string;
  productName: string;
  variant?: "grid" | "list";
}

export interface ProductStatusProps {
  isActive: boolean;
  isVerified: boolean;
  variant?: "grid" | "list";
}

export interface ProductActionsProps {
  product: SystemProduct;
  onViewProduct?: (productId: string) => void;
  onEdit: (product: SystemProduct) => void;
  onDelete: (product: SystemProduct) => void;
  onToggleStatus: (productId: string) => void;
}

export interface ProductTagsProps {
  tags: string[] | Tag[];
  variant?: "grid" | "list";
}

export interface ProductInfoProps {
  product: SystemProduct;
  variant?: "grid" | "list";
}
