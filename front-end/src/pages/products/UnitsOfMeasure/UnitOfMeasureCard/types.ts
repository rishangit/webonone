import { UnitsOfMeasure } from "../../../../services/unitsOfMeasure";

export interface UnitOfMeasureCardProps {
  unit: UnitsOfMeasure;
  onEdit: (unit: UnitsOfMeasure) => void;
  onDelete: (unit: UnitsOfMeasure) => void;
  getBaseUnitName: (baseUnitId: string | null | undefined) => string;
  viewMode?: "grid" | "list";
}

export interface UnitOfMeasureViewProps {
  unit: UnitsOfMeasure;
  onEdit: (unit: UnitsOfMeasure) => void;
  onDelete: (unit: UnitsOfMeasure) => void;
  getBaseUnitName: (baseUnitId: string | null | undefined) => string;
  unitsOfMeasure?: UnitsOfMeasure[];
}

export interface UnitIconProps {
  className?: string;
}

export interface UnitStatusProps {
  isActive: boolean;
  className?: string;
}

export interface UnitActionsProps {
  unit: UnitsOfMeasure;
  onEdit: (unit: UnitsOfMeasure) => void;
  onDelete: (unit: UnitsOfMeasure) => void;
}

export interface UnitInfoProps {
  unit: UnitsOfMeasure;
  getBaseUnitName: (baseUnitId: string | null | undefined) => string;
  variant?: "grid" | "list";
}
