import { useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Card } from "../../components/ui/card";
import { WebsiteLayout } from "../layout/WebsiteLayout";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { logout } from "../../store/slices/authSlice";
import { toast } from "sonner";
import { ThemePage } from "./ThemePage";

export const WebsiteSetupPage = () => {
  const { companyId, section } = useParams<{ companyId: string; section: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  
  // Get active section from URL, default to dashboard
  const activeSection = section || "dashboard";
  
  // Redirect to dashboard if no section is specified
  useEffect(() => {
    if (!section && location.pathname === `/web/${companyId}`) {
      navigate(`/web/${companyId}/dashboard`, { replace: true });
    }
  }, [section, companyId, navigate, location.pathname]);

  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Website Dashboard</h2>
              <p className="text-muted-foreground">Manage your website settings and content</p>
            </div>
            <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
              <p className="text-foreground">Website dashboard content will be displayed here.</p>
            </Card>
          </div>
        );
      case "pages":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Pages</h2>
              <p className="text-muted-foreground">Manage your website pages</p>
            </div>
            <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
              <p className="text-foreground">Pages management content will be displayed here.</p>
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
              <p className="text-foreground">Presets content will be displayed here.</p>
            </Card>
          </div>
        );
      case "theme":
        return <ThemePage />;
      case "settings":
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Settings</h2>
              <p className="text-muted-foreground">Configure your website settings</p>
            </div>
            <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
              <p className="text-foreground">Settings content will be displayed here.</p>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Logged out successfully');
    setTimeout(() => {
      navigate("/system/login");
    }, 100);
  };

  const handleNavigate = (page: string) => {
    navigate(`/system/${page}`);
  };

  const handleSectionChange = (newSection: string) => {
    navigate(`/web/${companyId}/${newSection}`);
  };

  return (
    <WebsiteLayout
      activeSection={activeSection}
      onSectionChange={handleSectionChange}
      currentUser={user}
      onLogout={handleLogout}
      onNavigate={handleNavigate}
      companyId={companyId || ""}
    >
      <div className="p-6">
        {renderContent()}
      </div>
    </WebsiteLayout>
  );
};
