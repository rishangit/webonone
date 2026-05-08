import { Phone, Mail, Globe } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { CardTitle } from "@/components/common/CardTitle";
import { Company } from "../types";

interface CompanyContactCardProps {
  company: Company;
}

export const CompanyContactCard = ({ company }: CompanyContactCardProps) => {
  return (
    <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] shadow-lg">
      <CardTitle title="Contact Information" icon={Phone} className="mb-6" />

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-foreground">Email Address <span className="text-red-500">*</span></Label>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-muted-foreground" />
              <a href={`mailto:${company.email}`} className="text-[var(--accent-text)] hover:text-[var(--accent-primary-hover)]">
                {company.email || 'Not provided'}
              </a>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-foreground">Phone Number <span className="text-red-500">*</span></Label>
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-muted-foreground" />
              <a href={`tel:${company.phone}`} className="text-[var(--accent-text)] hover:text-[var(--accent-primary-hover)]">
                {company.phone || 'Not provided'}
              </a>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">Website URL</Label>
          {company.website ? (
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              <a 
                href={company.website} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[var(--accent-text)] hover:text-[var(--accent-primary-hover)]"
              >
                {company.website}
              </a>
            </div>
          ) : (
            <p className="p-2 text-foreground">Not provided</p>
          )}
        </div>
      </div>
    </Card>
  );
};
