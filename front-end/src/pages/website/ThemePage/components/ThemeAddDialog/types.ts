import type {
  ThemeButtonSetting,
  ThemeColorSetting,
  ThemeFontSetting,
} from "@/services/companyWebThemes";
import type { ThemeTextSettingItem, ThemeTextStyle } from "@/pages/website/ThemeFormPage/components";

export type ThemeTab = "basic" | "text" | "colors" | "textSetting" | "buttons";

export interface BasicTabState {
  name: string;
  isActive: boolean;
  isDefault: boolean;
  backgroundColor: string;
  bodyTextColor: string;
}

export interface ThemeDialogState {
  basic: BasicTabState;
  textStyles: Record<string, ThemeTextStyle>;
  colorItems: Record<string, ThemeColorSetting>;
  textSettingItems: Record<string, ThemeTextSettingItem>;
  buttonItems: Record<string, ThemeButtonSetting>;
}

export interface ThemeDialogDerivedOptions {
  fontTypeOptions: ThemeFontSetting[];
  colorOptions: ThemeColorSetting[];
  textStyleOptions: ThemeTextSettingItem[];
}
