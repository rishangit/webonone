import { useState } from "react";
import { Calendar, Clock, Users, CheckCircle, XCircle, Phone, MapPin, Search, Filter } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { AppointmentCard } from "./AppointmentCard";

interface User {
  email: string;
  role: string;
  name: string;
}

interface MyAppointmentsPageProps {
  currentUser?: User | null;
}

const mockUserAppointments = [
  {
    id: "1",
    patientName: "John Smith", // This would be currentUser.name in real implementation
    patientImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    time: "2:00 PM",
    duration: "60 min",
    type: "Deep Tissue Massage",
    service: "Therapeutic Massage Session",
    status: "upcoming" as const,
    phone: "+1 (555) 123-4567",
    location: "Serenity Suite",
    date: "2025-10-08",
    staff: {
      name: "Dr. Sarah Johnson",
      image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face",
      specialization: "Licensed Massage Therapist"
    }
  },
  {
    id: "2",
    patientName: "John Smith",
    patientImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    time: "10:30 AM",
    duration: "75 min",
    type: "European Facial",
    service: "Anti-Aging Facial Treatment",
    status: "upcoming" as const,
    phone: "+1 (555) 123-4567",
    location: "Tranquil Spa Room",
    date: "2025-10-12",
    staff: {
      name: "Dr. Michael Chen",
      image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face",
      specialization: "Skincare Specialist"
    }
  },
  {
    id: "3",
    patientName: "John Smith",
    patientImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    time: "3:30 PM",
    duration: "90 min",
    type: "Hot Stone Massage",
    service: "Relaxation Therapy",
    status: "completed" as const,
    phone: "+1 (555) 123-4567",
    location: "Serenity Suite",
    date: "2025-09-28",
    staff: {
      name: "Dr. Emily Rodriguez",
      image: "https://images.unsplash.com/photo-1594824694996-50906e8d71a2?w=100&h=100&fit=crop&crop=face",
      specialization: "Wellness Therapist"
    }
  },
  {
    id: "4",
    patientName: "John Smith",
    patientImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    time: "11:00 AM",
    duration: "80 min",
    type: "Aromatherapy Body Wrap",
    service: "Detoxifying Body Treatment",
    status: "completed" as const,
    phone: "+1 (555) 123-4567",
    location: "Wellness Sanctuary",
    date: "2025-09-20",
    staff: {
      name: "Dr. Emily Rodriguez",
      image: "https://images.unsplash.com/photo-1594824694996-50906e8d71a2?w=100&h=100&fit=crop&crop=face",
      specialization: "Wellness Therapist"
    }
  },
  {
    id: "5",
    patientName: "John Smith",
    patientImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    time: "1:00 PM",
    duration: "45 min",
    type: "Consultation",
    service: "Initial Wellness Assessment",
    status: "cancelled" as const,
    phone: "+1 (555) 123-4567",
    location: "Consultation Room",
    date: "2025-09-15",
    staff: {
      name: "Dr. Robert Kim",
      image: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=100&h=100&fit=crop&crop=face",
      specialization: "Wellness Consultant"
    }
  }
];

const appointmentStats = [
  { label: "Upcoming", count: 2, icon: Clock, color: "text-blue-600" },
  { label: "Completed", count: 8, icon: CheckCircle, color: "text-green-600" },
  { label: "Cancelled", count: 1, icon: XCircle, color: "text-red-600" },
  { label: "Total Visits", count: 11, icon: Calendar, color: "text-purple-600" }
];

export function MyAppointmentsPage({ currentUser }: MyAppointmentsPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");

  const filteredAppointments = mockUserAppointments.filter(appointment => {
    // Search filter
    if (searchQuery && !appointment.type.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !appointment.service.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !appointment.staff.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Status filter
    if (statusFilter !== "all" && appointment.status !== statusFilter) {
      return false;
    }

    // Time filter
    if (timeFilter !== "all") {
      const appointmentDate = new Date(appointment.date);
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      switch (timeFilter) {
        case "upcoming":
          return appointmentDate >= today;
        case "past":
          return appointmentDate < today;
        case "this-month":
          const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
          const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
          return appointmentDate >= thisMonth && appointmentDate < nextMonth;
      }
    }

    return true;
  });

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">My Appointments</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Track and manage your scheduled wellness sessions
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* Filters */}
      <Card className="p-4 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input 
              placeholder="Search your appointments..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[var(--input-background)] border-[var(--glass-border)] text-foreground placeholder:text-muted-foreground"
            />
          </div>
          
          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-32 bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-full sm:w-32 bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="past">Past</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Clear Filters & Filter Count */}
              {(searchQuery || statusFilter !== "all" || timeFilter !== "all") && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="bg-[var(--accent-bg)] text-[var(--accent-text)] border-[var(--accent-border)]">
                    {filteredAppointments.length} results
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("all");
                      setTimeFilter("all");
                    }}
                    className="bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground hover:bg-accent hover:text-foreground"
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Appointments List */}
      <div className="space-y-4">
        {filteredAppointments.length > 0 ? (
          filteredAppointments.map((appointment) => (
            <AppointmentCard key={appointment.id} {...appointment} viewMode="list" />
          ))
        ) : (
          <Card className="p-8 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] text-center">
            <div className="flex flex-col items-center gap-3">
              <Calendar className="w-12 h-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground">No appointments found</h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== "all" || timeFilter !== "all" 
                  ? "Try adjusting your filters or search query" 
                  : "You don't have any scheduled appointments yet"
                }
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Pagination */}
      {filteredAppointments.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <p className="text-sm text-muted-foreground order-2 sm:order-1">
            Showing 1-{Math.min(filteredAppointments.length, 10)} of {filteredAppointments.length} appointments
            {(searchQuery || statusFilter !== "all" || timeFilter !== "all") && " (filtered)"}
          </p>
          <div className="flex items-center gap-1 sm:gap-2 order-1 sm:order-2">
            <Button variant="outline" size="sm" className="bg-accent/50 border-border text-foreground hover:bg-accent hover:text-foreground text-xs sm:text-sm px-2 sm:px-3">
              Prev
            </Button>
            <Button variant="outline" size="sm" className="bg-[var(--accent-bg)] border-[var(--accent-border)] text-[var(--accent-text)] min-w-[32px]">
              1
            </Button>
            <Button variant="outline" size="sm" className="bg-accent/50 border-border text-foreground hover:bg-accent hover:text-foreground text-xs sm:text-sm px-2 sm:px-3">
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}