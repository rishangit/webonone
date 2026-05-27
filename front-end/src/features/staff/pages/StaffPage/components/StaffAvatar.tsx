import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  CARD_LIST_AVATAR_CLASS,
  CARD_LIST_AVATAR_FALLBACK_CLASS,
} from "@/components/ui/avatar";
import { formatAvatarUrl } from "../../../../utils";
import { StaffAvatarProps } from "../types";

export const StaffAvatar = ({ member }: StaffAvatarProps) => {
  return (
    <Avatar className={CARD_LIST_AVATAR_CLASS}>
      <AvatarImage 
        src={formatAvatarUrl(member.avatar, member.firstName, member.lastName)} 
        alt={`${member.firstName || ''} ${member.lastName || ''}`}
      />
      <AvatarFallback
        className={`bg-[var(--accent-bg)] text-[var(--accent-text)] ${CARD_LIST_AVATAR_FALLBACK_CLASS}`}
      >
        {(member.firstName?.[0] || '')}{(member.lastName?.[0] || '')}
      </AvatarFallback>
    </Avatar>
  );
};
