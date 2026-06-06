export type FormFieldType =
  | 'text'
  | 'textarea'
  | 'checkbox'
  | 'radio'
  | 'dropdown'
  | 'date'
  | 'number';

export interface FormFieldLayout {
  gridRowStart: number;
  gridColumnStart: number;
  rowSpan: number;
  colSpan: number;
}

export interface FormFieldOption {
  id: string;
  label: string;
  value: string;
}

export interface FormFieldValidation {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string | null;
}

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  required?: boolean;
  validation?: FormFieldValidation;
  layout: FormFieldLayout;
  zIndex?: number;
  options?: FormFieldOption[];
  display?: 'inline' | 'vertical';
}

export interface FormDefinition {
  version: 1;
  canvas: {
    minHeightPx?: number;
    rowHeightPx?: number;
  };
  fields: FormField[];
}

export const DEFAULT_FORM_DEFINITION: FormDefinition = {
  version: 1,
  canvas: { minHeightPx: 720, rowHeightPx: 60 },
  fields: [],
};

export type FormFieldValues = Record<string, string | number | boolean | string[] | null>;
