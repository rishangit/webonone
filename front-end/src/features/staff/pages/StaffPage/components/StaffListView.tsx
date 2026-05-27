import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { LIST_CARD_LIST_SHELL } from "@/components/common/CardKebabTrigger";
import {
  ListCardBlurredMedia,
  ListCardContent,
  ListCardDetailsHeader,
  ListCardMediaColumn,
} from "@/components/common/ListCardLayout";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  CARD_LIST_AVATAR_CLASS,
  CARD_LIST_AVATAR_FALLBACK_CLASS,
} from "@/components/ui/avatar";
import { formatAvatarUrl } from "../../../../utils";
import { StaffViewProps } from "../types";
import { StaffStatus } from "./StaffStatus";
import { StaffActions } from "./StaffActions";
import { StaffInfo } from "./StaffInfo";

export const StaffListView = ({ member, onView, onDelete }: StaffViewProps) => {
  const navigate = useNavigate();

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest('[role="menuitem"]') || target.closest("[data-radix-popper-content-wrapper]")) {
      return;
    }
    navigate(`/system/staff/${member.id}`);
  };

  const avatarUrl = formatAvatarUrl(member.avatar, member.firstName, member.lastName);
  const fullName = `${member.firstName || ""} ${member.lastName || ""}`.trim();
  const backgroundUrl =
    avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`;

  return (
    <Card className={LIST_CARD_LIST_SHELL} onClick={handleCardClick}>
      <ListCardMediaColumn>
        <ListCardBlurredMedia backgroundImageUrl={backgroundUrl}>
          <Avatar className={CARD_LIST_AVATAR_CLASS}>
            <AvatarImage src={avatarUrl} alt={fullName} />
            <AvatarFallback
              className={`bg-[var(--accent-bg)] text-[var(--accent-text)] ${CARD_LIST_AVATAR_FALLBACK_CLASS}`}
            >
              {member.firstName?.[0] || ""}
              {member.lastName?.[0] || ""}
            </AvatarFallback>
          </Avatar>
        </ListCardBlurredMedia>
      </ListCardMediaColumn>

      <ListCardContent>
        <ListCardDetailsHeader
          title={fullName}
          description={member.role || "Staff Member"}
          status={<StaffStatus status={member.status} />}
          actions={
            <StaffActions member={member} onView={onView} onDelete={onDelete} triggerVariant="default" />
          }
        />
        <StaffInfo member={member} variant="list" />
      </ListCardContent>
    </Card>
  );
};
