import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Building2, User, Shield, Briefcase, Users } from "lucide-react";
import { UserRole, UserRoleNames } from "../../types/user";
import { formatAvatarUrl } from "../../utils";

interface Role {
  id: string | null; // null for USER role since it's not stored in users_role table
  role: number;
  roleName: string;
  companyId: string | null;
  companyName: string | null;
  companyLogo?: string | null; // Company logo URL if available
  isDefault: boolean;
}

interface RoleSelectionDialogProps {
  open: boolean;
  user: any;
  roles: Role[];
  onRoleSelect: (roleId: string | null) => void; // Allow null for USER role
  onCancel?: () => void;
}

const getRoleIcon = (role: number) => {
  switch (role) {
    case UserRole.SYSTEM_ADMIN:
      return Shield;
    case UserRole.COMPANY_OWNER:
      return Building2;
    case UserRole.STAFF_MEMBER:
      return Briefcase;
    case UserRole.USER:
    default:
      return User;
  }
};

const getRoleColor = (role: number) => {
  switch (role) {
    case UserRole.SYSTEM_ADMIN:
      return "bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30";
    case UserRole.COMPANY_OWNER:
      return "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30";
    case UserRole.STAFF_MEMBER:
      return "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30";
    case UserRole.USER:
    default:
      return "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30";
  }
};

export const RoleSelectionDialog = ({ 
  open, 
  user, 
  roles, 
  onRoleSelect,
  onCancel 
}: RoleSelectionDialogProps) => {
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(
    roles.find(r => r.isDefault)?.id ?? roles[0]?.id ?? null
  );

  const handleSelect = () => {
    // selectedRoleId can be null for USER role
    onRoleSelect(selectedRoleId ?? null);
  };

  return (
    <Dialog open={open} onOpenChange={() => onCancel?.()}>
      <DialogContent className="w-full max-w-md backdrop-blur-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-foreground">Select Account</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            You have multiple accounts. Please select which account you want to use.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 mt-4">
          {roles.map((role, index) => {
            const Icon = getRoleIcon(role.role);
            const colorClass = getRoleColor(role.role);
            // Use role.id or index as key (since USER role has id: null)
            const roleKey = role.id ?? `user-role-${index}`;
            const isSelected = selectedRoleId === role.id;
            const hasCompanyLogo = role.companyLogo && role.companyId;
            
            return (
              <Card
                key={roleKey}
                className={`p-4 cursor-pointer transition-all backdrop-blur-sm bg-[var(--glass-bg)] border ${
                  isSelected
                    ? "ring-2 ring-[var(--accent-primary)] border-[var(--accent-border)] bg-[var(--accent-primary)]/10"
                    : "border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)]"
                }`}
                onClick={() => setSelectedRoleId(role.id)}
              >
                <div className="flex items-start gap-3">
                  {/* Company logo or role icon */}
                  {hasCompanyLogo ? (
                    <Avatar className="w-10 h-10 flex-shrink-0 ring-2 ring-[var(--accent-border)]">
                      <AvatarImage 
                        src={formatAvatarUrl(role.companyLogo)} 
                        alt={role.companyName || 'Company'} 
                      />
                      <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)]">
                        {role.companyName ? role.companyName.slice(0, 2).toUpperCase() : <Icon className="w-5 h-5" />}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className={`p-2.5 rounded-lg ${colorClass} flex-shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {/* Company name at top */}
                    {role.companyName && (
                      <p className="font-semibold text-foreground text-sm mb-1 truncate">
                        {role.companyName}
                      </p>
                    )}
                    {/* Account type at bottom */}
                    <p className="text-sm text-muted-foreground">
                      {role.roleName}
                    </p>
                    {!role.companyName && role.role === UserRole.USER && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Personal Account
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="flex gap-3 mt-6">
          {onCancel && (
            <Button
              variant="outline"
              onClick={onCancel}
              className="flex-1 border-[var(--glass-border)] bg-[var(--glass-bg)] text-foreground hover:bg-accent hover:border-[var(--accent-border)]"
            >
              Cancel
            </Button>
          )}
          <Button
            onClick={handleSelect}
            disabled={selectedRoleId === undefined}
            variant="accent"
            className="flex-1 font-medium w-full"
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

