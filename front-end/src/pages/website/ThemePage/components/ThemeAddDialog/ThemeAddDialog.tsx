import { useEffect, useMemo, useState } from "react";
import { Palette, Save } from "lucide-react";
import { CustomDialog } from "@/components/ui/custom-dialog";
import { Button } from "@/components/ui/button";
import { TabSwitcher } from "@/components/ui/tab-switcher";
import type {
  CompanyWebTheme,
  CreateThemeData,
  ThemeButtonSetting,
  ThemeColorSetting,
  ThemeData,
  ThemeFontSetting,
  ThemeTextSetting,
  UpdateThemeData,
} from "@/services/companyWebThemes";
import {
  ButtonEditDialog,
  TextSettingEditDialog,
  TextStyleEditDialog,
  type ThemeTextSettingItem,
  type ThemeTextStyle,
} from "@/pages/website/ThemeFormPage/components";
import { BasicSettingsTab } from "./tabs/BasicSettingsTab";
import { FontSettingsTab } from "./tabs/FontSettingsTab";
import { ColorsTab } from "./tabs/ColorsTab";
import { TextSettingsTab } from "./tabs/TextSettingsTab";
import { ButtonsTab } from "./tabs/ButtonsTab";
import type { BasicTabState, ThemeTab } from "./types";
import { ColorSettingEditDialog } from "./ColorSettingEditDialog";

interface ThemeAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId?: string;
  loading?: boolean;
  selectedTheme?: CompanyWebTheme | null;
  onCreate: (data: CreateThemeData) => void;
  onUpdate: (themeId: string, data: UpdateThemeData) => void;
}

