import { Tag as TagIcon } from "lucide-react";
import { TagIconProps } from "../types";

export const TagIconComponent = ({ tag, variant = "grid" }: TagIconProps) => {
  const size = variant === "list" ? "w-10 h-10" : "w-12 h-12";
  const iconSize = variant === "list" ? "w-5 h-5" : "w-6 h-6";
  
  return (
    <div 
      className={`${size} rounded-lg flex items-center justify-center ${variant === "grid" ? "text-2xl" : ""}`}
      style={{ backgroundColor: `${tag.color}20`, color: tag.color }}
    >
      {tag.icon ? (
        <span className={variant === "grid" ? "text-2xl" : "text-lg"}>{tag.icon}</span>
      ) : (
        <TagIcon className={iconSize} />
      )}
    </div>
  );
};
