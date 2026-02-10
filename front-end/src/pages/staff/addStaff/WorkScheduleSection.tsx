import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { daysOfWeek, timeOptions } from "./constants";

interface WorkScheduleSectionProps {
  workSchedule: Record<string, { startTime: string; endTime: string; enabled: boolean }>;
  onDayToggle: (dayId: string) => void;
  onDayTimeChange: (dayId: string, field: 'startTime' | 'endTime', value: string) => void;
}

export const WorkScheduleSection = ({ 
  workSchedule, 
  onDayToggle, 
  onDayTimeChange 
}: WorkScheduleSectionProps) => {
  const enabledDaysCount = Object.values(workSchedule).filter(d => d.enabled).length;

  return (
    <div className="space-y-3">
      <Label className="text-sm">Work Schedule</Label>
      
      <div className="space-y-3">
        {daysOfWeek.map((day) => {
          const daySchedule = workSchedule[day.id];
          return (
            <div 
              key={day.id} 
              className={`p-3 rounded-lg border ${
                daySchedule.enabled 
                  ? 'bg-[var(--accent-bg)] border-[var(--accent-border)]' 
                  : 'bg-[var(--glass-bg)] border-[var(--glass-border)] opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  id={`day-${day.id}`}
                  type="checkbox"
                  checked={daySchedule.enabled}
                  onChange={() => onDayToggle(day.id)}
                  className="rounded border-[var(--glass-border)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)] w-4 h-4 cursor-pointer flex-shrink-0"
                />
                <label 
                  htmlFor={`day-${day.id}`} 
                  className="text-sm font-medium text-foreground cursor-pointer flex-shrink-0 min-w-[80px]"
                >
                  {day.fullName}
                </label>
                {daySchedule.enabled ? (
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Start</Label>
                      <Select 
                        value={daySchedule.startTime} 
                        onValueChange={(value) => onDayTimeChange(day.id, 'startTime', value)}
                        disabled={!daySchedule.enabled}
                      >
                        <SelectTrigger className="bg-[var(--glass-bg)] border-[var(--glass-border)] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border max-h-48">
                          {timeOptions.map((time) => (
                            <SelectItem key={time} value={time} className="text-xs">
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">End</Label>
                      <Select 
                        value={daySchedule.endTime} 
                        onValueChange={(value) => onDayTimeChange(day.id, 'endTime', value)}
                        disabled={!daySchedule.enabled}
                      >
                        <SelectTrigger className="bg-[var(--glass-bg)] border-[var(--glass-border)] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border max-h-48">
                          {timeOptions.map((time) => (
                            <SelectItem key={time} value={time} className="text-xs">
                              {time}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">Not available</span>
                )}
              </div>
            </div>
          );
        })}
        <p className="text-xs text-muted-foreground">
          Enabled: {enabledDaysCount} day{enabledDaysCount !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
};
