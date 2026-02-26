import { Calendar, DollarSign, TrendingUp, Users, Clock } from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { Separator } from "../../../../components/ui/separator";
import { Service } from "../../../../services/services";
import { Currency } from "../../../../services/currencies";
import { DateDisplay } from "../../../../components/common/DateDisplay";
import { Badge } from "../../../../components/ui/badge";

interface ServiceStatisticsTabProps {
  service: Service;
  companyCurrency: Currency | null;
  formatCurrency: (amount: number) => string;
}

export const ServiceStatisticsTab = ({
  service,
  companyCurrency,
  formatCurrency,
}: ServiceStatisticsTabProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-50 border-green-200 text-green-700 dark:bg-green-950 dark:border-green-800 dark:text-green-300";
      case "Inactive":
        return "bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300";
      case "Draft":
        return "bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-300";
      default:
        return "bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Statistics */}
      <div className="lg:col-span-2 space-y-6">
        {/* Booking Statistics */}
        <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[var(--accent-text)]" />
            Booking Statistics
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--accent-bg)]/10 border border-[var(--accent-border)]/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[var(--accent-bg)]">
                    <Users className="w-5 h-5 text-[var(--accent-text)]" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">This Month Bookings</p>
                    <p className="text-2xl font-semibold text-foreground">{service.bookings?.thisMonth || 0}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--accent-bg)]/10 border border-[var(--accent-border)]/20">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-[var(--accent-bg)]">
                    <DollarSign className="w-5 h-5 text-[var(--accent-text)]" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">This Month Revenue</p>
                    <p className="text-2xl font-semibold text-[var(--accent-text)]">
                      {formatCurrency(service.bookings?.revenue || 0)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <Separator />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Average Booking Value</span>
                <span className="text-lg font-semibold text-foreground">
                  {service.bookings?.thisMonth && service.bookings.thisMonth > 0
                    ? formatCurrency((service.bookings.revenue || 0) / service.bookings.thisMonth)
                    : formatCurrency(0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Bookings</span>
                <span className="text-lg font-semibold text-foreground">{service.bookings?.thisMonth || 0}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Performance Metrics */}
        <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[var(--accent-text)]" />
            Performance Metrics
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-[var(--accent-bg)]/10 border border-[var(--accent-border)]/20">
                <p className="text-sm text-muted-foreground mb-1">Service Price</p>
                <p className="text-xl font-semibold text-foreground">{formatCurrency(service.price)}</p>
              </div>
              <div className="p-4 rounded-lg bg-[var(--accent-bg)]/10 border border-[var(--accent-border)]/20">
                <p className="text-sm text-muted-foreground mb-1">Service Duration</p>
                <p className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[var(--accent-text)]" />
                  {service.duration} min
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Sidebar Information */}
      <div className="space-y-6">
        {/* Service Information */}
        <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
          <h3 className="text-lg font-semibold text-foreground mb-4">Information</h3>
          <div className="space-y-3 text-sm">
            {service.createdAt && (
              <div>
                <span className="text-muted-foreground">Created:</span>
                <div className="mt-1">
                  <DateDisplay date={service.createdAt} />
                </div>
              </div>
            )}
            {service.updatedAt && (
              <div>
                <span className="text-muted-foreground">Last Updated:</span>
                <div className="mt-1">
                  <DateDisplay date={service.updatedAt} />
                </div>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Status:</span>
              <div className="mt-1">
                <Badge className={`${getStatusColor(service.status)} text-xs border`}>
                  {service.status}
                </Badge>
              </div>
            </div>
            {service.category && (
              <div>
                <span className="text-muted-foreground">Category:</span>
                <div className="mt-1">
                  <span className="text-foreground">{service.category}</span>
                </div>
              </div>
            )}
            {service.subcategory && (
              <div>
                <span className="text-muted-foreground">Subcategory:</span>
                <div className="mt-1">
                  <span className="text-foreground">{service.subcategory}</span>
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};
