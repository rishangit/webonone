import { Building } from "lucide-react";
import { Card } from "../../../components/ui/card";
import { Label } from "../../../components/ui/label";
import { CardTitle } from "../../../components/common/CardTitle";
import { User as UserType, UserRoleNames } from "../../../types/user";

interface ProfessionalInformationCardProps {
  user: UserType;
}

export const ProfessionalInformationCard = ({ user }: ProfessionalInformationCardProps) => {
  return (
    <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] shadow-lg">
      <CardTitle title="Professional Information" icon={Building} />
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
