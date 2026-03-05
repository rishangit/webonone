import { MapPin, Users, Tag } from "lucide-react";
import { Badge } from "../../../../components/ui/badge";
import { Company } from "../types";

interface CompanyDetailsProps {
  company: Company;
}

export const CompanyDetails = ({ company }: CompanyDetailsProps) => {
  return (
    <div className="space-y-2">
      {company.contactPerson && (
        <div className="flex items-center gap-2 text-sm">
          <Users className="w-4 h-4 text-[var(--accent-text)]" />
          <span className="text-muted-foreground">Contact:</span>
          <span className="text-foreground truncate">{company.contactPerson}</span>
        </div>
      )}
      
      {(company.city && company.state) ? (
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-[var(--accent-text)]" />
          <span className="text-muted-foreground">Location:</span>
          <span className="text-foreground truncate">{company.city}, {company.state}</span>
        </div>
      ) : company.address ? (
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="w-4 h-4 text-[var(--accent-text)]" />
          <span className="text-muted-foreground">Address:</span>
          <span className="text-foreground truncate">{company.address}</span>
        </div>
      ) : null}
      
      {company.tags && company.tags.length > 0 && (
        <div className="flex items-start gap-2 text-sm">
          <Tag className="w-4 h-4 text-[var(--accent-text)] mt-0.5 flex-shrink-0" />
          <div className="flex flex-wrap gap-1.5 flex-1">
            {company.tags.map((tag) => (
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
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
