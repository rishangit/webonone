import { Globe, Calendar } from "lucide-react";

import { Card } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

import { LIST_CARD_LIST_SHELL } from "@/components/common/CardKebabTrigger";

import {

  ListCardColorHero,

  ListCardContent,

  ListCardDetailField,

  ListCardDetailGrid,

  ListCardDetailsHeader,

  ListCardMediaColumn,

} from "@/components/common/ListCardLayout";

import { WebpageViewProps } from "../types";

import { WebpageActions } from "./WebpageActions";



export const WebpageListView = ({

  webPage,

  onEdit,

  onBrowse,

  onDelete,

}: WebpageViewProps) => {

  const handleRowClick = (e: React.MouseEvent) => {

    const target = e.target as HTMLElement;

    if (

      target.closest("button") ||

      target.closest('[role="menuitem"]') ||

      target.closest("[data-radix-popper-content-wrapper]")

    ) {

      return;

    }

    onBrowse(webPage);

  };



  const statusBadge = webPage.isActive ? (

    <Badge className="border border-[var(--accent-border)] bg-[var(--accent-bg)] px-2 py-0.5 text-xs font-semibold text-[var(--accent-text)]">

      Active

    </Badge>

  ) : (

    <Badge variant="outline" className="border-[var(--glass-border)] px-2 py-0.5 text-xs text-muted-foreground">

      Inactive

    </Badge>

  );



  return (

    <Card className={LIST_CARD_LIST_SHELL} onClick={handleRowClick}>

      <ListCardMediaColumn>

        <ListCardColorHero

          style={{

            background:

              "linear-gradient(135deg, color-mix(in oklch, var(--accent-primary) 25%, transparent) 0%, transparent 100%)",

          }}

        >

          <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-[var(--accent-border)] bg-[var(--accent-bg)]/40 backdrop-blur-sm">

            <Globe className="h-10 w-10 text-[var(--accent-primary)]" />

          </div>

        </ListCardColorHero>

      </ListCardMediaColumn>



      <ListCardContent>

        <ListCardDetailsHeader

          title={webPage.name}

          description={webPage.url}

          status={statusBadge}

          actions={

            <WebpageActions

              webPage={webPage}

              onEdit={onEdit}

              onBrowse={onBrowse}

              onDelete={onDelete}

            />

          }

        />

        <ListCardDetailGrid>
          <ListCardDetailField
            label="Blocks"
            value={webPage.content?.blocks?.length ? String(webPage.content.blocks.length) : "0"}
          />
          <ListCardDetailField label="Type" value="Web page" />
          <ListCardDetailField icon={Calendar} label="Updated" value={webPage.updatedAt ?? "—"} />
          <ListCardDetailField label="ID" value={webPage.id} />
        </ListCardDetailGrid>

      </ListCardContent>

    </Card>

  );

};


