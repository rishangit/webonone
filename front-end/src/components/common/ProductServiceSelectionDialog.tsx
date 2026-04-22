import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FileText, Package, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CustomDialog } from "@/components/ui/custom-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/components/ui/utils";
import { SearchInput } from "./SearchInput";

export interface ProductSelectionItem {
  id: string;
  name: string;
  description: string;
  price: number;
  inStock: number;
  image?: string;
}

export interface ServiceSelectionItem {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  image?: string;
}

interface ProductServiceSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: ProductSelectionItem[];
  services: ServiceSelectionItem[];
  productsLoading?: boolean;
  servicesLoading?: boolean;
  productsError?: string | null;
  servicesError?: string | null;
  onRetryProducts?: () => void;
  onRetryServices?: () => void;
  onSelectProduct: (product: ProductSelectionItem) => void;
  onSelectService: (service: ServiceSelectionItem) => void;
  formatCurrency: (amount: number) => string;
  initialType?: "products" | "services";
}

const ITEMS_PER_PAGE = 24;

export function ProductServiceSelectionDialog({
  open,
  onOpenChange,
  products,
  services,
  productsLoading = false,
  servicesLoading = false,
  productsError,
  servicesError,
  onRetryProducts,
  onRetryServices,
  onSelectProduct,
  onSelectService,
  formatCurrency,
  initialType = "products",
}: ProductServiceSelectionDialogProps) {
  const [searchType, setSearchType] = useState<"products" | "services">(initialType);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const loadMoreTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    if (!open) {
      setSearchType(initialType);
      setSearchTerm("");
      setDebouncedSearchTerm("");
      setCurrentPage(1);
      setLoadingMore(false);
      if (loadMoreTimeoutRef.current) {
        window.clearTimeout(loadMoreTimeoutRef.current);
        loadMoreTimeoutRef.current = null;
      }
      return;
    }

    setSearchType(initialType);
    setCurrentPage(1);
  }, [open, initialType]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchType, debouncedSearchTerm]);

  useEffect(() => {
    return () => {
      if (loadMoreTimeoutRef.current) {
        window.clearTimeout(loadMoreTimeoutRef.current);
      }
    };
  }, []);

  const filteredProducts = useMemo(() => {
    const query = debouncedSearchTerm.trim().toLowerCase();
    if (!query) return products;

    return products.filter((product) => {
      return (
        product.name.toLowerCase().includes(query) ||
        product.description.toLowerCase().includes(query)
      );
    });
  }, [products, debouncedSearchTerm]);

  const filteredServices = useMemo(() => {
    const query = debouncedSearchTerm.trim().toLowerCase();
    if (!query) return services;

    return services.filter((service) => {
      return (
        service.name.toLowerCase().includes(query) ||
        service.description.toLowerCase().includes(query)
      );
    });
  }, [services, debouncedSearchTerm]);

  const activeItems = searchType === "products" ? filteredProducts : filteredServices;
  const visibleItems = useMemo(() => {
    return activeItems.slice(0, currentPage * ITEMS_PER_PAGE);
  }, [activeItems, currentPage]);
  const hasMore = visibleItems.length < activeItems.length;
  const isInitialLoading = searchType === "products" ? productsLoading : servicesLoading;
  const activeError = searchType === "products" ? productsError : servicesError;

  const handleLoadMore = useCallback(() => {
    if (loadingMore || isInitialLoading || !hasMore) return;

    setLoadingMore(true);
    loadMoreTimeoutRef.current = window.setTimeout(() => {
      setCurrentPage((prev) => prev + 1);
      setLoadingMore(false);
      loadMoreTimeoutRef.current = null;
    }, 250);
  }, [loadingMore, isInitialLoading, hasMore]);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || loadingMore || isInitialLoading || !hasMore) return;

    const distanceFromBottom =
      container.scrollHeight - (container.scrollTop + container.clientHeight);

    if (distanceFromBottom < 120) {
      handleLoadMore();
    }
  }, [loadingMore, isInitialLoading, hasMore, handleLoadMore]);

  return (
    <CustomDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add Items to Bill"
      description="Search and add products or services to the appointment bill"
      icon={<Search className="w-5 h-5" />}
      sizeWidth="medium"
      sizeHeight="large"
      footer={
        <Button
          type="button"
          variant="outline"
          size="default"
          onClick={() => onOpenChange(false)}
          className="h-10 px-4 border-[var(--glass-border)] text-foreground hover:bg-accent"
        >
          Close
        </Button>
      }
    >
      <div className="h-full min-h-0 flex flex-col gap-4">
        <div className="flex gap-3">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            onDebouncedChange={setDebouncedSearchTerm}
            debounceDelay={300}
            placeholder={`Search ${searchType}...`}
            className="flex-1"
          />
          <Select value={searchType} onValueChange={(value: "products" | "services") => setSearchType(value)}>
            <SelectTrigger className="w-36 bg-[var(--glass-bg)] border-[var(--glass-border)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="products">Products</SelectItem>
              <SelectItem value="services">Services</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 min-h-0 overflow-y-auto custom-scrollbar border border-[var(--glass-border)] rounded-md bg-[var(--glass-bg)] p-3"
        >
          {isInitialLoading ? (
            <div className="h-full min-h-[240px] flex items-center justify-center text-sm text-muted-foreground">
              Loading {searchType}...
            </div>
          ) : activeError ? (
            <div className="h-full min-h-[240px] flex flex-col items-center justify-center text-center px-4">
              <p className="text-sm text-destructive mb-2">Failed to load {searchType}</p>
              <p className="text-xs text-muted-foreground mb-4">{activeError}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={searchType === "products" ? onRetryProducts : onRetryServices}
                className="h-9"
              >
                Retry
              </Button>
            </div>
          ) : visibleItems.length === 0 ? (
            <div className="h-full min-h-[240px] flex flex-col items-center justify-center text-center px-4">
              {searchType === "products" ? (
                <Package className="w-8 h-8 text-muted-foreground opacity-60 mb-2" />
              ) : (
                <FileText className="w-8 h-8 text-muted-foreground opacity-60 mb-2" />
              )}
              <p className="text-sm text-muted-foreground">
                No {searchType} found{debouncedSearchTerm ? ` for "${debouncedSearchTerm}"` : ""}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 auto-rows-max">
                {searchType === "products"
                  ? (visibleItems as ProductSelectionItem[]).map((product) => (
                      <Card
                        key={product.id}
                        onClick={() => onSelectProduct(product)}
                        className={cn(
                          "p-3 hover:bg-accent/50 cursor-pointer transition-all duration-200 hover:shadow-md",
                          "border-[var(--glass-border)]"
                        )}
                      >
                        <div className="aspect-square mb-2 bg-muted rounded-lg overflow-hidden relative">
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="w-6 h-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                        <h4 className="text-sm font-medium text-foreground truncate mb-1" title={product.name}>
                          {product.name}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 min-h-8 mb-2">
                          {product.description || "No description"}
                        </p>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-[var(--accent-text)]">
                            {formatCurrency(product.price)}
                          </p>
                          <Badge variant="outline" className="text-[10px]">
                            {product.inStock} in stock
                          </Badge>
                        </div>
                      </Card>
                    ))
                  : (visibleItems as ServiceSelectionItem[]).map((service) => (
                      <Card
                        key={service.id}
                        onClick={() => onSelectService(service)}
                        className={cn(
                          "p-3 hover:bg-accent/50 cursor-pointer transition-all duration-200 hover:shadow-md",
                          "border-[var(--glass-border)]"
                        )}
                      >
                        <div className="aspect-square mb-2 bg-muted rounded-lg overflow-hidden relative flex items-center justify-center">
                          {service.image ? (
                            <img
                              src={service.image}
                              alt={service.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <FileText className="w-6 h-6 text-muted-foreground" />
                          )}
                        </div>
                        <h4 className="text-sm font-medium text-foreground truncate mb-1" title={service.name}>
                          {service.name}
                        </h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 min-h-8 mb-2">
                          {service.description || "No description"}
                        </p>
                        <div className="space-y-1">
                          <p className="text-sm font-semibold text-[var(--accent-text)]">
                            {formatCurrency(service.price)}
                          </p>
                          <Badge variant="outline" className="text-[10px]">
                            {service.duration} min
                          </Badge>
                        </div>
                      </Card>
                    ))}
              </div>
              {loadingMore && (
                <div className="text-center text-xs text-muted-foreground py-2">Loading more items...</div>
              )}
              {!hasMore && activeItems.length > ITEMS_PER_PAGE && !loadingMore && (
                <div className="text-center text-xs text-muted-foreground py-2">No more items to load</div>
              )}
            </div>
          )}
        </div>
      </div>
    </CustomDialog>
  );
}
