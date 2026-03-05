import { FileText } from "lucide-react";
import { Card } from "../../../../../components/ui/card";
import { CardTitle } from "../../../../../components/common/CardTitle";

interface CompanyProductDetailNotesProps {
  notes: string;
}

export const CompanyProductDetailNotes = ({ notes }: CompanyProductDetailNotesProps) => {
  if (!notes) {
    return null;
  }

  return (
    <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
      <CardTitle title="Notes" icon={FileText} />
      <p className="text-muted-foreground">{notes}</p>
    </Card>
  );
};
