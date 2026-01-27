import { useMemo, useState } from "react";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Button } from "../../components/ui/button";
import { normalizeAppointmentStatus, AppointmentStatus, getAppointmentStatusLabel } from "../../types/appointmentStatus";
import { Briefcase, MapPin, ChevronDown, ChevronUp } from "lucide-react";

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

interface DayColumnProps {
  date: Date;
  appointments: Appointment[];
  isToday: boolean;
  isSelected: boolean;
  onDateClick?: (date: Date) => void;
}

interface TimeSlot {
  time: string;
  hour: number;
  minute: number;
  index: number;
  isQuarterHour: boolean;
  isFiveMinuteMark: boolean;
}

interface AppointmentPosition {
  appointment: Appointment;
  top: number;
  height: number;
  left: number;
  width: number;
  originalTop: number;
  originalHeight: number;
  originalLeft: number;
}

export const DayColumn = ({ date, appointments, isToday, isSelected, onDateClick }: DayColumnProps) => {
  const [expandedGroupTop, setExpandedGroupTop] = useState<number | null>(null);
  // Generate time slots from 7:00 AM to 7:00 PM with 5-minute intervals (same as TimelineView)
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const startHour = 7;
    const endHour = 19; // 7 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 5) {
        const timeString = formatTime(hour, minute);
        
        slots.push({
          time: timeString,
          hour,
          minute,
          index: slots.length,
          isQuarterHour: minute % 15 === 0,
          isFiveMinuteMark: minute % 5 === 0
        });
      }
    }
    
    return slots;
  };

  const formatTime = (hour: number, minute: number): string => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    const displayMinute = minute === 0 ? '00' : minute.toString();
    return `${displayHour}:${displayMinute} ${period}`;
  };

  // Parse time string to get hour and minute
  const parseTime = (timeString: string): { hour: number; minute: number } => {
    const [time, period] = timeString.split(' ');
    const [hourStr, minuteStr] = time.split(':');
    let hour = parseInt(hourStr);
    const minute = parseInt(minuteStr);
    
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    
    return { hour, minute };
  };

  const timeSlots = generateTimeSlots();

  // Filter appointments for this specific date
  const filteredAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.date);
    return aptDate.toDateString() === date.toDateString();
  });

  // Calculate appointment positions with overlap detection (same logic as TimelineView)
  const calculateAppointmentPositions = (): AppointmentPosition[] => {
    const startHour = 7;
    const baseLeft = 64; // left-16 = 64px (same as TimelineView for alignment)
    const cardWidth = 200; // Fixed width for all cards (adjusted for week view)
    const offsetIncrement = 20; // Small offset between overlapping cards
    
    const positions = filteredAppointments
      .map(appointment => {
        const { hour, minute } = parseTime(appointment.time);
        
        // Only show appointments within business hours
        if (hour < 7 || hour >= 19) {
          return null;
        }
        
        const totalMinutesFromStart = (hour - startHour) * 60 + minute;
        const top = (totalMinutesFromStart / 5) * 10; // 10px per 5-minute slot
        
        // Parse duration to calculate height
        let durationMinutes = 30; // Default to 30 minutes
        if (appointment.duration && appointment.duration !== 'N/A' && appointment.duration.trim() !== '') {
          const durationMatch = appointment.duration.match(/(\d+)/);
          if (durationMatch) {
            const parsedDuration = parseInt(durationMatch[1]);
            if (parsedDuration > 0) {
              durationMinutes = parsedDuration;
            }
          }
        }
        const height = (durationMinutes / 5) * 10; // 10px per 5-minute slot
        
        return {
          appointment,
          top,
          height: Math.max(height, 60), // Minimum height for readability
          left: baseLeft,
          width: cardWidth,
          originalTop: (totalMinutesFromStart / 5) * 10, // Store original position
          originalHeight: Math.max((durationMinutes / 5) * 10, 60),
          originalLeft: baseLeft
        };
      })
      .filter(Boolean) as AppointmentPosition[];

    // Detect overlaps and calculate horizontal offsets for same-time appointments
    positions.forEach((pos, index) => {
      // Find all appointments that start at the same time (within 5 minutes)
      const sameTimeAppointments = positions.filter((other, otherIndex) => {
        if (index === otherIndex) return false;
        if (pos.originalTop === undefined || other.originalTop === undefined) return false;
        
        // Check if they start at the same time (within 5 minutes)
        const topDiff = Math.abs(pos.originalTop - other.originalTop);
        return topDiff < 10; // Within same 5-minute slot
      });

      if (sameTimeAppointments.length > 0) {
        // Calculate the index within the same-time group (how many appointments before this one)
        const sameTimeIndex = positions.filter((other, otherIndex) => {
          if (otherIndex >= index) return false;
          if (pos.originalTop === undefined || other.originalTop === undefined) return false;
          
          // Check if they start at the same time
          const topDiff = Math.abs(pos.originalTop - other.originalTop);
          return topDiff < 10; // Within same 5-minute slot
        }).length;

        // Set horizontal offset - each overlapping card is offset by 20px
        pos.left = baseLeft + (sameTimeIndex * offsetIncrement);
        pos.width = cardWidth; // Fixed width for all cards
        pos.originalLeft = pos.left; // Store original left position
      } else {
        // No overlaps, use base position
        pos.left = baseLeft;
        pos.width = cardWidth;
        pos.originalLeft = baseLeft; // Store original left position
      }
    });

    // If a group of overlapping appointments is expanded (click-based), expand them
    if (expandedGroupTop !== null) {
      // Find all appointments that belong to this expanded group (same original top position)
      const overlapping = positions.filter(other => {
        if (other.originalTop === undefined) return false;
        // Check if appointments start at the same time (within 5 minutes)
        const topDiff = Math.abs(other.originalTop - expandedGroupTop);
        return topDiff < 10; // Within same 5-minute slot
      });

      if (overlapping.length > 1) {
        // Calculate positions to stack them vertically
        const groupTop = Math.min(...overlapping.map(p => p.originalTop || p.top));
        const minHeight = 60;
        const spacing = 2; // Small gap between expanded appointments
        // Align all events to the left, positioned right after the expand icon
        // Expand icon is at left-2 (8px) with width 24px, so events start at 40px (8px + 24px + 8px spacing)
        const expandedBaseLeft = 40;
        
        overlapping.forEach((pos, index) => {
          pos.top = groupTop + (index * (minHeight + spacing));
          pos.height = minHeight;
          // Align all events to the leftmost position when expanded (same left position)
          pos.left = expandedBaseLeft;
        });
      }
    } else {
      // Reset to original positions when not expanded
      positions.forEach(pos => {
        if (pos.originalTop !== undefined) {
          pos.top = pos.originalTop;
        }
        if (pos.originalHeight !== undefined) {
          pos.height = pos.originalHeight;
        }
        // Restore original left position when collapsed
        if (pos.originalLeft !== undefined) {
          pos.left = pos.originalLeft;
        }
      });
    }

    return positions;
  };

  const appointmentPositions = useMemo(() => calculateAppointmentPositions(), [filteredAppointments, expandedGroupTop]);

  // Calculate which slots have multiple overlapping appointments
  const slotsWithMultipleEvents = useMemo(() => {
    const slotGroups: Map<number, { count: number; firstTop: number }> = new Map();
    
    appointmentPositions.forEach(position => {
      const originalTop = position.originalTop ?? position.top;
      if (originalTop !== undefined) {
        // Round to nearest 10px (5-minute slot) for grouping
        const slotKey = Math.round(originalTop / 10) * 10;
        const existing = slotGroups.get(slotKey);
        if (existing) {
          existing.count += 1;
          // Keep track of the first (lowest) top position in the group
          if (originalTop < existing.firstTop) {
            existing.firstTop = originalTop;
          }
        } else {
          slotGroups.set(slotKey, { count: 1, firstTop: originalTop });
        }
      }
    });

    // Return only slots with 2+ appointments, with their first appointment's top position
    return Array.from(slotGroups.entries())
      .filter(([_, data]) => data.count > 1)
      .map(([_, data]) => data.firstTop);
  }, [appointmentPositions]);

  // Status color functions (same as TimelineView)
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

  return (
    <div className="flex-1 overflow-hidden relative h-full">
      <div className="h-full overflow-y-auto custom-scrollbar">
        <div className="relative" style={{ minHeight: `${timeSlots.length * 10}px` }}>
          
          {/* Timeline Grid - No time labels, they're shown in WeekView */}
          <div className="relative bg-[var(--glass-bg)]/10 h-full">
            {/* Background Grid Lines */}
            <div className="absolute inset-0 z-0">
              {timeSlots.map((slot, index) => (
                <div 
                  key={index}
                  className={`absolute left-0 right-0 ${
                    slot.isQuarterHour 
                      ? 'border-t-2 border-[var(--accent-border)] opacity-60' 
                      : 'border-t border-[var(--glass-border)] opacity-20'
                  }`}
                  style={{ top: `${index * 10}px`, height: '1px' }}
                />
              ))}
            </div>

            {/* Expand/Collapse Icons for Slots with Multiple Events */}
            {slotsWithMultipleEvents.map((slotTop) => {
              const isExpanded = expandedGroupTop !== null && Math.abs(slotTop - expandedGroupTop) < 10;
              return (
                <div
                  key={`expand-${slotTop}`}
                  className="absolute left-2 z-50 flex items-center pt-2"
                  style={{ top: `${slotTop}px`, height: '24px', width: '24px' }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full bg-[var(--glass-bg)]/80 hover:bg-[var(--accent-primary)]/20 border border-[var(--accent-border)] shadow-md hover:shadow-lg transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isExpanded) {
                        setExpandedGroupTop(null);
                      } else {
                        setExpandedGroupTop(slotTop);
                      }
                    }}
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-[var(--accent-text)]" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[var(--accent-text)]" />
                    )}
                  </Button>
                </div>
              );
            })}

            {/* Appointments */}
            {appointmentPositions.map((position) => {
              // Check if this appointment has overlaps using ORIGINAL positions
              const originalTop = position.originalTop ?? position.top;
              const hasOverlaps = appointmentPositions.some(other => {
                if (other.appointment.id === position.appointment.id) return false;
                const otherOriginalTop = other.originalTop ?? other.top;
                const topDiff = Math.abs(otherOriginalTop - originalTop);
                return topDiff < 10; // Within same 5-minute slot
              });
              
              // Check if this appointment is part of the currently expanded group
              const isInExpandedGroup = expandedGroupTop !== null && 
                originalTop !== undefined && 
                Math.abs(originalTop - expandedGroupTop) < 10;
              
              // Calculate z-index: expanded group gets higher priority, then overlaps
              let zIndexValue = 30;
              if (isInExpandedGroup) {
                zIndexValue = 35;
              } else if (hasOverlaps && expandedGroupTop !== null) {
                zIndexValue = 31;
              }
              
              return (
              <div
                key={position.appointment.id}
                className={`absolute z-30 rounded-lg backdrop-blur-md ${getStatusBackgroundColor(position.appointment.status)} border-l-4 ${getStatusLeftBorderColor(position.appointment.status)} border ${getStatusBorderColor(position.appointment.status)} transition-all duration-200 shadow-lg flex items-center cursor-pointer relative hover:shadow-xl hover:scale-[1.02]`}
                style={{ 
                  top: `${position.top}px`, 
                  left: `${position.left}px`,
                  width: `${position.width}px`,
                  height: `${position.height}px`,
                  zIndex: zIndexValue,
                  transition: 'top 0.3s ease-in-out, left 0.3s ease-in-out, height 0.3s ease-in-out, z-index 0.2s ease-in-out'
                }}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1 px-2 py-1">
                  {/* User Avatar */}
                  <Avatar className="w-6 h-6 ring-2 ring-[var(--accent-border)] shadow-md flex-shrink-0">
                    <AvatarImage src={position.appointment.patientImage} />
                    <AvatarFallback className="bg-[var(--accent-primary)] text-[var(--accent-button-text)] text-xs font-medium">
                      {position.appointment.patientName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>

                  {/* Main Content */}
                  <div className="min-w-0 flex-1 flex flex-col justify-center">
                    {/* Patient Name */}
                    <p className="font-semibold text-xs text-foreground truncate mb-0.5">
                      {position.appointment.patientName}
                    </p>
                    
                    {/* Service and Location */}
                    <div className="flex items-center gap-2 text-xs">
                      <div className="flex items-center gap-1 min-w-0">
                        <Briefcase className="w-3 h-3 text-[var(--accent-text)] flex-shrink-0" />
                        <span className="text-muted-foreground truncate text-xs">
                          {position.appointment.service || position.appointment.type}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1 min-w-0">
                        <MapPin className="w-3 h-3 text-[var(--accent-text)] flex-shrink-0" />
                        <span className="text-muted-foreground truncate text-xs">
                          {position.appointment.location}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <Badge className={`text-xs border flex-shrink-0 ${getStatusBackgroundColor(position.appointment.status)} ${getStatusBorderColor(position.appointment.status)}`}>
                    {getStatusText(position.appointment.status)}
                  </Badge>
                </div>
              </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
