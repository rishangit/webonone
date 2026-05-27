"use client";

import { Ruler } from "lucide-react";
import { UnitOfMeasureCard } from "@/shared/components/units-of-measure";
import { createShowcaseNoopHandler, showcaseUnitsOfMeasure } from "../../fixtures";
import type { ShowcaseSectionProps } from "../../types";
import { ShowcaseSectionHeading } from "../ShowcaseSectionHeading";

const GRID = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4";
const LIST = "space-y-4";

const showcaseGetBaseUnitName = (baseUnitId: string | null | undefined) => {
  if (!baseUnitId) return "—";
  const unit = showcaseUnitsOfMeasure.find((u) => u.id === baseUnitId);
  return unit ? `${unit.unitName} (${unit.symbol})` : "—";
};

export function UnitOfMeasureShowcaseSection({ sectionId, viewMode }: ShowcaseSectionProps) {
  const noop = createShowcaseNoopHandler();
  const unit = showcaseUnitsOfMeasure[0];

  return (
    <div>
      <ShowcaseSectionHeading sectionId={sectionId} icon={Ruler} title="Unit of measure card" />
      <div className={viewMode === "grid" ? GRID : LIST}>
        <UnitOfMeasureCard
          unit={unit}
          viewMode={viewMode}
          getBaseUnitName={showcaseGetBaseUnitName}
          onEdit={() => noop()}
          onDelete={() => noop()}
        />
      </div>
    </div>
  );
}
