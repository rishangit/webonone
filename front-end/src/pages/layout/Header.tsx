import { useState, useRef, useEffect } from "react";
import { Menu, Search, Bell, User, Settings, X } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { User as UserType } from "../../types/user";
import { formatAvatarUrl } from "../../utils";
import { UserRoleBadge } from "../../components/UserRoleBadge";

interface HeaderProps {
  onMenuClick: () => void;
  onNavigate?: (page: string) => void;
  onLogout?: () => void;
  currentUser?: UserType | null;
}

export function Header({ onMenuClick, onNavigate, onLogout, currentUser }: HeaderProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Mock function to get unread notification count - in real app this would come from a service
  const getUnreadNotificationCount = () => {
    // This would typically come from a notification service or context
    return 3;
  };

  const unreadCount = getUnreadNotificationCount();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      // Store search query in sessionStorage to be picked up by SearchPage
      sessionStorage.setItem("searchQuery", searchQuery.trim());
      onNavigate?.("search");
      // Clear the input after navigation
      setSearchQuery("");
    }
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Close mobile search on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showMobileSearch) {
        setShowMobileSearch(false);
        setSearchQuery("");
      }
    };

    if (showMobileSearch) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [showMobileSearch]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  
  return (
    <header className="h-16 backdrop-blur-xl bg-card border-b border-[var(--accent-border)] fixed top-0 left-0 right-0 z-50">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        {/* Left side - Mobile menu + Logo */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={onMenuClick}
            className="hover:bg-sidebar-accent text-card-foreground hover:text-card-foreground"
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-primary-hover)] flex items-center justify-center shadow-lg shadow-[var(--accent-primary)]/25">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="hidden sm:block font-semibold text-card-foreground">AppointmentPro</span>
          </div>
        </div>

        {/* Center - Search (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search anything... (Press Enter)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              className="pl-10 pr-10 bg-input-background border-border text-card-foreground placeholder-muted-foreground focus:border-[var(--accent-border)] focus:ring-[var(--accent-primary)]/20 transition-all duration-200"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 hover:bg-accent/50"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Right side - Search icon (mobile) + Notifications + Profile */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden hover:bg-sidebar-accent text-card-foreground hover:text-card-foreground transition-all duration-200"
            onClick={() => setShowMobileSearch(true)}
          >
            <Search className="w-5 h-5" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-sidebar-accent text-card-foreground hover:text-card-foreground transition-all duration-200"
            onClick={() => onNavigate?.("notifications")}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:from-[var(--accent-primary-hover)] hover:to-[var(--accent-primary)] text-[var(--accent-button-text)] text-xs transition-all duration-200 animate-pulse">
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </Button>

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <Button
              variant="ghost" 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="relative h-8 w-8 rounded-full hover:bg-sidebar-accent focus:bg-sidebar-accent focus:ring-2 focus:ring-[var(--accent-primary)]/20"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage 
                  src={formatAvatarUrl(currentUser?.avatar, currentUser?.firstName, currentUser?.lastName)} 
                  alt="Profile"
                />
                <AvatarFallback className="bg-[var(--accent-primary)] text-white">
                  {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('') : 'U'}
                </AvatarFallback>
              </Avatar>
            </Button>
            
            {/* Matte Glass Dropdown */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 z-[9999] backdrop-blur-lg bg-popover border border-[var(--accent-border)] rounded-xl shadow-2xl overflow-hidden">
                
                {/* User Info Section */}
                <div className="p-4 border-b border-border bg-popover">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage 
                        src={formatAvatarUrl(currentUser?.avatar, currentUser?.firstName, currentUser?.lastName)} 
                        alt="Profile"
                      />
                      <AvatarFallback className="bg-[var(--accent-primary)] text-white">
                        {currentUser?.name ? currentUser.name.split(' ').map(n => n[0]).join('') : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-popover-foreground truncate">
                        {currentUser?.name || 'User Name'}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {currentUser?.email || 'user@example.com'}
                      </p>
                      <div className="mt-1">
                        <UserRoleBadge 
                          role={currentUser?.role} 
                          showIcon={true}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="p-2 space-y-1 bg-popover">
                  <button
                    onClick={() => {
                      onNavigate?.('profile');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-popover-foreground rounded-lg hover:bg-[var(--accent-bg)] border border-transparent hover:border-[var(--accent-border)] transition-all duration-200 group"
                  >
                    <User className="w-4 h-4 text-muted-foreground group-hover:text-[var(--accent-text)] transition-colors" />
                    <span>Profile Settings</span>
                  </button>
                  
                  <button
                    onClick={() => {
                      onNavigate?.('settings');
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-popover-foreground rounded-lg hover:bg-[var(--accent-bg)] border border-transparent hover:border-[var(--accent-border)] transition-all duration-200 group"
                  >
                    <Settings className="w-4 h-4 text-muted-foreground group-hover:text-[var(--accent-text)] transition-colors" />
                    <span>Application Settings</span>
                  </button>
                  
                  {/* Clean separator */}
                  <div className="my-2 h-px bg-border"></div>
                  
                  <button
                    onClick={() => {
                      onLogout?.();
                      setIsDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 dark:text-red-400 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all duration-200"
                  >
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {showMobileSearch && (
        <div className="fixed inset-0 z-60 bg-background/95 backdrop-blur-xl md:hidden">
          <div className="flex items-center gap-3 p-4 border-b border-[var(--accent-border)]">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                setShowMobileSearch(false);
                setSearchQuery("");
              }}
              className="shrink-0"
            >
              <X className="w-5 h-5" />
            </Button>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                autoFocus
                placeholder="Search anything..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleSearch();
                    setShowMobileSearch(false);
                  }
                }}
                className="pl-10 pr-10 bg-input-background border-border text-card-foreground placeholder-muted-foreground focus:border-[var(--accent-border)] focus:ring-[var(--accent-primary)]/20"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 hover:bg-accent/50"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <Button
              onClick={() => {
                handleSearch();
                setShowMobileSearch(false);
              }}
              disabled={!searchQuery.trim()}
              className="shrink-0 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:from-[var(--accent-primary-hover)] hover:to-[var(--accent-primary)] text-[var(--accent-button-text)]"
            >
              Search
            </Button>
          </div>
          
          {/* Search Suggestions (Optional) */}
          <div className="p-4 space-y-3">
            <p className="text-sm text-muted-foreground">Quick searches:</p>
            <div className="flex flex-wrap gap-2">
              {['appointments', 'users', 'services', 'products', 'companies'].map((term) => (
                <Button
                  key={term}
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery(term);
                    sessionStorage.setItem("searchQuery", term);
                    onNavigate?.("search");
                    setShowMobileSearch(false);
                  }}
                  className="bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)]"
                >
                  {term}
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}