import { Building } from "lucide-react";
import { Card } from "../../../components/ui/card";
import { Label } from "../../../components/ui/label";
import { User as UserType, UserRoleNames } from "../../../types/user";

interface ProfessionalInformationCardProps {
  user: UserType;
}

export const ProfessionalInformationCard = ({ user }: ProfessionalInformationCardProps) => {
  return (
    <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] shadow-lg">
      <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
        <Building className="w-5 h-5 text-[var(--accent-text)]" />
        Professional Information
      </h3>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-muted-foreground">Role</Label>
          <p className="text-foreground">{user?.role !== undefined ? UserRoleNames[user.role] : 'User'}</p>
        </div>

        <div className="space-y-2">
          <Label className="text-muted-foreground">Account Status</Label>
          <p className="text-foreground">{user?.isActive ? 'Active' : 'Inactive'}</p>
        </div>

        <div className="space-y-2">
          <Label className="text-muted-foreground">Verification Status</Label>
          <p className="text-foreground">{user?.isVerified ? 'Verified' : 'Unverified'}</p>
        </div>
      </div>
    </Card>
  );
};
