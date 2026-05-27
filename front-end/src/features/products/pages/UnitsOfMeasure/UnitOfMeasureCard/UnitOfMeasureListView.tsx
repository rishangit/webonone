import { Ruler, Hash, ArrowUpDown } from "lucide-react";

import { Card } from "@/components/ui/card";

import { LIST_CARD_LIST_SHELL } from "@/components/common/CardKebabTrigger";

import {

  ListCardColorHero,

  ListCardContent,

  ListCardDetailDivider,

  ListCardDetailField,

  ListCardDetailGrid,

  ListCardDetailsHeader,

  ListCardMediaColumn,

} from "@/components/common/ListCardLayout";

import { UnitOfMeasureViewProps } from "./types";

import { UnitStatus } from "./components/UnitStatus";

import { UnitActions } from "./components/UnitActions";



export const UnitOfMeasureListView = ({

  unit,

  onEdit,

  onDelete,

  getBaseUnitName,

}: UnitOfMeasureViewProps) => {

  return (

    <Card className={LIST_CARD_LIST_SHELL}>

      <ListCardMediaColumn>

        <ListCardColorHero

          style={{

            background:

              "linear-gradient(135deg, color-mix(in oklch, var(--accent-primary) 25%, transparent) 0%, transparent 100%)",

          }}

        >

          <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-[var(--accent-border)] bg-[var(--accent-bg)]/40 backdrop-blur-sm">

            <Ruler className="h-10 w-10 text-[var(--accent-primary)]" />

          </div>

        </ListCardColorHero>

      </ListCardMediaColumn>



      <ListCardContent>

        <ListCardDetailsHeader
          title={unit.unitName}
          status={<UnitStatus isActive={unit.isActive} />}

          actions={<UnitActions unit={unit} onEdit={onEdit} onDelete={onDelete} />}

        />

        <ListCardDetailGrid>

          <ListCardDetailField icon={Hash} label="Symbol" value={unit.symbol} />

          <ListCardDetailField

            label="Base unit"

            value={unit.baseUnit ? getBaseUnitName(unit.baseUnit) : "—"}

          />

          <ListCardDetailField

            icon={ArrowUpDown}

            label="Multiplier"

            value={unit.multiplier !== 1.0 ? String(unit.multiplier) : "1"}

          />

        </ListCardDetailGrid>

        <ListCardDetailDivider />

        <ListCardDetailGrid>
          <ListCardDetailField label="ID" value={unit.id} />
          <ListCardDetailField label="Type" value="Unit of measure" />
        </ListCardDetailGrid>

      </ListCardContent>

    </Card>

  );

};


