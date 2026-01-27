import * as yup from 'yup';

// Company update validation schema matching backend validation
export const companyUpdateSchema = yup.object({
  name: yup
    .string()
    .required('Company name is required')
    .min(1, 'Company name must be at least 1 character')
    .max(255, 'Company name must be less than 255 characters'),
  
  description: yup
    .string()
    .required('Company description is required')
    .min(1, 'Company description must be at least 1 character'),
  
  email: yup
    .string()
    .required('Email address is required')
    .email('Please enter a valid email address'),
  
  phone: yup
    .string()
    .required('Phone number is required')
    .test('phone-format', 'Phone number format is invalid. Please include country code (e.g., +1234567890)', function(value) {
      // Validate phone format: must start with + followed by country code and digits
      // Allows: +1234567890, +441234567890, etc.
      if (!value || value.trim() === '') {
        return false; // Required field cannot be empty
      }
      return /^\+\d{1,4}\d{4,}$/.test(value.replace(/\s/g, ''));
    }),
  
  address: yup
    .string()
    .required('Address is required')
    .min(1, 'Address must be at least 1 character'),
  
  city: yup
    .string()
    .required('City is required')
    .min(1, 'City must be at least 1 character'),
  
  state: yup
    .string()
    .required('State is required')
    .min(1, 'State must be at least 1 character'),
  
  country: yup
    .string()
    .optional()
    .transform((value) => value || undefined),
  
  postalCode: yup
    .string()
    .optional()
    .transform((value) => value || undefined),
  
  website: yup
    .string()
    .optional()
    .transform((value) => value || undefined)
    .test('website-format', 'Please enter a valid website URL', function(value) {
      // Only validate if a value is provided
      if (!value || value.trim() === '') {
        return true; // Allow empty
      }
      try {
        new URL(value);
        return true;
      } catch {
        return false;
      }
    }),
  
  currencyId: yup
    .string()
    .optional()
    .transform((value) => value || undefined),
  
  companySize: yup
    .string()
    .oneOf(['1-5', '6-10', '11-20', '21-50', '51-200', '201-500', '500+'], 'Invalid company size')
    .optional()
    .transform((value) => value || undefined),
  
  logo: yup
    .string()
    .optional()
    .transform((value) => value || undefined),
  
  contactPerson: yup
    .string()
    .optional()
    .transform((value) => value || undefined),
  
  latitude: yup
    .number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90')
    .optional()
    .nullable()
    .transform((value) => value === '' ? undefined : value),
  
  longitude: yup
    .number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180')
    .optional()
    .nullable()
    .transform((value) => value === '' ? undefined : value)
});

export type CompanyUpdateFormData = yup.InferType<typeof companyUpdateSchema>;

