import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { BasicTabState } from "../types";

interface BasicSettingsTabProps {
  value: BasicTabState;
  onChange: (next: BasicTabState) => void;
}

export const BasicSettingsTab = ({ value, onChange }: BasicSettingsTabProps) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="theme-name">Theme Name *</Label>
        <Input
          id="theme-name"
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          placeholder="e.g., Modern Blue"
          className="bg-[var(--input-background)] border-[var(--glass-border)]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="bg-color">Background Color</Label>
          <Input
            id="bg-color"
            type="color"
            value={value.backgroundColor}
            onChange={(e) => onChange({ ...value, backgroundColor: e.target.value })}
            className="bg-[var(--input-background)] border-[var(--glass-border)] h-10"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="body-color">Body Text Color</Label>
          <Input
            id="body-color"
            type="color"
            value={value.bodyTextColor}
            onChange={(e) => onChange({ ...value, bodyTextColor: e.target.value })}
            className="bg-[var(--input-background)] border-[var(--glass-border)] h-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="flex items-center gap-3 p-4 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)]">
          <Checkbox
            id="theme-active"
            checked={value.isActive}
            onCheckedChange={(checked) => onChange({ ...value, isActive: !!checked })}
          />
          <Label htmlFor="theme-active" className="cursor-pointer">
            Mark as Active
          </Label>
        </div>
        <div className="flex items-center gap-3 p-4 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)]">
          <Checkbox
            id="theme-default"
            checked={value.isDefault}
            onCheckedChange={(checked) => onChange({ ...value, isDefault: !!checked })}
          />
          <Label htmlFor="theme-default" className="cursor-pointer">
            Set as Default Theme
          </Label>
        </div>
      </div>
    </div>
  );
};
