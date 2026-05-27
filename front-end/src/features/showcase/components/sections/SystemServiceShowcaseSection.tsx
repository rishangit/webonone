"use client";

import { Stethoscope } from "lucide-react";
import { SystemServiceCard } from "@/shared/components/services-catalog";
import { createShowcaseNoopHandler, showcaseSystemService } from "../../fixtures";
import type { ShowcaseSectionProps } from "../../types";
import { ShowcaseSectionHeading } from "../ShowcaseSectionHeading";

const GRID = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4";
const LIST = "space-y-4";

export function SystemServiceShowcaseSection({ sectionId, viewMode }: ShowcaseSectionProps) {
  const noop = createShowcaseNoopHandler();

  return (
    <div>
      <ShowcaseSectionHeading sectionId={sectionId} icon={Stethoscope} title="System service card" />
      <div className={viewMode === "grid" ? GRID : LIST}>
        <SystemServiceCard
          service={showcaseSystemService}
          viewMode={viewMode}
          onView={() => noop()}
          onEdit={() => noop()}
          onDelete={() => noop()}
        />
      </div>
    </div>
  );
}
