import { useState, useEffect } from "react";
import { CustomDialog } from "../../components/ui/custom-dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Card } from "../../components/ui/card";
import { Search, UserPlus, X, CheckCircle, Users, Mail, Phone, MapPin } from "lucide-react";
import { toast } from "sonner";
import { formatAvatarUrl } from "../../utils";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchUsersRequest } from "../../store/slices/usersSlice";
import { User } from "../../types/user";

// Generate time options in 15-minute intervals from 00:00 to 24:00
const generateTimeOptions = () => {
  const times = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      times.push(timeString);
    }
  }
  // Add 24:00 (midnight next day)
  times.push("24:00");
  return times;
};

const timeOptions = generateTimeOptions();

const daysOfWeek = [
  { id: 'sunday', label: 'Su', fullName: 'Sunday' },
  { id: 'monday', label: 'Mo', fullName: 'Monday' },
  { id: 'tuesday', label: 'Tu', fullName: 'Tuesday' },
  { id: 'wednesday', label: 'We', fullName: 'Wednesday' },
  { id: 'thursday', label: 'Th', fullName: 'Thursday' },
  { id: 'friday', label: 'Fr', fullName: 'Friday' },
  { id: 'saturday', label: 'Sa', fullName: 'Saturday' }
];

interface UserForSelection {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: string;
  status: 'active' | 'pending' | 'inactive';
  location?: string;
  address?: string;
  joinDate?: string;
  createdAt?: string;
  appointmentsCount?: number;
}

interface AddStaffDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddStaff: (staffData: {
    userId: string;
    role?: string;
    permissions: string[];
    workSchedule: {
      schedule?: Record<string, { startTime: string; endTime: string; enabled: boolean }>;
      startTime?: string;
      endTime?: string;
      availableDays?: string[];
    };
  }) => void;
  editingStaff?: {
    id: string;
    userId?: string;
    role?: string;
    department?: string;
    permissions?: string[] | Record<string, any>;
    workSchedule?: {
      schedule?: Record<string, { startTime: string; endTime: string; enabled: boolean }>;
      startTime?: string;
      endTime?: string;
      availableDays?: string[];
    };
  } | null;
  onEditStaff?: (staffData: {
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
  }) => void;
  companyId?: string;
}

