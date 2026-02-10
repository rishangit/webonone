import { useState, useEffect, useRef, useCallback } from "react";
import { SearchInput } from "../../../components/common/SearchInput";
import { Users } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { fetchUsersRequest } from "../../../store/slices/usersSlice";
import { User, UserRole, UserRoleNames } from "../../../types/user";
import { UserForSelection } from "./types";
import { UserCard } from "./UserCard";
import { UserSkeleton } from "./UserSkeleton";

interface UserSearchSectionProps {
  selectedUser: UserForSelection | null;
  onSelectUser: (user: UserForSelection) => void;
}

export const UserSearchSection = ({ selectedUser, onSelectUser }: UserSearchSectionProps) => {
  const dispatch = useAppDispatch();
  const { users: reduxUsers, loading: usersLoading, pagination } = useAppSelector((state) => state.users);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [allLoadedUsers, setAllLoadedUsers] = useState<UserForSelection[]>([]);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef<boolean>(false);
  const lastFetchedPageRef = useRef<number>(0);

  // Handle debounced search query change
  const handleDebouncedSearchChange = useCallback((value: string) => {
    setDebouncedSearchQuery(value);
    setCurrentPage(1);
    setAllLoadedUsers([]);
    setHasMore(true);
    lastFetchedPageRef.current = 0;
  }, []);

  // Transform Redux users to UserForSelection format
  const transformUsers = useCallback((users: User[]): UserForSelection[] => {
    return users.map((user: User) => {
      let roleName = "User";
      if (user.roles && user.roles.length > 0) {
        const nonUserRole = user.roles.find(r => r.role !== UserRole.USER);
        const roleToUse = nonUserRole || user.roles[0];
        roleName = UserRoleNames[roleToUse.role] || "User";
      } else if (user.role !== null && user.role !== undefined) {
        roleName = UserRoleNames[user.role as UserRole] || "User";
      }

      return {
        id: user.id,
        name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar,
        role: roleName,
        status: user.isActive !== false ? 'active' : 'inactive',
        location: user.address,
        address: user.address,
        createdAt: user.createdAt,
      };
    });
  }, []);

  // Fetch users when page or search changes
  useEffect(() => {
    if (usersLoading) return;
    if (lastFetchedPageRef.current === currentPage) return;

    const offset = (currentPage - 1) * itemsPerPage;
    const filters: any = {
      limit: itemsPerPage,
      offset,
      page: currentPage,
    };

    if (debouncedSearchQuery && debouncedSearchQuery.trim()) {
      filters.search = debouncedSearchQuery.trim();
    }

    if (currentPage === 1) {
      setLoadingMore(false);
      setAllLoadedUsers([]);
    } else {
      setLoadingMore(true);
    }

    lastFetchedPageRef.current = currentPage;
    dispatch(fetchUsersRequest(filters));
  }, [dispatch, currentPage, itemsPerPage, debouncedSearchQuery, usersLoading]);

  // Process data when it arrives - CRITICAL: This should NOT affect selectedUser
  useEffect(() => {
    if (usersLoading) return;
    if (reduxUsers.length === 0) {
      if (currentPage === 1) {
        setAllLoadedUsers([]);
        setHasMore(false);
      }
      setLoadingMore(false);
      isScrollingRef.current = false;
      return;
    }

    const transformedUsers = transformUsers(reduxUsers);
    
    if (currentPage === 1) {
      // Page 1: Replace all users
      setAllLoadedUsers(transformedUsers);
    } else {
      // Page > 1: Append new users (preserve existing, including selected user)
      setAllLoadedUsers(prev => {
        const existingIds = new Set(prev.map(u => u.id));
        const newUsers = transformedUsers.filter(u => !existingIds.has(u.id));
        // CRITICAL: Preserve the selected user if it exists in prev
        // If selected user is in new data, update it; otherwise keep the old one
        const updatedUsers = [...prev, ...newUsers];
        
        // If selected user exists in new data, update its reference
        if (selectedUser) {
          const selectedUserInNewData = transformedUsers.find(u => u.id === selectedUser.id);
          if (selectedUserInNewData) {
            // Replace the old selected user object with the new one
            const index = updatedUsers.findIndex(u => u.id === selectedUser.id);
            if (index !== -1) {
              updatedUsers[index] = selectedUserInNewData;
            }
          }
        }
        
        return updatedUsers;
      });
    }

    if (pagination) {
      const totalPages = pagination.totalPages || Math.ceil((pagination.total || 0) / itemsPerPage);
      setHasMore(currentPage < totalPages);
    } else {
      setHasMore(reduxUsers.length >= itemsPerPage);
    }

    setLoadingMore(false);
    isScrollingRef.current = false;
  }, [usersLoading, reduxUsers, currentPage, pagination, itemsPerPage, transformUsers, selectedUser?.id]); // Added selectedUser?.id to update selected user reference

  // Handle scroll to load more
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    if (loadingMore || !hasMore || usersLoading || isScrollingRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - (scrollTop + clientHeight);
    
    if (distanceFromBottom < 150) {
      isScrollingRef.current = true;
      setLoadingMore(true);
      setCurrentPage(prev => prev + 1);
    }
  }, [loadingMore, hasMore, usersLoading]);

  // Attach scroll listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      let ticking = false;
      
      const throttledHandleScroll = () => {
        if (!ticking) {
          window.requestAnimationFrame(() => {
            handleScroll();
            ticking = false;
          });
          ticking = true;
        }
      };
      
      container.addEventListener('scroll', throttledHandleScroll, { passive: true });
      
      return () => {
        container.removeEventListener('scroll', throttledHandleScroll);
      };
    }
  }, [handleScroll]);

  // Reset when component unmounts or search changes
  useEffect(() => {
    return () => {
      setCurrentPage(1);
      setAllLoadedUsers([]);
      setHasMore(true);
      isScrollingRef.current = false;
      lastFetchedPageRef.current = 0;
    };
  }, []);

  const displayUsers = allLoadedUsers.length > 0 ? allLoadedUsers : transformUsers(reduxUsers);

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden">
      {/* Search Bar */}
      <div className="flex-shrink-0 mb-4">
        <SearchInput
          placeholder="Search users by name, email, phone, role, or location..."
          value={searchQuery}
          onChange={setSearchQuery}
          onDebouncedChange={handleDebouncedSearchChange}
          debounceDelay={300}
          className="w-full"
        />
      </div>

      {/* Users List - Takes remaining height for scrolling */}
      <div 
        ref={scrollContainerRef}
        className="custom-scrollbar space-y-2 p-2 flex-1 min-h-0 overflow-y-auto overflow-x-hidden"
      >
        {usersLoading && currentPage === 1 && allLoadedUsers.length === 0 && reduxUsers.length === 0 ? (
          <>
            <UserSkeleton count={5} />
            <div className="text-center py-4 text-muted-foreground text-xs">
              <p>Loading users... This may take a moment</p>
            </div>
          </>
        ) : !usersLoading && allLoadedUsers.length === 0 && reduxUsers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No users found matching your search.</p>
          </div>
        ) : displayUsers.length > 0 ? (
          <>
            {displayUsers.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                isSelected={selectedUser?.id === user.id}
                onSelect={onSelectUser}
              />
            ))}
            {loadingMore && <UserSkeleton count={3} />}
            {!hasMore && allLoadedUsers.length > 0 && !loadingMore && (
              <div className="text-center py-4 text-muted-foreground text-xs">
                <p>No more users to load</p>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};
