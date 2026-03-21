import { useEffect, useMemo } from "react";
import type { CSSProperties } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { nanoid } from "nanoid";
import { Link } from "react-router-dom";
import { MousePointerClick } from "lucide-react";
import { toast } from "sonner";
import { Button } from "../../../../../components/ui/button";
import { Label } from "../../../../../components/ui/label";
import { CustomDialog } from "../../../../../components/ui/custom-dialog";
import type { ThemeButtonSetting, ThemeTextSetting } from "../../../../../services/companyWebThemes";
import { AddonEditProps, AddonModule, AddonRenderProps } from "../types";
import { ContentAddon, ButtonContentAddonData } from "../../types";
import { normalizeWebPagePath, resolveButtonLinkHref } from "../webPageLinkUtils";

const buttonAddonSchema = yup.object({
  label: yup.string().required("Button text is required"),
  buttonName: yup.string().optional().default(""),
  linkWebPageId: yup.string().optional().default(""),
});

type ButtonAddonFormValues = {
  label: string;
  buttonName: string;
  linkWebPageId: string;
};

function hashUrl(url: string): string {
  let h = 0;
  for (let i = 0; i < url.length; i++) h = (Math.imul(31, h) + url.charCodeAt(i)) | 0;
  return `gf-btn-${Math.abs(h)}`;
}

function resolveThemeButton(
  data: ButtonContentAddonData,
  themeButtonSettings?: ThemeButtonSetting[]
): ThemeButtonSetting | null {
  const fromTheme = themeButtonSettings?.find((b) => b.buttonName === data.buttonName);
  if (fromTheme) return fromTheme;
  if (data.backgroundColor || data.borderColor) {
    return {
      buttonName: data.buttonName,
      backgroundColor: data.backgroundColor ?? "#333",
      fontColor: data.fontColor ?? "#fff",
      textStyleName: data.textStyleName ?? "",
      borderColor: data.borderColor ?? "#333",
      borderRadius: data.borderRadius ?? "4px",
    };
  }
  return null;
}

function resolveLabelTypography(
  textStyleName: string | undefined,
  themeTextSettings?: ThemeTextSetting[],
  snapshot?: Pick<
    ButtonContentAddonData,
    "labelFontFamily" | "labelFontSize" | "labelFontColor" | "labelGoogleFontUrl"
  >
): Pick<CSSProperties, "fontFamily" | "fontSize" | "color"> {
  const fromTheme = textStyleName
    ? themeTextSettings?.find((t) => t.styleName === textStyleName)
    : undefined;
  if (fromTheme) {
    return {
      fontFamily: fromTheme.fontFamily || undefined,
      fontSize: fromTheme.fontSize || undefined,
      color: fromTheme.fontColor || undefined,
    };
  }
  return {
    fontFamily: snapshot?.labelFontFamily || undefined,
    fontSize: snapshot?.labelFontSize || undefined,
    color: snapshot?.labelFontColor || undefined,
  };
}

