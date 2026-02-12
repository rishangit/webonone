import { Calendar, Users, Clock, BarChart3, FileText, MessageSquare, Settings, CreditCard, Building, UserCheck, MapPin, Package, PackageCheck, DollarSign, ChevronRight, Tag } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useIsMobile } from "../../components/ui/use-mobile";
import { User as UserType, UserRole } from "../../types/user";
import { useState, useEffect } from "react";
import { Icon } from "../../components/common/Icon";
import { config } from "../../config/environment";

const getNavigationItems = (role: UserRole) => {
  const baseItems = [
    { icon: Calendar, label: "Dashboard", id: "dashboard" },
    { icon: Clock, label: "Appointments", id: "appointments" },
  ];

  if (role === UserRole.SYSTEM_ADMIN) {
    return [
      ...baseItems,
      { icon: Users, label: "Users", id: "users" },
      { icon: Building, label: "Companies", id: "companies" },
      { icon: PackageCheck, label: "System Products", id: "system-products" },
      { icon: Tag, label: "Tags", id: "tags" },
      { icon: BarChart3, label: "Analytics", id: "analytics" },
      { icon: FileText, label: "Reports", id: "reports" },
      { icon: MessageSquare, label: "Messages", id: "messages" },
      { icon: CreditCard, label: "Billing", id: "billing" },
      { icon: Settings, label: "Settings", id: "settings" },
    ];
  }

  if (role === UserRole.COMPANY_OWNER) {
    return [
      ...baseItems,
      { icon: UserCheck, label: "Staff", id: "staff" },
      { icon: MapPin, label: "Spaces", id: "spaces" },
      { icon: CreditCard, label: "Services", id: "services" },
      { icon: Package, label: "Products", id: "products" },
      { icon: DollarSign, label: "Sales", id: "sales" },
      { icon: Users, label: "Users", id: "users" },
      { icon: BarChart3, label: "Analytics", id: "analytics" },
      { icon: FileText, label: "Reports", id: "reports" },
      { icon: MessageSquare, label: "Messages", id: "messages" },
      { icon: Settings, label: "Settings", id: "settings" },
    ];
  }

  if (role === UserRole.STAFF_MEMBER) {
    return [
      ...baseItems,
      { icon: Users, label: "Customers", id: "users" },
      { icon: CreditCard, label: "Services", id: "services" },
      { icon: Package, label: "Products", id: "products" },
      { icon: DollarSign, label: "Sales", id: "sales" },
      { icon: BarChart3, label: "Analytics", id: "analytics" },
      { icon: FileText, label: "Reports", id: "reports" },
      { icon: MessageSquare, label: "Messages", id: "messages" },
      { icon: Settings, label: "Settings", id: "settings" },
    ];
  }

  // For regular users
  return [
    { icon: Calendar, label: "Dashboard", id: "dashboard" },
    { icon: Clock, label: "My Appointments", id: "my-appointments" },
    { icon: Package, label: "Products", id: "products" },
    { icon: BarChart3, label: "Analytics", id: "analytics" },
    { icon: FileText, label: "Reports", id: "reports" },
    { icon: MessageSquare, label: "Messages", id: "messages" },
    { icon: Settings, label: "Settings", id: "settings" },
  ];
};

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserType | null;
}

