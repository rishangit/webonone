import type { FormField, FormFieldValues } from '../types/formDefinition';

export function validateFormValues(
  fields: FormField[],
  values: FormFieldValues
): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const field of fields) {
    const v = values[field.id];
    const str = v == null ? '' : String(v);

    if (field.required) {
      if (field.type === 'checkbox') {
        if (!v) errors[field.id] = `${field.label} is required`;
      } else if (!str.trim()) {
        errors[field.id] = `${field.label} is required`;
      }
    }

    if (field.type === 'number' && str && field.validation) {
      const n = Number(v);
      if (Number.isNaN(n)) {
        errors[field.id] = 'Enter a valid number';
      } else {
        if (field.validation.min != null && n < field.validation.min) {
          errors[field.id] = `Minimum value is ${field.validation.min}`;
        }
        if (field.validation.max != null && n > field.validation.max) {
          errors[field.id] = `Maximum value is ${field.validation.max}`;
        }
      }
    }

    if ((field.type === 'text' || field.type === 'textarea') && str && field.validation) {
      if (field.validation.minLength != null && str.length < field.validation.minLength) {
        errors[field.id] = `Minimum ${field.validation.minLength} characters`;
      }
      if (field.validation.maxLength != null && str.length > field.validation.maxLength) {
        errors[field.id] = `Maximum ${field.validation.maxLength} characters`;
      }
      if (field.validation.pattern) {
        try {
          const re = new RegExp(field.validation.pattern);
          if (!re.test(str)) errors[field.id] = 'Invalid format';
        } catch {
          /* ignore invalid regex */
        }
      }
    }
  }

  return errors;
}
