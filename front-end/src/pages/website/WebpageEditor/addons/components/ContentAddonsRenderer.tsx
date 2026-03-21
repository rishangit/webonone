import { ContentAddon } from "../../types";
import { getAddonModuleByType } from "../registry";
import type { ThemeTextSetting } from "../../../../../services/companyWebThemes";

interface ContentAddonsRendererProps {
  addons?: ContentAddon[];
  companyId?: string;
  themeTextSettings?: ThemeTextSetting[];
}

export const ContentAddonsRenderer = ({ addons = [], companyId, themeTextSettings }: ContentAddonsRendererProps) => {
  if (!addons.length) return null;

  return (
    <>
      {addons.map((addon) => {
        const module = getAddonModuleByType(addon.type);
        if (!module) return null;
        const RenderComponent = module.RenderComponent;
        return (
          <RenderComponent
            key={addon.id}
            addon={addon}
            companyId={companyId}
            themeTextSettings={themeTextSettings}
          />
        );
      })}
    </>
  );
};
