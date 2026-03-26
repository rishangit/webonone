import { Building } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CardTitle } from "@/components/common/CardTitle";
import { formatAvatarUrl } from "@/utils";
import { Company } from "../types";

interface CompanyProfileCardProps {
  company: Company;
}

export const CompanyProfileCard = ({ company }: CompanyProfileCardProps) => {
  return (
    <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] shadow-lg">
      <CardTitle title="Company Profile" icon={Building} className="mb-6" />

      <div className="space-y-6">
        {/* Logo Upload */}
        <div className="space-y-2">
          <Label className="text-foreground">Company Logo</Label>
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20 ring-2 ring-[var(--accent-border)]">
              <AvatarImage 
                src={company.logo ? formatAvatarUrl(company.logo) : undefined} 
                alt="Company Logo" 
              />
              <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)] text-lg">
                {(company.name || '').slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {company.logo && (
              <p className="text-sm text-muted-foreground">Logo uploaded</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-foreground">Company Name <span className="text-red-500">*</span></Label>
            <p className="p-2 text-foreground">{company.name || 'Not provided'}</p>
          </div>
          
          <div className="space-y-2">
            <Label className="text-foreground">Contact Person</Label>
            <p className="p-2 text-foreground">{company.contactPerson || 'Not provided'}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">Company Description <span className="text-red-500">*</span></Label>
          <p className="p-2 text-foreground">{company.description || 'Not provided'}</p>
        </div>

        <div className="space-y-2">
          <Label className="text-foreground">Company Size</Label>
          <p className="p-2 text-foreground">
            {company.companySize ? `${company.companySize} employees` : (company.employees ? `${company.employees} employees` : 'Not provided')}
          </p>
        </div>
      </div>
    </Card>
  );
};
