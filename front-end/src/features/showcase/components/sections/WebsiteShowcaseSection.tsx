"use client";

import { FolderOpen, Globe, Palette } from "lucide-react";
import { MediaCard, ThemeCard, WebpageCard } from "@/shared/components/website";
import { SHOWCASE_IMAGE_MEDIA } from "@/shared/utils/showcaseFixture";
import {
  createShowcaseNoopHandler,
  showcaseCompany,
  showcaseMediaFolder,
  showcaseMediaImageFile,
  showcaseTheme,
  showcaseWebPage,
} from "../../fixtures";
import type { ShowcaseSectionProps } from "../../types";
import { ShowcaseSectionHeading } from "../ShowcaseSectionHeading";

const GRID = "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4";
const LIST = "space-y-4";

const formatMediaSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function WebsiteShowcaseSection({ sectionId, viewMode }: ShowcaseSectionProps) {
  const noop = createShowcaseNoopHandler();
  const layout = viewMode === "grid" ? GRID : LIST;
  const companyId = showcaseCompany.id;

  return (
    <div className="space-y-10">
      <div>
        <ShowcaseSectionHeading
          sectionId={`${sectionId}-webpage`}
          icon={Globe}
          title="Web page card"
        />
        <div className={layout}>
          <WebpageCard
            webPage={showcaseWebPage}
            viewMode={viewMode}
            onEdit={() => noop()}
            onBrowse={() => noop()}
            onDelete={() => noop()}
          />
        </div>
      </div>

      <div>
        <ShowcaseSectionHeading
          sectionId={`${sectionId}-theme`}
          icon={Palette}
          title="Theme card"
        />
        <div className={layout}>
          <ThemeCard
            theme={showcaseTheme}
            viewMode={viewMode}
            onEdit={() => noop()}
            onSetDefault={() => noop()}
            onDelete={() => noop()}
          />
        </div>
      </div>

      <div>
        <ShowcaseSectionHeading
          sectionId={`${sectionId}-media`}
          icon={FolderOpen}
          title="Media card"
        />
        <div className={layout}>
          <MediaCard
            item={showcaseMediaImageFile}
            companyId={companyId}
            viewMode={viewMode}
            formatSize={formatMediaSize}
            onOpen={() => noop()}
            onDelete={() => noop()}
            previewImageUrl={SHOWCASE_IMAGE_MEDIA}
          />
          <MediaCard
            item={showcaseMediaFolder}
            companyId={companyId}
            viewMode={viewMode}
            formatSize={formatMediaSize}
            onOpen={() => noop()}
            onDelete={() => noop()}
          />
        </div>
      </div>
    </div>
  );
}
