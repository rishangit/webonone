import { ComponentType } from "react";
import { ContentAddon, ContentAddonType } from "../types";
import type { ThemeButtonSetting, ThemeTextSetting } from "@/services/companyWebThemes";
import type { CompanyWebPage } from "@/services/companyWebPages";

/** `published` = real navigation (public site). `editor` = same look, links disabled in the editor. */
export type AddonRenderContext = "editor" | "published";

export interface AddonRenderProps {
  addon: ContentAddon;
  companyId?: string;
  /** Theme text styles for the company's selected theme (editor / visual preview). */
  themeTextSettings?: ThemeTextSetting[];
  /** Theme buttons from `themeData.buttons`. */
  themeButtonSettings?: ThemeButtonSetting[];
  /** Company web pages for button link dropdown / resolving target URLs. */
  companyWebPages?: CompanyWebPage[];
  addonRenderContext?: AddonRenderContext;
}

export interface AddonEditProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addon: ContentAddon;
  companyId?: string;
  contentElementId: string;
  onSave: (addon: ContentAddon) => void;
  themeTextSettings?: ThemeTextSetting[];
  themeButtonSettings?: ThemeButtonSetting[];
  companyWebPages?: CompanyWebPage[];
}

export interface AddonModule {
  type: ContentAddonType;
  label: string;
  description: string;
  createDefaultAddon: (args: { companyId?: string; contentElementId: string }) => ContentAddon;
  RenderComponent: ComponentType<AddonRenderProps>;
  EditComponent: ComponentType<AddonEditProps>;
}
