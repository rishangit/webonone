import { useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchCustomFormRequest,
  updateCustomFormRequest,
  clearCustomFormsError,
} from '@/features/customForms/store';
import { VisualFormEditor, type VisualFormEditorSnapshot } from './VisualFormEditor';

export const FormBuilderEditor = () => {
  const { formId } = useParams<{ formId: string }>();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { currentForm, error } = useAppSelector((state) => state.customForms);

  useEffect(() => {
    if (formId) dispatch(fetchCustomFormRequest(formId));
  }, [dispatch, formId]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearCustomFormsError());
    }
  }, [error, dispatch]);

  const loadedSnapshot = useMemo((): VisualFormEditorSnapshot | null => {
    if (!currentForm?.definition) return null;
    return { definition: currentForm.definition };
  }, [currentForm]);

  const handleSave = async (snapshot: VisualFormEditorSnapshot) => {
    if (!formId) return;
    dispatch(
      updateCustomFormRequest({
        id: formId,
        data: { definition: snapshot.definition },
      })
    );
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      <VisualFormEditor
        title={currentForm?.name ? `Builder: ${currentForm.name}` : 'Form builder'}
        resetKey={currentForm?.id ?? formId ?? ''}
        loadedSnapshot={loadedSnapshot}
        isEntityReady={Boolean(currentForm && currentForm.id === formId)}
        onSave={handleSave}
        onBack={() => navigate('/system/custom-forms')}
      />
    </div>
  );
};
