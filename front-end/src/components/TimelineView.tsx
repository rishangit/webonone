import { useState, useEffect, useMemo, useRef } from "react";
import { Plus, MoreVertical, CheckCircle, XCircle, Eye, FileText, RotateCcw, Play, Check, User, MapPin, Briefcase, Calendar, Clock, Phone, Receipt, Trash2, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { HoverCard, HoverCardTrigger, HoverCardContent, HoverCardArrow } from "./ui/hover-card";
import { DateDisplay } from "./common/DateDisplay";
import { AppointmentWizard } from "../pages/appointments";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { updateAppointmentRequest, deleteAppointmentRequest } from "../store/slices/appointmentsSlice";
import { fetchStaffRequest } from "../store/slices/staffSlice";
import { toast } from "sonner";
import { formatAvatarUrl } from "../utils";
import { normalizeAppointmentStatus, getAppointmentStatusLabel, AppointmentStatus } from "../types/appointmentStatus";

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

interface TimelineViewProps {
  currentUser?: User | null;
  selectedDate?: Date;
  appointments: Appointment[];
  onDateChange?: (date: Date) => void;
  hideHeader?: boolean; // Option to hide the header for week view
  compact?: boolean; // Option for compact mode in week view
  hideTimeLabels?: boolean; // Option to hide time labels column for week view (shared time column)
}

interface TimeSlot {
  time: string;
  hour: number;
  minute: number;
  appointment: Appointment | null;
  index: number;
  isQuarterHour: boolean;
  isFiveMinuteMark: boolean;
}

interface AppointmentPosition {
  appointment: Appointment;
  top: number;
  height: number;
  left?: number;
  width?: number;
  originalTop?: number;
  originalHeight?: number;
  originalLeft?: number;
}

export function TimelineView({ currentUser, selectedDate, appointments, onDateChange, hideHeader = false, compact = false, hideTimeLabels = false }: TimelineViewProps) {
  const dispatch = useAppDispatch();
  const { staff } = useAppSelector((state) => state.staff);
  const { user } = useAppSelector((state) => state.auth);
  const companyId = user?.companyId || currentUser?.companyId;
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);
  const [hoveredAppointmentId, setHoveredAppointmentId] = useState<string | null>(null);
  const [expandedGroupTop, setExpandedGroupTop] = useState<number | null>(null);
  const [selectOpenMap, setSelectOpenMap] = useState<Record<string, boolean>>({});
  const [dropdownOpenMap, setDropdownOpenMap] = useState<Record<string, boolean>>({});
  const selectOpenRef = useRef<Record<string, boolean>>({});
  const dropdownOpenRef = useRef<Record<string, boolean>>({});

  // Fetch staff if needed
  useEffect(() => {
    if (companyId) {
      dispatch(fetchStaffRequest({ companyId }));
    }
  }, [dispatch, companyId]);


  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const getStatusColor = (status: string | number) => {
    // Normalize status first - use same logic as AppointmentCard
    const normalizedStatus = normalizeAppointmentStatus(status);
    if (normalizedStatus === null) return 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30';
    
    // Use same colors as AppointmentCard
    switch (normalizedStatus) {
      case AppointmentStatus.CONFIRMED: 
        return 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30';
      case AppointmentStatus.PENDING: 
        return 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30';
      case AppointmentStatus.IN_PROGRESS: 
        return 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30';
      case AppointmentStatus.COMPLETED: 
        return 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30';
      case AppointmentStatus.CANCELLED: 
        return 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30';
      case AppointmentStatus.NO_SHOW: 
        return 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30';
      default: 
        return 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30';
    }
  };

  // Get status color for background (without text/border classes)
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

  // Get status border color
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

  // Get status left border color (for the left border accent)
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
    // Normalize status using the helper function
    const normalizedStatus = normalizeAppointmentStatus(status);
    if (normalizedStatus !== null) {
      return getAppointmentStatusLabel(normalizedStatus);
    }
    
    // Fallback: handle string statuses
    if (typeof status === 'string') {
      const lowerStatus = status.toLowerCase();
      switch (lowerStatus) {
        case 'in_progress': 
        case 'in-progress': 
        case 'inprogress': 
          return 'In Progress';
        case 'pending': return 'Pending';
        case 'confirmed': return 'Confirmed';
        case 'completed': return 'Completed';
        case 'cancelled': 
        case 'canceled': 
          return 'Cancelled';
        case 'no_show': 
        case 'no-show': 
        case 'noshow': 
          return 'No Show';
        case '0': return 'Pending';
        default: return 'Pending';
      }
    }
    
    // If status is 0 (number), return Pending
    if (typeof status === 'number' && status === 0) {
      return 'Pending';
    }
    
    // Default fallback
    return 'Pending';
  };

  // Generate time slots from 7:00 AM to 7:00 PM with 5-minute intervals
  const generateTimeSlots = (): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const startHour = 7;
    const endHour = 19; // 7 PM
    
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += 5) {
        const timeString = formatTime(hour, minute);
        const appointment = appointments.find(apt => apt.time === timeString) || null;
        
        slots.push({
          time: timeString,
          hour,
          minute,
          appointment,
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

  const getCurrentTimePosition = (): { top: number; isVisible: boolean } => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    const startHour = 7;
    const endHour = 19;
    
    if (currentHour < startHour || currentHour >= endHour) {
      return { top: -1, isVisible: false }; // Outside business hours
    }
    
    // Calculate exact position (each hour = 120px, each 5-min slot = 10px)
    const totalMinutesFromStart = (currentHour - startHour) * 60 + currentMinute;
    const pixelPosition = (totalMinutesFromStart / 5) * 10; // 10px per 5-minute slot
    
    return { top: pixelPosition, isVisible: true };
  };

  // Filter appointments for the selected date first
  const filteredAppointments = appointments.filter(apt => {
    if (!selectedDate) return false;
    const aptDate = new Date(apt.date);
    return aptDate.toDateString() === selectedDate.toDateString();
  });

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

  // Calculate appointment positions for absolute positioning with overlap detection
  const calculateAppointmentPositions = (): AppointmentPosition[] => {
    const startHour = 7;
    const baseLeft = 64; // left-16 = 64px (16 * 4px)
    const cardWidth = 280; // Fixed width for all cards
    const offsetIncrement = 20; // Small offset between overlapping cards
    
    const positions = filteredAppointments.map(appointment => {
      const { hour, minute } = parseTime(appointment.time);
      
      // Only show appointments within business hours
      if (hour < 7 || hour >= 19) {
        return null;
      }
      
      const totalMinutesFromStart = (hour - startHour) * 60 + minute;
      const top = (totalMinutesFromStart / 5) * 10; // 10px per 5-minute slot
      
      // Parse duration to calculate height - extract number from duration string (e.g., "30 min" -> 30)
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
        originalHeight: Math.max((durationMinutes / 5) * 10, 60)
      };
    }).filter(Boolean) as (AppointmentPosition & { originalTop: number; originalHeight: number; left: number; width: number })[];

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

  const timeSlots = generateTimeSlots();
  const currentTimeInfo = getCurrentTimePosition();
  const isToday = selectedDate?.toDateString() === new Date().toDateString();
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

  // Handle appointment actions
  const handleConfirmAppointment = (appointment: Appointment) => {
    toast.success(`Appointment for ${appointment.patientName} confirmed!`);
  };

  const handleStartSession = (appointment: Appointment) => {
    toast.success(`Session started for ${appointment.patientName}!`);
  };

  const handleCompleteAppointment = (appointment: Appointment) => {
    toast.success(`Appointment for ${appointment.patientName} completed!`);
  };

  const handleCancelAppointment = (appointment: Appointment) => {
    toast.error(`Appointment for ${appointment.patientName} cancelled`);
  };

  const handleReschedule = (appointment: Appointment) => {
    toast.info(`Reschedule functionality for ${appointment.patientName}`);
  };

  const handleDeleteAppointment = (appointment: Appointment) => {
    const appointmentId = appointment._originalAppointment?.id || appointment.id;
    if (appointmentId && window.confirm(`Are you sure you want to delete the appointment for ${appointment.patientName}?`)) {
      dispatch(deleteAppointmentRequest(appointmentId));
      toast.success(`Appointment for ${appointment.patientName} deleted`);
    }
  };

  const handlePreviousDate = () => {
    if (selectedDate && onDateChange) {
      const previousDate = new Date(selectedDate);
      previousDate.setDate(previousDate.getDate() - 1);
      onDateChange(previousDate);
    }
  };

  const handleNextDate = () => {
    if (selectedDate && onDateChange) {
      const nextDate = new Date(selectedDate);
      nextDate.setDate(nextDate.getDate() + 1);
      onDateChange(nextDate);
    }
  };

  const timelineContent = (
    <>
      {!hideHeader && (
        <div className="flex items-center justify-between mb-6 flex-shrink-0">
          {/* Previous Date Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePreviousDate}
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
            disabled={!selectedDate || !onDateChange}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          {/* Centered Date Display */}
          <div className="flex flex-col items-center flex-1">
            <h3 className="font-semibold text-foreground text-center">
              {selectedDate?.toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric',
                year: 'numeric'
              })}
            </h3>
            <p className="text-sm text-[var(--accent-text)] mt-1 text-center font-medium">
              {filteredAppointments.length} appointments scheduled
            </p>
          </div>

          {/* Next Date Button and Today Badge */}
          <div className="flex items-center gap-2">
            {isToday && (
              <Badge className="bg-[var(--accent-bg)] text-[var(--accent-text)] border border-[var(--accent-border)]">
                Today
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNextDate}
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
              disabled={!selectedDate || !onDateChange}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Scrollable Timeline Container */}
      <div className="flex-1 overflow-hidden relative">
        <div className={`h-full ${compact ? 'overflow-visible' : 'overflow-y-auto custom-scrollbar'}`}>
          <div className="relative flex" style={{ minHeight: `${timeSlots.length * 10}px` }}>
            
            {/* Time Labels Column - Hidden in week view */}
            {!hideTimeLabels && (
              <div className="w-24 relative bg-[var(--glass-bg)]/30 border-r-2 border-[var(--accent-border)] flex-shrink-0 z-10">
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
            )}

            {/* Timeline Grid */}
            <div className="flex-1 relative bg-[var(--glass-bg)]/10">
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

              {/* Current Time Indicator */}
              {isToday && currentTimeInfo.isVisible && (
                <div 
                  className="absolute left-0 right-0 z-40 flex items-center pointer-events-none"
                  style={{ top: `${currentTimeInfo.top}px` }}
                >
                  <div className="w-3 h-3 bg-red-500 rounded-full shadow-lg border-2 border-white -ml-1"></div>
                  <div className="flex-1 h-1 bg-red-500 shadow-lg"></div>
                  <div className="text-xs font-bold text-white bg-red-500 px-3 py-1 rounded-full shadow-lg mr-2">
                    {currentTime.toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit',
                      hour12: true 
                    })}
                  </div>
                </div>
              )}

              {/* Appointments */}
              {appointmentPositions.length > 0 && appointmentPositions.map((position, index) => {
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
                
                const appointmentId = position.appointment.id;
                const isSelectOpen = selectOpenMap[appointmentId] || false;
                const isDropdownOpen = dropdownOpenMap[appointmentId] || false;
                const isMenuOpen = isSelectOpen || isDropdownOpen;
                const isHovered = hoveredAppointmentId === appointmentId;
                
                // Update refs when state changes (synchronously)
                selectOpenRef.current[appointmentId] = isSelectOpen;
                dropdownOpenRef.current[appointmentId] = isDropdownOpen;
                
                // Calculate z-index: hovered items get highest priority, then expanded group, then overlaps
                let zIndexValue = 30;
                if (isHovered) {
                  zIndexValue = 50; // Highest priority for hovered items
                } else if (isInExpandedGroup) {
                  zIndexValue = 35;
                } else if (hasOverlaps && expandedGroupTop !== null) {
                  zIndexValue = 31;
                }
                
                return (
                  <HoverCard 
                    key={appointmentId} 
                    openDelay={300} 
                    closeDelay={isMenuOpen ? 10000 : 100}
                    {...(isMenuOpen ? {
                      open: true,
                      onOpenChange: (open: boolean) => {
                        // Prevent closing when Select or DropdownMenu is open
                        if (!open && (selectOpenRef.current[appointmentId] || dropdownOpenRef.current[appointmentId])) {
                          return;
                        }
                      }
                    } : {})}
                  >
                    <div
                      className="absolute z-30 group transition-all duration-300 ease-in-out"
                      style={{ 
                        top: `${position.top}px`, 
                        left: `${position.left || 64}px`,
                        width: `${position.width || 280}px`,
                        height: `${position.height}px`,
                        zIndex: zIndexValue,
                        transition: 'top 0.3s ease-in-out, left 0.3s ease-in-out, height 0.3s ease-in-out, z-index 0.2s ease-in-out'
                      }}
                      onMouseEnter={() => setHoveredAppointmentId(appointmentId)}
                      onMouseLeave={() => setHoveredAppointmentId(null)}
                      data-group-top={originalTop}
                    >
                      <HoverCardTrigger asChild>
                        <div className={`h-full py-4 px-4 rounded-lg backdrop-blur-md ${getStatusBackgroundColor(position.appointment.status)} border-l-4 ${getStatusLeftBorderColor(position.appointment.status)} border ${getStatusBorderColor(position.appointment.status)} transition-all duration-200 shadow-lg flex items-center cursor-pointer relative ${
                          isHovered 
                            ? 'shadow-2xl scale-[1.03] opacity-100' 
                            : 'hover:opacity-80 hover:shadow-xl group-hover:scale-[1.02]'
                        }`}>
                          <div className="flex items-center gap-3 min-w-0 flex-1 ml-2">
                          {/* User Avatar */}
                          <Avatar className="w-8 h-8 ring-2 ring-[var(--accent-border)] shadow-lg flex-shrink-0">
                            <AvatarImage src={position.appointment.patientImage} />
                            <AvatarFallback className="bg-[var(--accent-primary)] text-[var(--accent-button-text)] text-xs font-medium">
                              {position.appointment.patientName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>

                          {/* Main Content - Vertically Centered */}
                          <div className="min-w-0 flex-1 flex flex-col justify-center">
                            {/* Patient Name */}
                            <p className="font-semibold text-sm text-foreground truncate mb-1.5">
                              {position.appointment.patientName}
                            </p>
                            
                            {/* Service and Location on one line */}
                            <div className="flex items-center gap-3 text-xs">
                              {/* Service with icon */}
                              <div className="flex items-center gap-1 min-w-0">
                                <Briefcase className="w-3 h-3 text-[var(--accent-text)] flex-shrink-0" />
                                <span className="text-muted-foreground truncate">
                                  {position.appointment.service || position.appointment.type}
                                </span>
                              </div>
                              
                              {/* Space Icon and Location */}
                              <div className="flex items-center gap-1 min-w-0">
                                <MapPin className="w-3 h-3 text-[var(--accent-text)] flex-shrink-0" />
                                <span className="text-muted-foreground truncate">
                                  {position.appointment.location}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Right Side: Status and Actions */}
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {/* Status Badge */}
                            <Badge className={`text-xs border ${getStatusColor(position.appointment.status)}`}>
                              {getStatusText(position.appointment.status)}
                            </Badge>
                            
                            {/* Action Menu */}
                            <DropdownMenu
                              open={dropdownOpenMap[appointmentId] || false}
                              onOpenChange={(open) => {
                                setDropdownOpenMap(prev => ({
                                  ...prev,
                                  [appointmentId]: open
                                }));
                                dropdownOpenRef.current[appointmentId] = open;
                              }}
                            >
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="text-muted-foreground hover:text-foreground hover:bg-accent h-8 w-8"
                                  onClick={(e) => e.stopPropagation()}
                                  onPointerDown={(e) => e.stopPropagation()}
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent 
                                className="bg-popover border-border" 
                                align="end"
                                onPointerDown={(e) => e.stopPropagation()}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {(() => {
                                  const normalizedStatus = normalizeAppointmentStatus(position.appointment.status);
                                  if (normalizedStatus === AppointmentStatus.PENDING) {
                                    return (
                                      <>
                                        <DropdownMenuItem 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleConfirmAppointment(position.appointment);
                                            setDropdownOpenMap(prev => ({ ...prev, [appointmentId]: false }));
                                          }}
                                        >
                                          <CheckCircle className="w-4 h-4 mr-2" />
                                          Confirm Appointment
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleReschedule(position.appointment);
                                            setDropdownOpenMap(prev => ({ ...prev, [appointmentId]: false }));
                                          }}
                                        >
                                          <RotateCcw className="w-4 h-4 mr-2" />
                                          Reschedule
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCancelAppointment(position.appointment);
                                            setDropdownOpenMap(prev => ({ ...prev, [appointmentId]: false }));
                                          }} 
                                          className="text-red-600 dark:text-red-400"
                                        >
                                          <XCircle className="w-4 h-4 mr-2" />
                                          Cancel Appointment
                                        </DropdownMenuItem>
                                      </>
                                    );
                                  }
                                  if (normalizedStatus === AppointmentStatus.CONFIRMED) {
                                    return (
                                      <>
                                        <DropdownMenuItem 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleStartSession(position.appointment);
                                            setDropdownOpenMap(prev => ({ ...prev, [appointmentId]: false }));
                                          }}
                                        >
                                          <Play className="w-4 h-4 mr-2" />
                                          Start Session
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleReschedule(position.appointment);
                                            setDropdownOpenMap(prev => ({ ...prev, [appointmentId]: false }));
                                          }}
                                        >
                                          <RotateCcw className="w-4 h-4 mr-2" />
                                          Reschedule
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCancelAppointment(position.appointment);
                                            setDropdownOpenMap(prev => ({ ...prev, [appointmentId]: false }));
                                          }} 
                                          className="text-red-600 dark:text-red-400"
                                        >
                                          <XCircle className="w-4 h-4 mr-2" />
                                          Cancel Appointment
                                        </DropdownMenuItem>
                                      </>
                                    );
                                  }
                                  if (normalizedStatus === AppointmentStatus.IN_PROGRESS) {
                                    return (
                                      <>
                                        <DropdownMenuItem 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCompleteAppointment(position.appointment);
                                            setDropdownOpenMap(prev => ({ ...prev, [appointmentId]: false }));
                                          }} 
                                          className="text-green-600 dark:text-green-400"
                                        >
                                          <Check className="w-4 h-4 mr-2" />
                                          Complete Appointment
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setDropdownOpenMap(prev => ({ ...prev, [appointmentId]: false }));
                                          }}
                                        >
                                          <FileText className="w-4 h-4 mr-2" />
                                          Add Notes
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setDropdownOpenMap(prev => ({ ...prev, [appointmentId]: false }));
                                          }}
                                        >
                                          <Eye className="w-4 h-4 mr-2" />
                                          View Details
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleCancelAppointment(position.appointment);
                                            setDropdownOpenMap(prev => ({ ...prev, [appointmentId]: false }));
                                          }} 
                                          className="text-red-600 dark:text-red-400"
                                        >
                                          <XCircle className="w-4 h-4 mr-2" />
                                          Cancel Session
                                        </DropdownMenuItem>
                                      </>
                                    );
                                  }
                                  if (normalizedStatus === AppointmentStatus.COMPLETED) {
                                    return (
                                      <>
                                        <DropdownMenuItem 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setDropdownOpenMap(prev => ({ ...prev, [appointmentId]: false }));
                                          }}
                                        >
                                          <Receipt className="w-4 h-4 mr-2" />
                                          View Bill
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setDropdownOpenMap(prev => ({ ...prev, [appointmentId]: false }));
                                          }}
                                        >
                                          <Eye className="w-4 h-4 mr-2" />
                                          View Details
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setDropdownOpenMap(prev => ({ ...prev, [appointmentId]: false }));
                                          }}
                                        >
                                          <FileText className="w-4 h-4 mr-2" />
                                          Generate Report
                                        </DropdownMenuItem>
                                      </>
                                    );
                                  }
                                  if (normalizedStatus === AppointmentStatus.CANCELLED) {
                                    return (
                                      <>
                                        <DropdownMenuItem 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleReschedule(position.appointment);
                                            setDropdownOpenMap(prev => ({ ...prev, [appointmentId]: false }));
                                          }}
                                        >
                                          <RotateCcw className="w-4 h-4 mr-2" />
                                          Reschedule
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setDropdownOpenMap(prev => ({ ...prev, [appointmentId]: false }));
                                          }}
                                        >
                                          <Eye className="w-4 h-4 mr-2" />
                                          View Reason
                                        </DropdownMenuItem>
                                      </>
                                    );
                                  }
                                  return null;
                                })()}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteAppointment(position.appointment);
                                    setDropdownOpenMap(prev => ({ ...prev, [appointmentId]: false }));
                                  }} 
                                  className="text-red-600 dark:text-red-400"
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete Appointment
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent 
                      className="w-80 bg-gradient-to-br from-[var(--accent-bg)]/95 to-[var(--glass-bg)] backdrop-blur-xl shadow-2xl py-2 px-4"
                      side="top"
                      align="center"
                      sideOffset={12}
                    >
                      <HoverCardArrow className="fill-[var(--accent-bg)]/95" />
                      <div className="space-y-2.5">
                        {/* Header with Avatar and Name - Accent Styled */}
                        <div className="flex items-center gap-3 pb-2">
                          <Avatar className="w-12 h-12 ring-2 ring-[var(--accent-primary)] shadow-lg">
                            <AvatarImage src={position.appointment.patientImage} />
                            <AvatarFallback className="bg-[var(--accent-primary)] text-[var(--accent-button-text)] text-sm font-semibold">
                              {position.appointment.patientName.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-base text-[var(--accent-text)] truncate mb-1">{position.appointment.patientName}</h4>
                            {position.appointment.status !== undefined && 
                             position.appointment.status !== null && (
                              <Badge className={`text-xs ${getStatusColor(position.appointment.status)} font-semibold`}>
                                {getStatusText(position.appointment.status)}
                              </Badge>
                            )}
                          </div>
                          {/* 3-dot menu in popup */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent h-8 w-8 flex-shrink-0">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="bg-popover border-border" align="end">
                              {(() => {
                                const normalizedStatus = normalizeAppointmentStatus(position.appointment.status);
                                if (normalizedStatus === AppointmentStatus.PENDING) {
                                  return (
                                    <>
                                      <DropdownMenuItem onClick={() => handleConfirmAppointment(position.appointment)}>
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Confirm Appointment
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleReschedule(position.appointment)}>
                                        <RotateCcw className="w-4 h-4 mr-2" />
                                        Reschedule
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => handleCancelAppointment(position.appointment)} className="text-red-600 dark:text-red-400">
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Cancel Appointment
                                      </DropdownMenuItem>
                                    </>
                                  );
                                }
                                if (normalizedStatus === AppointmentStatus.CONFIRMED) {
                                  return (
                                    <>
                                      <DropdownMenuItem onClick={() => handleStartSession(position.appointment)}>
                                        <Play className="w-4 h-4 mr-2" />
                                        Start Session
                                      </DropdownMenuItem>
                                      <DropdownMenuItem onClick={() => handleReschedule(position.appointment)}>
                                        <RotateCcw className="w-4 h-4 mr-2" />
                                        Reschedule
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => handleCancelAppointment(position.appointment)} className="text-red-600 dark:text-red-400">
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Cancel Appointment
                                      </DropdownMenuItem>
                                    </>
                                  );
                                }
                                if (normalizedStatus === AppointmentStatus.IN_PROGRESS) {
                                  return (
                                    <>
                                      <DropdownMenuItem onClick={() => handleCompleteAppointment(position.appointment)} className="text-green-600 dark:text-green-400">
                                        <Check className="w-4 h-4 mr-2" />
                                        Complete Appointment
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <FileText className="w-4 h-4 mr-2" />
                                        Add Notes
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Details
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem onClick={() => handleCancelAppointment(position.appointment)} className="text-red-600 dark:text-red-400">
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Cancel Session
                                      </DropdownMenuItem>
                                    </>
                                  );
                                }
                                if (normalizedStatus === AppointmentStatus.COMPLETED) {
                                  return (
                                    <>
                                      <DropdownMenuItem>
                                        <Receipt className="w-4 h-4 mr-2" />
                                        View Bill
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Details
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <FileText className="w-4 h-4 mr-2" />
                                        Generate Report
                                      </DropdownMenuItem>
                                    </>
                                  );
                                }
                                if (normalizedStatus === AppointmentStatus.CANCELLED) {
                                  return (
                                    <>
                                      <DropdownMenuItem onClick={() => handleReschedule(position.appointment)}>
                                        <RotateCcw className="w-4 h-4 mr-2" />
                                        Reschedule
                                      </DropdownMenuItem>
                                      <DropdownMenuItem>
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Reason
                                      </DropdownMenuItem>
                                    </>
                                  );
                                }
                                return null;
                              })()}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDeleteAppointment(position.appointment)} className="text-red-600 dark:text-red-400">
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Appointment
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        {/* Appointment Details - Accent Cards */}
                        <div className="space-y-1.5">
                          {/* Date & Time - Combined in accent card */}
                          <div className="p-2 rounded-lg bg-[var(--accent-bg)]/50">
                            <div className="flex items-center gap-2 text-sm mb-1">
                              <Calendar className="w-4 h-4 text-[var(--accent-primary)] flex-shrink-0" />
                              <DateDisplay date={position.appointment.date} className="text-foreground font-semibold" />
                            </div>
                            <div className="flex items-center gap-2 text-sm pl-6">
                              <Clock className="w-4 h-4 text-[var(--accent-text)] flex-shrink-0" />
                              <span className="text-foreground font-medium">{position.appointment.time}</span>
                              {position.appointment.duration && 
                               position.appointment.duration.trim() !== '' && 
                               position.appointment.duration !== 'N/A' &&
                               position.appointment.duration !== '0' &&
                               position.appointment.duration !== '0 min' && (
                                <span className="text-muted-foreground">({position.appointment.duration})</span>
                              )}
                            </div>
                          </div>

                          {/* Service - Accent card */}
                          <div className="p-2 rounded-lg bg-[var(--accent-bg)]/50">
                            <div className="flex items-center gap-2 text-sm">
                              <Briefcase className="w-4 h-4 text-[var(--accent-primary)] flex-shrink-0" />
                              <span className="text-foreground font-semibold">{position.appointment.service || position.appointment.type}</span>
                            </div>
                          </div>

                          {/* Location - Accent card */}
                          <div className="p-2 rounded-lg bg-[var(--accent-bg)]/50">
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="w-4 h-4 text-[var(--accent-primary)] flex-shrink-0" />
                              <span className="text-foreground font-semibold">{position.appointment.location}</span>
                            </div>
                          </div>

                          {/* Phone - Accent card */}
                          {position.appointment.phone && position.appointment.phone !== '0' && position.appointment.phone.trim() !== '' && (
                            <div className="p-2 rounded-lg bg-[var(--accent-bg)]/50">
                              <div className="flex items-center gap-2 text-sm">
                                <Phone className="w-4 h-4 text-[var(--accent-primary)] flex-shrink-0" />
                                <span className="text-foreground font-semibold">{position.appointment.phone}</span>
                              </div>
                            </div>
                          )}

                          {/* Staff Assignment Dropdown - Show when staff is assigned OR preferred staff exists */}
                          {(position.appointment.staff || (position.appointment.preferredStaff && position.appointment.preferredStaff.length > 0)) && (() => {
                            // Find the assigned staff member from the staff list
                            const assignedStaffMember = position.appointment.staff 
                              ? staff.find(s => {
                                  const staffFullName = `${s.firstName || ''} ${s.lastName || ''}`.trim();
                                  return staffFullName === position.appointment.staff?.name || 
                                         (position.appointment.staff?.id && s.id === position.appointment.staff.id);
                                })
                              : null;
                            
                            return (
                            <div 
                              className="p-2 rounded-lg bg-[var(--accent-bg)]/50"
                              onPointerDown={(e) => e.stopPropagation()}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="flex items-center gap-2 text-sm mb-2">
                                <User className="w-4 h-4 text-[var(--accent-primary)] flex-shrink-0" />
                                <span className="text-foreground font-semibold">
                                  {position.appointment.staff ? 'Assigned Staff:' : 'Preferred Staff:'}
                                </span>
                              </div>
                              <Select
                                value={assignedStaffMember?.id || ''}
                                open={isSelectOpen}
                                onOpenChange={(open) => {
                                  setSelectOpenMap(prev => ({
                                    ...prev,
                                    [appointmentId]: open
                                  }));
                                }}
                                onValueChange={(staffId) => {
                                  const originalAppointmentId = position.appointment._originalAppointment?.id || position.appointment.id;
                                  if (staffId && originalAppointmentId) {
                                    dispatch(updateAppointmentRequest({
                                      id: originalAppointmentId,
                                      data: {
                                        staffId: staffId,
                                        status: 'Confirmed'
                                      }
                                    }));
                                    toast.success('Staff assigned successfully');
                                    // Close Select after assignment
                                    setSelectOpenMap(prev => ({
                                      ...prev,
                                      [appointmentId]: false
                                    }));
                                  }
                                }}
                              >
                                <SelectTrigger 
                                  className="w-full bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground h-8 text-sm"
                                  onPointerDown={(e) => e.stopPropagation()}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <SelectValue 
                                    placeholder={position.appointment.staff ? position.appointment.staff.name : "Select staff to assign"} 
                                  />
                                </SelectTrigger>
                                <SelectContent 
                                  className="bg-popover border-border"
                                  onPointerDown={(e) => e.stopPropagation()}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {/* Show assigned staff first if exists */}
                                  {assignedStaffMember && (
                                    <SelectItem 
                                      key={assignedStaffMember.id} 
                                      value={assignedStaffMember.id}
                                      onPointerDown={(e) => e.stopPropagation()}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <div className="flex items-center gap-2">
                                        <Avatar className="w-6 h-6">
                                          <AvatarImage src={formatAvatarUrl(assignedStaffMember.avatar, assignedStaffMember.firstName, assignedStaffMember.lastName)} />
                                          <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)] text-xs">
                                            {`${(assignedStaffMember.firstName?.[0] || '')}${(assignedStaffMember.lastName?.[0] || '')}`}
                                          </AvatarFallback>
                                        </Avatar>
                                        <span>{`${assignedStaffMember.firstName || ''} ${assignedStaffMember.lastName || ''}`.trim()}</span>
                                        {assignedStaffMember.role && (
                                          <span className="text-muted-foreground">• {assignedStaffMember.role}</span>
                                        )}
                                        <Badge className="ml-auto bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30 text-xs">
                                          Assigned
                                        </Badge>
                                      </div>
                                    </SelectItem>
                                  )}
                                  
                                  {/* Show preferred staff */}
                                  {position.appointment.preferredStaff && staff
                                    .filter(s => {
                                      const staffFullName = `${s.firstName || ''} ${s.lastName || ''}`.trim();
                                      // Include if it's in preferred staff list
                                      const isPreferred = position.appointment.preferredStaff?.some(
                                        ps => ps.name === staffFullName || ps.id === s.id
                                      );
                                      // Exclude if it's the same as assigned staff
                                      const isAssigned = position.appointment.staff && (
                                        staffFullName === position.appointment.staff.name ||
                                        (position.appointment.staff.id && s.id === position.appointment.staff.id)
                                      );
                                      return isPreferred && !isAssigned;
                                    })
                                    .map((staffMember) => (
                                      <SelectItem 
                                        key={staffMember.id} 
                                        value={staffMember.id}
                                        onPointerDown={(e) => e.stopPropagation()}
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <div className="flex items-center gap-2">
                                          <Avatar className="w-6 h-6">
                                            <AvatarImage src={formatAvatarUrl(staffMember.avatar, staffMember.firstName, staffMember.lastName)} />
                                            <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)] text-xs">
                                              {`${(staffMember.firstName?.[0] || '')}${(staffMember.lastName?.[0] || '')}`}
                                            </AvatarFallback>
                                          </Avatar>
                                          <span>{`${staffMember.firstName || ''} ${staffMember.lastName || ''}`.trim()}</span>
                                          {staffMember.role && (
                                            <span className="text-muted-foreground">• {staffMember.role}</span>
                                          )}
                                        </div>
                                      </SelectItem>
                                    ))}
                                </SelectContent>
                              </Select>
                            </div>
                            );
                          })()}
                        </div>
                      </div>
                    </HoverCardContent>
                  </div>
                </HoverCard>
                );
              })}



              {/* Add Appointment Overlay - Show on all time slots when hovered */}
              <div className="absolute inset-0 z-10">
                {timeSlots.map((slot, index) => {
                  const slotTop = index * 10;
                  
                  return (
                    slot.isQuarterHour && (
                      <div 
                        key={index}
                        className="absolute left-2 right-2 group cursor-pointer"
                        style={{ 
                          top: `${slotTop}px`, 
                          height: '30px' // 15 minutes = 3 slots * 10px
                        }}
                        onMouseEnter={() => setHoveredSlot(index)}
                        onMouseLeave={() => setHoveredSlot(null)}
                      >
                        {hoveredSlot === index && (
                          <div className="flex items-center justify-end h-full pr-2">
                            <AppointmentWizard 
                              currentUser={currentUser}
                              selectedDate={selectedDate}
                              selectedTime={slot.time}
                              trigger={
                                <Button 
                                  size="sm" 
                                  className="h-6 px-2 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:from-[var(--accent-primary-hover)] hover:to-[var(--accent-primary)] text-[var(--accent-button-text)] text-xs shadow-lg shadow-[var(--accent-primary)]/25 transition-all rounded-md"
                                >
                                  <Plus className="w-3 h-3 mr-1" />
                                  Add
                                </Button>
                              }
                            />
                          </div>
                        )}
                      </div>
                    )
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  if (compact) {
    // For week view - return without Card wrapper, no overflow to prevent scrollbars
    return (
      <div className="h-full flex flex-col overflow-visible">
        {timelineContent}
      </div>
    );
  }

  // For day view - return with Card wrapper
  return (
    <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] min-h-[500px] flex flex-col h-full">
      {timelineContent}
    </Card>
  );
}