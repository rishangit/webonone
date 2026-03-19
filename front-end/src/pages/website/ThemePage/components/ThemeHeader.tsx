import { Plus } from "lucide-react";
import { Button } from "../../../../components/ui/button";

interface ThemeHeaderProps {
  onAdd: () => void;
}

export const ThemeHeader = ({ onAdd }: ThemeHeaderProps) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Theme Management</h2>
        <p className="text-muted-foreground">
          Create and manage multiple themes for your website
        </p>
      </div>
      <Button
        onClick={onAdd}
        className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:from-[var(--accent-primary-hover)] hover:to-[var(--accent-primary)] text-[var(--accent-button-text)]"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Theme
      </Button>
    </div>
  );
};

