import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatAvatarUrl } from "@/utils";
import { Company } from "../types";

interface CompanyCardHeaderProps {
  company: Company;
  getStatusColor: (status: string) => string;
  actualStatus: "pending" | "approved" | "rejected";
}

export const CompanyCardHeader = ({
  company,
  getStatusColor,
  actualStatus
}: CompanyCardHeaderProps) => {
  return (
    <div className="flex items-start gap-3">
      <Avatar className="w-20 h-20 flex-shrink-0">
        <AvatarImage src={company.logo ? formatAvatarUrl(company.logo) : undefined} alt={company.name} />
        <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)]">
          {company.name.substring(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground mb-1 truncate">{company.name}</h3>
            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">{company.description}</p>
            
            <Badge className={`${getStatusColor(actualStatus)} border text-xs px-2 py-1`}>
              {actualStatus.charAt(0).toUpperCase() + actualStatus.slice(1)}
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};
