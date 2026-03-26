import { User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { DateDisplay } from "@/components/common/DateDisplay";
import { CardTitle } from "@/components/common/CardTitle";
import { PersonalInfoCardProps } from "../types";

export const PersonalInfoCard = ({ staff, userInfo }: PersonalInfoCardProps) => {
  return (
    <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] shadow-lg">
      <CardTitle title="Personal Information" icon={User} className="mb-6" />

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-foreground">First Name</Label>
            <p className="p-2 text-foreground">{staff.firstName || 'Not provided'}</p>
          </div>
          
          <div className="space-y-2">
            <Label className="text-foreground">Last Name</Label>
            <p className="p-2 text-foreground">{staff.lastName || 'Not provided'}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">Email Address <span className="text-red-500">*</span></Label>
          <p className="p-2 text-foreground">{staff.email || 'Not provided'}</p>
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">Phone Number</Label>
          <p className="p-2 text-foreground">{staff.phone || userInfo?.phone || 'Not provided'}</p>
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">Address</Label>
          <p className="p-2 text-foreground">{staff.address || userInfo?.address || 'Not provided'}</p>
        </div>

        {userInfo?.dateOfBirth && (
          <div className="space-y-2">
            <Label className="text-foreground">Date of Birth</Label>
            <p className="p-2 text-foreground">
              <DateDisplay date={userInfo.dateOfBirth} />
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
