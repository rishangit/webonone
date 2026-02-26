import { ServiceDetailImage } from "./ServiceDetailImage";
import { ServiceDetailInfo } from "./ServiceDetailInfo";
import { Service } from "../../../../services/services";
import { Currency } from "../../../../services/currencies";

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
    <div className="space-y-6">
      {/* Service Image */}
      <ServiceDetailImage service={service} />

      {/* Service Details */}
      <ServiceDetailInfo
        service={service}
        companyCurrency={companyCurrency}
        formatCurrency={formatCurrency}
        formatDuration={formatDuration}
      />
    </div>
  );
};
