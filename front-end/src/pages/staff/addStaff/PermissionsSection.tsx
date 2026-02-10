import { Label } from "../../../components/ui/label";
import { defaultPermissions } from "./constants";

interface PermissionsSectionProps {
  permissions: string[];
  onPermissionChange: (permissionId: string, checked: boolean) => void;
}

export const PermissionsSection = ({ permissions, onPermissionChange }: PermissionsSectionProps) => {
  return (
    <div className="space-y-3">
      <Label className="text-sm">Basic Permissions</Label>
      <div className="space-y-2">
        {defaultPermissions.map((permission) => (
          <label key={permission.id} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={permissions.includes(permission.id)}
              onChange={(e) => onPermissionChange(permission.id, e.target.checked)}
              className="rounded border-[var(--glass-border)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)] w-4 h-4"
            />
            <span className="text-foreground text-sm">{permission.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};
