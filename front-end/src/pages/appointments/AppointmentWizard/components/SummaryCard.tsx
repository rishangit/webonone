import { Calendar, Briefcase, Users, MapPin, User, FileText, CheckCircle } from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../components/ui/avatar";
import { DateDisplay } from "../../../../components/common/DateDisplay";
import { formatAvatarUrl } from "../../../../utils";

interface SummaryCardProps {
  appointmentDate?: Date;
  appointmentTime: string;
  selectedService?: string;
  selectedServiceData?: any;
  selectedStaff?: string;
  selectedStaffData?: any;
  preferredStaff: string[];
  staff: any[];
  selectedSpace?: string;
  selectedSpaceData?: any;
  selectedUser?: string;
  selectedUserData?: any;
  filteredUsers: any[];
  notes: string;
  isCompanyOwner: boolean;
  companyCurrency?: any;
  selectedEntities?: string[] | null;
}

export const SummaryCard = ({
  appointmentDate,
  appointmentTime,
  selectedService,
  selectedServiceData,
  selectedStaff,
  selectedStaffData,
  preferredStaff,
  staff,
  selectedSpace,
  selectedSpaceData,
  selectedUser,
  selectedUserData,
  filteredUsers,
  notes,
  isCompanyOwner,
  companyCurrency,
  selectedEntities
}: SummaryCardProps) => {
  // Check which entities are enabled
  const hasServiceEntity = !selectedEntities || selectedEntities.includes('service');
  const hasStaffEntity = !selectedEntities || selectedEntities.includes('staff');
  const hasSpaceEntity = !selectedEntities || selectedEntities.includes('space');
  return (
    <Card className="bg-[var(--glass-bg)] border-[var(--glass-border)] backdrop-blur-md shadow-lg flex flex-col">
      {/* Summary Title */}
      <div className="shrink-0 flex items-center gap-2 p-3 sm:p-4 border-b border-[var(--glass-border)]">
        <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--accent-text)]" />
        <h3 className="text-sm sm:text-base font-semibold text-foreground">Summary</h3>
      </div>
      <div className="p-3 sm:p-4 overflow-y-auto custom-scrollbar flex-1 min-h-0">
        <div className="flex flex-col gap-2 sm:gap-3 text-sm">
          {/* Date & Time - Step 1 */}
          <div className="space-y-2 p-3 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[var(--accent-text)]" />
              <span className="text-muted-foreground text-xs">Date & Time</span>
            </div>
            <div className="text-foreground font-medium text-sm">
              <DateDisplay date={appointmentDate} fallback="Not selected" />
            </div>
            <div className="text-foreground font-medium text-sm">
              {appointmentTime || 'Time not selected'}
            </div>
          </div>

          {/* Service - Step 2 - Only show if service entity is enabled */}
          {hasServiceEntity && (
            <div className="space-y-2 p-3 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)]">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[var(--accent-text)]" />
                <span className="text-muted-foreground text-xs">Service</span>
              </div>
              {selectedService && selectedServiceData && (() => {
                // Get image URL - handle both image and imageUrl properties, and format if needed
                const imageSrc = selectedServiceData.image || selectedServiceData.imageUrl;
                const serviceImageUrl = imageSrc 
                  ? (imageSrc.startsWith('companies/') || imageSrc.startsWith('/uploads/') 
                      ? formatAvatarUrl(imageSrc) 
                      : imageSrc)
                  : undefined;
                
                return serviceImageUrl ? (
                  <img 
                    src={serviceImageUrl}
                    alt="Service"
                    className="w-12 h-12 rounded object-cover"
                  />
                ) : null;
              })()}
              <div className="text-foreground font-medium text-sm">
                {selectedService ? selectedServiceData?.name : 'Not selected'}
              </div>
              {selectedService && selectedServiceData && (
                <div className="text-xs text-muted-foreground">
                  {companyCurrency ? `${companyCurrency.symbol} ${selectedServiceData.price.toFixed(companyCurrency.decimals || 2)}` : `$ ${selectedServiceData.price.toFixed(2)}`} • {selectedServiceData.duration} min
                </div>
              )}
            </div>
          )}

          {/* Staff - Step 3 - Only show if staff entity is enabled */}
          {hasStaffEntity && (
            <div className="space-y-2 p-3 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)]">
              <div className="flex items-center gap-2">
                {isCompanyOwner && selectedStaff && selectedStaffData && (
                  <Avatar className="w-8 h-8">
                    <AvatarImage 
                      src={formatAvatarUrl(selectedStaffData.avatar, selectedStaffData.firstName, selectedStaffData.lastName)}
                      alt={`${selectedStaffData.firstName || ''} ${selectedStaffData.lastName || ''}`.trim()}
                    />
                    <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)] text-xs">
                      {`${(selectedStaffData.firstName?.[0] || '')}${(selectedStaffData.lastName?.[0] || '')}`}
                    </AvatarFallback>
                  </Avatar>
                )}
                {!isCompanyOwner && <Users className="w-4 h-4 text-[var(--accent-text)]" />}
                <span className="text-muted-foreground text-xs">
                  {isCompanyOwner ? 'Staff' : 'Preferred Staff'}
                </span>
              </div>
              <div className="text-foreground font-medium text-sm">
                {isCompanyOwner ? (
                  selectedStaff && selectedStaffData ? `${selectedStaffData.firstName || ''} ${selectedStaffData.lastName || ''}`.trim() : 'Not selected'
                ) : (
                  preferredStaff.length > 0 ? `${preferredStaff.length} selected` : 'Not selected'
                )}
              </div>
              {isCompanyOwner && selectedStaff && selectedStaffData && (
                <div className="text-xs text-muted-foreground">
                  {selectedStaffData.role || 'Staff Member'}
                </div>
              )}
              {!isCompanyOwner && preferredStaff.length > 0 && (
                <div className="space-y-2">
                  {preferredStaff.map((staffId) => {
                    const staffData = staff.find(s => s.id === staffId);
                    return (
                      <div key={staffId} className="flex items-center gap-2 text-xs">
                        <Avatar className="w-8 h-8">
                          <AvatarImage 
                            src={staffData ? formatAvatarUrl(staffData.avatar, staffData.firstName, staffData.lastName) : undefined}
                            alt={staffData ? `${staffData.firstName || ''} ${staffData.lastName || ''}`.trim() : 'Unknown'}
                          />
                          <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)] text-xs">
                            {staffData ? `${(staffData.firstName?.[0] || '')}${(staffData.lastName?.[0] || '')}` : '?'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-muted-foreground">
                          {staffData ? `${staffData.firstName || ''} ${staffData.lastName || ''}`.trim() : 'Unknown'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Space - Step 4 - Only show if space entity is enabled */}
          {hasSpaceEntity && (
            <div className="space-y-2 p-3 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)]">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[var(--accent-text)]" />
                <span className="text-muted-foreground text-xs">Space</span>
              </div>
              {selectedSpace && selectedSpaceData?.imageUrl && (
                <img 
                  src={formatAvatarUrl(selectedSpaceData.imageUrl)}
                  alt="Space"
                  className="w-12 h-12 rounded object-cover"
                />
              )}
              <div className="text-foreground font-medium text-sm">
                {selectedSpace ? selectedSpaceData?.name : 'Not selected'}
              </div>
              {selectedSpace && selectedSpaceData && (
                <div className="text-xs text-muted-foreground">
                  Capacity: {selectedSpaceData.capacity}
                </div>
              )}
            </div>
          )}

          {/* Client - Step 5 */}
          <div className="space-y-2 p-3 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)]">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-[var(--accent-text)]" />
              <span className="text-muted-foreground text-xs">Client</span>
            </div>
            {selectedUser && selectedUserData?.avatar && (
              <img 
                src={formatAvatarUrl(selectedUserData.avatar, selectedUserData.firstName, selectedUserData.lastName)}
                alt="Client"
                className="w-12 h-12 rounded-full object-cover"
              />
            )}
            <div className="text-foreground font-medium text-sm">
              {selectedUser ? filteredUsers.find(u => u.id === selectedUser)?.name : 'Not selected'}
            </div>
            {selectedUser && (
              <div className="text-xs text-muted-foreground">
                {filteredUsers.find(u => u.id === selectedUser)?.email}
              </div>
            )}
          </div>

          {/* Notes - Step 6 */}
          {notes && (
            <div className="space-y-2 p-3 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)]">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[var(--accent-text)]" />
                <span className="text-muted-foreground text-xs">Notes</span>
              </div>
              <div className="text-xs text-foreground bg-[var(--accent-bg)] border border-[var(--accent-border)] rounded p-2">
                {notes}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
