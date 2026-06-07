"use client";

import { ClipboardList } from "lucide-react";
import { CustomFormCard } from "@/shared/components/customForms";
import { createShowcaseNoopHandler, showcaseCustomForm } from "../../fixtures";
import type { ShowcaseSectionProps } from "../../types";
import { ShowcaseSectionHeading } from "../ShowcaseSectionHeading";

const GRID = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4";

export function CustomFormShowcaseSection({ sectionId }: ShowcaseSectionProps) {
  const noop = createShowcaseNoopHandler();

  return (
    <div>
      <ShowcaseSectionHeading sectionId={sectionId} icon={ClipboardList} title="Custom form card" />
      <div className={GRID}>
        <CustomFormCard
          form={showcaseCustomForm}
          onEditMeta={() => noop()}
          onOpenBuilder={() => noop()}
          onDuplicate={() => noop()}
          onDelete={() => noop()}
        />
      </div>
    </div>
  );
}
