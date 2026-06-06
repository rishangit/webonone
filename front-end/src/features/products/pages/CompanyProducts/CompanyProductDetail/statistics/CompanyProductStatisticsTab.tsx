import { useState } from "react";
import { DollarSign, Package, TrendingUp, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CardTitle } from "@/components/common/CardTitle";
import { DateDisplay } from "@/components/common/DateDisplay";
import { EmptyState } from "@/components/common/EmptyState";
import { CompanyProductVariant } from "@/features/products/services/companyProductVariants";
import { useProductSalesStats } from "@/shared/hooks/productSalesStats";

interface CompanyProductStatisticsTabProps {
  companyProductId: string;
  productName: string;
  variants: CompanyProductVariant[];
}

export const CompanyProductStatisticsTab = ({
  companyProductId,
  productName,
  variants,
}: CompanyProductStatisticsTabProps) => {
  const [dateRange, setDateRange] = useState("all");
  const { stats, loading, error, formatCurrency } = useProductSalesStats(companyProductId, dateRange);

  const hasSales = stats && (stats.totalSold > 0 || stats.revenue > 0);

  return (
    <div className="space-y-6">
      <Card className="p-4 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
        <div className="max-w-xs space-y-2">
          <Label htmlFor="product-stats-date-range" className="text-sm font-medium text-foreground">
            Date Range
          </Label>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger
              id="product-stats-date-range"
              className="w-full bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="all">All time</SelectItem>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="90days">Last 90 Days</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="p-4 h-24 animate-pulse bg-[var(--glass-bg)] border border-[var(--glass-border)]" />
          ))}
        </div>
      ) : error ? (
        <Card className="p-6 bg-[var(--glass-bg)] border border-[var(--glass-border)]">
          <p className="text-destructive text-sm">{error}</p>
        </Card>
      ) : !hasSales ? (
        <EmptyState
          icon={Package}
          title="No Product Sales"
          description={`No sales recorded for ${productName} in the selected date range.`}
        />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-4 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
              <p className="text-sm text-muted-foreground mb-1">Total Sold</p>
              <p className="text-2xl font-semibold text-foreground">{stats?.totalSold ?? 0}</p>
            </Card>
            <Card className="p-4 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
              <p className="text-sm text-muted-foreground mb-1">Revenue</p>
              <p className="text-2xl font-semibold text-[var(--accent-text)]">
                {formatCurrency(stats?.revenue ?? 0)}
              </p>
            </Card>
            <Card className="p-4 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
              <p className="text-sm text-muted-foreground mb-1">Average Price</p>
              <p className="text-2xl font-semibold text-foreground">
                {formatCurrency(stats?.averagePrice ?? 0)}
              </p>
            </Card>
            <Card className="p-4 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
              <p className="text-sm text-muted-foreground mb-1">Last Sold</p>
              <p className="text-lg font-semibold text-foreground">
                {stats?.lastSold ? <DateDisplay date={stats.lastSold} /> : "—"}
              </p>
            </Card>
          </div>

          <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
            <CardTitle title="Performance Metrics" icon={TrendingUp} />
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-[var(--accent-bg)]/10 border border-[var(--accent-border)]/20">
                <div className="p-2 rounded-lg bg-[var(--accent-bg)]">
                  <DollarSign className="w-5 h-5 text-[var(--accent-text)]" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Revenue</p>
                  <p className="text-xl font-semibold text-[var(--accent-text)]">
                    {formatCurrency(stats?.revenue ?? 0)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-[var(--accent-bg)]/10 border border-[var(--accent-border)]/20">
                <div className="p-2 rounded-lg bg-[var(--accent-bg)]">
                  <Calendar className="w-5 h-5 text-[var(--accent-text)]" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Units Sold</p>
                  <p className="text-xl font-semibold text-foreground">{stats?.totalSold ?? 0}</p>
                </div>
              </div>
            </div>
          </Card>

          {stats && stats.byVariant.length > 0 && (
            <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
              <CardTitle title="Variant Breakdown" icon={Package} />
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--glass-border)] text-muted-foreground text-left">
                      <th className="pb-2 pr-4 font-medium">Variant</th>
                      <th className="pb-2 pr-4 font-medium text-right">Units Sold</th>
                      <th className="pb-2 font-medium text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.byVariant.map((row) => {
                      const variantLabel =
                        variants.find((v) => v.id === row.variantId)?.name || row.variantName;
                      return (
                        <tr key={row.variantId} className="border-b border-[var(--glass-border)]/50">
                          <td className="py-3 pr-4 text-foreground">{variantLabel}</td>
                          <td className="py-3 pr-4 text-right text-foreground">{row.totalSold}</td>
                          <td className="py-3 text-right text-[var(--accent-text)]">
                            {formatCurrency(row.revenue)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
};
