import { AppointmentViewProps } from "./types";
import { AppointmentDetails } from "./components/AppointmentDetails";
import { StaffSelector } from "./components/StaffSelector";

export const AppointmentCardView = ({
  date,
  time,
  duration,
  phone,
  location,
  hasSpaceEntity,
  hasStaffEntity,
  staff,
  preferredStaff,
  availableStaff,
  currentStaffId,
  handleStaffAssignment
}: AppointmentViewProps) => {
  return (
    <>
      {/* Second Row: Date, Time, Contact, Location - Each on separate lines */}
      <div className="space-y-2 mb-3">
        <AppointmentDetails
          date={date}
          time={time}
          duration={duration}
          phone={phone}
          location={location}
          hasSpaceEntity={hasSpaceEntity}
          useDateDisplay={false}
        />
      </div>

      {/* Third Row: Staff Information - Only show if staff entity is enabled */}
      {hasStaffEntity && (staff || preferredStaff) && (
        <div>
          <StaffSelector
            staff={staff}
            availableStaff={availableStaff}
            currentStaffId={currentStaffId}
            onStaffChange={handleStaffAssignment}
            showLabel={true}
          />
        </div>
      )}
    </>
  );
};
