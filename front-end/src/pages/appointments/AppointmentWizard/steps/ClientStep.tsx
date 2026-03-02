import { User, Search, Check, UserPlus } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Card } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../../../../components/ui/avatar";
import { DateDisplay } from "../../../../components/common/DateDisplay";
import { formatAvatarUrl } from "../../../../utils";

interface ClientStepProps {
  users: any[];
  usersLoading: boolean;
  usersError: string | null;
  filteredUsers: any[];
  selectedUser: string;
  setSelectedUser: (user: string) => void;
  clientSearchQuery: string;
  setClientSearchQuery: (query: string) => void;
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
  clientSearchQuery,
  setClientSearchQuery,
  isCompanyOwner,
  onRetry,
  onCreateUser
}: ClientStepProps) => {
  return (
    <div className="flex flex-col h-full space-y-3">
      {/* Search Input */}
      <div className="relative shrink-0">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search users by name, email, or phone..."
          value={clientSearchQuery}
          onChange={(e) => setClientSearchQuery(e.target.value)}
          className="pl-10 bg-[var(--glass-bg)] border-[var(--glass-border)] focus:border-[var(--accent-border)]"
        />
      </div>

      {/* Users Count */}
      <div className="text-xs text-muted-foreground">
        {clientSearchQuery ? (
          <>Found {filteredUsers.length} of {users?.length || 0} user{users?.length !== 1 ? 's' : ''}</>
        ) : (
          <>{users?.length || 0} user{(users?.length || 0) !== 1 ? 's' : ''} available</>
        )}
      </div>
      
      <div className="flex-1 min-h-0 sm:h-80 overflow-y-auto overflow-x-hidden custom-scrollbar space-y-2 border border-[var(--glass-border)] rounded-lg p-2 bg-[var(--glass-bg)]/50">
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
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">
              {users?.length === 0 
                ? "No users available." 
                : "No users found matching your search."}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center mt-4">
              {clientSearchQuery && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setClientSearchQuery("")}
                >
                  Clear search
                </Button>
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
          </div>
        ) : (
          filteredUsers.map((user) => (
            <Card
              key={user.id}
              className={`cursor-pointer transition-all duration-200 w-full touch-manipulation ${
                selectedUser === user.id 
                  ? 'border-[var(--accent-border)] bg-[var(--accent-bg)] ring-2 ring-[var(--accent-border)]' 
                  : 'border-[var(--glass-border)] bg-[var(--glass-bg)] hover:border-[var(--accent-border)] active:bg-[var(--accent-bg)]'
              }`}
              onClick={() => setSelectedUser(user.id)}
            >
              <div className="p-3 flex items-center gap-3 w-full min-w-0">
                <div className="relative flex-shrink-0">
                  <Avatar className="w-10 h-10 border border-[var(--glass-border)]">
                    <AvatarImage src={formatAvatarUrl(user.avatar, user.firstName, user.lastName)} alt={`${user.firstName || ''} ${user.lastName || ''}`} />
                    <AvatarFallback className="text-xs">
                      {(user.firstName?.[0] || '')}{(user.lastName?.[0] || '')}
                    </AvatarFallback>
                  </Avatar>
                  {selectedUser === user.id && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--accent-primary)] text-white rounded-full flex items-center justify-center">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0 overflow-hidden">
                  <h4 className="font-medium text-foreground truncate text-sm">
                    {`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email}
                  </h4>
                  <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  {user.phone && (
                    <p className="text-xs text-muted-foreground truncate sm:hidden">{user.phone}</p>
                  )}
                </div>
                
                <div className="flex-shrink-0 text-right hidden sm:block">
                  {user.createdAt && (
                    <>
                      <p className="text-xs text-muted-foreground whitespace-nowrap">Joined</p>
                      <p className="text-xs text-[var(--accent-text)] whitespace-nowrap"><DateDisplay date={user.createdAt} /></p>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
