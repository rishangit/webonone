import { AppointmentStatus } from "@/shared/types/appointments";
import type { Company } from "@/shared/components/companies";
import type { Service } from "@/shared/services/services-catalog";
import type { SystemService } from "@/features/services/services/systemServices";
import type { SystemProduct } from "@/features/products/pages/SystemProducts/SystemProductCard/types";
import type { SystemProductAttribute } from "@/features/products/services/systemProductAttributes";
import type { UnitsOfMeasure } from "@/features/products/services/unitsOfMeasure";
import type { CompanyWebPage } from "@/features/website/services/companyWebPages";
import type { CompanyWebTheme } from "@/features/website/services/companyWebThemes";
import type { MediaItem } from "@/features/website/pages/MediaPage/components/MediaActions";
import {
  SHOWCASE_COMPANY_PRODUCT_VARIANTS,
  SHOWCASE_IMAGE_MEDIA,
  SHOWCASE_IMAGE_PRODUCT,
  SHOWCASE_IMAGE_SERVICE,
  SHOWCASE_IMAGE_SPACE,
  SHOWCASE_IMAGE_SYSTEM_PRODUCT,
  SHOWCASE_IMAGE_SYSTEM_SERVICE,
} from "@/shared/utils/showcaseFixture";

const TAG_DATES = {
  createdDate: "2024-01-01T00:00:00Z",
  lastModified: "2024-06-01T00:00:00Z",
};

export {
  SHOWCASE_IMAGE_MEDIA as showcaseImageMedia,
  SHOWCASE_IMAGE_PRODUCT as showcaseImageProduct,
  SHOWCASE_IMAGE_SERVICE as showcaseImageService,
  SHOWCASE_IMAGE_SPACE as showcaseImageSpace,
  SHOWCASE_IMAGE_SYSTEM_PRODUCT as showcaseImageSystemProduct,
  SHOWCASE_IMAGE_SYSTEM_SERVICE as showcaseImageSystemService,
};

export const showcaseAppointments = {
  confirmed: {
    id: "showcase-appt-1",
    patientName: "Alex Rivera",
    date: "2026-05-18T14:00:00.000Z",
    time: "2:00 PM",
    duration: "45 min",
    type: "Skin consultation",
    status: AppointmentStatus.CONFIRMED,
    phone: "+1 (555) 010-2000",
    location: "Treatment Room B",
    staff: { name: "Dr. Sam Chen", specialization: "Dermatology" },
    service: "Skin consultation",
  },
  pending: {
    id: "showcase-appt-2",
    patientName: "Jordan Lee",
    date: "2026-05-19T09:00:00.000Z",
    time: "9:00 AM",
    duration: "30 min",
    type: "Follow-up",
    status: AppointmentStatus.PENDING,
    phone: "+1 (555) 010-2001",
    location: "Room 101",
    staff: { name: "Dr. Sam Chen", specialization: "Dermatology" },
    service: "Follow-up visit",
  },
};

export const showcaseCompany: Company = {
  id: "showcase-company-1",
  name: "Acme Healthcare Corp",
  description: "Leading healthcare services provider specializing in wellness and preventive care",
  contactPerson: "John Smith",
  email: "contact@acmehealth.com",
  phone: "+1 (555) 987-6543",
  address: "123 Main Street",
  city: "New York",
  state: "NY",
  country: "USA",
  category: "Healthcare",
  subCategory: "Medical Services",
  employees: "25",
  status: "approved",
  submittedDate: "2024-01-01T00:00:00Z",
  logo: undefined,
  isActive: true,
  tags: [{ id: 1, name: "Premium", color: "#f97316", icon: "star" }],
  owner: null,
};

export const showcaseStaff = {
  id: "showcase-staff-1",
  companyId: "showcase-company-1",
  firstName: "Sarah",
  lastName: "Miller",
  name: "Sarah Miller",
  email: "sarah.miller@example.com",
  phone: "+1 (555) 987-6543",
  role: "Senior Therapist",
  department: "Wellness",
  status: "Active" as const,
  joinDate: "2023-01-15",
  lastActive: "2 hours ago",
};

export const showcaseSpace = {
  id: "showcase-space-1",
  companyId: "showcase-company-1",
  name: "Conference Room A",
  description: "Large meeting space with AV equipment",
  capacity: 20,
  status: "Active" as const,
  imageUrl: SHOWCASE_IMAGE_SPACE,
  appointments: { today: 0, thisWeek: 2 },
};

export const showcaseService: Service = {
  id: "showcase-svc-1",
  companyId: "showcase-company-1",
  name: "Massage Therapy",
  description: "Relaxing full-body massage",
  duration: 60,
  price: 120,
  category: "Wellness",
  status: "Active",
  bookings: { thisMonth: 12, revenue: 1440 },
  tags: [],
  image: SHOWCASE_IMAGE_SERVICE,
  images: [SHOWCASE_IMAGE_SERVICE],
};

export const showcaseSystemService: SystemService = {
  id: "showcase-sys-svc-1",
  name: "Deep Tissue Massage",
  description: "System catalog template for company services",
  images: [SHOWCASE_IMAGE_SYSTEM_SERVICE],
  image: SHOWCASE_IMAGE_SYSTEM_SERVICE,
  isActive: true,
  isVerified: true,
  usageCount: 8,
  defaultDuration: 60,
  defaultPrice: 130,
  tags: [],
};

