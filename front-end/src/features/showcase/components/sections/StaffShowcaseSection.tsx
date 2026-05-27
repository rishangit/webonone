"use client";

import { UserCheck } from "lucide-react";
import { StaffCard } from "@/shared/components/staff";
import { createShowcaseNoopHandler, showcaseStaff } from "../../fixtures";
import type { ShowcaseSectionProps } from "../../types";
import { ShowcaseSectionHeading } from "../ShowcaseSectionHeading";

const GRID = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4";
const LIST = "space-y-4";

export function StaffShowcaseSection({ sectionId, viewMode }: ShowcaseSectionProps) {
  const noop = createShowcaseNoopHandler();
  const member = showcaseStaff;

  return (
    <div>
      <ShowcaseSectionHeading sectionId={sectionId} icon={UserCheck} title="Staff card" />
      <div className={viewMode === "grid" ? GRID : LIST}>
        <StaffCard member={member} viewMode={viewMode} onView={() => noop()} onDelete={() => noop()} />
      </div>
    </div>
  );
}
