import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Checkbox } from "../../../components/ui/checkbox";
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
      description={mode === "create" ? "Add a new unit of measure to the system" : "Update unit of measure information"}
      maxWidth="max-w-2xl"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            size="default"
            className="h-10 px-4 border-[var(--glass-border)] text-foreground hover:bg-accent"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            variant="accent"
            onClick={onSubmit}
            size="default"
            disabled={loading}
          >
            {loading ? (mode === "create" ? "Creating..." : "Updating...") : (mode === "create" ? "Create Unit" : "Update Unit")}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="unit-name" className="text-foreground">Unit Name *</Label>
          <Input
            id="unit-name"
            value={formData.unitName}
            onChange={(e) => onFormDataChange({ ...formData, unitName: e.target.value })}
            placeholder="e.g., Kilogram"
            className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="symbol" className="text-foreground">Symbol *</Label>
          <Input
            id="symbol"
            value={formData.symbol}
            onChange={(e) => onFormDataChange({ ...formData, symbol: e.target.value })}
            placeholder="e.g., kg"
            className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="base-unit" className="text-foreground">Base Unit</Label>
          <Select
            value={formData.baseUnit || "none"}
            onValueChange={(value) => onFormDataChange({ ...formData, baseUnit: value === "none" ? null : value })}
          >
            <SelectTrigger className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground">
              <SelectValue placeholder="Select base unit (optional)" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
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
        <div className="space-y-2">
          <Label htmlFor="multiplier" className="text-foreground">Multiplier</Label>
          <Input
            id="multiplier"
            type="number"
            step="0.0000000001"
            value={formData.multiplier}
            onChange={(e) => onFormDataChange({ ...formData, multiplier: parseFloat(e.target.value) || 1.0 })}
            placeholder="1.0"
            className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
          />
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            id="active"
            checked={formData.isActive}
            onCheckedChange={(checked) => onFormDataChange({ ...formData, isActive: checked as boolean })}
          />
          <Label htmlFor="active" className="text-foreground cursor-pointer">
            Active
          </Label>
        </div>
      </div>
    </CustomDialog>
  );
};
