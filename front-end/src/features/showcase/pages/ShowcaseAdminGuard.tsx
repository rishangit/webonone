import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "@/store/hooks";
import { isRole, UserRole } from "@/shared/types/user";

interface ShowcaseAdminGuardProps {
  children: ReactNode;
}

export function ShowcaseAdminGuard({ children }: ShowcaseAdminGuardProps) {
  const { user } = useAppSelector((state) => state.auth);

  if (!isRole(user?.role, UserRole.SYSTEM_ADMIN)) {
    return <Navigate to="/system/dashboard" replace />;
  }

  return <>{children}</>;
}
