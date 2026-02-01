import { Plus, Calendar, Filter, Search, ChevronDown, Clock, Users, CheckCircle, XCircle, Phone, MapPin, Play, User, Building, CalendarDays } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { AppointmentCard } from "./AppointmentCard";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Badge } from "../../components/ui/badge";
import { Calendar as CalendarComponent } from "../../components/ui/calendar";
import { AppointmentWizard } from "./AppointmentWizard";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { TimelineView } from "../../components/TimelineView";
import { MultiSelect } from "../../components/ui/multi-select";
import { ViewSwitcher } from "../../components/ui/view-switcher";
import { WeekView } from "./WeekView";
import { MonthView } from "./MonthView";
import { useState, useMemo, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchAppointmentsRequest,
  updateAppointmentStatusRequest,
  deleteAppointmentRequest,
  clearError
} from "../../store/slices/appointmentsSlice";
import { fetchUsersRequest, fetchUserRequest } from "../../store/slices/usersSlice";
import { fetchServicesRequest } from "../../store/slices/servicesSlice";
import { fetchStaffRequest } from "../../store/slices/staffSlice";
import { fetchSpacesRequest } from "../../store/slices/spacesSlice";
import { fetchCurrenciesRequest } from "../../store/slices/currenciesSlice";
import { Appointment } from "../../services/appointments";
import { toast } from "sonner";
import { formatAvatarUrl } from "../../utils";
import { AppointmentStatus, normalizeAppointmentStatus, getAppointmentStatusLabel, AppointmentStatusValues } from "../../types/appointmentStatus";
import { DeleteConfirmationDialog } from "../../components/common/DeleteConfirmationDialog";
import { SearchInput } from "../../components/common/SearchInput";
import { Pagination } from "../../components/common/Pagination";
import { isRole, UserRole } from "../../types/user";
import { Carousel, CarouselContent, CarouselItem } from "../../components/ui/carousel";

interface User {
  email: string;
  role: string;
  name: string;
}

interface AppointmentsPageProps {
  currentUser?: User | null;
}

// Removed mock data - now using Redux state from API

