import { ComponentType } from "react";
import { ContentAddon, ContentAddonType } from "../types";

export interface AddonRenderProps {
  addon: ContentAddon;
  companyId?: string;
}

export interface AddonEditProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  addon: ContentAddon;
  companyId?: string;
  contentElementId: string;
  onSave: (addon: ContentAddon) => void;
}

export interface AddonModule {
  type: ContentAddonType;
  label: string;
  description: string;
  createDefaultAddon: (args: { companyId?: string; contentElementId: string }) => ContentAddon;
  RenderComponent: ComponentType<AddonRenderProps>;
  EditComponent: ComponentType<AddonEditProps>;
}
