import { Textarea } from "../../../../components/ui/textarea";

interface NotesStepProps {
  notes: string;
  setNotes: (notes: string) => void;
}

export const NotesStep = ({ notes, setNotes }: NotesStepProps) => {
  return (
    <div className="space-y-3 pb-4">
      <Textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Add any special instructions or notes for this appointment..."
        className="bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground resize-none min-h-24 sm:min-h-32 touch-manipulation"
        rows={4}
      />
      <p className="text-xs text-muted-foreground">
        Optional: Provide any additional information that might be helpful for your appointment.
      </p>
    </div>
  );
};
