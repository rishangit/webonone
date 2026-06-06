import { ProductSale, SaleData } from '../types';

const lineRevenue = (quantity: number, unitPrice: number, discount: number) =>
  (unitPrice || 0) * (quantity || 1) * (1 - (discount || 0) / 100);

export const aggregateProductSalesFromSales = (
  sales: SaleData[],
  options?: { companyProductId?: string }
): ProductSale[] => {
  const productMap = new Map<
    string,
    {
      name: string;
      category: string;
      totalSold: number;
      revenue: number;
      prices: number[];
      lastSold: string;
      image?: string;
    }
  >();

  sales.forEach((sale) => {
    sale.items.forEach((item) => {
      if (item.itemType !== 'product') return;

      if (
        options?.companyProductId &&
        item.productId &&
        String(item.productId) !== String(options.companyProductId)
      ) {
        return;
      }

      const productKey = item.productId || item.variantId || item.name;
      const existing = productMap.get(productKey);

      if (existing) {
        existing.totalSold += item.quantity || 1;
        existing.revenue += lineRevenue(item.quantity || 1, item.unitPrice || 0, item.discount || 0);
        existing.prices.push(item.unitPrice || 0);
        if (sale.date > existing.lastSold) {
          existing.lastSold = sale.date;
        }
      } else {
        productMap.set(productKey, {
          name: item.name,
          category: 'Uncategorized',
          totalSold: item.quantity || 1,
          revenue: lineRevenue(item.quantity || 1, item.unitPrice || 0, item.discount || 0),
          prices: [item.unitPrice || 0],
          lastSold: sale.date,
          image: undefined,
        });
      }
    });
  });

  return Array.from(productMap.values())
    .map((product, index) => ({
      id: `PROD-${String(index + 1).padStart(3, '0')}`,
      name: product.name,
      category: product.category,
      totalSold: product.totalSold,
      revenue: product.revenue,
      averagePrice:
        product.prices.length > 0
          ? product.prices.reduce((sum, p) => sum + p, 0) / product.prices.length
          : 0,
      lastSold: product.lastSold,
      image: product.image,
    }))
    .sort((a, b) => b.revenue - a.revenue);
};
