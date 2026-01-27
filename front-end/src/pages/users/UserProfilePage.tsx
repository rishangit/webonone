import { useState, useEffect } from "react";
import { ArrowLeft, User, Mail, Phone, MapPin, Shield, Building, CheckCircle, Clock } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Label } from "../../components/ui/label";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchUserRequest, clearError } from "../../store/slices/usersSlice";
import { toast } from "sonner";
import { formatAvatarUrl } from "../../utils";
import { UserRoleNames, UserRole } from "../../types/user";
import { DateDisplay } from "../../components/common/DateDisplay";

interface UserProfilePageProps {
  userId: string;
  onBack: () => void;
}

export const UserProfilePage = ({ userId, onBack }: UserProfilePageProps) => {
  const dispatch = useAppDispatch();
  const { users: allUsers, currentUser: reduxCurrentUser, loading, error } = useAppSelector((state) => state.users);
  
  // Find user from Redux store first
  const reduxUser = allUsers.find(u => String(u.id) === String(userId));
  const [user, setUser] = useState(reduxUser || null);

  // Fetch user if not found in store
  useEffect(() => {
    if (!reduxUser && userId) {
      dispatch(fetchUserRequest(userId));
    } else if (reduxUser) {
      setUser(reduxUser);
    }
  }, [reduxUser, userId, dispatch]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Update user when currentUser changes (from fetchUserSuccess)
  useEffect(() => {
    if (reduxCurrentUser && String(reduxCurrentUser.id) === String(userId)) {
      setUser(reduxCurrentUser);
    }
  }, [reduxCurrentUser, userId]);

  // Show loading state
  if (loading && !user) {
    return (
      <div className="flex-1 p-4 lg:p-6 flex items-center justify-center">
        <Card className="p-8 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] text-center">
          <div className="flex flex-col items-center gap-3">
            <User className="w-12 h-12 text-muted-foreground animate-pulse" />
            <h3 className="text-lg font-semibold text-foreground">Loading user...</h3>
            <p className="text-muted-foreground">Please wait while we fetch the data</p>
          </div>
        </Card>
      </div>
    );
  }

  // Show error state if user not found
  if (!user) {
    return (
      <div className="flex-1 p-4 lg:p-6 flex items-center justify-center">
        <Card className="p-8 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] text-center">
          <div className="flex flex-col items-center gap-3">
            <User className="w-12 h-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground">User not found</h3>
            <p className="text-muted-foreground mb-4">The user you're looking for doesn't exist or has been removed.</p>
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Users
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const fullName = user.firstName && user.lastName 
    ? `${user.firstName} ${user.lastName}` 
    : user.name || user.email;
  
  const roleName = UserRoleNames[user.role as UserRole] || "User";
  const isActive = user.isActive === true || user.isActive === 1;

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon"
          onClick={onBack}
          className="bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent text-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">User Profile</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">View and manage user information</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Profile Header */}
          <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] shadow-lg">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <Avatar className="w-24 h-24 ring-2 ring-[var(--accent-border)]">
                <AvatarImage 
                  src={user.avatar ? formatAvatarUrl(user.avatar, user.firstName, user.lastName) : undefined} 
                  alt={fullName} 
                />
                <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)] text-2xl">
                  {fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-semibold text-foreground">{fullName}</h2>
                  <Badge className={isActive ? "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30" : "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30"}>
                    {isActive ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Inactive
                      </span>
                    )}
                  </Badge>
                </div>
                <p className="text-[var(--accent-text)] mb-4">{roleName}</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-[var(--accent-text)]" />
                    <span className="text-muted-foreground">Email:</span>
                    <a href={`mailto:${user.email}`} className="text-[var(--accent-text)] hover:text-[var(--accent-primary-hover)]">
                      {user.email}
                    </a>
                  </div>
                  {user.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-[var(--accent-text)]" />
                      <span className="text-muted-foreground">Phone:</span>
                      <a href={`tel:${user.phone}`} className="text-[var(--accent-text)] hover:text-[var(--accent-primary-hover)]">
                        {user.phone}
                      </a>
                    </div>
                  )}
                  {user.address && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-[var(--accent-text)]" />
                      <span className="text-muted-foreground">Location:</span>
                      <span className="text-foreground">{user.address}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4 text-[var(--accent-text)]" />
                    <span className="text-muted-foreground">Role:</span>
                    <span className="text-foreground">{roleName}</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Personal Information */}
          <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] shadow-lg">
            <div className="flex items-center gap-2 mb-6">
              <User className="w-5 h-5 text-[var(--accent-text)]" />
              <h3 className="font-semibold text-foreground">Personal Information</h3>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-foreground">First Name</Label>
                  <p className="p-2 text-foreground">{user.firstName || 'Not provided'}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-foreground">Last Name</Label>
                  <p className="p-2 text-foreground">{user.lastName || 'Not provided'}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Email Address <span className="text-red-500">*</span></Label>
                <p className="p-2 text-foreground">{user.email || 'Not provided'}</p>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Phone Number</Label>
                <p className="p-2 text-foreground">{user.phone || 'Not provided'}</p>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Address</Label>
                <p className="p-2 text-foreground">{user.address || 'Not provided'}</p>
              </div>

              {user.dateOfBirth && (
                <div className="space-y-2">
                  <Label className="text-foreground">Date of Birth</Label>
                  <p className="p-2 text-foreground">
                    <DateDisplay date={user.dateOfBirth} />
                  </p>
                </div>
              )}
            </div>
          </Card>

          {/* Professional Information */}
          <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] shadow-lg">
            <div className="flex items-center gap-2 mb-6">
              <Building className="w-5 h-5 text-[var(--accent-text)]" />
              <h3 className="font-semibold text-foreground">Professional Information</h3>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-foreground">Role</Label>
                <p className="p-2 text-foreground">{roleName}</p>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Status</Label>
                <Badge className={isActive ? "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30" : "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30"}>
                  {isActive ? "Active" : "Inactive"}
                </Badge>
              </div>

              {user.companyId && (
                <div className="space-y-2">
                  <Label className="text-foreground">Company ID</Label>
                  <p className="p-2 text-foreground">{user.companyId}</p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Account Status */}
          <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
            <h3 className="font-semibold text-foreground mb-4">Account Status</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {isActive ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <Clock className="w-5 h-5 text-gray-500" />
                )}
                <div>
                  <p className="font-medium text-foreground">
                    {isActive ? "Active Account" : "Inactive Account"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isActive ? "User can access the system" : "User access is restricted"}
                  </p>
                </div>
              </div>
              <Badge className={isActive ? "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30" : "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30"}>
                {isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
          </Card>

          {/* Account Information */}
          <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] shadow-lg">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-[var(--accent-text)]" />
              Account Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Registration Date</p>
                <p className="font-medium text-foreground">
                  <DateDisplay date={user.createdAt} fallback="Not available" />
                </p>
              </div>
              {user.updatedAt && (
                <div>
                  <p className="text-sm text-muted-foreground">Last Updated</p>
                  <p className="font-medium text-foreground">
                    {(() => {
                      const updatedDate = new Date(user.updatedAt);
                      const today = new Date();
                      const yesterday = new Date(today);
                      yesterday.setDate(yesterday.getDate() - 1);
                      
                      if (updatedDate.toDateString() === today.toDateString()) {
                        return 'Today';
                      }
                      if (updatedDate.toDateString() === yesterday.toDateString()) {
                        return 'Yesterday';
                      }
                      return null;
                    })()}
                    {(() => {
                      const updatedDate = new Date(user.updatedAt);
                      const today = new Date();
                      const yesterday = new Date(today);
                      yesterday.setDate(yesterday.getDate() - 1);
                      
                      if (updatedDate.toDateString() !== today.toDateString() && 
                          updatedDate.toDateString() !== yesterday.toDateString()) {
                        return <DateDisplay date={user.updatedAt} />;
                      }
                      return null;
                    })()}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

