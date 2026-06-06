import { BackButton } from "@/components/common/BackButton";
import { Card } from "@/components/ui/card";
import { useAppSelector } from "@/store/hooks";
import { UserAppointmentHistoryPanel } from "@/features/appointments/components/UserAppointmentHistoryPanel";

interface User {
  email: string;
  role: string;
  name: string;
  companyId?: string;
}

interface UserAppointmentHistoryPageProps {
  userId: string;
  onBack: () => void;
  currentUser?: User | null;
}

export const UserAppointmentHistoryPage = ({
  userId,
  onBack,
  currentUser,
}: UserAppointmentHistoryPageProps) => {
  const { user } = useAppSelector((state) => state.auth);
  const companyId = user?.companyId || currentUser?.companyId;

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="flex items-center gap-4">
        <BackButton onClick={onBack} label="Back to Users" />
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Appointment History</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            View all completed appointment sales for this user
          </p>
        </div>
      </div>

      {companyId ? (
        <UserAppointmentHistoryPanel
          userId={userId}
          companyId={companyId}
          variant="page"
          enabled
        />
      ) : (
        <Card className="p-8 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] text-center">
          <p className="text-muted-foreground">Company context is required to load history.</p>
        </Card>
      )}
    </div>
  );
};
