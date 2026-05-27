import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LIST_CARD_LIST_SHELL } from "@/components/common/CardKebabTrigger";
import {
  ListCardContent,
  ListCardDetailsHeader,
  ListCardMediaColumn,
} from "@/components/common/ListCardLayout";
import { SpaceViewProps } from "../types";
import { SpaceImage } from "./SpaceImage";
import { SpaceStatus } from "./SpaceStatus";
import { SpaceActions } from "./SpaceActions";
import { SpaceInfo } from "./SpaceInfo";

export const SpaceListView = ({ space, onView, onEdit, onDelete }: SpaceViewProps) => {
  const tagChips =
    space.tags && space.tags.length > 0 ? (
      <>
        {space.tags.slice(0, 3).map((tag) => (
          <Badge
            key={tag.id}
            variant="secondary"
            className="text-xs"
            style={{
              backgroundColor: `${tag.color}20`,
              color: tag.color,
              borderColor: `${tag.color}40`,
            }}
          >
            {tag.icon && <span className="mr-1">{tag.icon}</span>}
            {tag.name}
          </Badge>
        ))}
        {space.tags.length > 3 ? (
          <span className="text-xs text-muted-foreground">+{space.tags.length - 3}</span>
        ) : null}
      </>
    ) : undefined;

  return (
    <Card
      className={LIST_CARD_LIST_SHELL}
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('button, [role="menuitem"]')) {
          return;
        }
        onView(space);
      }}
    >
      <ListCardMediaColumn>
        <SpaceImage imageUrl={space.imageUrl} spaceName={space.name} variant="list" />
      </ListCardMediaColumn>

      <ListCardContent>
        <ListCardDetailsHeader
          title={space.name}
          description={space.description}
          status={<SpaceStatus status={space.status} variant="list" />}
          actions={
            <SpaceActions
              space={space}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              triggerVariant="default"
            />
          }
          tags={tagChips}
        />
        <SpaceInfo space={space} variant="list" />
      </ListCardContent>
    </Card>
  );
};
