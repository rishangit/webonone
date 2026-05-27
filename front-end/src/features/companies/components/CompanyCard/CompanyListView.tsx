import { MapPin, Users, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LIST_CARD_LIST_SHELL } from "@/components/common/CardKebabTrigger";
import {
  ListCardBlurredMedia,
  ListCardContactEmail,
  ListCardContactGrid,
  ListCardContactPhone,
  ListCardContent,
  ListCardDetailDivider,
  ListCardDetailField,
  ListCardDetailGrid,
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
import { formatAvatarUrl } from "../../../utils";
import { DateDisplay } from "@/components/common/DateDisplay";
import { useAppSelector } from "@/store/hooks";
import { isRole, UserRole } from "@/shared/types/user";
import { CompanyViewProps } from "./types";
import { CompanyActions } from "./components/CompanyActions";

export const CompanyListView = ({
  company,
  onViewCompany
}: CompanyViewProps) => {
  const { user } = useAppSelector((state) => state.auth);
  const isSuperAdmin = isRole(user?.role, UserRole.SYSTEM_ADMIN);

  const getActualStatus = (): "pending" | "approved" | "rejected" => {
    if (company.status && ['pending', 'approved', 'rejected'].includes(company.status)) {
      const isActiveValue = company.isActive;

      if ((isActiveValue === true || isActiveValue === 1) && company.status !== 'approved') {
        return 'approved';
      }

      if ((isActiveValue === false || isActiveValue === 0 || isActiveValue === null || isActiveValue === undefined)
          && company.status === 'approved') {
        return 'pending';
      }

      return company.status;
    }

    const isActiveValue = company.isActive;
    if (isActiveValue === true || isActiveValue === 1) {
      return 'approved';
    } else if (isActiveValue === false || isActiveValue === 0) {
      return 'pending';
    } else {
      return 'pending';
    }
  };

  const actualStatus = getActualStatus();
  const logoUrl = company.logo ? formatAvatarUrl(company.logo) : undefined;
  const initials = company.name.substring(0, 2).toUpperCase();
  const backgroundUrl =
    logoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(company.name)}&background=random`;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30';
      case 'pending': return 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30';
    }
  };

  const bottomThirdCell =
    isSuperAdmin && company.owner ? (
      <ListCardDetailField icon={User} label="Owner" value={company.owner.name} />
    ) : (
      <ListCardDetailField label="Submitted">
        <DateDisplay date={company.submittedDate} className="text-sm font-medium text-foreground" />
      </ListCardDetailField>
    );

  const statusBadge = (
    <Badge className={`${getStatusColor(actualStatus)} border text-xs px-2 py-1`}>
      {actualStatus.charAt(0).toUpperCase() + actualStatus.slice(1)}
    </Badge>
  );

  const tagChips =
    company.tags && company.tags.length > 0 ? (
      <>
        {company.tags.slice(0, 3).map((tag) => (
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
        {company.tags.length > 3 ? (
          <span className="text-xs text-muted-foreground">+{company.tags.length - 3}</span>
        ) : null}
      </>
    ) : undefined;

  return (
    <Card className={LIST_CARD_LIST_SHELL}>
      <ListCardMediaColumn>
        <ListCardBlurredMedia backgroundImageUrl={backgroundUrl}>
          <Avatar className={CARD_LIST_AVATAR_CLASS}>
            <AvatarImage src={logoUrl} alt={company.name} />
            <AvatarFallback
              className={`bg-[var(--accent-bg)] text-[var(--accent-text)] ${CARD_LIST_AVATAR_FALLBACK_CLASS}`}
            >
              {initials}
            </AvatarFallback>
          </Avatar>
        </ListCardBlurredMedia>
      </ListCardMediaColumn>

      <ListCardContent>
        <ListCardDetailsHeader
          title={company.name}
          description={company.description}
          status={statusBadge}
          actions={
            <CompanyActions
              company={company}
              onViewCompany={onViewCompany}
              actualStatus={actualStatus}
              showViewButton={false}
              triggerVariant="default"
            />
          }
          tags={tagChips}
        />
        <ListCardContactGrid>
          <ListCardContactEmail email={company.email} />
          <ListCardContactPhone phone={company.phone} />
          <ListCardDetailField icon={Users} label="Contact" value={company.contactPerson ?? "—"} />
        </ListCardContactGrid>
        <ListCardDetailDivider />
        <ListCardDetailGrid>
          <ListCardDetailField
            icon={MapPin}
            label="Location"
            value={
              company.city && company.state
                ? `${company.city}, ${company.state}`
                : company.address ?? "—"
            }
          />
          <ListCardDetailField
            icon={Users}
            label="Employees"
            value={company.employees ? String(company.employees) : "—"}
          />
          {bottomThirdCell}
        </ListCardDetailGrid>
      </ListCardContent>
    </Card>
  );
};
