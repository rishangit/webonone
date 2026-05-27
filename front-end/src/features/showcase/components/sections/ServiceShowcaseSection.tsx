"use client";

import { Stethoscope } from "lucide-react";
import { getImageUrl, getStatusColor, ServiceCard } from "@/shared/components/services-catalog";
import { createShowcaseNoopHandler, showcaseService } from "../../fixtures";
import type { ShowcaseSectionProps } from "../../types";
import { showcaseFormatDuration, showcaseFormatPrice } from "../../utils";
import { ShowcaseSectionHeading } from "../ShowcaseSectionHeading";

const GRID = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4";
const LIST = "space-y-4";

export function ServiceShowcaseSection({ sectionId, viewMode }: ShowcaseSectionProps) {
  const noop = createShowcaseNoopHandler();

  return (
    <div>
      <ShowcaseSectionHeading sectionId={sectionId} icon={Stethoscope} title="Service card" />
      <div className={viewMode === "grid" ? GRID : LIST}>
        <ServiceCard
          service={showcaseService}
          viewMode={viewMode}
          onView={() => noop()}
          onEdit={() => noop()}
          onDelete={() => noop()}
          onDuplicate={() => noop()}
          onArchive={() => noop()}
          formatPrice={showcaseFormatPrice}
          formatDuration={showcaseFormatDuration}
          getImageUrl={getImageUrl}
          getStatusColor={getStatusColor}
        />
      </div>
    </div>
  );
}
