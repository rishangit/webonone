import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../components/ui/tabs";
import { WebsiteLayout } from "../layout/WebsiteLayout";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import {
  fetchThemeRequest,
  createThemeRequest,
  updateThemeRequest,
  clearError,
} from "../../store/slices/companyWebThemesSlice";
import { CreateThemeData } from "../../services/companyWebThemes";
import { toast } from "sonner";

export const ThemeFormPage = () => {
  const { companyId, themeId } = useParams<{ companyId: string; themeId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { currentTheme, loading, error } = useAppSelector((state) => state.companyWebThemes);
  const { user } = useAppSelector((state) => state.auth);
  
  const isNew = !themeId;
  const isViewMode = themeId && new URLSearchParams(location.search).get('view') === 'true';
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"colors" | "text">("colors");
  
  const [formData, setFormData] = useState<CreateThemeData>({
    companyId: companyId || "",
    name: "",
    backgroundColor: "",
    bodyTextColor: "",
    headingColor: "",
    h1Font: "",
    h2Font: "",
    h3Font: "",
    h4Font: "",
    h5Font: "",
    googleFontUrl: "",
    isActive: false,
    isDefault: false,
  });

  // Fetch theme if editing/viewing
  useEffect(() => {
    if (themeId) {
      dispatch(fetchThemeRequest(themeId));
    }
  }, [dispatch, themeId]);

  // Populate form when theme is loaded
  useEffect(() => {
    if (currentTheme && themeId) {
      setFormData({
        companyId: currentTheme.companyId,
        name: currentTheme.name,
        backgroundColor: currentTheme.backgroundColor || "",
        bodyTextColor: currentTheme.bodyTextColor || "",
        headingColor: currentTheme.headingColor || "",
        h1Font: currentTheme.h1Font || "",
        h2Font: currentTheme.h2Font || "",
        h3Font: currentTheme.h3Font || "",
        h4Font: currentTheme.h4Font || "",
        h5Font: currentTheme.h5Font || "",
        googleFontUrl: currentTheme.googleFontUrl || "",
        isActive: currentTheme.isActive,
        isDefault: currentTheme.isDefault,
      });
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

    setIsSaving(true);
    
    try {
      if (isNew) {
        dispatch(createThemeRequest(formData));
        toast.success("Theme created successfully!");
        setTimeout(() => {
          navigate(`/web/${companyId}/theme`);
        }, 500);
      } else {
        dispatch(updateThemeRequest({ id: themeId!, data: formData }));
        toast.success("Theme updated successfully!");
        setTimeout(() => {
          navigate(`/web/${companyId}/theme`);
        }, 500);
      }
    } catch (err) {
      console.error("Error saving theme:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    navigate("/system/login");
  };

  const handleNavigate = (page: string) => {
    navigate(`/system/${page}`);
  };

  const handleBack = () => {
    navigate(`/web/${companyId}/theme`);
  };

  const pageTitle = isNew ? "Create New Theme" : isViewMode ? "View Theme" : "Edit Theme";

  return (
    <WebsiteLayout
      activeSection="theme"
      onSectionChange={(section) => navigate(`/web/${companyId}/${section}`)}
      currentUser={user}
      onLogout={handleLogout}
      onNavigate={handleNavigate}
      companyId={companyId || ""}
    >
      <div className="p-6 max-w-4xl mx-auto">
        <div className="space-y-6">
          {/* Header */}
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
                    ? "Create a new theme for your website" 
                    : isViewMode 
                    ? "View theme details" 
                    : "Edit your theme settings"}
                </p>
              </div>
            </div>
            {!isViewMode && (
              <Button
                onClick={handleSave}
                disabled={isSaving || loading}
                className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:from-[var(--accent-primary-hover)] hover:to-[var(--accent-primary)] text-[var(--accent-button-text)]"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : isNew ? "Create Theme" : "Save Changes"}
              </Button>
            )}
          </div>

          {/* Form */}
          <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
            <div className="space-y-6">
              {/* Theme Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Theme Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="My Custom Theme"
                  className="bg-[var(--input-background)] border-[var(--glass-border)]"
                  disabled={isViewMode}
                />
              </div>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "colors" | "text")} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-[var(--glass-bg)] border-[var(--glass-border)]">
                  <TabsTrigger value="colors">Color Settings</TabsTrigger>
                  <TabsTrigger value="text">Text Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="colors" className="space-y-6 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="backgroundColor">Background Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="backgroundColor"
                        type="color"
                        value={formData.backgroundColor || "#ffffff"}
                        onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                        className="w-20 h-12 bg-[var(--input-background)] border-[var(--glass-border)] cursor-pointer"
                        disabled={isViewMode}
                      />
                      <Input
                        type="text"
                        value={formData.backgroundColor || ""}
                        onChange={(e) => setFormData({ ...formData, backgroundColor: e.target.value })}
                        placeholder="#ffffff"
                        className="flex-1 bg-[var(--input-background)] border-[var(--glass-border)]"
                        disabled={isViewMode}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bodyTextColor">Body Text Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="bodyTextColor"
                        type="color"
                        value={formData.bodyTextColor || "#000000"}
                        onChange={(e) => setFormData({ ...formData, bodyTextColor: e.target.value })}
                        className="w-20 h-12 bg-[var(--input-background)] border-[var(--glass-border)] cursor-pointer"
                        disabled={isViewMode}
                      />
                      <Input
                        type="text"
                        value={formData.bodyTextColor || ""}
                        onChange={(e) => setFormData({ ...formData, bodyTextColor: e.target.value })}
                        placeholder="#000000"
                        className="flex-1 bg-[var(--input-background)] border-[var(--glass-border)]"
                        disabled={isViewMode}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="headingColor">Heading Color</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="headingColor"
                        type="color"
                        value={formData.headingColor || "#000000"}
                        onChange={(e) => setFormData({ ...formData, headingColor: e.target.value })}
                        className="w-20 h-12 bg-[var(--input-background)] border-[var(--glass-border)] cursor-pointer"
                        disabled={isViewMode}
                      />
                      <Input
                        type="text"
                        value={formData.headingColor || ""}
                        onChange={(e) => setFormData({ ...formData, headingColor: e.target.value })}
                        placeholder="#000000"
                        className="flex-1 bg-[var(--input-background)] border-[var(--glass-border)]"
                        disabled={isViewMode}
                      />
                    </div>
                  </div>

                  {/* Color Preview */}
                  <div className="mt-6 p-6 rounded-lg border border-[var(--glass-border)]">
                    <Label className="mb-4 block">Color Preview</Label>
                    <div
                      className="p-6 rounded-lg"
                      style={{
                        backgroundColor: formData.backgroundColor || "#ffffff",
                        color: formData.bodyTextColor || "#000000",
                      }}
                    >
                      <h3
                        className="text-2xl font-bold mb-2"
                        style={{ color: formData.headingColor || formData.bodyTextColor || "#000000" }}
                      >
                        Heading Preview
                      </h3>
                      <p className="text-base">
                        This is a preview of how your body text will look with the selected colors.
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="text" className="space-y-6 mt-6">
                  <div className="space-y-2">
                    <Label htmlFor="googleFontUrl">Google Font URL</Label>
                    <Input
                      id="googleFontUrl"
                      type="url"
                      value={formData.googleFontUrl || ""}
                      onChange={(e) => setFormData({ ...formData, googleFontUrl: e.target.value })}
                      placeholder="https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap"
                      className="bg-[var(--input-background)] border-[var(--glass-border)]"
                      disabled={isViewMode}
                    />
                    <p className="text-xs text-muted-foreground">
                      Add Google Font URL to use custom fonts for headings. Example: https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="h1Font">H1 Font</Label>
                      <Input
                        id="h1Font"
                        value={formData.h1Font || ""}
                        onChange={(e) => setFormData({ ...formData, h1Font: e.target.value })}
                        placeholder="Roboto, sans-serif"
                        className="bg-[var(--input-background)] border-[var(--glass-border)]"
                        disabled={isViewMode}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="h2Font">H2 Font</Label>
                      <Input
                        id="h2Font"
                        value={formData.h2Font || ""}
                        onChange={(e) => setFormData({ ...formData, h2Font: e.target.value })}
                        placeholder="Roboto, sans-serif"
                        className="bg-[var(--input-background)] border-[var(--glass-border)]"
                        disabled={isViewMode}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="h3Font">H3 Font</Label>
                      <Input
                        id="h3Font"
                        value={formData.h3Font || ""}
                        onChange={(e) => setFormData({ ...formData, h3Font: e.target.value })}
                        placeholder="Roboto, sans-serif"
                        className="bg-[var(--input-background)] border-[var(--glass-border)]"
                        disabled={isViewMode}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="h4Font">H4 Font</Label>
                      <Input
                        id="h4Font"
                        value={formData.h4Font || ""}
                        onChange={(e) => setFormData({ ...formData, h4Font: e.target.value })}
                        placeholder="Roboto, sans-serif"
                        className="bg-[var(--input-background)] border-[var(--glass-border)]"
                        disabled={isViewMode}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="h5Font">H5 Font</Label>
                      <Input
                        id="h5Font"
                        value={formData.h5Font || ""}
                        onChange={(e) => setFormData({ ...formData, h5Font: e.target.value })}
                        placeholder="Roboto, sans-serif"
                        className="bg-[var(--input-background)] border-[var(--glass-border)]"
                        disabled={isViewMode}
                      />
                    </div>
                  </div>

                  {/* Font Preview */}
                  {formData.googleFontUrl && (
                    <div className="mt-6">
                      <Label className="mb-4 block">Font Preview</Label>
                      <div className="p-6 rounded-lg border border-[var(--glass-border)] space-y-4">
                        <link rel="stylesheet" href={formData.googleFontUrl} />
                        <h1 style={{ fontFamily: formData.h1Font || "inherit" }} className="text-4xl font-bold">
                          H1 Heading Preview
                        </h1>
                        <h2 style={{ fontFamily: formData.h2Font || "inherit" }} className="text-3xl font-bold">
                          H2 Heading Preview
                        </h2>
                        <h3 style={{ fontFamily: formData.h3Font || "inherit" }} className="text-2xl font-bold">
                          H3 Heading Preview
                        </h3>
                        <h4 style={{ fontFamily: formData.h4Font || "inherit" }} className="text-xl font-bold">
                          H4 Heading Preview
                        </h4>
                        <h5 style={{ fontFamily: formData.h5Font || "inherit" }} className="text-lg font-bold">
                          H5 Heading Preview
                        </h5>
                      </div>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              {/* Status Checkboxes */}
              {!isViewMode && (
                <div className="flex items-center gap-6 pt-6 border-t border-[var(--glass-border)]">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-foreground">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isDefault}
                      onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-foreground">Set as Default</span>
                  </label>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </WebsiteLayout>
  );
};
