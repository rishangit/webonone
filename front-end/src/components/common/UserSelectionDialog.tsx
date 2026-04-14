import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Check, User } from "lucide-react";
import { CustomDialog } from "../ui/custom-dialog";
import { User as UserType } from "@/types/user";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { formatAvatarUrl } from "@/utils";
import { cn } from "../ui/utils";
import { SearchInput } from "./SearchInput";
import { usersService } from "@/services/users";

interface UserSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string | null;
  onChange: (userId: string | null) => void;
  users: UserType[];
  title?: string;
  description?: string;
  placeholder?: string;
  error?: boolean;
}

export const UserSelectionDialog = ({
  open,
  onOpenChange,
  value,
  onChange,
  users,
  title = "Select Customer",
  description = "Choose a customer from the list",
  placeholder = "Select a customer",
  error = false,
}: UserSelectionDialogProps) => {
  const ITEMS_PER_PAGE = 20;
  const [tempValue, setTempValue] = useState<string | null>(value);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [pagedUsers, setPagedUsers] = useState<UserType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isFetchingRef = useRef(false);

  useEffect(() => {
    if (open) {
      setTempValue(value);
      setSearchTerm("");
      setDebouncedSearchTerm("");
      setPagedUsers([]);
      setCurrentPage(1);
      setHasMore(true);
      setIsInitialLoading(false);
      setLoadingMore(false);
      isFetchingRef.current = false;
    }
  }, [open, value]);

  const fetchUsersPage = useCallback(async (page: number, reset = false) => {
    if (isFetchingRef.current) return;

    try {
      isFetchingRef.current = true;
      if (page === 1) {
        setIsInitialLoading(true);
      } else {
        setLoadingMore(true);
      }

      const response = await usersService.getAllUsers({
        limit: ITEMS_PER_PAGE,
        offset: (page - 1) * ITEMS_PER_PAGE,
        page,
        search: debouncedSearchTerm.trim() || undefined,
        isActive: true,
      });

      const incomingUsers = response.users || [];
      setCurrentPage(page);

      setPagedUsers((prev) => {
        if (reset || page === 1) return incomingUsers;
        const existingIds = new Set(prev.map((u) => String(u.id)));
        const deduped = incomingUsers.filter((u) => !existingIds.has(String(u.id)));
        return [...prev, ...deduped];
      });

      const totalPages =
        response.pagination?.totalPages ||
        Math.ceil((response.pagination?.total || 0) / ITEMS_PER_PAGE) ||
        1;
      setHasMore(page < totalPages);
    } catch (error) {
      // Fallback to provided users prop if API paging fails
      if (page === 1) {
        setPagedUsers(users || []);
      }
      setHasMore(false);
    } finally {
      setIsInitialLoading(false);
      setLoadingMore(false);
      isFetchingRef.current = false;
    }
  }, [ITEMS_PER_PAGE, debouncedSearchTerm, users]);

  useEffect(() => {
    if (!open) return;
    fetchUsersPage(1, true);
  }, [open, debouncedSearchTerm, fetchUsersPage]);

  const sourceUsers = pagedUsers.length > 0 ? pagedUsers : users;

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return sourceUsers;

    return sourceUsers.filter((user) => {
      const firstName = (user.firstName || "").toLowerCase();
      const lastName = (user.lastName || "").toLowerCase();
      const email = (user.email || "").toLowerCase();
      const fullName = `${firstName} ${lastName}`.trim();
      return (
        fullName.includes(query) ||
        firstName.includes(query) ||
        lastName.includes(query) ||
        email.includes(query)
      );
    });
  }, [sourceUsers, searchTerm]);

  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container || !hasMore || loadingMore || isFetchingRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);

    if (distanceFromBottom < 120) {
      fetchUsersPage(currentPage + 1);
    }
  }, [hasMore, loadingMore, fetchUsersPage, currentPage]);

  const getDisplayName = (user: UserType) => {
    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    return fullName || user.email || "Unknown User";
  };

  const getInitials = (user: UserType) => {
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) return firstName[0].toUpperCase();
    if (user.email) return user.email[0].toUpperCase();
    return "U";
  };

  const handleSelect = (userId: string) => {
    setTempValue(userId);
  };

  const handleConfirm = () => {
    onChange(tempValue);
    onOpenChange(false);
  };

  return (
    <CustomDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      icon={<User className="w-5 h-5" />}
      sizeWidth="small"
      sizeHeight="large"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            size="default"
            onClick={() => onOpenChange(false)}
            className="h-10 px-4 border-[var(--glass-border)] text-foreground hover:bg-accent"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="accent"
            size="default"
            onClick={handleConfirm}
            disabled={!tempValue}
            className="h-10 px-4"
          >
            Select User
          </Button>
        </>
      }
    >
      <div className="space-y-4 h-full flex flex-col">
        <div className="relative">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            onDebouncedChange={setDebouncedSearchTerm}
            debounceDelay={350}
            placeholder={placeholder || "Search users..."}
            className={cn(
              "bg-[var(--input-background)] border-[var(--glass-border)] text-foreground",
              error && "border-red-500 focus-visible:ring-red-500"
            )}
          />
        </div>

        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 min-h-0 overflow-y-auto custom-scrollbar border border-[var(--glass-border)] rounded-md bg-[var(--glass-bg)]"
        >
          {isInitialLoading ? (
            <div className="p-4 text-sm text-center text-muted-foreground">
              Loading users...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-4 text-sm text-center text-muted-foreground">
              {searchTerm ? "No users found for this search." : "No users available."}
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredUsers.map((user) => {
                const isSelected = String(user.id) === String(tempValue);
                return (
                  <button
                    key={String(user.id)}
                    type="button"
                    onClick={() => handleSelect(String(user.id))}
                    className={cn(
                      "w-full text-left flex items-center gap-3 p-2 rounded-md border transition-colors",
                      isSelected
                        ? "bg-[var(--accent-bg)] border-[var(--accent-border)]"
                        : "bg-transparent border-transparent hover:bg-[var(--accent-bg)]/60"
                    )}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={formatAvatarUrl(user.avatar, user.firstName, user.lastName)}
                        alt={getDisplayName(user)}
                      />
                      <AvatarFallback className="text-xs">
                        {getInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{getDisplayName(user)}</p>
                      {user.email && (
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      )}
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-[var(--accent-text)] shrink-0" />}
                  </button>
                );
              })}
              {loadingMore && (
                <div className="py-2 text-center text-xs text-muted-foreground">
                  Loading more users...
                </div>
              )}
              {!hasMore && filteredUsers.length >= ITEMS_PER_PAGE && !loadingMore && (
                <div className="py-2 text-center text-xs text-muted-foreground">
                  No more users to load
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </CustomDialog>
  );
};
