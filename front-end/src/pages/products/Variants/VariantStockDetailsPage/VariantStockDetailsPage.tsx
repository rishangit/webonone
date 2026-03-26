import { useState } from "react";
import { ArrowLeft, Warehouse, Plus } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BackButton } from "@/components/common/BackButton";
import { toast } from "sonner";
import { companyProductVariantsService } from "@/services/companyProductVariants";
import { companyProductStockService, CreateCompanyProductStockData } from "@/services/companyProductStock";
import { useVariantStockDetails } from "./hooks/useVariantStockDetails";
import { formatPrice } from "./utils";
import { VariantStockDetailsPageProps } from "./types";
import {
  StockOverview,
  StockEntriesList,
  VariantInfoSidebar,
  StockAlert,
  AddStockDialog,
  EditStockDialog,
} from "./components";

export const VariantStockDetailsPage = ({ productId, variantId, onBack }: VariantStockDetailsPageProps) => {
  const {
    variant,
    stockEntries,
    totalStock,
    loading,
    companyCurrency,
    currentCompanyProduct,
    users,
    refreshStockData
  } = useVariantStockDetails(productId, variantId);

  const [isAddStockDialogOpen, setIsAddStockDialogOpen] = useState(false);
  const [isEditStockDialogOpen, setIsEditStockDialogOpen] = useState(false);
  const [editingStockEntry, setEditingStockEntry] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUserSelectionDialogOpen, setIsUserSelectionDialogOpen] = useState(false);

  const formatPriceWithCurrency = (price: number | undefined | null) => formatPrice(price, companyCurrency);

  const onSubmitAddStock = async (data: any) => {
    if (!variantId) return;
    
    setIsSubmitting(true);
    try {
      const stockData: CreateCompanyProductStockData = {
        variantId,
        quantity: data.quantity!,
        costPrice: data.costPrice!,
        sellPrice: data.sellPrice || null,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate).toISOString().split('T')[0] : null,
        expiryDate: data.expiryDate ? new Date(data.expiryDate).toISOString().split('T')[0] : null,
        supplierId: data.supplierId || null,
        batchNumber: data.batchNumber || null,
      };

      await companyProductStockService.createStock(stockData);
      toast.success("Stock added successfully");
      setIsAddStockDialogOpen(false);
      await refreshStockData();
    } catch (error: any) {
      console.error("Error adding stock:", error);
      toast.error(error.message || "Failed to add stock");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditStock = (entry: any) => {
    setEditingStockEntry(entry);
    setIsEditStockDialogOpen(true);
  };

  const onSubmitEditStock = async (data: any) => {
    if (!variantId || !editingStockEntry) return;
    
    setIsSubmitting(true);
    try {
      await companyProductStockService.updateStock(editingStockEntry.id, {
        quantity: data.quantity!,
        costPrice: data.costPrice!,
        sellPrice: data.sellPrice || null,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate).toISOString().split('T')[0] : null,
        expiryDate: data.expiryDate ? new Date(data.expiryDate).toISOString().split('T')[0] : null,
        supplierId: data.supplierId || null,
        batchNumber: data.batchNumber || null,
      });
      toast.success("Stock updated successfully");
      setIsEditStockDialogOpen(false);
      setEditingStockEntry(null);
      await refreshStockData();
    } catch (error: any) {
      console.error("Error updating stock:", error);
      toast.error(error.message || "Failed to update stock");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteStock = async (entryId: string) => {
    if (!confirm("Are you sure you want to delete this stock entry? This action cannot be undone.")) {
      return;
    }
    
    try {
      await companyProductStockService.deleteStock(entryId);
      toast.success("Stock entry deleted successfully");
      await refreshStockData();
    } catch (error: any) {
      console.error("Error deleting stock:", error);
      toast.error(error.message || "Failed to delete stock entry");
    }
  };

  const handleSetAsActive = async (entryId: string) => {
    try {
      await companyProductVariantsService.updateVariant(variantId, {
        activeStockId: entryId
      });
      toast.success("Active stock updated");
      await refreshStockData();
    } catch (error: any) {
      console.error("Error setting active stock:", error);
      toast.error(error.message || "Failed to set active stock");
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-4 lg:p-6 flex items-center justify-center">
        <Card className="p-8 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] text-center">
          <div className="flex flex-col items-center gap-3">
            <Warehouse className="w-12 h-12 text-muted-foreground animate-pulse" />
            <h3 className="text-lg font-semibold text-foreground">Loading stock details...</h3>
            <p className="text-muted-foreground">Please wait while we fetch the data</p>
          </div>
        </Card>
      </div>
    );
  }

  if (!variant) {
    return (
      <div className="flex-1 p-4 lg:p-6 flex items-center justify-center">
        <Card className="p-8 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] text-center">
          <div className="flex flex-col items-center gap-3">
            <Warehouse className="w-12 h-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground">Variant not found</h3>
            <p className="text-muted-foreground mb-4">The variant you're looking for doesn't exist.</p>
            <Button onClick={onBack} variant="accent">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Product
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const isOutOfStock = totalStock === 0;
  const totalCostValue = stockEntries.reduce((sum, entry) => sum + (entry.quantity * entry.costPrice), 0);
  const totalSellValue = stockEntries
    .filter(entry => entry.sellPrice !== null && entry.sellPrice !== undefined)
    .reduce((sum, entry) => sum + (entry.quantity * (entry.sellPrice || 0)), 0);

  const productImageUrl = currentCompanyProduct?.imageUrl 
    ? (currentCompanyProduct.imageUrl.startsWith('http') 
        ? currentCompanyProduct.imageUrl 
        : undefined)
    : undefined;

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <BackButton onClick={onBack} size="icon" label="" />
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Stock Details</h1>
            <p className="text-muted-foreground mt-1 text-sm sm:text-base">
              {currentCompanyProduct?.name} - {variant.name}
            </p>
          </div>
        </div>
        <Button
          onClick={() => setIsAddStockDialogOpen(true)}
          variant="accent"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Stock
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <StockOverview
            totalStock={totalStock}
            activeStockQuantity={variant?.activeStock?.quantity || 0}
            stockEntriesCount={stockEntries.length}
            totalCostValue={totalCostValue}
            totalSellValue={totalSellValue}
            formatPrice={formatPriceWithCurrency}
            isOutOfStock={isOutOfStock}
          />

          <StockEntriesList
            entries={stockEntries}
            variant={variant}
            formatPrice={formatPriceWithCurrency}
            onAddStock={() => setIsAddStockDialogOpen(true)}
            onEdit={handleEditStock}
            onDelete={handleDeleteStock}
            onSetAsActive={handleSetAsActive}
          />
        </div>

        <div className="space-y-6">
          <VariantInfoSidebar
            variant={variant}
            productName={currentCompanyProduct?.name}
            productImageUrl={productImageUrl}
          />

          <StockAlert isOutOfStock={isOutOfStock} />
        </div>
      </div>

      <AddStockDialog
        open={isAddStockDialogOpen}
        onOpenChange={setIsAddStockDialogOpen}
        variantName={variant.name}
        onSubmit={onSubmitAddStock}
        isSubmitting={isSubmitting}
        users={users}
        onUserSelectionDialogOpen={() => setIsUserSelectionDialogOpen(true)}
        isUserSelectionDialogOpen={isUserSelectionDialogOpen}
      />

      <EditStockDialog
        open={isEditStockDialogOpen}
        onOpenChange={(open) => {
          setIsEditStockDialogOpen(open);
          if (!open) {
            setEditingStockEntry(null);
          }
        }}
        variantName={variant.name}
        editingStockEntry={editingStockEntry}
        onSubmit={onSubmitEditStock}
        isSubmitting={isSubmitting}
        users={users}
        onUserSelectionDialogOpen={() => setIsUserSelectionDialogOpen(true)}
        isUserSelectionDialogOpen={isUserSelectionDialogOpen}
      />
    </div>
  );
};
