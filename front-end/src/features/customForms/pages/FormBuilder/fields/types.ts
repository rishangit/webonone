import type { ComponentType } from 'react';
import type { FormField, FormFieldType, FormFieldValues } from '@/features/customForms/types';

export type FieldRenderContext = 'editor' | 'preview' | 'fill';

export interface FieldRenderProps {
  field: FormField;
  context: FieldRenderContext;
  value?: FormFieldValues[string];
  onChange?: (value: FormFieldValues[string]) => void;
  disabled?: boolean;
}

export interface FieldEditProps {
  field: FormField;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (field: FormField) => void;
}

export interface FieldModule {
  type: FormFieldType;
  label: string;
  description: string;
  createDefaultField: () => FormField;
  RenderComponent: ComponentType<FieldRenderProps>;
  EditComponent: ComponentType<FieldEditProps>;
}
