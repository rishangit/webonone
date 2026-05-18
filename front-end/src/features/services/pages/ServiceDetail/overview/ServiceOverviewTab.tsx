import { ServiceDetailImage } from "./ServiceDetailImage";
import { ServiceDetailInfo } from "./ServiceDetailInfo";
import { Service } from "@/features/services/services";
import { Currency } from "@/shared/services/currencies";
import type { CompanyProduct } from "@/features/products/services/productApi";

interface ServiceOverviewTabProps {
  service: Service;
  companyCurrency: Currency | null;
  formatCurrency: (amount: number) => string;
  formatDuration: (minutes: number) => string;
  companyProducts?: CompanyProduct[];
  showProductsPricingBreakdown?: boolean;
  bookAppointmentTrigger?: React.ReactNode;
}

export const ServiceOverviewTab = ({
  service,
  companyCurrency,
  formatCurrency,
  formatDuration,
  companyProducts = [],
  showProductsPricingBreakdown = false,
  bookAppointmentTrigger,
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
          companyProducts={companyProducts}
          showProductsPricingBreakdown={showProductsPricingBreakdown}
          bookAppointmentTrigger={bookAppointmentTrigger}
        />
      </div>
    </div>
  );
};
