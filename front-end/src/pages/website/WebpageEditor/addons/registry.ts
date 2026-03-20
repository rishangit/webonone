import { AddonModule } from "./types";
import { imageAddonModule } from "./image/ImageAddon";
import { ContentAddonType } from "../types";

const modules: AddonModule[] = [imageAddonModule];

export const getAddonModules = () => modules;

export const getAddonModuleByType = (type: ContentAddonType) =>
  modules.find((module) => module.type === type);
