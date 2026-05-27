import type { ShowcaseCatalogEntry } from "../types";

const primary: Omit<ShowcaseCatalogEntry, "tab" | "category">[] = [
  { id: "btn", name: "Button", importPath: "@/components/ui/button" },
  { id: "input", name: "Input", importPath: "@/components/ui/input" },
  { id: "textarea", name: "Textarea", importPath: "@/components/ui/textarea" },
  { id: "label", name: "Label", importPath: "@/components/ui/label" },
  { id: "select", name: "Select", importPath: "@/components/ui/select" },
  { id: "multi-select", name: "MultiSelect", importPath: "@/components/ui/multi-select" },
  { id: "checkbox", name: "Checkbox", importPath: "@/components/ui/checkbox" },
  { id: "radio", name: "RadioGroup", importPath: "@/components/ui/radio-group" },
  { id: "switch", name: "Switch", importPath: "@/components/ui/switch" },
  { id: "slider", name: "Slider", importPath: "@/components/ui/slider" },
  { id: "toggle", name: "Toggle", importPath: "@/components/ui/toggle" },
  { id: "toggle-group", name: "ToggleGroup", importPath: "@/components/ui/toggle-group" },
  { id: "input-otp", name: "InputOTP", importPath: "@/components/ui/input-otp" },
  { id: "calendar", name: "Calendar", importPath: "@/components/ui/calendar" },
  { id: "date-picker", name: "DatePicker", importPath: "@/components/common/DatePicker" },
  { id: "phone-input", name: "PhoneInput", importPath: "@/components/common/PhoneInput" },
  { id: "file-upload", name: "FileUpload", importPath: "@/components/ui/file-upload" },
  { id: "progress-bar", name: "ProgressBar", importPath: "@/components/ui/progress-bar" },
  { id: "skeleton", name: "Skeleton", importPath: "@/components/ui/skeleton" },
  { id: "theme-accent", name: "Theme & accent", importPath: "@/components/ui (theme tokens) + router handlers" },
];

const controls: Omit<ShowcaseCatalogEntry, "tab" | "category">[] = [
  { id: "tab-switcher", name: "TabSwitcher", importPath: "@/components/ui/tab-switcher" },
  { id: "view-switcher", name: "ViewSwitcher", importPath: "@/components/ui/view-switcher" },
  { id: "card-primitive", name: "Card", importPath: "@/components/ui/card" },
  { id: "badge", name: "Badge", importPath: "@/components/ui/badge" },
  { id: "avatar", name: "Avatar", importPath: "@/components/ui/avatar", sectionId: "showcase-controls-avatar" },
  { id: "dropdown-menu", name: "DropdownMenu (kebab)", importPath: "@/components/ui/dropdown-menu" },
  { id: "search-input", name: "SearchInput", importPath: "@/components/common/SearchInput" },
  { id: "empty-state", name: "EmptyState", importPath: "@/components/common/EmptyState" },
  { id: "pagination", name: "Pagination", importPath: "@/components/common/Pagination" },
  { id: "separator", name: "Separator", importPath: "@/components/ui/separator" },
  { id: "tooltip", name: "Tooltip", importPath: "@/components/ui/tooltip" },
  { id: "breadcrumb", name: "Breadcrumb", importPath: "@/components/ui/breadcrumb" },
  { id: "accordion", name: "Accordion", importPath: "@/components/ui/accordion" },
  { id: "tag-card-ctrl", name: "TagCard", importPath: "@/shared/components/tags" },
  { id: "tag-selector", name: "TagSelector", importPath: "@/shared/components/tags", notes: "May fetch tags on open" },
  { id: "card-title", name: "CardTitle", importPath: "@/components/common/CardTitle" },
];

