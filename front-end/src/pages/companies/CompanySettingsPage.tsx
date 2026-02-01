import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useParams, useNavigate } from "react-router-dom";
import { Building, Camera, Upload, X, Phone, MapPin, Edit, Save, Check, AlertCircle, Settings, Plus, Globe } from "lucide-react";
import { GoogleMapComponent } from "../../components/GoogleMapComponent";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { Separator } from "../../components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchCompanyRequest, updateCompanyRequest, clearError } from "../../store/slices/companiesSlice";
import FileUpload from "../../components/ui/file-upload";
import { formatAvatarUrl } from "../../utils";
import { DateDisplay } from "../../components/common/DateDisplay";
import { UserRoleNames, UserRole } from "../../types/user";
import { companyUpdateSchema, CompanyUpdateFormData } from "../../schemas/companyValidation";
import { PhoneInput } from "../../components/common/PhoneInput";
import { currenciesService, Currency } from "../../services/currencies";
import { CustomDialog } from "../../components/ui/custom-dialog";

interface CompanySettingsPageProps {
  onBack?: () => void;
}

import { CompanySize } from "../../services/companies";

interface CompanyInfo {
  name: string;
  description: string;
  companySize: CompanySize | "";
  contactPerson: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  logo?: string;
}

const companySizes: CompanySize[] = [
  "1-5",
  "6-10", 
  "11-20",
  "21-50",
  "51-200",
  "201-500",
  "500+"
];


