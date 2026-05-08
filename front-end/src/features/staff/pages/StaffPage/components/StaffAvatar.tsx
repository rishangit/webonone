import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatAvatarUrl } from "../../../../utils";
import { StaffAvatarProps } from "../types";

export const StaffAvatar = ({ member, variant = "grid" }: StaffAvatarProps) => {
  const size = variant === "list" ? "w-20 h-20" : "w-20 h-20";
  
  return (
    <Avatar className={size}>
      <AvatarImage 
        src={formatAvatarUrl(member.avatar, member.firstName, member.lastName)} 
        alt={`${member.firstName || ''} ${member.lastName || ''}`}
      />
      <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)]">
        {(member.firstName?.[0] || '')}{(member.lastName?.[0] || '')}
      </AvatarFallback>
    </Avatar>
  );
};
