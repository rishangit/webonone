"use client";

import { MapPin } from "lucide-react";
import { SpaceCard } from "@/shared/components/spaces";
import { createShowcaseNoopHandler, showcaseSpace } from "../../fixtures";
import type { ShowcaseSectionProps } from "../../types";
import { ShowcaseSectionHeading } from "../ShowcaseSectionHeading";

const GRID = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4";
const LIST = "space-y-4";

export function SpaceShowcaseSection({ sectionId, viewMode }: ShowcaseSectionProps) {
  const noop = createShowcaseNoopHandler();

  return (
    <div>
      <ShowcaseSectionHeading sectionId={sectionId} icon={MapPin} title="Space card" />
      <div className={viewMode === "grid" ? GRID : LIST}>
        <SpaceCard space={showcaseSpace} viewMode={viewMode} onView={() => noop()} onEdit={() => noop()} onDelete={() => noop()} />
      </div>
    </div>
  );
}
