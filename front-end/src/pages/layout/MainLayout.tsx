import { ReactNode, useState } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { useIsMobile } from "../../components/ui/use-mobile";
import { Toaster } from "../../components/ui/sonner";

import { User } from "../../types/user";

interface MainLayoutProps {
  children: ReactNode;
  currentPage: string;
  onPageChange: (page: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  currentUser: User | null;
  onLogout: () => void;
}

export function MainLayout({
  children,
  currentPage,
  onPageChange,
  sidebarOpen,
  setSidebarOpen,
  currentUser,
  onLogout
}: MainLayoutProps) {
  const isMobile = useIsMobile();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handlePageChange = (page: string) => {
    onPageChange(page);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleMenuClick = () => {
    if (isMobile) {
      setSidebarOpen(!sidebarOpen);
    } else {
      // In desktop view, toggle collapsed state
      setSidebarCollapsed(!sidebarCollapsed);
    }
  };

  // Calculate sidebar width: 256px (w-64) when expanded, 80px when collapsed
  const sidebarWidth = sidebarCollapsed ? 80 : 256;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:bg-gradient-to-br dark:from-gray-900 dark:via-black dark:to-gray-800">
      <Header 
        onMenuClick={handleMenuClick} 
        onNavigate={handlePageChange}
        onLogout={onLogout}
        currentUser={currentUser}
      />
      
      <div className="pt-16">
        <Sidebar 
          currentPage={currentPage} 
          onPageChange={handlePageChange}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          currentUser={currentUser}
          collapsed={!isMobile && sidebarCollapsed}
        />
        
        <div 
          className="pb-8 transition-all duration-300"
          style={!isMobile ? { marginLeft: `${sidebarWidth}px`, width: `calc(100% - ${sidebarWidth}px)` } : { width: '100%' }}
        >
          {children}
        </div>
      </div>
      
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}