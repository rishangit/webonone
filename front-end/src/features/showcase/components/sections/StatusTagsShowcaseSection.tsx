"use client";

import { AlertTriangle, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/components/ui/utils";
import { TagStatus } from "@/shared/components/tags";
import { STATUS_BADGE_GROUPS } from "@/shared/utils/statusBadges";

function StatusBadgeChip({ label, className }: { label: string; className: string }) {
  return (
    <Badge className={cn("border text-xs font-medium", className)}>
      {label === "Verified" && <CheckCircle className="w-3 h-3 mr-1" />}
      {label === "Unverified" && <AlertTriangle className="w-3 h-3 mr-1" />}
      {label}
    </Badge>
  );
}

export function StatusTagsShowcaseSection() {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Status tags</h3>
        <p className="text-sm text-muted-foreground">
          Badge styles used across the app for statuses (appointments, products, companies, backlog, etc.)
        </p>
      </div>

      <Card className="bg-[var(--glass-bg)] border-[var(--glass-border)]">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Tag entity (TagStatus)</CardTitle>
          <CardDescription>features/tags/components/TagStatus.tsx</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <TagStatus isActive />
          <TagStatus isActive={false} />
        </CardContent>
      </Card>

      {STATUS_BADGE_GROUPS.map((group) => (
        <Card key={group.id} className="bg-[var(--glass-bg)] border-[var(--glass-border)]">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">{group.title}</CardTitle>
            <CardDescription>{group.description}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {group.badges.map((badge) => (
              <StatusBadgeChip key={`${group.id}-${badge.label}`} label={badge.label} className={badge.className} />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
