import { ContentAddon } from "../../types";
import { getAddonModuleByType } from "../registry";
import type { ThemeButtonSetting, ThemeTextSetting } from "@/services/companyWebThemes";
import type { CompanyWebPage } from "@/services/companyWebPages";
import type { AddonRenderContext } from "../types";
import type { BreakpointName } from "../../types";
import {
  computeAddonDisplayZIndex,
  ensureAddonLayoutsForBreakpoint,
  layoutToGridStyle,
  maxLayoutRowEnd,
} from "../addonGridUtils";

interface ContentAddonsRendererProps {
  addons?: ContentAddon[];
  companyId?: string;
  themeTextSettings?: ThemeTextSetting[];
  themeButtonSettings?: ThemeButtonSetting[];
  companyWebPages?: CompanyWebPage[];
  addonRenderContext?: AddonRenderContext;
  breakpoint?: BreakpointName;
  /** Match content block row height (default 60). */
  rowHeight?: number;
}

/**
 * Read-only 12-column grid for addons (public + visual preview).
 */
export const ContentAddonsRenderer = ({
  addons = [],
  companyId,
  themeTextSettings,
  themeButtonSettings,
  companyWebPages,
  addonRenderContext = "published",
  breakpoint = "2xl",
  rowHeight = 60,
}: ContentAddonsRendererProps) => {
  if (!addons.length) return null;

  const list = ensureAddonLayoutsForBreakpoint(addons, breakpoint);
  const maxRow = maxLayoutRowEnd(list);
  const minH = Math.max(maxRow, 1) * rowHeight;

  return (
    <div
      className="grid w-full grid-cols-12 gap-1"
      style={{
        gridAutoRows: `${rowHeight}px`,
        minHeight: `${minH}px`,
      }}
    >
      {list.map((addon, i) => {
        const module = getAddonModuleByType(addon.type);
        if (!module || !addon.layout) return null;
        const RenderComponent = module.RenderComponent;
        return (
          <div
            key={addon.id}
            className="relative min-h-0 h-full overflow-hidden"
            style={{
              ...layoutToGridStyle(addon.layout),
              zIndex: computeAddonDisplayZIndex(addon, i, "none"),
            }}
          >
            <RenderComponent
              addon={addon}
              companyId={companyId}
              themeTextSettings={themeTextSettings}
              themeButtonSettings={themeButtonSettings}
              companyWebPages={companyWebPages}
              addonRenderContext={addonRenderContext}
            />
          </div>
        );
      })}
    </div>
  );
};
