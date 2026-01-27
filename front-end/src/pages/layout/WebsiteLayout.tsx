import { ReactNode, useState } from "react";
import { Header } from "./Header";
import { useIsMobile } from "../../components/ui/use-mobile";
import { Toaster } from "../../components/ui/sonner";
import { User } from "../../types/user";
import { LayoutDashboard, FileText, Palette, Settings, Layout, ChevronRight } from "lucide-react";
import { Button } from "../../components/ui/button";

interface WebsiteLayoutProps {
  children: ReactNode;
  activeSection: string;
  onSectionChange: (section: string) => void;
  currentUser: User | null;
  onLogout: () => void;
  onNavigate?: (page: string) => void;
  companyId: string;
}

const navigationItems = [
  { icon: LayoutDashboard, label: "Dashboard", id: "dashboard" },
  { icon: FileText, label: "Pages", id: "pages" },
  { icon: Layout, label: "Presets", id: "presets" },
  { icon: Palette, label: "Theme", id: "theme" },
  { icon: Settings, label: "Settings", id: "settings" },
];

export const WebsiteLayout = ({
  children,
  activeSection,
  onSectionChange,
  currentUser,
  onLogout,
  onNavigate,
  companyId
}: WebsiteLayoutProps) => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  const handleMenuClick = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:bg-gradient-to-br dark:from-gray-900 dark:via-black dark:to-gray-800">
      <Header 
        onMenuClick={handleMenuClick} 
        onNavigate={onNavigate}
        onLogout={onLogout}
        currentUser={currentUser}
      />
      
      <div className="flex pt-16">
        {/* Website Setup Left Navigation Sidebar */}
        <div
          className={`
            ${isMobile
              ? `fixed top-16 left-0 bottom-0 z-40 w-64 transform transition-transform duration-300 ease-in-out ${
                  sidebarOpen ? "translate-x-0" : "-translate-x-full"
                }`
              : "w-64 relative min-h-[calc(100vh-4rem)]"
            }
            backdrop-blur-xl bg-sidebar border-r border-sidebar-border
          `}
        >
          <div className="p-6">
            {/* Mobile close button */}
            {isMobile && (
              <div className="flex justify-end mb-4">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSidebarOpen(false)}
                  className="hover:bg-sidebar-accent text-sidebar-foreground hover:text-sidebar-foreground"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            )}

            {/* Navigation Menu */}
            <nav className="space-y-2">
              {navigationItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;

                return (
                  <Button
                    key={index}
                    variant="ghost"
                    className={`w-full justify-start gap-3 h-11 transition-all duration-200 ${
                      isActive
                        ? "bg-[var(--accent-bg)] text-[var(--accent-text)] border border-[var(--accent-border)] shadow-lg shadow-[var(--accent-primary)]/10"
                        : "text-sidebar-foreground hover:bg-[var(--accent-bg)] hover:text-[var(--accent-text)] hover:border hover:border-[var(--accent-border)] hover:shadow-md hover:shadow-[var(--accent-primary)]/20"
                    }`}
                    onClick={() => {
                      onSectionChange(item.id);
                      if (isMobile) {
                        setSidebarOpen(false);
                      }
                    }}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Mobile overlay */}
        {isMobile && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
      
      {/* Toast notifications */}
      <Toaster />
    </div>
  );
};
