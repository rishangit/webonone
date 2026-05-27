import { CompanyCardProps } from "./types";
import { CompanyCardView } from "./CompanyCardView";

export const CompanyCard = ({ company, onViewCompany }: CompanyCardProps) => {
  return <CompanyCardView company={company} onViewCompany={onViewCompany} />;
};
