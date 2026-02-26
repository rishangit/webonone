import { User as UserType } from "../../../types/user";
import { ProfileHeaderCard } from "./ProfileHeaderCard";
import { PersonalInformationCard } from "./PersonalInformationCard";
import { ProfessionalInformationCard } from "./ProfessionalInformationCard";
import { CompanyRegistrationSection } from "./CompanyRegistrationSection";

interface ProfileTabProps {
  user: UserType;
  userId?: string;
  isUpdating: boolean;
  onAvatarUpload: (filePath: string) => void;
  onAvatarDelete: () => void;
}

export const ProfileTab = ({
  user,
  userId,
  isUpdating,
  onAvatarUpload,
  onAvatarDelete,
}: ProfileTabProps) => {
  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <ProfileHeaderCard
        user={user}
        userId={userId}
        isUpdating={isUpdating}
        onAvatarUpload={onAvatarUpload}
        onAvatarDelete={onAvatarDelete}
      />

      {/* Detailed Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <PersonalInformationCard user={user} userId={userId} />

        {/* Professional Information */}
        <ProfessionalInformationCard user={user} />

        {/* Company Registration */}
        <CompanyRegistrationSection show={!userId} />
      </div>
    </div>
  );
};
