import { useState, useEffect } from "react";
import { ArrowLeft, Save, Edit2, Mail, Phone, Calendar, User, Shield, Clock, MapPin, X } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Card } from "../../components/ui/card";
import { Textarea } from "../../components/ui/textarea";
import { toast } from "sonner";
import { formatAvatarUrl } from "../../utils";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { 
  fetchStaffMemberRequest,
  updateStaffRequest,
  clearError 
} from "../../store/slices/staffSlice";
import { fetchUserRequest } from "../../store/slices/usersSlice";
import { Staff } from "../../services/staff";
import { DateDisplay } from "../../components/common/DateDisplay";

// Generate time options in 15-minute intervals from 00:00 to 24:00
const generateTimeOptions = () => {
  const times = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      times.push(timeString);
    }
  }
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

interface StaffDetailPageProps {
  staffId: string;
  onBack: () => void;
  currentUser?: {
    email: string;
    role: string;
    name: string;
    companyId?: string;
  } | null;
}

export const StaffDetailPage = ({ staffId, onBack, currentUser }: StaffDetailPageProps) => {
  const dispatch = useAppDispatch();
  const { currentStaff, loading, error } = useAppSelector((state) => state.staff);
  const { currentUser: userData, users } = useAppSelector((state) => state.users);
  const { user } = useAppSelector((state) => state.auth);
  
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  
  // Form state
  const [status, setStatus] = useState<"Active" | "Inactive" | "Pending">("Active");
  const [bio, setBio] = useState("");
  const [permissions, setPermissions] = useState<string[]>([]);
  const [workSchedule, setWorkSchedule] = useState<Record<string, { startTime: string; endTime: string; enabled: boolean }>>({
    monday: { startTime: "09:00", endTime: "17:00", enabled: true },
    tuesday: { startTime: "09:00", endTime: "17:00", enabled: true },
    wednesday: { startTime: "09:00", endTime: "17:00", enabled: true },
    thursday: { startTime: "09:00", endTime: "17:00", enabled: true },
    friday: { startTime: "09:00", endTime: "17:00", enabled: true },
    saturday: { startTime: "09:00", endTime: "17:00", enabled: false },
    sunday: { startTime: "09:00", endTime: "17:00", enabled: false }
  });
  const [emergencyContact, setEmergencyContact] = useState({
    name: "",
    phone: "",
    relationship: ""
  });

  // Fetch staff member on mount
  useEffect(() => {
    dispatch(fetchStaffMemberRequest(staffId));
  }, [dispatch, staffId]);

  // Fetch user data if userId exists
  useEffect(() => {
    if (currentStaff?.userId) {
      // Check if user is already in Redux store
      const existingUser = users.find(u => String(u.id) === String(currentStaff.userId));
      if (existingUser) {
        setUserInfo(existingUser);
      } else {
        // Fetch user data
        dispatch(fetchUserRequest(currentStaff.userId));
      }
    }
  }, [currentStaff?.userId, dispatch, users]);

  // Update userInfo when currentUser changes (from fetchUserSuccess)
  useEffect(() => {
    if (userData && currentStaff?.userId && String(userData.id) === String(currentStaff.userId)) {
      setUserInfo(userData);
    }
  }, [userData, currentStaff?.userId]);

  // Initialize form when staff data loads
  useEffect(() => {
    if (currentStaff) {
      setStatus(currentStaff.status || "Active");
      setBio(currentStaff.bio || "");
      
      // Handle permissions
      if (Array.isArray(currentStaff.permissions)) {
        setPermissions(currentStaff.permissions);
      } else if (typeof currentStaff.permissions === 'object' && currentStaff.permissions !== null) {
        setPermissions(Object.keys(currentStaff.permissions));
      } else {
        setPermissions([]);
      }
      
      // Handle work schedule
                  if (currentStaff.workSchedule) {
                    if (currentStaff.workSchedule.schedule) {
                      setWorkSchedule(currentStaff.workSchedule.schedule);
                    } else {
                      // Old format conversion
                      const oldStartTime = currentStaff.workSchedule.startTime || "09:00";
                      const oldEndTime = currentStaff.workSchedule.endTime || "17:00";
                      const oldAvailableDays = currentStaff.workSchedule.availableDays || [];
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
      
      // Handle emergency contact
      if (currentStaff.emergencyContact) {
        setEmergencyContact({
          name: currentStaff.emergencyContact.name || "",
          phone: currentStaff.emergencyContact.phone || "",
          relationship: currentStaff.emergencyContact.relationship || ""
        });
      }
    }
  }, [currentStaff]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleSave = async () => {
    if (!currentStaff) return;

    // Convert permissions array to object format
    const permissionsObj = permissions.reduce((acc, perm) => {
      acc[perm] = true;
      return acc;
    }, {} as Record<string, boolean>);

    // Prepare update data
    const updateData: any = {
      status,
      bio: bio || null,
      permissions: permissionsObj,
      workSchedule: {
        schedule: workSchedule
      }
    };

    // Only include emergencyContact if at least one field has a value
    if (emergencyContact.name || emergencyContact.phone || emergencyContact.relationship) {
      updateData.emergencyContact = {
        name: emergencyContact.name || null,
        phone: emergencyContact.phone || null,
        relationship: emergencyContact.relationship || null
      };
    }

    dispatch(updateStaffRequest({
      id: currentStaff.id,
      data: updateData
    }));

    toast.success("Staff member updated successfully!");
    setIsEditing(false);
  };

  const handlePermissionChange = (permission: string, checked: boolean) => {
    if (checked) {
      setPermissions([...permissions, permission]);
    } else {
      setPermissions(permissions.filter(p => p !== permission));
    }
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
      case "Active": return "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30";
      case "Inactive": return "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30";
      case "Pending": return "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30";
      default: return "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30";
    }
  };

  if (loading) {
    return (
      <div className="flex-1 p-4 lg:p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-primary)]"></div>
        </div>
      </div>
    );
  }

  if (!currentStaff) {
    return (
      <div className="flex-1 p-4 lg:p-6">
        <div className="text-center py-12">
          <p className="text-muted-foreground">Staff member not found</p>
          <Button onClick={onBack} variant="outline" className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Staff
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 lg:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="bg-[var(--glass-bg)] border-[var(--glass-border)]"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <h1 className="text-2xl font-semibold text-foreground">Staff Details</h1>
          </div>
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:from-[var(--accent-primary-hover)] hover:to-[var(--accent-primary)] text-[var(--accent-button-text)] shadow-lg shadow-[var(--accent-primary)]/25"
            >
              <Edit2 className="w-4 h-4 mr-2" />
              Edit
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  // Reset form to original values
                  if (currentStaff) {
                    setStatus(currentStaff.status || "Active");
                    setBio(currentStaff.bio || "");
                    if (Array.isArray(currentStaff.permissions)) {
                      setPermissions(currentStaff.permissions);
                    } else if (typeof currentStaff.permissions === 'object' && currentStaff.permissions !== null) {
                      setPermissions(Object.keys(currentStaff.permissions));
                    }
                    if (currentStaff.workSchedule) {
                      if (currentStaff.workSchedule.schedule) {
                        setWorkSchedule(currentStaff.workSchedule.schedule);
                      } else {
                        // Old format conversion
                        const oldStartTime = currentStaff.workSchedule.startTime || "09:00";
                        const oldEndTime = currentStaff.workSchedule.endTime || "17:00";
                        const oldAvailableDays = currentStaff.workSchedule.availableDays || [];
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
                    if (currentStaff.emergencyContact) {
                      setEmergencyContact({
                        name: currentStaff.emergencyContact.name || "",
                        phone: currentStaff.emergencyContact.phone || "",
                        relationship: currentStaff.emergencyContact.relationship || ""
                      });
                    }
                  }
                }}
                className="border-[var(--glass-border)] bg-[var(--input-background)] hover:bg-[var(--accent-bg)] hover:border-[var(--accent-border)] hover:text-[var(--accent-text)] text-foreground transition-all duration-200"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:from-[var(--accent-primary-hover)] hover:to-[var(--accent-primary)] text-[var(--accent-button-text)] shadow-lg shadow-[var(--accent-primary)]/25"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </div>
          )}
        </div>

        {/* Staff Header Card */}
        <Card className="p-6 bg-[var(--glass-bg)] border-[var(--glass-border)]">
          <div className="flex items-start gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage 
                src={formatAvatarUrl(currentStaff.avatar, currentStaff.firstName, currentStaff.lastName)} 
                alt={`${currentStaff.firstName} ${currentStaff.lastName}`}
              />
              <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)] text-xl">
                {currentStaff.firstName?.[0]}{currentStaff.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-semibold text-foreground">
                    {currentStaff.firstName} {currentStaff.lastName}
                  </h2>
                  <p className="text-muted-foreground">{currentStaff.email}</p>
                </div>
                <Badge className={getStatusColor(currentStaff.status)}>
                  {currentStaff.status}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>{currentStaff.email}</span>
                </div>
                {currentStaff.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    <span>{currentStaff.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Joined <DateDisplay date={currentStaff.joinDate || currentStaff.createdAt} /></span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Three Cards Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Personal Information Card */}
          <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] shadow-lg">
            <div className="flex items-center gap-2 mb-6">
              <User className="w-5 h-5 text-[var(--accent-text)]" />
              <h3 className="font-semibold text-foreground">Personal Information</h3>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-foreground">First Name</Label>
                  <p className="p-2 text-foreground">{currentStaff.firstName || 'Not provided'}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-foreground">Last Name</Label>
                  <p className="p-2 text-foreground">{currentStaff.lastName || 'Not provided'}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Email Address <span className="text-red-500">*</span></Label>
                <p className="p-2 text-foreground">{currentStaff.email || 'Not provided'}</p>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Phone Number</Label>
                <p className="p-2 text-foreground">{currentStaff.phone || userInfo?.phone || 'Not provided'}</p>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Address</Label>
                <p className="p-2 text-foreground">{currentStaff.address || userInfo?.address || 'Not provided'}</p>
              </div>

              {userInfo?.dateOfBirth && (
                <div className="space-y-2">
                  <Label className="text-foreground">Date of Birth</Label>
                  <p className="p-2 text-foreground">
                    <DateDisplay date={userInfo.dateOfBirth} />
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Permissions Card */}
          <Card className="p-6 bg-[var(--glass-bg)] border-[var(--glass-border)]">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-[var(--accent-text)]" />
              Permissions
            </h3>
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
                    disabled={!isEditing}
                    className="rounded border-[var(--glass-border)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)] w-4 h-4"
                  />
                  <span className="text-foreground text-sm">{permission.label}</span>
                </label>
              ))}
            </div>
          </Card>

          {/* Schedule Card */}
          <Card className="p-6 bg-[var(--glass-bg)] border-[var(--glass-border)]">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-[var(--accent-text)]" />
              Work Schedule
            </h3>
            {isEditing ? (
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
                          id={`edit-day-${day.id}`}
                          type="checkbox"
                          checked={daySchedule.enabled}
                          onChange={() => handleDayToggle(day.id)}
                          className="rounded border-[var(--glass-border)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)] w-4 h-4 cursor-pointer flex-shrink-0"
                        />
                        <label 
                          htmlFor={`edit-day-${day.id}`} 
                          className="text-sm font-medium text-foreground cursor-pointer flex-shrink-0 w-20"
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
                                <SelectContent className="max-h-48">
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
                                <SelectContent className="max-h-48">
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
            ) : (
              <div className="space-y-3">
                {currentStaff.workSchedule ? (
                  (() => {
                    const schedule = currentStaff.workSchedule.schedule || (() => {
                      // Convert old format to new format for display
                      const oldSchedule: Record<string, { startTime: string; endTime: string; enabled: boolean }> = {};
                      const startTime = currentStaff.workSchedule?.startTime || "09:00";
                      const endTime = currentStaff.workSchedule?.endTime || "17:00";
                      const availableDays = currentStaff.workSchedule?.availableDays || [];
                      daysOfWeek.forEach(day => {
                        oldSchedule[day.id] = {
                          startTime,
                          endTime,
                          enabled: availableDays.includes(day.id)
                        };
                      });
                      return oldSchedule;
                    })();
                    
                    return (
                      <>
                        {daysOfWeek.map(day => {
                          const daySchedule = schedule[day.id];
                          if (!daySchedule || !daySchedule.enabled) return null;
                          return (
                            <div key={day.id} className="flex items-center justify-between p-2 rounded bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                              <span className="text-sm font-medium text-foreground">{day.fullName}</span>
                              <span className="text-sm text-muted-foreground">
                                {daySchedule.startTime} - {daySchedule.endTime}
                              </span>
                            </div>
                          );
                        })}
                        {Object.values(schedule).filter(d => d?.enabled).length === 0 && (
                          <p className="text-muted-foreground text-sm">No schedule configured</p>
                        )}
                      </>
                    );
                  })()
                ) : (
                  <p className="text-muted-foreground text-sm">No schedule configured</p>
                )}
              </div>
            )}
          </Card>
        </div>

      </div>
    </div>
  );
};

