import { Avatar, AvatarFallback, AvatarImage } from "../../../../components/ui/avatar";
import { DateDisplay } from "../../../../components/common/DateDisplay";
import { formatAvatarUrl } from "../../../../utils";

interface ReviewStepProps {
  appointmentDate?: Date;
  appointmentTime: string;
  selectedServiceData?: any;
  selectedStaffData?: any;
  preferredStaff: string[];
  staff: any[];
  selectedSpaceData?: any;
  selectedUserData?: any;
  notes: string;
  isCompanyOwner: boolean;
}

export const ReviewStep = ({
  appointmentDate,
  appointmentTime,
  selectedServiceData,
  selectedStaffData,
  preferredStaff,
  staff,
  selectedSpaceData,
  selectedUserData,
  notes,
  isCompanyOwner
}: ReviewStepProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date & Time */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-[var(--accent-text)]">Date & Time</h4>
          <div className="p-3 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)]">
            <p className="text-sm font-medium text-foreground">
              <DateDisplay date={appointmentDate} fallback="Not selected" />
            </p>
            {appointmentTime && (
              <p className="text-xs text-muted-foreground">at {appointmentTime}</p>
            )}
          </div>
        </div>

        {/* Service */}
        {selectedServiceData && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-[var(--accent-text)]">Service</h4>
            <div className="p-3 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)]">
              <p className="text-sm font-medium text-foreground">{selectedServiceData.name}</p>
              <p className="text-xs text-muted-foreground">{selectedServiceData.duration} • {selectedServiceData.price}</p>
            </div>
          </div>
        )}

        {/* Staff */}
        {((selectedStaffData && isCompanyOwner) || (!isCompanyOwner && preferredStaff.length > 0)) && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-[var(--accent-text)]">
              {isCompanyOwner ? 'Staff' : 'Preferred Staff'}
            </h4>
            <div className="p-3 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)]">
              {isCompanyOwner && selectedStaffData ? (
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={formatAvatarUrl(selectedStaffData.avatar, selectedStaffData.firstName, selectedStaffData.lastName)} alt={`${selectedStaffData.firstName || ''} ${selectedStaffData.lastName || ''}`} />
                    <AvatarFallback className="text-xs">
                      {(selectedStaffData.firstName?.[0] || '')}{(selectedStaffData.lastName?.[0] || '')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {selectedStaffData.firstName || ''} {selectedStaffData.lastName || ''}
                    </p>
                    <p className="text-xs text-muted-foreground">{selectedStaffData.role || 'Staff Member'}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {preferredStaff.map((staffId, index) => {
                    const staffData = staff.find(s => s.id === staffId);
                    return (
                      <div key={staffId} className="flex items-center gap-3">
                        <div className="w-6 h-6 bg-[var(--accent-primary)] text-white rounded-full flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={formatAvatarUrl(staffData?.avatar, staffData?.firstName, staffData?.lastName)} alt={`${staffData?.firstName || ''} ${staffData?.lastName || ''}`} />
                          <AvatarFallback className="text-xs">
                            {(staffData?.firstName?.[0] || '')}{(staffData?.lastName?.[0] || '')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {staffData ? `${staffData.firstName || ''} ${staffData.lastName || ''}`.trim() : 'Unknown'}
                          </p>
                          <p className="text-xs text-muted-foreground">{staffData?.role || 'Staff Member'}</p>
                        </div>
                      </div>
                    );
                  })}
                  <p className="text-xs text-muted-foreground mt-2">
                    The company owner will assign one of these staff members when confirming your appointment.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Space */}
        {selectedSpaceData && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-[var(--accent-text)]">Space</h4>
            <div className="p-3 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)]">
              <p className="text-sm font-medium text-foreground">{selectedSpaceData.name}</p>
              <p className="text-xs text-muted-foreground">Capacity: {selectedSpaceData.capacity}</p>
            </div>
          </div>
        )}

        {/* Client */}
        {selectedUserData && isCompanyOwner && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-[var(--accent-text)]">Client</h4>
            <div className="p-3 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center gap-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={formatAvatarUrl(selectedUserData.avatar, selectedUserData.firstName, selectedUserData.lastName)} alt={`${selectedUserData.firstName || ''} ${selectedUserData.lastName || ''}`} />
                <AvatarFallback className="text-xs">
                  {(selectedUserData.firstName?.[0] || '')}{(selectedUserData.lastName?.[0] || '')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {`${selectedUserData.firstName || ''} ${selectedUserData.lastName || ''}`.trim() || selectedUserData.email}
                </p>
                <p className="text-xs text-muted-foreground truncate">{selectedUserData.email}</p>
              </div>
            </div>
          </div>
        )}

        {/* Notes */}
        {notes && (
          <div className="space-y-2 md:col-span-2">
            <h4 className="text-sm font-medium text-[var(--accent-text)]">Notes</h4>
            <div className="p-3 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)]">
              <p className="text-xs text-muted-foreground">{notes}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