export const showcaseSystemProduct: SystemProduct = {
  id: "showcase-sys-product-1",
  name: "Vitamin C Serum",
  description: "Brightening serum for daily skincare routines",
  imageUrl: SHOWCASE_IMAGE_SYSTEM_PRODUCT,
  isActive: true,
  isVerified: true,
  usageCount: 14,
  createdDate: "2024-01-01T00:00:00Z",
  lastModified: "2024-06-01T00:00:00Z",
  tags: ["Skincare", "Retail"],
  type: "sell",
};

export const showcaseCompanyProduct = {
  id: "showcase-product-1",
  companyId: "showcase-company-1",
  systemProductId: "showcase-sys-product-1",
  name: "Premium Skincare Set",
  description: "Complete skincare routine package",
  imageUrl: SHOWCASE_IMAGE_PRODUCT,
  sku: "SKU-001",
  isAvailableForPurchase: true,
  notes: "Popular product",
  tags: [],
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

export { SHOWCASE_COMPANY_PRODUCT_VARIANTS as showcaseCompanyProductVariants };

export const showcaseUnitsOfMeasure: UnitsOfMeasure[] = [
  {
    id: "showcase-uom-1",
    unitName: "Piece",
    symbol: "pc",
    baseUnit: null,
    multiplier: 1,
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
  {
    id: "showcase-uom-2",
    unitName: "Milliliter",
    symbol: "ml",
    baseUnit: null,
    multiplier: 1,
    isActive: true,
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  },
];

export const showcaseProductAttribute: SystemProductAttribute = {
  id: "showcase-attr-1",
  name: "Volume",
  description: "Product volume in milliliters",
  valueDataType: "number",
  unitOfMeasure: "showcase-uom-2",
  isActive: true,
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-06-01T00:00:00Z",
};

export const showcaseWebPage: CompanyWebPage = {
  id: "showcase-webpage-1",
  companyId: "showcase-company-1",
  name: "Home",
  url: "/home",
  isActive: true,
};

export const showcaseTheme: CompanyWebTheme = {
  id: "showcase-theme-1",
  companyId: "showcase-company-1",
  name: "Wellness Default",
  isActive: true,
  isDefault: true,
  backgroundColor: "#0f172a",
  bodyTextColor: "#f8fafc",
  themeData: {
    themeName: "Wellness Default",
    basicSetting: { backgroundColor: "#0f172a", fontColor: "#f8fafc" },
    textSettings: [
      {
        styleName: "Body",
        googleFontUrl: "",
        fontFamily: "Inter, sans-serif",
        fontSize: "16px",
        fontColor: "#f8fafc",
      },
    ],
  },
};

export const showcaseMediaFolder: MediaItem = {
  type: "folder",
  name: "Hero images",
  path: "hero",
};

export const showcaseMediaImageFile: MediaItem = {
  type: "file",
  name: "banner-spring.jpg",
  path: "hero/banner-spring.jpg",
  size: 245760,
  isImage: true,
  modifiedAt: "2024-06-01T00:00:00Z",
};

/** Demo portrait for Avatar showcase (external URL; passes through formatAvatarUrl). */
export const showcaseAvatarImageUrl =
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=256&h=256&fit=crop&crop=face";

export const showcaseUser = {
  id: "showcase-user-1",
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+1 (555) 123-4567",
  avatar: undefined,
  role: "Customer",
  roles: [],
  roleNames: ["Customer"],
  status: "active" as const,
  location: "New York, NY",
  createdAt: "2024-01-01T00:00:00Z",
  firstName: "John",
  lastName: "Doe",
};

export const showcaseTag = {
  id: "showcase-tag-1",
  name: "VIP",
  description: "Priority clients",
  color: "#f97316",
  icon: "star",
  isActive: true,
  usageCount: 12,
  ...TAG_DATES,
};

export const showcaseSale = {
  id: "showcase-sale-1",
  type: "product" as const,
  date: "2026-05-18T14:30:00.000Z",
  customerName: "Alex Rivera",
  customerImage: undefined,
  items: [
    { id: "item-1", name: "Skincare Set", quantity: 2, unitPrice: 49.99, discount: 0 },
  ],
  totalAmount: 99.98,
  status: "completed" as const,
  paymentMethod: "Card",
  staffMember: "Sarah Miller",
};

export const showcaseFixtureUsers = [
  { id: "u1", name: "Alex Rivera", email: "alex@example.com" },
  { id: "u2", name: "Jordan Lee", email: "jordan@example.com" },
  { id: "u3", name: "Sam Chen", email: "sam@example.com" },
];

export const showcaseFixtureProducts = Array.from({ length: 6 }, (_, i) => ({
  id: `showcase-pick-product-${i + 1}`,
  name: `Demo Product ${i + 1}`,
  price: 19.99 + i * 5,
  imageUrl: SHOWCASE_IMAGE_PRODUCT,
}));

export const showcaseFixtureTags = [showcaseTag];
