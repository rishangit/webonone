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
  
  color: yup
    .string()
    .optional()
    .max(100, 'Color must be less than 100 characters')
    .transform((value) => value?.trim() || undefined),
  
  size: yup
    .string()
    .optional()
    .test('size-format', 'Size must be a positive number', function(value) {
      if (!value || value.trim() === '') {
        return true; // Allow empty
      }
      const num = Number(value);
      return !isNaN(num) && num > 0;
    })
    .transform((value) => value?.trim() || undefined),
  
  sizeUnit: yup
    .string()
    .oneOf(['ml', 'L'], 'Size unit must be ml or L')
    .optional()
    .transform((value) => value || undefined),
  
  weight: yup
    .string()
    .optional()
    .test('weight-format', 'Weight must be a positive number', function(value) {
      if (!value || value.trim() === '') {
        return true; // Allow empty
      }
      const num = Number(value);
      return !isNaN(num) && num > 0;
    })
    .transform((value) => value?.trim() || undefined),
  
  weightUnit: yup
    .string()
    .oneOf(['mg', 'g', 'kg'], 'Weight unit must be mg, g, or kg')
    .optional()
    .transform((value) => value || undefined),
  
  material: yup
    .string()
    .optional()
    .max(255, 'Material must be less than 255 characters')
    .transform((value) => value?.trim() || undefined),
  
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

