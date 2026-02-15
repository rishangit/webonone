import * as yup from 'yup';

// Variant validation schema
export const variantSchema = yup.object({
  name: yup
    .string()
    .required('Variant name is required')
    .min(1, 'Variant name must be at least 1 character')
    .max(255, 'Variant name must be less than 255 characters')
    .transform((value) => value?.trim() || ''),
  
  sku: yup
    .string()
    .optional()
    .transform((value) => value || undefined),
  
  variantDefiningAttributes: yup
    .array()
    .of(yup.string())
    .optional()
    .default([]),
  
  variantAttributeValues: yup
    .object()
    .optional()
    .default({}),
  
  type: yup
    .string()
    .oneOf(['sell', 'service', 'both'], 'Product type must be sell, service, or both')
    .required('Product type is required'),
  
  isDefault: yup
    .boolean()
    .optional()
    .default(false),
  
  systemProductVariantId: yup
    .string()
    .optional()
    .transform((value) => value || undefined),
});

export type VariantFormData = yup.InferType<typeof variantSchema>;

