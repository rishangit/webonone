import { DollarSign, Users, Package, TrendingUp } from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { Carousel, CarouselContent, CarouselItem } from "../../../../components/ui/carousel";
import { SalesStatsProps } from "../types";

export const SalesStats = ({
  totalRevenue,
  appointmentRevenue,
  productRevenue,
  totalTransactions,
  formatCurrency,
}: SalesStatsProps) => {
  const stats = [
    { label: "Total Revenue", value: totalRevenue, icon: DollarSign, color: "text-[var(--accent-text)]" },
    { label: "Appointments", value: appointmentRevenue, icon: Users, color: "text-blue-600 dark:text-blue-400" },
    { label: "Products", value: productRevenue, icon: Package, color: "text-green-600 dark:text-green-400" },
    { label: "Transactions", value: totalTransactions, icon: TrendingUp, color: "text-purple-600 dark:text-purple-400" },
  ];

  return (
    <>
      {/* Desktop Stats */}
      <div className="hidden lg:block mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-4 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--glass-shadow)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-xl font-semibold text-foreground">
                      {stat.label === "Transactions" ? stat.value : formatCurrency(stat.value)}
                    </p>
                  </div>
                  <Icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Mobile & Tablet: Carousel */}
      <div className="block lg:hidden mb-6">
        <Carousel
          opts={{
            align: "start",
            slidesToScroll: 1,
            containScroll: "trimSnaps",
          }}
          className="w-full"
        >
          <CarouselContent className="ml-0">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              const isLast = index === stats.length - 1;
              return (
                <CarouselItem key={index} className={`pl-0 ${isLast ? 'pr-4' : 'pr-2'} flex-shrink-0`} style={{ minWidth: '40vw', width: 'auto' }}>
                  <Card className="p-4 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--glass-shadow)]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                        <p className="text-xl font-semibold text-foreground">
                          {stat.label === "Transactions" ? stat.value : formatCurrency(stat.value)}
                        </p>
                      </div>
                      <Icon className={`w-8 h-8 ${stat.color}`} />
                    </div>
                  </Card>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>
      </div>
    </>
  );
};
