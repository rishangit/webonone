import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, Briefcase, MapPin, Clock } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { cn } from "../../components/ui/utils";
import { normalizeAppointmentStatus, AppointmentStatus, getAppointmentStatusLabel } from "../../types/appointmentStatus";

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

interface MonthViewProps {
  currentUser?: User | null;
  selectedDate?: Date;
  appointments: Appointment[];
  onDateChange?: (date: Date) => void;
  onViewModeChange?: (mode: "day" | "week" | "month") => void;
}

export const MonthView = ({ currentUser, selectedDate, appointments, onDateChange, onViewModeChange }: MonthViewProps) => {
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const date = selectedDate || new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });

  // Generate calendar days for the month
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Start from Monday of the week containing the first day
    const startDate = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Adjust to Monday
    startDate.setDate(firstDay.getDate() + diff);
    
    // End on Sunday of the week containing the last day
    const endDate = new Date(lastDay);
    const lastDayOfWeek = lastDay.getDay();
    const diffEnd = lastDayOfWeek === 0 ? 0 : 7 - lastDayOfWeek;
    endDate.setDate(lastDay.getDate() + diffEnd);
    
    const days: Date[] = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  }, [currentMonth]);

  const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const handlePreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentMonth(new Date(today.getFullYear(), today.getMonth(), 1));
    if (onDateChange) {
      onDateChange(today);
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentMonth.getMonth() && date.getFullYear() === currentMonth.getFullYear();
  };

  const isSelected = (date: Date) => {
    return selectedDate?.toDateString() === date.toDateString();
  };

  // Parse time string to get minutes from midnight for grouping
  const parseTimeToMinutes = (timeStr: string): number => {
    const [time, period] = timeStr.split(' ');
    const [hourStr, minuteStr] = time.split(':');
    let hour = parseInt(hourStr);
    const minute = parseInt(minuteStr);
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    return hour * 60 + minute;
  };

  // Group appointments by time slot (within 15 minutes) and organize for stacking
  const organizeAppointmentsForStacking = (appointments: Appointment[]) => {
    if (appointments.length === 0) return [];
    
    // Sort all appointments by time first
    const sorted = [...appointments].sort((a, b) => 
      parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time)
    );
    
    const result: Array<{ appointment: Appointment; stackIndex: number; totalInStack: number }> = [];
    const processed = new Set<string>();
    
    sorted.forEach(apt => {
      if (processed.has(apt.id)) return;
      
      const aptMinutes = parseTimeToMinutes(apt.time);
      // Find all appointments in the same time slot (within 15 minutes)
      const sameSlot = sorted.filter(other => {
        if (processed.has(other.id)) return false;
        const otherMinutes = parseTimeToMinutes(other.time);
        return Math.abs(otherMinutes - aptMinutes) <= 15;
      });
      
      // Mark all as processed
      sameSlot.forEach(a => processed.add(a.id));
      
      // Add each appointment with its stack position
      sameSlot.forEach((appt, index) => {
        result.push({
          appointment: appt,
          stackIndex: index,
          totalInStack: sameSlot.length
        });
      });
    });
    
    return result;
  };

  // Get appointments for a specific date
  const getAppointmentsForDay = (date: Date) => {
    return appointments.filter(apt => {
      const aptDate = new Date(apt.date);
      return aptDate.toDateString() === date.toDateString();
    });
  };

  // Get status color functions (same as TimelineView)
  const getStatusBackgroundColor = (status: string | number) => {
    const normalizedStatus = normalizeAppointmentStatus(status);
    if (normalizedStatus === null) return 'bg-gray-500/20';
    
    switch (normalizedStatus) {
      case AppointmentStatus.CONFIRMED: return 'bg-green-500/20';
      case AppointmentStatus.PENDING: return 'bg-orange-500/20';
      case AppointmentStatus.IN_PROGRESS: return 'bg-purple-500/20';
      case AppointmentStatus.COMPLETED: return 'bg-blue-500/20';
      case AppointmentStatus.CANCELLED: return 'bg-red-500/20';
      case AppointmentStatus.NO_SHOW: return 'bg-gray-500/20';
      default: return 'bg-gray-500/20';
    }
  };

  const getStatusBorderColor = (status: string | number) => {
    const normalizedStatus = normalizeAppointmentStatus(status);
    if (normalizedStatus === null) return 'border-gray-500/30';
    
    switch (normalizedStatus) {
      case AppointmentStatus.CONFIRMED: return 'border-green-500/30';
      case AppointmentStatus.PENDING: return 'border-orange-500/30';
      case AppointmentStatus.IN_PROGRESS: return 'border-purple-500/30';
      case AppointmentStatus.COMPLETED: return 'border-blue-500/30';
      case AppointmentStatus.CANCELLED: return 'border-red-500/30';
      case AppointmentStatus.NO_SHOW: return 'border-gray-500/30';
      default: return 'border-gray-500/30';
    }
  };

  const getStatusLeftBorderColor = (status: string | number) => {
    const normalizedStatus = normalizeAppointmentStatus(status);
    if (normalizedStatus === null) return 'border-l-gray-500';
    
    switch (normalizedStatus) {
      case AppointmentStatus.CONFIRMED: return 'border-l-green-500';
      case AppointmentStatus.PENDING: return 'border-l-orange-500';
      case AppointmentStatus.IN_PROGRESS: return 'border-l-purple-500';
      case AppointmentStatus.COMPLETED: return 'border-l-blue-500';
      case AppointmentStatus.CANCELLED: return 'border-l-red-500';
      case AppointmentStatus.NO_SHOW: return 'border-l-gray-500';
      default: return 'border-l-gray-500';
    }
  };

  const getStatusText = (status: string | number) => {
    const normalizedStatus = normalizeAppointmentStatus(status);
    if (normalizedStatus !== null) {
      return getAppointmentStatusLabel(normalizedStatus);
    }
    return 'Pending';
  };

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] min-h-[500px] flex flex-col">
      {/* Month Header */}
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={handlePreviousMonth}
          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
        >
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <div className="flex flex-col items-center flex-1">
          <h3 className="font-semibold text-foreground text-center">
            {monthName}
          </h3>
          <div className="flex items-center gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToday}
              className="h-7 px-3 text-xs bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground hover:bg-accent"
            >
              Today
            </Button>
          </div>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={handleNextMonth}
          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto custom-scrollbar">
          {/* Day Names Header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {dayNames.map((dayName) => (
              <div
                key={dayName}
                className="text-center text-xs font-semibold text-muted-foreground py-2"
              >
                {dayName}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              const dayAppointments = getAppointmentsForDay(day);
              const isTodayDate = isToday(day);
              const isSelectedDate = isSelected(day);
              const isInCurrentMonth = isCurrentMonth(day);

              const handleDoubleClick = () => {
                if (onDateChange) {
                  onDateChange(day);
                }
                if (onViewModeChange) {
                  onViewModeChange("week");
                }
              };

              return (
                <div
                  key={index}
                  className={cn(
                    "min-h-[200px] p-2 border border-[var(--glass-border)] rounded-lg cursor-pointer transition-all hover:bg-[var(--accent-bg)]/20 flex flex-col relative",
                    !isInCurrentMonth && "opacity-40",
                    isTodayDate && "bg-[var(--accent-bg)] border-[var(--accent-border)]",
                    isSelectedDate && !isTodayDate && "bg-[var(--accent-bg)]/30 border-[var(--accent-primary)]"
                  )}
                  onClick={() => {
                    if (onDateChange) {
                      onDateChange(day);
                    }
                  }}
                  onDoubleClick={handleDoubleClick}
                >
                  {/* Appointment Count Badge - Top Right */}
                  {dayAppointments.length > 0 && (
                    <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-[var(--accent-primary)] text-[var(--accent-button-text)] text-xs font-bold flex items-center justify-center shadow-lg z-10">
                      {dayAppointments.length}
                    </div>
                  )}
                  
                  {/* Date Number */}
                  <div
                    className={cn(
                      "text-sm font-semibold mb-2 flex-shrink-0",
                      isTodayDate
                        ? "text-[var(--accent-text)]"
                        : isSelectedDate
                        ? "text-[var(--accent-primary)]"
                        : "text-foreground"
                    )}
                  >
                    {day.getDate()}
                  </div>
                  
                  {/* Appointments - Stacked vertically, overlapping when same time slot */}
                  <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0 relative">
                    {dayAppointments.length > 0 ? (
                      (() => {
                        const organizedAppointments = organizeAppointmentsForStacking(dayAppointments);
                        let currentTop = 0;
                        let lastSlotMinutes = -1;
                        
                        return organizedAppointments.map((item, index) => {
                          const aptMinutes = parseTimeToMinutes(item.appointment.time);
                          const isNewTimeSlot = Math.abs(aptMinutes - lastSlotMinutes) > 15;
                          
                          if (isNewTimeSlot) {
                            // New time slot - reset top position
                            currentTop = index * 60; // 60px per appointment
                            lastSlotMinutes = aptMinutes;
                          }
                          
                          const isOverlapping = item.totalInStack > 1;
                          const topPosition = isOverlapping 
                            ? currentTop + (item.stackIndex * 50) // Stack overlapping appointments
                            : currentTop;
                          
                          return (
                            <div
                              key={item.appointment.id}
                              className={cn(
                                "rounded-lg backdrop-blur-md border-l-4 border p-2 transition-all duration-200 shadow-md hover:shadow-lg cursor-pointer mb-1",
                                getStatusBackgroundColor(item.appointment.status),
                                getStatusLeftBorderColor(item.appointment.status),
                                getStatusBorderColor(item.appointment.status),
                                isOverlapping && item.stackIndex > 0 && "absolute"
                              )}
                              style={{
                                position: isOverlapping && item.stackIndex > 0 ? 'absolute' : 'relative',
                                top: isOverlapping && item.stackIndex > 0 ? `${topPosition}px` : 'auto',
                                left: isOverlapping && item.stackIndex > 0 ? '0' : 'auto',
                                right: isOverlapping && item.stackIndex > 0 ? '0' : 'auto',
                                zIndex: isOverlapping ? 10 + item.stackIndex : 'auto',
                                marginBottom: isOverlapping && item.stackIndex === item.totalInStack - 1 ? '1rem' : '0.25rem'
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                // Could open appointment details here
                              }}
                            >
                              <div className="flex items-start gap-2">
                                {/* Avatar */}
                                <Avatar className="w-6 h-6 ring-2 ring-[var(--accent-border)] shadow-sm flex-shrink-0">
                                  <AvatarImage src={item.appointment.patientImage} />
                                  <AvatarFallback className="bg-[var(--accent-primary)] text-[var(--accent-button-text)] text-xs font-medium">
                                    {item.appointment.patientName.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                  {/* Patient Name */}
                                  <p className="font-semibold text-xs text-foreground truncate mb-0.5">
                                    {item.appointment.patientName}
                                  </p>
                                  
                                  {/* Time */}
                                  <div className="flex items-center gap-1 mb-0.5">
                                    <Clock className="w-3 h-3 text-[var(--accent-text)] flex-shrink-0" />
                                    <span className="text-xs text-muted-foreground">{item.appointment.time}</span>
                                  </div>
                                  
                                  {/* Service */}
                                  <div className="flex items-center gap-1 min-w-0">
                                    <Briefcase className="w-3 h-3 text-[var(--accent-text)] flex-shrink-0" />
                                    <span className="text-xs text-muted-foreground truncate">
                                      {item.appointment.service || item.appointment.type}
                                    </span>
                                  </div>
                                </div>

                                {/* Status Badge */}
                                <Badge className={`text-xs border flex-shrink-0 ${getStatusBackgroundColor(item.appointment.status)} ${getStatusBorderColor(item.appointment.status)}`}>
                                  {getStatusText(item.appointment.status)}
                                </Badge>
                              </div>
                            </div>
                          );
                        });
                      })()
                    ) : (
                      <div className="text-xs text-muted-foreground text-center py-2">
                        No appointments
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
};
