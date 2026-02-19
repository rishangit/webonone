import { Button } from "../../../../components/ui/button";
import { Label } from "../../../../components/ui/label";
import { VariantFormData } from "../../../../schemas/variantValidation";

interface ProductVariantAddFormProps {
  formData: VariantFormData;
  onFormDataChange: (data: VariantFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

export const ProductVariantAddForm = ({
  formData,
  onFormDataChange,
  onSubmit,
  onCancel,
}: ProductVariantAddFormProps) => {
  return (
    <div className="mt-6 p-4 border border-[var(--glass-border)] rounded-lg bg-[var(--glass-bg)]">
      <h4 className="font-medium text-foreground mb-4">Add New Variant</h4>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label className="text-muted-foreground">Variant Name *</Label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => onFormDataChange({ ...formData, name: e.target.value })}
              className="w-full mt-1 px-3 py-2 bg-[var(--input-background)] border border-[var(--glass-border)] rounded-md text-foreground placeholder:text-muted-foreground"
              placeholder="e.g., Premium Hair Shampoo - Dry Hair"
            />
          </div>
          <div>
            <Label className="text-muted-foreground">SKU *</Label>
            <input
              type="text"
              value={formData.sku}
              onChange={(e) => onFormDataChange({ ...formData, sku: e.target.value })}
              className="w-full mt-1 px-3 py-2 bg-[var(--input-background)] border border-[var(--glass-border)] rounded-md text-foreground placeholder:text-muted-foreground"
              placeholder="e.g., BEA-SHP001-DRY"
            />
          </div>
        </div>
        
        <div>
          <Label className="text-muted-foreground">Description</Label>
          <textarea
            value={(formData as any).description || ''}
            onChange={(e) => onFormDataChange({ ...formData, description: e.target.value } as VariantFormData)}
            className="w-full mt-1 px-3 py-2 bg-[var(--input-background)] border border-[var(--glass-border)] rounded-md text-foreground placeholder:text-muted-foreground"
            rows={3}
            placeholder="Describe this variant..."
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <Label className="text-muted-foreground">Color</Label>
            <input
              type="text"
              value={formData.color}
              onChange={(e) => onFormDataChange({ ...formData, color: e.target.value })}
              className="w-full mt-1 px-3 py-2 bg-[var(--input-background)] border border-[var(--glass-border)] rounded-md text-foreground placeholder:text-muted-foreground"
              placeholder="e.g., Golden"
            />
          </div>
          <div>
            <Label className="text-muted-foreground">Size</Label>
            <input
              type="text"
              value={formData.size}
              onChange={(e) => onFormDataChange({ ...formData, size: e.target.value })}
              className="w-full mt-1 px-3 py-2 bg-[var(--input-background)] border border-[var(--glass-border)] rounded-md text-foreground placeholder:text-muted-foreground"
              placeholder="e.g., 500ml"
            />
          </div>
          <div>
            <Label className="text-muted-foreground">Weight</Label>
            <input
              type="text"
              value={formData.weight}
              onChange={(e) => onFormDataChange({ ...formData, weight: e.target.value })}
              className="w-full mt-1 px-3 py-2 bg-[var(--input-background)] border border-[var(--glass-border)] rounded-md text-foreground placeholder:text-muted-foreground"
              placeholder="e.g., 520g"
            />
          </div>
          <div>
            <Label className="text-muted-foreground">Material</Label>
            <input
              type="text"
              value={formData.material}
              onChange={(e) => onFormDataChange({ ...formData, material: e.target.value })}
              className="w-full mt-1 px-3 py-2 bg-[var(--input-background)] border border-[var(--glass-border)] rounded-md text-foreground placeholder:text-muted-foreground"
              placeholder="e.g., Argan oil enriched"
            />
          </div>
        </div>
        
        <div>
          <Label className="text-muted-foreground">Notes</Label>
          <textarea
            value={(formData as any).notes || ''}
            onChange={(e) => onFormDataChange({ ...formData, notes: e.target.value } as VariantFormData)}
            className="w-full mt-1 px-3 py-2 bg-[var(--input-background)] border border-[var(--glass-border)] rounded-md text-foreground placeholder:text-muted-foreground"
            rows={2}
            placeholder="Additional notes about this variant..."
          />
        </div>
        
        <div className="flex items-center gap-2 pt-2">
          <Button
            onClick={onSubmit}
            disabled={!formData.name || !formData.sku}
            className="bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-[var(--accent-button-text)]"
          >
            Add Variant
          </Button>
          <Button
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );
};
