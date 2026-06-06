import { useState, useEffect, useMemo } from "react";
import { Calendar, CheckCircle, Clock, XCircle, type LucideIcon } from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchUserAppointmentHistoryRequest } from "@/features/appointments/store";
import { fetchUsersRequest } from "@/shared/store/users";
import { fetchStaffRequest } from "@/shared/store/staff";
import type {
  TransformedUserHistoryRecord,
  UserHistoryProfileData,
} from "@/features/appointments/types/userHistory";

export interface UserAppointmentHistoryStat {
  label: string;
  count: number;
  icon: LucideIcon;
  color: string;
}

interface UseUserAppointmentHistoryOptions {
  userId: string;
  companyId?: string;
  enabled?: boolean;
  fetchUsersList?: boolean;
}

export function useUserAppointmentHistory({
  userId,
  companyId,
  enabled = true,
  fetchUsersList = true,
}: UseUserAppointmentHistoryOptions) {
  const dispatch = useAppDispatch();
  const {
    currentUserHistory,
    currentUserHistoryLoading,
    currentUserHistoryError,
  } = useAppSelector((state) => state.appointmentHistory);
  const { users } = useAppSelector((state) => state.users);
  const { staff } = useAppSelector((state) => state.staff);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [timeFilter, setTimeFilter] = useState("all");

  useEffect(() => {
    if (!enabled || !userId || !companyId) return;

    if (fetchUsersList) {
      dispatch(fetchUsersRequest({}));
    }
    dispatch(fetchStaffRequest({ companyId }));
    dispatch(fetchUserAppointmentHistoryRequest({ userId, companyId }));
  }, [dispatch, userId, companyId, enabled, fetchUsersList]);

  useEffect(() => {
    if (currentUserHistoryError) {
      toast.error(currentUserHistoryError);
    }
  }, [currentUserHistoryError]);

  const userData = useMemo((): UserHistoryProfileData | null => {
    const foundUser = users.find((u) => String(u.id) === String(userId));
    if (!foundUser) return null;

    return {
      id: foundUser.id,
      name: `${foundUser.firstName} ${foundUser.lastName}`.trim() || foundUser.email,
      email: foundUser.email,
      phone: foundUser.phone || "N/A",
      avatar: foundUser.avatar,
      firstName: foundUser.firstName,
      lastName: foundUser.lastName,
      joinDate: foundUser.createdAt || new Date().toISOString(),
      createdAt: foundUser.createdAt,
    };
  }, [users, userId]);

  const preferredData = useMemo(() => {
    const serviceCounts: Record<string, number> = {};
    const staffCounts: Record<string, { name: string; count: number }> = {};

    currentUserHistory.forEach((history) => {
      const serviceName = history.serviceId ? `Service-${history.serviceId}` : "Service";
      serviceCounts[serviceName] = (serviceCounts[serviceName] || 0) + 1;

      if (history.staffId) {
        const staffMember = staff.find((s) => s.id === history.staffId);
        const staffName =
          staffMember?.name ||
          `${staffMember?.firstName || ""} ${staffMember?.lastName || ""}`.trim() ||
          `Staff-${history.staffId}`;
        if (!staffCounts[history.staffId]) {
          staffCounts[history.staffId] = { name: staffName, count: 0 };
        }
        staffCounts[history.staffId].count += 1;
      }
    });

    const preferredServices = Object.entries(serviceCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 2)
      .map(([name]) => name);

    const preferredStaff = Object.values(staffCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 2)
      .map((s) => s.name);

    return { preferredServices, preferredStaff };
  }, [currentUserHistory, staff]);

  const appointmentStats = useMemo((): UserAppointmentHistoryStat[] => {
    const total = currentUserHistory.length;
    const completed = total;
    const cancelled = 0;
    const upcoming = currentUserHistory.filter((h) => {
      const saleDate = h.createdAt ? new Date(h.createdAt) : new Date();
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return saleDate >= today;
    }).length;

    return [
      { label: "Total", count: total, icon: Calendar, color: "text-blue-600" },
      { label: "Completed", count: completed, icon: CheckCircle, color: "text-green-600" },
      { label: "Cancelled", count: cancelled, icon: XCircle, color: "text-red-600" },
      { label: "Upcoming", count: upcoming, icon: Clock, color: "text-orange-600" },
    ];
  }, [currentUserHistory]);

  const transformedSalesHistory = useMemo((): TransformedUserHistoryRecord[] => {
    return currentUserHistory.map((history) => {
      const saleDate = history.createdAt ? new Date(history.createdAt) : new Date();
      const serviceItems = history.servicesUsed || [];
      const productItems = history.productsUsed || [];

      return {
        ...history,
        recordId: history.id,
        appointmentId: history.appointmentId || null,
        saleDate,
        serviceItems,
        productItems,
        itemCount: serviceItems.length + productItems.length,
      };
    });
  }, [currentUserHistory]);

  const filteredHistory = useMemo(() => {
    return transformedSalesHistory.filter((history) => {
      const searchTerm = debouncedSearchTerm.trim().toLowerCase();
      if (searchTerm) {
        const serviceMatches = history.serviceItems.some((item) =>
          (item.name || "").toLowerCase().includes(searchTerm)
        );
        const productMatches = history.productItems.some((item) =>
          (item.name || "").toLowerCase().includes(searchTerm)
        );
        const staffMember = history.staffId ? staff.find((s) => s.id === history.staffId) : null;
        const staffName = staffMember
          ? staffMember.name ||
            `${staffMember.firstName || ""} ${staffMember.lastName || ""}`.trim()
          : "";
        const saleIdMatches = (history.recordId || "").toLowerCase().includes(searchTerm);

        if (
          !serviceMatches &&
          !productMatches &&
          !staffName.toLowerCase().includes(searchTerm) &&
          !saleIdMatches
        ) {
          return false;
        }
      }

      if (statusFilter !== "all" && statusFilter !== "completed") {
        return false;
      }

      if (timeFilter !== "all") {
        const saleDate = history.saleDate;
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        switch (timeFilter) {
          case "upcoming":
            return saleDate >= today;
          case "past":
            return saleDate < today;
          case "this-month": {
            const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
            return saleDate >= thisMonth && saleDate < nextMonth;
          }
          default:
            return true;
        }
      }

      return true;
    });
  }, [transformedSalesHistory, debouncedSearchTerm, statusFilter, timeFilter, staff]);

  const historyEmptyHasFilters =
    Boolean(searchQuery.trim()) || statusFilter !== "all" || timeFilter !== "all";

  const clearHistoryFilters = () => {
    setSearchQuery("");
    setDebouncedSearchTerm("");
    setStatusFilter("all");
    setTimeFilter("all");
  };

  const resolveStaffName = (staffId?: string) => {
    if (!staffId) return "N/A";
    const staffMember = staff.find((s) => s.id === staffId);
    if (!staffMember) return "N/A";
    return (
      staffMember.name ||
      `${staffMember.firstName || ""} ${staffMember.lastName || ""}`.trim() ||
      "N/A"
    );
  };

  return {
    staff,
    userData,
    preferredData,
    appointmentStats,
    filteredHistory,
    currentUserHistoryLoading,
    currentUserHistoryLength: currentUserHistory.length,
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
  };
}
