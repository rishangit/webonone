"use client";

import { Package } from "lucide-react";
import { CompanyProductCard } from "@/shared/components/products-company";
import { createShowcaseNoopHandler, showcaseCompanyProduct } from "../../fixtures";
import type { ShowcaseSectionProps } from "../../types";
import { ShowcaseSectionHeading } from "../ShowcaseSectionHeading";

const GRID = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4";
const LIST = "space-y-4";

export function ProductShowcaseSection({ sectionId, viewMode }: ShowcaseSectionProps) {
  const noop = createShowcaseNoopHandler();

  return (
    <div>
      <ShowcaseSectionHeading sectionId={sectionId} icon={Package} title="Product card" />
      <div className={viewMode === "grid" ? GRID : LIST}>
        <CompanyProductCard product={showcaseCompanyProduct} viewMode={viewMode} onView={() => noop()} onDelete={() => noop()} />
      </div>
    </div>
  );
}
