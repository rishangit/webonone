"use client";

import { UserRoleBadge } from "@/components/UserRoleBadge";
import { UserRole } from "@/shared/types/user";

export function RoleBadgesShowcaseSection() {
  return (
    <div id="showcase-cards-role-badges" className="scroll-mt-24 space-y-3">
      <h3 className="text-lg font-semibold text-foreground">User role badges</h3>
      <div className="flex flex-wrap gap-3">
        <UserRoleBadge role={UserRole.SYSTEM_ADMIN} />
        <UserRoleBadge role={UserRole.COMPANY_OWNER} />
        <UserRoleBadge role={UserRole.STAFF_MEMBER} />
        <UserRoleBadge role={UserRole.USER} />
      </div>
    </div>
  );
}
