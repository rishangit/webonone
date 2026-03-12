import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchWebPagesRequest,
  updateWebPageRequest,
  deleteWebPageRequest,
  clearError,
} from "@/store/slices/companyWebPagesSlice";
import { CompanyWebPage } from "@/services/companyWebPages";

const ITEMS_PER_PAGE_OPTIONS = [12, 24, 48, 96];

export const useWebpagesPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { webPages, loading, error } = useAppSelector((state) => state.companyWebPages);
  const { userCompany, currentCompany } = useAppSelector((state) => state.companies);

  const company = currentCompany || userCompany;
  const companyId = company?.id;

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE_OPTIONS[0]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [webPageToDelete, setWebPageToDelete] = useState<CompanyWebPage | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (companyId) {
      dispatch(fetchWebPagesRequest({ companyId }));
    }
  }, [dispatch, companyId]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const filteredWebPages = useMemo(() => {
    let list = webPages;
    if (debouncedSearchTerm.trim()) {
      const q = debouncedSearchTerm.toLowerCase();
      list = list.filter(
        (p) =>
          p.name?.toLowerCase().includes(q) || p.url?.toLowerCase().includes(q)
      );
    }
    if (filterStatus === "active") {
      list = list.filter((p) => p.isActive);
    }
    if (filterStatus === "inactive") {
      list = list.filter((p) => !p.isActive);
    }
    return list;
  }, [webPages, debouncedSearchTerm, filterStatus]);

  const pagination = useMemo(() => {
    const total = filteredWebPages.length;
    const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return {
      total,
      totalPages,
      start,
      end,
    };
  }, [filteredWebPages.length, currentPage, itemsPerPage]);

  const displayedWebPages = useMemo(() => {
    return filteredWebPages.slice(pagination.start, pagination.end);
  }, [filteredWebPages, pagination.start, pagination.end]);

  useEffect(() => {
    if (currentPage > pagination.totalPages && pagination.totalPages > 0) {
      setCurrentPage(pagination.totalPages);
    }
  }, [currentPage, pagination.totalPages]);

  const handleEdit = (webPage: CompanyWebPage) => {
    const editorUrl = `${window.location.origin}/editor/${webPage.id}`;
    window.open(editorUrl, "_blank", "noopener,noreferrer");
  };

  const handleBrowse = (webPage: CompanyWebPage) => {
    if (!companyId) return;
    let pageUrl = webPage.url;
    if (pageUrl.startsWith("http://") || pageUrl.startsWith("https://")) {
      try {
        const urlObj = new URL(pageUrl);
        pageUrl = urlObj.pathname;
      } catch {
        // keep original
      }
    }
    if (!pageUrl.startsWith("/")) pageUrl = "/" + pageUrl;
    const publicUrl = `${window.location.origin}/web/${companyId}${pageUrl}`;
    window.open(publicUrl, "_blank", "noopener,noreferrer");
  };

  const handleDeleteClick = (webPage: CompanyWebPage) => {
    setWebPageToDelete(webPage);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (webPageToDelete) {
      dispatch(deleteWebPageRequest(webPageToDelete.id));
      setIsDeleteDialogOpen(false);
      setWebPageToDelete(null);
      if (companyId) {
        setTimeout(() => dispatch(fetchWebPagesRequest({ companyId })), 500);
      }
    }
  };

  const handleToggleActive = (webPage: CompanyWebPage) => {
    dispatch(
      updateWebPageRequest({
        id: webPage.id,
        data: { isActive: !webPage.isActive },
      })
    );
    if (companyId) {
      setTimeout(() => dispatch(fetchWebPagesRequest({ companyId })), 500);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setFilterStatus("all");
    setCurrentPage(1);
  };

  const handleAdd = () => {
    navigate("/system/web/webpages/new");
  };

  return {
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
    itemsPerPageOptions: ITEMS_PER_PAGE_OPTIONS,
    filterStatus,
    setFilterStatus,
    isFilterPanelOpen,
    setIsFilterPanelOpen,
    displayedWebPages,
    filteredWebPages,
    loading,
    pagination: {
      total: pagination.total,
      totalPages: pagination.totalPages,
    },
    companyId,
    webPageToDelete,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    handleEdit,
    handleBrowse,
    handleDeleteClick,
    handleDeleteConfirm,
    handleToggleActive,
    handleClearFilters,
    handleAdd,
  };
};
