import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/common/PhoneInput";
import { WizardHeader } from "../components/WizardHeader";
import { CompanyFormData } from "../types";

interface ContactInfoStepProps {
  formData: CompanyFormData;
  onInputChange: (field: keyof CompanyFormData, value: string) => void;
}

export const ContactInfoStep = ({ formData, onInputChange }: ContactInfoStepProps) => {
  return (
    <div className="space-y-4">
      <WizardHeader
        title="Contact Information"
        description="How can customers reach you?"
      />
      
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => onInputChange('email', e.target.value)}
              placeholder="company@example.com"
              className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-foreground">Phone Number *</Label>
            <PhoneInput
              id="phone"
              value={formData.phone || ""}
              onChange={(value) => onInputChange('phone', value)}
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
            onChange={(e) => onInputChange('website', e.target.value)}
            placeholder="https://yourcompany.com"
            className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
          />
        </div>
      </div>
    </div>
  );
};
