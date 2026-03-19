import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Save, Pencil } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { TabSwitcher } from "../../../components/ui/tab-switcher";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import {
  fetchThemeRequest,
  createThemeRequest,
  updateThemeRequest,
  clearError,
} from "../../../store/slices/companyWebThemesSlice";
import {
  CreateThemeData,
  type ThemeData,
  type ThemeTextSetting,
  type ThemeFontSetting,
  type ThemeColorSetting,
  type UpdateThemeData,
  type ThemeButtonSetting,
} from "../../../services/companyWebThemes";
import { toast } from "sonner";
import {
  TextStyleEditDialog,
  type ThemeTextStyle,
  TextSettingEditDialog,
  type ThemeTextSettingItem,
} from "./components";
import { ButtonEditDialog } from "./components";

export const ThemeFormPage = () => {
  const { themeId } = useParams<{ themeId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { currentTheme, loading, error } = useAppSelector(
    (state) => state.companyWebThemes
  );
  const { userCompany, currentCompany } = useAppSelector(
    (state) => state.companies
  );

  const company = currentCompany || userCompany;
  const companyId = company?.id;

  const isNew = !themeId;
  const isViewMode =
    themeId && new URLSearchParams(location.search).get("view") === "true";
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "basic" | "text" | "colors" | "textSetting" | "buttons"
  >("basic");

  const [formData, setFormData] = useState<{
    companyId: string;
    name: string;
    backgroundColor: string;
    bodyTextColor: string;
    isActive: boolean;
    isDefault: boolean;
  }>({
    companyId: companyId || "",
    name: "",
    backgroundColor: "",
    bodyTextColor: "",
    isActive: false,
    isDefault: false,
  });

  const [textStyles, setTextStyles] = useState<
    Record<string, ThemeTextStyle>
  >(
    () => ({})
  );

  const [colorItems, setColorItems] = useState<
    Record<string, ThemeColorSetting>
  >(() => ({}));

  const [buttonItems, setButtonItems] = useState<
    Record<string, ThemeButtonSetting>
  >(() => ({}));

  const [textSettingItems, setTextSettingItems] = useState<
    Record<string, ThemeTextSettingItem>
  >(() => ({}));

  const [editStyleKey, setEditStyleKey] = useState<string | null>(null);
  const [isTextStyleDialogOpen, setIsTextStyleDialogOpen] = useState(false);

  const [editTextSettingKey, setEditTextSettingKey] = useState<string | null>(
    null
  );
  const [isTextSettingDialogOpen, setIsTextSettingDialogOpen] =
    useState(false);

  const [editButtonKey, setEditButtonKey] = useState<string | null>(null);
  const [isButtonDialogOpen, setIsButtonDialogOpen] = useState(false);

  useEffect(() => {
    if (themeId) {
      dispatch(fetchThemeRequest(themeId));
    }
  }, [dispatch, themeId]);

  useEffect(() => {
    if (companyId) {
      setFormData((prev) => ({ ...prev, companyId }));
    }
  }, [companyId]);

  useEffect(() => {
    if (currentTheme && themeId) {
      const basic =
        currentTheme.themeData?.basicSetting ??
        ({
          backgroundColor: currentTheme.backgroundColor || "",
          fontColor: currentTheme.bodyTextColor || "",
        } as ThemeData["basicSetting"]);

      const data = {
        companyId: currentTheme.companyId,
        name: currentTheme.name,
        backgroundColor: basic.backgroundColor || "",
        bodyTextColor: basic.fontColor || "",
        isActive: currentTheme.isActive,
        isDefault: currentTheme.isDefault,
      };
      setFormData(data);

      // Populate fonts + text settings from themeData if available
      const existingFontSettings =
        currentTheme.themeData?.fontSettings ??
        currentTheme.themeData?.textSettings ??
        [];

      const existingTextSettings =
        currentTheme.themeData?.textSettings ?? [];

      const mappedFonts: Record<string, ThemeTextStyle> = {};
      existingFontSettings.forEach((f: any, index: number) => {
        const key = `style-${index + 1}`;
        mappedFonts[key] = {
          styleName: f.styleName,
          googleFontUrl: f.googleFontUrl,
          fontFamily: f.fontFamily,
          fontSize: f.fontSize,
        };
      });
      setTextStyles(mappedFonts);

      const mappedTextItems: Record<string, ThemeTextSettingItem> = {};
      existingTextSettings.forEach((ts: any, index: number) => {
        const key = `text-${index + 1}`;

        const matchedFont =
          existingFontSettings.find(
            (f: any) =>
              f.styleName === ts.styleName ||
              (f.fontFamily && ts.fontFamily && f.fontFamily === ts.fontFamily)
          ) ?? existingFontSettings[0];

        mappedTextItems[key] = {
          styleName: ts.styleName,
          fontTypeStyleName: matchedFont?.styleName || "",
          fontSize: ts.fontSize,
          fontColor: ts.fontColor || "",
        };
      });
      setTextSettingItems(mappedTextItems);

      // Populate colors from themeData if available
      const existingColors = currentTheme.themeData?.colors ?? [];
      if (existingColors.length) {
        const mappedColors: Record<string, ThemeColorSetting> = {};
        existingColors.forEach((c, index) => {
          const key = `color-${index + 1}`;
          mappedColors[key] = {
            name: c.name,
            color: c.color,
          };
        });
        setColorItems(mappedColors);
      } else {
        setColorItems({});
      }

      // Populate buttons from themeData if available
      const existingButtons = currentTheme.themeData?.buttons ?? [];
      if (existingButtons.length) {
        const mappedButtons: Record<string, ThemeButtonSetting> = {};
        existingButtons.forEach((b, index) => {
          const key = `button-${index + 1}`;
          mappedButtons[key] = {
            buttonName: b.buttonName,
            backgroundColor: b.backgroundColor,
            fontColor: b.fontColor,
            textStyleName: b.textStyleName,
            borderColor: b.borderColor,
            borderRadius: b.borderRadius,
          };
        });
        setButtonItems(mappedButtons);
      } else {
        setButtonItems({});
      }
    }
  }, [currentTheme, themeId]);

  useEffect(() => {
    if (error) {
      console.error("Theme error:", error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleSave = async () => {
    if (!formData.name) {
      toast.error("Please enter a theme name");
      return;
    }
    if (isNew && !companyId) {
      toast.error("Please select a company to create a theme");
      return;
    }

    setIsSaving(true);

    // Font settings come from the "Font Setting" tab.
    const fontSettings = Object.values(textStyles).map((style) => ({
      styleName: style.styleName,
      googleFontUrl: style.googleFontUrl,
      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
    })) as ThemeFontSetting[];

    // Text settings come from the "Text Setting" tab.
    const computedTextSettings: ThemeTextSetting[] = Object.values(
      textSettingItems
    ).map((t) => {
      const fontType =
        Object.values(textStyles).find(
          (f) => f.styleName === t.fontTypeStyleName
        ) || Object.values(textStyles)[0];

      return {
        styleName: t.styleName,
        googleFontUrl: fontType?.googleFontUrl || "",
        fontFamily: fontType?.fontFamily || "",
        fontSize: t.fontSize,
        fontColor: t.fontColor,
      };
    });

    const colors: ThemeColorSetting[] = Object.values(colorItems).map(
      (c) => ({
        name: c.name,
        color: c.color,
      })
    );

    const buttons: ThemeButtonSetting[] = Object.values(buttonItems).map(
      (b) => ({
        buttonName: b.buttonName,
        backgroundColor: b.backgroundColor,
        fontColor: b.fontColor,
        textStyleName: b.textStyleName,
        borderColor: b.borderColor,
        borderRadius: b.borderRadius,
      })
    );

    const themeData: ThemeData = {
      themeName: formData.name,
      basicSetting: {
        backgroundColor: formData.backgroundColor || "#ffffff",
        fontColor: formData.bodyTextColor || "#000000",
      },
      fontSettings,
      textSettings: computedTextSettings,
      colors,
      buttons,
    };

    const createPayload: CreateThemeData = {
      companyId: formData.companyId,
      name: formData.name,
      themeData,
      isActive: formData.isActive,
      isDefault: formData.isDefault,
    };

    // `companyId` is not allowed in the backend PUT payload validation.
    // The existing row already keeps its `companyId` relation.
    const updatePayload: UpdateThemeData = {
      name: formData.name,
      themeData,
      isActive: formData.isActive,
      isDefault: formData.isDefault,
    };

    try {
      if (isNew) {
        dispatch(createThemeRequest(createPayload));
        toast.success("Theme created successfully!");
        setTimeout(() => navigate(`/system/web/themes`), 500);
      } else {
        dispatch(updateThemeRequest({ id: themeId!, data: updatePayload }));
        toast.success("Theme updated successfully!");
        setTimeout(() => navigate(`/system/web/themes`), 500);
      }
    } catch (err) {
      console.error("Error saving theme:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => navigate(`/system/web/themes`);

  const openTextStyleEdit = (key: string) => {
    setEditStyleKey(key);
    setIsTextStyleDialogOpen(true);
  };

  const handleTextStyleSave = useCallback(
    (key: string, style: ThemeTextStyle) => {
      setTextStyles((prev) => ({ ...prev, [key]: style }));
      // Keep googleFontUrl in sync with last edited style
      setFormData((prev) => ({
        ...prev,
        googleFontUrl: style.googleFontUrl || prev.googleFontUrl,
      }));
    },
    []
  );

  const colorOptions = Object.values(colorItems);
  const textSettingOptions = Object.values(textSettingItems);
  const fontTypeOptions = Object.values(textStyles);

  const editButtonLabel =
    (editButtonKey && buttonItems[editButtonKey]?.buttonName) || "Button";

  const handleButtonSave = useCallback(
    (key: string, value: ThemeButtonSetting) => {
      setButtonItems((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleAddButton = () => {
    const colorsList = colorOptions;
    const textsList = textSettingOptions;

    const bg = colorsList[0]?.color || "#000000";
    const font = colorsList[1]?.color || "#ffffff";
    const border = colorsList[0]?.color || "#000000";
    const defaultTextStyleName = textsList[0]?.styleName || "";

    const baseKey = "button";
    let index = Object.keys(buttonItems).length + 1;
    let key = `${baseKey}-${index}`;
    while (buttonItems[key]) {
      index += 1;
      key = `${baseKey}-${index}`;
    }

    setButtonItems((prev) => ({
      ...prev,
      [key]: {
        buttonName: `Button ${index}`,
        backgroundColor: bg,
        fontColor: font,
        borderColor: border,
        textStyleName: defaultTextStyleName,
        borderRadius: "8px",
      },
    }));

    setEditButtonKey(key);
    setIsButtonDialogOpen(true);
  };

  const editTextSettingLabel =
    (editTextSettingKey &&
      textSettingItems[editTextSettingKey]?.styleName) ||
    "Text style";

  const openTextSettingEdit = (key: string) => {
    setEditTextSettingKey(key);
    setIsTextSettingDialogOpen(true);
  };

  const handleTextSettingSave = useCallback(
    (key: string, value: ThemeTextSettingItem) => {
      setTextSettingItems((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const handleAddTextSetting = () => {
    const baseKey = "text";
    let index = Object.keys(textSettingItems).length + 1;
    let key = `${baseKey}-${index}`;
    while (textSettingItems[key]) {
      index += 1;
      key = `${baseKey}-${index}`;
    }

    const defaultFontType = fontTypeOptions[0]?.styleName || "";
    const defaultColor = colorOptions[0]?.color || "#000000";

    setTextSettingItems((prev) => ({
      ...prev,
      [key]: {
        styleName: `Text style ${index}`,
        fontTypeStyleName: defaultFontType,
        fontSize: "1rem",
        fontColor: defaultColor,
      },
    }));

    setEditTextSettingKey(key);
    setIsTextSettingDialogOpen(true);
  };

  const pageTitle = isNew ? "Add New Theme" : isViewMode ? "View Theme" : "Edit Theme";
  const canSave = !isViewMode && !!formData.name && !!companyId;
  const showCompanyRequired = isNew && !companyId;

  const editStyleLabel =
    (editStyleKey && textStyles[editStyleKey]?.styleName) || "Font style";

  return (
    <div className="p-6 w-full">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="hover:bg-[var(--accent-bg)]"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{pageTitle}</h1>
              <p className="text-sm text-muted-foreground">
                {isNew
                  ? "Create a new theme: set a name, then Basic, Colors, Buttons, and Text settings."
                  : isViewMode
                  ? "View theme details"
                  : "Edit your theme settings"}
              </p>
            </div>
          </div>
          {!isViewMode && (
            <Button
              onClick={handleSave}
              disabled={isSaving || loading || !canSave}
              className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:from-[var(--accent-primary-hover)] hover:to-[var(--accent-primary)] text-[var(--accent-button-text)]"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : isNew ? "Create Theme" : "Save Changes"}
            </Button>
          )}
        </div>

        {showCompanyRequired && (
          <div className="p-4 backdrop-blur-sm bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <p className="text-sm text-foreground">
              Please select a company from the sidebar to create a theme.
            </p>
          </div>
        )}

        <div className="space-y-6">
            <div className="w-full space-y-6">
              <div className="flex flex-col gap-2">
                <Label className="text-muted-foreground text-xs uppercase tracking-wide">
                  Customize
                </Label>
                <TabSwitcher
                  tabs={[
                    { value: "basic", label: "Basic Setting" },
                    { value: "text", label: "Font Setting" },
                    { value: "colors", label: "Colors" },
                    { value: "textSetting", label: "Text Setting" },
                    { value: "buttons", label: "Buttons" },
                  ]}
                  activeTab={activeTab}
                  onTabChange={(v) =>
                    setActiveTab(
                      v as "basic" | "text" | "colors" | "textSetting" | "buttons"
                    )
                  }
                />
              </div>

              {activeTab === "basic" && (
                <div className="space-y-6 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Theme Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      placeholder="e.g. My Custom Theme"
                      className="bg-[var(--input-background)] border-[var(--glass-border)]"
                      disabled={isViewMode}
                    />
                    {isNew && (
                      <p className="text-xs text-muted-foreground">
                        Name your theme here, then configure colors and text in
                        the other tabs.
                      </p>
                    )}
                  </div>

                  {!isViewMode && (
                    <div className="flex items-center gap-6 pt-6 border-t border-[var(--glass-border)]">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isActive}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              isActive: e.target.checked,
                            })
                          }
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-foreground">Active</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isDefault}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              isDefault: e.target.checked,
                            })
                          }
                          className="w-4 h-4"
                        />
                        <span className="text-sm text-foreground">
                          Set as Default
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "text" && (
                <div className="space-y-4 mt-6">
                  <p className="text-sm text-muted-foreground">
                    Manage font styles for your theme. Add items, then edit
                    each one to configure fonts.
                  </p>
                  {!isViewMode && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-[var(--glass-bg)] border-[var(--glass-border)]"
                      onClick={() => {
                        const baseKey = "style";
                        let index = Object.keys(textStyles).length + 1;
                        let key = `${baseKey}-${index}`;
                        while (textStyles[key]) {
                          index += 1;
                          key = `${baseKey}-${index}`;
                        }
                        setTextStyles((prev) => ({
                          ...prev,
                          [key]: {
                            styleName: `Font style ${index}`,
                            googleFontUrl: "",
                            fontFamily: "",
                            fontSize: "",
                          },
                        }));
                        openTextStyleEdit(key);
                      }}
                    >
                      Add font style
                    </Button>
                  )}
                  {Object.keys(textStyles).length > 0 && (
                    <div className="border border-[var(--glass-border)] rounded-lg divide-y divide-[var(--glass-border)]">
                      {Object.entries(textStyles).map(([key, style]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between gap-4 p-4"
                        >
                          {style.googleFontUrl && (
                            <link
                              rel="stylesheet"
                              href={style.googleFontUrl}
                            />
                          )}
                          <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                            <span className="font-medium text-foreground">
                              {style.styleName || key}
                            </span>
                            <span
                              className="text-foreground truncate max-w-full block"
                              style={{
                                fontFamily: style.fontFamily
                                  ? `${style.fontFamily}, sans-serif`
                                  : undefined,
                                fontSize: style.fontSize || "1rem",
                              }}
                              title={`${style.fontFamily || "Default"}${style.fontSize ? ` · ${style.fontSize}` : ""}`}
                            >
                              The quick brown fox jumps over the lazy dog
                            </span>
                            {!style.fontFamily && !style.fontSize && (
                              <span className="text-xs text-muted-foreground">
                                Default font · Configure in Edit
                              </span>
                            )}
                          </div>
                          {!isViewMode && (
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openTextStyleEdit(key)}
                                className="bg-[var(--glass-bg)] border-[var(--glass-border)]"
                              >
                                <Pencil className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() =>
                                  setTextStyles((prev) => {
                                    const next = { ...prev };
                                    delete next[key];
                                    return next;
                                  })
                                }
                              >
                                Remove
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "colors" && (
                <div className="space-y-6 mt-6">
                  <p className="text-sm text-muted-foreground">
                    Add named colors to your theme. These colors will be saved
                    inside the theme data.
                  </p>

                  {!isViewMode && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-[var(--glass-bg)] border-[var(--glass-border)]"
                      onClick={() => {
                        const baseKey = "color";
                        let index = Object.keys(colorItems).length + 1;
                        let key = `${baseKey}-${index}`;
                        while (colorItems[key]) {
                          index += 1;
                          key = `${baseKey}-${index}`;
                        }
                        setColorItems((prev) => ({
                          ...prev,
                          [key]: {
                            name: `Color ${index}`,
                            color: "#000000",
                          },
                        }));
                      }}
                    >
                      Add color
                    </Button>
                  )}

                  {Object.keys(colorItems).length > 0 ? (
                    <div className="border border-[var(--glass-border)] rounded-lg divide-y divide-[var(--glass-border)]">
                      {Object.entries(colorItems).map(([key, c]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between gap-4 p-4"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Input
                              type="color"
                              value={c.color || "#000000"}
                              onChange={(e) => {
                                const nextColor = e.target.value;
                                setColorItems((prev) => ({
                                  ...prev,
                                  [key]: {
                                    ...prev[key],
                                    color: nextColor,
                                  },
                                }));
                              }}
                              className="w-20 h-12 bg-[var(--input-background)] border-[var(--glass-border)] cursor-pointer"
                              disabled={isViewMode}
                            />
                            <div className="flex-1 min-w-0">
                              <Input
                                value={c.name || ""}
                                onChange={(e) => {
                                  const nextName = e.target.value;
                                  setColorItems((prev) => ({
                                    ...prev,
                                    [key]: {
                                      ...prev[key],
                                      name: nextName,
                                    },
                                  }));
                                }}
                                placeholder="Color name"
                                className="bg-[var(--input-background)] border-[var(--glass-border)]"
                                disabled={isViewMode}
                              />
                            </div>
                          </div>

                          {!isViewMode && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => {
                                setColorItems((prev) => {
                                  const next = { ...prev };
                                  delete next[key];
                                  return next;
                                });
                              }}
                            >
                              Remove
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No colors configured yet.
                    </p>
                  )}
                </div>
              )}

              {activeTab === "textSetting" && (
                <div className="space-y-6 mt-6">
                  <p className="text-sm text-muted-foreground">
                    Manage text styles for your theme. Each text style
                    references a font type and a font color.
                  </p>

                  {!isViewMode && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-[var(--glass-bg)] border-[var(--glass-border)]"
                      onClick={handleAddTextSetting}
                      disabled={
                        fontTypeOptions.length === 0 || colorOptions.length === 0
                      }
                    >
                      Add text style
                    </Button>
                  )}

                  {Object.keys(textSettingItems).length > 0 ? (
                    <div className="border border-[var(--glass-border)] rounded-lg divide-y divide-[var(--glass-border)]">
                      {Object.entries(textSettingItems).map(([key, t]) => {
                        const font = Object.values(textStyles).find(
                          (f) => f.styleName === t.fontTypeStyleName
                        );

                        return (
                          <div
                            key={key}
                            className="flex items-center justify-between gap-4 p-4"
                          >
                            {font?.googleFontUrl && (
                              <link
                                rel="stylesheet"
                                href={font.googleFontUrl}
                              />
                            )}

                            <div className="flex flex-col gap-1.5 min-w-0 flex-1">
                              <span className="font-medium text-foreground">
                                {t.styleName || key}
                              </span>

                              <span
                                className="text-foreground truncate max-w-full block"
                                style={{
                                  fontFamily: font?.fontFamily
                                    ? `${font.fontFamily}, sans-serif`
                                    : undefined,
                                  fontSize: t.fontSize || "1rem",
                                  color: t.fontColor || undefined,
                                }}
                                title={`${font?.styleName || "Font"} · ${t.fontSize || ""}`}
                              >
                                The quick brown fox jumps over the lazy dog
                              </span>
                            </div>

                            {!isViewMode && (
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => openTextSettingEdit(key)}
                                  className="bg-[var(--glass-bg)] border-[var(--glass-border)]"
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() =>
                                    setTextSettingItems((prev) => {
                                      const next = { ...prev };
                                      delete next[key];
                                      return next;
                                    })
                                  }
                                >
                                  Remove
                                </Button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No text styles configured yet.
                    </p>
                  )}
                </div>
              )}

              {activeTab === "buttons" && (
                <div className="space-y-6 mt-6">
                  <p className="text-sm text-muted-foreground">
                    Manage buttons for your theme. Add items, then edit each
                    one to configure colors, border radius, and the text
                    style.
                  </p>

                  {!isViewMode && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-[var(--glass-bg)] border-[var(--glass-border)]"
                      onClick={handleAddButton}
                      disabled={
                        colorOptions.length === 0 ||
                        textSettingOptions.length === 0
                      }
                    >
                      Add button
                    </Button>
                  )}

                  {Object.keys(buttonItems).length > 0 ? (
                    <div className="border border-[var(--glass-border)] rounded-lg divide-y divide-[var(--glass-border)]">
                      {Object.entries(buttonItems).map(([key, b]) => {
                        const linkedTextSetting =
                          textSettingOptions.find(
                            (ts) => ts.styleName === b.textStyleName
                          ) || null;

                        const linkedFont =
                          linkedTextSetting
                            ? Object.values(textStyles).find(
                                (f) =>
                                  f.styleName ===
                                  linkedTextSetting.fontTypeStyleName
                              ) || null
                            : null;

                        return (
                          <div
                            key={key}
                            className="flex items-center justify-between gap-4 p-4"
                          >
                            {linkedFont?.googleFontUrl && (
                              <link
                                rel="stylesheet"
                                href={linkedFont.googleFontUrl}
                              />
                            )}

                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <button
                                type="button"
                                className="px-4 py-2 border flex-shrink-0"
                                style={{
                                  backgroundColor: b.backgroundColor,
                                  color: b.fontColor,
                                  borderColor: b.borderColor,
                                  borderRadius: b.borderRadius,
                                  fontFamily: linkedFont?.fontFamily
                                    ? `${linkedFont.fontFamily}, sans-serif`
                                    : undefined,
                                  fontSize:
                                    linkedTextSetting?.fontSize || "1rem",
                                }}
                              >
                                {linkedTextSetting?.styleName ||
                                  b.textStyleName ||
                                  "Button"}
                              </button>

                              <div className="min-w-0">
                                <div className="font-medium text-foreground truncate">
                                  {b.buttonName || key}
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {b.textStyleName || "Select text style"}
                                </div>
                              </div>
                            </div>

                            {!isViewMode && (
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setEditButtonKey(key);
                                    setIsButtonDialogOpen(true);
                                  }}
                                  className="bg-[var(--glass-bg)] border-[var(--glass-border)]"
                                >
                                  Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => {
                                    setButtonItems((prev) => {
                                      const next = { ...prev };
                                      delete next[key];
                                      return next;
                                    });
                                  }}
                                >
                                  Remove
                                </Button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No buttons configured yet.
                    </p>
                  )}
                </div>
              )}
            </div>

            
          </div>
      </div>

      <TextStyleEditDialog
        open={isTextStyleDialogOpen}
        onOpenChange={setIsTextStyleDialogOpen}
        styleKey={editStyleKey}
        styleLabel={editStyleLabel}
        value={editStyleKey ? textStyles[editStyleKey] ?? null : null}
        onSave={handleTextStyleSave}
        disabled={isViewMode}
      />

      <TextSettingEditDialog
        open={isTextSettingDialogOpen}
        onOpenChange={setIsTextSettingDialogOpen}
        textKey={editTextSettingKey}
        textLabel={editTextSettingLabel}
        value={
          editTextSettingKey ? textSettingItems[editTextSettingKey] ?? null : null
        }
        onSave={handleTextSettingSave}
        disabled={isViewMode}
        fontTypeOptions={fontTypeOptions}
        colorOptions={colorOptions}
      />

      <ButtonEditDialog
        open={isButtonDialogOpen}
        onOpenChange={setIsButtonDialogOpen}
        buttonKey={editButtonKey}
        buttonLabel={editButtonLabel}
        value={editButtonKey ? buttonItems[editButtonKey] ?? null : null}
        onSave={handleButtonSave}
        disabled={isViewMode}
        colorOptions={colorOptions}
        textStyleOptions={textSettingOptions}
      />
    </div>
  );
};
