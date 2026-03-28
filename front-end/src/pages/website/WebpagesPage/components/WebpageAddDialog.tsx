import { useEffect } from "react";
import { Globe, FileText, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { CustomDialog } from "@/components/ui/custom-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface WebpageAddDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: { name: string; url: string; isActive?: boolean }) => void;
  loading?: boolean;
}

const schema = yup.object({
  name: yup.string().required("Webpage name is required"),
  url: yup
    .string()
    .required("URL is required")
    .test(
      "url-or-path",
      "Please enter a valid URL or path (e.g., https://example.com/page or /about)",
      (value) => {
        if (!value) return false;
        try {
          new URL(value);
          return true;
        } catch {
          return value.startsWith("/") && value.length > 1;
        }
      }
    ),
  isActive: yup.boolean().notRequired(),
});

type FormData = yup.InferType<typeof schema>;

export const WebpageAddDialog = ({
  open,
  onOpenChange,
  onSubmit,
  loading = false,
}: WebpageAddDialogProps) => {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      url: "",
      isActive: false,
    },
  });

  const isActive = !!watch("isActive");

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  return (
    <CustomDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add New Webpage"
      description="Add a new webpage to your website."
      icon={<FileText className="w-5 h-5" />}
      sizeWidth="small"
      sizeHeight="medium"
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="submit" form="add-webpage-form" variant="accent" disabled={loading}>
            <Save className="w-4 h-4 mr-2" />
            {loading ? "Saving..." : "Create Webpage"}
          </Button>
        </>
      }
    >
      <form id="add-webpage-form" onSubmit={handleSubmit((data) => onSubmit(data))} className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="name" className="text-base font-semibold text-foreground flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Webpage Name *
          </Label>
          <Input
            id="name"
            {...register("name")}
            placeholder="e.g., Home Page, About Us, Contact"
            className="h-12 text-base bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
          />
          {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
        </div>

        <div className="space-y-3">
          <Label htmlFor="url" className="text-base font-semibold text-foreground flex items-center gap-2">
            <Globe className="w-4 h-4" />
            URL *
          </Label>
          <Input
            id="url"
            type="text"
            {...register("url")}
            placeholder="/about or https://example.com/page"
            className="h-12 text-base bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
          />
          {errors.url && <p className="text-sm text-red-600">{errors.url.message}</p>}
          <p className="text-sm text-muted-foreground">
            Enter a relative path (e.g., /about, /contact) or a full URL.
          </p>
        </div>

        <div className="pt-4 border-t border-[var(--glass-border)]">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)]">
            <Checkbox
              id="isActive"
              checked={isActive}
              onCheckedChange={(checked) => setValue("isActive", !!checked, { shouldDirty: true })}
              className="w-5 h-5"
            />
            <Label htmlFor="isActive" className="cursor-pointer flex-1 text-base font-medium text-foreground">
              Mark as Active
            </Label>
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                isActive ? "bg-green-500/20 text-green-600" : "bg-muted text-muted-foreground"
              }`}
            >
              {isActive ? "Active" : "Inactive"}
            </div>
          </div>
        </div>
      </form>
    </CustomDialog>
  );
};