export const ThemeAddDialog = ({
  open,
  onOpenChange,
  companyId,
  loading = false,
  selectedTheme,
  onCreate,
  onUpdate,
}: ThemeAddDialogProps) => {
  const isEditMode = !!selectedTheme?.id;
  const [activeTab, setActiveTab] = useState<ThemeTab>("basic");
  const [basic, setBasic] = useState<BasicTabState>({
    name: "",
    isActive: false,
    isDefault: false,
    backgroundColor: "",
    bodyTextColor: "",
  });
  const [textStyles, setTextStyles] = useState<Record<string, ThemeTextStyle>>({});
  const [colorItems, setColorItems] = useState<Record<string, ThemeColorSetting>>({});
  const [textSettingItems, setTextSettingItems] = useState<
    Record<string, ThemeTextSettingItem>
  >({});
  const [buttonItems, setButtonItems] = useState<Record<string, ThemeButtonSetting>>(
    {}
  );

  const [editStyleKey, setEditStyleKey] = useState<string | null>(null);
  const [editColorKey, setEditColorKey] = useState<string | null>(null);
  const [editTextSettingKey, setEditTextSettingKey] = useState<string | null>(null);
  const [editButtonKey, setEditButtonKey] = useState<string | null>(null);

  const fontTypeOptions = useMemo<ThemeFontSetting[]>(
    () =>
      Object.values(textStyles).map((style) => ({
        styleName: style.styleName,
        googleFontUrl: style.googleFontUrl,
        fontFamily: style.fontFamily,
        fontSize: "",
      })),
    [textStyles]
  );
  const colorOptions = useMemo<ThemeColorSetting[]>(
    () => Object.values(colorItems),
    [colorItems]
  );
  const textStyleOptions = useMemo<ThemeTextSettingItem[]>(
    () => Object.values(textSettingItems),
    [textSettingItems]
  );

  useEffect(() => {
    if (!open) return;
    setActiveTab("basic");
    setEditStyleKey(null);
    setEditColorKey(null);
    setEditTextSettingKey(null);
    setEditButtonKey(null);

    if (!selectedTheme) {
      setBasic({
        name: "",
        isActive: false,
        isDefault: false,
        backgroundColor: "",
        bodyTextColor: "",
      });
      setTextStyles({});
      setColorItems({});
      setTextSettingItems({});
      setButtonItems({});
      return;
    }

    setBasic({
      name: selectedTheme.name || "",
      isActive: !!selectedTheme.isActive,
      isDefault: !!selectedTheme.isDefault,
      backgroundColor: selectedTheme.themeData?.basicSetting?.backgroundColor || "",
      bodyTextColor: selectedTheme.themeData?.basicSetting?.fontColor || "",
    });

    const mappedFonts: Record<string, ThemeTextStyle> = {};
    (selectedTheme.themeData?.fontSettings ?? []).forEach((font, index) => {
      mappedFonts[`style-${index + 1}`] = { ...font };
    });
    setTextStyles(mappedFonts);

    const mappedColors: Record<string, ThemeColorSetting> = {};
    (selectedTheme.themeData?.colors ?? []).forEach((color, index) => {
      mappedColors[`color-${index + 1}`] = color;
    });
    setColorItems(mappedColors);

    const mappedTextSettings: Record<string, ThemeTextSettingItem> = {};
    (selectedTheme.themeData?.textSettings ?? []).forEach((text, index) => {
      mappedTextSettings[`text-${index + 1}`] = {
        styleName: text.styleName,
        fontTypeStyleName: text.styleName,
        fontSize: text.fontSize,
        fontSizeByBreakpoint: text.fontSizeByBreakpoint,
        fontColor: text.fontColor || "",
      };
    });
    setTextSettingItems(mappedTextSettings);

    const mappedButtons: Record<string, ThemeButtonSetting> = {};
    (selectedTheme.themeData?.buttons ?? []).forEach((button, index) => {
      mappedButtons[`button-${index + 1}`] = button;
    });
    setButtonItems(mappedButtons);
  }, [open, selectedTheme]);

  const canSave = !!companyId && !!basic.name.trim();

  const handleSave = () => {
    if (!companyId || !canSave) return;
    const themeTextSettings: ThemeTextSetting[] = Object.values(textSettingItems).map(
      (item) => {
        const font = fontTypeOptions.find((f) => f.styleName === item.fontTypeStyleName);
        return {
          styleName: item.styleName,
          googleFontUrl: font?.googleFontUrl || "",
          fontFamily: font?.fontFamily || "",
          fontSize: item.fontSizeByBreakpoint?.["2xl"] || item.fontSize,
          fontSizeByBreakpoint: item.fontSizeByBreakpoint,
          fontColor: item.fontColor,
        };
      }
    );
    const themeData: ThemeData = {
      themeName: basic.name.trim(),
      basicSetting: {
        backgroundColor: basic.backgroundColor,
        fontColor: basic.bodyTextColor,
      },
      fontSettings: fontTypeOptions,
      textSettings: themeTextSettings,
      colors: colorOptions,
      buttons: Object.values(buttonItems),
    };
    if (isEditMode && selectedTheme?.id) {
      onUpdate(selectedTheme.id, {
        companyId,
        name: basic.name.trim(),
        isActive: basic.isActive,
        isDefault: basic.isDefault,
        themeData,
      });
    } else {
      onCreate({
        companyId,
        name: basic.name.trim(),
        isActive: basic.isActive,
        isDefault: basic.isDefault,
        themeData,
      });
    }
    onOpenChange(false);
  };

  const addListItem = (type: "text" | "color" | "textSetting" | "button") => {
    if (type === "text") {
      const idx = Object.keys(textStyles).length + 1;
      const key = `style-${idx}`;
      setTextStyles((prev) => ({
        ...prev,
        [key]: { styleName: `Style ${idx}`, googleFontUrl: "", fontFamily: "", fontSize: "" },
      }));
      setEditStyleKey(key);
      return;
    }
    if (type === "color") {
      setEditColorKey("new");
      return;
    }
    if (type === "textSetting") {
      const idx = Object.keys(textSettingItems).length + 1;
      const key = `text-${idx}`;
      setTextSettingItems((prev) => ({
        ...prev,
        [key]: {
          styleName: `Text ${idx}`,
          fontTypeStyleName: fontTypeOptions[0]?.styleName || "",
          fontSize: "1rem",
          fontSizeByBreakpoint: {
            sm: "1rem",
            md: "1rem",
            lg: "1rem",
            xl: "1rem",
            "2xl": "1rem",
          },
          fontColor: colorOptions[0]?.color || "",
        },
      }));
      setEditTextSettingKey(key);
      return;
    }
    const idx = Object.keys(buttonItems).length + 1;
    const key = `button-${idx}`;
    setButtonItems((prev) => ({
      ...prev,
      [key]: {
        buttonName: `Button ${idx}`,
        backgroundColor: colorOptions[0]?.color || "",
        fontColor: colorOptions[1]?.color || "",
        textStyleName: textStyleOptions[0]?.styleName || "",
        borderColor: colorOptions[0]?.color || "",
        borderRadius: "",
      },
    }));
    setEditButtonKey(key);
  };

  const deleteItemByTab = (key: string) => {
    if (activeTab === "text") {
      setTextStyles((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    } else if (activeTab === "colors") {
      setColorItems((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      if (editColorKey === key) setEditColorKey(null);
    } else if (activeTab === "textSetting") {
      setTextSettingItems((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    } else if (activeTab === "buttons") {
      setButtonItems((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  return (
    <>
      <CustomDialog
        open={open}
        onOpenChange={onOpenChange}
        title={isEditMode ? "Edit Theme" : "Add New Theme"}
        description="Configure basic settings, fonts, colors, text styles, and buttons."
        icon={<Palette className="w-5 h-5" />}
        sizeWidth="large"
        sizeHeight="large"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-10 px-4 border-[var(--glass-border)] text-foreground hover:bg-accent"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              variant="accent"
              disabled={loading || !canSave}
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Saving..." : isEditMode ? "Save Changes" : "Create Theme"}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <TabSwitcher
            tabs={[
              { value: "basic", label: "Basic Setting" },
              { value: "text", label: "Font Setting" },
              { value: "colors", label: "Color Setting" },
              { value: "textSetting", label: "Text Setting" },
              { value: "buttons", label: "Buttons" },
            ]}
            activeTab={activeTab}
            onTabChange={(value) => setActiveTab(value as ThemeTab)}
          />

          {activeTab === "basic" && <BasicSettingsTab value={basic} onChange={setBasic} />}
          {activeTab === "text" && (
            <FontSettingsTab
              items={textStyles}
              onAdd={() => addListItem("text")}
              onEdit={setEditStyleKey}
              onDelete={(key) => deleteItemByTab(key)}
            />
          )}
          {activeTab === "colors" && (
            <ColorsTab
              items={colorItems}
              onAdd={() => addListItem("color")}
              onEdit={setEditColorKey}
              onDelete={(key) => {
                setActiveTab("colors");
                deleteItemByTab(key);
              }}
            />
          )}
          {activeTab === "textSetting" && (
            <TextSettingsTab
              items={textSettingItems}
              onAdd={() => addListItem("textSetting")}
              onEdit={setEditTextSettingKey}
              onDelete={(key) => deleteItemByTab(key)}
            />
          )}
          {activeTab === "buttons" && (
            <ButtonsTab
              items={buttonItems}
              onAdd={() => addListItem("button")}
              onEdit={setEditButtonKey}
              onDelete={(key) => deleteItemByTab(key)}
            />
          )}
        </div>
      </CustomDialog>

      <TextStyleEditDialog
        open={!!editStyleKey}
        onOpenChange={(dialogOpen) => !dialogOpen && setEditStyleKey(null)}
        styleKey={editStyleKey}
        styleLabel={(editStyleKey && textStyles[editStyleKey]?.styleName) || "Font style"}
        value={editStyleKey ? textStyles[editStyleKey] : null}
        onSave={(styleKey, style) =>
          setTextStyles((prev) => ({ ...prev, [styleKey]: style }))
        }
      />
      <ColorSettingEditDialog
        open={!!editColorKey}
        onOpenChange={(dialogOpen) => !dialogOpen && setEditColorKey(null)}
        title={editColorKey === "new" ? "Add color setting" : "Edit color setting"}
        value={editColorKey && editColorKey !== "new" ? colorItems[editColorKey] : null}
        onSave={(value) => {
          if (editColorKey === "new") {
            let idx = Object.keys(colorItems).length + 1;
            let key = `color-${idx}`;
            while (colorItems[key]) {
              idx += 1;
              key = `color-${idx}`;
            }
            setColorItems((prev) => ({ ...prev, [key]: value }));
          } else if (editColorKey) {
            setColorItems((prev) => ({ ...prev, [editColorKey]: value }));
          }
        }}
      />
      <TextSettingEditDialog
        open={!!editTextSettingKey}
        onOpenChange={(dialogOpen) => !dialogOpen && setEditTextSettingKey(null)}
        textKey={editTextSettingKey}
        value={editTextSettingKey ? textSettingItems[editTextSettingKey] : null}
        onSave={(textKey, value) =>
          setTextSettingItems((prev) => ({ ...prev, [textKey]: value }))
        }
        fontTypeOptions={fontTypeOptions}
        colorOptions={colorOptions}
        textLabel={
          (editTextSettingKey && textSettingItems[editTextSettingKey]?.styleName) ||
          "Text style"
        }
      />
      <ButtonEditDialog
        open={!!editButtonKey}
        onOpenChange={(dialogOpen) => !dialogOpen && setEditButtonKey(null)}
        buttonKey={editButtonKey}
        buttonLabel={(editButtonKey && buttonItems[editButtonKey]?.buttonName) || "Button"}
        value={editButtonKey ? buttonItems[editButtonKey] : null}
        onSave={(buttonKey, value) =>
          setButtonItems((prev) => ({ ...prev, [buttonKey]: value }))
        }
        colorOptions={colorOptions}
        textStyleOptions={textStyleOptions}
      />
    </>
  );
};
