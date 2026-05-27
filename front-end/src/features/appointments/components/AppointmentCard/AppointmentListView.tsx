import { Clock, Phone, MapPin } from "lucide-react";
import { DateDisplay } from "@/components/common/DateDisplay";
import {
  ListCardDetailDivider,
  ListCardDetailField,
  ListCardDetailGrid,
} from "@/components/common/ListCardLayout";
import { AppointmentViewProps } from "./types";
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
    <>
      <ListCardDetailGrid>
        <ListCardDetailField label="Date">
          <DateDisplay date={date} className="text-sm font-medium text-foreground" />
        </ListCardDetailField>
        <ListCardDetailField icon={Clock} value={`${time} (${duration})`} />
        <ListCardDetailField icon={Phone} value={phone} />
      </ListCardDetailGrid>
      <ListCardDetailDivider />
      <ListCardDetailGrid>
        {hasSpaceEntity ? (
          <ListCardDetailField icon={MapPin} label="Location" value={location} />
        ) : (
          <ListCardDetailField icon={MapPin} label="Location" value="—" />
        )}
        {hasStaffEntity && (staff || preferredStaff) ? (
          <ListCardDetailField className="sm:col-span-2">
            <StaffSelector
              staff={staff}
              availableStaff={availableStaff}
              currentStaffId={currentStaffId}
              onStaffChange={handleStaffAssignment}
              showLabel={true}
            />
          </ListCardDetailField>
        ) : (
          <ListCardDetailField label="Staff" value="—" className="sm:col-span-2" />
        )}
      </ListCardDetailGrid>
    </>
  );
};
