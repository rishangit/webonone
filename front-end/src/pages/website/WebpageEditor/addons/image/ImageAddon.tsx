import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { nanoid } from "nanoid";
import { Image as ImageIcon, Pencil } from "lucide-react";
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
import { SelectMediaDialog } from "@/components/common/SelectMediaDialog";
import { AddonEditProps, AddonModule, AddonRenderProps } from "../types";
import { ContentAddon } from "../../types";

const imageAddonSchema = yup.object({
  // We validate manually on OK using `selectedPath`/`imagePath`
  // because RHF state updates can lag in some dialog flows.
  imagePath: yup.string().optional(),
  view: yup
    .mixed<'best-fit' | 'full-width'>()
    .oneOf(['best-fit', 'full-width'])
    .required("View is required"),
  height: yup
    .string()
    .optional()
    .test("valid-height", "Height must be a positive number (px) or empty for auto.", (v) => {
      if (!v) return true; // empty => auto
      return /^\d+$/.test(v);
    }),
});

type ImageAddonFormValues = {
  imagePath?: string;
  view: 'best-fit' | 'full-width';
  height?: string;
};

const resolveImageUrl = (companyId?: string, imagePath?: string) => {
  if (!companyId || !imagePath) return "";
  return getMediaFileUrl(companyId, imagePath);
};

const ImageAddonRenderer = ({ addon, companyId }: AddonRenderProps) => {
  const data = addon.data as {
    imagePath?: string;
    view?: 'best-fit' | 'full-width';
    companyId?: string;
    height?: number;
  };
  const imageUrl = resolveImageUrl(companyId || data.companyId, data.imagePath);
  const isFullWidth = data.view === 'full-width';
  const heightPx = typeof data.height === 'number' ? data.height : undefined;

  if (!imageUrl) {
    return (
      <div className="rounded-md border border-dashed border-[var(--glass-border)] p-3 text-xs text-muted-foreground">
        Select an image to render this addon.
      </div>
    );
  }

  return (
    <div
      className={isFullWidth ? "w-full flex items-center justify-center" : "w-full h-full flex items-center justify-center"}
      style={heightPx ? { height: `${heightPx}px` } : undefined}
    >
      <img
        src={imageUrl}
        alt="Content addon"
        className={`${
          isFullWidth
            ? "w-full object-contain"
            : "w-full h-full object-cover"
        }`}
        style={isFullWidth && heightPx ? { height: `${heightPx}px`, objectFit: "contain" } : undefined}
      />
    </div>
  );
};

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
    view?: 'best-fit' | 'full-width';
    companyId?: string;
    height?: number;
  };
  const effectiveCompanyId = companyId || data.companyId;
  const [selectMediaDialogOpen, setSelectMediaDialogOpen] = useState(false);
  const [selectedPath, setSelectedPath] = useState(data.imagePath || "");
  const [showImageRequired, setShowImageRequired] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    clearErrors,
    reset,
  } = useForm<ImageAddonFormValues>({
    resolver: yupResolver(imageAddonSchema) as any,
    defaultValues: {
      imagePath: data.imagePath || "",
      view: data.view || "best-fit",
      height: data.height != null ? String(data.height) : "",
    },
  });

  const currentImagePath = watch("imagePath");
  const effectiveImagePath = currentImagePath || selectedPath;
  const currentView = watch("view");

  useEffect(() => {
    if (!open) return;
    reset({
      imagePath: data.imagePath || "",
      view: data.view || "best-fit",
      height: data.height != null ? String(data.height) : "",
    });
    setSelectedPath(data.imagePath || "");
  }, [open]);

  const onSubmit = (values: ImageAddonFormValues) => {
    const imagePathToSave = values.imagePath || selectedPath;

    if (!imagePathToSave) {
      setShowImageRequired(true);
      toast.error("Please select or upload an image before clicking OK.");
      return;
    }

    const heightToSave = values.height ? Number(values.height) : undefined;

    const updatedAddon: ContentAddon = {
      ...addon,
      data: {
        ...addon.data,
        imagePath: imagePathToSave,
        view: values.view,
        companyId: effectiveCompanyId,
        contentElementId,
        height: heightToSave,
      },
    };
    onSave(updatedAddon);
    onOpenChange(false);
  };

  return (
    <>
      <CustomDialog
        open={open}
        onOpenChange={onOpenChange}
        title="Image addon settings"
        description="Select an existing media image or upload a new one."
        icon={<ImageIcon className="w-5 h-5" />}
        sizeWidth="medium"
        sizeHeight="medium"
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="accent"
              onClick={handleSubmit(onSubmit)}
            >
              OK
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label className="text-sm font-medium">Image media</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setSelectMediaDialogOpen(true)}
                disabled={!effectiveCompanyId}
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </div>

            {effectiveImagePath ? (
              <div className="rounded-md border border-[var(--glass-border)] p-3">
                <img
                  src={resolveImageUrl(effectiveCompanyId, effectiveImagePath)}
                  alt="Selected media"
                  className="max-h-36 w-auto max-w-full rounded-sm object-contain"
                />
                <p className="text-xs text-muted-foreground mt-2 truncate">{effectiveImagePath}</p>
              </div>
            ) : (
              <div className="rounded-md border border-dashed border-[var(--glass-border)] p-3 text-xs text-muted-foreground">
                No media selected. Click Edit to choose media.
              </div>
            )}
          </div>

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
                <SelectItem value="best-fit">
                  Best view (fit to content element)
                </SelectItem>
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

          {showImageRequired && !effectiveImagePath && (
            <div className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-md p-2">
              Please select or upload an image.
            </div>
          )}

          <input type="hidden" {...register("imagePath")} />
        </div>
      </CustomDialog>

      {effectiveCompanyId && (
        <SelectMediaDialog
          open={selectMediaDialogOpen}
          onOpenChange={setSelectMediaDialogOpen}
          companyId={effectiveCompanyId}
          selectedPath={effectiveImagePath}
          onSelect={(path) => {
            setSelectedPath(path);
            setValue("imagePath", path, { shouldValidate: true, shouldDirty: true });
            clearErrors("imagePath");
            setShowImageRequired(false);
          }}
          title="Select image media"
        />
      )}
    </>
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
      view: "best-fit",
      companyId,
      contentElementId,
    },
  }),
  RenderComponent: ImageAddonRenderer,
  EditComponent: ImageAddonEditDialog,
};
