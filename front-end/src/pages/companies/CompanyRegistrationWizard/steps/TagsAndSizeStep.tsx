import { Label } from "../../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../../components/ui/select";
import { TagSelector } from "../../../../components/tags/TagSelector";
import { WizardHeader } from "../components/WizardHeader";
import { CompanyFormData } from "../types";
import { employeeSizes } from "../constants";

interface TagsAndSizeStepProps {
  formData: CompanyFormData;
  onInputChange: (field: keyof CompanyFormData, value: string) => void;
  onTagsChange: (tagIds: string[]) => void;
}

export const TagsAndSizeStep = ({ formData, onInputChange, onTagsChange }: TagsAndSizeStepProps) => {
  return (
    <div className="space-y-4">
      <WizardHeader
        title="Business Tags & Size"
        description="Select tags that describe your business and company size"
      />
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="tags" className="text-foreground">Business Tags *</Label>
          <TagSelector
            value={formData.tagIds}
            onChange={onTagsChange}
            placeholder="Select tags for your business"
          />
          <p className="text-xs text-muted-foreground">
            Select one or more tags that best describe your business. You can search for tags in the dropdown.
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="employees" className="text-foreground">Company Size *</Label>
          <Select value={formData.employees} onValueChange={(value) => onInputChange('employees', value)}>
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
};
