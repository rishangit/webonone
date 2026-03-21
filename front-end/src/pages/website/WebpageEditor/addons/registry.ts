import { AddonModule } from "./types";
import { imageAddonModule } from "./image/ImageAddon";
import { textAddonModule } from "./text/TextAddon";
import { buttonAddonModule } from "./button/ButtonAddon";
import { ContentAddonType } from "../types";

const modules: AddonModule[] = [imageAddonModule, textAddonModule, buttonAddonModule];

export const getAddonModules = () => modules;

export const getAddonModuleByType = (type: ContentAddonType) =>
  modules.find((module) => module.type === type);
