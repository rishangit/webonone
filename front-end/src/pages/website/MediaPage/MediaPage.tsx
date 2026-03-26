import { useState, useEffect, useCallback, useMemo } from "react";
import { FolderOpen, FolderPlus, Upload } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAppSelector } from "@/store/hooks";
import { companyWebMediaService } from "@/services/companyWebMedia";
import type { MediaFolder, MediaFile } from "@/services/companyWebMedia";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";
import { EmptyState } from "@/components/common/EmptyState";
import { toast } from "sonner";
import type { MediaItem } from "./components";
import { MediaFilters, MediaCard, MediaUploadDialog } from "./components";

export const MediaPage = () => {
  const { userCompany, currentCompany } = useAppSelector((state) => state.companies);
  const company = currentCompany || userCompany;
  const companyId = company?.id;

  const [currentPath, setCurrentPath] = useState("");
  const [folders, setFolders] = useState<MediaFolder[]>([]);
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    path: string;
    name: string;
    type: "file" | "folder";
  } | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const loadDir = useCallback(async () => {
    if (!companyId) return;
    setLoading(true);
    try {
      const data = await companyWebMediaService.list(companyId, currentPath);
      setFolders(data.folders);
      setFiles(data.files);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load media");
      setFolders([]);
      setFiles([]);
    } finally {
      setLoading(false);
    }
  }, [companyId, currentPath]);

  useEffect(() => {
    loadDir();
  }, [loadDir]);

  const pathSegments = currentPath ? currentPath.split("/").filter(Boolean) : [];

  const handleBreadcrumb = (index: number) => {
    if (index < 0) setCurrentPath("");
    else setCurrentPath(pathSegments.slice(0, index + 1).join("/"));
  };

  const handleOpenFolder = (path: string) => {
    setCurrentPath(path);
  };

  const handleCreateFolder = async () => {
    const name = newFolderName.trim();
    if (!name || !companyId) return;
    try {
      await companyWebMediaService.createFolder(companyId, currentPath, name);
      toast.success("Folder created");
      setIsNewFolderOpen(false);
      setNewFolderName("");
      loadDir();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create folder");
    }
  };

  const handleUploadComplete = useCallback(() => {
    loadDir();
  }, [loadDir]);

  const handleDeleteClick = (
    path: string,
    name: string,
    type: "file" | "folder"
  ) => {
    setDeleteTarget({ path, name, type });
    setIsDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget || !companyId) return;
    try {
      await companyWebMediaService.delete(
        companyId,
        deleteTarget.path,
        deleteTarget.type
      );
      toast.success(
        deleteTarget.type === "folder" ? "Folder deleted" : "File deleted"
      );
      setDeleteTarget(null);
      setIsDeleteOpen(false);
      loadDir();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const mediaItems: MediaItem[] = useMemo(() => {
    const q = debouncedSearchTerm.toLowerCase().trim();
    const filter = (name: string) =>
      !q || name.toLowerCase().includes(q);
    const folderItems: MediaItem[] = folders
      .filter((f) => filter(f.name))
      .map((f) => ({ type: "folder" as const, name: f.name, path: f.path }));
    const fileItems: MediaItem[] = files
      .filter((f) => filter(f.name))
      .map((f) => ({
        type: "file" as const,
        name: f.name,
        path: f.path,
        size: f.size,
        isImage: f.isImage,
        modifiedAt: f.modifiedAt,
      }));
    return [...folderItems, ...fileItems];
  }, [folders, files, debouncedSearchTerm]);

  const showSkeleton = loading && folders.length === 0 && files.length === 0;
  const showEmpty = !loading && mediaItems.length === 0;

  if (!companyId) {
    return (
      <div className="flex-1 p-4 lg:p-6 flex flex-col min-h-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
              Media
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage media files and folders
            </p>
          </div>
        </div>
        <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
          <div className="text-center py-8">
            <FolderOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-foreground mb-4">
              Please select a company to manage media.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 lg:p-6 flex flex-col min-h-0">
      {/* Header - aligned with ThemePage / WebpagesPage */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">
            Media
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage media files and folders for your website
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            className="bg-[var(--glass-bg)] border-[var(--glass-border)]"
            onClick={() => setIsNewFolderOpen(true)}
          >
            <FolderPlus className="w-4 h-4 mr-2" />
            New folder
          </Button>
          <Button
            type="button"
            variant="accent"
            onClick={() => setIsUploadDialogOpen(true)}
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>
      </div>

      {/* Breadcrumb */}
      <Card className="p-4 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] mb-6">
        <nav className="flex items-center gap-2 text-sm">
          <button
            type="button"
            onClick={() => handleBreadcrumb(-1)}
            className="text-[var(--accent-text)] hover:underline font-medium"
          >
            Media
          </button>
          {pathSegments.map((seg, i) => (
            <span key={i} className="flex items-center gap-2">
              <span className="text-muted-foreground">/</span>
              <button
                type="button"
                onClick={() => handleBreadcrumb(i)}
                className="text-[var(--accent-text)] hover:underline font-medium"
              >
                {seg}
              </button>
            </span>
          ))}
        </nav>
      </Card>

      {/* Filters - search + view mode */}
      <MediaFilters
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        onDebouncedSearchTermChange={setDebouncedSearchTerm}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Body - skeleton, list/grid, or empty */}
      <div className="flex flex-col flex-1 min-h-[calc(100vh-300px)]">
        <div className="flex flex-col flex-1 min-h-0">
          {showSkeleton ? (
            <div className="flex-1">
              {viewMode === "list" ? (
                <div className="space-y-4">
                  {[...Array(6)].map((_, i) => (
                    <Card
                      key={i}
                      className="p-6 bg-[var(--glass-bg)] border-[var(--glass-border)]"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-lg bg-muted/50 animate-pulse flex-shrink-0" />
                        <div className="flex-1">
                          <div className="h-5 w-48 bg-muted/50 rounded animate-pulse mb-2" />
                          <div className="h-4 w-32 bg-muted/50 rounded animate-pulse" />
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {[...Array(8)].map((_, i) => (
                    <Card
                      key={i}
                      className="p-6 bg-[var(--glass-bg)] border-[var(--glass-border)]"
                    >
                      <div className="aspect-square w-full max-w-[140px] mx-auto rounded-lg bg-muted/50 animate-pulse mb-3" />
                      <div className="h-4 w-24 bg-muted/50 rounded animate-pulse mx-auto" />
                    </Card>
                  ))}
                </div>
              )}
            </div>
          ) : showEmpty ? (
            <EmptyState
              icon={FolderOpen}
              title="No folders or files"
              description={
                searchTerm
                  ? "Try adjusting your search."
                  : "This folder is empty. Create a folder or upload files."
              }
              action={
                !searchTerm
                  ? {
                      label: "New folder",
                      onClick: () => setIsNewFolderOpen(true),
                      variant: "accent",
                      icon: FolderPlus,
                    }
                  : undefined
              }
            />
          ) : (
            <div className="flex-1">
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {mediaItems.map((item) => (
                    <MediaCard
                      key={item.path}
                      item={item}
                      companyId={companyId}
                      viewMode="grid"
                      formatSize={formatSize}
                      onOpen={handleOpenFolder}
                      onDelete={handleDeleteClick}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {mediaItems.map((item) => (
                    <MediaCard
                      key={item.path}
                      item={item}
                      companyId={companyId}
                      viewMode="list"
                      formatSize={formatSize}
                      onOpen={handleOpenFolder}
                      onDelete={handleDeleteClick}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* New folder modal */}
      {isNewFolderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="p-6 w-full max-w-md mx-4 bg-background border border-[var(--glass-border)]">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              New folder
            </h3>
            <input
              type="text"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="Folder name"
              className="w-full px-3 py-2 rounded-md border border-[var(--glass-border)] bg-[var(--input-background)] text-foreground mb-4"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleCreateFolder();
                if (e.key === "Escape") setIsNewFolderOpen(false);
              }}
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsNewFolderOpen(false);
                  setNewFolderName("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="accent"
                onClick={handleCreateFolder}
                disabled={!newFolderName.trim()}
              >
                Create
              </Button>
            </div>
          </Card>
        </div>
      )}

      <MediaUploadDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        companyId={companyId}
        currentPath={currentPath}
        onUploadComplete={handleUploadComplete}
      />

      <DeleteConfirmationDialog
        open={isDeleteOpen}
        onOpenChange={(open) => {
          setIsDeleteOpen(open);
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleDeleteConfirm}
        itemName={deleteTarget?.name}
        itemType={deleteTarget?.type === "folder" ? "folder" : "file"}
      />
    </div>
  );
};
