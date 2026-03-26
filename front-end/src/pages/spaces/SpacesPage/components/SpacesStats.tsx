import { MapPin, Users, Calendar } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { SpacesStatsProps } from "../types";

export const SpacesStats = ({ totalSpaces, activeSpaces, todayBookings }: SpacesStatsProps) => {
  const stats = [
    {
      label: "Total Spaces",
      value: totalSpaces,
      icon: MapPin,
      iconColor: "text-orange-600 dark:text-orange-400"
    },
    {
      label: "Active Spaces",
      value: activeSpaces,
      icon: Users,
      iconColor: "text-green-600 dark:text-green-400"
    },
    {
      label: "Today's Bookings",
      value: todayBookings,
      icon: Calendar,
      iconColor: "text-blue-600 dark:text-blue-400"
    }
  ];

  const StatCard = ({ label, value, icon: Icon, iconColor }: typeof stats[0]) => (
    <Card className="p-4 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--glass-shadow)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{label}</p>
          <p className="text-xl font-semibold text-foreground">{value}</p>
        </div>
        <Icon className={`w-8 h-8 ${iconColor}`} />
      </div>
    </Card>
  );

  return (
    <>
      {/* Desktop Stats */}
      <div className="hidden lg:block mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
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
            {stats.map((stat, index) => (
              <CarouselItem 
                key={index} 
                className={`pl-0 ${index === stats.length - 1 ? 'pr-4' : 'pr-2'} flex-shrink-0`} 
                style={{ minWidth: '40vw', width: 'auto' }}
              >
                <StatCard {...stat} />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </>
  );
};