const ButtonAddonRenderer = ({
  addon,
  companyId,
  themeTextSettings,
  themeButtonSettings,
  companyWebPages,
  addonRenderContext = "published",
}: AddonRenderProps) => {
  const data = addon.data as ButtonContentAddonData;
  const effectiveCompanyId = companyId ?? data.companyId;

  const themeBtn = useMemo(
    () => resolveThemeButton(data, themeButtonSettings),
    [data, themeButtonSettings]
  );

  const labelStyle = useMemo(() => {
    const ts = themeBtn?.textStyleName ?? data.textStyleName;
    return resolveLabelTypography(ts, themeTextSettings, data);
  }, [themeBtn, data, themeTextSettings]);

  const linkHref = useMemo(
    () => resolveButtonLinkHref(data, effectiveCompanyId, companyWebPages),
    [data, effectiveCompanyId, companyWebPages]
  );

  const googleUrl =
    (themeBtn?.textStyleName
      ? themeTextSettings?.find((t) => t.styleName === themeBtn.textStyleName)?.googleFontUrl
      : undefined)?.trim() || data.labelGoogleFontUrl?.trim();

  useEffect(() => {
    if (!googleUrl) return;
    const id = `addon-btn-font-${hashUrl(googleUrl)}`;
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = googleUrl;
    document.head.appendChild(link);
  }, [googleUrl]);

  if (!data.label?.trim()) {
    return (
      <div className="rounded-md border border-dashed border-[var(--glass-border)] p-3 text-xs text-muted-foreground">
        Add button text in addon settings.
      </div>
    );
  }

  const bg = themeBtn?.backgroundColor ?? data.backgroundColor;
  const borderCol = themeBtn?.borderColor ?? data.borderColor;
  const radius = themeBtn?.borderRadius ?? data.borderRadius;
  const labelColor = labelStyle.color ?? themeBtn?.fontColor ?? data.fontColor ?? "#ffffff";

  const surfaceStyle: CSSProperties = {
    backgroundColor: bg,
    borderColor: borderCol,
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: radius,
    fontFamily: labelStyle.fontFamily,
    fontSize: labelStyle.fontSize,
    color: labelColor,
    textDecoration: "none",
  };

  const className =
    "inline-flex items-center justify-center px-4 py-2 text-sm font-medium max-w-full truncate select-none";

  return (
    <div className="w-full h-full min-h-0 flex items-center justify-center p-1">
      {linkHref && addonRenderContext === "published" ? (
        <Link to={linkHref} className={`${className} cursor-pointer`} style={surfaceStyle}>
          {data.label}
        </Link>
      ) : linkHref && addonRenderContext === "editor" ? (
        <span
          role="link"
          className={`${className} cursor-default`}
          style={surfaceStyle}
          title="Link opens on the published site"
        >
          {data.label}
        </span>
      ) : (
        <button type="button" className={`${className} cursor-default`} style={surfaceStyle}>
          {data.label}
        </button>
      )}
    </div>
  );
};

