import { UnitInfoProps } from "../types";

export const UnitInfo = ({ unit, getBaseUnitName, variant = "grid" }: UnitInfoProps) => {
  if (variant === "list") {
    return (
      <>
        <p className="text-sm text-muted-foreground">
          Symbol: <span className="font-mono font-semibold">{unit.symbol}</span>
        </p>
        {unit.baseUnit && (
          <p className="text-sm text-muted-foreground mb-1">
            <span className="font-medium">Base Unit:</span> {getBaseUnitName(unit.baseUnit)}
          </p>
        )}
        {unit.multiplier !== 1.0 && (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium">Multiplier:</span> {unit.multiplier}
          </p>
        )}
      </>
    );
  }

  return (
    <>
      <p className="text-sm text-muted-foreground mb-2">
        Symbol: <span className="font-mono font-semibold text-foreground">{unit.symbol}</span>
      </p>
      {(unit.baseUnit || unit.multiplier !== 1.0) && (
        <div className="space-y-1 mt-2">
          {unit.baseUnit && (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Base Unit:</span> <span className="text-foreground">{getBaseUnitName(unit.baseUnit)}</span>
            </p>
          )}
          {unit.multiplier !== 1.0 && (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Multiplier:</span> <span className="text-foreground">{unit.multiplier}</span>
            </p>
          )}
        </div>
      )}
    </>
  );
};
