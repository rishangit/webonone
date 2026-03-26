import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatAvatarUrl } from "../../../../utils";
import { Company } from "../types";

interface CompanyOwnerInfoProps {
  company: Company;
}

export const CompanyOwnerInfo = ({ company }: CompanyOwnerInfoProps) => {
  if (!company.owner) return null;

  return (
    <div className="flex items-center gap-2 text-sm pt-2 border-t border-border">
      <User className="w-4 h-4 text-[var(--accent-text)] flex-shrink-0" />
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Avatar className="w-6 h-6 flex-shrink-0">
          <AvatarImage src={company.owner.avatar ? formatAvatarUrl(company.owner.avatar) : undefined} alt={company.owner.name} />
          <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)] text-xs">
            {company.owner.name ? company.owner.name.substring(0, 2).toUpperCase() : 'U'}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="text-foreground font-medium truncate">{company.owner.name}</div>
          <div className="text-muted-foreground text-xs truncate">{company.owner.email}</div>
        </div>
      </div>
    </div>
  );
};
