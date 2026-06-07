"use client";

import {
  AppointmentShowcaseSection,
  CompanyShowcaseSection,
  ProductShowcaseSection,
  ProductAttributeShowcaseSection,
  SystemProductShowcaseSection,
  UnitOfMeasureShowcaseSection,
  WebsiteShowcaseSection,
  ServiceShowcaseSection,
  SpaceShowcaseSection,
  StaffShowcaseSection,
  SystemServiceShowcaseSection,
  TagShowcaseSection,
  UserShowcaseSection,
  NotificationShowcaseSection,
  SalesShowcaseSection,
} from "../sections";

const VIEW = "list" as const;

export function ShowcaseListsTab() {
  return (
    <div className="space-y-10 mt-6">
      <AppointmentShowcaseSection sectionId="showcase-lists-appointment" viewMode={VIEW} />
      <CompanyShowcaseSection sectionId="showcase-lists-company" viewMode={VIEW} />
      <StaffShowcaseSection sectionId="showcase-lists-staff" viewMode={VIEW} />
      <SpaceShowcaseSection sectionId="showcase-lists-space" viewMode={VIEW} />
      <ServiceShowcaseSection sectionId="showcase-lists-service" viewMode={VIEW} />
      <SystemServiceShowcaseSection sectionId="showcase-lists-system-service" viewMode={VIEW} />
      <ProductShowcaseSection sectionId="showcase-lists-product" viewMode={VIEW} />
      <SystemProductShowcaseSection sectionId="showcase-lists-system-product" viewMode={VIEW} />
      <ProductAttributeShowcaseSection sectionId="showcase-lists-product-attribute" viewMode={VIEW} />
      <UnitOfMeasureShowcaseSection sectionId="showcase-lists-unit-of-measure" viewMode={VIEW} />
      <WebsiteShowcaseSection sectionId="showcase-lists-website" viewMode={VIEW} />
      <UserShowcaseSection sectionId="showcase-lists-user" viewMode={VIEW} />
      <TagShowcaseSection sectionId="showcase-lists-tag" viewMode={VIEW} />
      <NotificationShowcaseSection sectionId="showcase-lists-notification" viewMode={VIEW} />
      <SalesShowcaseSection sectionId="showcase-lists-sales" viewMode={VIEW} />
    </div>
  );
}
