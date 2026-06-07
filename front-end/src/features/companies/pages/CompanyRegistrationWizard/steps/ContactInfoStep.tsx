import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PhoneInput } from "@/components/common/PhoneInput";
import { WizardHeader } from "../components/WizardHeader";
import { CompanyFormData } from "../types";
import { buildDomId } from "@/shared/utils/domId";

const ID = {
  emailInput: buildDomId("company", "registration-step-contact", "email-input"),
  phoneInput: buildDomId("company", "registration-step-contact", "phone-input"),
  websiteInput: buildDomId("company", "registration-step-contact", "website-input"),
} as const;

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
            <Label htmlFor={ID.emailInput} className="text-foreground">Email Address *</Label>
            <Input
              id={ID.emailInput}
              type="email"
              value={formData.email}
              onChange={(e) => onInputChange('email', e.target.value)}
              placeholder="company@example.com"
              className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor={ID.phoneInput} className="text-foreground">Phone Number *</Label>
            <PhoneInput
              id={ID.phoneInput}
              value={formData.phone || ""}
              onChange={(value) => onInputChange('phone', value)}
              placeholder="Enter phone number"
              error={false}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor={ID.websiteInput} className="text-foreground">Website URL</Label>
          <Input
            id={ID.websiteInput}
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
