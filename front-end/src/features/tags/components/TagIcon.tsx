import { CARD_LIST_AVATAR_CLASS } from "@/components/ui/avatar";
import { Tag as TagIcon } from "lucide-react";
import { TagIconProps } from "@/features/tags/types";

export const TagIconComponent = ({ tag, variant = "grid" }: TagIconProps) => {
  const size = CARD_LIST_AVATAR_CLASS;
  const iconSize = "w-10 h-10";

  return (
    <div
      className={`${size} rounded-lg flex items-center justify-center`}
      style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
    >
      {tag.icon ? (
        <span className="text-2xl">{tag.icon}</span>
      ) : (
        <TagIcon className={iconSize} />
      )}
    </div>
  );
};
