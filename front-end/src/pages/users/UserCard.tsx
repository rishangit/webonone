import { MoreVertical, Calendar, User, MapPin, Mail, Phone, UserCheck, History, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatAvatarUrl } from "../../utils";
import { UserRoleBadge } from "@/components/UserRoleBadge";
import { UserRoleNames, UserRole } from "@/types/user";
import { DateDisplay } from "@/components/common/DateDisplay";

interface UserCardProps {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  role: string;
  roles?: Array<{ role: number; id?: string | null; companyId?: string | null }>; // All roles from users_role table
  roleNames?: string[]; // All role names for display
  status: 'active' | 'inactive' | 'pending';
  location: string;
  // joinDate and appointmentsCount removed - use createdAt instead
  currentUser?: {
    email: string;
    role: string;
    name: string;
  } | null;
  onViewProfile?: (userId: string) => void;
  onSchedule?: (userId: string) => void;
  onApprove?: (userId: string) => void;
  onViewAppointments?: (userId: string) => void;
  onImpersonate?: (userId: string) => void;
  isSystemAdmin?: boolean;
}

export function UserCard({ 
  id,
  name,
  email,
  phone,
  avatar,
  role,
  roles: propRoles,
  roleNames: propRoleNames,
  status,
  location,
  joinDate,
  appointmentsCount,
  currentUser,
  onViewProfile,
  onSchedule,
  onApprove,
  onViewAppointments,
  onImpersonate,
  isSystemAdmin: propIsSystemAdmin,
  user,
  viewMode
}: UserCardProps & { user?: any; viewMode?: "grid" | "list" }) {
  const navigate = useNavigate();
  
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active": return "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30";
      case "inactive": return "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30";
      case "pending": return "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30";
      default: return "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Doctor": return "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30";
      case "Nurse": return "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30";
      case "Patient": return "bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30";
      case "Technician": return "bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30";
      default: return "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30";
    }
  };

  const isSuperAdmin = propIsSystemAdmin !== undefined ? propIsSystemAdmin : (currentUser?.role === "Super Admin" || currentUser?.role === "System Admin");
  const isCompanyOwner = currentUser?.role === "Company Owner";
  const shouldUseDropdownMenu = isSuperAdmin || isCompanyOwner;

  // Use passed user prop if available, otherwise construct from individual props
  const userData = user || {
    id,
    name,
    email,
    phone,
    avatar,
    role,
    roles: propRoles || user?.roles,
    roleNames: propRoleNames || user?.roleNames,
    status,
    location,
    joinDate: joinDate || user?.joinDate || user?.createdAt,
    appointmentsCount: appointmentsCount || user?.appointmentsCount || 0,
    createdAt: user?.createdAt,
    firstName: user?.firstName || name?.split(' ')[0] || '',
    lastName: user?.lastName || name?.split(' ').slice(1).join(' ') || ''
  };
  
  // Get all roles to display (excluding USER role if there are other roles)
  const displayRoles = userData.roles || [];
  const nonUserRoles = displayRoles.filter((r: any) => r.role !== UserRole.USER); // Filter out USER role (3)
  const rolesToShow = nonUserRoles.length > 0 ? nonUserRoles : displayRoles;
  const roleNamesToShow = userData.roleNames || rolesToShow.map((r: any) => {
    return UserRoleNames[r.role] || 'User';
  });
  
  // Ensure firstName and lastName are available from user object
  if (user) {
    userData.firstName = user.firstName || userData.firstName;
    userData.lastName = user.lastName || userData.lastName;
  }

  const handleViewHistory = () => {
    navigate(`/system/users/${userData.id}/history`);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on dropdown menu or buttons
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[role="menuitem"]') || target.closest('[data-radix-popper-content-wrapper]')) {
      return;
    }
    
    // Navigate to user profile
    if (onViewProfile) {
      onViewProfile(userData.id);
    } else {
      navigate(`/system/users/${userData.id}`);
    }
  };

  if (viewMode === "list") {
    return (
      <Card 
        className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200 cursor-pointer"
        onClick={handleCardClick}
      >
        <div className="flex items-start gap-4">
          <Avatar className="w-20 h-20">
            <AvatarImage 
              src={formatAvatarUrl(userData.avatar, userData.firstName, userData.lastName)} 
              alt={userData.name}
            />
            <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)]">
              {userData.name.split(' ').map((n: string) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-foreground">{userData.name}</h3>
                <div className="mt-0.5">
                  <Badge className={getStatusColor(userData.status)}>
                    {userData.status}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {shouldUseDropdownMenu ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onViewProfile?.(userData.id)}>
                        <User className="h-4 w-4 mr-2" />
                        View Profile
                      </DropdownMenuItem>
                      {!isSuperAdmin && (
                        <DropdownMenuItem onClick={() => onViewAppointments?.(userData.id)}>
                          <Calendar className="h-4 w-4 mr-2" />
                          View Appointments
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onClick={handleViewHistory}>
                        <History className="h-4 w-4 mr-2" />
                        View History
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onSchedule?.(userData.id)}>
                        <Calendar className="h-4 w-4 mr-2" />
                        Schedule
                      </DropdownMenuItem>
                      {userData.status === "pending" && onApprove && (
                        <DropdownMenuItem onClick={() => onApprove(userData.id)}>
                          <UserCheck className="h-4 w-4 mr-2" />
                          Approve
                        </DropdownMenuItem>
                      )}
                      {isSuperAdmin && onImpersonate && (
                        <DropdownMenuItem onClick={() => onImpersonate(userData.id)}>
                          <LogIn className="h-4 w-4 mr-2" />
                          Login as User
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8"
                    onClick={() => onViewProfile?.(userData.id)}
                  >
                    <User className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span className="truncate">{userData.email}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{userData.phone}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="w-4 h-4" />
                <span className="truncate">{userData.location}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center gap-2 flex-wrap">
                {roleNamesToShow.map((roleName: string, index: number) => (
                  <UserRoleBadge 
                    key={index}
                    role={rolesToShow[index]?.role || userData.role} 
                    showIcon={false}
                    iconSize="w-3 h-3"
                    className="text-sm"
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                Member since <DateDisplay date={userData.joinDate || userData.createdAt} className="text-xs text-muted-foreground" />
              </span>
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Grid view (default) - Matching ServiceCard layout
  const avatarUrl = formatAvatarUrl(userData.avatar, userData.firstName, userData.lastName);
  
  return (
    <Card 
      className="overflow-hidden backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-300 hover:shadow-lg hover:shadow-[var(--glass-shadow)] group cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Top area: Full image with blurred avatar background */}
      <div className="relative h-48 overflow-hidden">
        {/* Blurred background image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userData.name)}&background=random`})`,
            filter: 'blur(20px)',
            transform: 'scale(1.1)',
          }}
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/40" />
        
        {/* Avatar in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Avatar className="w-24 h-24 ring-4 ring-white/20 backdrop-blur-sm">
            <AvatarImage 
              src={avatarUrl} 
              alt={userData.name}
            />
            <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)] text-2xl font-semibold">
              {userData.name.split(' ').map((n: string) => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
        </div>
        
        {/* Status badge top left */}
        <div className="absolute top-3 left-3">
          <Badge className={getStatusColor(userData.status)}>
            {userData.status}
          </Badge>
        </div>
        
        {/* Actions menu top right */}
        <div className="absolute top-3 right-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 bg-black/50 hover:bg-black/70 text-white backdrop-blur-sm border border-white/20"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onViewProfile?.(userData.id)}>
                <User className="h-4 w-4 mr-2" />
                View Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleViewHistory}>
                <History className="h-4 w-4 mr-2" />
                View History
              </DropdownMenuItem>
              {shouldUseDropdownMenu && (
                <>
                  {!isSuperAdmin && (
                    <DropdownMenuItem onClick={() => onViewAppointments?.(userData.id)}>
                      <Calendar className="h-4 w-4 mr-2" />
                      View Appointments
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => onSchedule?.(userData.id)}>
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule
                  </DropdownMenuItem>
                  {userData.status === "pending" && onApprove && (
                    <DropdownMenuItem onClick={() => onApprove(userData.id)}>
                      <UserCheck className="h-4 w-4 mr-2" />
                      Approve
                    </DropdownMenuItem>
                  )}
                </>
              )}
              {isSuperAdmin && onImpersonate && (
                <DropdownMenuItem onClick={() => onImpersonate(userData.id)}>
                  <LogIn className="h-4 w-4 mr-2" />
                  Login as User
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Bottom area: User details */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-foreground mb-1">{userData.name}</h3>
            {roleNamesToShow.length > 0 && (
              <p className="text-[var(--accent-text)] text-sm">
                {roleNamesToShow[0]}
              </p>
            )}
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="w-4 h-4" />
            <span className="truncate">{userData.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="w-4 h-4" />
            <span>{userData.phone}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span className="truncate">{userData.location}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {roleNamesToShow.map((roleName: string, index: number) => (
            <UserRoleBadge 
              key={index}
              role={rolesToShow[index]?.role || userData.role} 
              showIcon={false}
              iconSize="w-3 h-3"
              className="text-sm"
            />
          ))}
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Member since <DateDisplay date={userData.createdAt || userData.joinDate} className="text-xs text-muted-foreground" /></span>
        </div>
      </div>
    </Card>
  );
}