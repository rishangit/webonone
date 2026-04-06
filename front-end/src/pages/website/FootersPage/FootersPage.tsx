import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CustomDialog } from "@/components/ui/custom-dialog";
import { useAppSelector } from "@/store/hooks";
import { companyWebFootersService, type CompanyWebFooter } from "@/services/companyWebFooters";
import { AddFooterDialog, FooterCard, type AddFooterFormValues } from "./components";
import { toast } from "sonner";

export const FootersPage = () => {
  const navigate = useNavigate();
  const { userCompany, currentCompany } = useAppSelector((state) => state.companies);
  const company = currentCompany || userCompany;
  const companyId = company?.id;

  const [footers, setFooters] = useState<CompanyWebFooter[]>([]);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CompanyWebFooter | null>(null);

  const loadFooters = useCallback(async () => {
    if (!companyId) {
      setFooters([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const list = await companyWebFootersService.getFooters(companyId);
      setFooters(list);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to load footers");
      setFooters([]);
    } finally {
      setLoading(false);
    }
  }, [companyId]);

  useEffect(() => {
    void loadFooters();
  }, [loadFooters]);

  const handleAdd = async (values: AddFooterFormValues) => {
    if (!companyId) return;
    setCreating(true);
    try {
      const created = await companyWebFootersService.createFooter({
        companyId,
        name: values.name.trim(),
        isDefault: values.isDefault === true,
      });
      toast.success("Footer created");
      setAddOpen(false);
      setFooters((prev) => {
        const next = [...prev, created];
        return next.sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
      });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to create footer");
    } finally {
      setCreating(false);
    }
  };

  const handleEditDesigner = (footer: CompanyWebFooter) => {
    navigate(`/system/web/footers/${footer.id}/edit`);
  };

  const handleSetDefault = async (footer: CompanyWebFooter) => {
    try {
      await companyWebFootersService.updateFooter(footer.id, { isDefault: true });
      toast.success("Default footer updated");
      await loadFooters();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to update");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await companyWebFootersService.deleteFooter(deleteTarget.id);
      toast.success("Footer deleted");
      setDeleteTarget(null);
      await loadFooters();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to delete");
    }
  };

  if (!companyId) {
    return (
      <div className="flex-1 p-4 lg:p-6 flex flex-col min-h-0">
        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Footers</h1>
          <p className="text-muted-foreground mt-1">Select a company to manage site footers.</p>
        </div>
        <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
          <p className="text-center text-muted-foreground py-8">Please select a company from the header bar.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 lg:p-6 flex flex-col min-h-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Footers</h1>
          <p className="text-muted-foreground mt-1">
            Create footers for your public site. The default footer stays visible while visitors navigate between
            pages.
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)} variant="accent">
          <Plus className="w-4 h-4 mr-2" />
          Add footer
        </Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Loading…</p>
      ) : footers.length === 0 ? (
        <Card className="p-8 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] text-center">
          <p className="text-muted-foreground mb-4">No footers yet. Add one to show a site-wide footer bar.</p>
          <Button variant="accent" onClick={() => setAddOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add footer
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {footers.map((f) => (
            <FooterCard
              key={f.id}
              footer={f}
              onEditDesigner={handleEditDesigner}
              onSetDefault={handleSetDefault}
              onDelete={(footer) => setDeleteTarget(footer)}
            />
          ))}
        </div>
      )}

      <AddFooterDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={handleAdd}
        isSubmitting={creating}
      />

      <CustomDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
        title="Delete footer?"
        description={
          deleteTarget
            ? `This removes "${deleteTarget.name}". Pages will no longer show this footer unless you assign another default.`
            : ""
        }
        sizeWidth="small"
        sizeHeight="small"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-10 px-4 border-[var(--glass-border)] text-foreground hover:bg-accent"
              onClick={() => setDeleteTarget(null)}
            >
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDeleteConfirm}>
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        }
      >
        <div className="sr-only">Confirm deletion of this footer.</div>
      </CustomDialog>
    </div>
  );
};