export function AppointmentsPage({ currentUser }: AppointmentsPageProps) {
  const dispatch = useAppDispatch();
  const { appointments: reduxAppointments, loading, error, pagination } = useAppSelector((state) => state.appointments);
  const { users } = useAppSelector((state) => state.users);
  const { services } = useAppSelector((state) => state.services);
  const { staff } = useAppSelector((state) => state.staff);
  const { spaces } = useAppSelector((state) => state.spaces);
  const { user } = useAppSelector((state) => state.auth);
  const { currencies: reduxCurrencies } = useAppSelector((state) => state.currencies);

  // Check if user is company owner
  const isCompanyOwner = isRole(currentUser?.role, UserRole.COMPANY_OWNER) || isRole(user?.role, UserRole.COMPANY_OWNER);

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [calendarViewMode, setCalendarViewMode] = useState<"day" | "week" | "month">("day");
  const [activeTab, setActiveTab] = useState<"appointments" | "calendar">("appointments");
  const [selectedStaff, setSelectedStaff] = useState<string[]>([]);
  const [selectedSpaces, setSelectedSpaces] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [timeFilter, setTimeFilter] = useState("all-time");
  const [statusFilter, setStatusFilter] = useState("all-status");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<{ id: string; patientName: string } | null>(null);

  // Get company ID from user
  const companyId = user?.companyId || currentUser?.companyId;

  // Fetch appointments with pagination and search for company owners
  useEffect(() => {
    if (companyId) {
      if (isCompanyOwner) {
        // For company owners: use server-side pagination and search
        const offset = (currentPage - 1) * itemsPerPage;
        const filters: any = {
          page: currentPage,
          limit: itemsPerPage,
          offset: offset,
        };

        // Add search
        if (debouncedSearchTerm.trim()) {
          filters.search = debouncedSearchTerm.trim();
        }

        // Add status filter
        if (statusFilter !== "all-status") {
          filters.status = statusFilter;
        }

        // Add staff filter
        if (selectedStaff.length > 0) {
          filters.staffId = selectedStaff[0]; // Backend currently supports single staffId
        }

        dispatch(fetchAppointmentsRequest({ companyId, filters }));
      } else {
        // For non-company owners: fetch all appointments (client-side filtering)
        dispatch(fetchAppointmentsRequest({ companyId }));
      }

      dispatch(fetchUsersRequest({}));
      dispatch(fetchServicesRequest({ companyId }));
      dispatch(fetchStaffRequest({ companyId }));
      dispatch(fetchSpacesRequest({ companyId }));
    }
  }, [dispatch, companyId, isCompanyOwner, currentPage, itemsPerPage, debouncedSearchTerm, statusFilter, selectedStaff]);

  // Load currencies once when component mounts (for use in AppointmentWizard and AppointmentBillingDialog)
  useEffect(() => {
    // Only fetch if we don't have currencies cached
    if (reduxCurrencies.length === 0) {
      dispatch(fetchCurrenciesRequest({}));
    }
  }, [dispatch, reduxCurrencies.length]);

  // Reset to page 1 when filters change (for company owners)
  useEffect(() => {
    if (isCompanyOwner) {
      setCurrentPage(1);
    }
  }, [debouncedSearchTerm, statusFilter, selectedStaff, isCompanyOwner]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Fetch missing client details when appointments change
  useEffect(() => {
    if (reduxAppointments.length === 0) return;

    // Collect unique client IDs from appointments
    const clientIds = new Set<string>();
    reduxAppointments.forEach((appointment: Appointment) => {
      if (appointment.clientId) {
        clientIds.add(String(appointment.clientId));
      }
    });

    // Find which client IDs are missing from Redux
    const missingClientIds = Array.from(clientIds).filter(
      clientId => !users.find(u => String(u.id) === clientId)
    );

    // Fetch missing clients
    if (missingClientIds.length > 0) {
      missingClientIds.forEach(clientId => {
        dispatch(fetchUserRequest(clientId));
      });
    }
  }, [reduxAppointments, users, dispatch]);

  // Transform appointments to match AppointmentCard props
  const transformedAppointments = useMemo(() => {
    return reduxAppointments.map((appointment: Appointment) => {
      // Find client/user data
      const client = users.find(u => String(u.id) === String(appointment.clientId));
      const clientName = client ? `${client.firstName} ${client.lastName}` : 'Unknown Client';
      const clientImage = client?.avatar ? formatAvatarUrl(client.avatar) : undefined;
      const clientPhone = client?.phone || 'N/A';

      // Find service data
      const service = services.find(s => s.id === appointment.serviceId);
      const serviceName = service?.name || 'Service';

      // Find staff/provider data
      let staffData = null;
      let preferredStaffData = null;

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

      // Handle preferred staff
      if (appointment.preferredStaffIds && appointment.preferredStaffIds.length > 0) {
        preferredStaffData = appointment.preferredStaffIds
          .map(staffId => {
            const staffMember = staff.find(s => s.id === staffId);
            if (staffMember) {
              return {
                id: staffId,
                name: staffMember.name || `${staffMember.firstName} ${staffMember.lastName}`,
                image: staffMember.avatar ? formatAvatarUrl(staffMember.avatar) : undefined,
                specialization: staffMember.specialization || staffMember.role || 'Staff'
              };
            }
            return null;
          })
          .filter(Boolean) as Array<{ id: string; name: string; image?: string; specialization: string }>;
      }

      // Find space data
      const space = spaces.find(s => s.id === appointment.spaceId);
      const spaceName = space?.name || 'No Space Assigned';

      // Format time to 12-hour format
      const formatTime = (timeStr: string) => {
        const [hours, minutes] = timeStr.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
      };

      // Format duration - use service duration if available, otherwise use appointment duration
      const formatDuration = (duration?: number) => {
        if (!duration) return 'N/A';
        return `${duration} min`;
      };

      // Get duration from service first, then fall back to appointment duration
      const appointmentDuration = service?.duration || appointment.duration;

      // Normalize status to number if it's a string (for backward compatibility)
      let normalizedStatus: AppointmentStatus | number = appointment.status;
      if (typeof appointment.status === 'string') {
        normalizedStatus = normalizeAppointmentStatus(appointment.status) || AppointmentStatus.PENDING;
      }

      return {
        id: appointment.id,
        patientName: clientName,
        patientImage: clientImage,
        date: appointment.date,
        time: formatTime(appointment.time),
        duration: formatDuration(appointmentDuration),
        type: appointment.type || serviceName,
        service: serviceName,
        status: normalizedStatus,
        phone: clientPhone,
        location: spaceName,
        staff: staffData,
        preferredStaff: preferredStaffData && preferredStaffData.length > 0 ? preferredStaffData : undefined,
        // Store original appointment for CRUD operations
        _originalAppointment: appointment
      };
    });
  }, [reduxAppointments, users, services, staff, spaces]);

  // Calculate stats from real data
  const appointmentStats = useMemo(() => {
    const total = reduxAppointments.length;
    const pending = reduxAppointments.filter(a => a.status === AppointmentStatus.PENDING || a.status === 0).length;
    const confirmed = reduxAppointments.filter(a => a.status === AppointmentStatus.CONFIRMED || a.status === 1).length;
    const inProgress = reduxAppointments.filter(a => a.status === AppointmentStatus.IN_PROGRESS || a.status === 2).length;
    const cancelled = reduxAppointments.filter(a => a.status === AppointmentStatus.CANCELLED || a.status === AppointmentStatus.NO_SHOW || a.status === 4 || a.status === 5).length;

    return [
      { label: "Total", count: total, icon: Calendar, color: "text-blue-600" },
      { label: "Pending", count: pending, icon: Clock, color: "text-orange-600" },
      { label: "Confirmed", count: confirmed, icon: CheckCircle, color: "text-green-600" },
      { label: "In Progress", count: inProgress, icon: Play, color: "text-purple-600" },
      { label: "Cancelled", count: cancelled, icon: XCircle, color: "text-red-600" }
    ];
  }, [reduxAppointments]);

  // Create staff options from Redux data
  const staffOptions = useMemo(() => {
    return staff.map(s => ({
      label: s.name || `${s.firstName} ${s.lastName}`,
      value: s.id,
      icon: User
    }));
  }, [staff]);

  // Create space options from Redux data
  const spaceOptions = useMemo(() => {
    return spaces.map(s => ({
      label: s.name,
      value: s.id,
      icon: Building
    }));
  }, [spaces]);

  // Helper function to get staff name from appointment for filter
  const getStaffNameForFilter = (appointment: any) => {
    if (appointment.staff) {
      return appointment.staff.name.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '');
    }
    if (appointment.preferredStaff && appointment.preferredStaff.length > 0) {
      return appointment.preferredStaff[0].name.toLowerCase().replace(/\s+/g, '-').replace(/\./g, '');
    }
    return null;
  };

  // Helper function to get space name for filter
  const getSpaceNameForFilter = (appointment: any) => {
    return appointment.location.toLowerCase().replace(/\s+/g, '-');
  };

  // Filter appointments based on all active filters
  // For company owners: server-side filtering is already done, only apply client-side filters (time, spaces)
  // For non-company owners: apply all filters client-side
  const filteredAppointments = useMemo(() => {
    if (isCompanyOwner) {
      // For company owners: server handles search and status, only filter by time and spaces client-side
      return transformedAppointments.filter(appointment => {
        // Time filter
        if (timeFilter !== "all-time") {
          const appointmentDate = new Date(appointment.date);
          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

          switch (timeFilter) {
            case "today":
              const appointmentToday = new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate());
              if (appointmentToday.getTime() !== today.getTime()) return false;
              break;
            case "week":
              const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
              if (appointmentDate < weekAgo) return false;
              break;
            case "month":
              const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
              if (appointmentDate < monthAgo) return false;
              break;
          }
        }

        // Space filter - match by space ID
        if (selectedSpaces.length > 0) {
          const appointmentSpaceId = appointment._originalAppointment?.spaceId;
          if (!appointmentSpaceId || !selectedSpaces.includes(appointmentSpaceId)) {
            return false;
          }
        }

        return true;
      });
    } else {
      // For non-company owners: apply all filters client-side
      return transformedAppointments.filter(appointment => {
        // Search filter
        if (searchQuery && !appointment.patientName.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !appointment.type.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !(appointment.service || '').toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }

        // Status filter - normalize both values for comparison
        if (statusFilter !== "all-status") {
          const appointmentStatus = normalizeAppointmentStatus(appointment.status);
          const filterStatus = normalizeAppointmentStatus(statusFilter);
          if (appointmentStatus !== filterStatus) {
            return false;
          }
        }

        // Time filter
        if (timeFilter !== "all-time") {
          const appointmentDate = new Date(appointment.date);
          const now = new Date();
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

          switch (timeFilter) {
            case "today":
              const appointmentToday = new Date(appointmentDate.getFullYear(), appointmentDate.getMonth(), appointmentDate.getDate());
              if (appointmentToday.getTime() !== today.getTime()) return false;
              break;
            case "week":
              const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
              if (appointmentDate < weekAgo) return false;
              break;
            case "month":
              const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
              if (appointmentDate < monthAgo) return false;
              break;
          }
        }

        // Staff filter - match by staff ID
        if (selectedStaff.length > 0) {
          const appointmentStaffId = appointment._originalAppointment?.staffId;
          const appointmentPreferredStaffIds = appointment._originalAppointment?.preferredStaffIds || [];
          const allStaffIds = appointmentStaffId ? [appointmentStaffId, ...appointmentPreferredStaffIds] : appointmentPreferredStaffIds;

          if (!allStaffIds.some(id => selectedStaff.includes(id))) {
            return false;
          }
        }

        // Space filter - match by space ID
        if (selectedSpaces.length > 0) {
          const appointmentSpaceId = appointment._originalAppointment?.spaceId;
          if (!appointmentSpaceId || !selectedSpaces.includes(appointmentSpaceId)) {
            return false;
          }
        }

        return true;
      });
    }
  }, [transformedAppointments, isCompanyOwner, searchQuery, statusFilter, timeFilter, selectedStaff, selectedSpaces]);

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Appointments</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            {currentUser?.role === "User"
              ? "View your appointments and book new ones"
              : "Manage and track all your appointments"
            }
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Desktop Add Button - Available for all users */}
          <div className="hidden sm:block">
            <AppointmentWizard
              currentUser={currentUser}
              trigger={
                <Button
                  variant="accent"
                  className="text-sm bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:from-[var(--accent-primary-hover)] hover:to-[var(--accent-primary)] text-[var(--accent-button-text)] shadow-md hover:shadow-lg transition-all duration-200"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {currentUser?.role === "User" ? "Book Appointment" : "New Appointment"}
                </Button>
              }
            />
          </div>

          {/* Filter/View Toggle for larger screens */}
          <Button variant="outline" className="hidden lg:flex bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent text-foreground hover:text-foreground text-sm">
            <Filter className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Filter</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="hidden md:block">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {appointmentStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-4 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--glass-shadow)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-xl font-semibold text-foreground">{stat.count}</p>
                  </div>
                  <Icon className={`w-8 h-8 ${stat.color} dark:text-${stat.color.split('-')[1]}-400`} />
                </div>
              </Card>
            );
          })}
        </div>
      </div>
      {/* Mobile: Carousel - Horizontal scroll with same layout as desktop */}
      <div className="block md:hidden">
        <Carousel
          opts={{
            align: "start",
            slidesToScroll: 1,
            containScroll: "trimSnaps",
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2">
            {appointmentStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <CarouselItem key={index} className="pl-2 flex-shrink-0" style={{  minWidth: 'calc(100vw / 3.3)' }}>
                  <Card className="p-4 w-full backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--glass-shadow)]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                        <p className="text-xl font-semibold text-foreground">{stat.count}</p>
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

      {/* Main Content with Tabs */}
      <Tabs defaultValue="appointments" value={activeTab} onValueChange={(value) => setActiveTab(value as "appointments" | "calendar")} className="space-y-6">
        {/* Filters and Search */}
        <Card className="p-4 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
          <div className="space-y-4">
            {/* Tabs */}
            <TabsList className="bg-[var(--glass-bg)] backdrop-blur-sm border border-[var(--glass-border)] w-full sm:w-auto">
              <TabsTrigger value="appointments" className="data-[state=active]:bg-[var(--accent-bg)] data-[state=active]:text-[var(--accent-text)] text-muted-foreground flex-1 sm:flex-initial">
                Appointments
              </TabsTrigger>
              <TabsTrigger value="calendar" className="data-[state=active]:bg-[var(--accent-bg)] data-[state=active]:text-[var(--accent-text)] text-muted-foreground flex-1 sm:flex-initial">
                Calendar View
              </TabsTrigger>
            </TabsList>

            {/* Search Bar - Use SearchInput for company owners, regular Input for others */}
            {isCompanyOwner ? (
              <SearchInput
                placeholder="Search patients, appointments..."
                value={searchQuery}
                onChange={setSearchQuery}
                onDebouncedChange={setDebouncedSearchTerm}
                debounceDelay={500}
              />
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search patients, appointments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-[var(--input-background)] border-[var(--glass-border)] text-foreground placeholder:text-muted-foreground"
                />
              </div>
            )}

            {/* Filters and View Mode */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
              <div className="flex flex-col lg:flex-row gap-3 lg:items-center">
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger className="w-full lg:w-32 bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="all-time">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full lg:w-32 bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="all-status">All Status</SelectItem>
                    {AppointmentStatusValues.map(status => (
                      <SelectItem key={status} value={String(status)}>
                        {getAppointmentStatusLabel(status)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <MultiSelect
                  options={staffOptions}
                  value={selectedStaff}
                  onValueChange={setSelectedStaff}
                  placeholder="All Staff"
                  className="w-full lg:w-40"
                  maxCount={2}
                />
                <MultiSelect
                  options={spaceOptions}
                  value={selectedSpaces}
                  onValueChange={setSelectedSpaces}
                  placeholder="All Spaces"
                  className="w-full lg:w-40"
                  maxCount={2}
                />

                {/* Clear Filters & Filter Count */}
                {(selectedStaff.length > 0 || selectedSpaces.length > 0 || searchQuery || statusFilter !== "all-status" || timeFilter !== "all-time") && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-[var(--accent-bg)] text-[var(--accent-text)] border-[var(--accent-border)]">
                      {filteredAppointments.length} results
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedStaff([]);
                        setSelectedSpaces([]);
                        setSearchQuery("");
                        setStatusFilter("all-status");
                        setTimeFilter("all-time");
                      }}
                      className="bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground hover:bg-accent hover:text-foreground"
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>

              {/* View Mode Toggle - Show based on active tab */}
              {activeTab === "appointments" && (
                <ViewSwitcher
                  viewMode={viewMode}
                  onViewModeChange={setViewMode}
                />
              )}
              {activeTab === "calendar" && (
                <div className="flex items-center backdrop-blur-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg p-1">
                  <Button
                    variant={calendarViewMode === "day" ? "accent" : "ghost"}
                    size="sm"
                    onClick={() => setCalendarViewMode("day")}
                    className="h-8 px-3"
                  >
                    <CalendarDays className="w-4 h-4 mr-1" />
                    Day
                  </Button>
                  <Button
                    variant={calendarViewMode === "week" ? "accent" : "ghost"}
                    size="sm"
                    onClick={() => setCalendarViewMode("week")}
                    className="h-8 px-3"
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    Week
                  </Button>
                  <Button
                    variant={calendarViewMode === "month" ? "accent" : "ghost"}
                    size="sm"
                    onClick={() => setCalendarViewMode("month")}
                    className="h-8 px-3"
                  >
                    <Calendar className="w-4 h-4 mr-1" />
                    Month
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>

        <TabsContent value="appointments" className="space-y-4">
          {/* Loading State */}
          {loading && (
            <Card className="p-8 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] text-center">
              <div className="flex flex-col items-center gap-3">
                <Clock className="w-12 h-12 text-muted-foreground animate-spin" />
                <h3 className="text-lg font-semibold text-foreground">Loading appointments...</h3>
              </div>
            </Card>
          )}

          {/* Appointments List/Grid */}
          {!loading && (viewMode === "list" ? (
            <div className="space-y-3 sm:space-y-4">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    {...appointment}
                    viewMode="list"
                    onStatusUpdate={(status, completionData) => {
                      if (appointment._originalAppointment) {
                        dispatch(updateAppointmentStatusRequest({
                          id: appointment._originalAppointment.id,
                          status: status as Appointment['status'],
                          completionData: completionData
                        }));
                      }
                    }}
                    onDelete={() => {
                      if (appointment._originalAppointment) {
                        setAppointmentToDelete({
                          id: appointment._originalAppointment.id,
                          patientName: appointment.patientName
                        });
                        setIsDeleteDialogOpen(true);
                      }
                    }}
                  />
                ))
              ) : (
                <Card className="p-8 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] text-center">
                  <div className="flex flex-col items-center gap-3">
                    <Calendar className="w-12 h-12 text-muted-foreground" />
                    <h3 className="text-lg font-semibold text-foreground">No appointments found</h3>
                    <p className="text-muted-foreground">Try adjusting your filters or search query</p>
                  </div>
                </Card>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    {...appointment}
                    viewMode="card"
                    onStatusUpdate={(status, completionData) => {
                      if (appointment._originalAppointment) {
                        dispatch(updateAppointmentStatusRequest({
                          id: appointment._originalAppointment.id,
                          status: status as Appointment['status'],
                          completionData: completionData
                        }));
                      }
                    }}
                    onDelete={() => {
                      if (appointment._originalAppointment) {
                        setAppointmentToDelete({
                          id: appointment._originalAppointment.id,
                          patientName: appointment.patientName
                        });
                        setIsDeleteDialogOpen(true);
                      }
                    }}
                  />
                ))
              ) : (
                <div className="col-span-full">
                  <Card className="p-8 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Calendar className="w-12 h-12 text-muted-foreground" />
                      <h3 className="text-lg font-semibold text-foreground">No appointments found</h3>
                      <p className="text-muted-foreground">Try adjusting your filters or search query</p>
                    </div>
                  </Card>
                </div>
              )}
            </div>
          ))}

          {/* Pagination - Use Pagination component for company owners */}
          {isCompanyOwner && pagination ? (
            <Pagination
              totalItems={pagination.total}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              showItemsPerPageSelector={true}
              itemsPerPageOptions={[12, 24, 48, 96]}
              onItemsPerPageChange={(newItemsPerPage) => {
                setItemsPerPage(newItemsPerPage);
                setCurrentPage(1);
              }}
            />
          ) : (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
              <p className="text-sm text-muted-foreground order-2 sm:order-1">
                Showing 1-{Math.min(filteredAppointments.length, 6)} of {filteredAppointments.length} appointments
                {(selectedStaff.length > 0 || selectedSpaces.length > 0 || searchQuery || statusFilter !== "all-status" || timeFilter !== "all-time") && " (filtered)"}
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          {calendarViewMode === "week" ? (
            /* Week View - Full Width, No Calendar */
            <WeekView
              currentUser={currentUser}
              selectedDate={selectedDate}
              appointments={filteredAppointments}
              onDateChange={setSelectedDate}
              onViewModeChange={setCalendarViewMode}
            />
          ) : calendarViewMode === "month" ? (
            /* Month View - Full Width, No Calendar */
            <MonthView
              currentUser={currentUser}
              selectedDate={selectedDate}
              appointments={filteredAppointments}
              onDateChange={setSelectedDate}
              onViewModeChange={setCalendarViewMode}
            />
          ) : (
            /* Day View - Calendar + Timeline */
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Calendar */}
              <Card className="lg:col-span-2 p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] h-fit">
                <div className="mb-6">
                  <h3 className="font-semibold text-foreground mb-2">
                    {selectedDate?.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) || 'Select Date'}
                  </h3>
                  <p className="text-sm text-muted-foreground">Select a date to view appointments</p>
                </div>
                <div className="flex items-start">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-lg w-full"
                  />
                </div>
              </Card>

              {/* Timeline Day View */}
              <div className="lg:col-span-3 space-y-4">
                <TimelineView
                  currentUser={currentUser}
                  selectedDate={selectedDate}
                  appointments={filteredAppointments}
                  onDateChange={setSelectedDate}
                />
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Mobile Floating Action Button */}
      <div className="fixed bottom-6 right-6 sm:hidden z-50">
        <AppointmentWizard
          currentUser={currentUser}
          trigger={
            <Button
              variant="accent"
              size="lg"
              className="w-14 h-14 rounded-full shadow-lg hover:shadow-xl active:scale-95 transform hover:scale-105 transition-all duration-200 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-primary-hover)] border-0 touch-manipulation"
              aria-label={currentUser?.role === "User" ? "Book new appointment" : "Create new appointment"}
            >
              <Plus className="w-6 h-6 text-[var(--accent-button-text)]" />
            </Button>
          }
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) {
            setAppointmentToDelete(null);
          }
        }}
        onConfirm={() => {
          if (appointmentToDelete) {
            dispatch(deleteAppointmentRequest(appointmentToDelete.id));
            setIsDeleteDialogOpen(false);
            setAppointmentToDelete(null);
          }
        }}
        itemType="Appointment"
        itemName={appointmentToDelete ? `appointment for ${appointmentToDelete.patientName}` : undefined}
        isLoading={loading}
      />
    </div>
  );
}