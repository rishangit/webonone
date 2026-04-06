import { useEffect, useState } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { nanoid } from "nanoid";
import { Image as ImageIcon, Save } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CustomDialog } from "@/components/ui/custom-dialog";
import { getMediaFileUrl } from "@/services/companyWebMedia";
import { ResponsiveMediaByBreakpointField } from "@/components/website/ResponsiveMediaByBreakpointField";
import { AddonEditProps, AddonModule, AddonRenderProps } from "../types";
import { ContentAddon, type BreakpointName } from "../../types";
import {
  resolvePathForBreakpoint,
  RESPONSIVE_BREAKPOINT_ORDER,
} from "../../responsiveBreakpointUtils";

const imageAddonSchema = yup.object({
  imagePath: yup.string().optional(),
  view: yup
    .mixed<"best-fit" | "full-width">()
    .oneOf(["best-fit", "full-width"])
    .required("View is required"),
  height: yup
    .string()
    .optional()
    .test("valid-height", "Height must be a positive number (px) or empty for auto.", (v) => {
      if (!v) return true;
      return /^\d+$/.test(v);
    }),
});

type ImageAddonFormValues = {
  imagePath?: string;
  view: "best-fit" | "full-width";
  height?: string;
};

const resolveImageUrl = (companyId?: string, imagePath?: string) => {
  if (!companyId || !imagePath) return "";
  return getMediaFileUrl(companyId, imagePath);
};

const ImageAddonRenderer = ({
  addon,
  companyId,
  breakpoint = "2xl",
}: AddonRenderProps) => {
  const data = addon.data as {
    imagePath?: string;
    imagePathByBreakpoint?: Partial<Record<BreakpointName, string>>;
    view?: "best-fit" | "full-width";
    companyId?: string;
    height?: number;
  };
  const resolvedPath = resolvePathForBreakpoint(
    data.imagePathByBreakpoint,
    data.imagePath,
    breakpoint
  );
  const imageUrl = resolveImageUrl(companyId || data.companyId, resolvedPath);
  const isFullWidth = data.view === "full-width";
  const heightPx = typeof data.height === "number" ? data.height : undefined;

  if (!imageUrl) {
    return (
      <div className="rounded-md border border-dashed border-[var(--glass-border)] p-3 text-xs text-muted-foreground">
        Select an image to render this addon.
      </div>
    );
  }

  return (
    <div
      className={
        isFullWidth ? "w-full flex items-center justify-center" : "w-full h-full flex items-center justify-center"
      }
      style={heightPx ? { height: `${heightPx}px` } : undefined}
    >
      <img
        src={imageUrl}
        alt="Content addon"
        className={`${
          isFullWidth ? "w-full object-contain" : "w-full h-full object-cover"
        }`}
        style={isFullWidth && heightPx ? { height: `${heightPx}px`, objectFit: "contain" } : undefined}
      />
    </div>
  );
};

function cleanPathsByBreakpoint(
  raw: Partial<Record<BreakpointName, string>>
): Partial<Record<BreakpointName, string>> | undefined {
  const next: Partial<Record<BreakpointName, string>> = {};
  for (const bp of RESPONSIVE_BREAKPOINT_ORDER) {
    const p = raw[bp]?.trim();
    if (p) next[bp] = p;
  }
  return Object.keys(next).length ? next : undefined;
}

