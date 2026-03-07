import { Building } from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { CardTitle } from "../../../../components/common/CardTitle";
import { DateDisplay } from "../../../../components/common/DateDisplay";
import { Company } from "../types";

interface CompanyAccountCardProps {
  company: Company;
}

export const CompanyAccountCard = ({ company }: CompanyAccountCardProps) => {
  return (
    <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] shadow-lg">
      <CardTitle title="Account Information" icon={Building} />
      <div className="space-y-3">
        <div>
          <p className="text-sm text-muted-foreground">Registration Date</p>
          <p className="font-medium text-foreground">
            <DateDisplay date={company.submittedDate} fallback="Not available" />
          </p>
        </div>
        {company.approvedDate && (
          <div>
            <p className="text-sm text-muted-foreground">Approved Date</p>
            <p className="font-medium text-foreground">
              <DateDisplay date={company.approvedDate} />
            </p>
          </div>
        )}
        {company.rejectedDate && (
          <div>
            <p className="text-sm text-muted-foreground">Rejected Date</p>
            <p className="font-medium text-foreground">
              <DateDisplay date={company.rejectedDate} />
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
