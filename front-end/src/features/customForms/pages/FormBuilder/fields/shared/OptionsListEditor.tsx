import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { nanoid } from 'nanoid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { FormFieldOption } from '@/features/customForms/types';

interface OptionsListEditorProps {
  options: FormFieldOption[];
  onChange: (options: FormFieldOption[]) => void;
}

export const OptionsListEditor = ({ options, onChange }: OptionsListEditorProps) => {
  const update = (index: number, patch: Partial<FormFieldOption>) => {
    const next = options.map((o, i) => (i === index ? { ...o, ...patch } : o));
    onChange(next);
  };

  const move = (index: number, dir: -1 | 1) => {
    const j = index + dir;
    if (j < 0 || j >= options.length) return;
    const next = [...options];
    [next[index], next[j]] = [next[j], next[index]];
    onChange(next);
  };

  const remove = (index: number) => {
    onChange(options.filter((_, i) => i !== index));
  };

  const add = () => {
    const id = nanoid(6);
    onChange([...options, { id, label: `Option ${options.length + 1}`, value: `option_${options.length + 1}` }]);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>Options</Label>
        <Button type="button" variant="ghost" size="sm" onClick={add}>
          <Plus className="w-3 h-3 mr-1" />
          Add
        </Button>
      </div>
      {options.map((opt, index) => (
        <div key={opt.id} className="flex gap-2 items-start">
          <Input
            value={opt.label}
            onChange={(e) => {
              const label = e.target.value;
              update(index, { label, value: label.toLowerCase().replace(/\s+/g, '_') || opt.value });
            }}
            className="flex-1 bg-[var(--input-background)] border-[var(--glass-border)]"
            placeholder="Label"
          />
          <div className="flex flex-col gap-0.5">
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => move(index, -1)}>
              <ChevronUp className="w-4 h-4" />
            </Button>
            <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => move(index, 1)}>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-600 dark:text-red-400"
            onClick={() => remove(index)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};