export function Sidebar({ currentPage, onPageChange, isOpen, onClose, currentUser }: SidebarProps) {
  const isMobile = useIsMobile();
  const navigationItems = getNavigationItems(currentUser?.role ?? UserRole.USER);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  // Auto-open submenu if current page is a submenu item
  useEffect(() => {
    const itemWithSubmenu = navigationItems.find(item => {
      const itemAny = item as any;
      const hasSubmenu = itemAny.hasSubmenu && itemAny.submenu;
      if (hasSubmenu) {
        const submenu = itemAny.submenu as Array<{ label: string; id: string }>;
        return submenu.some((subItem: { label: string; id: string }) => subItem.id === currentPage);
      }
      return false;
    });
    
    if (itemWithSubmenu && openSubmenu !== itemWithSubmenu.id) {
      setOpenSubmenu(itemWithSubmenu.id);
    }
  }, [currentPage, navigationItems, openSubmenu]);

  return (
    <div className={`
      ${isMobile 
        ? `fixed top-16 left-0 bottom-0 z-40 w-64 transform transition-transform duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }` 
        : 'fixed top-16 left-0 bottom-0 w-64 z-40'
      } 
      backdrop-blur-xl bg-sidebar border-r border-sidebar-border flex flex-col overflow-hidden
    `}>
      <div className={`pt-3 ${isMobile ? 'p-2' : 'p-6'} flex-1 overflow-y-auto custom-scrollbar`}>
        {/* Navigation Menu */}
        <nav className="space-y-2">
          {navigationItems.map((item, index) => {
            const ItemIcon = item.icon;
            const itemAny = item as any;
            const hasSubmenu = itemAny.hasSubmenu && itemAny.submenu;
            const isActive = currentPage === item.id || (hasSubmenu && itemAny.submenu.some((sub: any) => sub.id === currentPage));
            
            if (hasSubmenu) {
              const submenu = (item as any).submenu;
              const defaultSubmenuId = submenu && submenu.length > 0 ? submenu[0].id : null;
              
              return (
                <div key={index} className="relative">
                  <Button
                    variant="ghost"
                    className={`w-full justify-between gap-3 h-11 transition-all duration-200 ${
                      isActive 
                        ? "bg-[var(--accent-bg)] text-[var(--accent-text)] border border-[var(--accent-border)] shadow-lg shadow-[var(--accent-primary)]/10" 
                        : "text-sidebar-foreground hover:bg-[var(--accent-bg)] hover:text-[var(--accent-text)] hover:border hover:border-[var(--accent-border)] hover:shadow-md hover:shadow-[var(--accent-primary)]/20"
                    }`}
                    onClick={() => {
                      // If submenu is closed, open it and navigate to default (first) submenu item
                      if (openSubmenu !== item.id) {
                        setOpenSubmenu(item.id);
                        if (defaultSubmenuId && currentPage !== defaultSubmenuId) {
                          onPageChange(defaultSubmenuId);
                        }
                      } else {
                        // If submenu is open, just close it
                        setOpenSubmenu(null);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Icon icon={ItemIcon} size="md" />
                      {item.label}
                    </div>
                    <Icon icon={ChevronRight} size="sm" className={`transition-transform ${openSubmenu === item.id ? 'rotate-90' : ''}`} />
                  </Button>
                  {openSubmenu === item.id && (
                    <div className="ml-4 mt-1 space-y-1 border-l-2 border-[var(--accent-border)] pl-4">
                      {submenu.map((subItem: any, subIndex: number) => {
                        const isSubActive = currentPage === subItem.id;
                        return (
                          <Button
                            key={subIndex}
                            variant="ghost"
                            className={`w-full justify-start gap-3 h-9 text-sm transition-all duration-200 ${
                              isSubActive 
                                ? "bg-[var(--accent-bg)] text-[var(--accent-text)] border border-[var(--accent-border)] shadow-md" 
                                : "text-sidebar-foreground hover:bg-[var(--accent-bg)] hover:text-[var(--accent-text)]"
                            }`}
                            onClick={() => {
                              onPageChange(subItem.id);
                              if (isMobile) setOpenSubmenu(null);
                            }}
                          >
                            {subItem.label}
                          </Button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }
            
            return (
              <Button
                key={index}
                variant="ghost"
                className={`w-full justify-start gap-3 h-11 transition-all duration-200 ${
                  isActive 
                    ? "bg-[var(--accent-bg)] text-[var(--accent-text)] border border-[var(--accent-border)] shadow-lg shadow-[var(--accent-primary)]/10" 
                    : "text-sidebar-foreground hover:bg-[var(--accent-bg)] hover:text-[var(--accent-text)] hover:border hover:border-[var(--accent-border)] hover:shadow-md hover:shadow-[var(--accent-primary)]/20"
                }`}
                onClick={() => onPageChange(item.id)}
              >
                <Icon icon={ItemIcon} size="md" />
                {item.label}
              </Button>
            );
          })}
        </nav>

        {/* Quick Stats Card */}
        <div className="mt-8 p-4 rounded-xl bg-sidebar-accent backdrop-blur-sm border border-sidebar-border">
          <h3 className="font-medium text-sidebar-foreground mb-3">Today's Stats</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Appointments</span>
              <span className="font-medium text-[var(--accent-text)]">12</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Completed</span>
              <span className="font-medium text-green-400">8</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Pending</span>
              <span className="font-medium text-[var(--accent-text)]">4</span>
            </div>
          </div>
        </div>

        {/* App Version */}
        <div className={`mt-8 py-2`}>
          <p className="text-xs text-muted-foreground text-center">
            Version {config.appVersion}
          </p>
        </div>
      </div>
    </div>
  );
}