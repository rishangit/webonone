import { useState, useEffect, useRef } from "react";
import { CustomDialog } from "../../../components/ui/custom-dialog";
import { Button } from "../../../components/ui/button";
import { Building, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { fetchTagsRequest } from "../../../store/slices/tagsSlice";
import {
  createCompanyRequest,
  clearError as clearCompaniesError
} from "../../../store/slices/companiesSlice";
import { ImageCropDialog } from "../../../components/ui/image-crop-dialog";
import { CompanyRegistrationWizardProps, CompanyFormData } from "./types";
import { defaultSelectedEntities, TOTAL_STEPS } from "./constants";
import { WizardProgress } from "./components/WizardProgress";
import { BasicInfoStep, TagsAndSizeStep, ContactInfoStep, LocationStep, ReviewStep } from "./steps";

export const CompanyRegistrationWizard = ({ open, onOpenChange }: CompanyRegistrationWizardProps) => {
  const dispatch = useAppDispatch();
  const companies = useAppSelector((state) => state.companies);
  const { loading: companiesLoading, error: companiesError } = companies;
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  
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

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageSrc = e.target?.result as string;
      setImageToCrop(imageSrc);
      setCropDialogOpen(true);
    };
    reader.readAsDataURL(file);

    event.target.value = '';
  };

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    try {
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
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (currentStep < TOTAL_STEPS) {
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
    
    dispatch(createCompanyRequest({
      ...formData,
      tagIds: formData.tagIds
    }));
  };

  // Reset form and close dialog when company is successfully created
  const previousCompaniesCount = useRef(companies.companies.length);
  
  useEffect(() => {
    if (companies.companies.length > previousCompaniesCount.current && !companiesLoading && !companies.error) {
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
      
      setTimeout(() => {
        onOpenChange(false);
      }, 1500);
    }
  }, [companies.companies.length, companiesLoading, companies.error, onOpenChange]);

  useEffect(() => {
    if (companies.error && isSubmitting) {
      setIsSubmitting(false);
    }
  }, [companies.error, isSubmitting]);

  const handleLocationChange = (location: {
    lat: number;
    lng: number;
    streetAddress?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  }) => {
    setFormData(prev => ({
      ...prev,
      latitude: location.lat,
      longitude: location.lng
    }));
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <BasicInfoStep
            formData={formData}
            onInputChange={handleInputChange}
          />
        );
      case 2:
        return (
          <TagsAndSizeStep
            formData={formData}
            onInputChange={handleInputChange}
            onTagsChange={handleTagsChange}
          />
        );
      case 3:
        return (
          <ContactInfoStep
            formData={formData}
            onInputChange={handleInputChange}
          />
        );
      case 4:
        return (
          <LocationStep
            formData={formData}
            onInputChange={handleInputChange}
            onLocationChange={handleLocationChange}
          />
        );
      case 5:
        return (
          <ReviewStep
            formData={formData}
            tags={tags}
          />
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

      {currentStep === TOTAL_STEPS ? (
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
          <WizardProgress currentStep={currentStep} totalSteps={TOTAL_STEPS} />
          
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
};
