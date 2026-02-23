/**
 * Entity Type Enum
 * Defines all standardized entity types that can be tagged in the system
 * Values are stored as strings in the database (ENUM type)
 */
const EntityType = {
  APPOINTMENT: 'appointment',
  STAFF: 'staff',
  SPACE: 'space',
  SERVICE: 'service',
  PRODUCT: 'product',
  USER: 'user',
  COMPANY: 'company',
  COMPANY_PRODUCT: 'company_product'
};

// Entity labels for display
const EntityTypeLabels = {
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
const EntityTypeValues = Object.values(EntityType);

// Helper function to check if an entity type is valid
const isValidEntityType = (entityType) => {
  return entityType && EntityTypeValues.includes(entityType);
};

// Helper function to get entity type label
const getEntityTypeLabel = (entityType) => {
  return EntityTypeLabels[entityType] || 'Unknown';
};

// Helper function to normalize entity type (accepts various formats)
const normalizeEntityType = (entityType) => {
  if (!entityType) return null;
  
  const normalized = entityType.toLowerCase().trim();
  
  // Map common variations
  const typeMap = {
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
  
  return typeMap[normalized] || (isValidEntityType(normalized) ? normalized : null);
};

module.exports = {
  EntityType,
  EntityTypeLabels,
  EntityTypeValues,
  isValidEntityType,
  getEntityTypeLabel,
  normalizeEntityType
};
