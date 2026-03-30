import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Palette, Layout, FolderOpen } from "lucide-react";
import { useAppSelector } from "@/store/hooks";
import { ThemePage } from "./ThemePage/index";
import { WebpagesPage } from "./WebpagesPage/index";
import { HeadersPage } from "./HeadersPage";
import { FootersPage } from "./FootersPage";
import { MediaPage } from "./MediaPage";

export const WebsitePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userCompany, currentCompany } = useAppSelector((state) => state.companies);
  
  // Get company for website configuration
  const company = currentCompany || userCompany;
  const companyId = company?.id;

  // Redirect to webpages if on /system/web without a section
  useEffect(() => {
    if (location.pathname === '/system/web') {
      navigate('/system/web/webpages', { replace: true });
    }
  }, [location.pathname, navigate]);

  type WebSection = "webpages" | "headers" | "footers" | "themes" | "presets" | "media";

  const getActiveSection = (): WebSection => {
    const path = location.pathname;
    if (path.includes("/webpages")) return "webpages";
    if (path.includes("/headers")) return "headers";
    if (path.includes("/footers")) return "footers";
    if (path.includes("/themes")) return "themes";
    if (path.includes("/presets")) return "presets";
    if (path.includes("/media")) return "media";
    return "webpages";
  };

  const activeSection = getActiveSection();

  const renderContent = () => {
    switch (activeSection) {
      case "webpages":
        return <WebpagesPage />;
      case "headers":
        return <HeadersPage />;
      case "footers":
        return <FootersPage />;
      case "themes":
        return companyId ? (
          <ThemePage />
        ) : (
          <div className="flex-1 p-4 lg:p-6 flex flex-col min-h-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
                  Theme Management
                </h1>
                <p className="text-muted-foreground mt-1">
                  Create and manage multiple themes for your website
                </p>
              </div>
            </div>
            <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
              <div className="text-center py-8">
                <Palette className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-foreground mb-4">Please select a company to manage themes.</p>
              </div>
            </Card>
          </div>
        );
      case "media":
        return companyId ? (
          <MediaPage />
        ) : (
          <div className="flex-1 p-4 lg:p-6 flex flex-col min-h-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Media</h1>
                <p className="text-muted-foreground mt-1">Manage media files and folders</p>
              </div>
            </div>
            <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
              <div className="text-center py-8">
                <FolderOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-foreground mb-4">Please select a company to manage media.</p>
              </div>
            </Card>
          </div>
        );
      case "presets":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Presets</h2>
              <p className="text-muted-foreground">Choose from pre-designed website presets</p>
            </div>
            <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
              <div className="text-center py-8">
                <Layout className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-foreground mb-4">Presets content will be displayed here.</p>
              </div>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6">
      {renderContent()}
    </div>
  );
};
