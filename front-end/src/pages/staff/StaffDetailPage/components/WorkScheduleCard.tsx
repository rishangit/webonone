import { Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CardTitle } from "@/components/common/CardTitle";
import { WorkScheduleCardProps } from "../types";
import { daysOfWeek } from "../constants";
import { DayScheduleItem } from "./DayScheduleItem";
import { timeOptions } from "../constants";

export const WorkScheduleCard = ({ 
  staff, 
  workSchedule, 
  isEditing, 
  onDayToggle, 
  onDayTimeChange 
}: WorkScheduleCardProps) => {
  // Get schedule from staff or convert old format
  const getDisplaySchedule = () => {
    if (staff.workSchedule?.schedule) {
      return staff.workSchedule.schedule;
    }
    
    // Convert old format to new format for display
    if (staff.workSchedule) {
      const oldSchedule: Record<string, { startTime: string; endTime: string; enabled: boolean }> = {};
      const startTime = staff.workSchedule.startTime || "09:00";
      const endTime = staff.workSchedule.endTime || "17:00";
      const availableDays = staff.workSchedule.availableDays || [];
      daysOfWeek.forEach(day => {
        oldSchedule[day.id] = {
          startTime,
          endTime,
          enabled: availableDays.includes(day.id)
        };
      });
      return oldSchedule;
    }
    
    return null;
  };

  const displaySchedule = getDisplaySchedule();
  const enabledDaysCount = Object.values(workSchedule).filter(d => d.enabled).length;

  return (
    <Card className="p-6 bg-[var(--glass-bg)] border-[var(--glass-border)]">
      <CardTitle title="Work Schedule" icon={Clock} />
      {isEditing ? (
        <div className="space-y-3">
          {daysOfWeek.map((day) => {
            const daySchedule = workSchedule[day.id];
            return (
              <DayScheduleItem
                key={day.id}
                day={day}
                daySchedule={daySchedule}
                isEditing={true}
                onToggle={() => onDayToggle(day.id)}
                onTimeChange={(field, value) => onDayTimeChange(day.id, field, value)}
                timeOptions={timeOptions}
              />
            );
          })}
          <p className="text-xs text-muted-foreground">
            Enabled: {enabledDaysCount} day{enabledDaysCount !== 1 ? 's' : ''}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displaySchedule ? (
            <>
              {daysOfWeek.map(day => {
                const daySchedule = displaySchedule[day.id];
                if (!daySchedule || !daySchedule.enabled) return null;
                return (
                  <DayScheduleItem
                    key={day.id}
                    day={day}
                    daySchedule={daySchedule}
                    isEditing={false}
                    onToggle={() => {}}
                    onTimeChange={() => {}}
                    timeOptions={timeOptions}
                  />
                );
              })}
              {Object.values(displaySchedule).filter(d => d?.enabled).length === 0 && (
                <p className="text-muted-foreground text-sm">No schedule configured</p>
              )}
            </>
          ) : (
            <p className="text-muted-foreground text-sm">No schedule configured</p>
          )}
        </div>
      )}
    </Card>
  );
};