const ButtonAddonEditDialog = ({
  open,
  onOpenChange,
  addon,
  companyId,
  contentElementId,
  onSave,
  themeTextSettings = [],
  themeButtonSettings = [],
  companyWebPages = [],
}: AddonEditProps) => {
  const data = addon.data as ButtonContentAddonData;
  const effectiveCompanyId = companyId || data.companyId;

  const sortedPages = useMemo(
    () => [...companyWebPages].sort((a, b) => a.name.localeCompare(b.name)),
    [companyWebPages]
  );

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<ButtonAddonFormValues>({
    resolver: yupResolver(buttonAddonSchema) as any,
    defaultValues: {
      label: data.label ?? "",
      buttonName: data.buttonName ?? "",
      linkWebPageId: data.linkWebPageId ?? "",
    },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      label: data.label ?? "",
      buttonName: data.buttonName ?? "",
      linkWebPageId: data.linkWebPageId ?? "",
    });
  }, [open, data.label, data.buttonName, data.linkWebPageId, reset]);

  useEffect(() => {
    if (!open || themeButtonSettings.length === 0) return;
    const current = getValues("buttonName");
    if (!current && themeButtonSettings[0]) {
      setValue("buttonName", themeButtonSettings[0].buttonName);
    }
  }, [open, themeButtonSettings, setValue, getValues]);

  const onSubmit = (values: ButtonAddonFormValues) => {
    if (themeButtonSettings.length > 0 && !values.buttonName?.trim()) {
      toast.error("Select a button type from the theme.");
      return;
    }

    const selectedBtn = themeButtonSettings.find((b) => b.buttonName === values.buttonName);
    const textStyle = selectedBtn?.textStyleName
      ? themeTextSettings.find((t) => t.styleName === selectedBtn.textStyleName)
      : undefined;

    const linkId = values.linkWebPageId?.trim() ?? "";
    const linkTarget = linkId ? companyWebPages.find((p) => p.id === linkId) : undefined;
    const linkPagePublicPath =
      linkTarget?.url != null && String(linkTarget.url).trim() !== ""
        ? normalizeWebPagePath(linkTarget.url)
        : undefined;

    const updatedAddon: ContentAddon = {
      ...addon,
      data: {
        ...addon.data,
        label: values.label.trim(),
        buttonName: values.buttonName?.trim() ?? "",
        linkWebPageId: linkId || undefined,
        linkPagePublicPath: linkId ? linkPagePublicPath : undefined,
        companyId: effectiveCompanyId,
        contentElementId,
        ...(selectedBtn
          ? {
              backgroundColor: selectedBtn.backgroundColor,
              fontColor: selectedBtn.fontColor,
              textStyleName: selectedBtn.textStyleName,
              borderColor: selectedBtn.borderColor,
              borderRadius: selectedBtn.borderRadius,
            }
          : {}),
        ...(textStyle
          ? {
              labelFontFamily: textStyle.fontFamily,
              labelFontSize: textStyle.fontSize,
              labelFontColor: textStyle.fontColor ?? selectedBtn?.fontColor,
              labelGoogleFontUrl: textStyle.googleFontUrl,
            }
          : selectedBtn
            ? {
                labelFontColor: selectedBtn.fontColor,
              }
            : {}),
      },
    };
    onSave(updatedAddon);
    onOpenChange(false);
  };

  return (
    <CustomDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Button addon settings"
      description="Label, theme style, and optional link to another company web page."
      icon={<MousePointerClick className="w-5 h-5" />}
      maxWidth="max-w-lg"
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" variant="accent" onClick={handleSubmit(onSubmit)}>
            OK
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="button-addon-label">Text</Label>
          <input
            id="button-addon-label"
            type="text"
            placeholder="Button label…"
            className="w-full rounded-md border border-[var(--glass-border)] bg-[var(--input-background)] px-3 py-2 text-sm text-foreground"
            {...register("label")}
          />
          {errors.label && <p className="text-xs text-destructive">{errors.label.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="button-addon-type">Button type (theme buttons)</Label>
          <select
            id="button-addon-type"
            className="w-full rounded-md border border-[var(--glass-border)] bg-[var(--input-background)] px-3 py-2 text-sm text-foreground"
            {...register("buttonName")}
          >
            {themeButtonSettings.length === 0 ? (
              <option value="">No theme buttons — add them in Website → Themes</option>
            ) : (
              themeButtonSettings.map((b) => (
                <option key={b.buttonName} value={b.buttonName}>
                  {b.buttonName}
                </option>
              ))
            )}
          </select>
          {themeButtonSettings.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Configure buttons under your company web theme; they appear here for selection.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="button-addon-link">Link (company web page)</Label>
          <select
            id="button-addon-link"
            className="w-full rounded-md border border-[var(--glass-border)] bg-[var(--input-background)] px-3 py-2 text-sm text-foreground"
            {...register("linkWebPageId")}
          >
            <option value="">No link</option>
            {sortedPages.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
                {p.url ? ` (${p.url})` : ""}
              </option>
            ))}
          </select>
          {sortedPages.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Add pages under Website → Webpages; they appear here for in-site navigation.
            </p>
          )}
        </div>
      </div>
    </CustomDialog>
  );
};

export const buttonAddonModule: AddonModule = {
  type: "button",
  label: "Button",
  description: "Themed button using theme button styles.",
  createDefaultAddon: ({ companyId, contentElementId }) => ({
    id: nanoid(10),
    type: "button",
    data: {
      label: "",
      buttonName: "",
      linkWebPageId: undefined,
      linkPagePublicPath: undefined,
      companyId,
      contentElementId,
    },
  }),
  RenderComponent: ButtonAddonRenderer,
  EditComponent: ButtonAddonEditDialog,
};
