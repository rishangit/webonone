import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CompanyFormData } from "../types";
import { Tag } from "@/services/tags";

interface SummaryCardProps {
  formData: CompanyFormData;
  tags: Tag[];
}

export const SummaryCard = ({ formData, tags }: SummaryCardProps) => {
  return (
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
  );
};
