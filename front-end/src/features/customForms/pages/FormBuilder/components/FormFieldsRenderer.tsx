import type { FormField, FormFieldValues } from '@/features/customForms/types';
import { ensureFieldLayouts, layoutToGridStyle } from '@/features/customForms/utils/fieldGridUtils';
import { getFieldModuleByType } from '../fields/registry';
import type { FieldRenderContext } from '../fields/types';

interface FormFieldsRendererProps {
  fields: FormField[];
  context: FieldRenderContext;
  rowHeightPx?: number;
  values?: FormFieldValues;
  onValueChange?: (fieldId: string, value: FormFieldValues[string]) => void;
  disabled?: boolean;
}

export const FormFieldsRenderer = ({
  fields,
  context,
  rowHeightPx = 60,
  values = {},
  onValueChange,
  disabled,
}: FormFieldsRendererProps) => {
  const normalized = ensureFieldLayouts(fields);
  const maxRow = normalized.reduce(
    (m, f) => Math.max(m, f.layout.gridRowStart + f.layout.rowSpan),
    1
  );

  return (
    <div
      className="relative w-full grid grid-cols-12 gap-0"
      style={{
        gridAutoRows: `${rowHeightPx}px`,
        minHeight: maxRow * rowHeightPx,
      }}
    >
      {normalized.map((field) => {
        const mod = getFieldModuleByType(field.type);
        if (!mod) return null;
        const { RenderComponent } = mod;
        return (
          <div
            key={field.id}
            className="p-2 min-h-0 overflow-hidden"
            style={layoutToGridStyle(field.layout)}
          >
            <RenderComponent
              field={field}
              context={context}
              value={values[field.id]}
              onChange={(v) => onValueChange?.(field.id, v)}
              disabled={disabled}
            />
          </div>
        );
      })}
    </div>
  );
};
