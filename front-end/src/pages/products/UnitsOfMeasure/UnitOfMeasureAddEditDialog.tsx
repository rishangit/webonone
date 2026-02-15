import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { CustomDialog } from "../../../components/ui/custom-dialog";
import { CreateUnitsOfMeasureData } from "../../../services/unitsOfMeasure";
import { UnitsOfMeasure } from "../../../services/unitsOfMeasure";

interface UnitOfMeasureAddEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  formData: CreateUnitsOfMeasureData;
  onFormDataChange: (data: CreateUnitsOfMeasureData) => void;
  onSubmit: () => void;
  unitsOfMeasure: UnitsOfMeasure[];
  selectedUnitId?: string | null;
  loading?: boolean;
}

export const UnitOfMeasureAddEditDialog = ({
  open,
  onOpenChange,
  mode,
  formData,
  onFormDataChange,
  onSubmit,
  unitsOfMeasure,
  selectedUnitId,
  loading = false,
}: UnitOfMeasureAddEditDialogProps) => {
  return (
    <CustomDialog
      open={open}
      onOpenChange={onOpenChange}
      title={mode === "create" ? "Create Unit of Measure" : "Edit Unit of Measure"}
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="unit-name">Unit Name *</Label>
          <Input
            id="unit-name"
            value={formData.unitName}
            onChange={(e) => onFormDataChange({ ...formData, unitName: e.target.value })}
            placeholder="e.g., Kilogram"
            className="bg-[var(--input-background)] border-[var(--glass-border)]"
          />
        </div>
        <div>
          <Label htmlFor="symbol">Symbol *</Label>
          <Input
            id="symbol"
            value={formData.symbol}
            onChange={(e) => onFormDataChange({ ...formData, symbol: e.target.value })}
            placeholder="e.g., kg"
            className="bg-[var(--input-background)] border-[var(--glass-border)]"
          />
        </div>
        <div>
          <Label htmlFor="base-unit">Base Unit</Label>
          <Select
            value={formData.baseUnit || "none"}
            onValueChange={(value) => onFormDataChange({ ...formData, baseUnit: value === "none" ? null : value })}
          >
            <SelectTrigger className="bg-[var(--input-background)] border-[var(--glass-border)]">
              <SelectValue placeholder="Select base unit (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {unitsOfMeasure
                .filter((unit) => unit.id !== selectedUnitId)
                .map((unit) => (
                  <SelectItem key={unit.id} value={unit.id}>
                    {unit.unitName} ({unit.symbol})
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="multiplier">Multiplier</Label>
          <Input
            id="multiplier"
            type="number"
            step="0.0000000001"
            value={formData.multiplier}
            onChange={(e) => onFormDataChange({ ...formData, multiplier: parseFloat(e.target.value) || 1.0 })}
            placeholder="1.0"
            className="bg-[var(--input-background)] border-[var(--glass-border)]"
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="active"
            checked={formData.isActive}
            onChange={(e) => onFormDataChange({ ...formData, isActive: e.target.checked })}
            className="rounded"
          />
          <Label htmlFor="active">Active</Label>
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-[var(--glass-border)]" disabled={loading}>
            Cancel
          </Button>
          <Button variant="accent" onClick={onSubmit} disabled={loading}>
            {loading ? (mode === "create" ? "Creating..." : "Updating...") : (mode === "create" ? "Create" : "Update")}
          </Button>
        </div>
      </div>
    </CustomDialog>
  );
};
