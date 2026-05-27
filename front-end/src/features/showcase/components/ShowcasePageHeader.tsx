import { config } from "@/config/environment";
import { Badge } from "@/components/ui/badge";

export function ShowcasePageHeader() {
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-3xl font-bold text-foreground">Component Showcase</h1>
        <Badge variant="outline" className="border-[var(--glass-border)]">
          v{config.appVersion}
        </Badge>
      </div>
      <p className="text-muted-foreground text-lg max-w-3xl">
        Review all system UI in one place — check alignment, spacing, and theme (light / dark / accent) without
        opening every feature page.
      </p>
    </div>
  );
}
