import { SystemProductAttribute } from "@/services/systemProductAttributes";
import { UnitsOfMeasure } from "@/services/unitsOfMeasure";

export interface ProductAttributeCardProps {
  attribute: SystemProductAttribute;
  unitsOfMeasure: UnitsOfMeasure[];
  onEdit: (attribute: SystemProductAttribute) => void;
  onDelete: (attribute: SystemProductAttribute) => void;
  viewMode?: "grid" | "list";
}

export interface ProductAttributeViewProps {
  attribute: SystemProductAttribute;
  unitsOfMeasure: UnitsOfMeasure[];
  onEdit: (attribute: SystemProductAttribute) => void;
  onDelete: (attribute: SystemProductAttribute) => void;
}

export interface AttributeIconProps {
  className?: string;
}

export interface AttributeStatusProps {
  isActive: boolean;
  className?: string;
}

export interface AttributeActionsProps {
  attribute: SystemProductAttribute;
  onEdit: (attribute: SystemProductAttribute) => void;
  onDelete: (attribute: SystemProductAttribute) => void;
}

export interface AttributeInfoProps {
  attribute: SystemProductAttribute;
  unit: UnitsOfMeasure | null;
  variant?: "grid" | "list";
}
