import { Tag as TagIcon, CheckCircle, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import { TagsStatsProps } from "../types";

export const TagsStats = ({ total, active, inactive, usage }: TagsStatsProps) => {
  const stats = [
    { label: "Total Tags", value: total, icon: TagIcon, color: "text-muted-foreground" },
    { label: "Active Tags", value: active, icon: CheckCircle, color: "text-green-600 dark:text-green-400" },
    { label: "Inactive Tags", value: inactive, icon: X, color: "text-muted-foreground" },
    { label: "Total Usage", value: usage, icon: TagIcon, color: "text-muted-foreground" },
  ];

  const StatCard = ({ label, value, icon: Icon, color }: typeof stats[0]) => (
    <Card className="backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className={`text-2xl font-semibold ${color}`}>{value}</p>
        </div>
        <Icon className={`w-8 h-8 ${color}`} />
      </div>
    </Card>
  );

  return (
    <>
      {/* Desktop Stats */}
      <div className="hidden lg:block mb-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              const isLast = index === stats.length - 1;
              return (
                <CarouselItem 
                  key={index} 
                  className={`pl-0 ${isLast ? 'pr-4' : 'pr-2'} flex-shrink-0`} 
                  style={{ minWidth: '40vw', width: 'auto' }}
                >
                  <StatCard {...stat} />
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>
      </div>
    </>
  );
};
