import { Package, Save } from "lucide-react";
import { CustomDialog } from "@/components/ui/custom-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/common/SearchInput";
import { SystemProductAttribute } from "@/features/products/services/systemProductAttributes";
import { UnitsOfMeasure } from "@/features/products/services/unitsOfMeasure";

export interface AddProductAttributeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  attributes: SystemProductAttribute[];
  unitsOfMeasure: UnitsOfMeasure[];
  pickerSearchTerm: string;
  onPickerSearchTermChange: (value: string) => void;
  selectedAttributeId: string | null;
  onSelectAttributeId: (id: string) => void;
  onConfirmAdd: () => void;
}

export const AddProductAttributeDialog = ({
  open,
  onOpenChange,
  attributes,
  unitsOfMeasure,
  pickerSearchTerm,
  onPickerSearchTermChange,
  selectedAttributeId,
  onSelectAttributeId,
  onConfirmAdd,
}: AddProductAttributeDialogProps) => {
  const footer = (
    <>
      <Button
        type="button"
        variant="outline"
        size="default"
        className="h-10 px-4 border-[var(--glass-border)] text-foreground hover:bg-accent"
        onClick={() => onOpenChange(false)}
      >
        Cancel
      </Button>
      <Button
        type="button"
        variant="accent"
        size="default"
        className="h-10"
        disabled={!selectedAttributeId}
        onClick={onConfirmAdd}
      >
        <Save className="w-4 h-4 mr-2" />
        Add
      </Button>
    </>
  );

  return (
    <CustomDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add Product Attribute"
      description="Select an attribute from the global system attributes to add to this product."
      icon={<Package className="w-5 h-5" />}
      sizeWidth="small"
      sizeHeight="medium"
      footer={footer}
    >
      <div className="space-y-3">
        <div>
          <Label className="text-foreground mb-1.5 text-sm">Select attribute</Label>
          <div className="mb-2 mt-2">
            <SearchInput
              placeholder="Search attributes..."
              value={pickerSearchTerm}
              onChange={onPickerSearchTermChange}
            />
          </div>
          <div className="max-h-48 overflow-y-auto custom-scrollbar border border-[var(--glass-border)] rounded-md bg-[var(--glass-bg)]">
            {attributes.length > 0 ? (
              <div className="p-2 space-y-1">
                {attributes.map((attr) => {
                  const unit = attr.unitOfMeasure
                    ? unitsOfMeasure.find((u) => u.id === attr.unitOfMeasure)
                    : null;

                  return (
                    <div
                      key={attr.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => onSelectAttributeId(attr.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          onSelectAttributeId(attr.id);
                        }
                      }}
                      className={`p-2.5 rounded-md cursor-pointer transition-colors ${
                        selectedAttributeId === attr.id
                          ? "bg-[var(--accent-primary)]/20 border border-[var(--accent-primary)]"
                          : "hover:bg-accent border border-transparent"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm">{attr.name}</p>
                          {attr.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{attr.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-1.5">
                            <Badge variant="outline" className="text-xs">
                              {attr.valueDataType}
                            </Badge>
                            {unit && (
                              <Badge variant="outline" className="text-xs">
                                {unit.symbol}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-center text-muted-foreground text-sm">
                {pickerSearchTerm ? "No attributes found" : "All available attributes have been added"}
              </div>
            )}
          </div>
        </div>
      </div>
    </CustomDialog>
  );
};
