"use client";

import { SlidersHorizontal } from "lucide-react";
import { ProductAttributeCard } from "@/shared/components/product-attributes";
import {
  createShowcaseNoopHandler,
  showcaseProductAttribute,
  showcaseUnitsOfMeasure,
} from "../../fixtures";
import type { ShowcaseSectionProps } from "../../types";
import { ShowcaseSectionHeading } from "../ShowcaseSectionHeading";

const GRID = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4";
const LIST = "space-y-4";

export function ProductAttributeShowcaseSection({ sectionId, viewMode }: ShowcaseSectionProps) {
  const noop = createShowcaseNoopHandler();

  return (
    <div>
      <ShowcaseSectionHeading sectionId={sectionId} icon={SlidersHorizontal} title="Product attribute card" />
      <div className={viewMode === "grid" ? GRID : LIST}>
        <ProductAttributeCard
          attribute={showcaseProductAttribute}
          unitsOfMeasure={showcaseUnitsOfMeasure}
          viewMode={viewMode}
          onEdit={() => noop()}
          onDelete={() => noop()}
        />
      </div>
    </div>
  );
}
