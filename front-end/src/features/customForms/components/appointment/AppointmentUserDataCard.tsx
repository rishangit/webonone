import { useEffect, useState } from 'react';
import { ClipboardList, Eye, Plus, Trash2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CardTitle } from '@/components/common/CardTitle';
import { DateDisplay } from '@/components/common/DateDisplay';
import { DeleteConfirmationDialog } from '@/components/common/DeleteConfirmationDialog';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchSubmissionsRequest } from '@/features/customForms/store';
import {
  companyCustomFormsService,
  type CompanyCustomForm,
} from '@/features/customForms/services/companyCustomForms';
import {
  companyCustomFormSubmissionsService,
  type CompanyCustomFormSubmission,
} from '@/features/customForms/services/companyCustomFormSubmissions';
import { SelectCustomFormDialog } from './SelectCustomFormDialog';
import { FillCustomFormDialog } from './FillCustomFormDialog';
import { ViewSubmissionDialog } from './ViewSubmissionDialog';
import { toast } from 'sonner';

interface AppointmentUserDataCardProps {
  appointmentId: string;
  companyId: string;
  clientId?: string | null;
  canManage: boolean;
}

export const AppointmentUserDataCard = ({
  appointmentId,
  companyId,
  clientId,
  canManage,
}: AppointmentUserDataCardProps) => {
  const dispatch = useAppDispatch();
  const { submissions } = useAppSelector((state) => state.customForms);
  const [activeForms, setActiveForms] = useState<CompanyCustomForm[]>([]);
  const [formsLoading, setFormsLoading] = useState(false);
  const [selectOpen, setSelectOpen] = useState(false);
  const [fillOpen, setFillOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState<CompanyCustomForm | null>(null);
  const [viewSubmission, setViewSubmission] = useState<CompanyCustomFormSubmission | null>(null);
  const [viewForm, setViewForm] = useState<CompanyCustomForm | null>(null);
  const [viewOpen, setViewOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<CompanyCustomFormSubmission | null>(null);

  const loadSubmissions = () => {
    dispatch(fetchSubmissionsRequest({ appointmentId }));
  };

  useEffect(() => {
    dispatch(fetchSubmissionsRequest({ appointmentId }));
  }, [appointmentId, dispatch]);

  const loadActiveForms = async () => {
    setFormsLoading(true);
    try {
      const forms = await companyCustomFormsService.getForms(companyId, true);
      setActiveForms(forms);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to load forms');
    } finally {
      setFormsLoading(false);
    }
  };

  const handleAddClick = () => {
    loadActiveForms();
    setSelectOpen(true);
  };

  const handleSelectForm = (form: CompanyCustomForm) => {
    setSelectedForm(form);
    setFillOpen(true);
  };

  const handleView = async (sub: CompanyCustomFormSubmission) => {
    try {
      const form = await companyCustomFormsService.getFormById(sub.formId);
      setViewForm(form);
      setViewSubmission(sub);
      setViewOpen(true);
    } catch {
      setViewForm(null);
      setViewSubmission(sub);
      setViewOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await companyCustomFormSubmissionsService.deleteSubmission(deleteTarget.id);
      toast.success('Submission deleted');
      loadSubmissions();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to delete');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
      <div className="flex items-center justify-between gap-3 mb-4">
        <CardTitle title="User Data" icon={ClipboardList} />
        {canManage && (
          <Button type="button" variant="accent" size="sm" onClick={handleAddClick}>
            <Plus className="w-4 h-4 mr-2" />
            Add User Data
          </Button>
        )}
      </div>

      {submissions.length === 0 ? (
        <p className="text-sm text-muted-foreground">No form data attached to this appointment yet.</p>
      ) : (
        <ul className="space-y-3">
          {submissions.map((sub) => (
            <li
              key={sub.id}
              className="flex items-center justify-between gap-3 p-3 rounded-lg border border-[var(--glass-border)] bg-background/50"
            >
              <div className="min-w-0">
                <p className="font-medium text-foreground truncate">
                  {sub.formName || 'Form submission'}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {sub.createdAt && <DateDisplay date={sub.createdAt} />}
                  {sub.submittedByName ? ` · ${sub.submittedByName}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleView(sub)}>
                  <Eye className="w-4 h-4" />
                </Button>
                {canManage && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-600 dark:text-red-400"
                    onClick={() => setDeleteTarget(sub)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      <SelectCustomFormDialog
        open={selectOpen}
        onOpenChange={setSelectOpen}
        forms={activeForms}
        loading={formsLoading}
        onSelect={handleSelectForm}
      />
      <FillCustomFormDialog
        open={fillOpen}
        onOpenChange={setFillOpen}
        form={selectedForm}
        companyId={companyId}
        appointmentId={appointmentId}
        clientId={clientId}
        onSaved={loadSubmissions}
      />
      <ViewSubmissionDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        submission={viewSubmission}
        form={viewForm}
      />
      <DeleteConfirmationDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete form submission"
        description="Remove this form data from the appointment?"
        onConfirm={handleDeleteConfirm}
      />
    </Card>
  );
};
