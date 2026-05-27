/**
 * Status badge color tokens used across the app (appointments, products, companies, etc.).
 * Showcase and future refactors should reference these class strings for consistency.
 */

export const statusBadgeClasses = {
  green: "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30",
  gray: "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30",
  yellow: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30",
  orange: "bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30",
  purple: "bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30",
  blue: "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30",
  red: "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30",
} as const;

export type StatusBadgeClassKey = keyof typeof statusBadgeClasses;

export interface StatusBadgeDefinition {
  label: string;
  className: string;
}

export interface StatusBadgeGroup {
  id: string;
  title: string;
  description: string;
  badges: StatusBadgeDefinition[];
}

/** Catalog of status tags rendered in the component showcase (sourced from in-app usage). */
export const STATUS_BADGE_GROUPS: StatusBadgeGroup[] = [
  {
    id: "appointments",
    title: "Appointments",
    description: "AppointmentCard, timeline, detail pages",
    badges: [
      { label: "Pending", className: statusBadgeClasses.orange },
      { label: "Confirmed", className: statusBadgeClasses.green },
      { label: "In Progress", className: statusBadgeClasses.purple },
      { label: "Completed", className: statusBadgeClasses.blue },
      { label: "Cancelled", className: statusBadgeClasses.red },
      { label: "No Show", className: statusBadgeClasses.gray },
    ],
  },
  {
    id: "general",
    title: "General lifecycle",
    description: "Users, staff, services, spaces, tags",
    badges: [
      { label: "Active", className: statusBadgeClasses.green },
      { label: "Inactive", className: statusBadgeClasses.gray },
      { label: "Pending", className: statusBadgeClasses.yellow },
      { label: "Draft", className: statusBadgeClasses.orange },
      { label: "Maintenance", className: statusBadgeClasses.orange },
    ],
  },
  {
    id: "companies",
    title: "Company approval",
    description: "Company cards and detail",
    badges: [
      { label: "Approved", className: statusBadgeClasses.green },
      { label: "Pending", className: statusBadgeClasses.orange },
      { label: "Rejected", className: statusBadgeClasses.red },
    ],
  },
  {
    id: "products",
    title: "Products & inventory",
    description: "Products list, company products, variants",
    badges: [
      { label: "Verified", className: statusBadgeClasses.purple },
      { label: "Unverified", className: statusBadgeClasses.yellow },
      { label: "In Stock", className: statusBadgeClasses.green },
      { label: "Low Stock", className: statusBadgeClasses.yellow },
      { label: "Out of Stock", className: statusBadgeClasses.red },
      { label: "Discontinued", className: statusBadgeClasses.gray },
    ],
  },
  {
    id: "product-type",
    title: "Product type",
    description: "ProductsPage type badges",
    badges: [
      { label: "Sell Only", className: statusBadgeClasses.blue },
      { label: "Service Use", className: statusBadgeClasses.purple },
      { label: "Sell & Service", className: statusBadgeClasses.green },
    ],
  },
  {
    id: "sales",
    title: "Sales",
    description: "SalesCard payment status",
    badges: [
      { label: "Completed", className: statusBadgeClasses.green },
      { label: "Processing", className: statusBadgeClasses.yellow },
      { label: "Failed", className: statusBadgeClasses.red },
    ],
  },
  {
    id: "backlog",
    title: "Backlog",
    description: "Backlog item status",
    badges: [
      { label: "New", className: statusBadgeClasses.blue },
      { label: "Active", className: statusBadgeClasses.yellow },
      { label: "Done", className: statusBadgeClasses.green },
    ],
  },
  {
    id: "priority",
    title: "Priority",
    description: "Backlog and notifications",
    badges: [
      { label: "Urgent", className: statusBadgeClasses.red },
      { label: "High", className: statusBadgeClasses.orange },
      { label: "Medium", className: statusBadgeClasses.yellow },
      { label: "Low", className: statusBadgeClasses.gray },
    ],
  },
];
