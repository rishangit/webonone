import { memo } from "react";
import { UserCard } from "../../UserCard";
import { UsersListProps } from "../types";

export const UsersList = memo(({
  users,
  viewMode,
  currentUser,
  onViewProfile,
  onViewAppointments,
  onImpersonate,
  isSystemAdmin,
}: UsersListProps) => {
  return (
    <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "space-y-4"}>
      {users.map((user) => (
        <UserCard
          key={user.id}
          id={user.id}
          name={user.name}
          email={user.email}
          phone={user.phone}
          avatar={user.avatar}
          role={user.role}
          status={user.status.toLowerCase() as 'active' | 'inactive' | 'pending'}
          location={user.location}
          currentUser={currentUser}
          viewMode={viewMode}
          user={user}
          onViewProfile={onViewProfile}
          onViewAppointments={onViewAppointments}
          onImpersonate={onImpersonate}
          isSystemAdmin={isSystemAdmin}
        />
      ))}
    </div>
  );
});

UsersList.displayName = "UsersList";
