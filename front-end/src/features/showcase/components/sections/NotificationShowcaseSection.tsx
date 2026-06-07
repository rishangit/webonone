"use client";

import { Bell } from "lucide-react";
import { NotificationCard } from "@/shared/components/notifications";
import { createShowcaseNoopHandler, showcaseNotification } from "../../fixtures";
import type { ShowcaseSectionProps } from "../../types";
import { ShowcaseSectionHeading } from "../ShowcaseSectionHeading";

const LIST = "space-y-4";

export function NotificationShowcaseSection({ sectionId }: ShowcaseSectionProps) {
  const noop = createShowcaseNoopHandler();

  return (
    <div>
      <ShowcaseSectionHeading sectionId={sectionId} icon={Bell} title="Notification card" />
      <div className={LIST}>
        <NotificationCard
          notification={showcaseNotification}
          onMarkAsRead={() => noop()}
          onMarkAsUnread={() => noop()}
          onDelete={() => noop()}
          onAction={() => noop()}
        />
      </div>
    </div>
  );
}
