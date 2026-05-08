import { useNavigate } from "react-router-dom";
import { ServiceCard } from "@/shared/components/services-catalog";
import type { Service as ServiceModel } from "@/shared/types/services-catalog";
import { SpaceCard } from "@/shared/components/spaces";
import type { Space } from "@/shared/types/spaces";
import { UserCard } from "@/shared/components/users";
import { StaffCard } from "@/shared/components/staff";
import type { Staff } from "@/shared/types/staff";
import { CompanyCard } from "@/shared/components/companies";
import type { CompanyCardCompany } from "@/shared/types/companies";
import { AppointmentCard } from "@/shared/components/appointments";
import { TagCard } from "@/shared/components/tags";
import type { Tag as CatalogTag } from "@/shared/types/tags";
import { SearchResultCard, type SearchResult } from "@/features/search/components/SearchResultCard";

interface SearchResultRendererProps {
  result: SearchResult;
  searchQuery: string;
  onNavigate?: (type: string, id: string) => void;
  onAction?: (type: string, id: string, action: string) => void;
}

const toServiceStatus = (s?: string): ServiceModel["status"] => {
  const u = (s || "").toLowerCase();
  if (u === "inactive") return "Inactive";
  if (u === "draft") return "Draft";
  return "Active";
};

const toSpaceStatus = (s?: string): Space["status"] => {
  const u = (s || "").toLowerCase();
  if (u === "inactive") return "Inactive";
  if (u === "maintenance") return "Maintenance";
  return "Active";
};

const toCompanyStatus = (s?: string): CompanyCardCompany["status"] => {
  const u = (s || "").toLowerCase();
  if (u === "rejected") return "rejected";
  if (u === "pending") return "pending";
  return "approved";
};

const toUserStatus = (s?: string): "active" | "inactive" | "pending" => {
  const u = (s || "").toLowerCase();
  if (u === "pending") return "pending";
  if (u === "inactive") return "inactive";
  return "active";
};

const toStaffStatus = (s?: string): Staff["status"] => {
  const u = (s || "").toLowerCase();
  if (u === "inactive") return "Inactive";
  if (u === "pending") return "Pending";
  return "Active";
};

