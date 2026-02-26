import { Card } from "../../../components/ui/card";
import { CompanyRegistrationCard } from "../../companies/CompanyRegistrationCard";

interface CompanyRegistrationSectionProps {
  show: boolean;
}

export const CompanyRegistrationSection = ({ show }: CompanyRegistrationSectionProps) => {
  if (!show) return null;

  return (
    <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] shadow-lg">
      <div>
        <h4 className="font-medium text-foreground mb-2">Company Registration</h4>
        <p className="text-muted-foreground text-sm mb-3">
          Register your company to access business features and manage your team.
        </p>
        <div className="space-y-4">
          <CompanyRegistrationCard />
        </div>
      </div>
    </Card>
  );
};
