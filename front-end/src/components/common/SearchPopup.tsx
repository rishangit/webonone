import { useState, useRef, useEffect } from "react";
import { Search, X, Check } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "../ui/utils";
import { useIsMobile } from "../ui/use-mobile";

export interface SearchEntity {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface SearchPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (page: string, params?: any) => void;
  triggerRef?: React.RefObject<HTMLButtonElement>;
}

const ENTITIES: SearchEntity[] = [
  { value: "all", label: "All Items" },
  { value: "service", label: "Services" },
  { value: "space", label: "Spaces" },
  { value: "product", label: "Products" },
  { value: "appointment", label: "Appointments" },
  { value: "user", label: "Users" },
  { value: "staff", label: "Staff" },
  { value: "company", label: "Companies" },
  { value: "tag", label: "Tags" },
  { value: "sale", label: "Sales" },
];

export const SearchPopup = ({ isOpen, onClose, onNavigate, triggerRef }: SearchPopupProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEntities, setSelectedEntities] = useState<string[]>(["all"]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(256); // Default to expanded width
  const popupRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Calculate sidebar width dynamically
  useEffect(() => {
    if (!isOpen) return;

    const calculateSidebarWidth = () => {
      if (isMobile) {
        setSidebarWidth(0);
        return;
      }

      // Find the sidebar element
      const sidebar = document.querySelector('[class*="fixed"][class*="top-16"][class*="left-0"]') as HTMLElement;
      if (sidebar) {
        const width = sidebar.offsetWidth;
        setSidebarWidth(width || 256); // Fallback to 256px if not found
      } else {
        // Check if sidebar has collapsed class (w-20 = 80px) or expanded (w-64 = 256px)
        const sidebarElement = document.querySelector('[class*="w-64"], [class*="w-20"]') as HTMLElement;
        if (sidebarElement) {
          const classes = sidebarElement.className;
          if (classes.includes('w-20')) {
            setSidebarWidth(80);
          } else if (classes.includes('w-64')) {
            setSidebarWidth(256);
          } else {
            setSidebarWidth(256); // Default
          }
        } else {
          setSidebarWidth(256); // Default
        }
      }
    };

    calculateSidebarWidth();
    
    // Recalculate on window resize
    window.addEventListener('resize', calculateSidebarWidth);
    return () => window.removeEventListener('resize', calculateSidebarWidth);
  }, [isOpen, isMobile]);

  // Detect current page and pre-select entity
  useEffect(() => {
    if (isOpen) {
      const path = location.pathname;
      let currentEntity: string | null = null;

      if (path.includes("/services")) currentEntity = "service";
      else if (path.includes("/spaces")) currentEntity = "space";
      else if (path.includes("/products") || path.includes("/company-products") || path.includes("/system-products")) currentEntity = "product";
      else if (path.includes("/appointments")) currentEntity = "appointment";
      else if (path.includes("/users")) currentEntity = "user";
      else if (path.includes("/staff")) currentEntity = "staff";
      else if (path.includes("/companies")) currentEntity = "company";
      else if (path.includes("/tags")) currentEntity = "tag";
      else if (path.includes("/sales")) currentEntity = "sale";

      if (currentEntity) {
        setSelectedEntities([currentEntity]);
      } else {
        setSelectedEntities(["all"]);
      }
      setSearchQuery("");
    }
  }, [isOpen, location.pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isDropdownOpen]);

  // Close popup when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popupRef.current &&
        !popupRef.current.contains(event.target as Node) &&
        triggerRef?.current &&
        !triggerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen, onClose, triggerRef]);

  const toggleEntity = (entityValue: string) => {
    if (entityValue === "all") {
      setSelectedEntities(["all"]);
    } else {
      setSelectedEntities((prev) => {
        const newSelection = prev.filter((e) => e !== "all");
        if (newSelection.includes(entityValue)) {
          const filtered = newSelection.filter((e) => e !== entityValue);
          return filtered.length === 0 ? ["all"] : filtered;
        } else {
          return [...newSelection, entityValue];
        }
      });
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) return;

    const isAllSelected = selectedEntities.includes("all") || selectedEntities.length === 0;
    const hasMultipleEntities = selectedEntities.length > 1 && !isAllSelected;

    if (isAllSelected || hasMultipleEntities) {
      // Navigate to global search page
      sessionStorage.setItem("searchQuery", searchQuery);
      sessionStorage.setItem("searchType", isAllSelected ? "all" : selectedEntities.join(","));
      sessionStorage.setItem("searchEntities", JSON.stringify(selectedEntities.filter(e => e !== "all")));
      onNavigate?.("search");
      navigate("/system/search");
      onClose();
    } else {
      // Show results in same page for specific entity
      const entity = selectedEntities[0]; // Use first selected entity
      
      // Set search query in sessionStorage for the page to pick up
      sessionStorage.setItem(`searchQuery_${entity}`, searchQuery);
      
      // Navigate to the entity page if not already there
      const currentPath = location.pathname;
      let targetPath = currentPath;

      switch (entity) {
        case "service":
          if (!currentPath.includes("/services")) {
            targetPath = "/system/services";
          }
          break;
        case "space":
          if (!currentPath.includes("/spaces")) {
            targetPath = "/system/spaces";
          }
          break;
        case "product":
          if (!currentPath.includes("/products")) {
            targetPath = "/system/products";
          }
          break;
        case "appointment":
          if (!currentPath.includes("/appointments")) {
            targetPath = "/system/appointments";
          }
          break;
        case "user":
          if (!currentPath.includes("/users")) {
            targetPath = "/system/users";
          }
          break;
        case "staff":
          if (!currentPath.includes("/staff")) {
            targetPath = "/system/staff";
          }
          break;
        case "company":
          if (!currentPath.includes("/companies")) {
            targetPath = "/system/companies";
          }
          break;
        case "tag":
          if (!currentPath.includes("/tags")) {
            targetPath = "/system/tags";
          }
          break;
        case "sale":
          if (!currentPath.includes("/sales")) {
            targetPath = "/system/sales";
          }
          break;
      }

      if (targetPath !== currentPath) {
        navigate(targetPath);
      } else {
        // Trigger search on current page by dispatching a custom event
        window.dispatchEvent(new CustomEvent("headerSearch", { detail: { query: searchQuery, entity } }));
      }

      onClose();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  if (!isOpen) return null;

  const selectedLabels = selectedEntities
    .map((val) => ENTITIES.find((e) => e.value === val)?.label)
    .filter(Boolean);

  return (
    <>
      {/* Backdrop with blur overlay */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[9998] transition-opacity duration-300"
        onClick={onClose}
      />
      {/* Popup - 50% width, centered, with margin from header */}
      <div
        ref={popupRef}
        className="fixed z-[9999] backdrop-blur-xl bg-popover border border-[var(--accent-border)] rounded-xl shadow-2xl transition-all duration-300"
        style={{
          top: '80px', // 64px header + 16px gap
          left: isMobile ? '50%' : `calc(${sidebarWidth}px + 50% - 25vw)`,
          transform: 'translateX(-50%)',
          width: isMobile ? '90%' : '50%',
          maxWidth: '800px',
        }}
      >
        <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-0">
          <div className="flex flex-col gap-4">
            {/* Entity Selector and Search Button Row */}
            <div className="flex items-center gap-3">
              {/* Entity Multi-Select Dropdown */}
              <div className="relative flex-shrink-0" ref={dropdownRef}>
                <Button
                  variant="outline"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="h-10 min-w-[200px] justify-between bg-[var(--glass-bg)] border-[var(--glass-border)] hover:border-[var(--accent-border)]"
                >
                  <span className="text-sm text-muted-foreground truncate">
                    {selectedLabels.length > 0
                      ? selectedLabels.length === 1
                        ? selectedLabels[0]
                        : `${selectedLabels.length} selected`
                      : "Select entities..."}
                  </span>
                  <Search className="w-4 h-4 text-muted-foreground flex-shrink-0 ml-2" />
                </Button>

                {isDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 z-[10000] backdrop-blur-lg bg-popover border border-[var(--accent-border)] rounded-lg shadow-lg max-h-64 overflow-y-auto min-w-[200px]">
                    {ENTITIES.map((entity) => {
                      const isSelected = selectedEntities.includes(entity.value);
                      return (
                        <button
                          key={entity.value}
                          onClick={() => toggleEntity(entity.value)}
                          className={cn(
                            "w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-[var(--accent-bg)] transition-colors",
                            isSelected && "bg-[var(--accent-bg)]"
                          )}
                        >
                          <div
                            className={cn(
                              "w-4 h-4 border rounded flex items-center justify-center flex-shrink-0",
                              isSelected
                                ? "bg-[var(--accent-primary)] border-[var(--accent-primary)]"
                                : "border-muted-foreground"
                            )}
                          >
                            {isSelected && <Check className="w-3 h-3 text-white" />}
                          </div>
                          <span className={cn(isSelected && "text-[var(--accent-text)] font-medium")}>
                            {entity.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Search Button */}
              <Button
                onClick={handleSearch}
                disabled={!searchQuery.trim()}
                className="h-10 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:from-[var(--accent-primary-hover)] hover:to-[var(--accent-primary)] text-[var(--accent-button-text)] whitespace-nowrap flex-shrink-0"
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>

            {/* Full Width Search Input */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 pointer-events-none" />
              <Input
                placeholder="Search across all entities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="pl-11 pr-11 h-12 text-base bg-[var(--input-background)] border-[var(--glass-border)] hover:border-[var(--accent-border)] focus:border-[var(--accent-border)] focus:ring-2 focus:ring-[var(--accent-primary)]/20"
                autoFocus
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 hover:bg-accent/50"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {/* Selected Entities Badges */}
            {selectedEntities.length > 0 && selectedEntities[0] !== "all" && (
              <div className="flex flex-wrap gap-2">
                {selectedEntities.map((entityValue) => {
                  const entity = ENTITIES.find((e) => e.value === entityValue);
                  if (!entity || entity.value === "all") return null;
                  return (
                    <Badge
                      key={entityValue}
                      variant="outline"
                      className="bg-[var(--accent-bg)] text-[var(--accent-text)] border-[var(--accent-border)]"
                    >
                      {entity.label}
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      </div>
    </>
  );
};
