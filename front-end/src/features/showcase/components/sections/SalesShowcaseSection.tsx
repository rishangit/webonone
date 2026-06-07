"use client";

import { Receipt } from "lucide-react";
import { SalesCard } from "@/shared/components/sales";
import { createShowcaseNoopHandler, showcaseSale } from "../../fixtures";
import type { ShowcaseSectionProps } from "../../types";
import { ShowcaseSectionHeading } from "../ShowcaseSectionHeading";

const LIST = "space-y-4";

export function SalesShowcaseSection({ sectionId }: ShowcaseSectionProps) {
  const noop = createShowcaseNoopHandler();
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);

  return (
    <div>
      <ShowcaseSectionHeading sectionId={sectionId} icon={Receipt} title="Sales card" />
      <div className={LIST}>
        <SalesCard
          sale={showcaseSale}
          formatCurrency={formatCurrency}
          onViewDetails={() => noop()}
          onDeleteSale={() => noop()}
          onDeleteItem={() => noop()}
          isCompanyOwner={true}
        />
      </div>
    </div>
  );
}
