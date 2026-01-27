import { useState, useEffect } from "react";
import { User } from "lucide-react";
import { CustomDialog } from "../ui/custom-dialog";
import { UserSelector } from "./UserSelector";
import { User as UserType } from "../../types/user";

interface UserSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string | null;
  onChange: (userId: string | null) => void;
  users: UserType[];
  title?: string;
  description?: string;
  placeholder?: string;
  allowClear?: boolean;
  error?: boolean;
}

export const UserSelectionDialog = ({
  open,
  onOpenChange,
  value,
  onChange,
  users,
  title = "Select Customer",
  description = "Choose a customer from the list",
  placeholder = "Select a customer",
  allowClear = true,
  error = false,
}: UserSelectionDialogProps) => {
  const [tempValue, setTempValue] = useState<string | null>(value);

  // Sync tempValue with value prop when dialog opens or value changes
  useEffect(() => {
    if (open) {
      setTempValue(value);
    }
  }, [open, value]);

  const handleSelect = (userId: string | null) => {
    setTempValue(userId);
    onChange(userId);
    if (userId) {
      onOpenChange(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset temp value when closing
      setTempValue(value);
    }
    onOpenChange(newOpen);
  };

  return (
    <CustomDialog
      open={open}
      onOpenChange={handleOpenChange}
      title={title}
      description={description}
      icon={<User className="w-5 h-5" />}
      maxWidth="max-w-2xl"
    >
      <div className="space-y-4 pb-6">
        <UserSelector
          value={tempValue}
          onChange={handleSelect}
          users={users}
          placeholder={placeholder}
          allowClear={allowClear}
          error={error}
        />
      </div>
    </CustomDialog>
  );
};
