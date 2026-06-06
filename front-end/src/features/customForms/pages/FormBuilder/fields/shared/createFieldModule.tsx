import { useEffect, useState } from 'react';
import { useForm, type Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { nanoid } from 'nanoid';
import { Save } from 'lucide-react';
import { CustomDialog } from '@/components/ui/custom-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type {
  FormField,
  FormFieldType,
  FormFieldValidation,
} from '@/features/customForms/types';
import type { FieldEditProps, FieldModule, FieldRenderProps } from '../types';
import { OptionsListEditor } from './OptionsListEditor';

const defaultLayout = () => ({
  gridRowStart: 1,
  gridColumnStart: 1,
  rowSpan: 2,
  colSpan: 6,
});

export function createDefaultField(
  type: FormFieldType,
  label: string,
  extra?: Partial<FormField>
): FormField {
  return {
    id: nanoid(10),
    type,
    label,
    placeholder: '',
    required: false,
    validation: {},
    layout: defaultLayout(),
    zIndex: 0,
    options: type === 'dropdown' || type === 'radio' ? [
      { id: nanoid(6), label: 'Option 1', value: 'option_1' },
      { id: nanoid(6), label: 'Option 2', value: 'option_2' },
    ] : [],
    display: 'vertical',
    ...extra,
  };
}

const settingsSchema = yup.object({
  label: yup.string().required('Label is required'),
  placeholder: yup.string().optional(),
  required: yup.boolean().optional(),
  minLength: yup.number().optional().nullable(),
  maxLength: yup.number().optional().nullable(),
  min: yup.number().optional().nullable(),
  max: yup.number().optional().nullable(),
  pattern: yup.string().optional().nullable(),
  display: yup.string().oneOf(['inline', 'vertical']).optional(),
});

type SettingsValues = yup.InferType<typeof settingsSchema>;

