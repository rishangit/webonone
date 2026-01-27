import { Shield, UserCog, User, Users } from "lucide-react";
import { Badge } from "./ui/badge";
import { UserRole, UserRoleNames, isRole, getRoleFromString } from "../types/user";
import { cn } from "./ui/utils";

interface UserRoleBadgeProps {
  role: string | number | UserRole | undefined;
  showIcon?: boolean;
  iconSize?: string;
  variant?: "default" | "outline";
  className?: string;
  badgeClassName?: string;
  iconClassName?: string;
}

export const UserRoleBadge = ({
  role,
  showIcon = true,
  iconSize = "w-4 h-4",
  variant = "outline",
  className,
  badgeClassName,
  iconClassName,
}: UserRoleBadgeProps) => {
  // Get the normalized role enum value
  const normalizedRole = getRoleFromString(role);
  
  // Get the display name for the role
  const getRoleDisplayName = (): string => {
    // Handle null, undefined, or empty values - default to User
    if (role === undefined || role === null || role === '') {
      return 'User';
    }
    if (typeof role === 'number') {
      return UserRoleNames[role as UserRole] || 'User';
    }
    // If it's a string, try to map it or use it directly
    const enumRole = getRoleFromString(role);
    if (enumRole !== null) {
      return UserRoleNames[enumRole];
    }
    // If it's the string "null", return "User"
    if (String(role).toLowerCase() === 'null') {
      return 'User';
    }
    return String(role);
  };

  // Get the icon for the role
  const getRoleIcon = () => {
    if (normalizedRole === null) return null;
    
    if (isRole(role, UserRole.SYSTEM_ADMIN)) {
      return <Shield className={cn(iconSize, "text-blue-500", iconClassName)} />;
    }
    if (isRole(role, UserRole.COMPANY_OWNER)) {
      return <UserCog className={cn(iconSize, "text-emerald-500", iconClassName)} />;
    }
    if (isRole(role, UserRole.STAFF_MEMBER)) {
      return <Users className={cn(iconSize, "text-purple-500", iconClassName)} />;
    }
    if (isRole(role, UserRole.USER)) {
      return <User className={cn(iconSize, "text-[var(--accent-text)]", iconClassName)} />;
    }
    return null;
  };

  // Get badge color classes based on role
  const getBadgeColorClasses = (): string => {
    if (normalizedRole === null) {
      return "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30";
    }
    
    if (isRole(role, UserRole.SYSTEM_ADMIN)) {
      return "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30";
    }
    if (isRole(role, UserRole.COMPANY_OWNER)) {
      return "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
    }
    if (isRole(role, UserRole.STAFF_MEMBER)) {
      return "bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30";
    }
    if (isRole(role, UserRole.USER)) {
      return "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30";
    }
    return "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30";
  };

  const roleIcon = getRoleIcon();
  const roleDisplayName = getRoleDisplayName();
  const badgeColorClasses = getBadgeColorClasses();

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {showIcon && roleIcon}
      <Badge 
        variant={variant} 
        className={cn(
          "text-xs border-[var(--accent-border)] text-popover-foreground bg-transparent hover:bg-[var(--accent-bg)]",
          badgeColorClasses,
          badgeClassName
        )}
      >
        {roleDisplayName}
      </Badge>
    </div>
  );
};

