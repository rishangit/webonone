import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Globe, FileText } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchWebPageRequest,
  createWebPageRequest,
  updateWebPageRequest,
  clearError,
} from "../../store/slices/companyWebPagesSlice";
import { CreateWebPageData } from "../../services/companyWebPages";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

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
        // Check if it's a valid absolute URL
        try {
          new URL(value);
          return true;
        } catch {
          // If not absolute URL, check if it's a valid relative path
          return value.startsWith("/") && value.length > 1;
        }
      }
    ),
  isActive: yup.boolean().notRequired(),
});

type FormData = {
  name: string;
  url: string;
  isActive?: boolean;
}

export const WebpageFormPage = () => {
  const { pageId } = useParams<{ pageId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentWebPage, loading, error } = useAppSelector((state) => state.companyWebPages);
  const { userCompany, currentCompany } = useAppSelector((state) => state.companies);
  
  // Get company for website configuration
  const company = currentCompany || userCompany;
  const companyId = company?.id;
  
  const isNew = !pageId;
  const [isSaving, setIsSaving] = useState(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      name: "",
      url: "",
      isActive: false,
    },
  });

  const isActive = watch("isActive");

  // Fetch webpage if editing
  useEffect(() => {
    if (pageId) {
      dispatch(fetchWebPageRequest(pageId));
    }
  }, [dispatch, pageId]);

  // Populate form when webpage is loaded
  useEffect(() => {
    if (currentWebPage && pageId) {
      setValue("name", currentWebPage.name);
      setValue("url", currentWebPage.url);
      setValue("isActive", currentWebPage.isActive || false);
    }
  }, [currentWebPage, pageId, setValue]);

  useEffect(() => {
    if (error) {
      console.error("Webpage error:", error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const onSubmit = async (data: FormData) => {
    if (!companyId) {
      toast.error("Please select a company");
      return;
    }

    setIsSaving(true);
    
    try {
      const formData: CreateWebPageData = {
        companyId,
        name: data.name,
        url: data.url,
        isActive: data.isActive || false,
      };

      if (isNew) {
        dispatch(createWebPageRequest(formData));
        toast.success("Webpage created successfully!");
        setTimeout(() => {
          navigate(`/system/web/webpages`);
        }, 500);
      } else {
        dispatch(updateWebPageRequest({ id: pageId!, data: formData }));
        toast.success("Webpage updated successfully!");
        setTimeout(() => {
          navigate(`/system/web/webpages`);
        }, 500);
      }
    } catch (err) {
      console.error("Error saving webpage:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleBack = () => {
    navigate(`/system/web/webpages`);
  };

  const pageTitle = isNew ? "Create New Webpage" : "Edit Webpage";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="max-w-3xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="mb-6 hover:bg-[var(--accent-bg)] text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Webpages
          </Button>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/10">
              <FileText className="w-6 h-6 text-[var(--accent-primary)]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{pageTitle}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                {isNew 
                  ? "Add a new webpage to your website" 
                  : "Update your webpage information"}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Webpage Name */}
          <div className="space-y-3">
            <Label htmlFor="name" className="text-base font-semibold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Webpage Name *
            </Label>
            <Input
              id="name"
              {...register("name")}
              placeholder="e.g., Home Page, About Us, Contact"
              className="h-12 text-base bg-background/50 border-2 border-border focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/20 transition-all"
            />
            {errors.name && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <span>•</span>
                {errors.name.message}
              </p>
            )}
          </div>

          {/* URL */}
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
              className="h-12 text-base bg-background/50 border-2 border-border focus:border-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/20 transition-all"
            />
            {errors.url && (
              <p className="text-sm text-red-600 flex items-center gap-1">
                <span>•</span>
                {errors.url.message}
              </p>
            )}
            <p className="text-sm text-muted-foreground flex items-start gap-2">
              <span className="mt-1">ℹ️</span>
              <span>Enter a relative path (e.g., /about, /contact) or a full URL (e.g., https://example.com/page)</span>
            </p>
          </div>

          {/* Status Toggle */}
          <div className="pt-6 border-t border-border/50">
            <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                 onClick={() => setValue("isActive", !isActive)}>
              <input
                type="checkbox"
                id="isActive"
                {...register("isActive")}
                className="w-5 h-5 rounded border-2 border-border text-[var(--accent-primary)] focus:ring-2 focus:ring-[var(--accent-primary)]/20 cursor-pointer"
              />
              <Label htmlFor="isActive" className="cursor-pointer flex-1 text-base font-medium text-foreground">
                Mark as Active
              </Label>
              <div className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                isActive 
                  ? 'bg-green-500/20 text-green-600' 
                  : 'bg-muted text-muted-foreground'
              }`}>
                {isActive ? 'Active' : 'Inactive'}
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2 ml-12">
              Active webpages will be visible on your website
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              className="px-6"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSaving || loading}
              className="px-8 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:from-[var(--accent-primary-hover)] hover:to-[var(--accent-primary)] text-[var(--accent-button-text)] shadow-lg shadow-[var(--accent-primary)]/20"
            >
              <Save className="w-4 h-4 mr-2" />
              {isSaving ? "Saving..." : isNew ? "Create Webpage" : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
