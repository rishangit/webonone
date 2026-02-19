import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { Textarea } from "../../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../../components/ui/select";
import { Checkbox } from "../../../components/ui/checkbox";
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
      description={mode === "create" ? "Add a new product attribute to the system" : "Update product attribute information"}
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
            {loading ? (mode === "create" ? "Creating..." : "Updating...") : (mode === "create" ? "Create Attribute" : "Update Attribute")}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-foreground">Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
            placeholder="Attribute name"
            className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="description" className="text-foreground">Description</Label>
          <Textarea
            id="description"
            value={formData.description || ""}
            onChange={(e) => onFormDataChange({ ...formData, description: e.target.value })}
            placeholder="Attribute description"
            rows={3}
            className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground min-h-[80px]"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="value-data-type" className="text-foreground">Value Data Type</Label>
          <Select
            value={formData.valueDataType}
            onValueChange={(value: any) => onFormDataChange({ ...formData, valueDataType: value })}
          >
            <SelectTrigger className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
              <SelectItem value="text">Text</SelectItem>
              <SelectItem value="number">Number</SelectItem>
              <SelectItem value="boolean">Boolean</SelectItem>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="json">JSON</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="unit" className="text-foreground">Unit of Measure</Label>
          <Select
            value={formData.unitOfMeasure || "none"}
            onValueChange={(value) => onFormDataChange({ ...formData, unitOfMeasure: value === "none" ? null : value })}
          >
            <SelectTrigger className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground">
              <SelectValue placeholder="Select unit (optional)" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border">
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
