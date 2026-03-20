import { ContentAddon } from "../../types";
import { getAddonModuleByType } from "../registry";

interface ContentAddonsRendererProps {
  addons?: ContentAddon[];
  companyId?: string;
}

export const ContentAddonsRenderer = ({ addons = [], companyId }: ContentAddonsRendererProps) => {
  if (!addons.length) return null;

  return (
    <>
      {addons.map((addon) => {
        const module = getAddonModuleByType(addon.type);
        if (!module) return null;
        const RenderComponent = module.RenderComponent;
        return <RenderComponent key={addon.id} addon={addon} companyId={companyId} />;
      })}
    </>
  );
};
