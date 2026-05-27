"use client";

import { Users } from "lucide-react";
import { UserCard } from "@/shared/components/users";
import { showcaseUser } from "../../fixtures";
import type { ShowcaseSectionProps } from "../../types";
import { ShowcaseSectionHeading } from "../ShowcaseSectionHeading";

const GRID = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4";
const LIST = "space-y-4";

export function UserShowcaseSection({ sectionId, viewMode }: ShowcaseSectionProps) {
  return (
    <div>
      <ShowcaseSectionHeading sectionId={sectionId} icon={Users} title="User card" />
      <div className={viewMode === "grid" ? GRID : LIST}>
        <UserCard
          id={showcaseUser.id}
          name={showcaseUser.name}
          email={showcaseUser.email}
          phone={showcaseUser.phone}
          avatar={showcaseUser.avatar}
          role={showcaseUser.role}
          status={showcaseUser.status}
          location={showcaseUser.location}
          viewMode={viewMode}
          user={showcaseUser}
        />
      </div>
    </div>
  );
}
