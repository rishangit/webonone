import { Briefcase, Timer, DollarSign, Check, Search } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Card } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Badge } from "../../../../components/ui/badge";
import { ViewSwitcher } from "../../../../components/ui/view-switcher";
import { ImageWithFallback } from "../../../../components/figma/ImageWithFallback";
import { formatAvatarUrl } from "../../../../utils";
import { toast } from "sonner";

interface ServiceStepProps {
  services: any[];
  servicesLoading: boolean;
  servicesError: string | null;
  activeServices: any[];
  filteredActiveServices: any[];
  selectedService: string;
  setSelectedService: (service: string) => void;
  serviceSearchQuery: string;
  setServiceSearchQuery: (query: string) => void;
  serviceViewMode: "grid" | "list";
  setServiceViewMode: (mode: "grid" | "list") => void;
  companyCurrency: any;
  companyId?: string;
  isCompanyOwner: boolean;
  onRetry: () => void;
}

export const ServiceStep = ({
  services,
  servicesLoading,
  servicesError,
  activeServices,
  filteredActiveServices,
  selectedService,
  setSelectedService,
  serviceSearchQuery,
  setServiceSearchQuery,
  serviceViewMode,
  setServiceViewMode,
  companyCurrency,
  isCompanyOwner,
  onRetry
}: ServiceStepProps) => {
  // Format price using company currency
  const formatPrice = (price: number | string) => {
    const numPrice = typeof price === 'string' 
      ? parseFloat(price.replace(/[^0-9.]/g, '')) 
      : Number(price) || 0;
    
    if (isNaN(numPrice)) {
      return companyCurrency ? `${companyCurrency.symbol} ${(0).toFixed(companyCurrency.decimals || 2)}` : '$ 0.00';
    }
    
    if (companyCurrency) {
      const decimals = companyCurrency.decimals || 2;
      const roundedPrice = Math.round(numPrice / companyCurrency.rounding) * companyCurrency.rounding;
      const formattedNumber = new Intl.NumberFormat('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(roundedPrice);
      return `${companyCurrency.symbol} ${formattedNumber}`;
    }
    
    return `$ ${numPrice.toFixed(2)}`;
  };

  // Get image URL - handle both image and imageUrl properties, and format if needed
  const getImageUrl = (service: any) => {
    const imageSrc = service.image || service.imageUrl;
    if (!imageSrc) return undefined;
    // Check if it's a URL path that needs formatting
    if (imageSrc.startsWith('companies/') || imageSrc.startsWith('/uploads/')) {
      return formatAvatarUrl(imageSrc);
    }
    return imageSrc;
  };

  if (servicesLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">Loading services...</p>
      </div>
    );
  }

  if (servicesError) {
    return (
      <div className="text-center py-8">
        <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-50 text-red-500" />
        <p className="text-sm text-red-600 dark:text-red-400 mb-2">Error loading services</p>
        <p className="text-xs text-muted-foreground">{servicesError}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={onRetry}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (activeServices.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">
          {services.length === 0 
            ? "No services available." 
            : `No active services available. Found ${services.length} service(s) but none are active.`}
        </p>
        {services.length > 0 && (
          <div className="mt-4 text-xs space-y-1">
            <p className="font-semibold">Services found (not active):</p>
            {services.map(s => (
              <p key={s.id}>- {s.name} (Status: {s.status || 'Unknown'})</p>
            ))}
          </div>
        )}
        {isCompanyOwner && (
          <p className="text-xs mt-2">
            <Button
              variant="link"
              className="text-[var(--accent-text)] p-0 h-auto"
              onClick={() => {
                toast.info("Please add services from the Services page");
              }}
            >
              Add services
            </Button>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search Input and View Switcher */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search services by name, description, or category..."
            value={serviceSearchQuery}
            onChange={(e) => setServiceSearchQuery(e.target.value)}
            className="pl-10 bg-[var(--glass-bg)] border-[var(--glass-border)] focus:border-[var(--accent-border)]"
          />
        </div>
        <ViewSwitcher 
          viewMode={serviceViewMode} 
          onViewModeChange={setServiceViewMode}
        />
      </div>

      {/* Services Count */}
      {serviceSearchQuery && (
        <div className="text-xs text-muted-foreground">
          Found {filteredActiveServices.length} of {activeServices.length} service{activeServices.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Services Grid/List */}
      {filteredActiveServices.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No services found matching "{serviceSearchQuery}"</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => setServiceSearchQuery("")}
          >
            Clear search
          </Button>
        </div>
      ) : serviceViewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredActiveServices.map((service) => (
            <Card
              key={service.id}
              className={`cursor-pointer transition-all duration-200 touch-manipulation ${
                selectedService === service.id 
                  ? 'border-[var(--accent-border)] bg-[var(--accent-bg)] ring-2 ring-[var(--accent-border)]' 
                  : 'border-[var(--glass-border)] bg-[var(--glass-bg)] hover:border-[var(--accent-border)] active:bg-[var(--accent-bg)]'
              }`}
              onClick={() => setSelectedService(service.id)}
            >
              <div className="aspect-video relative overflow-hidden rounded-t-lg">
                <ImageWithFallback
                  src={getImageUrl(service)}
                  alt={service.name}
                  className="w-full h-full object-cover"
                  fallbackSrc="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=200&fit=crop"
                />
                {service.category && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-[var(--accent-bg)] text-[var(--accent-text)] border-[var(--accent-border)] text-xs">
                      {service.category}
                    </Badge>
                  </div>
                )}
                {selectedService === service.id && (
                  <div className="absolute inset-0 bg-[var(--accent-primary)]/20 flex items-center justify-center">
                    <div className="w-8 h-8 bg-[var(--accent-primary)] text-white rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5" />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="font-medium text-foreground text-sm">{service.name}</h4>
                </div>
                
                {service.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {service.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Timer className="w-3 h-3" />
                    <span>{service.duration} min</span>
                  </div>
                  <div className="flex items-center gap-1 font-medium text-[var(--accent-text)]">
                    <DollarSign className="w-3 h-3" />
                    <span>{formatPrice(service.price)}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredActiveServices.map((service) => (
            <Card
              key={service.id}
              className={`cursor-pointer transition-all duration-200 touch-manipulation ${
                selectedService === service.id 
                  ? 'border-[var(--accent-border)] bg-[var(--accent-bg)] ring-2 ring-[var(--accent-border)]' 
                  : 'border-[var(--glass-border)] bg-[var(--glass-bg)] hover:border-[var(--accent-border)] active:bg-[var(--accent-bg)]'
              }`}
              onClick={() => setSelectedService(service.id)}
            >
              <div className="flex items-start gap-4 p-4">
                {/* Service Image */}
                <div className="flex-shrink-0 relative overflow-hidden rounded-lg w-24 h-20">
                  <ImageWithFallback
                    src={getImageUrl(service)}
                    alt={service.name}
                    className="w-full h-full object-cover"
                    fallbackSrc="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=200&fit=crop"
                  />
                  {selectedService === service.id && (
                    <div className="absolute inset-0 bg-[var(--accent-primary)]/20 flex items-center justify-center">
                      <div className="w-6 h-6 bg-[var(--accent-primary)] text-white rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Service Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground text-base mb-1">{service.name}</h4>
                      {service.category && (
                        <Badge className="bg-[var(--accent-bg)] text-[var(--accent-text)] border-[var(--accent-border)] text-xs mb-2">
                          {service.category}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge className="bg-[var(--accent-bg)] text-[var(--accent-text)] border border-[var(--accent-border)] px-3 py-1 font-semibold">
                        {formatPrice(service.price)}
                      </Badge>
                    </div>
                  </div>
                  
                  {service.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {service.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Timer className="w-3 h-3" />
                      <span>{service.duration} min</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
