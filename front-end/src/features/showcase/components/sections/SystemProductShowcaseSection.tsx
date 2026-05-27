"use client";

import { Package } from "lucide-react";
import { SystemProductCard } from "@/shared/components/products-system";
import { createShowcaseNoopHandler, showcaseSystemProduct } from "../../fixtures";
import type { ShowcaseSectionProps } from "../../types";
import { ShowcaseSectionHeading } from "../ShowcaseSectionHeading";

const GRID = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4";
const LIST = "space-y-4";

export function SystemProductShowcaseSection({ sectionId, viewMode }: ShowcaseSectionProps) {
  const noop = createShowcaseNoopHandler();

  return (
    <div>
      <ShowcaseSectionHeading sectionId={sectionId} icon={Package} title="System product card" />
      <div className={viewMode === "grid" ? GRID : LIST}>
        <SystemProductCard
          product={showcaseSystemProduct}
          viewMode={viewMode}
          onViewProduct={() => noop()}
          onEdit={() => noop()}
          onDelete={() => noop()}
          onToggleStatus={() => noop()}
        />
      </div>
    </div>
  );
}