const cards: ShowcaseCatalogEntry[] = [
  { id: "appt-card", name: "AppointmentCard", category: "cards", importPath: "@/shared/components/appointments", tab: "cards", sectionId: "showcase-cards-appointment" },
  { id: "company-card", name: "CompanyCard", category: "cards", importPath: "@/shared/components/companies", tab: "cards", sectionId: "showcase-cards-company" },
  { id: "staff-card", name: "StaffCard", category: "cards", importPath: "@/shared/components/staff", tab: "cards", sectionId: "showcase-cards-staff" },
  { id: "space-card", name: "SpaceCard", category: "cards", importPath: "@/shared/components/spaces", tab: "cards", sectionId: "showcase-cards-space" },
  { id: "service-card", name: "ServiceCard", category: "cards", importPath: "@/shared/components/services-catalog", tab: "cards", sectionId: "showcase-cards-service" },
  { id: "system-service-card", name: "SystemServiceCard", category: "cards", importPath: "@/shared/components/services-catalog", tab: "cards", sectionId: "showcase-cards-system-service" },
  { id: "product-card", name: "CompanyProductCard", category: "cards", importPath: "@/shared/components/products-company", tab: "cards", sectionId: "showcase-cards-product" },
  { id: "system-product-card", name: "SystemProductCard", category: "cards", importPath: "@/shared/components/products-system", tab: "cards", sectionId: "showcase-cards-system-product" },
  { id: "product-attribute-card", name: "ProductAttributeCard", category: "cards", importPath: "@/shared/components/product-attributes", tab: "cards", sectionId: "showcase-cards-product-attribute" },
  { id: "unit-of-measure-card", name: "UnitOfMeasureCard", category: "cards", importPath: "@/shared/components/units-of-measure", tab: "cards", sectionId: "showcase-cards-unit-of-measure" },
  { id: "webpage-card", name: "WebpageCard", category: "cards", importPath: "@/shared/components/website", tab: "cards", sectionId: "showcase-cards-website-webpage" },
  { id: "theme-card", name: "ThemeCard", category: "cards", importPath: "@/shared/components/website", tab: "cards", sectionId: "showcase-cards-website-theme" },
  { id: "media-card", name: "MediaCard", category: "cards", importPath: "@/shared/components/website", tab: "cards", sectionId: "showcase-cards-website-media" },
  { id: "user-card", name: "UserCard", category: "cards", importPath: "@/shared/components/users", tab: "cards", sectionId: "showcase-cards-user" },
  { id: "tag-card", name: "TagCard", category: "cards", importPath: "@/shared/components/tags", tab: "cards", sectionId: "showcase-cards-tag" },
  { id: "status-tags", name: "Status tags", category: "cards", importPath: "@/shared/utils/statusBadges", tab: "cards", sectionId: "showcase-cards-tag" },
];

const lists: ShowcaseCatalogEntry[] = cards.map((c) => ({
  ...c,
  id: `${c.id}-list`,
  name: `${c.name} (list)`,
  category: "lists" as const,
  tab: "lists" as const,
  sectionId: c.sectionId?.replace("cards", "lists"),
}));

const dialogs: ShowcaseCatalogEntry[] = [
  { id: "custom-dialog", name: "CustomDialog", category: "dialogs", importPath: "@/components/ui/custom-dialog", tab: "dialogs" },
  { id: "alert-dialog", name: "AlertDialog", category: "dialogs", importPath: "@/components/ui/alert-dialog", tab: "dialogs" },
  { id: "delete-dialog", name: "DeleteConfirmationDialog", category: "dialogs", importPath: "@/components/common/DeleteConfirmationDialog", tab: "dialogs" },
  { id: "sheet", name: "Sheet", category: "dialogs", importPath: "@/components/ui/sheet", tab: "dialogs" },
  { id: "popover", name: "Popover", category: "dialogs", importPath: "@/components/ui/popover", tab: "dialogs" },
  { id: "right-panel", name: "RightPanel", category: "dialogs", importPath: "@/components/common/RightPanel", tab: "dialogs" },
  { id: "user-selection", name: "UserSelectionDialog", category: "dialogs", importPath: "@/components/common/UserSelectionDialog", tab: "dialogs" },
  { id: "select-media", name: "SelectMediaDialog", category: "dialogs", importPath: "@/components/common/SelectMediaDialog", tab: "dialogs" },
  { id: "product-service-dialog", name: "ProductServiceSelectionDialog", category: "dialogs", importPath: "@/components/common/ProductServiceSelectionDialog", tab: "dialogs" },
  { id: "bill-preview", name: "BillPreviewDialog", category: "dialogs", importPath: "@/components/BillPreviewDialog", tab: "dialogs", notes: "Catalog reference only" },
];

const common: ShowcaseCatalogEntry[] = [
  { id: "cart-item", name: "CartItemEditorCard", category: "common", importPath: "@/components/common/CartItemEditorCard", tab: "cards", sectionId: "showcase-cards-cart-item" },
  { id: "user-role-badge", name: "UserRoleBadge", category: "common", importPath: "@/components/UserRoleBadge", tab: "cards", sectionId: "showcase-cards-role-badges" },
  { id: "sales-card", name: "SalesCard", category: "common", importPath: "@/shared/components/sales", tab: "cards", notes: "Optional demo" },
];

export const SHOWCASE_CATALOG_ENTRIES: ShowcaseCatalogEntry[] = [
  ...primary.map((e) => ({ ...e, category: "primary" as const, tab: "primary" as const })),
  ...controls.map((e) => ({ ...e, category: "controls" as const, tab: "controls" as const })),
  ...cards,
  ...lists,
  ...dialogs,
  ...common,
];
