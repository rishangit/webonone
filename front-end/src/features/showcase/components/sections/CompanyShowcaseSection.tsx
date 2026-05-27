"use client";

import { Building } from "lucide-react";
import { CompanyCard, CompanyListView } from "@/shared/components/companies";
import { createShowcaseNoopHandler, showcaseCompany } from "../../fixtures";
import type { ShowcaseSectionProps } from "../../types";
import { ShowcaseSectionHeading } from "../ShowcaseSectionHeading";

const GRID = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4";
const LIST = "space-y-4";

export function CompanyShowcaseSection({ sectionId, viewMode }: ShowcaseSectionProps) {
  const noop = createShowcaseNoopHandler();

  return (
    <div>
      <ShowcaseSectionHeading sectionId={sectionId} icon={Building} title="Company card" />
      {viewMode === "grid" ? (
        <div className={GRID}>
          <CompanyCard company={showcaseCompany} onViewCompany={() => noop()} />
        </div>
      ) : (
        <div className={LIST}>
          <CompanyListView company={showcaseCompany} onViewCompany={() => noop()} />
        </div>
      )}
    </div>
  );
}
