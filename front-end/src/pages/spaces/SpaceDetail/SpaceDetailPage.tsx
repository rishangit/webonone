import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Card } from "../../../components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../components/ui/tabs";
import { spacesService, Space } from "../../../services/spaces";
import { toast } from "sonner";
import { isRole, UserRole } from "../../../types/user";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { useNavigate } from "react-router-dom";
import { fetchSpaceRequest } from "../../../store/slices/spacesSlice";
import { CustomDialog } from "../../../components/ui/custom-dialog";
import { SpaceDetailHeader } from "./SpaceDetailHeader";
import { SpaceOverviewTab } from "./overview/SpaceOverviewTab";
import { SpaceGalleryTab } from "./gallery/SpaceGalleryTab";
import { SpaceStatisticsTab } from "./statistics/SpaceStatisticsTab";

interface SpaceDetailPageProps {
  spaceId: string;
  onBack: () => void;
}

export const SpaceDetailPage = ({ spaceId, onBack }: SpaceDetailPageProps) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { currentSpace, loading } = useAppSelector((state) => state.spaces);
  const isCompanyOwner = isRole(user?.role, UserRole.COMPANY_OWNER);

  const [space, setSpace] = useState<Space | null>(null);
  const [localLoading, setLocalLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("overview");

  useEffect(() => {
    const fetchSpace = async () => {
      try {
        setLocalLoading(true);
        dispatch(fetchSpaceRequest(spaceId));
        const spaceData = await spacesService.getSpaceById(spaceId);
        setSpace(spaceData);
      } catch (error: any) {
        console.error('Error fetching space:', error);
        toast.error(error.message || 'Failed to load space details');
      } finally {
        setLocalLoading(false);
      }
    };

    fetchSpace();
  }, [spaceId, dispatch]);

  // Use Redux currentSpace if available and matches
  useEffect(() => {
    if (currentSpace && currentSpace.id === spaceId) {
      setSpace(currentSpace);
    }
  }, [currentSpace, spaceId]);

  const handleDeleteSpace = async () => {
    if (!space) return;
    
    try {
      setDeleting(true);
      await spacesService.deleteSpace(space.id);
      toast.success("Space deleted successfully");
      onBack();
    } catch (error: any) {
      console.error('Error deleting space:', error);
      toast.error(error.message || "Failed to delete space");
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleEditSpace = () => {
    onBack();
    // Note: Editing is done via dialog in the spaces list page
    toast.info("Navigate to the space in the list to edit");
  };

  if (localLoading || loading) {
    return (
      <div className="flex-1 p-4 lg:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent-primary)] mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading space details...</p>
        </div>
      </div>
    );
  }

  if (!space) {
    return (
      <div className="flex-1 p-4 lg:p-6 flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Space Not Found</h3>
          <p className="text-muted-foreground mb-4">The space you're looking for doesn't exist.</p>
          <Button onClick={onBack} variant="outline">
            Back to Spaces
          </Button>
        </div>
      </div>
    );
  }

  const companyId = user?.companyId || space?.companyId;

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-6 w-full">
      <SpaceDetailHeader
        space={space}
        isCompanyOwner={isCompanyOwner}
        onBack={onBack}
        onEdit={handleEditSpace}
        onDelete={() => setShowDeleteDialog(true)}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="gallery">Gallery</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <SpaceOverviewTab space={space} />
        </TabsContent>

        <TabsContent value="gallery" className="mt-6">
          <SpaceGalleryTab
            space={space}
            companyId={companyId}
            onSpaceUpdate={(updatedSpace) => setSpace(updatedSpace)}
          />
        </TabsContent>

        <TabsContent value="statistics" className="mt-6">
          <SpaceStatisticsTab space={space} />
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <CustomDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Space"
        description={`Are you sure you want to delete "${space.name}"? This action cannot be undone.`}
        footer={
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteSpace}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        }
      >
        <div></div>
      </CustomDialog>
    </div>
  );
};
