import { TabSwitcher } from "@/components/ui/tab-switcher";
import type { BreakpointName } from "@/pages/website/WebpageEditor/types";
import { RESPONSIVE_BREAKPOINT_ORDER } from "@/pages/website/WebpageEditor/responsiveBreakpointUtils";

export interface ResponsiveBreakpointTabsProps {
  activeTab: BreakpointName;
  onTabChange: (value: BreakpointName) => void;
  className?: string;
}

const TABS = RESPONSIVE_BREAKPOINT_ORDER.map((value) => ({
  value,
  label: value,
}));

/**
 * Shared sm / md / lg / xl / 2xl switcher (same pattern as theme Text Setting font sizes).
 * Use for any per-breakpoint editing: font sizes, images, etc.
 */
export function ResponsiveBreakpointTabs({
  activeTab,
  onTabChange,
  className,
}: ResponsiveBreakpointTabsProps) {
  return (
    <TabSwitcher
      className={className}
      tabs={TABS}
      activeTab={activeTab}
      onTabChange={(v) => onTabChange(v as BreakpointName)}
    />
  );
}
