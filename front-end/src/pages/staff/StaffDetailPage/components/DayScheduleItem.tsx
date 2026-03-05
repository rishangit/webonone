import { Label } from "../../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { DayScheduleItemProps } from "../types";

export const DayScheduleItem = ({ 
  day, 
  daySchedule, 
  isEditing, 
  onToggle, 
  onTimeChange, 
  timeOptions 
}: DayScheduleItemProps) => {
  if (!isEditing) {
    if (!daySchedule.enabled) return null;
    
    return (
      <div className="flex items-center justify-between p-2 rounded bg-[var(--glass-bg)] border border-[var(--glass-border)]">
        <span className="text-sm font-medium text-foreground">{day.fullName}</span>
        <span className="text-sm text-muted-foreground">
          {daySchedule.startTime} - {daySchedule.endTime}
        </span>
      </div>
    );
  }

  return (
    <div 
      className={`p-3 rounded-lg border ${
        daySchedule.enabled 
          ? 'bg-[var(--accent-bg)] border-[var(--accent-border)]' 
          : 'bg-[var(--glass-bg)] border-[var(--glass-border)] opacity-60'
      }`}
    >
      <div className="flex items-center gap-3">
        <input
          id={`edit-day-${day.id}`}
          type="checkbox"
          checked={daySchedule.enabled}
          onChange={onToggle}
          className="rounded border-[var(--glass-border)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)] w-4 h-4 cursor-pointer flex-shrink-0"
        />
        <label 
          htmlFor={`edit-day-${day.id}`} 
          className="text-sm font-medium text-foreground cursor-pointer flex-shrink-0 w-20"
        >
          {day.fullName}
        </label>
        {daySchedule.enabled ? (
          <div className="flex-1 grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Start</Label>
              <Select 
                value={daySchedule.startTime} 
                onValueChange={(value) => onTimeChange('startTime', value)}
                disabled={!daySchedule.enabled}
              >
                <SelectTrigger className="bg-[var(--glass-bg)] border-[var(--glass-border)] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-48">
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
                onValueChange={(value) => onTimeChange('endTime', value)}
                disabled={!daySchedule.enabled}
              >
                <SelectTrigger className="bg-[var(--glass-bg)] border-[var(--glass-border)] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-48">
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
};
