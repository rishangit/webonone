import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TagSelector } from "@/shared/components/tags";
import { SERVICE_WIZARD_INPUT_SURFACE } from "../constants";

export interface CompanyBasicStepProps {
  name: string;
  description: string;
  tagIds: string[];
  onNameChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
  onTagIdsChange: (ids: string[]) => void;
}

export function CompanyBasicStep({
  name,
  description,
  tagIds,
  onNameChange,
  onDescriptionChange,
  onTagIdsChange,
}: CompanyBasicStepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label className="text-foreground">Service name *</Label>
        <Input value={name} onChange={(e) => onNameChange(e.target.value)} className={SERVICE_WIZARD_INPUT_SURFACE} />
      </div>
      <div className="space-y-2">
        <Label className="text-foreground">Description</Label>
        <Textarea
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
          className={SERVICE_WIZARD_INPUT_SURFACE}
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <Label className="text-foreground">Tags</Label>
        <TagSelector value={tagIds} onChange={onTagIdsChange} placeholder="Select tags" />
      </div>
    </div>
  );
}
