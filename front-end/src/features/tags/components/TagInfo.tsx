import { DateDisplay } from "@/components/common/DateDisplay";
import {
  ListCardDetailDivider,
  ListCardDetailField,
  ListCardDetailGrid,
} from "@/components/common/ListCardLayout";
import { TagInfoProps } from "@/features/tags/types";

export const TagInfo = ({ tag, variant = "grid" }: TagInfoProps) => {
  if (variant === "list") {
    return (
      <>
        <ListCardDetailGrid>
          <ListCardDetailField
            label="Uses"
            value={`${tag.usageCount} ${tag.usageCount === 1 ? "use" : "uses"}`}
          />
          <ListCardDetailField label="Color" value={tag.color} />
        </ListCardDetailGrid>
        <ListCardDetailDivider />
        <ListCardDetailGrid>
          <ListCardDetailField label="Created">
            <DateDisplay date={tag.createdDate} className="text-sm font-medium text-foreground" />
          </ListCardDetailField>
          <ListCardDetailField label="Modified">
            <DateDisplay date={tag.lastModified} className="text-sm font-medium text-foreground" />
          </ListCardDetailField>
          <ListCardDetailField label="Icon" value={tag.icon?.trim() ? tag.icon : "—"} />
        </ListCardDetailGrid>
      </>
    );
  }

  return (
    <>
      <p className="text-sm text-muted-foreground line-clamp-2">{tag.description || 'No description'}</p>
      <span className="text-xs text-muted-foreground">
        Used {tag.usageCount} {tag.usageCount === 1 ? 'time' : 'times'}
      </span>
    </>
  );
};
