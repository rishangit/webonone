"use client";

import { Tag } from "lucide-react";
import { TagCard } from "@/shared/components/tags";
import { createShowcaseNoopHandler, showcaseTag } from "../../fixtures";
import type { ShowcaseSectionProps } from "../../types";
import { ShowcaseSectionHeading } from "../ShowcaseSectionHeading";
import { StatusTagsShowcaseSection } from "./StatusTagsShowcaseSection";

const GRID = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4";
const LIST = "space-y-4";

export function TagShowcaseSection({ sectionId, viewMode }: ShowcaseSectionProps) {
  const noop = createShowcaseNoopHandler();

  return (
    <div>
      <ShowcaseSectionHeading sectionId={sectionId} icon={Tag} title="Tag card" />
      <div className={viewMode === "grid" ? GRID : LIST}>
        <TagCard tag={showcaseTag} viewMode={viewMode} onEdit={() => noop()} onDelete={() => noop()} onToggleStatus={() => noop()} />
      </div>

      <StatusTagsShowcaseSection />
    </div>
  );
}
