import { useState, useEffect, useMemo } from "react";
import { Calendar, Users, CheckCircle, Clock, UserPlus, BarChart3, Settings, Bug } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { AppointmentCard } from "../appointments/AppointmentCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchAppointmentsRequest } from "../../store/slices/appointmentsSlice";
import { fetchUsersRequest } from "../../store/slices/usersSlice";
import { fetchServicesRequest } from "../../store/slices/servicesSlice";
import { fetchStaffRequest } from "../../store/slices/staffSlice";
import { fetchSpacesRequest } from "../../store/slices/spacesSlice";
import { formatAvatarUrl, formatDate } from "../../utils";
import { AppointmentStatus, normalizeAppointmentStatus, getAppointmentStatusLabel } from "../../types/appointmentStatus";
import { Appointment } from "../../services/appointments";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Carousel, CarouselContent, CarouselItem } from "../../components/ui/carousel";

// Stats will be calculated from real data

interface DashboardProps {
  onNavigate?: (page: string) => void;
}

export const Dashboard = ({ onNavigate }: DashboardProps = {}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { appointments: reduxAppointments, loading, error } = useAppSelector((state) => state.appointments);
  const { users } = useAppSelector((state) => state.users);
  const { services } = useAppSelector((state) => state.services);
  const { staff } = useAppSelector((state) => state.staff);
  const { spaces } = useAppSelector((state) => state.spaces);
  const { user } = useAppSelector((state) => state.auth);

  const [selectedPeriod, setSelectedPeriod] = useState("today");

  // Get company ID from user
  const companyId = user?.companyId;

  // Get today's date in YYYY-MM-DD format (timezone-independent)
  // Use UTC to avoid timezone issues - DATE columns in MySQL are timezone-independent
  const todayDate = useMemo(() => {
    const now = new Date();
    // Use local date components (not UTC) since we want the user's local "today"
    // But ensure we format it consistently as YYYY-MM-DD
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    console.log('[Dashboard] Today date calculated:', dateStr, 'Local time:', now.toLocaleString());
    return dateStr;
  }, []);

  // Fetch appointments and related data on mount
  useEffect(() => {
    if (companyId) {
      // Fetch all appointments (no date filter) to get accurate stats
      // We'll filter for today on the frontend
      dispatch(fetchAppointmentsRequest({ 
        companyId,
        filters: {
          limit: 1000 // Get all appointments for stats and filtering
        }
      }));
      dispatch(fetchUsersRequest({}));
      dispatch(fetchServicesRequest({ companyId }));
      dispatch(fetchStaffRequest({ companyId }));
      dispatch(fetchSpacesRequest({ companyId }));
    }
  }, [dispatch, companyId]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Transform appointments to match AppointmentCard format and filter for today
  const todaysAppointments = useMemo(() => {
    if (!reduxAppointments || reduxAppointments.length === 0) {
      console.log('[Dashboard] No appointments in Redux state');
      return [];
    }

    console.log('[Dashboard] Total appointments:', reduxAppointments.length);
    console.log('[Dashboard] Today date:', todayDate);

    const filtered = reduxAppointments
      .filter((appointment: Appointment) => {
        if (!appointment.date) {
          console.log('[Dashboard] Appointment missing date:', appointment.id);
          return false;
        }

        // Handle different date formats - normalize to YYYY-MM-DD
        // IMPORTANT: When backend returns ISO strings with timezone (e.g., '2026-01-03T18:30:00.000Z'),
        // we need to parse it and use LOCAL date components, not UTC, to match the database DATE value
        let appointmentDate: string | null = null;
        if (typeof appointment.date === 'string') {
          // Handle ISO format with time (2024-01-15T00:00:00.000Z or 2024-01-15T00:00:00)
          if (appointment.date.includes('T')) {
            // Parse the ISO string and use LOCAL date components (not UTC)
            // This ensures we get the correct date regardless of timezone
            try {
              const dateObj = new Date(appointment.date);
              if (!isNaN(dateObj.getTime())) {
                // Use LOCAL date components to match the database DATE format
                // The database DATE is timezone-independent, so we use local date
                const year = dateObj.getFullYear();
                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                const day = String(dateObj.getDate()).padStart(2, '0');
                appointmentDate = `${year}-${month}-${day}`;
              }
            } catch (e) {
              console.error('[Dashboard] Error parsing ISO date:', appointment.date, e);
              // Fallback: try to extract date part before T
              appointmentDate = appointment.date.split('T')[0];
            }
          }
          // Handle date-only format (2024-01-15) - this is what MySQL DATE returns directly
          else if (appointment.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
            appointmentDate = appointment.date;
          }
          // Handle space-separated date-time (2024-01-15 10:00:00)
          else if (appointment.date.includes(' ')) {
            appointmentDate = appointment.date.split(' ')[0];
          }
          // Try to parse as date and extract YYYY-MM-DD using local components
          else {
            try {
              const dateObj = new Date(appointment.date);
              if (!isNaN(dateObj.getTime())) {
                // Use local date components to match the database DATE format
                const year = dateObj.getFullYear();
                const month = String(dateObj.getMonth() + 1).padStart(2, '0');
                const day = String(dateObj.getDate()).padStart(2, '0');
                appointmentDate = `${year}-${month}-${day}`;
              }
            } catch (e) {
              console.error('[Dashboard] Error parsing date:', appointment.date, e);
            }
          }
        } else if (appointment.date instanceof Date) {
          // Handle Date object - extract YYYY-MM-DD using local date components
          const year = appointment.date.getFullYear();
          const month = String(appointment.date.getMonth() + 1).padStart(2, '0');
          const day = String(appointment.date.getDate()).padStart(2, '0');
          appointmentDate = `${year}-${month}-${day}`;
        }

        const isToday = appointmentDate === todayDate;
        if (isToday) {
          console.log('[Dashboard] ✅ Found today appointment:', appointment.id, 'Date:', appointmentDate, 'Today:', todayDate, 'Status:', appointment.status);
        } else if (appointmentDate) {
          console.log('[Dashboard] ❌ Appointment not today:', {
            appointmentId: appointment.id,
            appointmentDate,
            todayDate,
            rawDate: appointment.date,
            match: appointmentDate === todayDate
          });
        }
        return isToday;
      });
    
    console.log('[Dashboard] Filtered appointments for today:', filtered.length);
    return filtered
      .map((appointment: Appointment) => {
        // Find client/user data
        const client = users.find(u => u.id === appointment.clientId);
        const clientName = client ? `${client.firstName} ${client.lastName}` : 'Unknown Client';
        const clientImage = client?.avatar ? formatAvatarUrl(client.avatar) : undefined;
        const clientPhone = client?.phone || 'N/A';

        // Find service data
        const service = services.find(s => s.id === appointment.serviceId);
        const serviceName = service?.name || 'Service';

        // Find staff/provider data
        let staffData = null;
        if (appointment.staffId) {
          const provider = staff.find(s => s.id === appointment.staffId);
          if (provider) {
            staffData = {
              name: provider.name || `${provider.firstName} ${provider.lastName}`,
              image: provider.avatar ? formatAvatarUrl(provider.avatar) : undefined,
              specialization: provider.specialization || provider.role || 'Staff'
            };
          }
        }

        // Find space data
        const space = spaces.find(s => s.id === appointment.spaceId);
        const location = space?.name || 'No Space';

        // Format time to 12-hour format
        const formatTime = (timeStr: string) => {
          if (!timeStr) return 'N/A';
          const [hours, minutes] = timeStr.split(':');
          const hour = parseInt(hours);
          const ampm = hour >= 12 ? 'PM' : 'AM';
          const displayHour = hour % 12 || 12;
          return `${displayHour}:${minutes} ${ampm}`;
        };

        // Use formatDate from utils for consistent "Jan 9, 2026" format

        // Normalize status
        const normalizedStatus = normalizeAppointmentStatus(appointment.status);
        let statusDisplay: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled' = 'pending';
        if (normalizedStatus === AppointmentStatus.COMPLETED) statusDisplay = 'completed';
        else if (normalizedStatus === AppointmentStatus.CANCELLED || normalizedStatus === AppointmentStatus.NO_SHOW) statusDisplay = 'cancelled';
        else if (normalizedStatus === AppointmentStatus.IN_PROGRESS) statusDisplay = 'in_progress';
        else if (normalizedStatus === AppointmentStatus.CONFIRMED) statusDisplay = 'confirmed';

        return {
          id: appointment.id,
          patientName: clientName,
          patientImage: clientImage,
          date: formatDate(appointment.date),
          time: formatTime(appointment.time),
          duration: appointment.duration ? `${appointment.duration} min` : 'N/A',
          type: serviceName,
          service: serviceName,
          status: statusDisplay,
          phone: clientPhone,
          location: location,
          staff: staffData,
          _originalAppointment: appointment
        };
      })
      .sort((a, b) => {
        // Sort by time (earliest first)
        const timeA = a.time === 'N/A' ? '23:59' : a.time;
        const timeB = b.time === 'N/A' ? '23:59' : b.time;
        return timeA.localeCompare(timeB);
      });
  }, [reduxAppointments, users, services, staff, spaces, todayDate]);

  // Calculate stats from real data
  const statsData = useMemo(() => {
    // Get unique clients (users who have appointments with this company)
    const uniqueClientIds = new Set(reduxAppointments.map(apt => apt.clientId));
    const clientsCount = uniqueClientIds.size;

    // Get appointment stats
    const totalAppointments = reduxAppointments.length;
    const completedAppointments = reduxAppointments.filter(apt => {
      const status = normalizeAppointmentStatus(apt.status);
      return status === AppointmentStatus.COMPLETED;
    }).length;

    return [
      {
        title: "Total Appointments",
        value: totalAppointments.toLocaleString(),
        change: "",
        trend: "up" as const,
        icon: Calendar,
        color: "text-blue-600"
      },
      {
        title: "Clients", 
        value: clientsCount.toLocaleString(),
        change: "",
        trend: "up" as const,
        icon: Users,
        color: "text-green-600"
      },
      {
        title: "Completed",
        value: completedAppointments.toLocaleString(),
        change: "",
        trend: "up" as const,
        icon: CheckCircle,
        color: "text-green-600"
      },
      {
        title: "Today's Appointments",
        value: todaysAppointments.length.toLocaleString(),
        change: "",
        trend: "up" as const,
        icon: Clock,
        color: "text-orange-600"
      }
    ];
  }, [reduxAppointments, todaysAppointments]);

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32 bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Grid - Desktop Only */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsData.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-4 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--glass-shadow)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                    <p className="text-xl font-semibold text-foreground">{stat.value}</p>
                    {stat.change && (
                      <p className={`text-xs flex items-center gap-1 mt-1 ${
                        stat.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                      }`}>
                        <span>{stat.trend === 'up' ? '↗' : '↘'}</span>
                        {stat.change} from last period
                      </p>
                    )}
                  </div>
                  <Icon className={`w-8 h-8 ${stat.color} dark:text-${stat.color.split('-')[1]}-400`} />
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Mobile & Tablet: Carousel - Horizontal scroll with same layout as desktop */}
      <div className="block lg:hidden">
        <Carousel
          opts={{
            align: "start",
            slidesToScroll: 1,
            containScroll: "trimSnaps",
          }}
          className="w-full"
        >
          <CarouselContent className="ml-0">
            {statsData.map((stat, index) => {
              const Icon = stat.icon;
              const isLast = index === statsData.length - 1;
              return (
                <CarouselItem key={index} className={`pl-0 ${isLast ? 'pr-4' : 'pr-2'} flex-shrink-0`} style={{ minWidth: '40vw', width: 'auto' }}>
                  <Card className="p-4 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--glass-shadow)]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{stat.title}</p>
                        <p className="text-xl font-semibold text-foreground">{stat.value}</p>
                        {stat.change && (
                          <p className={`text-xs flex items-center gap-1 mt-1 ${
                            stat.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                          }`}>
                            <span>{stat.trend === 'up' ? '↗' : '↘'}</span>
                            {stat.change} from last period
                          </p>
                        )}
                      </div>
                      <Icon className={`w-8 h-8 ${stat.color} dark:text-${stat.color.split('-')[1]}-400`} />
                    </div>
                  </Card>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>
      </div>

      {/* Today's Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-foreground">Today's Appointments</h2>
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent text-foreground hover:text-foreground"
                onClick={() => navigate('/system/appointments')}
              >
                View All
              </Button>
            </div>
            <div className="space-y-4">
              {loading && todaysAppointments.length === 0 ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-text)] mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Loading appointments...</p>
                  </div>
                </div>
              ) : todaysAppointments.length > 0 ? (
                todaysAppointments.map((appointment) => (
                  <AppointmentCard key={appointment.id} {...appointment} viewMode="list" />
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No appointments scheduled for today</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
            <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent text-foreground hover:text-foreground"
                onClick={() => navigate('/system/appointments')}
              >
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Appointment
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent text-foreground hover:text-foreground"
                onClick={() => navigate('/system/users')}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add New Patient
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent text-foreground hover:text-foreground"
                onClick={() => navigate('/system/analytics')}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                View Reports
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent text-foreground hover:text-foreground"
                onClick={() => navigate('/system/settings')}
              >
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button 
                variant="accent" 
                className="w-full justify-start"
                onClick={() => {
                  console.log('[Dashboard] Log Issue button clicked, onNavigate:', onNavigate);
                  if (onNavigate) {
                    console.log('[Dashboard] Calling onNavigate("backlog")');
                    onNavigate('backlog');
                  } else {
                    console.log('[Dashboard] Using navigate("/system/backlog")');
                    navigate('/system/backlog');
                  }
                }}
              >
                <Bug className="w-4 h-4 mr-2" />
                Log Issue / Request Feature
              </Button>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
            <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-foreground">New appointment scheduled</p>
                  <p className="text-muted-foreground text-xs">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-foreground">Patient profile updated</p>
                  <p className="text-muted-foreground text-xs">15 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-foreground">Appointment reminder sent</p>
                  <p className="text-muted-foreground text-xs">1 hour ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-foreground">Payment received</p>
                  <p className="text-muted-foreground text-xs">3 hours ago</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}