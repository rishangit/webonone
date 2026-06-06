import type { FormFieldType } from '@/features/customForms/types';
import type { FieldModule } from './types';
import {
  textFieldModule,
  textareaFieldModule,
  checkboxFieldModule,
  radioFieldModule,
  dropdownFieldModule,
  dateFieldModule,
  numberFieldModule,
} from './shared/createFieldModule';

const modules: FieldModule[] = [
  textFieldModule,
  textareaFieldModule,
  checkboxFieldModule,
  radioFieldModule,
  dropdownFieldModule,
  dateFieldModule,
  numberFieldModule,
];

export function getFieldModules(): FieldModule[] {
  return modules;
}

export function getFieldModuleByType(type: FormFieldType): FieldModule | undefined {
  return modules.find((m) => m.type === type);
}
