import { useState, useEffect, useMemo } from "react";
import { Plus, Edit, Trash2, MoreVertical, Tag as TagIcon, AlertTriangle, CheckCircle, X } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "../../components/ui/dropdown-menu";
import { ViewSwitcher } from "../../components/ui/view-switcher";
import { toast } from "sonner";
import { UserRole, isRole } from "../../types/user";
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { 
  fetchTagsRequest,
  deleteTagRequest,
  updateTagRequest,
  createTagRequest,
  clearTagsError
} from '../../store/slices/tagsSlice';
import { Tag } from '../../services/tags';
import { TagFormDialog } from './TagFormDialog';
import { SearchInput } from "../../components/common/SearchInput";
import { Pagination } from "../../components/common/Pagination";
import { EmptyState } from "../../components/common/EmptyState";

interface TagsPageProps {
  currentUser?: {
    email: string;
    role: string | number | UserRole;
    name: string;
  } | null;
}

export function TagsPage({ currentUser }: TagsPageProps) {
  const dispatch = useAppDispatch();
  const { tags, loading, error, pagination } = useAppSelector((state) => state.tags);
  
  // State declarations - must be before useEffect that uses them
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

  // Only Super Admin can access this page
  if (!isRole(currentUser?.role, UserRole.SYSTEM_ADMIN)) {
    return (
      <div className="flex-1 p-4 lg:p-8 min-h-screen">
        <Card className="p-12 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] text-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Access Denied</h3>
          <p className="text-muted-foreground">
            Only Super Administrators can access the Tags Management page.
          </p>
        </Card>
      </div>
    );
  }


  // Load tags from API with pagination and filters
  useEffect(() => {
    const offset = (currentPage - 1) * itemsPerPage;
    const filters: any = {
      limit: itemsPerPage,
      offset: offset,
      page: currentPage,
    };

    // Add search (use debounced value to avoid too many API calls)
    if (debouncedSearchTerm.trim()) {
      filters.search = debouncedSearchTerm.trim();
    }

    // Add active filter (default to active tags only)
    filters.isActive = true;

    dispatch(fetchTagsRequest(filters));
  }, [dispatch, currentPage, itemsPerPage, debouncedSearchTerm]);

  // Reset to page 1 when search changes (but not when pagination changes)
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearTagsError());
    }
  }, [error, dispatch]);

  // For server-side pagination, use tags directly (no client-side filtering)
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

  const renderTagCard = (tag: Tag): JSX.Element => {
    return (
      <Card 
        key={tag.id} 
        className="backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--glass-shadow)]"
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 flex-1">
              <div 
                className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl"
                style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
              >
                {tag.icon || <TagIcon className="w-6 h-6" />}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">{tag.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{tag.description || 'No description'}</p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover border-border">
                <DropdownMenuItem onClick={() => handleEditTag(tag)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Tag
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toggleTagStatus(tag)}>
                  {tag.isActive ? (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Activate
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleDeleteTag(tag)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge 
                variant={tag.isActive ? "default" : "secondary"}
                className={tag.isActive ? "bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30" : ""}
              >
                {tag.isActive ? (
                  <>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Active
                  </>
                ) : (
                  <>
                    <X className="w-3 h-3 mr-1" />
                    Inactive
                  </>
                )}
              </Badge>
              <span className="text-xs text-muted-foreground">
                Used {tag.usageCount} {tag.usageCount === 1 ? 'time' : 'times'}
              </span>
            </div>
          </div>
        </div>
      </Card>
    );
  };

  const renderTagListItem = (tag: Tag): JSX.Element => {
    return (
      <Card 
        key={tag.id} 
        className="backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200"
      >
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div 
                className="w-10 h-10 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
              >
                {tag.icon || <TagIcon className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground truncate">{tag.name}</h3>
                  <Badge 
                    variant={tag.isActive ? "default" : "secondary"}
                    className={tag.isActive ? "bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30" : ""}
                  >
                    {tag.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">{tag.description || 'No description'}</p>
              </div>
              <span className="text-xs text-muted-foreground">
                {tag.usageCount} {tag.usageCount === 1 ? 'use' : 'uses'}
              </span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover border-border">
                <DropdownMenuItem onClick={() => handleEditTag(tag)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Tag
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => toggleTagStatus(tag)}>
                  {tag.isActive ? (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Activate
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleDeleteTag(tag)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </Card>
    );
  };

  // Statistics - use pagination total for accurate counts
  // Note: For status breakdown, we'd need separate stats endpoint or calculate from current page data
  const stats = useMemo(() => {
    const totalTags = pagination?.total || tags.length;
    // Calculate status counts from current page data (limited accuracy)
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

  return (
    <div className="flex-1 space-y-6 p-4 lg:p-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl font-semibold text-foreground">Tags Management</h1>
            <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30">
              <TagIcon className="w-3 h-3 mr-1" />
              Super Admin
            </Badge>
          </div>
          <p className="text-muted-foreground">Manage tags for companies and products</p>
        </div>
        <Button 
          variant="accent"
          onClick={handleAddTag}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Tag
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Tags</p>
              <p className="text-2xl font-semibold text-foreground">{stats.total}</p>
            </div>
            <TagIcon className="w-8 h-8 text-muted-foreground" />
          </div>
        </Card>
        <Card className="backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Tags</p>
              <p className="text-2xl font-semibold text-green-600 dark:text-green-400">{stats.active}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </Card>
        <Card className="backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Inactive Tags</p>
              <p className="text-2xl font-semibold text-muted-foreground">{stats.inactive}</p>
            </div>
            <X className="w-8 h-8 text-muted-foreground" />
          </div>
        </Card>
        <Card className="backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total Usage</p>
              <p className="text-2xl font-semibold text-foreground">{stats.usage}</p>
            </div>
            <TagIcon className="w-8 h-8 text-muted-foreground" />
          </div>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-4 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
        <div className="space-y-4">
          <SearchInput
            placeholder="Search tags by name or description..."
            value={searchTerm}
            onChange={setSearchTerm}
            onDebouncedChange={setDebouncedSearchTerm}
            debounceDelay={500}
          />

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              {debouncedSearchTerm && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setDebouncedSearchTerm("");
                    setCurrentPage(1);
                  }}
                  className="bg-[var(--glass-bg)] border-[var(--glass-border)]"
                >
                  Clear Filters
                </Button>
              )}
            </div>

            {/* View Mode Toggle */}
            <ViewSwitcher
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </div>
        </div>
      </Card>

      {/* Loading State - Skeleton for Tag Cards */}
      {loading && displayedTags.length === 0 ? (
        <>
          {/* Skeleton for List View */}
          {viewMode === "list" ? (
            /* Skeleton for List View - Matching renderTagListItem structure */
            <div className="space-y-4">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="p-4 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      {/* Icon */}
                      <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
                      
                      <div className="flex-1 min-w-0">
                        {/* Name and Badge */}
                        <div className="flex items-center gap-2 mb-1">
                          <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </div>
                        {/* Description */}
                        <div className="h-4 w-full max-w-md bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </div>
                      
                      {/* Usage Count */}
                      <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                    
                    {/* Menu Button */}
                    <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            /* Skeleton for Grid View - Matching renderTagCard structure */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(8)].map((_, index) => (
                <Card key={index} className="p-6 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3 flex-1">
                      {/* Icon */}
                      <div className="h-12 w-12 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
                      
                      <div className="flex-1 min-w-0">
                        {/* Name */}
                        <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1" />
                        {/* Description */}
                        <div className="h-4 w-full max-w-xs bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1" />
                        <div className="h-4 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </div>
                    </div>
                    
                    {/* Menu Button */}
                    <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
                  </div>
                  
                  {/* Status Badge and Usage Count */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : displayedTags.length === 0 ? (
        <EmptyState
          icon={TagIcon}
          title="No tags found"
          description={
            debouncedSearchTerm 
              ? "Try adjusting your search terms" 
              : "Get started by creating your first tag"
          }
          action={{
            label: "Add Your First Tag",
            onClick: handleAddTag,
            variant: "accent",
            icon: Plus,
          }}
        />
      ) : (
        <>
          <div className={viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" 
            : "space-y-4"
          }>
            {displayedTags.map(tag => 
              viewMode === "grid" ? renderTagCard(tag) : renderTagListItem(tag)
            )}
          </div>

          {/* Pagination */}
          {pagination && (
            <Pagination
              totalItems={pagination.total}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              showItemsPerPageSelector={true}
              itemsPerPageOptions={[12, 24, 48, 96]}
              onItemsPerPageChange={(newItemsPerPage) => {
                setItemsPerPage(newItemsPerPage);
                setCurrentPage(1);
              }}
            />
          )}
        </>
      )}

      {/* Tag Form Dialog */}
      <TagFormDialog
        open={showFormDialog}
        onOpenChange={setShowFormDialog}
        mode={dialogMode}
        tag={selectedTag}
        onSuccess={() => {
          setShowFormDialog(false);
          setSelectedTag(null);
          // Reload tags with current filters
          const offset = (currentPage - 1) * itemsPerPage;
          const filters: any = {
            limit: itemsPerPage,
            offset: offset,
            page: currentPage,
          };
          if (debouncedSearchTerm.trim()) {
            filters.search = debouncedSearchTerm.trim();
          }
          filters.isActive = true;
          dispatch(fetchTagsRequest(filters));
        }}
      />

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && tagToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Delete Tag</h3>
                <p className="text-sm text-muted-foreground">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-foreground mb-6">
              Are you sure you want to delete <strong>{tagToDelete.name}</strong>? 
              {tagToDelete.usageCount > 0 && (
                <span className="block mt-2 text-sm text-yellow-600">
                  This tag is currently used {tagToDelete.usageCount} {tagToDelete.usageCount === 1 ? 'time' : 'times'}. 
                  You may want to deactivate it instead.
                </span>
              )}
            </p>
            <div className="flex items-center justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowDeleteDialog(false);
                  setTagToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={confirmDelete}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

