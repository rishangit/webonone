import { useState, useEffect, useRef } from "react";
import { CustomDialog } from "../../components/ui/custom-dialog";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { GoogleMapComponent } from "../../components/GoogleMapComponent";
import { 
  Building, 
  CheckCircle, 
  ChevronLeft, 
  ChevronRight,
  Check
} from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchTagsRequest } from "../../store/slices/tagsSlice";
import {
  createCompanyRequest,
  clearError as clearCompaniesError
} from "../../store/slices/companiesSlice";
import { TagSelector } from "../../components/tags/TagSelector";
import { PhoneInput } from "../../components/common/PhoneInput";
import { ImageCropDialog } from "../../components/ui/image-crop-dialog";

interface CompanyRegistrationWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface CompanyFormData {
  companyName: string;
  description: string;
  contactPerson: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  latitude?: number;
  longitude?: number;
  tagIds: string[];
  employees: string;
  logo?: string;
  selectedEntities?: string[] | null;
}

const employeeSizes = [
  "1-5",
  "6-10",
  "11-20", 
  "21-50",
  "51-200",
  "201-500",
  "500+"
];

export function CompanyRegistrationWizard({ open, onOpenChange }: CompanyRegistrationWizardProps) {
  const dispatch = useAppDispatch();
  const companies = useAppSelector((state) => state.companies);
  const { loading: companiesLoading, error: companiesError } = companies;
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  // Default selected entities - all entities selected by default
  const defaultSelectedEntities = ['appointment', 'staff', 'service', 'product', 'space'];
  
  const [formData, setFormData] = useState<CompanyFormData>({
    companyName: "",
    description: "",
    contactPerson: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    city: "",
    state: "",
    country: "United States",
    postalCode: "",
    latitude: undefined,
    longitude: undefined,
    tagIds: [],
    employees: "",
    logo: "",
    selectedEntities: defaultSelectedEntities
  });

  const totalSteps = 5;
  
  const { tags } = useAppSelector((state) => state.tags);
  
  // Fetch tags when step 2, 4, or 5 is active or dialog opens
  useEffect(() => {
    if (open && (currentStep === 2 || currentStep === 4 || currentStep === 5 || tags.length === 0)) {
      dispatch(fetchTagsRequest({ active: true }));
    }
  }, [open, currentStep, dispatch, tags.length]);

  // Handle company errors
  useEffect(() => {
    if (companiesError) {
      toast.error(companiesError);
      dispatch(clearCompaniesError());
    }
  }, [companiesError, dispatch]);

  const handleInputChange = (field: keyof CompanyFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTagsChange = (tagIds: string[]) => {
    setFormData(prev => ({
      ...prev,
      tagIds
    }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Read file and open crop dialog
    const reader = new FileReader();
    reader.onload = (e) => {
      const imageSrc = e.target?.result as string;
      setImageToCrop(imageSrc);
      setCropDialogOpen(true);
    };
    reader.readAsDataURL(file);

    // Reset file input
    event.target.value = '';
  };

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    try {
      // Convert blob to base64 string
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64String = e.target?.result as string;
        setFormData(prev => ({ ...prev, logo: base64String }));
        toast.success("Logo uploaded successfully!");
      };
      reader.readAsDataURL(croppedImageBlob);
    } catch (error) {
      console.error('Error processing cropped image:', error);
      toast.error('Failed to process image');
    } finally {
      setImageToCrop(null);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.companyName && formData.description && formData.contactPerson;
      case 2:
        return formData.tagIds.length > 0 && formData.employees;
      case 3:
        return formData.email && formData.phone;
      case 4:
        return formData.address && formData.city && formData.state && formData.country;
      case 5:
        return true; // Review step - always can proceed
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!canProceed()) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!formData.tagIds || formData.tagIds.length === 0) {
      toast.error("Please select at least one tag");
      return;
    }

    setIsSubmitting(true);
    
    // Dispatch Redux action to create company with tagIds
    dispatch(createCompanyRequest({
      ...formData,
      tagIds: formData.tagIds
    }));
  };

  // Reset form and close dialog when company is successfully created
  const previousCompaniesCount = useRef(companies.companies.length);
  
  useEffect(() => {
    // Check if a new company was added (successful creation)
    if (companies.companies.length > previousCompaniesCount.current && !companiesLoading && !companies.error) {
      // Reset form
      setCurrentStep(1);
      setFormData({
        companyName: "",
        description: "",
        contactPerson: "",
        email: "",
        phone: "",
        website: "",
        address: "",
        city: "",
        state: "",
        country: "United States",
        postalCode: "",
        latitude: undefined,
        longitude: undefined,
        tagIds: [],
        employees: "",
        logo: "",
        selectedEntities: defaultSelectedEntities
      });
      setIsSubmitting(false);
      previousCompaniesCount.current = companies.companies.length;
      
      // Close dialog after a short delay
      setTimeout(() => {
        onOpenChange(false);
      }, 1500);
    }
  }, [companies.companies.length, companiesLoading, companies.error, onOpenChange]);

  // Reset submitting state when error occurs
  useEffect(() => {
    if (companies.error && isSubmitting) {
      setIsSubmitting(false);
    }
  }, [companies.error, isSubmitting]);

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-6 h-6 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs md:text-sm ${
            step <= currentStep 
              ? 'bg-[var(--accent-primary)] text-[var(--accent-button-text)]' 
              : 'bg-muted text-muted-foreground'
          }`}>
            {step < currentStep ? (
              <Check className="w-3 h-3 md:w-4 md:h-4" />
            ) : (
              step
            )}
          </div>
          {step < totalSteps && (
            <div className={`w-4 md:w-12 h-0.5 mx-0.5 md:mx-2 ${
              step < currentStep ? 'bg-[var(--accent-primary)]' : 'bg-muted'
            }`} />
          )}
        </div>
      ))}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 1: // Basic Company Info
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">Company Information</h3>
              <p className="text-muted-foreground">Tell us about your business</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company-name" className="text-foreground">Company Name *</Label>
                <Input
                  id="company-name"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="Enter your company name"
                  className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="contact-person" className="text-foreground">Contact Person *</Label>
                <Input
                  id="contact-person"
                  value={formData.contactPerson}
                  onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                  placeholder="Primary contact person"
                  className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-foreground">Company Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe your company and services..."
                  rows={3}
                  className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground resize-none"
                />
              </div>
            </div>
          </div>
        );

      case 2: // Tags & Size
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">Business Tags & Size</h3>
              <p className="text-muted-foreground">Select tags that describe your business and company size</p>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tags" className="text-foreground">Business Tags *</Label>
                <TagSelector
                  value={formData.tagIds}
                  onChange={handleTagsChange}
                  placeholder="Select tags for your business"
                />
                <p className="text-xs text-muted-foreground">
                  Select one or more tags that best describe your business. You can search for tags in the dropdown.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="employees" className="text-foreground">Company Size *</Label>
                <Select value={formData.employees} onValueChange={(value) => handleInputChange('employees', value)}>
                  <SelectTrigger className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground">
                    <SelectValue placeholder="Select company size" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {employeeSizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size} employees
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 3: // Contact Information
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">Contact Information</h3>
              <p className="text-muted-foreground">How can customers reach you?</p>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-foreground">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="company@example.com"
                    className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-foreground">Phone Number *</Label>
                  <PhoneInput
                    id="phone"
                    value={formData.phone || ""}
                    onChange={(value) => handleInputChange('phone', value)}
                    placeholder="Enter phone number"
                    error={false}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website" className="text-foreground">Website URL</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="https://yourcompany.com"
                  className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
                />
              </div>
            </div>
          </div>
        );

      case 4: // Location
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">Location Information</h3>
              <p className="text-muted-foreground">Add your business location on the map and complete address details</p>
            </div>
            
            <div className="space-y-4">
              {/* Map Integration */}
              <div>
                <Label className="text-foreground mb-2 block">Location on Map</Label>
                <GoogleMapComponent 
                  address={formData.address}
                  city={formData.city}
                  state={formData.state}
                  country={formData.country}
                  editMode={true}
                  height="400px"
                  initialLat={formData.latitude}
                  initialLng={formData.longitude}
                  onLocationChange={(location) => {
                    // Save latitude and longitude when location changes
                    setFormData(prev => ({
                      ...prev,
                      latitude: location.lat,
                      longitude: location.lng
                    }));
                    
                    // Update address fields with parsed location data
                    if (location.streetAddress) {
                      handleInputChange('address', location.streetAddress);
                    }
                    if (location.city) {
                      handleInputChange('city', location.city);
                    }
                    if (location.state) {
                      handleInputChange('state', location.state);
                    }
                    if (location.postalCode) {
                      handleInputChange('postalCode', location.postalCode);
                    }
                    if (location.country) {
                      handleInputChange('country', location.country);
                    }
                  }}
                />
              </div>

              {/* Address Fields */}
              <div className="space-y-2">
                <Label htmlFor="address" className="text-foreground">Street Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="123 Main Street, Suite 100"
                  className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city" className="text-foreground">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="City name"
                    className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="state" className="text-foreground">State/Province *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="State/Province"
                    className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="postalCode" className="text-foreground">Postal Code</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => handleInputChange('postalCode', e.target.value)}
                    placeholder="Postal code"
                    className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="country" className="text-foreground">Country *</Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange('country', e.target.value)}
                  placeholder="Country"
                  className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
                />
              </div>
            </div>
          </div>
        );

      case 5: // Review
        return (
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">Review & Submit</h3>
              <p className="text-muted-foreground">Review your information before submitting</p>
            </div>
            
            {/* Summary Card */}
            <Card className="p-4 bg-[var(--glass-bg)] border border-[var(--glass-border)]">
              <h4 className="font-medium text-foreground mb-3">Registration Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Company:</span>
                  <span className="text-foreground font-medium">{formData.companyName || "Not entered"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Contact Person:</span>
                  <span className="text-foreground">{formData.contactPerson || "Not entered"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span className="text-foreground">{formData.email || "Not entered"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Phone:</span>
                  <span className="text-foreground">{formData.phone || "Not entered"}</span>
                </div>
                <div className="flex justify-between items-start">
                  <span className="text-muted-foreground">Tags:</span>
                  <div className="flex flex-wrap gap-1 justify-end max-w-[60%]">
                    {formData.tagIds.length > 0 ? (
                      tags
                        .filter(tag => formData.tagIds.includes(tag.id))
                        .map(tag => (
                          <Badge
                            key={tag.id}
                            variant="secondary"
                            className="text-xs"
                            style={{ 
                              backgroundColor: `${tag.color}20`, 
                              color: tag.color,
                              borderColor: `${tag.color}40`
                            }}
                          >
                            {tag.icon && <span className="mr-1">{tag.icon}</span>}
                            {tag.name}
                          </Badge>
                        ))
                    ) : (
                      <span className="text-foreground">Not selected</span>
                    )}
                  </div>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Company Size:</span>
                  <span className="text-foreground">{formData.employees ? `${formData.employees} employees` : "Not selected"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location:</span>
                  <span className="text-foreground text-right">
                    {formData.address ? `${formData.address}, ` : ''}
                    {formData.city && formData.state ? `${formData.city}, ${formData.state}` : formData.city || formData.state || "Not entered"}
                    {formData.postalCode ? ` ${formData.postalCode}` : ''}
                    {formData.country ? `, ${formData.country}` : ''}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  const footer = (
    <div className="flex items-center justify-between w-full">
      <Button
        variant="outline"
        onClick={prevStep}
        disabled={currentStep === 1}
        className="border-[var(--accent-border)] text-foreground hover:bg-[var(--accent-bg)]"
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Previous
      </Button>

      {currentStep === totalSteps ? (
        <Button
          onClick={handleSubmit}
          disabled={!canProceed() || isSubmitting}
          className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:from-[var(--accent-primary-hover)] hover:to-[var(--accent-primary)] text-[var(--accent-button-text)]"
        >
          {isSubmitting ? "Submitting..." : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              Submit Registration
            </>
          )}
        </Button>
      ) : (
        <Button
          onClick={nextStep}
          disabled={!canProceed()}
          className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:from-[var(--accent-primary-hover)] hover:to-[var(--accent-primary)] text-[var(--accent-button-text)]"
        >
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      )}
    </div>
  );

  return (
    <>
      <CustomDialog
        open={open}
        onOpenChange={onOpenChange}
        title="Company Registration"
        description="Register your company on our appointment management platform"
        icon={<Building className="w-5 h-5" />}
        maxWidth="max-w-2xl"
        footer={footer}
      >
        <div className="space-y-6">
          <StepIndicator />
          
          <div>
            {renderStepContent()}
          </div>
        </div>
      </CustomDialog>
      {imageToCrop && (
        <ImageCropDialog
          open={cropDialogOpen}
          onOpenChange={setCropDialogOpen}
          imageSrc={imageToCrop}
          onCropComplete={handleCropComplete}
        />
      )}
    </>
  );
}