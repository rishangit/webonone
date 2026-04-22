import { User, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DateDisplay } from "@/components/common/DateDisplay";
import { formatAvatarUrl } from "../../../../utils";
import { UserSelectionDialog } from "@/components/common/UserSelectionDialog";
import { useMemo, useState } from "react";

interface ClientStepProps {
  users: any[];
  usersLoading: boolean;
  usersError: string | null;
  filteredUsers: any[];
  selectedUser: string;
  setSelectedUser: (user: string) => void;
  isCompanyOwner: boolean;
  onRetry: () => void;
  onCreateUser: () => void;
}

export const ClientStep = ({
  users,
  usersLoading,
  usersError,
  filteredUsers,
  selectedUser,
  setSelectedUser,
  isCompanyOwner,
  onRetry,
  onCreateUser
}: ClientStepProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);

  const selectedUserData = useMemo(
    () => filteredUsers.find((user) => String(user.id) === String(selectedUser)) || null,
    [filteredUsers, selectedUser]
  );

  const selectedName = selectedUserData
    ? `${selectedUserData.firstName || ""} ${selectedUserData.lastName || ""}`.trim() || selectedUserData.email
    : "No client selected";

  return (
    <div className="flex flex-col h-full space-y-3">
      <div className="flex-1 min-h-0 sm:h-80 overflow-y-auto overflow-x-hidden custom-scrollbar space-y-2 border border-[var(--glass-border)] rounded-lg p-3 bg-[var(--glass-bg)]/50">
        {usersLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-primary)] mx-auto mb-2"></div>
            <p className="text-sm">Loading users...</p>
          </div>
        ) : usersError ? (
          <div className="text-center py-8">
            <User className="w-8 h-8 mx-auto mb-2 opacity-50 text-red-500" />
            <p className="text-sm text-red-600 dark:text-red-400 mb-2">Error loading users</p>
            <p className="text-xs text-muted-foreground">{usersError}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={onRetry}
            >
              Retry
            </Button>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No users available.</p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center mt-4">
              <Button variant="outline" size="sm" onClick={onRetry}>
                Retry
              </Button>
              {isCompanyOwner && (
                <Button
                  variant="accent"
                  size="sm"
                  onClick={onCreateUser}
                  className="flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  Create New User
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <Card className="border-[var(--glass-border)] bg-[var(--glass-bg)]">
              <div className="p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="w-10 h-10 border border-[var(--glass-border)]">
                    <AvatarImage
                      src={
                        selectedUserData
                          ? formatAvatarUrl(selectedUserData.avatar, selectedUserData.firstName, selectedUserData.lastName)
                          : undefined
                      }
                      alt={selectedName}
                    />
                    <AvatarFallback className="text-xs">
                      {selectedUserData
                        ? `${selectedUserData.firstName?.[0] || ""}${selectedUserData.lastName?.[0] || ""}`
                        : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h4 className="font-medium text-foreground truncate text-sm">{selectedName}</h4>
                    {selectedUserData?.email ? (
                      <p className="text-xs text-muted-foreground truncate">{selectedUserData.email}</p>
                    ) : null}
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setDialogOpen(true)} className="shrink-0">
                  Select Client
                </Button>
              </div>
            </Card>

            {selectedUserData?.createdAt && (
              <p className="text-xs text-muted-foreground px-1">
                Client since <DateDisplay date={selectedUserData.createdAt} />
              </p>
            )}

            {isCompanyOwner && (
              <Button
                variant="accent"
                size="sm"
                onClick={onCreateUser}
                className="flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Create New User
              </Button>
            )}
          </div>
        )}
      </div>

      <UserSelectionDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        value={selectedUser || null}
        onChange={(userId) => setSelectedUser(userId ? String(userId) : "")}
        users={users || []}
        title="Select Client"
        description="Choose the client for this appointment"
        placeholder="Search users by name or email..."
        error={!selectedUser}
      />
    </div>
  );
};
