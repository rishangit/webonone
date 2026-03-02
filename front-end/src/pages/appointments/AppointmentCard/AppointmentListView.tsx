import { AppointmentViewProps } from "./types";
import { AppointmentDetails } from "./components/AppointmentDetails";
import { StaffSelector } from "./components/StaffSelector";

export const AppointmentListView = ({
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
    <div className="flex flex-col lg:flex-row lg:gap-6">
      {/* Left Side: Appointment Details */}
      <div className="flex-1 min-w-0">
        <div className="space-y-2 mb-3 lg:mb-0">
          <AppointmentDetails
            date={date}
            time={time}
            duration={duration}
            phone={phone}
            location={location}
            hasSpaceEntity={hasSpaceEntity}
            useDateDisplay={true}
          />
        </div>
      </div>

      {/* Right Side: Staff Information (Desktop/Tablet) - Only show if staff entity is enabled */}
      {hasStaffEntity && (staff || preferredStaff) && (
        <div className="lg:w-64 lg:flex-shrink-0 mt-3 lg:mt-0">
          <div>
            <StaffSelector
              staff={staff}
              availableStaff={availableStaff}
              currentStaffId={currentStaffId}
              onStaffChange={handleStaffAssignment}
              showLabel={true}
            />
          </div>
        </div>
      )}
    </div>
  );
};
