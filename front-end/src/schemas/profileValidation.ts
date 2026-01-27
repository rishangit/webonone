import * as yup from 'yup';

// Profile update validation schema matching backend validation
export const profileUpdateSchema = yup.object({
  email: yup
    .string()
    .required('Email address is required')
    .email('Please enter a valid email address'),
  
  firstName: yup
    .string()
    .required('First name is required')
    .min(1, 'First name must be at least 1 character')
    .max(100, 'First name must be less than 100 characters'),
  
  lastName: yup
    .string()
    .required('Last name is required')
    .min(1, 'Last name must be at least 1 character')
    .max(100, 'Last name must be less than 100 characters'),
  
  phone: yup
    .string()
    .required('Phone number is required')
    .test('phone-format', 'Phone number format is invalid. Please include country code (e.g., +1234567890)', function(value) {
      // Validate phone format: must start with + followed by country code and digits
      // Allows: +1234567890, +441234567890, etc.
      if (!value || value.trim() === '') {
        return false; // Required field cannot be empty
      }
      return /^\+\d{1,4}\d{4,14}$/.test(value.replace(/\s/g, ''));
    }),
  
  address: yup
    .string()
    .optional()
    .transform((value) => value || undefined), // No validation, accept any value
  
  dateOfBirth: yup
    .date()
    .max(new Date(), 'Date of birth cannot be in the future')
    .optional()
    .transform((value, originalValue) => {
      // Handle empty strings and string dates
      if (originalValue === '' || originalValue == null || originalValue === undefined) {
        return undefined;
      }
      // If it's already a Date, return it
      if (value instanceof Date && !isNaN(value.getTime())) {
        return value;
      }
      // If it's a string, try to parse it
      if (typeof originalValue === 'string') {
        const parsed = new Date(originalValue);
        return isNaN(parsed.getTime()) ? undefined : parsed;
      }
      return undefined;
    }),
  
  bio: yup
    .string()
    .optional()
    .transform((value) => value || undefined),
  
  preferences: yup.object({
    theme: yup
      .string()
      .oneOf(['light', 'dark', 'system'], 'Theme must be light, dark, or system')
      .optional()
      .transform((value) => value || undefined),
    notifications: yup
      .boolean()
      .optional()
      .transform((value) => value ?? undefined),
    language: yup
      .string()
      .optional()
      .transform((value) => value || undefined)
  }).optional()
    .transform((value) => value || undefined)
});

// Password change validation schema
export const passwordChangeSchema = yup.object({
  currentPassword: yup
    .string()
    .required('Current password is required')
    .min(6, 'Password must be at least 6 characters'),
  
  newPassword: yup
    .string()
    .required('New password is required')
    .min(6, 'New password must be at least 6 characters'),
  
  confirmPassword: yup
    .string()
    .required('Please confirm your new password')
    .oneOf([yup.ref('newPassword')], 'Passwords must match')
});

export type ProfileUpdateFormData = yup.InferType<typeof profileUpdateSchema>;
export type PasswordChangeFormData = yup.InferType<typeof passwordChangeSchema>;

