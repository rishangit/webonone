import { Calendar, Users, TrendingUp, MapPin } from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { Separator } from "../../../../components/ui/separator";
import { Space } from "../../../../services/spaces";
import { DateDisplay } from "../../../../components/common/DateDisplay";
import { Badge } from "../../../../components/ui/badge";

interface SpaceStatisticsTabProps {
  space: Space;
}

export const SpaceStatisticsTab = ({ space }: SpaceStatisticsTabProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-50 border-green-200 text-green-700 dark:bg-green-950 dark:border-green-800 dark:text-green-300";
      case "Inactive":
        return "bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300";
      case "Maintenance":
        return "bg-yellow-50 border-yellow-200 text-yellow-700 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-300";
      default:
        return "bg-gray-50 border-gray-200 text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-300";
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Main Statistics */}
      <div className="lg:col-span-2 space-y-6">
        {/* Appointment Statistics */}
        {space.appointments && (
          <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-[var(--accent-text)]" />
              Appointment Statistics
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--accent-bg)]/10 border border-[var(--accent-border)]/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[var(--accent-bg)]">
                      <Calendar className="w-5 h-5 text-[var(--accent-text)]" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Today's Appointments</p>
                      <p className="text-2xl font-semibold text-foreground">{space.appointments.today || 0}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--accent-bg)]/10 border border-[var(--accent-border)]/20">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-[var(--accent-bg)]">
                      <Calendar className="w-5 h-5 text-[var(--accent-text)]" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">This Week's Appointments</p>
                      <p className="text-2xl font-semibold text-[var(--accent-text)]">
                        {space.appointments.thisWeek || 0}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Space Metrics */}
        <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[var(--accent-text)]" />
            Space Metrics
          </h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-[var(--accent-bg)]/10 border border-[var(--accent-border)]/20">
                <p className="text-sm text-muted-foreground mb-1">Capacity</p>
                <p className="text-xl font-semibold text-foreground flex items-center gap-2">
                  <Users className="w-4 h-4 text-[var(--accent-text)]" />
                  {space.capacity} people
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Sidebar Information */}
      <div className="space-y-6">
        {/* Space Information */}
        <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
          <h3 className="text-lg font-semibold text-foreground mb-4">Information</h3>
          <div className="space-y-3 text-sm">
            {space.createdAt && (
              <div>
                <span className="text-muted-foreground">Created:</span>
                <div className="mt-1">
                  <DateDisplay date={space.createdAt} />
                </div>
              </div>
            )}
            {space.updatedAt && (
              <div>
                <span className="text-muted-foreground">Last Updated:</span>
                <div className="mt-1">
                  <DateDisplay date={space.updatedAt} />
                </div>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">Status:</span>
              <div className="mt-1">
                <Badge className={`${getStatusColor(space.status)} text-xs border`}>
                  {space.status}
                </Badge>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
