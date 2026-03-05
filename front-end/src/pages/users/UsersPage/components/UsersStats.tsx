import { Users, TrendingUp, Building2, Briefcase } from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { Carousel, CarouselContent, CarouselItem } from "../../../../components/ui/carousel";
import { UsersStatsProps } from "../types";

export const UsersStats = ({
  totalUsers,
  activeUsers,
  totalCompanyOwners,
  totalStaffMembers,
}: UsersStatsProps) => {
  const stats = [
    {
      label: "Total Users",
      value: totalUsers,
      icon: Users,
      bgColor: "bg-[var(--accent-bg)]",
      iconColor: "text-[var(--accent-text)]",
    },
    {
      label: "Active Users",
      value: activeUsers,
      icon: TrendingUp,
      bgColor: "bg-green-500/20",
      iconColor: "text-green-600 dark:text-green-400",
    },
    {
      label: "Total Company Owners",
      value: totalCompanyOwners,
      icon: Building2,
      bgColor: "bg-blue-500/20",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      label: "Total Staff Members",
      value: totalStaffMembers,
      icon: Briefcase,
      bgColor: "bg-purple-500/20",
      iconColor: "text-purple-600 dark:text-purple-400",
    },
  ];

  const StatCard = ({ label, value, icon: Icon, bgColor, iconColor }: typeof stats[0]) => (
    <Card className="p-4 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${bgColor}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold text-foreground">{value}</p>
        </div>
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
