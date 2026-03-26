import { ServiceDetailImage } from "./ServiceDetailImage";
import { ServiceDetailInfo } from "./ServiceDetailInfo";
import { Service } from "@/services/services";
import { Currency } from "@/services/currencies";

interface ServiceOverviewTabProps {
  service: Service;
  companyCurrency: Currency | null;
  formatCurrency: (amount: number) => string;
  formatDuration: (minutes: number) => string;
}

export const ServiceOverviewTab = ({
  service,
  companyCurrency,
  formatCurrency,
  formatDuration,
}: ServiceOverviewTabProps) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Service Image - Left Column */}
      <div className="w-full">
        <ServiceDetailImage service={service} />
      </div>

      {/* Service Details - Right Column */}
      <div className="w-full">
        <ServiceDetailInfo
          service={service}
          companyCurrency={companyCurrency}
          formatCurrency={formatCurrency}
          formatDuration={formatDuration}
        />
      </div>
    </div>
  );
};
