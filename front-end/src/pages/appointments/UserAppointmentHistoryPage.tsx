import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, Calendar, Clock, CheckCircle, XCircle, Phone, User, Mail, Package, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchUserAppointmentHistoryRequest } from "@/store/slices/appointmentHistorySlice";
import { fetchUsersRequest } from "@/store/slices/usersSlice";
import { fetchStaffRequest } from "@/store/slices/staffSlice";
import { formatAvatarUrl } from "../../utils";
import { toast } from "sonner";
import { DateDisplay } from "@/components/common/DateDisplay";
import { SearchInput } from "@/components/common/SearchInput";

interface User {
  email: string;
  role: string;
  name: string;
}

interface UserAppointmentHistoryPageProps {
  userId: string;
  onBack: () => void;
  currentUser?: User | null;
}

export const UserAppointmentHistoryPage = ({ userId, onBack, currentUser }: UserAppointmentHistoryPageProps) => {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { currentUserHistory, currentUserHistoryLoading, currentUserHistoryError } = useAppSelector((state) => state.appointmentHistory);
  const { users } = useAppSelector((state) => state.users);
  const { staff } = useAppSelector((state) => state.staff);
  
  const companyId = user?.companyId || (currentUser as any)?.companyId;
  
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  // Fetch user data, staff, and appointment history
  useEffect(() => {
    if (userId && companyId) {
      dispatch(fetchUsersRequest({}));
      dispatch(fetchStaffRequest({ companyId }));
      dispatch(fetchUserAppointmentHistoryRequest({ userId, companyId }));
    }
  }, [dispatch, userId, companyId]);

  // Handle errors
  useEffect(() => {
    if (currentUserHistoryError) {
      toast.error(currentUserHistoryError);
    }
  }, [currentUserHistoryError]);

  // Get user data
  const userData = useMemo(() => {
    const foundUser = users.find(u => u.id === userId);
    if (!foundUser) return null;
    
    return {
      id: foundUser.id,
      name: `${foundUser.firstName} ${foundUser.lastName}`,
      email: foundUser.email,
      phone: foundUser.phone || 'N/A',
      avatar: foundUser.avatar,
      firstName: foundUser.firstName,
      lastName: foundUser.lastName,
      joinDate: foundUser.createdAt || new Date().toISOString(),
    };
  }, [users, userId]);

  // Calculate preferred services and staff from history
  const preferredData = useMemo(() => {
    const serviceCounts: Record<string, number> = {};
    const staffCounts: Record<string, { name: string; count: number }> = {};

    currentUserHistory.forEach((history) => {
      // Count services - use serviceId or fallback to 'Service'
      // Note: serviceName is no longer stored, would need to fetch from serviceId
      const serviceName = history.serviceId ? `Service-${history.serviceId}` : 'Service';
      serviceCounts[serviceName] = (serviceCounts[serviceName] || 0) + 1;

      // Count staff
      if (history.staffId) {
        const staffMember = staff.find(s => s.id === history.staffId);
        const staffName = staffMember?.name || `${staffMember?.firstName || ''} ${staffMember?.lastName || ''}`.trim() || `Staff-${history.staffId}`;
        if (!staffCounts[history.staffId]) {
          staffCounts[history.staffId] = { name: staffName, count: 0 };
        }
        staffCounts[history.staffId].count += 1;
      }
    });

    // Get top 2 services
    const preferredServices = Object.entries(serviceCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([name]) => name);

    // Get top 2 staff
    const preferredStaff = Object.values(staffCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 2)
      .map((staff) => staff.name);

    return { preferredServices, preferredStaff };
  }, [currentUserHistory]);

  // Calculate stats from real data
  const appointmentStats = useMemo(() => {
    const total = currentUserHistory.length;
    // All sales are considered completed (completionStatus removed)
    const completed = total;
    const cancelled = 0; // No cancellation status in sales
    // Use createdAt for date filtering
    const upcoming = currentUserHistory.filter(h => {
      const saleDate = h.createdAt ? new Date(h.createdAt) : new Date();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return saleDate >= today;
    }).length;

    return [
      { label: "Total", count: total, icon: Calendar, color: "text-blue-600" },
      { label: "Completed", count: completed, icon: CheckCircle, color: "text-green-600" },
      { label: "Cancelled", count: cancelled, icon: XCircle, color: "text-red-600" },
      { label: "Upcoming", count: upcoming, icon: Clock, color: "text-orange-600" }
    ];
  }, [currentUserHistory]);

  const transformedSalesHistory = useMemo(() => {
    return currentUserHistory.map((history) => {
      const saleDate = history.createdAt ? new Date(history.createdAt) : new Date();
      const serviceItems = history.servicesUsed || [];
      const productItems = history.productsUsed || [];

      return {
        ...history,
        recordId: history.id,
        appointmentId: history.appointmentId || null,
        saleDate,
        serviceItems,
        productItems,
        itemCount: serviceItems.length + productItems.length,
      };
    });
  }, [currentUserHistory]);

  // Filter sales history
  const filteredHistory = useMemo(() => {
    return transformedSalesHistory.filter((history) => {
      const searchTerm = debouncedSearchTerm.trim().toLowerCase();
      if (searchTerm) {
        const serviceMatches = history.serviceItems.some((item) =>
          (item.name || "").toLowerCase().includes(searchTerm)
        );
        const productMatches = history.productItems.some((item) =>
          (item.name || "").toLowerCase().includes(searchTerm)
        );
        const staffMember = history.staffId ? staff.find((s) => s.id === history.staffId) : null;
        const staffName = staffMember
          ? (staffMember.name || `${staffMember.firstName || ""} ${staffMember.lastName || ""}`.trim())
          : "";
        const saleIdMatches = (history.recordId || "").toLowerCase().includes(searchTerm);

        if (!serviceMatches && !productMatches && !staffName.toLowerCase().includes(searchTerm) && !saleIdMatches) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== "all" && statusFilter !== "completed") {
        return false;
      }

      // Time filter
      if (timeFilter !== "all") {
        const saleDate = history.saleDate;
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        switch (timeFilter) {
          case "upcoming":
            return saleDate >= today;
          case "past":
            return saleDate < today;
          case "this-month":
            const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            return saleDate >= thisMonth && saleDate < nextMonth;
        }
      }

      return true;
    });
  }, [transformedSalesHistory, debouncedSearchTerm, statusFilter, timeFilter, staff]);

  if (currentUserHistoryLoading && currentUserHistory.length === 0) {
    return (
      <div className="flex-1 p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent-text)] mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading appointment history...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex-1 p-6 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={onBack}
            className="bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent text-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Appointment History</h1>
          </div>
        </div>
        <Card className="p-8 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] text-center">
          <p className="text-muted-foreground">User not found</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={onBack}
          className="bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent text-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Appointment History</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            View all completed appointment sales for {userData.name}
          </p>
        </div>
      </div>

      {/* User Info Card */}
      <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <Avatar className="w-20 h-20 mx-auto sm:mx-0">
            <AvatarImage 
              src={formatAvatarUrl(userData.avatar, userData.firstName, userData.lastName)} 
              alt={userData.name} 
            />
            <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)] text-lg">
              {userData.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-xl font-semibold text-foreground mb-2">{userData.name}</h2>
            <div className="space-y-1">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <Mail className="w-4 h-4 text-[var(--accent-text)]" />
                <span className="text-sm text-muted-foreground">{userData.email}</span>
              </div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <Phone className="w-4 h-4 text-[var(--accent-text)]" />
                <span className="text-sm text-muted-foreground">{userData.phone}</span>
              </div>
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <User className="w-4 h-4 text-[var(--accent-text)]" />
                <span className="text-sm text-muted-foreground">
                  Client since <DateDisplay date={userData.joinDate || userData.createdAt} />
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-1 gap-3 sm:text-right">
            {preferredData.preferredServices.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Preferred Services</p>
                <div className="flex flex-wrap gap-1 mt-1 justify-center sm:justify-end">
                  {preferredData.preferredServices.map((service, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {service}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {preferredData.preferredStaff.length > 0 && (
              <div>
                <p className="text-sm text-muted-foreground mb-1">Preferred Staff</p>
                <div className="flex flex-wrap gap-1 mt-1 justify-center sm:justify-end">
                  {preferredData.preferredStaff.map((staff, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {staff}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            onDebouncedChange={setDebouncedSearchTerm}
            debounceDelay={300}
            placeholder="Search sales, products, services, staff..."
          />
          
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
                    {filteredHistory.length} results
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

      {/* Sales History List */}
      <div className="space-y-4">
        {filteredHistory.length > 0 ? (
          filteredHistory.map((history) => {
            const staffMember = history.staffId ? staff.find((s) => s.id === history.staffId) : null;
            const staffName = staffMember
              ? (staffMember.name || `${staffMember.firstName || ""} ${staffMember.lastName || ""}`.trim())
              : "N/A";

            return (
              <Card key={history.recordId} className="p-5 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">
                        Sale ID: <span className="font-mono text-foreground">#{history.recordId}</span>
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 text-[var(--accent-text)]" />
                        <span>{history.saleDate.toLocaleDateString()}</span>
                        <Clock className="w-4 h-4 text-[var(--accent-text)] ml-2" />
                        <span>{history.saleDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30">
                        Completed
                      </Badge>
                      <Badge variant="outline">
                        {history.itemCount} item{history.itemCount === 1 ? "" : "s"}
                      </Badge>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Appointment</p>
                      <p className="text-foreground font-medium">{history.appointmentId ? `#${history.appointmentId}` : "N/A"}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Staff</p>
                      <p className="text-foreground font-medium">{staffName}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Total</p>
                      <p className="text-foreground font-semibold text-[var(--accent-text)]">{formatCurrency(history.totalAmount)}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {history.serviceItems.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[var(--accent-text)]" />
                          Services
                        </p>
                        {history.serviceItems.map((item, index) => (
                          <div key={`${history.recordId}-service-${index}`} className="flex items-center justify-between rounded-md border border-[var(--glass-border)] px-3 py-2 text-sm">
                            <div className="min-w-0">
                              <p className="text-foreground font-medium">{item.name || "Service"}</p>
                              <p className="text-muted-foreground text-xs">
                                Qty: {item.quantity} • Unit: {formatCurrency(item.unitPrice)} • Discount: {item.discount || 0}%
                              </p>
                            </div>
                            <p className="text-foreground font-medium">
                              {formatCurrency((item.quantity * item.unitPrice) * (1 - ((item.discount || 0) / 100)))}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {history.productItems.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground flex items-center gap-2">
                          <Package className="w-4 h-4 text-[var(--accent-text)]" />
                          Products
                        </p>
                        {history.productItems.map((item, index) => (
                          <div key={`${history.recordId}-product-${index}`} className="flex items-center justify-between rounded-md border border-[var(--glass-border)] px-3 py-2 text-sm">
                            <div className="min-w-0">
                              <p className="text-foreground font-medium">{item.name || "Product"}</p>
                              <p className="text-muted-foreground text-xs">
                                Qty: {item.quantity}{item.unit ? ` ${item.unit}` : ""} • Unit: {formatCurrency(item.unitPrice)} • Discount: {item.discount || 0}%
                              </p>
                            </div>
                            <p className="text-foreground font-medium">
                              {formatCurrency((item.quantity * item.unitPrice) * (1 - ((item.discount || 0) / 100)))}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        ) : (
          <Card className="p-8 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] text-center">
            <div className="flex flex-col items-center gap-3">
              <Calendar className="w-12 h-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground">No appointments found</h3>
              <p className="text-muted-foreground">
                {searchQuery || statusFilter !== "all" || timeFilter !== "all" 
                  ? "Try adjusting your filters or search query" 
                  : "This user doesn't have sales history yet"
                }
              </p>
            </div>
          </Card>
        )}
      </div>

      {/* Summary */}
      {filteredHistory.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <p className="text-sm text-muted-foreground order-2 sm:order-1">
            Showing {filteredHistory.length} sale record{filteredHistory.length === 1 ? "" : "s"}
            {(searchQuery || statusFilter !== "all" || timeFilter !== "all") ? " (filtered)" : ""}
          </p>
        </div>
      )}
    </div>
  );
};