export function CompanySettingsPage({ onBack }: CompanySettingsPageProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAppSelector((state) => state.auth);
  const { companies: reduxCompanies, currentCompany, loading, error } = useAppSelector((state) => state.companies);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currencies, setCurrencies] = useState<Currency[]>([]);
  const [isLoadingCurrencies, setIsLoadingCurrencies] = useState(false);
  const [isAddCurrencyDialogOpen, setIsAddCurrencyDialogOpen] = useState(false);
  const [isCreatingCurrency, setIsCreatingCurrency] = useState(false);
  
  // Form for creating new currency
  const {
    register: registerCurrency,
    handleSubmit: handleSubmitCurrency,
    formState: { errors: currencyErrors },
    reset: resetCurrency,
    control: controlCurrency
  } = useForm({
    defaultValues: {
      name: '',
      symbol: '',
      decimals: 2,
      rounding: 0.01
    }
  });
  
  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    trigger,
    control,
    watch,
    setValue
  } = useForm<CompanyUpdateFormData>({
    resolver: yupResolver(companyUpdateSchema) as any,
    defaultValues: {
      name: "",
      description: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      country: undefined,
      postalCode: undefined,
      latitude: undefined,
      longitude: undefined,
      website: undefined,
      companySize: undefined,
      logo: undefined,
      contactPerson: undefined,
      currencyId: undefined
    },
    mode: 'onBlur',
    reValidateMode: 'onChange'
  });

  const companyInfo = watch();

  // Get company ID from URL params, fallback to user's companyId
  const companyId = id || user?.companyId;

  // Find company from Redux store
  const reduxCompany = companyId 
    ? (reduxCompanies.find(comp => String(comp.id) === String(companyId)) || 
       (currentCompany && String(currentCompany.id) === String(companyId) ? currentCompany : null))
    : null;

  // Fetch company if not found in store
  useEffect(() => {
    if (companyId && !reduxCompany) {
      dispatch(fetchCompanyRequest(String(companyId)));
    }
  }, [companyId, reduxCompany, dispatch]);

  // Fetch currencies - load ALL currencies (both active and inactive)
  useEffect(() => {
    const fetchCurrencies = async () => {
      setIsLoadingCurrencies(true);
      try {
        // Fetch all currencies (both active and inactive)
        const data = await currenciesService.getCurrencies();
        // Sort by name for better UX
        const sortedCurrencies = data.sort((a, b) => a.name.localeCompare(b.name));
        setCurrencies(sortedCurrencies);
      } catch (error: any) {
        console.error('Error fetching currencies:', error);
        toast.error('Failed to load currencies');
      } finally {
        setIsLoadingCurrencies(false);
      }
    };
    fetchCurrencies();
  }, []);

  // Handle create currency
  const onCreateCurrency = async (data: any) => {
    setIsCreatingCurrency(true);
    try {
      const newCurrency = await currenciesService.createCurrency(data);
      setCurrencies(prev => [...prev, newCurrency].sort((a, b) => a.name.localeCompare(b.name)));
      setIsAddCurrencyDialogOpen(false);
      resetCurrency();
      toast.success(`Currency ${newCurrency.name} created successfully`);
      // Auto-select the newly created currency
      setValue('currencyId', newCurrency.id, { shouldDirty: true });
    } catch (error: any) {
      console.error('Error creating currency:', error);
      toast.error(error.message || 'Failed to create currency');
    } finally {
      setIsCreatingCurrency(false);
    }
  };

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Transform and load company data
  useEffect(() => {
    if (reduxCompany || currentCompany) {
      const company = reduxCompany || currentCompany;
      
      // Parse address to extract city, state, country if address is a combined string
      let city = "";
      let state = "";
      let country = "";
      let postalCode = "";
      let address = company?.address || "";
      
      if (company?.address) {
        const addressParts = company.address.split(',').map((part: string) => part.trim());
        if (addressParts.length >= 3) {
          // Try to parse: address, city, state, country, postalCode
          address = addressParts.slice(0, -3).join(', ');
          city = addressParts[addressParts.length - 3] || "";
          state = addressParts[addressParts.length - 2] || "";
          country = addressParts[addressParts.length - 1] || "";
        } else if (addressParts.length === 2) {
          city = addressParts[0] || "";
          state = addressParts[1] || "";
        }
      }

      reset({
        name: company?.name || "",
        description: company?.description || "",
        companySize: (company?.companySize as CompanySize) || undefined,
        contactPerson: undefined, // Not stored in database currently
        email: company?.email || "",
        phone: company?.phone || "",
        website: company?.website || undefined,
        address: address,
        city: city,
        state: state,
        country: country || undefined,
        postalCode: postalCode || undefined,
        latitude: company?.latitude !== undefined && company?.latitude !== null ? company.latitude : undefined,
        longitude: company?.longitude !== undefined && company?.longitude !== null ? company.longitude : undefined,
        logo: company?.logo || undefined,
        currencyId: (company as any)?.currencyId || undefined
      });
    }
  }, [reduxCompany, currentCompany, reset]);

  const onSubmit = async (data: CompanyUpdateFormData) => {
    if (!companyId) {
      toast.error("Company ID not found. Please contact support.");
      return;
    }

    setIsSaving(true);
    
    try {
      const updateData = {
        companyName: data.name,
        description: data.description,
        address: data.address,
        city: data.city,
        state: data.state,
        country: data.country || null,
        postalCode: data.postalCode || null,
        latitude: data.latitude !== undefined ? data.latitude : null,
        longitude: data.longitude !== undefined ? data.longitude : null,
        phone: data.phone,
        email: data.email,
        website: data.website || null,
        companySize: data.companySize && data.companySize.trim() !== "" ? data.companySize : null,
        logo: data.logo || null,
        contactPerson: data.contactPerson || null,
        currencyId: data.currencyId || null
      };

      dispatch(updateCompanyRequest({ id: companyId, data: updateData }));
      setIsEditing(false);
      // Toast will be shown by the epic
    } catch (error) {
      console.error("Error saving company:", error);
      toast.error("Failed to update company settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  const handleLogoUploaded = (filePath: string, fileUrl: string) => {
    // Update company logo with the uploaded file path
    reset({ ...companyInfo, logo: filePath });
    // Optionally update the company immediately
    if (companyId) {
      dispatch(updateCompanyRequest({ 
        id: companyId, 
        data: { logo: filePath } 
      }));
    }
  };

  const handleLogoDeleted = () => {
    // Remove logo from company
    reset({ ...companyInfo, logo: undefined });
    // Optionally update the company immediately
    if (companyId) {
      dispatch(updateCompanyRequest({ 
        id: companyId, 
        data: { logo: "" } 
      }));
    }
  };

  // Show loading state
  if (loading && !reduxCompany && !currentCompany) {
    return (
      <div className="flex-1 p-4 lg:p-6 flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground">Loading company information...</p>
        </div>
      </div>
    );
  }

  // Show error if no company found
  if (!companyId) {
    return (
      <div className="flex-1 p-4 lg:p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Company Settings</h1>
          </div>
        </div>
        <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
          <p className="text-foreground">No company associated with your account. Please contact support.</p>
        </Card>
      </div>
    );
  }

  if (!reduxCompany && !currentCompany && !loading) {
    return (
      <div className="flex-1 p-4 lg:p-6 space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Company Settings</h1>
          </div>
        </div>
        <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
          <p className="text-foreground">Company not found. Please contact support.</p>
        </Card>
      </div>
    );
    }

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Company Settings</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Manage your company profile and information</p>
        </div>
        <div className="flex items-center gap-2">
          {isEditing ? (
            <>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSaving}
                className="bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent text-foreground hover:text-foreground"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button
                type="submit"
                form="company-form"
                disabled={isSaving || loading || !isDirty}
                className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:from-[var(--accent-primary-hover)] hover:to-[var(--accent-primary)] text-[var(--accent-button-text)] shadow-lg shadow-[var(--accent-primary)]/25 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </>
          ) : (
            <Button
              onClick={() => setIsEditing(true)}
              className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:from-[var(--accent-primary-hover)] hover:to-[var(--accent-primary)] text-[var(--accent-button-text)] shadow-lg shadow-[var(--accent-primary)]/25"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Profile */}
          <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] shadow-lg">
            <div className="flex items-center gap-2 mb-6">
              <Building className="w-5 h-5 text-[var(--accent-text)]" />
              <h3 className="font-semibold text-foreground">Company Profile</h3>
            </div>

            <form id="company-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Logo Upload */}
              <div className="space-y-2">
                <Label className="text-foreground">Company Logo</Label>
                {isEditing ? (
                  <FileUpload
                    onFileUploaded={handleLogoUploaded}
                    onFileDeleted={handleLogoDeleted}
                    currentImagePath={companyInfo.logo}
                    folderPath={companyId ? `companies/${companyId}` : 'companies'}
                    label="Upload Company Logo"
                    accept="image/*"
                    maxSize={5}
                    disabled={!companyId || isSaving}
                  />
                ) : (
                  <div className="flex items-center gap-4">
                <Avatar className="w-20 h-20 ring-2 ring-[var(--accent-border)]">
                      <AvatarImage 
                        src={companyInfo.logo ? formatAvatarUrl(companyInfo.logo) : undefined} 
                        alt="Company Logo" 
                      />
                  <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)] text-lg">
                    {(companyInfo.name || '').slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                    {companyInfo.logo && (
                      <p className="text-sm text-muted-foreground">Logo uploaded</p>
                    )}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-foreground">Company Name <span className="text-red-500">*</span></Label>
                  {isEditing ? (
                    <>
                      <Input
                        id="name"
                        {...register('name')}
                        disabled={isSaving}
                        placeholder="Enter company name"
                        className={`bg-[var(--input-background)] border-[var(--glass-border)] ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      />
                      {errors.name && (
                        <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.name.message}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="p-2 text-foreground">{companyInfo.name || 'Not provided'}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactPerson" className="text-foreground">Contact Person</Label>
                  {isEditing ? (
                    <Input
                      id="contactPerson"
                      {...register('contactPerson')}
                      disabled={isSaving}
                      placeholder="Enter contact person name"
                      className="bg-[var(--input-background)] border-[var(--glass-border)]"
                    />
                  ) : (
                    <p className="p-2 text-foreground">{companyInfo.contactPerson || 'Not provided'}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground">Company Description <span className="text-red-500">*</span></Label>
                {isEditing ? (
                  <>
                    <Textarea
                      id="description"
                      {...register('description')}
                      disabled={isSaving}
                      rows={3}
                      placeholder="Enter company description"
                      className={`bg-[var(--input-background)] border-[var(--glass-border)] resize-none ${errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.description.message}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="p-2 text-foreground">{companyInfo.description || 'Not provided'}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="companySize" className="text-foreground">Company Size</Label>
                {isEditing ? (
                  <Controller
                    name="companySize"
                    control={control}
                    render={({ field }) => (
                      <Select 
                        value={field.value || undefined} 
                        onValueChange={(value) => {
                          // Convert empty string to undefined, otherwise use the value
                          field.onChange(value === "" ? undefined : (value as CompanySize));
                        }}
                      >
                        <SelectTrigger id="companySize" className="bg-[var(--input-background)] border-[var(--glass-border)]">
                          <SelectValue placeholder="Select company size" />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          {companySizes.map((size) => (
                            <SelectItem key={size} value={size}>
                              {size} employees
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                ) : (
                  <p className="p-2 text-foreground">{companyInfo.companySize ? `${companyInfo.companySize} employees` : 'Not provided'}</p>
                )}
              </div>
            </form>
          </Card>

          {/* Contact Information */}
          <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] shadow-lg">
            <div className="flex items-center gap-2 mb-6">
              <Phone className="w-5 h-5 text-[var(--accent-text)]" />
              <h3 className="font-semibold text-foreground">Contact Information</h3>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email Address <span className="text-red-500">*</span></Label>
                  {isEditing ? (
                    <>
                      <Input
                        id="email"
                        type="email"
                        {...register('email')}
                        disabled={isSaving}
                        placeholder="Enter email address"
                        className={`bg-[var(--input-background)] border-[var(--glass-border)] ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      />
                      {errors.email && (
                        <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.email.message}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="p-2 text-foreground">{companyInfo.email || 'Not provided'}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground">Phone Number <span className="text-red-500">*</span></Label>
                  {isEditing ? (
                    <>
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
                            disabled={isSaving}
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
                    </>
                  ) : (
                    <p className="p-2 text-foreground">{companyInfo.phone || 'Not provided'}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="text-foreground">Website URL</Label>
                {isEditing ? (
                  <>
                    <Input
                      id="website"
                      {...register('website')}
                      disabled={isSaving}
                      placeholder="https://yourcompany.com"
                      className={`bg-[var(--input-background)] border-[var(--glass-border)] ${errors.website ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    />
                    {errors.website && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.website.message}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="p-2 text-foreground">{companyInfo.website || 'Not provided'}</p>
                )}
              </div>
            </div>
          </Card>

          {/* Location Information */}
          <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] shadow-lg">
            <div className="flex items-center gap-2 mb-6">
              <MapPin className="w-5 h-5 text-[var(--accent-text)]" />
              <h3 className="font-semibold text-foreground">Location Information</h3>
            </div>

            <div className="space-y-6">
              {/* Map Integration */}
              <div>
                <Label className="text-foreground mb-2 block">Location on Map</Label>
                <GoogleMapComponent 
                  address={companyInfo.address}
                  city={companyInfo.city}
                  state={companyInfo.state}
                  country={companyInfo.country}
                  editMode={isEditing}
                  height="400px"
                  initialLat={companyInfo.latitude}
                  initialLng={companyInfo.longitude}
                  onLocationChange={(location) => {
                    // Save latitude and longitude when location changes
                    if (isEditing) {
                      setValue('latitude', location.lat, { shouldDirty: true });
                      setValue('longitude', location.lng, { shouldDirty: true });
                      
                      // Update address fields with parsed location data
                      if (location.streetAddress) {
                        setValue('address', location.streetAddress, { shouldDirty: true });
                      }
                      if (location.city) {
                        setValue('city', location.city, { shouldDirty: true });
                      }
                      if (location.state) {
                        setValue('state', location.state, { shouldDirty: true });
                      }
                      if (location.postalCode) {
                        setValue('postalCode', location.postalCode, { shouldDirty: true });
                      }
                      if (location.country) {
                        setValue('country', location.country, { shouldDirty: true });
                      }
                    }
                  }}
                />
              </div>

              {/* Address Fields */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-foreground">Street Address <span className="text-red-500">*</span></Label>
                {isEditing ? (
                  <>
                    <Input
                      id="address"
                      {...register('address')}
                      disabled={isSaving}
                      placeholder="Enter street address"
                      className={`bg-[var(--input-background)] border-[var(--glass-border)] ${errors.address ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    />
                    {errors.address && (
                      <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.address.message}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="p-2 text-foreground">{companyInfo.address || 'Not provided'}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-foreground">City <span className="text-red-500">*</span></Label>
                  {isEditing ? (
                    <>
                      <Input
                        id="city"
                        {...register('city')}
                        disabled={isSaving}
                        placeholder="Enter city"
                        className={`bg-[var(--input-background)] border-[var(--glass-border)] ${errors.city ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      />
                      {errors.city && (
                        <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.city.message}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="p-2 text-foreground">{companyInfo.city || 'Not provided'}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="state" className="text-foreground">State/Province <span className="text-red-500">*</span></Label>
                  {isEditing ? (
                    <>
                      <Input
                        id="state"
                        {...register('state')}
                        disabled={isSaving}
                        placeholder="Enter state/province"
                        className={`bg-[var(--input-background)] border-[var(--glass-border)] ${errors.state ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      />
                      {errors.state && (
                        <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.state.message}
                        </p>
                      )}
                    </>
                  ) : (
                    <p className="p-2 text-foreground">{companyInfo.state || 'Not provided'}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="postalCode" className="text-foreground">Postal Code</Label>
                  {isEditing ? (
                    <Input
                      id="postalCode"
                      {...register('postalCode')}
                      disabled={isSaving}
                      placeholder="Enter postal code"
                      className="bg-[var(--input-background)] border-[var(--glass-border)]"
                    />
                  ) : (
                    <p className="p-2 text-foreground">{companyInfo.postalCode || 'Not provided'}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country" className="text-foreground">Country</Label>
                {isEditing ? (
                  <Input
                    id="country"
                    {...register('country')}
                    disabled={isSaving}
                    placeholder="Enter country"
                    className="bg-[var(--input-background)] border-[var(--glass-border)]"
                  />
                ) : (
                  <p className="p-2 text-foreground">{companyInfo.country || 'Not provided'}</p>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Current Status */}
          <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
            <h3 className="font-semibold text-foreground mb-4">Company Status</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium text-foreground">Approved & Active</p>
                  <p className="text-sm text-muted-foreground">Ready to accept appointments</p>
                </div>
              </div>
              <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30">
                Active Company
              </Badge>
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
            <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent text-foreground hover:text-foreground"
              >
                <Building className="w-4 h-4 mr-2" />
                View Public Profile
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent text-foreground hover:text-foreground"
              >
                <MapPin className="w-4 h-4 mr-2" />
                Update Location
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent text-foreground hover:text-foreground"
              >
                <Camera className="w-4 h-4 mr-2" />
                Upload Images
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent text-foreground hover:text-foreground"
                onClick={() => {
                  const companyId = id || user?.companyId;
                  if (companyId) {
                    navigate(`/web/${companyId}/dashboard`);
                  }
                }}
              >
                <Globe className="w-4 h-4 mr-2" />
                Setup Website
              </Button>
            </div>
          </Card>

          {/* Account Info */}
          <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] shadow-lg">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-[var(--accent-text)]" />
              Account Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Account Type</p>
                <p className="font-medium text-foreground">
                  {user?.role !== undefined ? UserRoleNames[user.role as UserRole] : 'User'}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Registration Date</p>
                <p className="font-medium text-foreground">
                  <DateDisplay date={reduxCompany?.createdAt || user?.createdAt} fallback="Not available" />
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="font-medium text-foreground">
                  {(() => {
                    const updatedDate = reduxCompany?.updatedAt ? new Date(reduxCompany.updatedAt) : 
                                      user?.updatedAt ? new Date(user.updatedAt) : null;
                    if (!updatedDate) return 'Not available';
                    
                    const today = new Date();
                    const yesterday = new Date(today);
                    yesterday.setDate(yesterday.getDate() - 1);
                    
                    if (updatedDate.toDateString() === today.toDateString()) {
                      return 'Today';
                    }
                    if (updatedDate.toDateString() === yesterday.toDateString()) {
                      return 'Yesterday';
                    }
                    return null;
                  })()}
                  {(() => {
                    const updatedDate = reduxCompany?.updatedAt ? new Date(reduxCompany.updatedAt) : 
                                      user?.updatedAt ? new Date(user.updatedAt) : null;
                    if (!updatedDate) return null;
                    
                    const today = new Date();
                    const yesterday = new Date(today);
                    yesterday.setDate(yesterday.getDate() - 1);
                    
                    if (updatedDate.toDateString() !== today.toDateString() && 
                        updatedDate.toDateString() !== yesterday.toDateString()) {
                      return <DateDisplay date={updatedDate} />;
                    }
                    return null;
                  })()}
                </p>
              </div>
            </div>
          </Card>

          {/* More Settings */}
          <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] shadow-lg">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5 text-[var(--accent-text)]" />
              <h3 className="font-semibold text-foreground">More Settings</h3>
            </div>

            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="currencyId" className="text-sm text-muted-foreground">Currency</Label>
                  {isEditing && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsAddCurrencyDialogOpen(true)}
                      className="h-7 px-2 text-xs text-[var(--accent-text)] hover:text-[var(--accent-primary)]"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Currency
                    </Button>
                  )}
                </div>
                {isEditing ? (
                  <Controller
                    name="currencyId"
                    control={control}
                    render={({ field }) => (
                      <Select 
                        value={field.value || undefined} 
                        onValueChange={(value) => {
                          field.onChange(value === "" ? undefined : value);
                        }}
                        disabled={isLoadingCurrencies}
                      >
                        <SelectTrigger id="currencyId" className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground">
                          <SelectValue placeholder={isLoadingCurrencies ? "Loading currencies..." : "Select currency"} />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border">
                          {currencies.map((currency) => (
                            <SelectItem key={currency.id} value={currency.id}>
                              {currency.name} ({currency.symbol})
                            </SelectItem>
                          ))}
                          {currencies.length === 0 && !isLoadingCurrencies && (
                            <div className="px-2 py-1.5 text-sm text-muted-foreground">No currencies available</div>
                          )}
                        </SelectContent>
                      </Select>
                    )}
                  />
                ) : (
                  <p className="font-medium text-foreground">
                    {(() => {
                      const selectedCurrency = currencies.find(c => c.id === companyInfo.currencyId);
                      return selectedCurrency 
                        ? `${selectedCurrency.name} (${selectedCurrency.symbol})`
                        : 'Not provided';
                    })()}
                  </p>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Add Currency Dialog */}
      <CustomDialog
        open={isAddCurrencyDialogOpen}
        onOpenChange={setIsAddCurrencyDialogOpen}
        title="Add New Currency"
        description="Create a new currency that will be available for selection."
        className="bg-[var(--glass-bg)] border-[var(--glass-border)]"
        footer={
          <>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddCurrencyDialogOpen(false);
                resetCurrency();
              }}
              disabled={isCreatingCurrency}
              className="bg-[var(--glass-bg)] border-[var(--glass-border)]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="currency-form"
              disabled={isCreatingCurrency}
              className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:from-[var(--accent-primary-hover)] hover:to-[var(--accent-primary)] text-[var(--accent-button-text)]"
            >
              {isCreatingCurrency ? 'Creating...' : 'Create Currency'}
            </Button>
          </>
        }
      >
        <form id="currency-form" onSubmit={handleSubmitCurrency(onCreateCurrency)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currency-name">Currency Name <span className="text-red-500">*</span></Label>
            <Input
              id="currency-name"
              {...registerCurrency('name', { required: 'Currency name is required' })}
              placeholder="e.g., USD, EUR, GBP"
              className="bg-[var(--input-background)] border-[var(--glass-border)]"
              disabled={isCreatingCurrency}
            />
            {currencyErrors.name && (
              <p className="text-sm text-red-500">{currencyErrors.name.message as string}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency-symbol">Symbol <span className="text-red-500">*</span></Label>
            <Input
              id="currency-symbol"
              {...registerCurrency('symbol', { required: 'Symbol is required' })}
              placeholder="e.g., $, €, £"
              className="bg-[var(--input-background)] border-[var(--glass-border)]"
              disabled={isCreatingCurrency}
            />
            {currencyErrors.symbol && (
              <p className="text-sm text-red-500">{currencyErrors.symbol.message as string}</p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency-decimals">Decimal Places</Label>
              <Controller
                name="decimals"
                control={controlCurrency}
                render={({ field }) => (
                  <Input
                    id="currency-decimals"
                    type="number"
                    min="0"
                    max="10"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || 2)}
                    className="bg-[var(--input-background)] border-[var(--glass-border)]"
                    disabled={isCreatingCurrency}
                  />
                )}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency-rounding">Rounding</Label>
              <Controller
                name="rounding"
                control={controlCurrency}
                render={({ field }) => (
                  <Input
                    id="currency-rounding"
                    type="number"
                    step="0.01"
                    min="0"
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0.01)}
                    className="bg-[var(--input-background)] border-[var(--glass-border)]"
                    disabled={isCreatingCurrency}
                  />
                )}
              />
            </div>
          </div>
        </form>
      </CustomDialog>
    </div>
  );
}