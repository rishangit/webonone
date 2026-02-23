/**
 * Entity Type Enum
 * Defines all standardized entity types that can be tagged in the system
 * Values are stored as strings in the database (ENUM type)
 */
export enum EntityType {
  APPOINTMENT = 'appointment',
  STAFF = 'staff',
  SPACE = 'space',
  SERVICE = 'service',
  PRODUCT = 'product',
  USER = 'user',
  COMPANY = 'company',
  COMPANY_PRODUCT = 'company_product'
}

// Entity labels for display
export const EntityTypeLabels: Record<EntityType, string> = {
  [EntityType.APPOINTMENT]: 'Appointment',
  [EntityType.STAFF]: 'Staff',
  [EntityType.SPACE]: 'Space',
  [EntityType.SERVICE]: 'Service',
  [EntityType.PRODUCT]: 'Product',
  [EntityType.USER]: 'User',
  [EntityType.COMPANY]: 'Company',
  [EntityType.COMPANY_PRODUCT]: 'Company Product'
};

// Array of all valid entity types for validation
export const EntityTypeValues = Object.values(EntityType).filter(
  (v): v is EntityType => typeof v === 'string'
) as EntityType[];

// Type for entity type
export type EntityTypeType = EntityType;

// Helper function to check if an entity type is valid
export const isValidEntityType = (entityType: string): entityType is EntityType => {
  return entityType !== null && entityType !== undefined && EntityTypeValues.includes(entityType as EntityType);
};

// Helper function to get entity type label
export const getEntityTypeLabel = (entityType: EntityType): string => {
  return EntityTypeLabels[entityType] || 'Unknown';
};

// Helper function to normalize entity type (accepts various formats)
export const normalizeEntityType = (entityType: string | undefined | null): EntityType | null => {
  if (!entityType) return null;
  
  const normalized = entityType.toLowerCase().trim();
  
  // Map common variations
  const typeMap: Record<string, EntityType> = {
    'appointment': EntityType.APPOINTMENT,
    'appointments': EntityType.APPOINTMENT,
    'staff': EntityType.STAFF,
    'staffs': EntityType.STAFF,
    'space': EntityType.SPACE,
    'spaces': EntityType.SPACE,
    'service': EntityType.SERVICE,
    'services': EntityType.SERVICE,
    'product': EntityType.PRODUCT,
    'products': EntityType.PRODUCT,
    'user': EntityType.USER,
    'users': EntityType.USER,
    'company': EntityType.COMPANY,
    'companies': EntityType.COMPANY,
    'company_product': EntityType.COMPANY_PRODUCT,
    'company_products': EntityType.COMPANY_PRODUCT,
    'companyproduct': EntityType.COMPANY_PRODUCT,
    'companyproducts': EntityType.COMPANY_PRODUCT
  };
  
  return typeMap[normalized] || (isValidEntityType(normalized) ? normalized as EntityType : null);
};
