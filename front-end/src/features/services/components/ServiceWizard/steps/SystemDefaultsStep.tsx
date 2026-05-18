import { Clock, DollarSign } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SERVICE_WIZARD_INPUT_SURFACE } from "../constants";

export interface SystemDefaultsStepProps {
  defaultDuration: string;
  defaultPrice: string;
  isActive: boolean;
  onDefaultDurationChange: (v: string) => void;
  onDefaultPriceChange: (v: string) => void;
  onIsActiveChange: (v: boolean) => void;
}

export function SystemDefaultsStep({
  defaultDuration,
  defaultPrice,
  isActive,
  onDefaultDurationChange,
  onDefaultPriceChange,
  onIsActiveChange,
}: SystemDefaultsStepProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-foreground">
            <Clock className="w-4 h-4" /> Duration (minutes)
          </Label>
          <Input
            type="number"
            min={1}
            value={defaultDuration}
            onChange={(e) => onDefaultDurationChange(e.target.value)}
            className={SERVICE_WIZARD_INPUT_SURFACE}
            placeholder="Optional template default"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-foreground">Status</Label>
          <Select value={isActive ? "active" : "inactive"} onValueChange={(value) => onIsActiveChange(value === "active")}>
            <SelectTrigger className={SERVICE_WIZARD_INPUT_SURFACE}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3">
        <Label className="flex items-center gap-2 text-foreground text-sm">
          <DollarSign className="w-4 h-4" /> Suggested default price (optional)
        </Label>
        <p className="text-xs text-muted-foreground mb-2">Used as a catalog hint for companies; can be left empty.</p>
        <Input
          type="number"
          min={0}
          step="0.01"
          value={defaultPrice}
          onChange={(e) => onDefaultPriceChange(e.target.value)}
          className={SERVICE_WIZARD_INPUT_SURFACE}
          placeholder="Optional"
        />
      </div>
    </div>
  );
}
