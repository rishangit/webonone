import { TagInfoProps } from "../types";

export const TagInfo = ({ tag, variant = "grid" }: TagInfoProps) => {
  if (variant === "list") {
    return (
      <>
        <p className="text-sm text-muted-foreground truncate">{tag.description || 'No description'}</p>
        <span className="text-xs text-muted-foreground">
          {tag.usageCount} {tag.usageCount === 1 ? 'use' : 'uses'}
        </span>
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
