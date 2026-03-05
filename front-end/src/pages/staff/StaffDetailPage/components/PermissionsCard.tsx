import { Shield } from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { CardTitle } from "../../../../components/common/CardTitle";
import { PermissionsCardProps } from "../types";
import { PERMISSIONS } from "../constants";

export const PermissionsCard = ({ permissions, isEditing, onPermissionChange }: PermissionsCardProps) => {
  return (
    <Card className="p-6 bg-[var(--glass-bg)] border-[var(--glass-border)]">
      <CardTitle title="Permissions" icon={Shield} />
      <div className="space-y-2">
        {PERMISSIONS.map((permission) => (
          <label key={permission.id} className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={permissions.includes(permission.id)}
              onChange={(e) => onPermissionChange(permission.id, e.target.checked)}
              disabled={!isEditing}
              className="rounded border-[var(--glass-border)] text-[var(--accent-primary)] focus:ring-[var(--accent-primary)] w-4 h-4"
            />
            <span className="text-foreground text-sm">{permission.label}</span>
          </label>
        ))}
      </div>
    </Card>
  );
};
