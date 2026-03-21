import { ComponentType } from "react";
import { ContentAddon, ContentAddonType } from "../types";
import type { ThemeTextSetting } from "../../../../services/companyWebThemes";

export interface AddonRenderProps {
  addon: ContentAddon;
  companyId?: string;
  /** Theme text styles for the company's selected theme (editor / visual preview). */
  themeTextSettings?: ThemeTextSetting[];
}

export interface AddonEditProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addon: ContentAddon;
  companyId?: string;
  contentElementId: string;
  onSave: (addon: ContentAddon) => void;
  themeTextSettings?: ThemeTextSetting[];
}

export interface AddonModule {
  type: ContentAddonType;
  label: string;
  description: string;
  createDefaultAddon: (args: { companyId?: string; contentElementId: string }) => ContentAddon;
  RenderComponent: ComponentType<AddonRenderProps>;
  EditComponent: ComponentType<AddonEditProps>;
}
