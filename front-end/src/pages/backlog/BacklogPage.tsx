import { useState, useEffect, useMemo } from "react";
import { Plus, Edit, Trash2, MoreVertical, Bug, Sparkles, AlertTriangle, CheckCircle, Filter } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "../../components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { ViewSwitcher } from "../../components/ui/view-switcher";
import { toast } from "sonner";
import { UserRole, isRole, User as UserType } from "../../types/user";
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { 
  fetchBacklogItemsRequest,
  deleteBacklogItemRequest,
  updateBacklogItemRequest,
  clearBacklogError
} from '../../store/slices/backlogSlice';
import { BacklogItem } from '../../services/backlog';
import { BacklogFormDialog } from './BacklogFormDialog';
import { SearchInput } from "../../components/common/SearchInput";
import { Pagination } from "../../components/common/Pagination";
import { EmptyState } from "../../components/common/EmptyState";
import { RightPanel } from "../../components/common/RightPanel";
import { cn } from "../../components/ui/utils";
import { Carousel, CarouselContent, CarouselItem } from "../../components/ui/carousel";
import { formatAvatarUrl } from "../../utils";

interface BacklogPageProps {
  currentUser?: UserType | null;
}

export const BacklogPage = ({ currentUser }: BacklogPageProps) => {
  const dispatch = useAppDispatch();
  
  const backlogState = useAppSelector((state) => state.backlog);
  
  const { items, loading, error, pagination } = backlogState || { items: [], loading: false, error: null, pagination: null };
  
  // State declarations - must be before useEffect that uses them
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [selectedItem, setSelectedItem] = useState<BacklogItem | null>(null);
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<"add" | "edit">("add");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<BacklogItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  // Check if user is company owner (can update status)
  const isCompanyOwner = useMemo(() => {
    if (!currentUser) return false;
    const role = currentUser.role;
    return isRole(role, UserRole.SYSTEM_ADMIN) || isRole(role, UserRole.COMPANY_OWNER);
  }, [currentUser]);

  // Load backlog items from API with pagination and filters
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

    // Add type filter
    if (filterType !== "all") {
      filters.type = filterType;
    }

    // Add status filter
    if (filterStatus !== "all") {
      filters.status = filterStatus;
    }

    dispatch(fetchBacklogItemsRequest(filters));
  }, [dispatch, currentPage, itemsPerPage, debouncedSearchTerm, filterType, filterStatus]);

  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filterType, filterStatus]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearBacklogError());
    }
  }, [error, dispatch]);

  // For server-side pagination, use items directly (no client-side filtering)
  const displayedItems = items || [];

  const handleAddItem = () => {
    setSelectedItem(null);
    setDialogMode("add");
    setShowFormDialog(true);
  };

  const handleEditItem = (item: BacklogItem) => {
    setSelectedItem(item);
    setDialogMode("edit");
    setShowFormDialog(true);
  };

  const handleDeleteItem = (item: BacklogItem) => {
    setItemToDelete(item);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      dispatch(deleteBacklogItemRequest(itemToDelete.id));
      setShowDeleteDialog(false);
      setItemToDelete(null);
    }
  };

  const handleStatusChange = (item: BacklogItem, newStatus: 'New' | 'Active' | 'Done') => {
    if (!isCompanyOwner) {
      toast.error('Only company owners can update status');
      return;
    }
    dispatch(updateBacklogItemRequest({
      id: item.id,
      data: { status: newStatus }
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New':
        return 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30';
      case 'Active':
        return 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30';
      case 'Done':
        return 'bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30';
      default:
        return '';
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'Issue' ? Bug : Sparkles;
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (e) {
      return 'Invalid Date';
    }
  };

  const renderItemCard = (item: BacklogItem): JSX.Element => {
    const TypeIcon = getTypeIcon(item.type);
    return (
      <Card 
        key={item.id} 
        className="backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--glass-shadow)]"
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-start gap-3 flex-1">
              <div 
                className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  item.type === 'Issue' 
                    ? 'bg-red-500/20 text-red-600 dark:text-red-400' 
                    : 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
                }`}
              >
                <TypeIcon className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground truncate">{item.title}</h3>
                  <Badge className={getStatusColor(item.status)}>
                    {item.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {item.description}
                </p>
                {item.screenshotPath && (
                  <div className="mt-2">
                    <img 
                      src={formatAvatarUrl(item.screenshotPath)} 
                      alt="Screenshot" 
                      className="w-full h-32 object-cover rounded border border-[var(--glass-border)]"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover border-border">
                <DropdownMenuItem onClick={() => handleEditItem(item)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                {isCompanyOwner && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleStatusChange(item, 'New')}>
                      <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 mr-2">New</Badge>
                      Set to New
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(item, 'Active')}>
                      <Badge className="bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30 mr-2">Active</Badge>
                      Set to Active
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(item, 'Done')}>
                      <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30 mr-2">Done</Badge>
                      Set to Done
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleDeleteItem(item)}
                  className="text-red-600 focus:text-red-600"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>Type: <strong>{item.type}</strong></span>
              <span>Created: {formatDate(item.createdAt)}</span>
            </div>
            {item.creator && item.creator.name && (
              <span>By: {item.creator.name}</span>
            )}
          </div>
        </div>
      </Card>
    );
  };

  const renderItemListItem = (item: BacklogItem): JSX.Element => {
    const TypeIcon = getTypeIcon(item.type);
    return (
      <Card 
        key={item.id} 
        className="backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200"
      >
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div 
                className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  item.type === 'Issue' 
                    ? 'bg-red-500/20 text-red-600 dark:text-red-400' 
                    : 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
                }`}
              >
                <TypeIcon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-foreground truncate">{item.title}</h3>
                  <Badge className={getStatusColor(item.status)}>
                    {item.status}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {item.type}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">{item.description}</p>
                <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                  <span>Created: {formatDate(item.createdAt)}</span>
                  {item.creator && item.creator.name && (
                    <span>By: {item.creator.name}</span>
                  )}
                </div>
              </div>
              {item.screenshotPath && (
                <div className="flex-shrink-0 ml-4">
                  <img 
                    src={formatAvatarUrl(item.screenshotPath)} 
                    alt="Screenshot" 
                    className="w-20 h-20 object-cover rounded border border-[var(--glass-border)]"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover border-border">
                <DropdownMenuItem onClick={() => handleEditItem(item)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                {isCompanyOwner && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleStatusChange(item, 'New')}>
                      <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 mr-2">New</Badge>
                      Set to New
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(item, 'Active')}>
                      <Badge className="bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border border-yellow-500/30 mr-2">Active</Badge>
                      Set to Active
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleStatusChange(item, 'Done')}>
                      <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border border-green-500/30 mr-2">Done</Badge>
                      Set to Done
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => handleDeleteItem(item)}
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

  // Statistics
  const stats = useMemo(() => {
    const itemsList = items || [];
    const totalItems = pagination?.total || itemsList.length;
    const issuesCount = itemsList.filter(i => i?.type === 'Issue').length;
    const featuresCount = itemsList.filter(i => i?.type === 'Feature').length;
    const newCount = itemsList.filter(i => i?.status === 'New').length;
    const activeCount = itemsList.filter(i => i?.status === 'Active').length;
    const doneCount = itemsList.filter(i => i?.status === 'Done').length;
    
    return {
      total: totalItems,
      issues: issuesCount,
      features: featuresCount,
      new: newCount,
      active: activeCount,
      done: doneCount,
    };
  }, [pagination, items]);

  return (
    <div className="flex-1 space-y-6 p-4 lg:p-8 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-2xl font-semibold text-foreground">Issue / Feature Request Backlog</h1>
          </div>
          <p className="text-muted-foreground">Log issues and request new features</p>
        </div>
        <Button 
          variant="accent"
          onClick={handleAddItem}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add New
        </Button>
      </div>

      {/* Stats Cards - Desktop Only */}
      <div className="hidden lg:block">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          <Card className="backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-semibold text-foreground">{stats.total}</p>
              </div>
              <Bug className="w-8 h-8 text-muted-foreground" />
            </div>
          </Card>
          <Card className="backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Issues</p>
                <p className="text-2xl font-semibold text-red-600 dark:text-red-400">{stats.issues}</p>
              </div>
              <Bug className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
          </Card>
          <Card className="backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Features</p>
                <p className="text-2xl font-semibold text-purple-600 dark:text-purple-400">{stats.features}</p>
              </div>
              <Sparkles className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </Card>
          <Card className="backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">New</p>
                <p className="text-2xl font-semibold text-blue-600 dark:text-blue-400">{stats.new}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </Card>
          <Card className="backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-semibold text-yellow-600 dark:text-yellow-400">{stats.active}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
            </div>
          </Card>
          <Card className="backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Done</p>
                <p className="text-2xl font-semibold text-green-600 dark:text-green-400">{stats.done}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </Card>
        </div>
      </div>

      {/* Mobile & Tablet: Carousel */}
      <div className="block lg:hidden">
        <Carousel
          opts={{
            align: "start",
            slidesToScroll: 1,
            containScroll: "trimSnaps",
          }}
          className="w-full"
        >
          <CarouselContent className="ml-0">
            {[
              { label: "Total", value: stats.total, icon: Bug, color: "text-muted-foreground" },
              { label: "Issues", value: stats.issues, icon: Bug, color: "text-red-600 dark:text-red-400" },
              { label: "Features", value: stats.features, icon: Sparkles, color: "text-purple-600 dark:text-purple-400" },
              { label: "New", value: stats.new, icon: AlertTriangle, color: "text-blue-600 dark:text-blue-400" },
              { label: "Active", value: stats.active, icon: AlertTriangle, color: "text-yellow-600 dark:text-yellow-400" },
              { label: "Done", value: stats.done, icon: CheckCircle, color: "text-green-600 dark:text-green-400" },
            ].map((stat, index) => {
              const Icon = stat.icon;
              const isLast = index === 5;
              return (
                <CarouselItem key={index} className={`pl-0 ${isLast ? 'pr-4' : 'pr-2'} flex-shrink-0`} style={{ minWidth: '40vw', width: 'auto' }}>
                  <Card className="backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{stat.label}</p>
                        <p className={`text-2xl font-semibold ${stat.color}`}>{stat.value}</p>
                      </div>
                      <Icon className={`w-8 h-8 ${stat.color}`} />
                    </div>
                  </Card>
                </CarouselItem>
              );
            })}
          </CarouselContent>
        </Carousel>
      </div>

      {/* Search and Filters */}
      <Card className="p-4 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
        <div className="space-y-4">
          <SearchInput
            placeholder="Search by title..."
            value={searchTerm}
            onChange={setSearchTerm}
            onDebouncedChange={setDebouncedSearchTerm}
            debounceDelay={500}
          />

          {/* Filter Button and View Switcher */}
          <div className="flex items-center justify-end gap-3 flex-wrap">
            <Button 
              variant="outline" 
              onClick={() => setIsFilterPanelOpen(true)}
              className={cn(
                "h-9",
                (debouncedSearchTerm || filterType !== "all" || filterStatus !== "all")
                  ? "bg-[var(--accent-bg)] border-[var(--accent-border)] text-[var(--accent-text)] hover:bg-[var(--accent-primary)] hover:border-[var(--accent-primary)]"
                  : "bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent text-foreground hover:text-foreground"
              )}
            >
              <Filter className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Filter</span>
            </Button>

            <ViewSwitcher
              viewMode={viewMode}
              onViewModeChange={setViewMode}
            />
          </div>
        </div>
      </Card>

      {/* Loading State */}
      {loading && displayedItems.length === 0 ? (
        <div className="space-y-4">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="p-4 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1" />
                    <div className="h-4 w-full max-w-md bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
              </div>
            </Card>
          ))}
        </div>
      ) : displayedItems.length === 0 ? (
        <EmptyState
          icon={Bug}
          title="No backlog items found"
          description={
            debouncedSearchTerm || filterType !== "all" || filterStatus !== "all"
              ? "Try adjusting your search or filters" 
              : "Get started by logging your first issue or feature request"
          }
          action={{
            label: "Add New Item",
            onClick: handleAddItem,
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
            {displayedItems.map(item => 
              viewMode === "grid" ? renderItemCard(item) : renderItemListItem(item)
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

      {/* Backlog Form Dialog */}
      <BacklogFormDialog
        open={showFormDialog}
        onOpenChange={setShowFormDialog}
        mode={dialogMode}
        item={selectedItem}
        onSuccess={() => {
          setShowFormDialog(false);
          setSelectedItem(null);
          // Reload items with current filters
          const offset = (currentPage - 1) * itemsPerPage;
          const filters: any = {
            limit: itemsPerPage,
            offset: offset,
            page: currentPage,
          };
          if (debouncedSearchTerm.trim()) {
            filters.search = debouncedSearchTerm.trim();
          }
          if (filterType !== "all") {
            filters.type = filterType;
          }
          if (filterStatus !== "all") {
            filters.status = filterStatus;
          }
          dispatch(fetchBacklogItemsRequest(filters));
        }}
      />

      {/* Filter Right Panel */}
      <RightPanel
        open={isFilterPanelOpen}
        onOpenChange={setIsFilterPanelOpen}
        title="Filters"
        contentClassName="bg-background"
      >
        <div className="space-y-4">
          {/* Type Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Type</label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Issue">Issues Only</SelectItem>
                <SelectItem value="Feature">Features Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Status Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Status</label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Done">Done</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filter Results Count */}
          {(debouncedSearchTerm || filterType !== "all" || filterStatus !== "all") && (
            <div className="pt-4 border-t border-border space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Results</span>
                <Badge variant="outline" className="bg-[var(--accent-bg)] text-[var(--accent-text)] border-[var(--accent-border)]">
                  {displayedItems.length} items
                </Badge>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setDebouncedSearchTerm("");
                  setFilterType("all");
                  setFilterStatus("all");
                }}
                className="w-full bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground hover:bg-accent hover:text-foreground"
              >
                Clear All Filters
              </Button>
            </div>
          )}
        </div>
      </RightPanel>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && itemToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] max-w-md w-full mx-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Delete Backlog Item</h3>
                <p className="text-sm text-muted-foreground">This action cannot be undone</p>
              </div>
            </div>
            <p className="text-foreground mb-6">
              Are you sure you want to delete <strong>{itemToDelete.title}</strong>?
            </p>
            <div className="flex items-center justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowDeleteDialog(false);
                  setItemToDelete(null);
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
};