export const SearchResultRenderer = ({ result, searchQuery, onNavigate, onAction }: SearchResultRendererProps) => {
  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getImageUrl = (url?: string) => {
    return url || "";
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
      case "confirmed":
        return "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30";
      case "inactive":
      case "cancelled":
        return "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30";
    }
  };

  const noop = () => {};

  switch (result.type) {
    case "service": {
      const meta = result.metadata || {};
      const service: ServiceModel = {
        id: result.id,
        companyId: typeof meta.companyId === "string" ? meta.companyId : "",
        name: result.title,
        description: result.description,
        price: typeof meta.price === "number" ? meta.price : 0,
        duration: typeof meta.duration === "number" ? meta.duration : 0,
        status: toServiceStatus(result.status),
        category: typeof meta.category === "string" ? meta.category : "",
        tags: [],
        image: typeof meta.image === "string" ? meta.image : result.avatar || "",
        provider: { name: "", avatar: "" },
        bookings: { thisMonth: 0, revenue: 0 },
      };
      return (
        <ServiceCard
          service={service}
          onView={(s) => navigate(`/system/services/${s.id}`)}
          onEdit={noop}
          onDelete={noop}
          onDuplicate={noop}
          onArchive={noop}
          formatPrice={formatPrice}
          formatDuration={formatDuration}
          getImageUrl={(s) => getImageUrl(s.image)}
          getStatusColor={getStatusColor}
          viewMode="grid"
        />
      );
    }

    case "space": {
      const meta = result.metadata || {};
      const space: Space = {
        id: result.id,
        companyId: typeof meta.companyId === "string" ? meta.companyId : "",
        name: result.title,
        description: result.description,
        status: toSpaceStatus(result.status),
        capacity: typeof meta.capacity === "number" ? meta.capacity : 0,
        imageUrl: typeof meta.image === "string" ? meta.image : result.avatar || "",
        appointments:
          meta.appointments && typeof meta.appointments === "object"
            ? (meta.appointments as { today: number; thisWeek: number })
            : { today: 0, thisWeek: 0 },
        tags: [],
      };
      return (
        <SpaceCard
          space={space}
          viewMode="grid"
          onView={(sp) => navigate(`/system/spaces/${sp.id}`)}
          onEdit={noop}
          onDelete={noop}
        />
      );
    }

    case "user":
      return (
        <UserCard
          id={result.id}
          name={result.title}
          email={typeof result.metadata?.email === "string" ? result.metadata.email : result.subtitle || ""}
          phone={typeof result.metadata?.phone === "string" ? result.metadata.phone : ""}
          avatar={result.avatar}
          role={
            typeof result.metadata?.role === "string"
              ? result.metadata.role
              : result.subtitle || "User"
          }
          status={toUserStatus(result.status)}
          location={typeof result.metadata?.location === "string" ? result.metadata.location : ""}
          onViewProfile={(userId) => navigate(`/system/users/${userId}`)}
        />
      );

    case "staff": {
      const meta = result.metadata || {};
      const title = result.title;
      const parts = title.trim().split(/\s+/);
      const firstName = parts[0] || title;
      const lastName = parts.slice(1).join(" ");
      const member: Staff = {
        id: result.id,
        companyId: typeof meta.companyId === "string" ? meta.companyId : "",
        firstName,
        lastName,
        name: title,
        email:
          typeof meta.email === "string"
            ? meta.email
            : typeof result.metadata?.email === "string"
              ? result.metadata.email
              : result.subtitle || "",
        phone:
          typeof meta.phone === "string"
            ? meta.phone
            : typeof result.metadata?.phone === "string"
              ? result.metadata.phone
              : undefined,
        avatar: result.avatar,
        role: typeof meta.role === "string" ? meta.role : result.subtitle || "Staff",
        status: toStaffStatus(result.status),
        joinDate: typeof meta.joinDate === "string" ? meta.joinDate : undefined,
      };
      return (
        <StaffCard
          member={member}
          viewMode="grid"
          onView={(m) => navigate(`/system/staff/${m.id}`)}
          onDelete={noop}
        />
      );
    }

    case "company": {
      const meta = result.metadata || {};
      const company: CompanyCardCompany = {
        id: result.id,
        name: result.title,
        description: result.description,
        logo: result.avatar,
        status: toCompanyStatus(result.status),
        address: typeof meta.location === "string" ? meta.location : "",
        email: typeof meta.email === "string" ? meta.email : "",
        phone: typeof meta.phone === "string" ? meta.phone : "",
        submittedDate:
          typeof meta.submittedDate === "string" ? meta.submittedDate : new Date().toISOString(),
        tags: [],
      };
      return (
        <CompanyCard
          company={company}
          onViewCompany={(companyId) => navigate(`/system/companies/${companyId}`)}
        />
      );
    }

    case "appointment":
      return (
        <AppointmentCard
          id={result.id}
          patientName={result.title}
          patientImage={result.avatar}
          date={typeof result.metadata?.date === "string" ? result.metadata.date : ""}
          time={typeof result.metadata?.time === "string" ? result.metadata.time : ""}
          duration={
            typeof result.metadata?.duration === "number"
              ? String(result.metadata.duration)
              : typeof result.metadata?.duration === "string"
                ? result.metadata.duration
                : "30m"
          }
          type={
            typeof result.metadata?.type === "string"
              ? result.metadata.type
              : result.subtitle || "Appointment"
          }
          status={result.status || "Scheduled"}
          phone={typeof result.metadata?.phone === "string" ? result.metadata.phone : ""}
          location={typeof result.metadata?.location === "string" ? result.metadata.location : ""}
          service={typeof result.metadata?.service === "string" ? result.metadata.service : ""}
          viewMode="card"
        />
      );

    case "tag": {
      const meta = result.metadata || {};
      const tag: CatalogTag = {
        id: result.id,
        name: result.title,
        description: result.description,
        color: typeof meta.color === "string" ? meta.color : "#000000",
        icon: typeof meta.icon === "string" ? meta.icon : "Tag",
        isActive: result.status === "Active",
        usageCount: typeof meta.usageCount === "number" ? meta.usageCount : 0,
        createdDate:
          typeof meta.createdDate === "string" ? meta.createdDate : new Date().toISOString(),
        lastModified:
          typeof meta.lastModified === "string" ? meta.lastModified : new Date().toISOString(),
      };
      return (
        <TagCard
          tag={tag}
          viewMode="grid"
          onEdit={noop}
          onDelete={noop}
          onToggleStatus={noop}
        />
      );
    }

    default:
      return (
        <SearchResultCard
          result={result}
          searchQuery={searchQuery}
          onNavigate={onNavigate}
          onAction={onAction}
        />
      );
  }
};
