import { Card } from "../../../../../components/ui/card";

interface CompanyProductDetailNotesProps {
  notes: string;
}

export const CompanyProductDetailNotes = ({ notes }: CompanyProductDetailNotesProps) => {
  if (!notes) {
    return null;
  }

  return (
    <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
      <h3 className="font-semibold text-foreground mb-4">Notes</h3>
      <p className="text-muted-foreground">{notes}</p>
    </Card>
  );
};