export function AddStaffDialog({ 
  open, 
  onOpenChange, 
  onAddStaff, 
  editingStaff,
  onEditStaff,
  companyId 
}: AddStaffDialogProps) {
  const dispatch = useAppDispatch();
  const { users: reduxUsers, loading: usersLoading } = useAppSelector((state) => state.users);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserForSelection | null>(null);
  const [permissions, setPermissions] = useState<string[]>(["appointments:read"]);
  
  // Work schedule state
  // Work schedule state - per day times
  const [workSchedule, setWorkSchedule] = useState<Record<string, { startTime: string; endTime: string; enabled: boolean }>>({
    monday: { startTime: "09:00", endTime: "17:00", enabled: true },
    tuesday: { startTime: "09:00", endTime: "17:00", enabled: true },
    wednesday: { startTime: "09:00", endTime: "17:00", enabled: true },
    thursday: { startTime: "09:00", endTime: "17:00", enabled: true },
    friday: { startTime: "09:00", endTime: "17:00", enabled: true },
    saturday: { startTime: "09:00", endTime: "17:00", enabled: false },
    sunday: { startTime: "09:00", endTime: "17:00", enabled: false }
  });

  // Fetch users when dialog opens
  useEffect(() => {
    if (open) {
      dispatch(fetchUsersRequest({}));
    }
  }, [open, dispatch]);

  // Initialize form when editing
  useEffect(() => {
    if (editingStaff && open) {
      // Find the user for this staff member
      const staffUser = reduxUsers.find(u => u.id === editingStaff.userId);
      if (staffUser) {
        setSelectedUser({
          id: staffUser.id,
          name: staffUser.name || `${staffUser.firstName || ''} ${staffUser.lastName || ''}`.trim(),
          firstName: staffUser.firstName,
          lastName: staffUser.lastName,
          email: staffUser.email,
          phone: staffUser.phone,
          avatar: staffUser.avatar,
          role: staffUser.role,
          status: staffUser.isActive !== false ? 'active' : 'inactive',
          location: staffUser.address,
          address: staffUser.address,
          createdAt: staffUser.createdAt,
          // appointmentsCount removed from users
        });
      }
      
      // Handle permissions
      if (Array.isArray(editingStaff.permissions)) {
        setPermissions(editingStaff.permissions);
      } else if (typeof editingStaff.permissions === 'object' && editingStaff.permissions !== null) {
        // Convert object to array of keys
        setPermissions(Object.keys(editingStaff.permissions));
      } else {
        setPermissions(["appointments:read"]);
      }
      
      // Handle work schedule
      if (editingStaff.workSchedule) {
        if (editingStaff.workSchedule.schedule) {
          // New format: per-day schedule
          setWorkSchedule(editingStaff.workSchedule.schedule);
        } else {
          // Old format: single start/end time for all days
          const oldStartTime = editingStaff.workSchedule.startTime || "09:00";
          const oldEndTime = editingStaff.workSchedule.endTime || "17:00";
          const oldAvailableDays = editingStaff.workSchedule.availableDays || ["monday", "tuesday", "wednesday", "thursday", "friday"];
          const newSchedule: Record<string, { startTime: string; endTime: string; enabled: boolean }> = {};
          daysOfWeek.forEach(day => {
            newSchedule[day.id] = {
              startTime: oldStartTime,
              endTime: oldEndTime,
              enabled: oldAvailableDays.includes(day.id)
            };
          });
          setWorkSchedule(newSchedule);
        }
      }
    } else if (!editingStaff && open) {
      // Reset form for new staff
      handleReset();
    }
  }, [editingStaff, open, reduxUsers]);

  // Transform Redux users to UserForSelection format
  const availableUsers: UserForSelection[] = reduxUsers.map((user: User) => ({
    id: user.id,
    name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    avatar: user.avatar,
    role: user.role,
    status: user.isActive !== false ? 'active' : 'inactive',
    location: user.address,
    address: user.address,
    createdAt: user.createdAt,
    // appointmentsCount removed from users
  }));

  // Filter users based on search query
  const filteredUsers = availableUsers.filter(user => {
    const searchTerm = searchQuery.toLowerCase();
    return (
      (user.name && user.name.toLowerCase().includes(searchTerm)) ||
      (user.email && user.email.toLowerCase().includes(searchTerm)) ||
      (user.phone && user.phone.includes(searchTerm)) ||
      (user.role && user.role.toLowerCase().includes(searchTerm)) ||
      (user.location && user.location.toLowerCase().includes(searchTerm))
    );
  });

  const handleReset = () => {
    setSearchQuery("");
    setSelectedUser(null);
    setPermissions(["appointments:read"]);
    setWorkSchedule({
      monday: { startTime: "09:00", endTime: "17:00", enabled: true },
      tuesday: { startTime: "09:00", endTime: "17:00", enabled: true },
      wednesday: { startTime: "09:00", endTime: "17:00", enabled: true },
      thursday: { startTime: "09:00", endTime: "17:00", enabled: true },
      friday: { startTime: "09:00", endTime: "17:00", enabled: true },
      saturday: { startTime: "09:00", endTime: "17:00", enabled: false },
      sunday: { startTime: "09:00", endTime: "17:00", enabled: false }
    });
  };

  const handleCancel = () => {
    handleReset();
    onOpenChange(false);
  };

  const handleAddStaff = () => {
    if (!selectedUser) {
      toast.error("Please select a user to add as staff member");
      return;
    }

    // Validate work schedule - at least one day must be enabled
    const enabledDays = Object.values(workSchedule).filter(day => day.enabled);
    if (enabledDays.length === 0) {
      toast.error("Please enable at least one work day");
      return;
    }

    // Validate time ranges for each enabled day
    for (const [dayId, daySchedule] of Object.entries(workSchedule)) {
      if (daySchedule.enabled && daySchedule.startTime >= daySchedule.endTime) {
        toast.error(`End time must be after start time for ${daysOfWeek.find(d => d.id === dayId)?.fullName}`);
        return;
      }
    }

    if (editingStaff && onEditStaff) {
      // Edit existing staff
      onEditStaff({
        id: editingStaff.id,
        userId: selectedUser.id,
        permissions,
        workSchedule: {
          schedule: workSchedule
        }
      });
    } else {
      // Add new staff
      onAddStaff({
        userId: selectedUser.id,
        permissions,
        workSchedule: {
          schedule: workSchedule
        }
      });
    }
    
    handleReset();
    onOpenChange(false);
  };

  const handleDayToggle = (dayId: string) => {
    setWorkSchedule(prev => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        enabled: !prev[dayId].enabled
      }
    }));
  };

  const handleDayTimeChange = (dayId: string, field: 'startTime' | 'endTime', value: string) => {
    setWorkSchedule(prev => ({
      ...prev,
      [dayId]: {
        ...prev[dayId],
        [field]: value
      }
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30';
      case 'pending': return 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30';
      case 'inactive': return 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30';
      default: return 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30';
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Doctor': return 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30';
      case 'Nurse': return 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30';
      case 'Therapist': return 'bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30';
      case 'Administrator': return 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30';
      case 'Receptionist': return 'bg-pink-500/20 text-pink-600 dark:text-pink-400 border-pink-500/30';
      default: return 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30';
    }
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    if (checked) {
      setPermissions([...permissions, permission]);
    } else {
      setPermissions(permissions.filter(p => p !== permission));
    }
  };

  return (
    <CustomDialog 
      open={open} 
      onOpenChange={onOpenChange}
      title={editingStaff ? "Edit Staff Member" : "Add Staff Member"}
      description={editingStaff ? "Update staff member information and settings." : "Search and select a user from your registered users to add as a staff member."}
      icon={
        <div className="w-8 h-8 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center">
          <UserPlus className="w-4 h-4 text-[var(--accent-text)]" />
        </div>
      }
      maxWidth="max-w-[98vw]"
      className="h-[92vh]"
      footer={
        <>
          <Button
            variant="outline"
            onClick={handleCancel}
            className="bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent text-foreground"
          >
            Cancel
          </Button>
          <Button
            variant="accent"
            onClick={handleAddStaff}
            disabled={!selectedUser}
            className="min-w-32"
            title={!selectedUser ? "Please select a user" : ""}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            {editingStaff ? "Update Staff Member" : "Add Staff Member"}
          </Button>
        </>
      }
    >
      <div className="h-full overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-8 h-full">
            {/* Left Side: User Search and Selection */}
            <div className="lg:col-span-3 flex flex-col space-y-4 min-h-0 order-1 lg:order-1">
              {/* Search Bar */}
              <div className="relative flex-shrink-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search users by name, email, phone, role, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-[var(--glass-bg)] border-[var(--glass-border)] focus:border-[var(--accent-border)]"
                />
              </div>

              {/* Users List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 min-h-0">
                {usersLoading ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-primary)] mx-auto mb-2"></div>
                    <p>Loading users...</p>
                  </div>
                ) : filteredUsers.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No users found matching your search.</p>
                  </div>
                ) : (
                  filteredUsers.map((user) => (
                    <Card
                      key={user.id}
                      className={`cursor-pointer transition-all duration-200 p-3 ${
                        selectedUser?.id === user.id
                          ? 'border-[var(--accent-border)] bg-[var(--accent-bg)] ring-2 ring-[var(--accent-border)]'
                          : 'border-[var(--glass-border)] bg-[var(--glass-bg)] hover:border-[var(--accent-border)]'
                      }`}
                      onClick={() => setSelectedUser(user)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 ring-2 ring-[var(--glass-border)] flex-shrink-0">
                          <AvatarImage 
                            src={formatAvatarUrl(user.avatar, user.firstName, user.lastName)} 
                            alt={user.name}
                          />
                          <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)]">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-foreground truncate text-sm">{user.name}</h3>
                            {selectedUser?.id === user.id && (
                              <CheckCircle className="w-4 h-4 text-[var(--accent-text)] flex-shrink-0" />
                            )}
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs">
                              <Mail className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                              <span className="text-muted-foreground truncate">{user.email}</span>
                            </div>
                            {user.phone && (
                              <div className="flex items-center gap-2 text-xs">
                                <Phone className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                                <span className="text-muted-foreground">{user.phone}</span>
                              </div>
                            )}
                            {user.location && (
                              <div className="flex items-center gap-2 text-xs">
                                <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                                <span className="text-muted-foreground">{user.location}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 mt-2">
                            <Badge className={`${getRoleColor(user.role)} border text-xs`}>
                              {user.role}
                            </Badge>
                            <Badge className={`${getStatusColor(user.status)} border text-xs`}>
                              {user.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>

            {/* Right Side: Staff Configuration */}
            <div className="lg:col-span-2 flex flex-col min-h-0 order-2 lg:order-2">
              <Card className="p-4 bg-[var(--glass-bg)] border-[var(--glass-border)] flex-1 flex flex-col min-h-0">
                <h3 className="font-medium text-foreground mb-4 flex items-center gap-2 flex-shrink-0">
                  <UserPlus className="w-4 h-4 text-[var(--accent-text)]" />
                  Staff Configuration
                </h3>

                {selectedUser ? (
                  <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 min-h-0">
                    {/* Selected User Summary */}
                    <div className="p-3 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)]">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8 flex-shrink-0">
                          <AvatarImage 
                            src={formatAvatarUrl(selectedUser.avatar, selectedUser.firstName, selectedUser.lastName)} 
                            alt={selectedUser.name}
                          />
                          <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)] text-xs">
                            {selectedUser.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-foreground text-sm truncate">{selectedUser.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{selectedUser.email}</p>
                        </div>
                      </div>
                    </div>

                    {/* Work Schedule */}
                    <div className="space-y-3">
                      <Label className="text-sm">Work Schedule</Label>
                      
                      <div className="space-y-3">
                        {daysOfWeek.map((day) => {
                          const daySchedule = workSchedule[day.id];
                          return (
                            <div 
                              key={day.id} 
                              className={`p-3 rounded-lg border ${
                                daySchedule.enabled 
                                  ? 'bg-[var(--accent-bg)] border-[var(--accent-border)]' 
                                  : 'bg-[var(--glass-bg)] border-[var(--glass-border)] opacity-60'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <input
                                  id={`day-${day.id}`}
                                  type="checkbox"
                                  checked={daySchedule.enabled}
                                  onChange={() => handleDayToggle(day.id)}
                                  className="rounded border-[var(--glass-border)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)] w-4 h-4 cursor-pointer flex-shrink-0"
                                />
                                <label 
                                  htmlFor={`day-${day.id}`} 
                                  className="text-sm font-medium text-foreground cursor-pointer flex-shrink-0 min-w-[80px]"
                                >
                                  {day.fullName}
                                </label>
                                {daySchedule.enabled ? (
                                  <div className="flex-1 grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                      <Label className="text-xs text-muted-foreground">Start</Label>
                                      <Select 
                                        value={daySchedule.startTime} 
                                        onValueChange={(value) => handleDayTimeChange(day.id, 'startTime', value)}
                                        disabled={!daySchedule.enabled}
                                      >
                                        <SelectTrigger className="bg-[var(--glass-bg)] border-[var(--glass-border)] h-8 text-xs">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover border-border max-h-48">
                                          {timeOptions.map((time) => (
                                            <SelectItem key={time} value={time} className="text-xs">
                                              {time}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                    <div className="space-y-1">
                                      <Label className="text-xs text-muted-foreground">End</Label>
                                      <Select 
                                        value={daySchedule.endTime} 
                                        onValueChange={(value) => handleDayTimeChange(day.id, 'endTime', value)}
                                        disabled={!daySchedule.enabled}
                                      >
                                        <SelectTrigger className="bg-[var(--glass-bg)] border-[var(--glass-border)] h-8 text-xs">
                                          <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-popover border-border max-h-48">
                                          {timeOptions.map((time) => (
                                            <SelectItem key={time} value={time} className="text-xs">
                                              {time}
                                            </SelectItem>
                                          ))}
                                        </SelectContent>
                                      </Select>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted-foreground">Not available</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        <p className="text-xs text-muted-foreground">
                          Enabled: {Object.values(workSchedule).filter(d => d.enabled).length} day{Object.values(workSchedule).filter(d => d.enabled).length !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>

                    {/* Basic Permissions */}
                    <div className="space-y-3">
                      <Label className="text-sm">Basic Permissions</Label>
                      <div className="space-y-2">
                        {[
                          { id: "appointments:read", label: "View Appointments" },
                          { id: "appointments:write", label: "Manage Appointments" },
                          { id: "users:read", label: "View Users" },
                          { id: "users:write", label: "Manage Users" },
                          { id: "reports:read", label: "View Reports" }
                        ].map((permission) => (
                          <label key={permission.id} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={permissions.includes(permission.id)}
                              onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                              className="rounded border-[var(--glass-border)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)] w-4 h-4"
                            />
                            <span className="text-foreground text-sm">{permission.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground flex-1 flex flex-col items-center justify-center">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Select a user to configure staff settings</p>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
    </CustomDialog>
  );
}
