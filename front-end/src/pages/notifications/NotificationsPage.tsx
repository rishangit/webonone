import { useState, useEffect } from "react";
import { Bell, Search, Filter, Check, Trash2, Settings, BellRing, CheckCircle2, Archive, RefreshCw } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { NotificationCard } from "./NotificationCard";
import { toast } from "sonner";

// Mock notifications data
const mockNotifications = [
  {
    id: "notif_1",
    type: "appointment" as const,
    title: "Upcoming Appointment Reminder",
    message: "You have an appointment with Dr. Sarah Johnson tomorrow at 2:00 PM for Dental Cleaning. Please arrive 15 minutes early.",
    timestamp: "2024-12-10T14:30:00Z",
    isRead: false,
    priority: "high" as const,
    sender: {
      name: "Dr. Sarah Johnson",
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face",
      role: "Dentist"
    },
    relatedData: {
      appointmentId: "apt_123",
      userId: "user_456"
    },
    actionRequired: true,
    actionLabel: "Confirm Appointment"
  },
  {
    id: "notif_2",
    type: "staff" as const,
    title: "New Staff Member Added",
    message: "Alex Johnson has been added to your team as a Senior Hair Stylist. They will start working next Monday.",
    timestamp: "2024-12-10T10:15:00Z",
    isRead: false,
    priority: "medium" as const,
    sender: {
      name: "System Admin",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      role: "Administrator"
    },
    relatedData: {
      userId: "staff_789"
    },
    actionRequired: true,
    actionLabel: "View Profile"
  },
  {
    id: "notif_3",
    type: "payment" as const,
    title: "Payment Received",
    message: "Payment of $150.00 has been successfully processed for appointment #APT-2024-001. Transaction ID: TXN-789456123",
    timestamp: "2024-12-10T09:45:00Z",
    isRead: true,
    priority: "low" as const,
    sender: {
      name: "Emma Wilson",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      role: "Client"
    },
    relatedData: {
      appointmentId: "apt_001"
    },
    actionRequired: false
  },
  {
    id: "notif_4",
    type: "alert" as const,
    title: "System Maintenance Scheduled",
    message: "Scheduled system maintenance will occur tonight from 11:00 PM to 2:00 AM. Some features may be temporarily unavailable.",
    timestamp: "2024-12-09T16:00:00Z",
    isRead: false,
    priority: "urgent" as const,
    sender: {
      name: "System Administrator",
      role: "Technical Team"
    },
    actionRequired: false
  },
  {
    id: "notif_5",
    type: "reminder" as const,
    title: "Weekly Report Due",
    message: "Your weekly performance report is due by end of day Friday. Please submit your hours and completed appointments.",
    timestamp: "2024-12-09T12:30:00Z",
    isRead: true,
    priority: "medium" as const,
    actionRequired: true,
    actionLabel: "Submit Report"
  },
  {
    id: "notif_6",
    type: "update" as const,
    title: "New Feature Available",
    message: "We've added a new appointment scheduling feature! You can now set recurring appointments and automated reminders.",
    timestamp: "2024-12-09T08:00:00Z",
    isRead: true,
    priority: "low" as const,
    sender: {
      name: "Product Team",
      role: "Development"
    },
    actionRequired: true,
    actionLabel: "Learn More"
  },
  {
    id: "notif_7",
    type: "appointment" as const,
    title: "Appointment Cancelled",
    message: "Michael Davis has cancelled their appointment scheduled for December 12th at 3:30 PM. The slot is now available for booking.",
    timestamp: "2024-12-08T14:20:00Z",
    isRead: false,
    priority: "medium" as const,
    sender: {
      name: "Michael Davis",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      role: "Client"
    },
    relatedData: {
      appointmentId: "apt_789"
    },
    actionRequired: false
  },
  {
    id: "notif_8",
    type: "staff" as const,
    title: "Schedule Change Request",
    message: "Maria Rodriguez has requested to change her schedule for next week. Please review and approve the new schedule.",
    timestamp: "2024-12-08T11:45:00Z",
    isRead: true,
    priority: "high" as const,
    sender: {
      name: "Maria Rodriguez",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      role: "Nail Technician"
    },
    relatedData: {
      userId: "staff_456"
    },
    actionRequired: true,
    actionLabel: "Review Request"
  },
  {
    id: "notif_9",
    type: "system" as const,
    title: "Backup Completed",
    message: "Daily data backup has been completed successfully. All client data and appointment records are safely stored.",
    timestamp: "2024-12-08T06:00:00Z",
    isRead: true,
    priority: "low" as const,
    actionRequired: false
  },
  {
    id: "notif_10",
    type: "appointment" as const,
    title: "New Appointment Booked",
    message: "Jennifer Lopez has booked a facial treatment appointment for December 15th at 1:00 PM with Maya Patel.",
    timestamp: "2024-12-07T19:30:00Z",
    isRead: true,
    priority: "medium" as const,
    sender: {
      name: "Jennifer Lopez",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      role: "Client"
    },
    relatedData: {
      appointmentId: "apt_101"
    },
    actionRequired: false
  }
];

interface NotificationsPageProps {
  currentUser?: {
    email: string;
    role: string;
    name: string;
  } | null;
}

