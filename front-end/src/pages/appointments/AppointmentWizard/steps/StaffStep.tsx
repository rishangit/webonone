import { Users } from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../components/ui/avatar";
import { Badge } from "../../../../components/ui/badge";
import { formatAvatarUrl } from "../../../../utils";

interface StaffStepProps {
  staff: any[];
  staffLoading: boolean;
  selectedStaff: string;
  setSelectedStaff: (staff: string) => void;
  preferredStaff: string[];
  setPreferredStaff: (staff: string[]) => void;
  isCompanyOwner: boolean;
}

export const StaffStep = ({
  staff,
  staffLoading,
  selectedStaff,
  setSelectedStaff,
  preferredStaff,
  setPreferredStaff,
  isCompanyOwner
}: StaffStepProps) => {
  if (staffLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">Loading staff...</p>
      </div>
    );
  }

  if (staff.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No staff members available. Please add staff first.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Instructions for different user roles */}
      <div className="p-3 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)]">
        <p className="text-sm text-foreground">
          {isCompanyOwner 
            ? "Select the staff member who will handle this appointment."
            : "Select 1 staff member to assign directly, or choose 2-3 preferred staff members for the company owner to assign."
          }
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {staff.filter(s => s.status === 'Active').map((staffMember) => {
          const isSelected = isCompanyOwner ? selectedStaff === staffMember.id : preferredStaff.includes(staffMember.id);
          const canSelect = isCompanyOwner 
            ? true 
            : (preferredStaff.length < 3 || isSelected);
          
          return (
            <Card
              key={staffMember.id}
              className={`cursor-pointer transition-all duration-200 relative touch-manipulation ${
                !canSelect ? 'opacity-50 cursor-not-allowed' : ''
              } ${
                isSelected 
                  ? 'border-[var(--accent-border)] bg-[var(--accent-bg)] ring-2 ring-[var(--accent-border)]' 
                  : 'border-[var(--glass-border)] bg-[var(--glass-bg)] hover:border-[var(--accent-border)] active:bg-[var(--accent-bg)]'
              }`}
              onClick={() => {
                if (!canSelect) return;
                
                if (isCompanyOwner) {
                  setSelectedStaff(staffMember.id);
                } else {
                  const newPreferred = isSelected 
                    ? preferredStaff.filter(id => id !== staffMember.id)
                    : [...preferredStaff, staffMember.id];
                  setPreferredStaff(newPreferred);
                }
              }}
            >
              {/* Selection indicator for users */}
              {!isCompanyOwner && isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--accent-primary)] text-white rounded-full flex items-center justify-center text-xs font-medium z-10">
                  {preferredStaff.indexOf(staffMember.id) + 1}
                </div>
              )}
              
              <div className="p-3 space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10 border-2 border-[var(--glass-border)]">
                    <AvatarImage src={formatAvatarUrl(staffMember.avatar, staffMember.firstName, staffMember.lastName)} alt={`${staffMember.firstName || ''} ${staffMember.lastName || ''}`} />
                    <AvatarFallback className="text-xs">
                      {(staffMember.firstName?.[0] || '')}{(staffMember.lastName?.[0] || '')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground truncate text-sm">
                      {staffMember.firstName || ''} {staffMember.lastName || ''}
                    </h4>
                    <p className="text-xs text-[var(--accent-text)]">{staffMember.role || 'Staff Member'}</p>
                  </div>
                </div>
                
                {staffMember.bio && (
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground line-clamp-2">{staffMember.bio}</p>
                  </div>
                )}
                
                <Badge 
                  variant={staffMember.status === 'Active' ? "default" : "secondary"}
                  className={`text-xs ${staffMember.status === 'Active'
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                  }`}
                >
                  {staffMember.status}
                </Badge>
              </div>
            </Card>
          );
        })}
      </div>
      
      {/* Selection counter for users */}
      {!isCompanyOwner && (
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            {preferredStaff.length === 1 
              ? "1 staff member selected - will be assigned directly"
              : `Selected ${preferredStaff.length} of 3 preferred staff members`
            }
          </p>
        </div>
      )}
    </div>
  );
};
