import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  CARD_LIST_AVATAR_CLASS,
  CARD_LIST_AVATAR_FALLBACK_CLASS,
} from "@/components/ui/avatar";
import { DateDisplay } from "@/components/common/DateDisplay";
import { CardGridKebabSlot } from "@/components/common/CardGridKebabSlot";
import { LIST_CARD_GRID_SHELL, LIST_CARD_HERO_HEIGHT_CLASS } from "@/components/common/CardKebabTrigger";
import { formatAvatarUrl } from "@/shared/utils";
import { CompanyViewProps } from "./types";
import { CompanyDetails } from "./components/CompanyDetails";
import { CompanyActions } from "./components/CompanyActions";
import { CompanyOwnerInfo } from "./components/CompanyOwnerInfo";
import { useAppSelector } from "@/store/hooks";
import { isRole, UserRole } from "@/shared/types/user";

export const CompanyCardView = ({ company, onViewCompany }: CompanyViewProps) => {
  const { user } = useAppSelector((state) => state.auth);
  const isSuperAdmin = isRole(user?.role, UserRole.SYSTEM_ADMIN);

  const getActualStatus = (): "pending" | "approved" | "rejected" => {
    if (company.status && ["pending", "approved", "rejected"].includes(company.status)) {
      const isActiveValue = company.isActive;

      if ((isActiveValue === true || isActiveValue === 1) && company.status !== "approved") {
        return "approved";
      }

      if (
        (isActiveValue === false || isActiveValue === 0 || isActiveValue === null || isActiveValue === undefined) &&
        company.status === "approved"
      ) {
        return "pending";
      }

      return company.status;
    }

    const isActiveValue = company.isActive;
    if (isActiveValue === true || isActiveValue === 1) {
      return "approved";
    }
    if (isActiveValue === false || isActiveValue === 0) {
      return "pending";
    }
    return "pending";
  };

  const actualStatus = getActualStatus();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30";
      case "pending":
        return "bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30";
      case "rejected":
        return "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30";
    }
  };

  const logoUrl = company.logo ? formatAvatarUrl(company.logo) : undefined;
  const initials = company.name.substring(0, 2).toUpperCase();

  return (
    <Card
      className={LIST_CARD_GRID_SHELL}
      onClick={() => onViewCompany(company.id)}
    >
      <div className={`relative ${LIST_CARD_HERO_HEIGHT_CLASS} overflow-hidden`}>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=random`})`,
            filter: "blur(20px)",
            transform: "scale(1.1)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/10 to-black/40" />

        <div className="absolute inset-0 flex items-center justify-center">
          <Avatar className={CARD_LIST_AVATAR_CLASS}>
            <AvatarImage src={logoUrl} alt={company.name} />
            <AvatarFallback
              className={`bg-[var(--accent-bg)] text-[var(--accent-text)] ${CARD_LIST_AVATAR_FALLBACK_CLASS}`}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="absolute top-3 left-3">
          <Badge className={`${getStatusColor(actualStatus)} border text-xs px-2 py-1 backdrop-blur-sm`}>
            {actualStatus.charAt(0).toUpperCase() + actualStatus.slice(1)}
          </Badge>
        </div>

        <CardGridKebabSlot>
          <CompanyActions
            company={company}
            onViewCompany={onViewCompany}
            actualStatus={actualStatus}
            triggerVariant="overlay"
            showViewButton={false}
          />
        </CardGridKebabSlot>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground mb-1 truncate">{company.name}</h3>
          {company.description ? (
            <p className="text-sm text-muted-foreground line-clamp-2">{company.description}</p>
          ) : null}
        </div>

        <CompanyDetails company={company} />

        {isSuperAdmin && <CompanyOwnerInfo company={company} />}

        <span className="text-xs text-muted-foreground block pt-1">
          <DateDisplay date={company.submittedDate} />
        </span>
      </div>
    </Card>
  );
};
