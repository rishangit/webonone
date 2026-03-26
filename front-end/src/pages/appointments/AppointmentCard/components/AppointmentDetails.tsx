import { Clock, Phone, MapPin, Calendar } from "lucide-react";
import { DateDisplay } from "@/components/common/DateDisplay";
import { formatDate } from "../../../../utils";

interface AppointmentDetailsProps {
  date: string;
  time: string;
  duration: string;
  phone: string;
  location: string;
  hasSpaceEntity: boolean;
  useDateDisplay?: boolean;
}

export const AppointmentDetails = ({
  date,
  time,
  duration,
  phone,
  location,
  hasSpaceEntity,
  useDateDisplay = false
}: AppointmentDetailsProps) => {
  return (
    <div className="space-y-2">
      {/* Date */}
      <div className="flex items-center gap-2 text-sm">
        <Calendar className="w-4 h-4 text-[var(--accent-text)] flex-shrink-0" />
        <span className="text-foreground font-medium">
          {useDateDisplay ? <DateDisplay date={date} /> : formatDate(date)}
        </span>
      </div>
      
      {/* Time */}
      <div className="flex items-center gap-2 text-sm">
        <Clock className="w-4 h-4 text-[var(--accent-text)] flex-shrink-0" />
        <span className="text-foreground font-medium">{time}</span>
        <span className="text-muted-foreground">({duration})</span>
      </div>
      
      {/* Contact */}
      <div className="flex items-center gap-2 text-sm">
        <Phone className="w-4 h-4 text-[var(--accent-text)] flex-shrink-0" />
        <span className="text-muted-foreground">{phone}</span>
      </div>
      
      {/* Location/Space - Only show if space entity is enabled */}
      {hasSpaceEntity && (
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-[var(--accent-text)] flex-shrink-0" />
          <span className="text-muted-foreground">{location}</span>
        </div>
      )}
    </div>
  );
};
