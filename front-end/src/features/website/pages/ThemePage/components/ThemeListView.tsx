import { Palette, Type, Paintbrush } from "lucide-react";

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

import type { CompanyWebTheme } from "@/features/website/services/companyWebThemes";

import { ThemeActions } from "./ThemeActions";



export interface ThemeListViewProps {

  theme: CompanyWebTheme;

  onEdit: (theme: CompanyWebTheme) => void;

  onSetDefault: (theme: CompanyWebTheme) => void;

  onDelete: (theme: CompanyWebTheme) => void;

}



export const ThemeListView = ({

  theme,

  onEdit,

  onSetDefault,

  onDelete,

}: ThemeListViewProps) => {

  const handleRowClick = (e: React.MouseEvent) => {

    const target = e.target as HTMLElement;

    if (

      target.closest("button") ||

      target.closest('[role="menuitem"]') ||

      target.closest("[data-radix-popper-content-wrapper]")

    ) {

      return;

    }

    onEdit(theme);

  };



  const textStylesCount = theme.themeData?.textSettings?.length ?? 0;

  const buttonStylesCount = theme.themeData?.buttons?.length ?? 0;

  const subtitle = textStylesCount > 0

    ? `${textStylesCount} text style${textStylesCount !== 1 ? "s" : ""}`

    : "No text styles";



  const accentColor = theme.backgroundColor ?? theme.themeData?.colors?.[0]?.color ?? "var(--accent-primary)";



  const themeStatus = (

    <>

      {theme.isDefault ? (

        <Badge className="border border-[var(--accent-border)] bg-[var(--accent-bg)] px-2 py-0.5 text-xs font-semibold text-[var(--accent-text)]">

          Default

        </Badge>

      ) : null}

      {theme.isActive ? (

        <Badge className="border border-[var(--accent-border)] bg-[var(--accent-bg)] px-2 py-0.5 text-xs font-semibold text-[var(--accent-text)]">

          Active

        </Badge>

      ) : (

        <Badge variant="outline" className="border-[var(--glass-border)] px-2 py-0.5 text-xs text-muted-foreground">

          Inactive

        </Badge>

      )}

    </>

  );



  return (

    <Card className={LIST_CARD_LIST_SHELL} onClick={handleRowClick}>

      <ListCardMediaColumn>

        <ListCardColorHero

          style={{

            background: `linear-gradient(135deg, ${accentColor}40 0%, transparent 100%)`,

          }}

        >

          <div

            className="flex h-24 w-24 items-center justify-center rounded-2xl border border-[var(--accent-border)] backdrop-blur-sm"

            style={{ backgroundColor: `${accentColor}30` }}

          >

            <Palette className="h-10 w-10" style={{ color: accentColor }} />

          </div>

        </ListCardColorHero>

      </ListCardMediaColumn>



      <ListCardContent>

        <ListCardDetailsHeader

          title={theme.name}

          description={subtitle}

          status={themeStatus}

          actions={

            <ThemeActions

              theme={theme}

              onEdit={onEdit}

              onSetDefault={onSetDefault}

              onDelete={onDelete}

            />

          }

        />

        <ListCardDetailGrid>
          <ListCardDetailField icon={Type} label="Text styles" value={String(textStylesCount)} />
          <ListCardDetailField icon={Paintbrush} label="Button styles" value={String(buttonStylesCount)} />
          <ListCardDetailField label="ID" value={theme.id} />
          <ListCardDetailField label="Company" value={theme.companyId} />
        </ListCardDetailGrid>

      </ListCardContent>

    </Card>

  );

};


