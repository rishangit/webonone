import { WizardHeader } from "../components/WizardHeader";
import { SummaryCard } from "../components/SummaryCard";
import { CompanyFormData } from "../types";
import { Tag } from "@/services/tags";

interface ReviewStepProps {
  formData: CompanyFormData;
  tags: Tag[];
}

export const ReviewStep = ({ formData, tags }: ReviewStepProps) => {
  return (
    <div className="space-y-4">
      <WizardHeader
        title="Review & Submit"
        description="Review your information before submitting"
      />
      
      <SummaryCard formData={formData} tags={tags} />
    </div>
  );
};
