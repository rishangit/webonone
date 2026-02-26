import { useState, useEffect, useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { useAppSelector, useAppDispatch } from "../../../store/hooks";
import { updateProfileRequest, clearProfileError } from "../../../store/slices/profileSlice";
import { fetchCompaniesRequest, approveCompanyRequest, rejectCompanyRequest, deleteCompanyRequest } from "../../../store/slices/companiesSlice";
import { toast } from "sonner";
import { UserRole, isRole } from "../../../types/user";
import { useNavigate } from "react-router-dom";
import { DeleteConfirmationDialog } from "../../../components/common/DeleteConfirmationDialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../components/ui/tabs";
import { ProfileTab } from "./ProfileTab";
import { CompaniesTab } from "./CompaniesTab";
import { Company } from "../../../services/companies";

interface ProfilePageProps {
  userId?: string;
  onBack?: () => void;
}

export const ProfilePage = ({ userId, onBack }: ProfilePageProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isLoading, isAuthenticated } = useAppSelector((state) => state.auth);
  const { isUpdating, error } = useAppSelector((state) => state.profile);
  const { companies, loading: companiesLoading } = useAppSelector((state) => state.companies);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<{ id: string; name: string } | null>(null);
  const [loggingIn, setLoggingIn] = useState<string | null>(null);
  const [showCompanyRegistration, setShowCompanyRegistration] = useState(false);
  
  const isSystemAdmin = isRole(user?.role, UserRole.SYSTEM_ADMIN);

  // Helper function to get roleId for a company
  const getRoleIdForCompany = (companyId: string): string | null => {
    if (!user?.roles || !Array.isArray(user.roles) || user.roles.length === 0) {
      return null;
    }
    
    const role = user.roles.find((r: any) => {
      const roleCompanyId = r.companyId ? String(r.companyId) : null;
      const targetCompanyId = String(companyId);
      return roleCompanyId === targetCompanyId;
    });
    
    return role?.id || null;
  };

  // Handle login to company account
  const handleLoginToCompany = async (companyId: string) => {
    if (!user?.email) {
      toast.error("Unable to login: User email not found");
      return;
    }

    const roleId = getRoleIdForCompany(companyId);
    
    if (!roleId) {
      toast.error("Unable to find role for this company. Please contact support.");
      return;
    }

    setLoggingIn(companyId);

    try {
      dispatch({ 
        type: 'auth/completeLoginWithRoleRequest', 
        payload: { email: user.email, roleId: roleId } 
      });
      
      toast.success("Logging in to company account...");
    } catch (error: any) {
      console.error('Error logging in to company:', error);
      toast.error(error.message || "Failed to login to company account");
      setLoggingIn(null);
    }
  };

  // Navigate to dashboard after successful login
  useEffect(() => {
    if (isAuthenticated && loggingIn) {
      const timer = setTimeout(() => {
        navigate('/system/dashboard');
        setLoggingIn(null);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, loggingIn, navigate]);
  
  // Fetch companies - for system admin: all companies, for regular users: their own companies
  useEffect(() => {
    if (user?.id) {
      if (!user.companies || user.companies.length === 0) {
        dispatch(fetchCompaniesRequest());
      }
    }
  }, [dispatch, user?.id, user?.companies]);
  
  // Filter companies based on user role
  const userCompanies = useMemo(() => {
    if (user?.companies && Array.isArray(user.companies) && user.companies.length > 0) {
      return user.companies;
    }
    
    if (isSystemAdmin) {
      return companies;
    } else if (user?.id || user?.email) {
      return companies.filter(c => {
        if (c.ownerId !== null && c.ownerId !== undefined) {
          const companyOwnerId = String(c.ownerId).trim();
          const userId = String(user.id).trim();
          if (companyOwnerId === userId) {
            return true;
          }
        }
        
        if (user?.email && c.email) {
          return c.email.toLowerCase().trim() === user.email.toLowerCase().trim();
        }
        
        return false;
      });
    }
    return [];
  }, [companies, user?.id, user?.email, user?.companies, isSystemAdmin]);
  
  // Separate companies by status
  const { pendingCompanies, approvedCompanies, rejectedCompanies } = useMemo(() => {
    const pending = userCompanies.filter(c => {
      const isActive = c.isActive === true || c.isActive === 1;
      return !isActive;
    });
    const approved = userCompanies.filter(c => {
      const isActive = c.isActive === true || c.isActive === 1;
      return isActive;
    });
    const rejected = userCompanies.filter(c => {
      const isActive = c.isActive === true || c.isActive === 1;
      return !isActive && c.updatedAt && c.createdAt && new Date(c.updatedAt) > new Date(c.createdAt);
    });
    
    return {
      pendingCompanies: pending,
      approvedCompanies: approved,
      rejectedCompanies: rejected
    };
  }, [userCompanies]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearProfileError());
    };
  }, [dispatch]);

  // Handlers
  const handleAvatarUpload = (filePath: string) => {
    if (user) {
      dispatch(updateProfileRequest({ avatar: filePath }));
    }
  };

  const handleAvatarDelete = () => {
    if (user) {
      dispatch(updateProfileRequest({ avatar: undefined }));
    }
  };

  const handleViewDetails = (companyId: string) => {
    navigate(`/system/company-settings/${companyId}`);
  };

  const handleEditDetails = (companyId: string) => {
    navigate(`/system/company-settings/${companyId}`);
  };

  const handleDelete = (company: { id: string; name: string }) => {
    setCompanyToDelete(company);
    setIsDeleteDialogOpen(true);
  };

  const handleApprove = (companyId: string) => {
    dispatch(approveCompanyRequest(companyId));
    setTimeout(() => dispatch(fetchCompaniesRequest()), 1000);
  };

  const handleReject = (companyId: string) => {
    dispatch(rejectCompanyRequest({ id: companyId }));
    setTimeout(() => dispatch(fetchCompaniesRequest()), 1000);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 lg:p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-primary)] mx-auto"></div>
          <p className="text-muted-foreground mt-2">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show error if no user data
  if (!user) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 lg:p-6">
        <div className="text-center">
          <p className="text-muted-foreground">No user data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 lg:p-6">
      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4">
        {onBack && (
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
        )}
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-foreground">
            {userId ? "User Profile" : "My Profile"}
          </h1>
          <p className="text-muted-foreground mt-1">
            {userId ? "View and manage user information" : "Manage your personal information and preferences"}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="w-full">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          {(isSystemAdmin || userCompanies.length > 0 || companiesLoading) && (
            <TabsTrigger value="companies">Companies</TabsTrigger>
          )}
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-6">
          <ProfileTab
            user={user}
            userId={userId}
            isUpdating={isUpdating}
            onAvatarUpload={handleAvatarUpload}
            onAvatarDelete={handleAvatarDelete}
          />
        </TabsContent>

        {/* Companies Tab */}
        {(isSystemAdmin || userCompanies.length > 0 || companiesLoading) && (
          <TabsContent value="companies" className="mt-6">
            <CompaniesTab
              userId={userId}
              isSystemAdmin={isSystemAdmin}
              companiesLoading={companiesLoading}
              pendingCompanies={pendingCompanies}
              approvedCompanies={approvedCompanies}
              rejectedCompanies={rejectedCompanies}
              loggingIn={loggingIn}
              onViewDetails={handleViewDetails}
              onEditDetails={handleEditDetails}
              onDelete={handleDelete}
              onApprove={isSystemAdmin ? handleApprove : undefined}
              onReject={isSystemAdmin ? handleReject : undefined}
              onLogin={!isSystemAdmin ? handleLoginToCompany : undefined}
              onRegisterCompany={() => setShowCompanyRegistration(true)}
            />
          </TabsContent>
        )}
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        open={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) {
            setCompanyToDelete(null);
          }
        }}
        onConfirm={() => {
          if (companyToDelete) {
            dispatch(deleteCompanyRequest(companyToDelete.id));
            setTimeout(() => dispatch(fetchCompaniesRequest()), 1000);
            setIsDeleteDialogOpen(false);
            setCompanyToDelete(null);
          }
        }}
        itemType="Company"
        itemName={companyToDelete?.name}
        isLoading={companiesLoading}
      />
    </div>
  );
};
