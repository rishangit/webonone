import type { CompanyWebTheme, ThemeButtonSetting, ThemeTextSetting } from "@/services/companyWebThemes";

/**
 * Pick the theme used for resolving text styles in the editor (default → active → first).
 */
export function pickCompanyThemeForTextStyles(themes: CompanyWebTheme[]): CompanyWebTheme | null {
  if (!themes?.length) return null;
  return themes.find((t) => t.isDefault) || themes.find((t) => t.isActive) || themes[0];
}

/**
 * `themeData.textSettings` entries; if empty, fall back to legacy `fontSettings` as text styles.
 */
export function getThemeTextSettingsList(theme: CompanyWebTheme | null): ThemeTextSetting[] {
  if (!theme?.themeData) return [];
  const td = theme.themeData;
  const fromText = td.textSettings ?? [];
  if (fromText.length) return fromText;
  const fonts = td.fontSettings ?? [];
  return fonts.map((f) => ({
    styleName: f.styleName,
    googleFontUrl: f.googleFontUrl,
    fontFamily: f.fontFamily,
    fontSize: f.fontSize,
    fontSizeByBreakpoint: {
      sm: f.fontSize,
      md: f.fontSize,
      lg: f.fontSize,
      xl: f.fontSize,
      "2xl": f.fontSize,
    },
    fontColor: undefined,
  }));
}

/** Buttons from `themeData.buttons` for the selected company theme. */
export function getThemeButtonSettingsList(theme: CompanyWebTheme | null): ThemeButtonSetting[] {
  if (!theme?.themeData?.buttons?.length) return [];
  return theme.themeData.buttons;
}
