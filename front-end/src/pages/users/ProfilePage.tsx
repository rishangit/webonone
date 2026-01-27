import { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Save, X, Shield, Mail, Phone, MapPin, User, Building, ArrowLeft, AlertCircle, CheckCircle, Clock, XCircle, MoreVertical, Eye, Edit, Trash2 } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { CompanyRegistrationCard } from "../companies/CompanyRegistrationCard";
import FileUpload from "../../components/ui/file-upload";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { updateProfileRequest, clearProfileError } from "../../store/slices/profileSlice";
import { fetchCompaniesRequest, approveCompanyRequest, rejectCompanyRequest, deleteCompanyRequest } from "../../store/slices/companiesSlice";
import { UserRoleNames, UserRole, isRole } from "../../types/user";
import { profileUpdateSchema, ProfileUpdateFormData } from "../../schemas/profileValidation";
import { formatAvatarUrl } from "../../utils";
import { DateDisplay } from "../../components/common/DateDisplay";
import { useNavigate } from "react-router-dom";
import { DeleteConfirmationDialog } from "../../components/common/DeleteConfirmationDialog";
import { PhoneInput } from "../../components/common/PhoneInput";
import { DatePicker } from "../../components/common/DatePicker";
import { Controller } from "react-hook-form";

interface ProfilePageProps {
  userId?: string;
  onBack?: () => void;
}

