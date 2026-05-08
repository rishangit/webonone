import { Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface StaffSelectorProps {
  staff?: {
    name: string;
    image?: string;
    specialization: string;
  };
  availableStaff: Array<{ id: string; name: string; image?: string; specialization: string; isAssigned?: boolean }>;
  currentStaffId: string;
  onStaffChange: (staffMember: { id: string; name: string; image?: string; specialization: string }) => void;
  showLabel?: boolean;
}

export const StaffSelector = ({
  staff,
  availableStaff,
  currentStaffId,
  onStaffChange,
  showLabel = true
}: StaffSelectorProps) => {
  if (availableStaff.length === 0) {
    return <p className="text-sm text-muted-foreground">No staff available</p>;
  }

  return (
    <div className="w-full" onClick={(e) => e.stopPropagation()}>
      {showLabel && (
        <div className="flex items-center gap-2 mb-2">
          <Users className="w-4 h-4 text-[var(--accent-text)] flex-shrink-0" />
          <span className="text-sm text-muted-foreground">
            {staff ? 'Assigned Staff:' : 'Preferred Staff:'}
          </span>
        </div>
      )}
      <Select
        value={currentStaffId}
        onValueChange={(value) => {
          const selectedStaffMember = availableStaff.find(s => (s.id || s.name) === value);
          if (selectedStaffMember) {
            onStaffChange({
              id: selectedStaffMember.id || selectedStaffMember.name,
              name: selectedStaffMember.name,
              image: selectedStaffMember.image,
              specialization: selectedStaffMember.specialization
            });
          }
        }}
      >
        <SelectTrigger className="w-full h-auto py-2 !bg-transparent border-none shadow-none hover:!bg-transparent focus-visible:ring-0">
          <div className="flex items-center gap-3 w-full">
            <Avatar className="w-10 h-10 flex-shrink-0">
              <AvatarImage src={availableStaff.find(s => (s.id || s.name) === currentStaffId)?.image} />
              <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)] text-sm">
                {availableStaff.find(s => (s.id || s.name) === currentStaffId)?.name.split(' ').map(n => n[0]).join('') || ''}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0 text-left">
              <SelectValue>
                <div>
                  <p className="text-sm font-medium text-foreground truncate">
                    {availableStaff.find(s => (s.id || s.name) === currentStaffId)?.name || 'Select staff'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {availableStaff.find(s => (s.id || s.name) === currentStaffId)?.specialization || ''}
                  </p>
                </div>
              </SelectValue>
            </div>
          </div>
        </SelectTrigger>
        <SelectContent>
          {availableStaff.map((staffMember, index) => (
            <SelectItem 
              key={staffMember.id || staffMember.name || index} 
              value={staffMember.id || staffMember.name}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-3 py-1">
                <Avatar className="w-8 h-8 flex-shrink-0">
                  <AvatarImage src={staffMember.image} />
                  <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)] text-xs">
                    {staffMember.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{staffMember.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{staffMember.specialization}</p>
                </div>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
