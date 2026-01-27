import { useState, useMemo, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { TimelineView } from "../../components/TimelineView";

interface User {
  email: string;
  role: string;
  name: string;
  companyId?: string;
}

interface Appointment {
  id: string;
  patientName: string;
  patientImage: string;
  time: string;
  duration: string;
  type: string;
  service: string;
  status: 'confirmed' | 'pending' | 'in_progress' | 'completed' | 'cancelled' | number;
  phone: string;
  location: string;
  date: string;
  staff?: {
    name: string;
    image: string;
    specialization: string;
  };
  preferredStaff?: Array<{
    id?: string;
    name: string;
    image: string;
    specialization: string;
  }>;
  _originalAppointment?: any;
}

interface WeekViewProps {
  currentUser?: User | null;
  selectedDate?: Date;
  appointments: Appointment[];
  onDateChange?: (date: Date) => void;
  onViewModeChange?: (mode: "day" | "week" | "month") => void;
}

export const WeekView = ({ currentUser, selectedDate, appointments, onDateChange, onViewModeChange }: WeekViewProps) => {
  // Calculate week start (Monday) from selectedDate
  const calculateWeekStart = (date: Date | undefined): Date => {
    const targetDate = date || new Date();
    const day = targetDate.getDay();
    const diff = targetDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    const monday = new Date(targetDate);
    monday.setDate(targetDate.getDate() + (diff - targetDate.getDate()));
    return new Date(monday.setHours(0, 0, 0, 0));
  };

  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => calculateWeekStart(selectedDate));

  // Update week start when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      const weekStart = calculateWeekStart(selectedDate);
      setCurrentWeekStart(weekStart);
    }
  }, [selectedDate]);

  // Generate array of 7 days starting from Monday
  const weekDays = useMemo(() => {
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentWeekStart);
      day.setDate(currentWeekStart.getDate() + i);
      days.push(day);
    }
    return days;
  }, [currentWeekStart]);

  // Get week range string
  const weekRangeString = useMemo(() => {
    const start = weekDays[0];
    const end = weekDays[6];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    
    if (start.getMonth() === end.getMonth()) {
      return `${monthNames[start.getMonth()]} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`;
    } else {
      return `${monthNames[start.getMonth()]} ${start.getDate()} - ${monthNames[end.getMonth()]} ${end.getDate()}, ${start.getFullYear()}`;
    }
  }, [weekDays]);

  const handlePreviousWeek = () => {
    const prevWeek = new Date(currentWeekStart);
    prevWeek.setDate(prevWeek.getDate() - 7);
    setCurrentWeekStart(prevWeek);
  };

  const handleNextWeek = () => {
    const nextWeek = new Date(currentWeekStart);
    nextWeek.setDate(nextWeek.getDate() + 7);
    setCurrentWeekStart(nextWeek);
  };

  const handleToday = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    setCurrentWeekStart(new Date(monday.setHours(0, 0, 0, 0)));
    if (onDateChange) {
      onDateChange(today);
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentWeek = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    const weekStart = new Date(monday.setHours(0, 0, 0, 0));
    return currentWeekStart.toDateString() === weekStart.toDateString();
  };

  // Filter appointments for each day
  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate.toDateString() === date.toDateString();
    });
  };

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Generate time slots for the shared time column
  const generateTimeSlots = (): Array<{ time: string; hour: number; minute: number; index: number; isQuarterHour: boolean }> => {
    const slots: Array<{ time: string; hour: number; minute: number; index: number; isQuarterHour: boolean }> = [];
    const startHour = 7;
    const endHour = 19; // 7 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 5) {
        const period = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
        const displayMinute = minute === 0 ? '00' : minute.toString();
        const timeString = `${displayHour}:${displayMinute} ${period}`;
        
        slots.push({
          time: timeString,
          hour,
          minute,
          index: slots.length,
          isQuarterHour: minute % 15 === 0
        });
      }
    }
    
    return slots;
  };

  const timeSlots = generateTimeSlots();

  return (
    <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] min-h-[500px] flex flex-col">
      {/* Week Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePreviousWeek}
          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <div className="flex flex-col items-center flex-1">
          <h3 className="font-semibold text-foreground text-center">
            {weekRangeString}
          </h3>
          <div className="flex items-center gap-2 mt-2">
            {!isCurrentWeek() && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleToday}
                className="h-7 px-3 text-xs bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground hover:bg-accent"
              >
                Today
              </Button>
            )}
            {isCurrentWeek() && (
              <Badge className="bg-[var(--accent-bg)] text-[var(--accent-text)] border border-[var(--accent-border)]">
                This Week
              </Badge>
            )}
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextWeek}
          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

       {/* Week Grid - Time Column + 7 Days */}
       <div className="flex-1 overflow-hidden flex flex-col">
         {/* Fixed Headers Row - Outside scrollable area */}
         <div className="flex flex-shrink-0 border-b border-[var(--glass-border)]">
           {/* Time Column Header Spacer */}
           <div className="w-24 bg-[var(--glass-bg)]/30 border-r-2 border-[var(--accent-border)]"></div>
           
           {/* Day Headers */}
           <div className="flex-1 grid grid-cols-7 gap-2">
             {weekDays.map((day, index) => {
               const isTodayDate = isToday(day);
               const isSelected = selectedDate?.toDateString() === day.toDateString();
               const dayAppointments = getAppointmentsForDay(day);
               
               return (
                 <div
                   key={index}
                   className={`p-3 text-center cursor-pointer hover:bg-[var(--accent-bg)]/30 transition-colors border-r border-[var(--glass-border)] last:border-r-0 relative ${
                     isTodayDate
                       ? 'bg-[var(--accent-bg)] text-[var(--accent-text)]'
                       : isSelected
                       ? 'bg-[var(--accent-bg)]/20'
                       : 'bg-[var(--glass-bg)]/50'
                   }`}
                   onClick={() => {
                     if (onDateChange) {
                       onDateChange(day);
                     }
                   }}
                 >
                   {/* Appointment Count Badge - Top Right */}
                   {dayAppointments.length > 0 && (
                     <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[var(--accent-primary)] text-[var(--accent-button-text)] text-xs font-bold flex items-center justify-center shadow-lg z-10">
                       {dayAppointments.length}
                     </div>
                   )}
                   
                   <div className="text-xs font-medium text-muted-foreground mb-1">
                     {dayNames[index]}
                   </div>
                   <div
                     className={`text-lg font-semibold ${
                       isTodayDate
                         ? 'text-[var(--accent-text)]'
                         : isSelected
                         ? 'text-[var(--accent-primary)]'
                         : 'text-foreground'
                     }`}
                   >
                     {day.getDate()}
                   </div>
                 </div>
               );
             })}
           </div>
         </div>

         {/* Scrollable Timeline Area - Starts at 7:00 AM */}
         <div className="flex-1 overflow-y-auto custom-scrollbar">
           <div className="flex" style={{ minHeight: `${timeSlots.length * 10}px` }}>
             {/* Shared Time Labels Column */}
             <div className="w-24 relative bg-[var(--glass-bg)]/30 border-r-2 border-[var(--accent-border)] flex-shrink-0 z-10" style={{ minHeight: `${timeSlots.length * 10}px` }}>
               {timeSlots.map((slot, index) => (
                 <div key={index} className="relative" style={{ height: '10px' }}>
                   {slot.isQuarterHour && (
                     <div className="absolute left-0 top-0 w-full flex items-center justify-center">
                       <div className="text-xs font-semibold text-[var(--accent-text)] px-2 py-1">
                         {slot.time}
                       </div>
                     </div>
                   )}
                 </div>
               ))}
             </div>

             {/* Day Columns - Timeline only, no headers */}
             <div className="flex-1 grid grid-cols-7 gap-2" style={{ minHeight: `${timeSlots.length * 10}px` }}>
               {weekDays.map((day, index) => {
                 const dayAppointments = getAppointmentsForDay(day);
                 
                 const handleDoubleClick = () => {
                   if (onDateChange) {
                     onDateChange(day);
                   }
                   if (onViewModeChange) {
                     onViewModeChange("day");
                   }
                 };
                 
                 return (
                   <div
                     key={index}
                     className="relative border-r border-[var(--glass-border)] last:border-r-0 overflow-visible cursor-pointer transition-all duration-300 hover:bg-[var(--accent-bg)]/5"
                     onDoubleClick={handleDoubleClick}
                   >
                     {/* Day Timeline - Reuse TimelineView component, starts at 7:00 AM */}
                     <div className="absolute inset-0 overflow-visible">
                       <TimelineView
                         currentUser={currentUser}
                         selectedDate={day}
                         appointments={dayAppointments}
                         onDateChange={(date) => {
                           if (onDateChange) {
                             onDateChange(date);
                           }
                         }}
                         hideHeader={true}
                         compact={true}
                         hideTimeLabels={true}
                       />
                     </div>
                   </div>
                 );
               })}
             </div>
           </div>
         </div>
       </div>
    </Card>
  );
};
