import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchCustomFormsRequest,
  createCustomFormRequest,
  updateCustomFormRequest,
  deleteCustomFormRequest,
  duplicateCustomFormRequest,
  clearCustomFormsError,
} from '../store';
import { CompanyCustomForm } from '../services/companyCustomForms';

const ITEMS_PER_PAGE_OPTIONS = [12, 24, 48];

export const useCustomFormsPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { forms, loading, error } = useAppSelector((state) => state.customForms);
  const { userCompany, currentCompany } = useAppSelector((state) => state.companies);
  const company = currentCompany || userCompany;
  const companyId = company?.id;

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE_OPTIONS[0]);
  const [formToDelete, setFormToDelete] = useState<CompanyCustomForm | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isMetaDialogOpen, setIsMetaDialogOpen] = useState(false);
  const [editingForm, setEditingForm] = useState<CompanyCustomForm | null>(null);

  useEffect(() => {
    if (companyId) {
      dispatch(fetchCustomFormsRequest({ companyId }));
    }
  }, [dispatch, companyId]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearCustomFormsError());
    }
  }, [error, dispatch]);

  const filteredForms = useMemo(() => {
    let list = forms;
    if (debouncedSearchTerm.trim()) {
      const q = debouncedSearchTerm.toLowerCase();
      list = list.filter(
        (f) =>
          f.name?.toLowerCase().includes(q) ||
          (f.description && f.description.toLowerCase().includes(q))
      );
    }
    if (filterStatus === 'active') list = list.filter((f) => f.isActive);
    if (filterStatus === 'inactive') list = list.filter((f) => !f.isActive);
    return list;
  }, [forms, debouncedSearchTerm, filterStatus]);

  const pagination = useMemo(() => {
    const total = filteredForms.length;
    const totalPages = Math.max(1, Math.ceil(total / itemsPerPage));
    const start = (currentPage - 1) * itemsPerPage;
    return { total, totalPages, start, end: start + itemsPerPage };
  }, [filteredForms.length, currentPage, itemsPerPage]);

  const displayedForms = useMemo(
    () => filteredForms.slice(pagination.start, pagination.end),
    [filteredForms, pagination.start, pagination.end]
  );

  const handleOpenBuilder = (form: CompanyCustomForm) => {
    navigate(`/system/custom-forms/${form.id}/builder`);
  };

  const handleEditMeta = (form: CompanyCustomForm) => {
    setEditingForm(form);
    setIsMetaDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingForm(null);
    setIsMetaDialogOpen(true);
  };

  const handleMetaSubmit = (data: {
    name: string;
    description?: string;
    isActive?: boolean;
  }) => {
    if (!companyId) {
      toast.error('Please select a company');
      return;
    }
    if (editingForm) {
      dispatch(
        updateCustomFormRequest({
          id: editingForm.id,
          data: {
            name: data.name,
            description: data.description ?? null,
            isActive: data.isActive,
          },
        })
      );
    } else {
      dispatch(
        createCustomFormRequest({
          companyId,
          name: data.name,
          description: data.description ?? null,
          isActive: data.isActive ?? true,
        })
      );
    }
    setIsMetaDialogOpen(false);
    setEditingForm(null);
  };

  const handleDuplicate = (form: CompanyCustomForm) => {
    dispatch(duplicateCustomFormRequest(form.id));
  };

  const handleDeleteClick = (form: CompanyCustomForm) => {
    setFormToDelete(form);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (formToDelete) {
      dispatch(deleteCustomFormRequest(formToDelete.id));
      setIsDeleteDialogOpen(false);
      setFormToDelete(null);
    }
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setDebouncedSearchTerm('');
    setFilterStatus('all');
    setCurrentPage(1);
  };

  return {
    companyId,
    searchTerm,
    setSearchTerm,
    debouncedSearchTerm,
    setDebouncedSearchTerm,
    filterStatus,
    setFilterStatus,
    currentPage,
    setCurrentPage,
    itemsPerPage,
    setItemsPerPage,
    itemsPerPageOptions: ITEMS_PER_PAGE_OPTIONS,
    displayedForms,
    filteredForms,
    loading,
    pagination,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isMetaDialogOpen,
    setIsMetaDialogOpen,
    editingForm,
    formToDelete,
    handleOpenBuilder,
    handleEditMeta,
    handleAdd,
    handleMetaSubmit,
    handleDuplicate,
    handleDeleteClick,
    handleDeleteConfirm,
    handleClearFilters,
  };
};
