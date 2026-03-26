import { useEffect, useMemo, type CSSProperties } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { nanoid } from "nanoid";
import { Type } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { CustomDialog } from "@/components/ui/custom-dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ThemeTextSetting } from "@/services/companyWebThemes";
import { AddonEditProps, AddonModule, AddonRenderProps } from "../types";
import { ContentAddon, TextContentAddonData } from "../../types";

const textAddonSchema = yup.object({
  text: yup.string().required("Text is required"),
  textStyleName: yup.string().optional().default(""),
});

type TextAddonFormValues = {
  text: string;
  textStyleName: string;
};

function resolveStyleForAddon(
  data: TextContentAddonData,
  themeTextSettings?: ThemeTextSetting[]
): ThemeTextSetting | null {
  const fromTheme = themeTextSettings?.find((t) => t.styleName === data.textStyleName);
  if (fromTheme) return fromTheme;
  if (data.fontFamily || data.fontSize) {
    return {
      styleName: data.textStyleName,
      googleFontUrl: data.googleFontUrl ?? "",
      fontFamily: data.fontFamily ?? "",
      fontSize: data.fontSize ?? "",
      fontColor: data.fontColor,
    };
  }
  return null;
}

function hashUrl(url: string): string {
  let h = 0;
  for (let i = 0; i < url.length; i++) h = (Math.imul(31, h) + url.charCodeAt(i)) | 0;
  return `gf-${Math.abs(h)}`;
}

const TextAddonRenderer = ({ addon, themeTextSettings }: AddonRenderProps) => {
  const data = addon.data as TextContentAddonData;
  const style = useMemo(
    () => resolveStyleForAddon(data, themeTextSettings),
    [data, themeTextSettings]
  );

  const googleUrl = style?.googleFontUrl?.trim();

  useEffect(() => {
    if (!googleUrl) return;
    const id = `addon-text-font-${hashUrl(googleUrl)}`;
    if (document.getElementById(id)) return;
    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = googleUrl;
    document.head.appendChild(link);
    return () => {
      // keep link for other instances; do not remove
    };
  }, [googleUrl]);

  if (!data.text?.trim()) {
    return (
      <div className="rounded-md border border-dashed border-[var(--glass-border)] p-3 text-xs text-muted-foreground">
        Add text in this addon’s settings.
      </div>
    );
  }

  const inline: CSSProperties = {
    fontFamily: style?.fontFamily || undefined,
    fontSize: style?.fontSize || undefined,
    color: style?.fontColor || undefined,
    margin: 0,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  };

  return (
    <div className="w-full h-full min-h-0 flex items-start justify-start p-1">
      <p style={inline} className="w-full">
        {data.text}
      </p>
    </div>
  );
};

const TextAddonEditDialog = ({
  open,
  onOpenChange,
  addon,
  companyId,
  contentElementId,
  onSave,
  themeTextSettings = [],
}: AddonEditProps) => {
  const data = addon.data as TextContentAddonData;
  const effectiveCompanyId = companyId || data.companyId;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<TextAddonFormValues>({
    resolver: yupResolver(textAddonSchema) as any,
    defaultValues: {
      text: data.text ?? "",
      textStyleName: data.textStyleName ?? "",
    },
  });

  useEffect(() => {
    if (!open) return;
    reset({
      text: data.text ?? "",
      textStyleName: data.textStyleName ?? "",
    });
  }, [open, data.text, data.textStyleName, reset]);

  useEffect(() => {
    if (!open || themeTextSettings.length === 0) return;
    const current = getValues("textStyleName");
    if (!current && themeTextSettings[0]) {
      setValue("textStyleName", themeTextSettings[0].styleName);
    }
  }, [open, themeTextSettings, setValue, getValues]);

  const currentTextStyleName = watch("textStyleName");

  const onSubmit = (values: TextAddonFormValues) => {
    if (themeTextSettings.length > 0 && !values.textStyleName?.trim()) {
      toast.error("Select a text type (theme text style).");
      return;
    }
    const selected = themeTextSettings.find((t) => t.styleName === values.textStyleName);
    const updatedAddon: ContentAddon = {
      ...addon,
      data: {
        ...addon.data,
        text: values.text,
        textStyleName: values.textStyleName?.trim() ?? "",
        companyId: effectiveCompanyId,
        contentElementId,
        ...(selected
          ? {
              googleFontUrl: selected.googleFontUrl,
              fontFamily: selected.fontFamily,
              fontSize: selected.fontSize,
              fontColor: selected.fontColor,
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
      title="Text addon settings"
      description="Enter text and choose a theme text style."
      icon={<Type className="w-5 h-5" />}
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
          <Label htmlFor="text-addon-body">Text</Label>
          <Textarea
            id="text-addon-body"
            rows={4}
            placeholder="Enter text…"
            className="bg-[var(--input-background)] border-[var(--glass-border)] min-h-[100px]"
            {...register("text")}
          />
          {errors.text && <p className="text-xs text-destructive">{errors.text.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="text-addon-style">Text type (theme texts)</Label>
          <Select
            value={currentTextStyleName || ""}
            onValueChange={(v) => {
              setValue("textStyleName", v, { shouldDirty: true, shouldValidate: true });
            }}
            disabled={themeTextSettings.length === 0}
          >
            <SelectTrigger
              id="text-addon-style"
              className="w-full bg-[var(--input-background)] border-[var(--glass-border)]"
            >
              <SelectValue placeholder="Select a theme text" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              {themeTextSettings.length === 0 ? (
                <SelectItem value="" disabled>
                  No theme text styles — add them in Website → Themes
                </SelectItem>
              ) : (
                themeTextSettings.map((t) => (
                  <SelectItem key={t.styleName} value={t.styleName}>
                    {t.styleName}
                  </SelectItem>
                ))
              )}
            </SelectContent>
          </Select>
          {themeTextSettings.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Configure text styles under your company web theme; they appear here for selection.
            </p>
          )}
        </div>
      </div>
    </CustomDialog>
  );
};

export const textAddonModule: AddonModule = {
  type: "text",
  label: "Text",
  description: "Styled text using theme text styles.",
  createDefaultAddon: ({ companyId, contentElementId }) => ({
    id: nanoid(10),
    type: "text",
    data: {
      text: "",
      textStyleName: "",
      companyId,
      contentElementId,
    },
  }),
  RenderComponent: TextAddonRenderer,
  EditComponent: TextAddonEditDialog,
};
