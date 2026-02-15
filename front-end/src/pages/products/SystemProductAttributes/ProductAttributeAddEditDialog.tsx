import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { CustomDialog } from "../../../components/ui/custom-dialog";
import { CreateSystemProductAttributeData } from "../../../services/systemProductAttributes";
import { UnitsOfMeasure } from "../../../services/unitsOfMeasure";

interface ProductAttributeAddEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  formData: CreateSystemProductAttributeData;
  onFormDataChange: (data: CreateSystemProductAttributeData) => void;
  onSubmit: () => void;
  unitsOfMeasure: UnitsOfMeasure[];
  loading?: boolean;
}

export const ProductAttributeAddEditDialog = ({
  open,
  onOpenChange,
  mode,
  formData,
  onFormDataChange,
  onSubmit,
  unitsOfMeasure,
  loading = false,
}: ProductAttributeAddEditDialogProps) => {
  return (
    <CustomDialog
      open={open}
      onOpenChange={onOpenChange}
      title={mode === "create" ? "Create Product Attribute" : "Edit Product Attribute"}
    >
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
            placeholder="Attribute name"
            className="bg-[var(--input-background)] border-[var(--glass-border)]"
          />
        </div>
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description || ""}
            onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
            placeholder="Attribute description"
            rows={3}
            className="bg-[var(--input-background)] border-[var(--glass-border)]"
          />
        </div>
        <div>
          <Label htmlFor="value-data-type">Value Data Type</Label>
          <Select
            value={formData.valueDataType}
            onValueChange={(value: any) => onFormDataChange({ ...formData, valueDataType: value })}
          >
            <SelectTrigger className="bg-[var(--input-background)] border-[var(--glass-border)]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="boolean">Boolean</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="unit">Unit of Measure</Label>
          <Select
            value={formData.unitOfMeasure || "none"}
            onValueChange={(value) => onFormDataChange({ ...formData, unitOfMeasure: value === "none" ? null : value })}
          >
            <SelectTrigger className="bg-[var(--input-background)] border-[var(--glass-border)]">
              <SelectValue placeholder="Select unit (optional)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None</SelectItem>
              {unitsOfMeasure.map((unit) => (
                <SelectItem key={unit.id} value={unit.id}>
                  {unit.unitName} ({unit.symbol})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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
