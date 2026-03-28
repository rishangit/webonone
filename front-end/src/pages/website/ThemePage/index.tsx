import { useState, useEffect, useMemo } from "react";
import { Plus, Palette } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchThemesRequest,
  createThemeRequest,
  updateThemeRequest,
  deleteThemeRequest,
  clearError,
} from "@/store/slices/companyWebThemesSlice";
import type { CompanyWebTheme } from "@/services/companyWebThemes";
import { EmptyState } from "@/components/common/EmptyState";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";
import { Pagination } from "@/components/common/Pagination";
import { ThemeFilters, ThemeCard, ThemeAddDialog } from "./components";

export const ThemePage = () => {
  const dispatch = useAppDispatch();
  const { themes, loading, error } = useAppSelector(
    (state) => state.companyWebThemes
  );
  const { userCompany, currentCompany } = useAppSelector(
    (state) => state.companies
  );

  const company = currentCompany || userCompany;
  const companyId = company?.id;

  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const ITEMS_PER_PAGE_OPTIONS = [12, 24, 48, 96];
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(
    ITEMS_PER_PAGE_OPTIONS[0]
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<CompanyWebTheme | null>(
    null
  );
  const [isThemeDialogOpen, setIsThemeDialogOpen] = useState(false);
  const [editingTheme, setEditingTheme] = useState<CompanyWebTheme | null>(null);

  useEffect(() => {
    if (companyId) {
      dispatch(fetchThemesRequest({ companyId }));
    }
  }, [dispatch, companyId]);

  useEffect(() => {
    if (error) {
      console.error("Theme error:", error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    // Keep pagination stable with the SpacesPage behavior
    // (jump back to first page when the search changes).
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  const filteredThemes = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return themes;
    const q = debouncedSearchTerm.toLowerCase();
    return themes.filter((t) => t.name?.toLowerCase().includes(q));
  }, [themes, debouncedSearchTerm]);

  const pagination = useMemo(() => {
    const total = filteredThemes.length;
    const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return {
      total,
      totalPages,
      start,
      end,
    };
  }, [filteredThemes.length, currentPage, itemsPerPage]);

  const displayedThemes = useMemo(() => {
    return filteredThemes.slice(pagination.start, pagination.end);
  }, [filteredThemes, pagination.start, pagination.end]);

  useEffect(() => {
    if (
      currentPage > pagination.totalPages &&
      pagination.totalPages > 0
    ) {
      setCurrentPage(pagination.totalPages);
    }
  }, [currentPage, pagination.totalPages]);

  const handleAdd = () => {
    setEditingTheme(null);
    setIsThemeDialogOpen(true);
  };

  const handleCreateTheme = (data: any) => {
    dispatch(createThemeRequest(data));
    setIsThemeDialogOpen(false);
    if (companyId) {
      setTimeout(() => {
        dispatch(fetchThemesRequest({ companyId }));
      }, 500);
    }
  };

  const handleEdit = (theme: CompanyWebTheme) => {
    setEditingTheme(theme);
    setIsThemeDialogOpen(true);
  };

  const handleDelete = (theme: CompanyWebTheme) => {
    setSelectedTheme(theme);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedTheme) {
      dispatch(deleteThemeRequest(selectedTheme.id));
      setIsDeleteDialogOpen(false);
      setSelectedTheme(null);
      if (companyId) {
        setTimeout(() => {
          dispatch(fetchThemesRequest({ companyId }));
        }, 500);
      }
    }
  };

  const handleSetDefault = (theme: CompanyWebTheme) => {
    dispatch(
      updateThemeRequest({
        id: theme.id,
        data: { isDefault: true },
      })
    );
    if (companyId) {
      setTimeout(() => {
        dispatch(fetchThemesRequest({ companyId }));
      }, 500);
    }
  };

  return (
    <div className="flex-1 p-4 lg:p-6 flex flex-col min-h-0">
      {/* Header - aligned with WebpagesPage */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
            Theme Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and manage multiple themes for your website
          </p>
        </div>
        <Button onClick={handleAdd} variant="accent">
          <Plus className="w-4 h-4 mr-2" />
          Add Theme
        </Button>
      </div>

      {/* Search and view mode - aligned with WebpagesPage */}
      <ThemeFilters
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        onDebouncedSearchTermChange={setDebouncedSearchTerm}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Body - mirror SpacesPage layout (pagination pinned to bottom) */}
      <div className="flex flex-col flex-1 min-h-[calc(100vh-300px)]">
        <div className="flex flex-col flex-1 min-h-0">
          {loading && displayedThemes.length === 0 ? (
            <div className="flex-1">
              {viewMode === "list" ? (
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <Card
                      key={i}
                      className="p-6 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
                        <div className="flex-1">
                          <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card
                      key={i}
                      className="p-6 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse" />
                          <div>
                            <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          </div>
                        </div>
                        <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                      </div>
                      <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : displayedThemes.length > 0 ? (
            <div className="flex flex-col flex-1 min-h-0">
              <div className="flex-1">
                {viewMode === "grid" ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {displayedThemes.map((theme) => (
                      <ThemeCard
                        key={theme.id}
                        theme={theme}
                        viewMode="grid"
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onSetDefault={handleSetDefault}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {displayedThemes.map((theme) => (
                      <ThemeCard
                        key={theme.id}
                        theme={theme}
                        viewMode="list"
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                        onSetDefault={handleSetDefault}
                      />
                    ))}
                  </div>
                )}
              </div>

              {pagination.total > 0 && (
                <div className="mt-auto pt-4">
                  <Pagination
                    totalItems={pagination.total}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    onPageChange={setCurrentPage}
                    showItemsPerPageSelector
                    itemsPerPageOptions={ITEMS_PER_PAGE_OPTIONS}
                    onItemsPerPageChange={(newSize) => {
                      setItemsPerPage(newSize);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              icon={Palette}
              title="No themes found"
              description={
                searchTerm
                  ? "Try adjusting your search"
                  : "Create your first theme to start customizing your website."
              }
              action={{
                label: "Add Theme",
                onClick: handleAdd,
                variant: "accent",
                icon: Plus,
              }}
            />
          )}
        </div>
      </div>

      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) {
            setSelectedTheme(null);
          }
        }}
        onConfirm={handleDeleteConfirm}
        itemName={selectedTheme?.name}
        itemType="theme"
      />

      <ThemeAddDialog
        open={isThemeDialogOpen}
        onOpenChange={(open) => {
          setIsThemeDialogOpen(open);
          if (!open) {
            setEditingTheme(null);
          }
        }}
        companyId={companyId}
        loading={loading}
        selectedTheme={editingTheme}
        onCreate={handleCreateTheme}
        onUpdate={(themeId, data) => {
          dispatch(updateThemeRequest({ id: themeId, data }));
          setIsThemeDialogOpen(false);
          setEditingTheme(null);
          if (companyId) {
            setTimeout(() => {
              dispatch(fetchThemesRequest({ companyId }));
            }, 500);
          }
        }}
      />
    </div>
  );
};
