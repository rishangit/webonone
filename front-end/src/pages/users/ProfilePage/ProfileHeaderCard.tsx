import { useState } from "react";
import { Shield, Mail, Phone, MapPin, User, Edit } from "lucide-react";
import { Card } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import FileUpload from "../../../components/ui/file-upload";
import { User as UserType, UserRoleNames } from "../../../types/user";
import { formatAvatarUrl } from "../../../utils";

interface ProfileHeaderCardProps {
  user: UserType;
  userId?: string;
  isUpdating: boolean;
  onAvatarUpload: (filePath: string) => void;
  onAvatarDelete: () => void;
}

export const ProfileHeaderCard = ({
  user,
  userId,
  isUpdating,
  onAvatarUpload,
  onAvatarDelete,
}: ProfileHeaderCardProps) => {
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);

  return (
    <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] shadow-lg">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Avatar Section */}
        <div className="flex flex-col items-center space-y-4">
          {!userId && isEditingAvatar ? (
            <FileUpload
              onFileUploaded={(filePath, _fileUrl) => {
                onAvatarUpload(filePath);
                setIsEditingAvatar(false);
              }}
              onFileDeleted={() => {
                onAvatarDelete();
                setIsEditingAvatar(false);
              }}
              currentImagePath={user?.avatar}
              currentImageUrl={user?.avatar}
              folderPath={`users/${user?.id}/profile`}
              label="Upload Avatar"
              maxSize={2}
              className="w-full max-w-xs"
              disabled={isUpdating}
            />
          ) : (
            <div className="relative">
              {!userId && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute -top-2 -right-2 z-10 bg-background/80 hover:bg-background"
                  onClick={() => setIsEditingAvatar(true)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
              )}
              <Avatar className="w-32 h-32">
                <AvatarImage 
                  src={formatAvatarUrl(user?.avatar, user?.firstName, user?.lastName)} 
                  alt={`${user?.firstName || ''} ${user?.lastName || ''}`}
                  onError={() => {
                    console.error('Avatar image failed to load:', user?.avatar);
                  }}
                  onLoad={() => {
                    if (process.env.NODE_ENV === 'development') {
                      console.log('Avatar image loaded successfully:', user?.avatar);
                    }
                  }}
                />
                <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)] text-4xl">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
          <div className="text-center">
            <h2 className="text-2xl font-semibold text-foreground">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-[var(--accent-text)]">{user?.email}</p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30">
                <Shield className="w-3 h-3 mr-1" />
                {user?.isVerified ? 'Verified' : 'Unverified'}
              </Badge>
              <Badge variant="outline" className="text-muted-foreground">
                {user?.role !== undefined ? UserRoleNames[user.role] : 'User'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Quick Info */}
        <div className="flex-1 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[var(--accent-bg)]">
                <Mail className="w-4 h-4 text-[var(--accent-text)]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium text-foreground">{user?.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[var(--accent-bg)]">
                <Phone className="w-4 h-4 text-[var(--accent-text)]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Phone</p>
                <p className="font-medium text-foreground">{user?.phone || 'Not provided'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[var(--accent-bg)]">
                <MapPin className="w-4 h-4 text-[var(--accent-text)]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Address</p>
                <p className="font-medium text-foreground">{user?.address || 'Not provided'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-[var(--accent-bg)]">
                <User className="w-4 h-4 text-[var(--accent-text)]" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <p className="font-medium text-foreground">{user?.role !== undefined ? UserRoleNames[user.role] : 'User'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
