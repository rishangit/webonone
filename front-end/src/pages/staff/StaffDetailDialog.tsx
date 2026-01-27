import { useState } from "react";
import { CustomDialog } from "../../components/ui/custom-dialog";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Card } from "../../components/ui/card";
import { Separator } from "../../components/ui/separator";
import { Textarea } from "../../components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { User, Mail, Phone, MapPin, Calendar, Shield, Edit2, Save, X, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { formatAvatarUrl } from "../../utils";

interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  department: string;
  avatar?: string;
  status: "Active" | "Inactive" | "Pending";
  joinDate: string;
  lastActive: string;
  permissions: string[] | Record<string, any>;
  userId?: string;
  companyId: string;
  address?: string;
  bio?: string;
  skills?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  workSchedule?: {
    startTime: string;
    endTime: string;
    workDays: string[];
  };
}

interface StaffDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  staff: StaffMember;
  onEdit: () => void;
}

const daysOfWeek = [
  { id: 'Sunday', label: 'Su', fullName: 'Sunday' },
  { id: 'Monday', label: 'Mo', fullName: 'Monday' },
  { id: 'Tuesday', label: 'Tu', fullName: 'Tuesday' },
  { id: 'Wednesday', label: 'We', fullName: 'Wednesday' },
  { id: 'Thursday', label: 'Th', fullName: 'Thursday' },
  { id: 'Friday', label: 'Fr', fullName: 'Friday' },
  { id: 'Saturday', label: 'Sa', fullName: 'Saturday' }
];

export function StaffDetailDialog({
  open,
  onOpenChange,
  staff,
  onEdit
}: StaffDetailDialogProps) {
  const [activeTab, setActiveTab] = useState("overview");

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

  return (
    <CustomDialog 
      open={open} 
      onOpenChange={onOpenChange}
      title="Staff Member Details"
      description={`${staff.firstName} ${staff.lastName} - ${staff.role}`}
      className="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Header with Avatar and Basic Info */}
        <div className="flex items-start gap-4 p-4 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)]">
          <Avatar className="w-20 h-20">
            <AvatarImage 
              src={formatAvatarUrl(staff.avatar, staff.firstName, staff.lastName)} 
              alt={`${staff.firstName} ${staff.lastName}`}
            />
            <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)] text-xl">
              {staff.firstName[0]}{staff.lastName[0]}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-semibold text-foreground">{staff.firstName} {staff.lastName}</h3>
                <p className="text-[var(--accent-text)] font-medium">{staff.role}</p>
                <p className="text-muted-foreground text-sm">{staff.department} Department</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(staff.status)}>
                  {staff.status}
                </Badge>
                <Badge className={getRoleColor(staff.role)} variant="outline">
                  {staff.role}
                </Badge>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>{staff.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{staff.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Joined {staff.joinDate}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4" />
                <span>Last active: {staff.lastActive}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabbed Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Contact Information */}
            <Card className="p-4 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
              <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-[var(--accent-text)]" />
                Contact Information
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="text-foreground">{staff.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Phone</Label>
                  <p className="text-foreground">{staff.phone}</p>
                </div>
                {staff.address && (
                  <div className="md:col-span-2">
                    <Label className="text-muted-foreground">Address</Label>
                    <p className="text-foreground">{staff.address}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Bio */}
            {staff.bio && (
              <Card className="p-4 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
                <h4 className="font-medium text-foreground mb-3">About</h4>
                <p className="text-foreground text-sm leading-relaxed">{staff.bio}</p>
              </Card>
            )}

            {/* Skills */}
            {staff.skills && staff.skills.length > 0 && (
              <Card className="p-4 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
                <h4 className="font-medium text-foreground mb-3">Skills & Specializations</h4>
                <div className="flex flex-wrap gap-2">
                  {staff.skills.map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-muted-foreground">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}

            {/* Emergency Contact */}
            {staff.emergencyContact && (
              <Card className="p-4 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
                <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[var(--accent-text)]" />
                  Emergency Contact
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Name</Label>
                    <p className="text-foreground">{staff.emergencyContact.name || "Not provided"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Phone</Label>
                    <p className="text-foreground">{staff.emergencyContact.phone || "Not provided"}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Relationship</Label>
                    <p className="text-foreground">{staff.emergencyContact.relationship || "Not provided"}</p>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="permissions" className="space-y-4">
            <Card className="p-4 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
              <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-[var(--accent-text)]" />
                Current Permissions
              </h4>
              {(() => {
                // Convert permissions to array format if it's an object
                let permissionsArray: string[] = [];
                if (Array.isArray(staff.permissions)) {
                  permissionsArray = staff.permissions;
                } else if (typeof staff.permissions === 'object' && staff.permissions !== null) {
                  permissionsArray = Object.keys(staff.permissions).filter(key => staff.permissions[key] === true);
                }
                
                return (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {permissionsArray.map((permission, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-foreground text-sm">{permission}</span>
                        </div>
                      ))}
                    </div>
                    {permissionsArray.length === 0 && (
                      <p className="text-muted-foreground text-sm">No permissions assigned</p>
                    )}
                  </>
                );
              })()}
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <Card className="p-4 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
              <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[var(--accent-text)]" />
                Work Schedule
              </h4>
              
              {staff.workSchedule ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-muted-foreground">Start Time</Label>
                      <p className="text-foreground">{staff.workSchedule.startTime}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">End Time</Label>
                      <p className="text-foreground">{staff.workSchedule.endTime}</p>
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-muted-foreground">Work Days</Label>
                    <div className="flex gap-2 mt-2">
                      {daysOfWeek.map(day => (
                        <Badge 
                          key={day.id}
                          variant={staff.workSchedule?.workDays?.includes(day.fullName) ? "default" : "outline"}
                          className={
                            staff.workSchedule?.workDays?.includes(day.fullName) 
                              ? "bg-[var(--accent-primary)] text-[var(--accent-button-text)]" 
                              : "text-muted-foreground"
                          }
                        >
                          {day.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">No schedule configured</p>
              )}
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-4 border-t border-[var(--glass-border)]">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Close
          </Button>
          <Button
            onClick={onEdit}
            className="flex-1 bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-[var(--accent-button-text)]"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Staff
          </Button>
        </div>
      </div>
    </CustomDialog>
  );
}