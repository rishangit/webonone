import { Shield, UserCog, User, Users } from "lucide-react";
import { Badge } from "./ui/badge";
import { UserRole, UserRoleNames } from "@/shared/types/user";
import { cn } from "./ui/utils";

interface UserRoleBadgeProps {
  role: UserRole | undefined;
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
  const normalizedRole = role ?? UserRole.USER;

  const getRoleIcon = () => {
    if (normalizedRole === UserRole.SYSTEM_ADMIN) {
      return <Shield className={cn(iconSize, "text-blue-500", iconClassName)} />;
    }
    if (normalizedRole === UserRole.COMPANY_OWNER) {
      return <UserCog className={cn(iconSize, "text-emerald-500", iconClassName)} />;
    }
    if (normalizedRole === UserRole.STAFF_MEMBER) {
      return <Users className={cn(iconSize, "text-purple-500", iconClassName)} />;
    }
    if (normalizedRole === UserRole.USER) {
      return <User className={cn(iconSize, "text-[var(--accent-text)]", iconClassName)} />;
    }
    return null;
  };

  const getBadgeColorClasses = (): string => {
    if (normalizedRole === UserRole.SYSTEM_ADMIN) {
      return "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30";
    }
    if (normalizedRole === UserRole.COMPANY_OWNER) {
      return "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
    }
    if (normalizedRole === UserRole.STAFF_MEMBER) {
      return "bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30";
    }
    if (normalizedRole === UserRole.USER) {
      return "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30";
    }
    return "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30";
  };

  const roleIcon = getRoleIcon();
  const roleDisplayName = UserRoleNames[normalizedRole] || "User";
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

