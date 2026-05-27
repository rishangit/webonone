import { ListChecks } from "lucide-react";

import { Card } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

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

import { ProductAttributeViewProps } from "./types";

import { AttributeStatus } from "./components/AttributeStatus";

import { AttributeActions } from "./components/AttributeActions";



export const ProductAttributeListView = ({

  attribute,

  unitsOfMeasure,

  onEdit,

  onDelete,

}: ProductAttributeViewProps) => {

  const unit = attribute.unitOfMeasure

    ? unitsOfMeasure.find((u) => u.id === attribute.unitOfMeasure)

    : null;



  const attributeTags = (

    <>

      <Badge variant="outline" className="border-[var(--glass-border)] text-xs">

        {attribute.valueDataType}

      </Badge>

      {unit ? (

        <Badge variant="outline" className="border-[var(--glass-border)] text-xs">

          {unit.symbol}

        </Badge>

      ) : null}

    </>

  );



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

            <ListChecks className="h-10 w-10 text-[var(--accent-primary)]" />

          </div>

        </ListCardColorHero>

      </ListCardMediaColumn>



      <ListCardContent>

        <ListCardDetailsHeader

          title={attribute.name}

          description={attribute.description}

          status={<AttributeStatus isActive={attribute.isActive} />}

          actions={<AttributeActions attribute={attribute} onEdit={onEdit} onDelete={onDelete} />}

          tags={attributeTags}

        />

        <ListCardDetailGrid>

          <ListCardDetailField label="Created" value={new Date(attribute.createdAt).toLocaleDateString()} />

          <ListCardDetailField label="Updated" value={new Date(attribute.updatedAt).toLocaleDateString()} />

          <ListCardDetailField label="ID" value={attribute.id} />

        </ListCardDetailGrid>

      </ListCardContent>

    </Card>

  );

};


