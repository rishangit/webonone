"use client";

import {
  AppointmentShowcaseSection,
  CompanyShowcaseSection,
  ProductShowcaseSection,
  ProductAttributeShowcaseSection,
  RoleBadgesShowcaseSection,
  ServiceShowcaseSection,
  SpaceShowcaseSection,
  StaffShowcaseSection,
  SystemProductShowcaseSection,
  SystemServiceShowcaseSection,
  TagShowcaseSection,
  UnitOfMeasureShowcaseSection,
  UserShowcaseSection,
  WebsiteShowcaseSection,
  CustomFormShowcaseSection,
  SalesShowcaseSection,
} from "../sections";

const VIEW = "grid" as const;

export function ShowcaseCardsTab() {
  return (
    <div className="space-y-10 mt-6">
      <AppointmentShowcaseSection sectionId="showcase-cards-appointment" viewMode={VIEW} />
      <CompanyShowcaseSection sectionId="showcase-cards-company" viewMode={VIEW} />
      <StaffShowcaseSection sectionId="showcase-cards-staff" viewMode={VIEW} />
      <SpaceShowcaseSection sectionId="showcase-cards-space" viewMode={VIEW} />
      <ServiceShowcaseSection sectionId="showcase-cards-service" viewMode={VIEW} />
      <SystemServiceShowcaseSection sectionId="showcase-cards-system-service" viewMode={VIEW} />
      <ProductShowcaseSection sectionId="showcase-cards-product" viewMode={VIEW} />
      <SystemProductShowcaseSection sectionId="showcase-cards-system-product" viewMode={VIEW} />
      <ProductAttributeShowcaseSection sectionId="showcase-cards-product-attribute" viewMode={VIEW} />
      <UnitOfMeasureShowcaseSection sectionId="showcase-cards-unit-of-measure" viewMode={VIEW} />
      <WebsiteShowcaseSection sectionId="showcase-cards-website" viewMode={VIEW} />
      <UserShowcaseSection sectionId="showcase-cards-user" viewMode={VIEW} />
      <TagShowcaseSection sectionId="showcase-cards-tag" viewMode={VIEW} />
      <RoleBadgesShowcaseSection />
      <CustomFormShowcaseSection sectionId="showcase-cards-custom-form" viewMode={VIEW} />
      <SalesShowcaseSection sectionId="showcase-cards-sales" viewMode={VIEW} />
    </div>
  );
}
