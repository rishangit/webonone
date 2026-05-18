import type { Service, Tag } from "@/features/services/services";
import type { SystemService } from "@/features/services/services/systemServices";

/** Maps a catalog `SystemService` into the `Service` shape used by shared Service Detail tab components. */
export const mapSystemServiceToServiceDetailView = (s: SystemService): Service => {
  const images = s.images?.length ? [...s.images] : s.image ? [s.image] : [];
  const primary = images[0] || "";
  const tags: (string | Tag)[] = (s.tags || []).map((t) => ({
    id: t.id,
    name: t.name,
    color: t.color,
    icon: t.icon,
    description: t.description,
    isActive: t.isActive,
  }));
  return {
    id: s.id,
    companyId: "",
    name: s.name,
    description: s.description,
    duration: s.defaultDuration ?? 0,
    price: Number(s.defaultPrice ?? 0),
    status: s.isActive ? "Active" : "Inactive",
    bookings: { thisMonth: s.usageCount ?? 0, revenue: 0 },
    tags,
    image: primary,
    images,
    createdAt: s.createdDate,
    updatedAt: s.lastModified,
    defaultProducts: [],
  };
};