function FieldSettingsDialog({
  field,
  open,
  onOpenChange,
  onSave,
  showPlaceholder = true,
  showValidation = true,
  showOptions = false,
  showDisplay = false,
  title,
}: FieldEditProps & {
  showPlaceholder?: boolean;
  showValidation?: boolean;
  showOptions?: boolean;
  showDisplay?: boolean;
  title: string;
}) {
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<SettingsValues>({
    resolver: yupResolver(settingsSchema) as Resolver<SettingsValues>,
  });
  const [options, setOptions] = useState(field.options ?? []);
  const required = !!watch('required');
  const display = watch('display') || field.display || 'vertical';

  useEffect(() => {
    if (open) {
      reset({
        label: field.label,
        placeholder: field.placeholder ?? '',
        required: field.required ?? false,
        minLength: field.validation?.minLength ?? null,
        maxLength: field.validation?.maxLength ?? null,
        min: field.validation?.min ?? null,
        max: field.validation?.max ?? null,
        pattern: field.validation?.pattern ?? '',
        display: field.display ?? 'vertical',
      });
      setOptions(field.options ?? []);
    }
  }, [open, field, reset]);

  const onSubmit = (data: SettingsValues) => {
    const validation: FormFieldValidation = {
      minLength: data.minLength ?? undefined,
      maxLength: data.maxLength ?? undefined,
      min: data.min ?? undefined,
      max: data.max ?? undefined,
      pattern: data.pattern || null,
    };
    onSave({
      ...field,
      label: data.label,
      placeholder: data.placeholder,
      required: data.required,
      validation,
      options: showOptions ? options : field.options,
      display: showDisplay ? (data.display as 'inline' | 'vertical') : field.display,
    });
    onOpenChange(false);
  };

  return (
    <CustomDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description="Configure field label, validation, and options."
      footer={
        <>
          <Button type="button" variant="outline" className="h-10 px-4 border-[var(--glass-border)]" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" variant="accent" className="h-10" onClick={handleSubmit(onSubmit)}>
            <Save className="w-4 h-4 mr-2" />
            OK
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <Label>Label</Label>
          <Input className="mt-1 bg-[var(--input-background)] border-[var(--glass-border)]" {...register('label')} />
          {errors.label && <p className="text-sm text-destructive">{errors.label.message}</p>}
        </div>
        {showPlaceholder && (
          <div>
            <Label>Placeholder</Label>
            <Input className="mt-1 bg-[var(--input-background)] border-[var(--glass-border)]" {...register('placeholder')} />
          </div>
        )}
        <div className="flex items-center gap-2">
          <Checkbox checked={required} onCheckedChange={(v) => setValue('required', Boolean(v))} />
          <Label>Required</Label>
        </div>
        {showOptions && <OptionsListEditor options={options} onChange={setOptions} />}
        {showDisplay && (
          <div>
            <Label>Display</Label>
            <Select value={display} onValueChange={(v) => setValue('display', v as 'inline' | 'vertical')}>
              <SelectTrigger className="mt-1 bg-[var(--input-background)] border-[var(--glass-border)]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vertical">Vertical</SelectItem>
                <SelectItem value="inline">Inline</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        {showValidation && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Min length</Label>
              <Input type="number" className="mt-1 bg-[var(--input-background)] border-[var(--glass-border)]" {...register('minLength')} />
            </div>
            <div>
              <Label>Max length</Label>
              <Input type="number" className="mt-1 bg-[var(--input-background)] border-[var(--glass-border)]" {...register('maxLength')} />
            </div>
            <div>
              <Label>Min value</Label>
              <Input type="number" className="mt-1 bg-[var(--input-background)] border-[var(--glass-border)]" {...register('min')} />
            </div>
            <div>
              <Label>Max value</Label>
              <Input type="number" className="mt-1 bg-[var(--input-background)] border-[var(--glass-border)]" {...register('max')} />
            </div>
            <div className="col-span-2">
              <Label>Pattern (regex)</Label>
              <Input className="mt-1 bg-[var(--input-background)] border-[var(--glass-border)]" {...register('pattern')} />
            </div>
          </div>
        )}
      </div>
    </CustomDialog>
  );
}

function TextLikeRender({ field, context, value, onChange, disabled, multiline }: FieldRenderProps & { multiline?: boolean }) {
  const isFill = context === 'fill';
  const strVal = value != null ? String(value) : '';
  const labelEl = (
    <Label className="text-sm font-medium">
      {field.label}
      {field.required && <span className="text-destructive ml-0.5">*</span>}
    </Label>
  );

  if (isFill) {
    return (
      <div className="space-y-1.5">
        {labelEl}
        {multiline ? (
          <Textarea
            value={strVal}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled}
            className="bg-[var(--input-background)] border-[var(--glass-border)]"
          />
        ) : (
          <Input
            value={strVal}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={field.placeholder}
            disabled={disabled}
            className="bg-[var(--input-background)] border-[var(--glass-border)]"
          />
        )}
      </div>
    );
  }

  return (
    <div className="space-y-1.5 pointer-events-none">
      {labelEl}
      {multiline ? (
        <Textarea placeholder={field.placeholder || field.label} disabled className="bg-[var(--input-background)] border-[var(--glass-border)]" />
      ) : (
        <Input placeholder={field.placeholder || field.label} disabled className="bg-[var(--input-background)] border-[var(--glass-border)]" />
      )}
    </div>
  );
}

export function buildTextModule(type: 'text' | 'textarea' | 'number' | 'date', label: string, description: string): FieldModule {
  const multiline = type === 'textarea';
  const isNumber = type === 'number';
  const isDate = type === 'date';

  const Render = (props: FieldRenderProps) => {
    if (isNumber) {
      const numVal = props.value != null ? String(props.value) : '';
      if (props.context === 'fill') {
        return (
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              {props.field.label}
              {props.field.required && <span className="text-destructive ml-0.5">*</span>}
            </Label>
            <Input
              type="number"
              value={numVal}
              onChange={(e) => props.onChange?.(e.target.value === '' ? null : Number(e.target.value))}
              placeholder={props.field.placeholder}
              className="bg-[var(--input-background)] border-[var(--glass-border)]"
            />
          </div>
        );
      }
      return <TextLikeRender {...props} />;
    }
    if (isDate) {
      if (props.context === 'fill') {
        return (
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">
              {props.field.label}
              {props.field.required && <span className="text-destructive ml-0.5">*</span>}
            </Label>
            <Input
              type="date"
              value={props.value != null ? String(props.value) : ''}
              onChange={(e) => props.onChange?.(e.target.value)}
              className="bg-[var(--input-background)] border-[var(--glass-border)]"
            />
          </div>
        );
      }
      return (
        <div className="space-y-1.5 pointer-events-none">
          <Label>{props.field.label}</Label>
          <Input type="date" disabled className="bg-[var(--input-background)] border-[var(--glass-border)]" />
        </div>
      );
    }
    return <TextLikeRender {...props} multiline={multiline} />;
  };

  const Edit = (props: FieldEditProps) => (
    <FieldSettingsDialog {...props} title={`${label} settings`} showValidation={!isDate} showPlaceholder />
  );

  return {
    type,
    label,
    description,
    createDefaultField: () => createDefaultField(type, label),
    RenderComponent: Render,
    EditComponent: Edit,
  };
}

function CheckboxRender({ field, context, value, onChange }: FieldRenderProps) {
  const checked = Boolean(value);
  if (context === 'fill') {
    return (
      <div className="flex items-center gap-2">
        <Checkbox checked={checked} onCheckedChange={(v) => onChange?.(Boolean(v))} />
        <Label>
          {field.label}
          {field.required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 pointer-events-none">
      <Checkbox checked={false} disabled />
      <Label>{field.label}</Label>
    </div>
  );
}

function ChoiceRender({ field, context, value, onChange, variant }: FieldRenderProps & { variant: 'radio' | 'dropdown' }) {
  const options = field.options ?? [];
  const isInline = field.display === 'inline';

  if (context === 'fill') {
    if (variant === 'dropdown') {
      return (
        <div className="space-y-1.5">
          <Label>
            {field.label}
            {field.required && <span className="text-destructive ml-0.5">*</span>}
          </Label>
          <Select value={value != null ? String(value) : ''} onValueChange={(v) => onChange?.(v)}>
            <SelectTrigger className="bg-[var(--input-background)] border-[var(--glass-border)]">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {options.map((o) => (
                <SelectItem key={o.id} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      );
    }
    return (
      <div className="space-y-2">
        <Label>
          {field.label}
          {field.required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
        <div className={isInline ? 'flex flex-wrap gap-4' : 'space-y-2'}>
          {options.map((o) => (
            <label key={o.id} className="flex items-center gap-2 text-sm">
              <input
                type="radio"
                name={field.id}
                checked={value === o.value}
                onChange={() => onChange?.(o.value)}
              />
              {o.label}
            </label>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'dropdown') {
    return (
      <div className="space-y-1.5 pointer-events-none">
        <Label>{field.label}</Label>
        <Select disabled>
          <SelectTrigger className="bg-[var(--input-background)] border-[var(--glass-border)]">
            <SelectValue placeholder="Dropdown" />
          </SelectTrigger>
        </Select>
      </div>
    );
  }

  return (
    <div className="space-y-2 pointer-events-none">
      <Label>{field.label}</Label>
      <div className={isInline ? 'flex flex-wrap gap-4' : 'space-y-2'}>
        {options.map((o) => (
          <span key={o.id} className="text-sm text-muted-foreground">
            ○ {o.label}
          </span>
        ))}
      </div>
    </div>
  );
}

export const textFieldModule = buildTextModule('text', 'Text Field', 'Single-line text input');
export const textareaFieldModule = buildTextModule('textarea', 'Text Area', 'Multi-line text');
export const numberFieldModule = buildTextModule('number', 'Number Input', 'Numeric input');
export const dateFieldModule = buildTextModule('date', 'Date Picker', 'Date selection');

export const checkboxFieldModule: FieldModule = {
  type: 'checkbox',
  label: 'Checkbox',
  description: 'Yes/no checkbox',
  createDefaultField: () => createDefaultField('checkbox', 'Checkbox'),
  RenderComponent: CheckboxRender,
  EditComponent: (props) => (
    <FieldSettingsDialog {...props} title="Checkbox settings" showPlaceholder={false} showValidation={false} />
  ),
};

export const radioFieldModule: FieldModule = {
  type: 'radio',
  label: 'Radio Button',
  description: 'Single choice from options',
  createDefaultField: () => createDefaultField('radio', 'Radio Button'),
  RenderComponent: (p) => <ChoiceRender {...p} variant="radio" />,
  EditComponent: (props) => (
    <FieldSettingsDialog {...props} title="Radio settings" showPlaceholder={false} showOptions showDisplay showValidation={false} />
  ),
};

export const dropdownFieldModule: FieldModule = {
  type: 'dropdown',
  label: 'Dropdown',
  description: 'Select from a list',
  createDefaultField: () => createDefaultField('dropdown', 'Dropdown'),
  RenderComponent: (p) => <ChoiceRender {...p} variant="dropdown" />,
  EditComponent: (props) => (
    <FieldSettingsDialog {...props} title="Dropdown settings" showPlaceholder={false} showOptions showValidation={false} />
  ),
};
