import { Card } from "@/components/ui/card";
import { CompanyCardProps } from "./types";
import { CompanyCardView } from "./CompanyCardView";

export const CompanyCard = ({ company, onViewCompany }: CompanyCardProps) => {
  return (
    <Card 
      className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--glass-shadow)] cursor-pointer" 
      onClick={() => onViewCompany(company.id)}
    >
      <CompanyCardView company={company} onViewCompany={onViewCompany} />
    </Card>
  );
};