export function ProfilePage({ userId, onBack }: ProfilePageProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, isLoading } = useAppSelector((state) => state.auth);
  const { isUpdating, error } = useAppSelector((state) => state.profile);
  const { companies, loading: companiesLoading } = useAppSelector((state) => state.companies);
  const [isEditing, setIsEditing] = useState(false);
  const [showCompanyRegistration, setShowCompanyRegistration] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<{ id: string; name: string } | null>(null);
  
  const isSystemAdmin = isRole(user?.role, UserRole.SYSTEM_ADMIN);
  
  // Fetch companies - for system admin: all companies, for regular users: their own companies
  useEffect(() => {
    if (user?.id) {
      // If user object already has companies (from profile endpoint), use those
      // Otherwise, fetch all and filter client-side
      if (!user.companies || user.companies.length === 0) {
        dispatch(fetchCompaniesRequest());
      }
    }
  }, [dispatch, user?.id, user?.companies]);
  
  // Filter companies based on user role
  // Priority: 1) Use companies from user object if available, 2) Filter from companies state
  const userCompanies = useMemo(() => {
    // If user object has companies array (from profile endpoint), use those first
    if (user?.companies && Array.isArray(user.companies) && user.companies.length > 0) {
      return user.companies;
    }
    
    if (isSystemAdmin) {
      // System admin sees all companies
      return companies;
    } else if (user?.id || user?.email) {
      // Regular users see only their own companies
      // Match by ownerId first, then fallback to email if ownerId is null
      return companies.filter(c => {
        // First try to match by ownerId (handle both string and number)
        if (c.ownerId !== null && c.ownerId !== undefined) {
          // Convert both to strings for comparison (handles number/string mismatch)
          const companyOwnerId = String(c.ownerId).trim();
          const userId = String(user.id).trim();
          if (companyOwnerId === userId) {
            return true;
          }
        }
        
        // Fallback: match by email if ownerId is null or doesn't match (for companies created before ownerId was set)
        if (user?.email && c.email) {
          return c.email.toLowerCase().trim() === user.email.toLowerCase().trim();
        }
        
        return false;
      });
    }
    return [];
  }, [companies, user?.id, user?.email, user?.companies, isSystemAdmin]);
  
  // Separate companies by status
  // Note: isActive might be boolean, number (0/1), or null
  const { pendingCompanies, approvedCompanies, rejectedCompanies } = useMemo(() => {
    const pending = userCompanies.filter(c => {
      // Handle both boolean and number (0/1) values
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

  // React Hook Form with Yup validation
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    trigger,
    control
  } = useForm<ProfileUpdateFormData>({
    resolver: yupResolver(profileUpdateSchema) as any,
    defaultValues: {
      firstName: user?.firstName || undefined,
      lastName: user?.lastName || undefined,
      email: user?.email || undefined,
      phone: user?.phone || undefined,
      address: user?.address || undefined,
      dateOfBirth: user?.dateOfBirth ? (typeof user.dateOfBirth === 'string' 
        ? user.dateOfBirth.split('T')[0] 
        : (() => {
            // Format as YYYY-MM-DD in local timezone (not UTC)
            const date = new Date(user.dateOfBirth);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          })()) : undefined,
    },
    mode: 'onBlur',
    reValidateMode: 'onChange'
  });

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        email: user.email || undefined,
        phone: user.phone || undefined,
        address: user.address || undefined,
        dateOfBirth: user.dateOfBirth ? (typeof user.dateOfBirth === 'string' ? user.dateOfBirth.split('T')[0] : new Date(user.dateOfBirth).toISOString().split('T')[0]) : undefined,
      });
      // Debug: Log avatar URL when user changes
      if (process.env.NODE_ENV === 'development' && user.avatar) {
        console.log('User avatar URL:', user.avatar);
      }
    }
  }, [user, reset]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearProfileError());
    };
  }, [dispatch]);

  const onSubmit = (data: ProfileUpdateFormData) => {
    if (user) {
      // Prepare update data - avatar is already saved when uploaded
      const updateData: Partial<typeof user> = {
        firstName: data.firstName || undefined,
        lastName: data.lastName || undefined,
        email: data.email || undefined,
        phone: data.phone || undefined,
        address: data.address || undefined,
        dateOfBirth: data.dateOfBirth ? (typeof data.dateOfBirth === 'string' ? data.dateOfBirth : (() => {
          // Format as YYYY-MM-DD in local timezone (not UTC)
          const date = data.dateOfBirth as Date;
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        })()) : undefined,
        // Avatar is already saved when FileUpload completes
      };

      dispatch(updateProfileRequest(updateData));
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
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
        {!userId && !isEditing && (
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => setIsEditing(true)} 
              className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:from-[var(--accent-primary-hover)] hover:to-[var(--accent-primary)] text-[var(--accent-button-text)] shadow-lg shadow-[var(--accent-primary)]/25 transition-all duration-200"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>
        )}
      </div>

      {/* Profile Header Card */}
      <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] shadow-lg">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Avatar Section */}
          <div className="flex flex-col items-center space-y-4">
            {!userId && isEditing ? (
              <FileUpload
                onFileUploaded={(filePath, _fileUrl) => {
                  // Save the relative file path (not the full URL) to the profile
                  if (user) {
                    dispatch(updateProfileRequest({
                      avatar: filePath
                    }));
                  }
                }}
                onFileDeleted={() => {
                  // Immediately remove the avatar from the profile
                  if (user) {
                    dispatch(updateProfileRequest({
                      avatar: undefined
                    }));
                  }
                }}
                currentImagePath={user?.avatar}
                currentImageUrl={user?.avatar}
                folderPath={`users/${user?.id}/profile`}
                label="Upload Avatar"
                maxSize={2}
                className="w-full max-w-xs"
                disabled={isUpdating}
              />
            ) : (
              <div className="relative">
                <Avatar className="w-32 h-32">
                  <AvatarImage 
                    src={formatAvatarUrl(user?.avatar, user?.firstName, user?.lastName)} 
                    alt={`${user?.firstName || ''} ${user?.lastName || ''}`}
                    onError={() => {
                      console.error('Avatar image failed to load:', user?.avatar);
                    }}
                    onLoad={() => {
                      if (process.env.NODE_ENV === 'development') {
                        console.log('Avatar image loaded successfully:', user?.avatar);
                        }
                      }}
                    />
                    <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)] text-4xl">
                      {user?.firstName?.[0]}{user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
              </div>
            )}
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-foreground">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-[var(--accent-text)]">{user?.email}</p>
              <div className="flex items-center justify-center gap-2 mt-2">
                <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30">
                  <Shield className="w-3 h-3 mr-1" />
                  {user?.isVerified ? 'Verified' : 'Unverified'}
                </Badge>
                <Badge variant="outline" className="text-muted-foreground">
                  {user?.role !== undefined ? UserRoleNames[user.role] : 'User'}
                </Badge>
              </div>
            </div>
          </div>

          {/* Quick Info */}
          <div className="flex-1 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--accent-bg)]">
                  <Mail className="w-4 h-4 text-[var(--accent-text)]" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium text-foreground">{user?.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--accent-bg)]">
                  <Phone className="w-4 h-4 text-[var(--accent-text)]" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium text-foreground">{user?.phone || 'Not provided'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--accent-bg)]">
                  <MapPin className="w-4 h-4 text-[var(--accent-text)]" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p className="font-medium text-foreground">{user?.address || 'Not provided'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--accent-bg)]">
                  <User className="w-4 h-4 text-[var(--accent-text)]" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Role</p>
                  <p className="font-medium text-foreground">{user?.role !== undefined ? UserRoleNames[user.role] : 'User'}</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </Card>

      {/* Detailed Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] shadow-lg">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-[var(--accent-text)]" />
            Personal Information
          </h3>
          {isEditing && !userId ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-muted-foreground">First Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="firstName"
                    {...register('firstName')}
                    disabled={isUpdating}
                    placeholder="Enter your first name"
                    className={`bg-[var(--input-background)] border-[var(--glass-border)] ${errors.firstName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  />
                  {errors.firstName && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.firstName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-muted-foreground">Last Name <span className="text-red-500">*</span></Label>
                  <Input
                    id="lastName"
                    {...register('lastName')}
                    disabled={isUpdating}
                    placeholder="Enter your last name"
                    className={`bg-[var(--input-background)] border-[var(--glass-border)] ${errors.lastName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                  />
                  {errors.lastName && (
                    <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-muted-foreground">Email Address <span className="text-red-500">*</span></Label>
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  disabled={isUpdating}
                  placeholder="Enter your email address"
                  className={`bg-[var(--input-background)] border-[var(--glass-border)] ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
                {errors.email && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone" className="text-muted-foreground">Phone Number <span className="text-red-500">*</span></Label>
                <Controller
                  name="phone"
                  control={control}
                  render={({ field }) => (
                    <PhoneInput
                  id="phone"
                      value={field.value || ""}
                      onChange={(value) => {
                        field.onChange(value);
                        trigger('phone');
                      }}
                      onBlur={field.onBlur}
                  disabled={isUpdating}
                      placeholder="Enter phone number"
                      error={!!errors.phone}
                    />
                  )}
                />
                {errors.phone && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-muted-foreground">Address</Label>
                <Input
                  id="address"
                  {...register('address')}
                  disabled={isUpdating}
                  placeholder="Enter your address"
                  className={`bg-[var(--input-background)] border-[var(--glass-border)] ${errors.address ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                />
                {errors.address && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.address.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateOfBirth" className="text-muted-foreground">Date of Birth</Label>
                <Controller
                  name="dateOfBirth"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      id="dateOfBirth"
                      value={field.value || undefined}
                      onChange={(date) => {
                        if (date) {
                          // Format as YYYY-MM-DD in local timezone
                          const year = date.getFullYear();
                          const month = String(date.getMonth() + 1).padStart(2, '0');
                          const day = String(date.getDate()).padStart(2, '0');
                          field.onChange(`${year}-${month}-${day}`);
                        } else {
                          field.onChange(undefined);
                        }
                        trigger('dateOfBirth');
                      }}
                      onBlur={field.onBlur}
                      disabled={isUpdating}
                      placeholder="Select date of birth"
                      maxDate={new Date()}
                      error={!!errors.dateOfBirth}
                    />
                  )}
                />
                {errors.dateOfBirth && (
                  <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    {errors.dateOfBirth.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isUpdating}
                  className="border-[var(--glass-border)] bg-[var(--input-background)] hover:bg-[var(--accent-bg)] hover:border-[var(--accent-border)] hover:text-[var(--accent-text)] transition-all duration-200"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdating || !isDirty}
                  className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:from-[var(--accent-primary-hover)] hover:to-[var(--accent-primary)] text-[var(--accent-button-text)] shadow-lg shadow-[var(--accent-primary)]/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-muted-foreground">First Name</Label>
                  <p className="text-foreground">{user?.firstName || 'Not provided'}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-muted-foreground">Last Name</Label>
                  <p className="text-foreground">{user?.lastName || 'Not provided'}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Email Address</Label>
                <p className="text-foreground">{user?.email}</p>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Phone Number</Label>
                <p className="text-foreground">{user?.phone || 'Not provided'}</p>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Address</Label>
                <p className="text-foreground">{user?.address || 'Not provided'}</p>
              </div>

              <div className="space-y-2">
                <Label className="text-muted-foreground">Date of Birth</Label>
                <p className="text-foreground">
                  <DateDisplay date={user?.dateOfBirth} fallback="Not provided" />
                </p>
              </div>
            </div>
          )}
        </Card>

        {/* Professional Information */}
        <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] shadow-lg">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Building className="w-5 h-5 text-[var(--accent-text)]" />
            Professional Information
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Role</Label>
              <p className="text-foreground">{user?.role !== undefined ? UserRoleNames[user.role] : 'User'}</p>
            </div>


            <div className="space-y-2">
              <Label className="text-muted-foreground">Account Status</Label>
              <p className="text-foreground">{user?.isActive ? 'Active' : 'Inactive'}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-muted-foreground">Verification Status</Label>
              <p className="text-foreground">{user?.isVerified ? 'Verified' : 'Unverified'}</p>
            </div>

            {!userId && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium text-foreground mb-2">Company Registration</h4>
                  <p className="text-muted-foreground text-sm mb-3">
                    Register your company to access business features and manage your team.
                  </p>
                  {showCompanyRegistration ? (
                    <div className="space-y-4">
                      <CompanyRegistrationCard 
                        onDismiss={() => setShowCompanyRegistration(false)}
                      />
                    </div>
                  ) : (
                    <Button 
                      variant="outline" 
                      onClick={() => setShowCompanyRegistration(true)}
                      className="w-full border-[var(--accent-border)] text-[var(--accent-text)] hover:bg-gradient-to-r hover:from-[var(--accent-primary)] hover:to-[var(--accent-primary-hover)] hover:text-[var(--accent-button-text)] hover:border-[var(--accent-primary)] shadow-lg transition-all duration-200"
                    >
                      <Building className="w-4 h-4 mr-2" />
                      Register Your Company
                    </Button>
                  )}
                </div>
              </>
            )}
          </div>
        </Card>
      </div>

      {/* Company Registration Requests */}
      {(isSystemAdmin || userCompanies.length > 0 || companiesLoading) && (
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              {isSystemAdmin ? 'Company Registration Requests' : 'My Company Registrations'}
            </h2>
            <p className="text-muted-foreground text-sm">
              {isSystemAdmin 
                ? 'Manage company registration requests and their approval status'
                : 'View the status of your company registration requests'}
            </p>
          </div>

          {/* Pending Requests */}
          {pendingCompanies.length > 0 && (
            <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-yellow-500" />
                <h3 className="font-semibold text-foreground">Pending Requests ({pendingCompanies.length})</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pendingCompanies.map((company) => (
                  <Card key={company.id} className="p-4 border-2 border-yellow-500/30 bg-yellow-500/5">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{company.name}</h4>
                          {company.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{company.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30">
                            <Clock className="w-3 h-3 mr-1" />
                            Pending
                          </Badge>
                          {/* 3-dot menu for non-admin users */}
                          {!isSystemAdmin && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="bg-popover border-border" align="end">
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/system/company-settings/${String(company.id)}`);
                                }}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/system/company-settings/${String(company.id)}`);
                                }}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-red-600 dark:text-red-400"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCompanyToDelete({ id: String(company.id), name: company.name });
                                    setIsDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        {company.email && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="w-3 h-3" />
                            <span className="truncate">{company.email}</span>
                          </div>
                        )}
                        {company.phone && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            <span>{company.phone}</span>
                          </div>
                        )}
                        {company.address && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{company.address}</span>
                          </div>
                        )}
                      </div>

                      {company.createdAt && (
                        <p className="text-xs text-muted-foreground">
                          Submitted: <DateDisplay date={company.createdAt} />
                        </p>
                      )}

                      {/* Action buttons - only show for System Admins */}
                      {isSystemAdmin && (
                        <div className="flex gap-2 pt-2">
                          <Button
                            size="sm"
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                            onClick={() => {
                              dispatch(approveCompanyRequest(String(company.id)));
                              setTimeout(() => dispatch(fetchCompaniesRequest()), 1000);
                            }}
                            disabled={companiesLoading}
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            className="flex-1"
                            onClick={() => {
                              if (window.confirm('Are you sure you want to reject this company registration?')) {
                                dispatch(rejectCompanyRequest({ id: String(company.id) }));
                                setTimeout(() => dispatch(fetchCompaniesRequest()), 1000);
                              }
                            }}
                            disabled={companiesLoading}
                          >
                            <XCircle className="w-3 h-3 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                      
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          )}

          {/* Approved Companies */}
          {approvedCompanies.length > 0 && (
            <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold text-foreground">Approved Companies ({approvedCompanies.length})</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {approvedCompanies.map((company) => (
                  <Card key={company.id} className="p-4 border-2 border-green-500/30 bg-green-500/5">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">{company.name}</h4>
                          {company.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{company.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Approved
                          </Badge>
                          {/* 3-dot menu for non-admin users */}
                          {!isSystemAdmin && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <MoreVertical className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="bg-popover border-border" align="end">
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/system/company-settings/${String(company.id)}`);
                                }}>
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={(e) => {
                                  e.stopPropagation();
                                  navigate(`/system/company-settings/${String(company.id)}`);
                                }}>
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  className="text-red-600 dark:text-red-400"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setCompanyToDelete({ id: String(company.id), name: company.name });
                                    setIsDeleteDialogOpen(true);
                                  }}
                                >
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </div>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        {company.email && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="w-3 h-3" />
                            <span className="truncate">{company.email}</span>
                          </div>
                        )}
                        {company.phone && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="w-3 h-3" />
                            <span>{company.phone}</span>
                          </div>
                        )}
                        {company.address && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">{company.address}</span>
                          </div>
                        )}
                      </div>

                      {company.updatedAt && (
                        <p className="text-xs text-muted-foreground">
                          Approved: <DateDisplay date={company.updatedAt} />
                        </p>
                      )}

                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          )}

          {/* No requests message */}
          {pendingCompanies.length === 0 && approvedCompanies.length === 0 && !companiesLoading && (
            <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] text-center">
              <Building className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">
                {isSystemAdmin 
                  ? 'No company registration requests'
                  : 'You have not registered any companies yet'}
              </p>
              {!isSystemAdmin && (
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => setShowCompanyRegistration(true)}
                >
                  <Building className="w-4 h-4 mr-2" />
                  Register Your Company
                </Button>
              )}
            </Card>
          )}

          {/* Loading state */}
          {companiesLoading && (
            <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-primary)] mx-auto"></div>
              <p className="text-muted-foreground mt-2">Loading companies...</p>
            </Card>
          )}
        </div>
      )}

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
}