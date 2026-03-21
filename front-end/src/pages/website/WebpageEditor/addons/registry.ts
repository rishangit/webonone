import { AddonModule } from "./types";
import { imageAddonModule } from "./image/ImageAddon";
import { textAddonModule } from "./text/TextAddon";
import { ContentAddonType } from "../types";

const modules: AddonModule[] = [imageAddonModule, textAddonModule];

export const getAddonModules = () => modules;

export const getAddonModuleByType = (type: ContentAddonType) =>
  modules.find((module) => module.type === type);
