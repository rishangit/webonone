import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { CardGridKebabSlot } from "@/components/common/CardGridKebabSlot";
import { LIST_CARD_GRID_SHELL, LIST_CARD_HERO_HEIGHT_CLASS } from "@/components/common/CardKebabTrigger";
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

export const StaffCardView = ({ member, onView, onDelete }: StaffViewProps) => {
  const navigate = useNavigate();

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[role="menuitem"]') || target.closest('[data-radix-popper-content-wrapper]')) {
      return;
    }
    navigate(`/system/staff/${member.id}`);
  };

  const avatarUrl = formatAvatarUrl(member.avatar, member.firstName, member.lastName);
  const fullName = `${member.firstName || ''} ${member.lastName || ''}`.trim();

  return (
    <Card 
      className={LIST_CARD_GRID_SHELL}
      onClick={handleCardClick}
    >
      {/* Top area: Full image with blurred avatar background */}
      <div className={`relative ${LIST_CARD_HERO_HEIGHT_CLASS} overflow-hidden`}>
        {/* Blurred background image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=random`})`,
            filter: 'blur(20px)',
            transform: 'scale(1.1)',
          }}
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/40" />
        
        {/* Avatar in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <Avatar className={CARD_LIST_AVATAR_CLASS}>
            <AvatarImage 
              src={avatarUrl} 
              alt={fullName}
            />
            <AvatarFallback
              className={`bg-[var(--accent-bg)] text-[var(--accent-text)] ${CARD_LIST_AVATAR_FALLBACK_CLASS}`}
            >
              {(member.firstName?.[0] || '')}{(member.lastName?.[0] || '')}
            </AvatarFallback>
          </Avatar>
        </div>
        
        {/* Status badge top left */}
        <div className="absolute top-3 left-3">
          <StaffStatus status={member.status} />
        </div>
        
        {/* Actions menu top right */}
        <CardGridKebabSlot>
          <StaffActions member={member} onView={onView} onDelete={onDelete} />
        </CardGridKebabSlot>
      </div>
      
      {/* Bottom area: Staff details */}
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-foreground mb-1">{fullName}</h3>
            <p className="text-[var(--accent-text)] text-sm">{member.role || 'Staff Member'}</p>
          </div>
        </div>

        <StaffInfo member={member} variant="grid" />
      </div>
    </Card>
  );
};
