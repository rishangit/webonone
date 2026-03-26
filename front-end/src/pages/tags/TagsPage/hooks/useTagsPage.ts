import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { useAppSelector, useAppDispatch } from "@/store/hooks";
import { 
  fetchTagsRequest,
  deleteTagRequest,
  updateTagRequest,
  clearTagsError
} from "@/store/slices/tagsSlice";
import { Tag } from "@/services/tags";
import { TagsPageProps } from "../types";

export const useTagsPage = (currentUser?: TagsPageProps["currentUser"]) => {
  const dispatch = useAppDispatch();
  const { tags, loading, error, pagination } = useAppSelector((state) => state.tags);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [tagToDelete, setTagToDelete] = useState<Tag | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("active");

  // Load tags from API with pagination and filters
  useEffect(() => {
    const offset = (currentPage - 1) * itemsPerPage;
    const filters: any = {
      limit: itemsPerPage,
      offset,
      page: currentPage,
    };

    if (debouncedSearchTerm.trim()) {
      filters.search = debouncedSearchTerm.trim();
    }

    if (filterStatus === "active") {
      filters.isActive = true;
    } else if (filterStatus === "inactive") {
      filters.isActive = false;
    }

    dispatch(fetchTagsRequest(filters));
  }, [dispatch, currentPage, itemsPerPage, debouncedSearchTerm, filterStatus]);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filterStatus]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearTagsError());
    }
  }, [error, dispatch]);

  const displayedTags = tags;

  const handleAddTag = () => {
    setSelectedTag(null);
    setDialogMode("add");
    setShowFormDialog(true);
  };

  const handleEditTag = (tag: Tag) => {
    setSelectedTag(tag);
    setDialogMode("edit");
    setShowFormDialog(true);
  };

  const handleDeleteTag = (tag: Tag) => {
    setTagToDelete(tag);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (tagToDelete) {
      dispatch(deleteTagRequest(tagToDelete.id));
      setShowDeleteDialog(false);
      setTagToDelete(null);
    }
  };

  const toggleTagStatus = (tag: Tag) => {
    dispatch(updateTagRequest({
      id: tag.id,
      data: { isActive: !tag.isActive }
    }));
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setFilterStatus("active");
  };

  const refreshTags = () => {
    const offset = (currentPage - 1) * itemsPerPage;
    const filters: any = {
      limit: itemsPerPage,
      offset,
      page: currentPage,
    };
    if (debouncedSearchTerm.trim()) {
      filters.search = debouncedSearchTerm.trim();
    }
    if (filterStatus === "active") {
      filters.isActive = true;
    } else if (filterStatus === "inactive") {
      filters.isActive = false;
    }
    dispatch(fetchTagsRequest(filters));
  };

  // Statistics
  const stats = useMemo(() => {
    const totalTags = pagination?.total || tags.length;
    const activeTagsCount = tags.filter(t => t.isActive).length;
    const inactiveTagsCount = tags.filter(t => !t.isActive).length;
    const totalUsage = tags.reduce((sum, tag) => sum + tag.usageCount, 0);
    
    return {
      total: totalTags,
      active: activeTagsCount,
      inactive: inactiveTagsCount,
      usage: totalUsage,
    };
  }, [pagination, tags]);

  return {
    // State
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    setDebouncedSearchTerm,
    viewMode,
    setViewMode,
    selectedTag,
    setSelectedTag,
    showFormDialog,
    setShowFormDialog,
    dialogMode,
    setDialogMode,
    showDeleteDialog,
    setShowDeleteDialog,
    tagToDelete,
    setTagToDelete,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    isFilterPanelOpen,
    setIsFilterPanelOpen,
    filterStatus,
    setFilterStatus,
    displayedTags,
    loading,
    pagination,
    stats,
    // Actions
    handleAddTag,
    handleEditTag,
    handleDeleteTag,
    confirmDelete,
    toggleTagStatus,
    handleClearFilters,
    refreshTags,
  };
};