export function NotificationsPage({ currentUser }: NotificationsPageProps) {
  const [notifications, setNotifications] = useState(mockNotifications);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.sender?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "all" || notification.type === filterType;
    const matchesPriority = filterPriority === "all" || notification.priority === filterPriority;
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "read" && notification.isRead) ||
                         (filterStatus === "unread" && !notification.isRead);

    return matchesSearch && matchesType && matchesPriority && matchesStatus;
  });

  const getNotificationStats = () => {
    const unreadCount = notifications.filter(n => !n.isRead).length;
    const priorityCount = notifications.filter(n => n.priority === "high" || n.priority === "urgent").length;
    const todayCount = notifications.filter(n => {
      const notifDate = new Date(n.timestamp);
      const today = new Date();
      return notifDate.toDateString() === today.toDateString();
    }).length;

    return {
      total: notifications.length,
      unread: unreadCount,
      priority: priorityCount,
      today: todayCount
    };
  };

  const stats = getNotificationStats();

  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
    toast.success("Notification marked as read");
  };

  const handleMarkAsUnread = (id: string) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: false }
          : notification
      )
    );
    toast.success("Notification marked as unread");
  };

  const handleDelete = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
    toast.success("Notification deleted");
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    toast.success("All notifications marked as read");
  };

  const handleDeleteAll = () => {
    if (confirm("Are you sure you want to delete all notifications? This action cannot be undone.")) {
      setNotifications([]);
      toast.success("All notifications deleted");
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Notifications refreshed");
    } catch (error) {
      toast.error("Failed to refresh notifications");
    } finally {
      setRefreshing(false);
    }
  };

  const handleNotificationAction = (id: string, action: string) => {
    const notification = notifications.find(n => n.id === id);
    if (!notification) return;

    switch (notification.type) {
      case 'appointment':
        if (action === 'primary') {
          toast.success("Appointment confirmed");
        } else {
          toast.info("Redirecting to appointment details...");
        }
        break;
      case 'staff':
        toast.info("Redirecting to staff profile...");
        break;
      default:
        toast.info("Action completed");
    }

    // Mark as read when action is taken
    handleMarkAsRead(id);
  };

  const uniqueTypes = [...new Set(notifications.map(n => n.type))];
  const uniquePriorities = [...new Set(notifications.map(n => n.priority))];

  if (loading) {
    return (
      <div className="flex-1 p-4 lg:p-6">
        <div className="space-y-6">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div>
              <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
              <div className="h-4 w-96 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
          
          {/* Notifications Skeleton */}
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 md:space-y-6 p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-semibold text-foreground flex items-center gap-2 flex-wrap">
            <Bell className="w-5 h-5 md:w-6 md:h-6 text-[var(--accent-text)] shrink-0" />
            <span>Notifications</span>
            {stats.unread > 0 && (
              <Badge className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] text-[var(--accent-button-text)] text-xs md:text-sm">
                {stats.unread} unread
              </Badge>
            )}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Stay updated with important alerts and messages
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)]"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleMarkAllAsRead}
            disabled={stats.unread === 0}
            className="bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)]"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            Mark All Read
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleDeleteAll}
            disabled={notifications.length === 0}
            className="bg-[var(--glass-bg)] border-[var(--glass-border)] text-red-600 hover:text-red-700 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-[var(--accent-bg)]">
              <Bell className="w-5 h-5 text-[var(--accent-text)]" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-semibold text-foreground">{stats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20">
              <BellRing className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Unread</p>
              <p className="text-2xl font-semibold text-foreground">{stats.unread}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/20">
              <Bell className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Priority</p>
              <p className="text-2xl font-semibold text-foreground">{stats.priority}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/20">
              <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Today</p>
              <p className="text-2xl font-semibold text-foreground">{stats.today}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Content */}
      <div className="space-y-4">
          {/* Search and Filters */}
          <Card className="p-4 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input 
                  placeholder="Search notifications..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-[var(--input-background)] border-[var(--glass-border)] hover:border-[var(--accent-border)] focus:border-[var(--accent-border)]"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="sm:w-48 bg-[var(--glass-bg)] border-[var(--glass-border)] hover:border-[var(--accent-border)]">
                    <SelectValue placeholder="Filter by type" />
                  </SelectTrigger>
                  <SelectContent className="backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
                    <SelectItem value="all">All Types</SelectItem>
                    {uniqueTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterPriority} onValueChange={setFilterPriority}>
                  <SelectTrigger className="sm:w-32 bg-[var(--glass-bg)] border-[var(--glass-border)] hover:border-[var(--accent-border)]">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent className="backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
                    <SelectItem value="all">All Priority</SelectItem>
                    {uniquePriorities.map(priority => (
                      <SelectItem key={priority} value={priority}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="sm:w-32 bg-[var(--glass-bg)] border-[var(--glass-border)] hover:border-[var(--accent-border)]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="read">Read</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                  </SelectContent>
                </Select>

                {(searchTerm || filterType !== "all" || filterPriority !== "all" || filterStatus !== "all") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchTerm("");
                      setFilterType("all");
                      setFilterPriority("all");
                      setFilterStatus("all");
                    }}
                    className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:from-[var(--accent-primary-hover)] hover:to-[var(--accent-primary)] text-[var(--accent-button-text)] border-[var(--accent-border)]"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* Notifications List */}
          {filteredNotifications.length > 0 ? (
            <div className="space-y-4">
              {filteredNotifications.map((notification) => (
                <NotificationCard
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={handleMarkAsRead}
                  onMarkAsUnread={handleMarkAsUnread}
                  onDelete={handleDelete}
                  onAction={handleNotificationAction}
                />
              ))}
            </div>
          ) : (
            <Card className="p-12 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] text-center">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No notifications found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || filterType !== "all" || filterPriority !== "all" || filterStatus !== "all"
                  ? "Try adjusting your filters to see more notifications"
                  : "You're all caught up! No new notifications at this time."
                }
              </p>
            </Card>
          )}
      </div>
    </div>
  );
}