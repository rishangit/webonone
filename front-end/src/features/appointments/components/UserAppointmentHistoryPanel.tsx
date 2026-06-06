import { History, Mail, Phone, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/common/EmptyState";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  CARD_LIST_AVATAR_CLASS,
  CARD_LIST_AVATAR_FALLBACK_CLASS,
} from "@/components/ui/avatar";
import { formatAvatarUrl } from "@/shared/utils";
import { DateDisplay } from "@/components/common/DateDisplay";
import { SearchInput } from "@/components/common/SearchInput";
import { useUserAppointmentHistory } from "@/features/appointments/hooks/useUserAppointmentHistory";
import { UserHistoryCard } from "@/features/appointments/components/UserHistoryCard";
import type { UserHistoryProfileData } from "@/features/appointments/types/userHistory";

export interface UserAppointmentHistoryPanelProps {
  userId: string;
  companyId?: string;
  variant?: "page" | "embedded";
  enabled?: boolean;
  /** When set (e.g. profile tab), skip fetching users list for header */
  userDataOverride?: UserHistoryProfileData | null;
  fetchUsersList?: boolean;
}

export function UserAppointmentHistoryPanel({
  userId,
  companyId,
  variant = "page",
  enabled = true,
  userDataOverride,
  fetchUsersList,
}: UserAppointmentHistoryPanelProps) {
  const {
    userData: hookUserData,
    preferredData,
    appointmentStats,
    filteredHistory,
    currentUserHistoryLoading,
    currentUserHistoryLength,
    searchQuery,
    setSearchQuery,
    setDebouncedSearchTerm,
    statusFilter,
    setStatusFilter,
    timeFilter,
    setTimeFilter,
    historyEmptyHasFilters,
    clearHistoryFilters,
    resolveStaffName,
  } = useUserAppointmentHistory({
    userId,
    companyId,
    enabled,
    fetchUsersList: fetchUsersList ?? variant === "page",
  });

  const userData = userDataOverride ?? hookUserData;
  const showPageHeader = variant === "page" && userData;

  if (currentUserHistoryLoading && currentUserHistoryLength === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent-text)] mx-auto mb-4" />
          <p className="text-muted-foreground">Loading appointment history...</p>
        </div>
      </div>
    );
  }

  if (variant === "page" && !userData) {
    return (
      <Card className="p-8 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] text-center">
        <p className="text-muted-foreground">User not found</p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {showPageHeader && userData && (
        <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
          <div className="flex flex-col sm:flex-row sm:items-start gap-4">
            <Avatar className={`${CARD_LIST_AVATAR_CLASS} mx-auto sm:mx-0 flex-shrink-0`}>
              <AvatarImage
                src={formatAvatarUrl(userData.avatar, userData.firstName, userData.lastName)}
                alt={userData.name}
              />
              <AvatarFallback
                className={`bg-[var(--accent-bg)] text-[var(--accent-text)] ${CARD_LIST_AVATAR_FALLBACK_CLASS}`}
              >
                {userData.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 text-center sm:text-left">
              <h2 className="text-xl font-semibold text-foreground mb-2">{userData.name}</h2>
              <div className="space-y-1">
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <Mail className="w-4 h-4 text-[var(--accent-text)]" />
                  <span className="text-sm text-muted-foreground">{userData.email}</span>
                </div>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <Phone className="w-4 h-4 text-[var(--accent-text)]" />
                  <span className="text-sm text-muted-foreground">{userData.phone}</span>
                </div>
                <div className="flex items-center gap-2 justify-center sm:justify-start">
                  <User className="w-4 h-4 text-[var(--accent-text)]" />
                  <span className="text-sm text-muted-foreground">
                    Client since <DateDisplay date={userData.joinDate || userData.createdAt} />
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-1 gap-3 sm:text-right">
              {preferredData.preferredServices.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Preferred Services</p>
                  <div className="flex flex-wrap gap-1 mt-1 justify-center sm:justify-end">
                    {preferredData.preferredServices.map((service, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {service}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {preferredData.preferredStaff.length > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Preferred Staff</p>
                  <div className="flex flex-wrap gap-1 mt-1 justify-center sm:justify-end">
                    {preferredData.preferredStaff.map((staffName, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {staffName}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {appointmentStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className="p-4 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--glass-shadow)]"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-xl font-semibold text-foreground">{stat.count}</p>
                </div>
                <Icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-4 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
        <div className="space-y-4">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            onDebouncedChange={setDebouncedSearchTerm}
            debounceDelay={300}
            placeholder="Search sales, products, services, staff..."
          />

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-32 bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-full sm:w-32 bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="past">Past</SelectItem>
                  <SelectItem value="this-month">This Month</SelectItem>
                </SelectContent>
              </Select>

              {(searchQuery || statusFilter !== "all" || timeFilter !== "all") && (
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="bg-[var(--accent-bg)] text-[var(--accent-text)] border-[var(--accent-border)]"
                  >
                    {filteredHistory.length} results
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("");
                      setStatusFilter("all");
                      setTimeFilter("all");
                    }}
                    className="bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground hover:bg-accent hover:text-foreground"
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      <div className="space-y-4">
        {filteredHistory.length > 0 ? (
          filteredHistory.map((history) => (
            <UserHistoryCard
              key={history.recordId}
              history={history}
              staffName={resolveStaffName(history.staffId)}
            />
          ))
        ) : (
          <EmptyState
            icon={History}
            title="No sale records found"
            description={
              historyEmptyHasFilters
                ? "Try adjusting your filters or search query."
                : "This user doesn't have sales history yet."
            }
            action={
              historyEmptyHasFilters
                ? {
                    label: "Clear filters",
                    variant: "outline",
                    onClick: clearHistoryFilters,
                  }
                : undefined
            }
          />
        )}
      </div>

      {filteredHistory.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4">
          <p className="text-sm text-muted-foreground order-2 sm:order-1">
            Showing {filteredHistory.length} sale record{filteredHistory.length === 1 ? "" : "s"}
            {searchQuery || statusFilter !== "all" || timeFilter !== "all" ? " (filtered)" : ""}
          </p>
        </div>
      )}
    </div>
  );
}
