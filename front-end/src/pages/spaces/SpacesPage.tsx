import { useState, useEffect, useMemo } from "react";
import { Plus, MapPin, Users, Calendar, MoreVertical, Edit, Trash2, Eye } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "../../components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import FileUpload from "../../components/ui/file-upload";
import { CustomDialog } from "../../components/ui/custom-dialog";
import { Label } from "../../components/ui/label";
import { TagSelector } from "../../components/tags/TagSelector";
import { Textarea } from "../../components/ui/textarea";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogAction } from "../../components/ui/alert-dialog";
import { ViewSwitcher } from "../../components/ui/view-switcher";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { 
  fetchSpacesRequest, 
  createSpaceRequest, 
  updateSpaceRequest, 
  deleteSpaceRequest,
  clearError 
} from "../../store/slices/spacesSlice";
import { Space as SpaceType } from "../../services/spaces";
import { formatAvatarUrl } from "../../utils";
import { SearchInput } from "../../components/common/SearchInput";
import { Pagination } from "../../components/common/Pagination";
import { EmptyState } from "../../components/common/EmptyState";

export const SpacesPage = () => {
  const dispatch = useAppDispatch();
  const { spaces: reduxSpaces, loading, error, pagination } = useAppSelector((state) => state.spaces);
  const { user } = useAppSelector((state) => state.auth);
  
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [selectedSpace, setSelectedSpace] = useState<SpaceType | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
    status: "Active" as SpaceType["status"],
    description: "",
    imageUrl: "",
    tagIds: [] as string[]
  });

  // Get company ID from user
  const companyId = user?.companyId;

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

      // Add search
      if (debouncedSearchTerm.trim()) {
        filters.search = debouncedSearchTerm.trim();
      }

      // Add status filter
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

  // Transform spaces to include appointments (default to 0 for now)
  const spaces = useMemo(() => {
    return reduxSpaces.map(space => ({
      ...space,
      appointments: space.appointments || { today: 0, thisWeek: 0 }
    }));
  }, [reduxSpaces]);

  // For server-side pagination, we use spaces directly (no client-side filtering)
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

  const openEditDialog = (space: SpaceType) => {
    setSelectedSpace(space);
    // Extract tagIds from space.tags array
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

  const openViewDialog = (space: SpaceType) => {
    setSelectedSpace(space);
    setIsViewDialogOpen(true);
  };

  const openDeleteDialog = (space: SpaceType) => {
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

    const spaceData = {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active": return "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30";
      case "Inactive": return "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30";
      case "Maintenance": return "bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30";
      default: return "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30";
    }
  };


  const getImageUrl = (space: SpaceType) => {
    if (space.imageUrl) {
      return formatAvatarUrl(space.imageUrl);
    }
    return "https://images.unsplash.com/photo-1497366216548-37526070297c?w=300&h=200&fit=crop";
  };

  const SpaceCard = ({ space }: { space: SpaceType & { appointments?: { today: number; thisWeek: number } } }) => (
    <Card className="overflow-hidden backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-300 hover:shadow-lg hover:shadow-[var(--glass-shadow)] group">
      <div className="relative h-48 overflow-hidden">
        <img 
          src={getImageUrl(space)} 
          alt={space.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3">
          <Badge className={`${getStatusColor(space.status)} backdrop-blur-sm border`}>
            {space.status}
          </Badge>
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">{space.name}</h3>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-popover border-border" align="end">
              <DropdownMenuItem onClick={() => openViewDialog(space)}>
                <Eye className="w-4 h-4 mr-2" />
                View Details
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => openEditDialog(space)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit Space
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="text-red-600 dark:text-red-400"
                onClick={() => openDeleteDialog(space)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>Capacity: {space.capacity} people</span>
          </div>

          {space.description && (
          <p className="text-sm text-foreground line-clamp-2">{space.description}</p>
          )}
        </div>
      </div>
    </Card>
  );

  const SpaceListItem = ({ space }: { space: SpaceType & { appointments?: { today: number; thisWeek: number } } }) => (
    <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-300 hover:shadow-lg hover:shadow-[var(--glass-shadow)]">
      <div className="flex items-center gap-6">
        <div className="flex-shrink-0">
          <img 
            src={getImageUrl(space)} 
            alt={space.name}
            className="w-20 h-16 object-cover rounded-lg"
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-lg font-semibold text-foreground">{space.name}</h3>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={`${getStatusColor(space.status)} border`}>
                {space.status}
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>Capacity: {space.capacity}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{space.appointments?.today || 0} appointments today</span>
            </div>
          </div>
          
          {space.description && (
          <p className="text-sm text-foreground mb-3 line-clamp-1">{space.description}</p>
          )}
          
          <div className="flex items-center justify-end">
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-popover border-border" align="end">
                  <DropdownMenuItem onClick={() => openViewDialog(space)}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => openEditDialog(space)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Space
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600 dark:text-red-400"
                    onClick={() => openDeleteDialog(space)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Spaces Management</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Manage your company's rooms, sections, and facilities</p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button variant="accent" className="text-sm" onClick={openAddDialog}>
            <Plus className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Add Space</span>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--glass-shadow)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Spaces</p>
              <p className="text-xl font-semibold text-foreground">{spaces.length}</p>
            </div>
            <MapPin className="w-8 h-8 text-orange-600 dark:text-orange-400" />
          </div>
        </Card>
        
        <Card className="p-4 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--glass-shadow)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Active Spaces</p>
              <p className="text-xl font-semibold text-foreground">{spaces.filter(s => s.status === "Active").length}</p>
            </div>
            <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </Card>
        
        <Card className="p-4 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--glass-shadow)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Today's Bookings</p>
              <p className="text-xl font-semibold text-foreground">{spaces.reduce((acc, space) => acc + space.appointments.today, 0)}</p>
            </div>
            <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
        </Card>
        
      </div>

      {/* Filters and Search */}
      <Card className="p-4 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
        <div className="space-y-4">
          <SearchInput
            placeholder="Search spaces by name or description..."
            value={searchTerm}
            onChange={setSearchTerm}
            onDebouncedChange={setDebouncedSearchTerm}
            debounceDelay={500}
          />
          
          {/* Filters and View Mode */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40 bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Maintenance">Maintenance</SelectItem>
                </SelectContent>
              </Select>
              {(debouncedSearchTerm || filterStatus !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setDebouncedSearchTerm("");
                    setFilterStatus("all");
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

      {/* Spaces Grid/List */}
      {loading && displayedSpaces.length === 0 ? (
        <Card className="p-12 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] text-center">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-primary)]"></div>
          </div>
          <p className="text-muted-foreground mt-4">Loading spaces...</p>
        </Card>
      ) : displayedSpaces.length > 0 ? (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedSpaces.map((space) => (
                <SpaceCard key={space.id} space={space} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {displayedSpaces.map((space) => (
                <SpaceListItem key={space.id} space={space} />
              ))}
            </div>
          )}
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
      ) : (
        <EmptyState
          icon={MapPin}
          title="No spaces found"
          description={
            debouncedSearchTerm || filterStatus !== "all"
              ? "Try adjusting your search criteria or filters"
              : "You haven't added any spaces yet"
          }
          action={{
            label: "Add Your First Space",
            onClick: openAddDialog,
            variant: "accent",
            icon: Plus,
          }}
        />
      )}

      {/* Add/Edit Space Dialog */}
      <CustomDialog
        open={isAddDialogOpen || isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false);
            setIsEditDialogOpen(false);
            resetForm();
          }
        }}
        title={isEditDialogOpen ? "Edit Space" : "Add New Space"}
        description={isEditDialogOpen ? "Update space information and settings." : "Create a new space for your organization."}
        maxWidth="max-w-4xl"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setIsAddDialogOpen(false);
                setIsEditDialogOpen(false);
                resetForm();
              }}
              size="default"
              className="h-10 px-4 border-[var(--glass-border)] text-foreground hover:bg-accent"
            >
              Cancel
            </Button>
            <Button 
              variant="accent"
              onClick={handleSave}
              size="default"
            >
              {isEditDialogOpen ? "Update Space" : "Create Space"}
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
            {/* Image Upload */}
            <div className="space-y-3">
              <Label className="text-foreground">Space Image</Label>
              <FileUpload
                onFileUploaded={handleImageUploaded}
                onFileDeleted={handleImageDeleted}
                currentImagePath={formData.imageUrl}
                currentImageUrl={formData.imageUrl ? formatAvatarUrl(formData.imageUrl) : undefined}
                folderPath={companyId ? `companies/${companyId}/spaces` : 'companies/spaces'}
                label="Upload Space Image"
                maxSize={10}
                className="w-full"
              />
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-foreground">Space Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter space name"
                  className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
                />
              </div>

              <div className="space-y-3">
                <Label htmlFor="capacity" className="text-foreground">Capacity *</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={(e) => setFormData(prev => ({ ...prev, capacity: e.target.value }))}
                  placeholder="Number of people"
                  className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label htmlFor="status" className="text-foreground">Status</Label>
                <Select value={formData.status} onValueChange={(value: SpaceType["status"]) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              </div>

            {/* Tags */}
              <div className="space-y-3">
              <Label className="text-foreground">Tags</Label>
              <TagSelector
                value={formData.tagIds}
                onChange={(tagIds) => setFormData(prev => ({ ...prev, tagIds }))}
                placeholder="Select tags for this space"
              />
            </div>

            {/* Description */}
            <div className="space-y-3">
              <Label htmlFor="description" className="text-foreground">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the space and its features"
                className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
                rows={3}
              />
            </div>
        </div>
      </CustomDialog>

      {/* View Space Dialog */}
      {selectedSpace && (
        <CustomDialog
          open={isViewDialogOpen}
          onOpenChange={setIsViewDialogOpen}
          title={selectedSpace.name}
          description={selectedSpace.description || "Space details"}
          maxWidth="max-w-4xl"
          className="h-[90vh]"
        >
          <div className="space-y-6">
            <div className="w-full h-48 rounded-lg overflow-hidden">
              <img 
                src={getImageUrl(selectedSpace)} 
                alt={selectedSpace.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-muted-foreground">Capacity</Label>
                <p className="text-foreground font-medium">{selectedSpace.capacity} people</p>
              </div>
              <div className="space-y-2">
                <Label className="text-muted-foreground">Status</Label>
                <Badge className={getStatusColor(selectedSpace.status)}>
                  {selectedSpace.status}
                </Badge>
              </div>
            </div>

            {selectedSpace.description && (
              <div className="space-y-2">
                <Label className="text-muted-foreground">Description</Label>
                <p className="text-foreground">{selectedSpace.description}</p>
              </div>
            )}


            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
              <div className="text-center p-4 bg-[var(--glass-bg)] rounded-lg">
                <p className="text-2xl font-bold text-foreground">{selectedSpace.appointments?.today || 0}</p>
                <p className="text-sm text-muted-foreground">Appointments Today</p>
              </div>
              <div className="text-center p-4 bg-[var(--glass-bg)] rounded-lg">
                <p className="text-2xl font-bold text-foreground">{selectedSpace.appointments?.thisWeek || 0}</p>
                <p className="text-sm text-muted-foreground">This Week</p>
              </div>
            </div>
          </div>
        </CustomDialog>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-[var(--glass-bg)] border-[var(--glass-border)] backdrop-blur-sm">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Delete Space</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Are you sure you want to delete "{selectedSpace?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-[var(--glass-border)] text-foreground hover:bg-accent">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete Space
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}