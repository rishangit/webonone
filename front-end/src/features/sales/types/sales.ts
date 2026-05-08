export interface SaleItem {
  id?: string;
  name: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  itemType?: 'service' | 'product';
  serviceId?: string;
  productId?: string;
  variantId?: string;
}

export interface SaleData {
  id: string;
  type: 'appointment' | 'product';
  date: string;
  customerName: string;
  customerImage?: string;
  items: SaleItem[];
  totalAmount: number;
  status: 'completed' | 'processing' | 'refunded';
  paymentMethod: string;
  staffMember?: string;
  notes?: string;
}

export interface ProductSale {
  id: string;
  name: string;
  category: string;
  totalSold: number;
  revenue: number;
  averagePrice: number;
  lastSold: string;
  image?: string;
}

export interface SalesStatsProps {
  totalRevenue: number;
  appointmentRevenue: number;
  productRevenue: number;
  totalTransactions: number;
  formatCurrency: (amount: number) => string;
}

export interface SalesCardProps {
  sale: SaleData;
  formatCurrency: (amount: number) => string;
  onViewDetails: (saleId: string) => void;
  onDeleteSale: (saleId: string) => void;
  onDeleteItem: (saleId: string, itemId: string) => void;
  isCompanyOwner: boolean;
}

export interface ProductSaleCardProps {
  product: ProductSale;
  formatCurrency: (amount: number) => string;
}

export interface SalesFiltersProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dateRange: string;
  onDateRangeChange: (value: string) => void;
  filterType: string;
  onFilterTypeChange: (value: string) => void;
  filterStatus: string;
  onFilterStatusChange: (value: string) => void;
  activeTab: "sales" | "products";
  hasActiveFilters: boolean;
  resultsCount: number;
  onClearFilters: () => void;
}
