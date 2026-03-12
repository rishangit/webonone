import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "../../components/ui/card";
import { Palette, Layout } from "lucide-react";
import { useAppSelector } from "../../store/hooks";
import { ThemePage } from "./ThemePage";
import { WebpagesPage } from "./WebpagesPage/index";

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

  // Get active section from URL path
  const getActiveSection = () => {
    const path = location.pathname;
    if (path.includes('/webpages')) return 'webpages';
    if (path.includes('/themes')) return 'themes';
    if (path.includes('/presets')) return 'presets';
    return 'webpages'; // default
  };

  const activeSection = getActiveSection();

  const renderContent = () => {
    switch (activeSection) {
      case "webpages":
        return <WebpagesPage />;
      case "themes":
        return (
          <div className="space-y-6">
            {companyId ? (
              <ThemePage />
            ) : (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">Themes</h2>
                  <p className="text-muted-foreground">Manage your website themes</p>
                </div>
                <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                  <div className="text-center py-8">
                    <Palette className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-foreground mb-4">Please select a company to manage themes.</p>
                  </div>
                </Card>
              </div>
            )}
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
