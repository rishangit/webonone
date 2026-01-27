import { useState, useEffect, useRef } from "react";
import { Search, X, Check, ChevronDown } from "lucide-react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { cn } from "../ui/utils";
import { formatAvatarUrl } from "../../utils";
import { User } from "../../types/user";

interface UserSelectorProps {
  value: string | null;
  onChange: (userId: string | null) => void;
  users: User[];
  disabled?: boolean;
  className?: string;
  placeholder?: string;
  allowClear?: boolean;
  error?: boolean;
}

export const UserSelector = ({
  value,
  onChange,
  users,
  disabled = false,
  className = "",
  placeholder = "Select a user",
  allowClear = true,
  error = false,
}: UserSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [popoverWidth, setPopoverWidth] = useState<number | undefined>(undefined);

  // Reset search when popover closes
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
    }
  }, [isOpen]);

  // Focus search input when popover opens and set width
  useEffect(() => {
    if (isOpen) {
      // Set popover width to match trigger width
      if (triggerRef.current) {
        const width = triggerRef.current.offsetWidth;
        setPopoverWidth(width);
      }
      // Focus search input
      if (searchInputRef.current) {
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 100);
      }
    }
  }, [isOpen]);

  // Filter users based on search term
  const filteredUsers = users.filter((user) => {
    const searchLower = searchTerm.toLowerCase();
    const firstName = (user.firstName || "").toLowerCase();
    const lastName = (user.lastName || "").toLowerCase();
    const email = (user.email || "").toLowerCase();
    const fullName = `${firstName} ${lastName}`.trim();
    
    return (
      fullName.includes(searchLower) ||
      email.includes(searchLower) ||
      firstName.includes(searchLower) ||
      lastName.includes(searchLower)
    );
  });

  const selectedUser = users.find((u) => String(u.id) === String(value));

  const handleSelect = (user: User) => {
    onChange(String(user.id));
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange(null);
  };

  const getDisplayName = (user: User) => {
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || user.email || "Unknown User";
  };

  const getInitials = (user: User) => {
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName[0].toUpperCase();
    }
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  return (
    <div className={cn("w-full", className)}>
      <PopoverPrimitive.Root open={isOpen} onOpenChange={setIsOpen}>
        <PopoverPrimitive.Trigger asChild>
          <Button
            ref={triggerRef}
            variant="outline"
            role="combobox"
            disabled={disabled}
            className={cn(
              "bg-[var(--glass-bg)] w-full justify-between bg-white dark:bg-[#1a1a1a] border-gray-200 dark:border-gray-700 text-foreground hover:bg-gray-50 dark:hover:bg-gray-900",
              error && "border-red-500 focus:border-red-500 focus:ring-red-500"
            )}
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {selectedUser ? (
                <>
                  <Avatar className="h-6 w-6 shrink-0">
                    <AvatarImage
                      src={formatAvatarUrl(selectedUser.avatar, selectedUser.firstName, selectedUser.lastName)}
                      alt={getDisplayName(selectedUser)}
                    />
                    <AvatarFallback className="text-xs">
                      {getInitials(selectedUser)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col items-start min-w-0 flex-1">
                    <span className="text-sm font-medium truncate w-full">
                      {getDisplayName(selectedUser)}
                    </span>
                    {selectedUser.email && (
                      <span className="text-xs text-muted-foreground truncate w-full">
                        {selectedUser.email}
                      </span>
                    )}
                  </div>
                </>
              ) : (
                <span className="text-muted-foreground">{placeholder}</span>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              {selectedUser && allowClear && (
                <X
                  className="h-4 w-4 opacity-50 hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClear();
                  }}
                />
              )}
              <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </div>
          </Button>
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            className="bg-[var(--glass-bg)] p-0 !bg-white !dark:bg-[#1a1a1a] border-2 border-primary shadow-2xl z-[100000] rounded-md overflow-hidden !opacity-100"
            style={{ width: popoverWidth, minWidth: '240px', zIndex: 100000 }}
            align="start"
            sideOffset={4}
          >
            <div className="bg-[var(--glass-bg)] flex flex-col max-h-[450px] !bg-white !dark:bg-[#1a1a1a] !opacity-100">
              {/* Search Input */}
              <div className="p-3 border-b border-gray-200 dark:border-gray-700 shrink-0 !bg-white !dark:bg-[#1a1a1a]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-foreground placeholder:text-muted-foreground !opacity-100"
                  />
                </div>
              </div>

              {/* User List */}
              <div 
                className="overflow-y-auto overscroll-contain custom-scrollbar relative max-h-[300px] !bg-white !dark:bg-[#1a1a1a] !opacity-100"
                onWheel={(e) => e.stopPropagation()}
                style={{ 
                  scrollbarWidth: 'thin',
                  scrollbarColor: 'var(--accent-border) transparent',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                {filteredUsers.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    {searchTerm ? "No users found" : "No users available"}
                  </div>
                ) : (
                  <div className="p-1">
                    {filteredUsers.map((user) => {
                      const isSelected = String(user.id) === String(value);
                      return (
                        <div
                          key={user.id}
                          onClick={() => handleSelect(user)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors !opacity-100",
                          "hover:bg-[var(--accent-bg)] hover:text-[var(--accent-text)]",
                          isSelected && "bg-[var(--accent-bg)] border border-[var(--accent-border)] text-[var(--accent-text)]"
                        )}
                        >
                          <Avatar className="h-8 w-8 shrink-0">
                            <AvatarImage
                              src={formatAvatarUrl(user.avatar, user.firstName, user.lastName)}
                              alt={getDisplayName(user)}
                            />
                            <AvatarFallback className="text-xs">
                              {getInitials(user)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-sm font-medium text-foreground truncate">
                              {getDisplayName(user)}
                            </span>
                            {user.email && (
                              <span className="text-xs text-muted-foreground truncate">
                                {user.email}
                              </span>
                            )}
                          </div>
                          {isSelected && (
                            <Check className="h-4 w-4 text-[var(--accent-primary)] shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    </div>
  );
};
