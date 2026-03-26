import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { 
  fetchStaffRequest, 
  createStaffRequest, 
  updateStaffRequest, 
  deleteStaffRequest,
  clearError 
} from "@/store/slices/staffSlice";
import { Staff } from "@/services/staff";
import { StaffPageProps } from "../types";

export const useStaffPage = (currentUser?: StaffPageProps["currentUser"]) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { staffId } = useParams<{ staffId?: string }>();
  const { staff: reduxStaff, loading, error, pagination } = useAppSelector((state) => state.staff);
  const { user } = useAppSelector((state) => state.auth);
  
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterDepartment, setFilterDepartment] = useState<string>("all");
  const [isAddStaffDialogOpen, setIsAddStaffDialogOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [isStaffDetailDialogOpen, setIsStaffDetailDialogOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<Staff | null>(null);
  const [isDeleteConfirmDialogOpen, setIsDeleteConfirmDialogOpen] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  const companyId = user?.companyId || currentUser?.companyId;

  // Fetch staff with pagination and filters
  useEffect(() => {
    if (companyId && currentUser?.role !== "User") {
      const offset = (currentPage - 1) * itemsPerPage;
      const filters: any = {
        companyId,
        limit: itemsPerPage,
        offset,
        page: currentPage,
      };

      if (debouncedSearchTerm.trim()) {
        filters.search = debouncedSearchTerm.trim();
      }

      if (filterStatus !== "all") {
        filters.status = filterStatus;
      }

      if (filterRole !== "all") {
        filters.role = filterRole;
      }

      if (filterDepartment !== "all") {
        filters.department = filterDepartment;
      }

      dispatch(fetchStaffRequest(filters));
    }
  }, [dispatch, companyId, currentUser?.role, currentPage, itemsPerPage, debouncedSearchTerm, filterStatus, filterRole, filterDepartment]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filterStatus, filterRole, filterDepartment]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Memoized values
  const displayedStaff = useMemo(() => {
    return reduxStaff;
  }, [reduxStaff]);

  const uniqueRoles = useMemo(() => {
    return [...new Set(reduxStaff.map(s => s.role).filter(Boolean))];
  }, [reduxStaff]);

  const uniqueDepartments = useMemo(() => {
    return [...new Set(reduxStaff.map(s => s.department).filter(Boolean))];
  }, [reduxStaff]);

  // CRUD Operations
  const handleAddStaff = async (staffData: {
    userId: string;
    role?: string;
    permissions: string[];
    workSchedule: {
      schedule?: Record<string, { startTime: string; endTime: string; enabled: boolean }>;
      startTime?: string;
      endTime?: string;
      availableDays?: string[];
    };
  }) => {
    if (!companyId) {
      toast.error("Company ID not found. Please refresh and try again.");
      return;
    }

    const permissionsObj = staffData.permissions.reduce((acc, perm) => {
      acc[perm] = true;
      return acc;
    }, {} as Record<string, boolean>);

    dispatch(createStaffRequest({ 
      companyId, 
      data: {
        userId: staffData.userId,
        ...(staffData.role && { role: staffData.role }),
        permissions: permissionsObj,
        workSchedule: staffData.workSchedule,
        status: "Active" as const
      }
    }));
    
    setTimeout(() => {
      dispatch(fetchStaffRequest({ companyId }));
    }, 500);
  };

  const handleEditStaff = async (staffData: {
    id: string;
    userId?: string;
    role?: string;
    permissions: string[];
    workSchedule: {
      schedule?: Record<string, { startTime: string; endTime: string; enabled: boolean }>;
      startTime?: string;
      endTime?: string;
      availableDays?: string[];
    };
  }) => {
    if (!companyId) {
      toast.error("Company ID not found. Please refresh and try again.");
      return;
    }

    const permissionsObj = staffData.permissions.reduce((acc, perm) => {
      acc[perm] = true;
      return acc;
    }, {} as Record<string, boolean>);

    dispatch(updateStaffRequest({ 
      id: staffData.id, 
      data: {
        ...(staffData.userId && { userId: staffData.userId }),
        ...(staffData.role && { role: staffData.role }),
        permissions: permissionsObj,
        workSchedule: staffData.workSchedule
      }
    }));
    
    setTimeout(() => {
      dispatch(fetchStaffRequest({ companyId }));
    }, 500);
  };

  const handleDeleteStaff = async (staffId: string) => {
    dispatch(deleteStaffRequest(staffId));
    
    if (companyId) {
      setTimeout(() => {
        dispatch(fetchStaffRequest({ companyId }));
      }, 500);
    }
    
    setIsDeleteConfirmDialogOpen(false);
    setStaffToDelete(null);
  };

  const handleDeleteClick = (member: Staff) => {
    setStaffToDelete(member);
    setIsDeleteConfirmDialogOpen(true);
  };

  const handleViewStaff = (member: Staff) => {
    navigate(`/system/staff/${member.id}`);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setFilterRole("all");
    setFilterStatus("all");
    setFilterDepartment("all");
  };

  return {
    // State
    staffId,
    viewMode,
    setViewMode,
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    setDebouncedSearchTerm,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    filterRole,
    setFilterRole,
    filterStatus,
    setFilterStatus,
    filterDepartment,
    setFilterDepartment,
    isAddStaffDialogOpen,
    setIsAddStaffDialogOpen,
    selectedStaff,
    setSelectedStaff,
    isStaffDetailDialogOpen,
    setIsStaffDetailDialogOpen,
    staffToDelete,
    isDeleteConfirmDialogOpen,
    setIsDeleteConfirmDialogOpen,
    isFilterPanelOpen,
    setIsFilterPanelOpen,
    displayedStaff,
    loading,
    pagination,
    companyId,
    uniqueRoles,
    uniqueDepartments,
    // Actions
    handleAddStaff,
    handleEditStaff,
    handleDeleteStaff,
    handleDeleteClick,
    handleViewStaff,
    handleClearFilters,
  };
};
