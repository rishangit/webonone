import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "../../../../store/hooks";
import { 
  fetchSpacesRequest, 
  createSpaceRequest, 
  updateSpaceRequest, 
  deleteSpaceRequest,
  clearError 
} from "../../../../store/slices/spacesSlice";
import { Space, CreateSpaceData } from "../../../../services/spaces";
import { SpaceFormData } from "../types";

export const useSpacesPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { spaces: reduxSpaces, loading, error, pagination } = useAppSelector((state) => state.spaces);
  const { user } = useAppSelector((state) => state.auth);
  
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [formData, setFormData] = useState<SpaceFormData>({
    name: "",
    capacity: "",
    status: "Active",
    description: "",
    imageUrl: "",
    tagIds: []
  });

  const companyId = user?.companyId;

  // Listen for header search event and sessionStorage
  useEffect(() => {
    const handleHeaderSearch = (event: CustomEvent) => {
      const { query, entity } = event.detail;
      if (entity === "space") {
        setSearchTerm(query);
        setDebouncedSearchTerm(query);
        setCurrentPage(1);
        sessionStorage.removeItem(`searchQuery_space`);
      }
    };

    // Check sessionStorage on mount
    const storedQuery = sessionStorage.getItem("searchQuery_space");
    if (storedQuery) {
      setSearchTerm(storedQuery);
      setDebouncedSearchTerm(storedQuery);
      setCurrentPage(1);
      sessionStorage.removeItem("searchQuery_space");
    }

    window.addEventListener("headerSearch", handleHeaderSearch as EventListener);
    return () => {
      window.removeEventListener("headerSearch", handleHeaderSearch as EventListener);
    };
  }, []);

  // Fetch spaces with pagination and filters
  useEffect(() => {
    if (companyId) {
      const offset = (currentPage - 1) * itemsPerPage;
      const filters: any = {
        companyId,
        limit: itemsPerPage,
        offset: offset,
        page: currentPage,
      };

      if (debouncedSearchTerm.trim()) {
        filters.search = debouncedSearchTerm.trim();
      }

      if (filterStatus !== "all") {
        filters.status = filterStatus;
      }

      dispatch(fetchSpacesRequest(filters));
    }
  }, [dispatch, companyId, currentPage, itemsPerPage, debouncedSearchTerm, filterStatus]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filterStatus]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Transform spaces to include appointments
  const spaces = useMemo(() => {
    return reduxSpaces.map(space => ({
      ...space,
      appointments: space.appointments || { today: 0, thisWeek: 0 }
    }));
  }, [reduxSpaces]);

  const displayedSpaces = useMemo(() => {
    return spaces;
  }, [spaces]);

  // CRUD Operations
  const resetForm = () => {
    setFormData({
      name: "",
      capacity: "",
      status: "Active",
      description: "",
      imageUrl: "",
      tagIds: []
    });
  };

  const openAddDialog = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };

  const openEditDialog = (space: Space) => {
    setSelectedSpace(space);
    const tagIds = Array.isArray(space.tags) 
      ? space.tags.map(tag => {
          if (typeof tag === 'string') {
            return tag;
          } else {
            return tag.id || '';
          }
        }).filter((id): id is string => Boolean(id) && typeof id === 'string' && id.length === 10)
      : [];
    
    setFormData({
      name: space.name,
      capacity: space.capacity.toString(),
      status: space.status,
      description: space.description || "",
      imageUrl: space.imageUrl || "",
      tagIds: tagIds
    });
    setIsEditDialogOpen(true);
  };

  const openViewDialog = (space: Space) => {
    navigate(`/system/spaces/${space.id}`);
  };

  const openDeleteDialog = (space: Space) => {
    setSelectedSpace(space);
    setIsDeleteDialogOpen(true);
  };

  const handleImageUploaded = (filePath: string, _fileUrl: string) => {
    setFormData(prev => ({ ...prev, imageUrl: filePath }));
  };

  const handleImageDeleted = () => {
    setFormData(prev => ({ ...prev, imageUrl: "" }));
  };

  const handleSave = () => {
    if (!formData.name || !formData.capacity) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!companyId) {
      toast.error("Company ID not found. Please refresh and try again.");
      return;
    }

    const spaceData: CreateSpaceData = {
      name: formData.name,
      capacity: parseInt(formData.capacity),
      status: formData.status,
      description: formData.description || undefined,
      imageUrl: formData.imageUrl || undefined,
      tagIds: formData.tagIds.length > 0 ? formData.tagIds : undefined
    };

    if (isEditDialogOpen && selectedSpace) {
      dispatch(updateSpaceRequest({ id: selectedSpace.id, data: spaceData }));
      setIsEditDialogOpen(false);
    } else {
      dispatch(createSpaceRequest({ companyId, data: spaceData }));
      setIsAddDialogOpen(false);
    }

    resetForm();
  };

  const handleDelete = () => {
    if (selectedSpace) {
      dispatch(deleteSpaceRequest(selectedSpace.id));
      setIsDeleteDialogOpen(false);
      setSelectedSpace(null);
    }
  };

  const handleFormDataChange = (data: Partial<SpaceFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setFilterStatus("all");
  };

  // Calculate stats
  const stats = useMemo(() => {
    return {
      totalSpaces: spaces.length,
      activeSpaces: spaces.filter(s => s.status === "Active").length,
      todayBookings: spaces.reduce((acc, space) => acc + (space.appointments?.today || 0), 0)
    };
  }, [spaces]);

  return {
    // State
    viewMode,
    setViewMode,
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    setDebouncedSearchTerm,
    filterStatus,
    setFilterStatus,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    selectedSpace,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isViewDialogOpen,
    setIsViewDialogOpen,
    isFilterPanelOpen,
    setIsFilterPanelOpen,
    formData,
    displayedSpaces,
    loading,
    pagination,
    companyId,
    stats,
    // Actions
    openAddDialog,
    openEditDialog,
    openViewDialog,
    openDeleteDialog,
    handleImageUploaded,
    handleImageDeleted,
    handleSave,
    handleDelete,
    handleFormDataChange,
    handleClearFilters,
    resetForm
  };
};
