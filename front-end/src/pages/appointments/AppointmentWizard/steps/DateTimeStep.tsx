import { Calendar, Clock } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Calendar as CalendarComponent } from "../../../../components/ui/calendar";
import { timeSlots } from "../constants";

interface DateTimeStepProps {
  appointmentDate?: Date;
  setAppointmentDate: (date: Date | undefined) => void;
  appointmentTime: string;
  setAppointmentTime: (time: string) => void;
}

export const DateTimeStep = ({
  appointmentDate,
  setAppointmentDate,
  appointmentTime,
  setAppointmentTime
}: DateTimeStepProps) => {
  return (
    <div className="space-y-3 sm:space-y-4 pb-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
        {/* Mobile-Optimized Calendar */}
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[var(--accent-text)]" />
            <h4 className="text-sm font-medium text-foreground">Select Date</h4>
          </div>
          <div className="flex justify-center overflow-visible">
            <CalendarComponent
              mode="single"
              selected={appointmentDate}
              onSelect={setAppointmentDate}
              disabled={(date) => date < new Date()}
              className="rounded-lg border-[var(--glass-border)] text-sm scale-75 sm:scale-90 origin-center"
            />
          </div>
        </div>

        {/* Mobile-Optimized Time Slots */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[var(--accent-text)]" />
            <h4 className="text-sm font-medium text-foreground">Select Time</h4>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 p-1">
            {timeSlots.map((time) => {
              // Convert to 12-hour format for display
              const [hours, minutes] = time.split(':').map(Number);
              const displayTime = new Date(2000, 0, 1, hours, minutes).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              });
              
              return (
                <Button
                  key={time}
                  variant={appointmentTime === time ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAppointmentTime(time)}
                  className={`text-xs h-9 px-2 touch-manipulation ${appointmentTime === time 
                    ? "bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-[var(--accent-button-text)] ring-2 ring-[var(--accent-primary)]/20" 
                    : "bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-[var(--accent-bg)] hover:border-[var(--accent-border)] hover:text-[var(--accent-text)]"
                  }`}
                >
                  {displayTime}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
