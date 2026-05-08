import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { WizardHeader } from "../components/WizardHeader";
import { CompanyFormData } from "../types";

interface BasicInfoStepProps {
  formData: CompanyFormData;
  onInputChange: (field: keyof CompanyFormData, value: string) => void;
}

export const BasicInfoStep = ({ formData, onInputChange }: BasicInfoStepProps) => {
  return (
    <div className="space-y-4">
      <WizardHeader
        title="Company Information"
        description="Tell us about your business"
      />
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="company-name" className="text-foreground">Company Name *</Label>
          <Input
            id="company-name"
            value={formData.companyName}
            onChange={(e) => onInputChange('companyName', e.target.value)}
            placeholder="Enter your company name"
            className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="contact-person" className="text-foreground">Contact Person *</Label>
          <Input
            id="contact-person"
            value={formData.contactPerson}
            onChange={(e) => onInputChange('contactPerson', e.target.value)}
            placeholder="Primary contact person"
            className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-foreground">Company Description *</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => onInputChange('description', e.target.value)}
            placeholder="Describe your company and services..."
            rows={3}
            className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground resize-none"
          />
        </div>
      </div>
    </div>
  );
};
