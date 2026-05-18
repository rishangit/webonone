import { useCallback, useEffect, useRef, useState } from "react";
import { Database, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CustomDialog } from "@/components/ui/custom-dialog";
import { SearchInput } from "@/components/common/SearchInput";
import { EmptyState } from "@/components/common/EmptyState";
import { formatAvatarUrl } from "@/shared/utils";
import { systemServicesService, type SystemService } from "@/features/services/services/systemServices";

const ITEMS_PER_PAGE = 20;

export interface SelectSystemServiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When user confirms a catalog row (footer primary). */
  onSelectService: (service: SystemService) => void;
  /**
   * Open the nested system-service wizard from the picker footer.
   * Mirrors **`AddProductToCompanyDialog`** — the button is always visible; the backend
   * already gates `POST /system-services` to `manage_company` (COMPANY_OWNER and above).
   */
  onRequestCreateCatalog: () => void;
  /** Increment to refetch catalog list (e.g. after creating a system service). */
  catalogRefreshKey?: number;
}

export function SelectSystemServiceDialog({
  open,
  onOpenChange,
  onSelectService,
  onRequestCreateCatalog,
  catalogRefreshKey = 0,
}: SelectSystemServiceDialogProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<SystemService[]>([]);
  const [total, setTotal] = useState(0);
  const [initialLoading, setInitialLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fetchLock = useRef(false);

  const hasMore = rows.length < total;

  const loadPage = useCallback(
    async (nextPage: number, reset: boolean) => {
      if (fetchLock.current) return;
      fetchLock.current = true;
      try {
        if (nextPage === 1) setInitialLoading(true);
        else setLoadingMore(true);
        const { services, pagination } = await systemServicesService.getSystemServices({
          page: nextPage,
          limit: ITEMS_PER_PAGE,
          search: debouncedSearch.trim() || undefined,
          isActive: true,
        });
        setTotal(pagination.total);
        setPage(nextPage);
        setRows((prev) => {
          if (reset || nextPage === 1) return services;
          const seen = new Set(prev.map((s) => s.id));
          return [...prev, ...services.filter((s) => !seen.has(s.id))];
        });
      } catch {
        if (reset || nextPage === 1) setRows([]);
        setTotal(0);
      } finally {
        setInitialLoading(false);
        setLoadingMore(false);
        fetchLock.current = false;
      }
    },
    [debouncedSearch]
  );

  useEffect(() => {
    if (!open) {
      setSearchTerm("");
      setDebouncedSearch("");
      setRows([]);
      setTotal(0);
      setPage(1);
      setSelectedId(null);
      return;
    }
    setSelectedId(null);
    loadPage(1, true);
  }, [open, debouncedSearch, catalogRefreshKey, loadPage]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el || initialLoading || loadingMore || !hasMore) return;
    const nearBottom = el.scrollHeight - (el.scrollTop + el.clientHeight) < 120;
    if (nearBottom) loadPage(page + 1, false);
  };

  const selected = rows.find((s) => s.id === selectedId) ?? null;

  const handleContinue = () => {
    if (!selected) return;
    onSelectService(selected);
  };

  return (
    <CustomDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Choose system service"
      description="Pick a catalog service to customize for your company. The first gallery image on the template is used as the default thumbnail."
      icon={<Database className="w-5 h-5" />}
      sizeWidth="large"
      sizeHeight="large"
      footer={
        <div className="flex items-center justify-end gap-2 flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="default"
            className="h-10 px-4 border-[var(--glass-border)] text-foreground hover:bg-accent"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="outline"
            size="default"
            className="h-10 px-4 border-[var(--glass-border)] text-foreground hover:bg-accent"
            onClick={(e) => {
              e.preventDefault();
              onRequestCreateCatalog();
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New System Service
          </Button>
          <Button type="button" variant="accent" size="default" className="h-10" disabled={!selected} onClick={handleContinue}>
            Continue
          </Button>
        </div>
      }
    >
      <div className="space-y-4 flex flex-col min-h-0">
        <SearchInput
          value={searchTerm}
          onChange={setSearchTerm}
          onDebouncedChange={setDebouncedSearch}
          debounceDelay={300}
          placeholder="Search catalog services…"
          className="w-full"
        />
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="min-h-[280px] max-h-[min(60vh,420px)] overflow-y-auto custom-scrollbar"
        >
          {initialLoading ? (
            <div className="h-48 flex items-center justify-center text-sm text-muted-foreground">Loading catalog…</div>
          ) : rows.length === 0 ? (
            <EmptyState
              className="!p-8 border-0 shadow-none bg-transparent"
              icon={Database}
              title="No services found"
              description={debouncedSearch.trim() ? `Nothing matches “${debouncedSearch.trim()}”.` : "No active catalog services are available yet."}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {rows.map((svc) => {
                const img = svc.images?.[0] || svc.image;
                const active = selectedId === svc.id;
                return (
                  <Card
                    key={svc.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedId(svc.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedId(svc.id);
                      }
                    }}
                    className={`p-3 cursor-pointer border transition-colors ${
                      active ? "border-[var(--accent-primary)] ring-1 ring-[var(--accent-primary)]" : "border-[var(--glass-border)] hover:bg-accent/40"
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="w-20 h-20 shrink-0 rounded-md overflow-hidden bg-muted border border-[var(--glass-border)]">
                        {img ? (
                          <img src={formatAvatarUrl(img)} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">No image</div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-foreground truncate">{svc.name}</div>
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{svc.description || "—"}</p>
                        {svc.defaultDuration != null && (
                          <p className="text-xs text-muted-foreground mt-1">{svc.defaultDuration} min template</p>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
          {loadingMore && <div className="text-center text-xs text-muted-foreground py-2">Loading more…</div>}
        </div>
      </div>
    </CustomDialog>
  );
}
