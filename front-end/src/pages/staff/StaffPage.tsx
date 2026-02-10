import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Plus, Filter, UserPlus, Mail, Phone, MapPin, Calendar, MoreVertical, Trash2, Eye, Shield } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";

import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { AddStaffDialog } from "./addStaff/AddStaffDialog";
import { StaffDetailDialog } from "./StaffDetailDialog";
import { StaffDetailPage } from "./StaffDetailPage";
import { ViewSwitcher } from "../../components/ui/view-switcher";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogAction } from "../../components/ui/alert-dialog";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { 
  fetchStaffRequest, 
  createStaffRequest, 
  updateStaffRequest, 
  deleteStaffRequest,
  clearError 
} from "../../store/slices/staffSlice";
import { Staff } from "../../services/staff";
import { formatAvatarUrl, formatDate } from "../../utils";
import { SearchInput } from "../../components/common/SearchInput";
import { Pagination } from "../../components/common/Pagination";
import { EmptyState } from "../../components/common/EmptyState";

// Use Staff type from services
type StaffMember = Staff;

interface StaffPageProps {
  currentUser?: {
    email: string;
    role: string;
    name: string;
    companyId?: string;
  } | null;
}

export function StaffPage({ currentUser }: StaffPageProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { staffId } = useParams<{ staffId?: string }>();
  const { staff: reduxStaff, loading, error, pagination } = useAppSelector((state) => state.staff);
  const { user } = useAppSelector((state) => state.auth);
  
  // All state declarations at the top (like ProductsPage)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [isAddStaffDialogOpen, setIsAddStaffDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [isStaffDetailDialogOpen, setIsStaffDetailDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<StaffMember | null>(null);
  const [isDeleteConfirmDialogOpen, setIsDeleteConfirmDialogOpen] = useState(false);

  // Get company ID from user (like ProductsPage)
  const companyId = user?.companyId || currentUser?.companyId;

  // Early returns (after state declarations, before useEffects)
  // If staffId is in URL, show detail view
  if (staffId) {
    return (
      <StaffDetailPage
        staffId={staffId}
        onBack={() => navigate('/system/staff')}
        currentUser={currentUser}
      />
    );
  }

  // Redirect regular users
  if (currentUser?.role === "User") {
    return (
      <div className="flex-1 p-4 lg:p-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-[var(--glass-bg)] backdrop-blur-sm border border-[var(--glass-border)] rounded-xl p-8">
            <Shield className="w-16 h-16 mx-auto mb-4 text-[var(--accent-text)]" />
            <h2 className="text-2xl font-semibold text-foreground mb-4">Access Restricted</h2>
            <p className="text-muted-foreground mb-6">
              Staff management is only available to company owners and administrators.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Fetch staff with pagination and filters (like ProductsPage)
  useEffect(() => {
    if (companyId && currentUser?.role !== "User") {
      const offset = (currentPage - 1) * itemsPerPage;
      const filters: any = {
        companyId,
        limit: itemsPerPage,
        offset,
        page: currentPage,
      };

      // Add search
      if (debouncedSearchTerm.trim()) {
        filters.search = debouncedSearchTerm.trim();
      }

      // Add status filter
      if (filterStatus !== "all") {
        filters.status = filterStatus;
      }

      // Add role filter
      if (filterRole !== "all") {
        filters.role = filterRole;
      }

      // Add department filter
      if (filterDepartment !== "all") {
        filters.department = filterDepartment;
      }

      dispatch(fetchStaffRequest(filters));
    }
  }, [dispatch, companyId, currentUser?.role, currentPage, itemsPerPage, debouncedSearchTerm, filterStatus, filterRole, filterDepartment]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filterStatus, filterRole, filterDepartment]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Memoized values for displayed staff (like ProductsPage filteredProducts)
  const displayedStaff = useMemo(() => {
    return reduxStaff;
  }, [reduxStaff]);

  // Memoized unique roles and departments (simplified)
  const uniqueRoles = useMemo(() => {
    return [...new Set(reduxStaff.map(s => s.role).filter(Boolean))];
  }, [reduxStaff]);

  const uniqueDepartments = useMemo(() => {
    return [...new Set(reduxStaff.map(s => s.department).filter(Boolean))];
  }, [reduxStaff]);

  const handleAddStaff = async (staffData: {
    userId: string;
    role?: string;
    permissions: string[];
    workSchedule: {
      schedule?: Record<string, { startTime: string; endTime: string; enabled: boolean }>;
      startTime?: string;
      endTime?: string;
      availableDays?: string[];
    };
  }) => {
    if (!companyId) {
      toast.error("Company ID not found. Please refresh and try again.");
      return;
    }

    // Convert permissions array to object format
    const permissionsObj = staffData.permissions.reduce((acc, perm) => {
      acc[perm] = true;
      return acc;
    }, {} as Record<string, boolean>);

    dispatch(createStaffRequest({ 
      companyId, 
      data: {
        userId: staffData.userId,
        ...(staffData.role && { role: staffData.role }),
        permissions: permissionsObj,
        workSchedule: staffData.workSchedule,
        status: "Active" as const
      }
    }));
    
    // Refresh staff list after create
    setTimeout(() => {
      dispatch(fetchStaffRequest({ companyId }));
    }, 500);
  };

  const handleEditStaff = async (staffData: {
    id: string;
    userId?: string;
    role?: string;
    permissions: string[];
    workSchedule: {
      schedule?: Record<string, { startTime: string; endTime: string; enabled: boolean }>;
      startTime?: string;
      endTime?: string;
      availableDays?: string[];
    };
  }) => {
    if (!companyId) {
      toast.error("Company ID not found. Please refresh and try again.");
      return;
    }

    // Convert permissions array to object format
    const permissionsObj = staffData.permissions.reduce((acc, perm) => {
      acc[perm] = true;
      return acc;
    }, {} as Record<string, boolean>);

    dispatch(updateStaffRequest({ 
      id: staffData.id, 
      data: {
        ...(staffData.userId && { userId: staffData.userId }),
        ...(staffData.role && { role: staffData.role }),
        permissions: permissionsObj,
        workSchedule: staffData.workSchedule
      }
    }));
    
    // Refresh staff list after update
    setTimeout(() => {
      dispatch(fetchStaffRequest({ companyId }));
    }, 500);
  };

  const handleDeleteStaff = async (staffId: string) => {
    dispatch(deleteStaffRequest(staffId));
    
    // Refresh staff list after delete
    if (companyId) {
      setTimeout(() => {
        dispatch(fetchStaffRequest({ companyId }));
      }, 500);
    }
    
    setIsDeleteConfirmDialogOpen(false);
    setStaffToDelete(null);
  };

  const handleDeleteClick = (member: StaffMember) => {
    setStaffToDelete(member);
    setIsDeleteConfirmDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30";
      case "Inactive": return "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30";
      case "Pending": return "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30";
      default: return "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Manager": return "bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30";
      case "Senior Staff": return "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30";
      case "Staff": return "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30";
      case "Intern": return "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30";
      default: return "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30";
    }
  };

  const StaffCard = ({ member }: { member: StaffMember }) => {
    if (viewMode === "list") {
      return (
        <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200">
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage 
                src={formatAvatarUrl(member.avatar, member.firstName, member.lastName)} 
                alt={`${member.firstName || ''} ${member.lastName || ''}`}
              />
              <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)]">
                {(member.firstName?.[0] || '')}{(member.lastName?.[0] || '')}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-foreground">{member.firstName || ''} {member.lastName || ''}</h3>
                  <p className="text-[var(--accent-text)] text-sm">{member.role || 'Staff Member'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(member.status)}>
                    {member.status}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => {
                        navigate(`/system/staff/${member.id}`);
                      }}>
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem 
                        className="text-red-600 dark:text-red-400"
                        onClick={() => handleDeleteClick(member)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{member.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{member.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {formatDate(member.joinDate)}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <Badge className={getRoleColor(member.role || '')} variant="outline">
                    {member.role || 'Staff Member'}
                  </Badge>
                  {member.department && (
                    <Badge variant="outline" className="text-muted-foreground">
                      {member.department}
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  Last active: {member.lastActive}
                </span>
              </div>
            </div>
          </div>
        </Card>
      );
    }

    // Grid view
    return (
      <Card className="overflow-hidden backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-300 hover:shadow-lg hover:shadow-[var(--glass-shadow)] group">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="w-20 h-20">
                <AvatarImage 
                  src={formatAvatarUrl(member.avatar, member.firstName, member.lastName)} 
                  alt={`${member.firstName || ''} ${member.lastName || ''}`}
                />
                <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)]">
                  {(member.firstName?.[0] || '')}{(member.lastName?.[0] || '')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-foreground">{member.firstName || ''} {member.lastName || ''}</h3>
                <p className="text-[var(--accent-text)] text-sm">{member.role || 'Staff Member'}</p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => {
                  navigate(`/system/staff/${member.id}`);
                }}>
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600 dark:text-red-400"
                  onClick={() => handleDeleteClick(member)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="w-4 h-4" />
              <span className="truncate">{member.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Phone className="w-4 h-4" />
              <span>{member.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Joined {formatDate(member.joinDate)}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            <Badge className={getStatusColor(member.status)}>
              {member.status}
            </Badge>
            <Badge className={getRoleColor(member.role || '')} variant="outline">
              {member.role || 'Staff Member'}
            </Badge>
            {member.department && (
              <Badge variant="outline" className="text-muted-foreground">
                {member.department}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Last active: {member.lastActive}</span>
          </div>
        </div>
      </Card>
    );
  };

  const showSkeleton = loading && displayedStaff.length === 0;

  return (
    <div className="flex-1 space-y-6 p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Staff Management</h1>
          <p className="text-muted-foreground mt-1">
            Manage your team members, roles, and permissions
          </p>
        </div>
        <Button 
          onClick={() => {
            setSelectedStaff(null);
            setIsAddStaffDialogOpen(true);
          }}
          variant="accent"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add Staff
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="p-4 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
        <div className="space-y-4">
          <SearchInput
            placeholder="Search staff members..."
            value={searchTerm}
            onChange={setSearchTerm}
            onDebouncedChange={setDebouncedSearchTerm}
            debounceDelay={500}
          />

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <Select value={filterRole} onValueChange={setFilterRole}>
                <SelectTrigger className="sm:w-48 bg-[var(--glass-bg)] border-[var(--glass-border)]">
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  {uniqueRoles.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="sm:w-32 bg-[var(--glass-bg)] border-[var(--glass-border)]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                <SelectTrigger className="sm:w-48 bg-[var(--glass-bg)] border-[var(--glass-border)]">
                  <SelectValue placeholder="Filter by department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {uniqueDepartments.map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(debouncedSearchTerm || filterRole !== "all" || filterStatus !== "all" || filterDepartment !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setDebouncedSearchTerm("");
                    setFilterRole("all");
                    setFilterStatus("all");
                    setFilterDepartment("all");
                  }}
                  className="bg-[var(--glass-bg)] border-[var(--glass-border)]"
                >
                  Clear Filters
                </Button>
              )}
            </div>

            {/* View Mode Toggle */}
            <ViewSwitcher 
              viewMode={viewMode} 
              onViewModeChange={setViewMode} 
            />
          </div>
        </div>
      </Card>

      {/* Staff List */}
      {showSkeleton ? (
        <>
          {viewMode === "list" ? (
            /* Skeleton for List View - Matching StaffCard structure */
            <div className="space-y-4">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="p-6 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-4">
                    <div className="h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                          <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                          <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </div>
                        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            /* Skeleton for Grid View - Matching StaffCard structure */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <Card key={index} className="p-6 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
                      <div>
                        <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </div>
                    </div>
                    <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                  </div>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                      <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                      <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                      <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </Card>
              ))}
            </div>
          )}
        </>
      ) : displayedStaff.length > 0 ? (
        <>
          <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"}>
            {displayedStaff.map((member) => (
              <StaffCard key={member.id} member={member} />
            ))}
          </div>
          {pagination && (
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
          )}
        </>
      ) : (
        <EmptyState
          icon={UserPlus}
          title="No staff members found"
          description={
            debouncedSearchTerm || filterRole !== "all" || filterStatus !== "all" || filterDepartment !== "all"
              ? "Try adjusting your filters to see more staff members"
              : "You haven't added any staff members yet"
            }
          action={{
            label: "Add Your First Staff Member",
            onClick: () => {
              setSelectedStaff(null);
              setIsAddStaffDialogOpen(true);
            },
            variant: "accent",
            icon: UserPlus,
          }}
        />
      )}

      {/* Dialogs */}
      <AddStaffDialog
        open={isAddStaffDialogOpen}
        onOpenChange={(open) => {
          setIsAddStaffDialogOpen(open);
          if (!open) {
            setSelectedStaff(null);
          }
        }}
        onAddStaff={handleAddStaff}
        editingStaff={selectedStaff ? {
          id: selectedStaff.id,
          userId: selectedStaff.userId,
          role: selectedStaff.role || "",
          permissions: typeof selectedStaff.permissions === 'object' ? selectedStaff.permissions : {},
          workSchedule: selectedStaff.workSchedule
        } : null}
        onEditStaff={handleEditStaff}
        companyId={companyId}
      />

      {selectedStaff && (
        <StaffDetailDialog
          open={isStaffDetailDialogOpen}
          onOpenChange={setIsStaffDetailDialogOpen}
          staff={selectedStaff}
          onEdit={() => {
            setIsStaffDetailDialogOpen(false);
            setIsAddStaffDialogOpen(true);
          }}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteConfirmDialogOpen} onOpenChange={setIsDeleteConfirmDialogOpen}>
        <AlertDialogContent className="bg-[var(--glass-bg)] border-[var(--glass-border)] backdrop-blur-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Remove Staff Member</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              {staffToDelete 
                ? `Are you sure you want to remove ${staffToDelete.firstName || ''} ${staffToDelete.lastName || ''} from your team? This action cannot be undone.`
                : 'Are you sure you want to remove this staff member? This action cannot be undone.'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              className="border-[var(--glass-border)] text-foreground hover:bg-accent"
              onClick={() => {
                setStaffToDelete(null);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                if (staffToDelete) {
                  handleDeleteStaff(staffToDelete.id);
                }
              }}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Remove Staff Member
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}