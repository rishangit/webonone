import { Calendar, Users, Clock, BarChart3, FileText, MessageSquare, Settings, CreditCard, Building, UserCheck, MapPin, Package, PackageCheck, DollarSign, ChevronRight, Tag } from "lucide-react";
import { Button } from "../../components/ui/button";
import { useIsMobile } from "../../components/ui/use-mobile";
import { User as UserType, UserRole } from "../../types/user";
import { useState, useEffect, useMemo } from "react";
import { Icon } from "../../components/common/Icon";
import { config } from "../../config/environment";
import { Tooltip, TooltipTrigger, TooltipContent } from "../../components/ui/tooltip";
import { useAppSelector } from "../../store/hooks";

const getNavigationItems = (role: UserRole, selectedEntities?: string[] | null) => {
  const baseItems = [
    { icon: Calendar, label: "Dashboard", id: "dashboard" },
    { icon: Clock, label: "Appointments", id: "appointments", entityType: "appointment" },
  ];

  if (role === UserRole.SYSTEM_ADMIN) {
    return [
      ...baseItems,
      { icon: Users, label: "Users", id: "users" },
      { icon: Building, label: "Companies", id: "companies" },
      { 
        icon: PackageCheck, 
        label: "System Products", 
        id: "system-products",
        hasSubmenu: true,
        submenu: [
          { label: "System Products", id: "system-products" },
          { label: "Product Attributes", id: "system-product-attributes" },
          { label: "Units of Measure", id: "units-of-measure" }
        ]
      },
      { icon: Tag, label: "Tags", id: "tags" },
      { icon: BarChart3, label: "Analytics", id: "analytics" },
      { icon: FileText, label: "Reports", id: "reports" },
      { icon: MessageSquare, label: "Messages", id: "messages" },
      { icon: CreditCard, label: "Billing", id: "billing" },
      { icon: Settings, label: "Settings", id: "settings" },
    ];
  }

  if (role === UserRole.COMPANY_OWNER) {
    const allItems = [
      ...baseItems,
      { icon: UserCheck, label: "Staff", id: "staff", entityType: "staff" },
      { icon: MapPin, label: "Spaces", id: "spaces", entityType: "space" },
      { icon: CreditCard, label: "Services", id: "services", entityType: "service" },
      { icon: Package, label: "Products", id: "products", entityType: "product" },
      { icon: DollarSign, label: "Sales", id: "sales" },
      { icon: Users, label: "Users", id: "users" },
      { icon: BarChart3, label: "Analytics", id: "analytics" },
      { icon: FileText, label: "Reports", id: "reports" },
      { icon: MessageSquare, label: "Messages", id: "messages" },
      { icon: Settings, label: "Settings", id: "settings" },
    ];

    // Filter items based on selectedEntities if provided
    if (selectedEntities && Array.isArray(selectedEntities) && selectedEntities.length > 0) {
      return allItems.filter(item => {
        const itemAny = item as any;
        // Always show items without entityType (dashboard, sales, users, analytics, etc.)
        if (!itemAny.entityType) return true;
        // Show items with entityType only if the entity is selected
        return selectedEntities.includes(itemAny.entityType);
      });
    }

    return allItems;
  }

  if (role === UserRole.STAFF_MEMBER) {
    const allItems = [
      ...baseItems,
      { icon: Users, label: "Customers", id: "users" },
      { icon: CreditCard, label: "Services", id: "services", entityType: "service" },
      { icon: Package, label: "Products", id: "products", entityType: "product" },
      { icon: DollarSign, label: "Sales", id: "sales" },
      { icon: BarChart3, label: "Analytics", id: "analytics" },
      { icon: FileText, label: "Reports", id: "reports" },
      { icon: MessageSquare, label: "Messages", id: "messages" },
      { icon: Settings, label: "Settings", id: "settings" },
    ];

    // Filter items based on selectedEntities if provided
    if (selectedEntities && Array.isArray(selectedEntities) && selectedEntities.length > 0) {
      return allItems.filter(item => {
        const itemAny = item as any;
        // Always show items without entityType
        if (!itemAny.entityType) return true;
        // Show items with entityType only if the entity is selected
        return selectedEntities.includes(itemAny.entityType);
      });
    }

    return allItems;
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
  collapsed?: boolean;
}

export function Sidebar({ currentPage, onPageChange, isOpen, onClose: _onClose, currentUser, collapsed = false }: SidebarProps) {
  const isMobile = useIsMobile();
  const { currentCompany, userCompany } = useAppSelector((state) => state.companies);
  
  // Get company for filtering - prioritize currentCompany, fallback to userCompany
  const company = currentCompany || userCompany;
  const selectedEntities = company?.selectedEntities;
  
  // Filter navigation items based on selected entities for company owners and staff
  const navigationItems = useMemo(() => {
    const role = currentUser?.role ?? UserRole.USER;
    const items = getNavigationItems(role, selectedEntities);
    return items;
  }, [currentUser?.role, selectedEntities]);
  
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

  const sidebarWidth = collapsed ? 'w-20' : 'w-64';
  const isCollapsed = !isMobile && collapsed;

  return (
    <div className={`
      ${isMobile 
        ? `fixed top-16 left-0 bottom-0 z-40 w-64 transform transition-transform duration-300 ease-in-out ${
            isOpen ? 'translate-x-0' : '-translate-x-full'
          }` 
        : `fixed top-16 left-0 bottom-0 z-40 ${sidebarWidth} transition-all duration-300`
      } 
      backdrop-blur-xl bg-sidebar border-r border-sidebar-border flex flex-col overflow-hidden
    `}>
      <div className={`pt-3 ${isMobile ? 'p-2' : 'p-4'} flex-1 overflow-y-auto custom-scrollbar flex flex-col`}>
        {/* Navigation Menu */}
        <nav className="space-y-2 flex-1">
          {navigationItems.map((item, index) => {
            const ItemIcon = item.icon;
            const itemAny = item as any;
            const hasSubmenu = itemAny.hasSubmenu && itemAny.submenu;
            const isActive = currentPage === item.id || (hasSubmenu && itemAny.submenu.some((sub: any) => sub.id === currentPage));
            
            if (hasSubmenu) {
              const submenu = (item as any).submenu;
              const defaultSubmenuId = submenu && submenu.length > 0 ? submenu[0].id : null;
              
              // When collapsed, don't show submenu - just navigate to default item
              if (isCollapsed) {
                const buttonContent = (
                  <Button
                    variant="ghost"
                    className={`w-full justify-center px-0 gap-3 h-11 transition-all duration-200 ${
                      isActive 
                        ? "bg-[var(--accent-bg)] text-[var(--accent-text)] border border-[var(--accent-border)] shadow-lg shadow-[var(--accent-primary)]/10" 
                        : "text-sidebar-foreground hover:bg-[var(--accent-bg)] hover:text-[var(--accent-text)] hover:border hover:border-[var(--accent-border)] hover:shadow-md hover:shadow-[var(--accent-primary)]/20"
                    }`}
                    onClick={() => {
                      if (defaultSubmenuId) {
                        onPageChange(defaultSubmenuId);
                      }
                    }}
                  >
                    <Icon icon={ItemIcon} size="md" />
                  </Button>
                );

                return (
                  <Tooltip key={index}>
                    <TooltipTrigger asChild>
                      {buttonContent}
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      {item.label}
                    </TooltipContent>
                  </Tooltip>
                );
              }
              
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
            
            const buttonContent = (
              <Button
                key={index}
                variant="ghost"
                className={`w-full ${isCollapsed ? 'justify-center px-0' : 'justify-start'} gap-3 h-11 transition-all duration-200 ${
                  isActive 
                    ? "bg-[var(--accent-bg)] text-[var(--accent-text)] border border-[var(--accent-border)] shadow-lg shadow-[var(--accent-primary)]/10" 
                    : "text-sidebar-foreground hover:bg-[var(--accent-bg)] hover:text-[var(--accent-text)] hover:border hover:border-[var(--accent-border)] hover:shadow-md hover:shadow-[var(--accent-primary)]/20"
                }`}
                onClick={() => onPageChange(item.id)}
              >
                <Icon icon={ItemIcon} size="md" />
                {!isCollapsed && item.label}
              </Button>
            );

            if (isCollapsed) {
              return (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    {buttonContent}
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {item.label}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return buttonContent;
          })}
        </nav>

        {/* App Version - Always at bottom */}
        <div className={`mt-auto py-2 ${isCollapsed ? 'px-2' : ''}`}>
          <p className={`text-xs text-muted-foreground ${isCollapsed ? 'text-center' : 'text-center'}`}>
            {isCollapsed ? `v${config.appVersion}` : `Version ${config.appVersion}`}
          </p>
        </div>
      </div>
    </div>
  );
}