const ImageAddonEditDialog = ({
  open,
  onOpenChange,
  addon,
  companyId,
  contentElementId,
  onSave,
}: AddonEditProps) => {
  const data = addon.data as {
    imagePath?: string;
    imagePathByBreakpoint?: Partial<Record<BreakpointName, string>>;
    view?: "best-fit" | "full-width";
    companyId?: string;
    height?: number;
  };
  const effectiveCompanyId = companyId || data.companyId || "";
  const [pathsByBp, setPathsByBp] = useState<Partial<Record<BreakpointName, string>>>(
    () => ({ ...(data.imagePathByBreakpoint ?? {}) })
  );
  const [showImageRequired, setShowImageRequired] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<ImageAddonFormValues>({
    resolver: yupResolver(imageAddonSchema) as Resolver<ImageAddonFormValues>,
    defaultValues: {
      imagePath: data.imagePath || "",
      view: data.view || "best-fit",
      height: data.height != null ? String(data.height) : "",
    },
  });

  const currentView = watch("view");

  useEffect(() => {
    if (!open) return;
    reset({
      imagePath: data.imagePath || "",
      view: data.view || "best-fit",
      height: data.height != null ? String(data.height) : "",
    });
    setPathsByBp({ ...(data.imagePathByBreakpoint ?? {}) });
    setShowImageRequired(false);
  }, [open, data.imagePath, data.view, data.height, data.imagePathByBreakpoint, reset]);

  const onSubmit = (values: ImageAddonFormValues) => {
    if (!effectiveCompanyId) {
      toast.error("Company context is required to save media.");
      return;
    }

    const cleaned = cleanPathsByBreakpoint(pathsByBp);
    const imagePathPersisted =
      resolvePathForBreakpoint(pathsByBp, data.imagePath, "2xl").trim() || "";

    if (!imagePathPersisted) {
      setShowImageRequired(true);
      toast.error("Please select or upload at least one image.");
      return;
    }

    const heightToSave = values.height ? Number(values.height) : undefined;

    const updatedAddon: ContentAddon = {
      ...addon,
      data: {
        ...addon.data,
        imagePath: imagePathPersisted,
        imagePathByBreakpoint: cleaned ?? undefined,
        view: values.view,
        companyId: effectiveCompanyId || data.companyId,
        contentElementId,
        height: heightToSave,
      },
    };
    onSave(updatedAddon);
    onOpenChange(false);
  };

  return (
    <CustomDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Image addon settings"
      description="Select images per screen size (sm–2xl), or use one legacy image for all. Same breakpoint model as theme text sizes."
      icon={<ImageIcon className="w-5 h-5" />}
      sizeWidth="medium"
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
          <Button type="button" variant="accent" onClick={handleSubmit(onSubmit)}>
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {effectiveCompanyId ? (
          <ResponsiveMediaByBreakpointField
            companyId={effectiveCompanyId}
            value={pathsByBp}
            onChange={setPathsByBp}
            legacyPath={data.imagePath}
            label="Image media by screen size"
            selectDialogTitle="Select image media"
          />
        ) : (
          <p className="text-sm text-destructive">Company context is required to pick media.</p>
        )}

        <div className="space-y-2">
          <Label htmlFor="image-addon-view">View mode</Label>
          <Select
            value={currentView}
            onValueChange={(v) => {
              setValue("view", v as ImageAddonFormValues["view"], {
                shouldDirty: true,
                shouldValidate: true,
              });
            }}
          >
            <SelectTrigger
              id="image-addon-view"
              className="w-full bg-[var(--input-background)] border-[var(--glass-border)]"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="best-fit">Best view (fit to content element)</SelectItem>
              <SelectItem value="full-width">Full width (height auto)</SelectItem>
            </SelectContent>
          </Select>
          {errors.view && <p className="text-xs text-destructive">{errors.view.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="image-addon-height">Height (px)</Label>
          <Input
            id="image-addon-height"
            type="number"
            min={1}
            inputMode="numeric"
            placeholder="Auto (empty)"
            className="bg-[var(--input-background)] border-[var(--glass-border)]"
            {...register("height")}
          />
          {errors.height && <p className="text-xs text-destructive">{errors.height.message}</p>}
        </div>

        {showImageRequired &&
          !resolvePathForBreakpoint(pathsByBp, data.imagePath, "2xl").trim() && (
          <div className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-md p-2">
            Please select or upload at least one image.
          </div>
        )}

        <input type="hidden" {...register("imagePath")} />
      </div>
    </CustomDialog>
  );
};

export const imageAddonModule: AddonModule = {
  type: "image",
  label: "Image",
  description: "Display an image from media library.",
  createDefaultAddon: ({ companyId, contentElementId }) => ({
    id: nanoid(10),
    type: "image",
    data: {
      imagePath: "",
      imagePathByBreakpoint: undefined,
      view: "best-fit",
      companyId,
      contentElementId,
    },
  }),
  RenderComponent: ImageAddonRenderer,
  EditComponent: ImageAddonEditDialog,
};
