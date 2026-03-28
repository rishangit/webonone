import { useState, useEffect, useMemo } from "react";
import { Check, User } from "lucide-react";
import { CustomDialog } from "../ui/custom-dialog";
import { User as UserType } from "@/types/user";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { formatAvatarUrl } from "@/utils";
import { cn } from "../ui/utils";
import { SearchInput } from "./SearchInput";

interface UserSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value: string | null;
  onChange: (userId: string | null) => void;
  users: UserType[];
  title?: string;
  description?: string;
  placeholder?: string;
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
  error = false,
}: UserSelectionDialogProps) => {
  const [tempValue, setTempValue] = useState<string | null>(value);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (open) {
      setTempValue(value);
      setSearchTerm("");
    }
  }, [open, value]);

  const filteredUsers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return users;

    return users.filter((user) => {
      const firstName = (user.firstName || "").toLowerCase();
      const lastName = (user.lastName || "").toLowerCase();
      const email = (user.email || "").toLowerCase();
      const fullName = `${firstName} ${lastName}`.trim();
      return (
        fullName.includes(query) ||
        firstName.includes(query) ||
        lastName.includes(query) ||
        email.includes(query)
      );
    });
  }, [users, searchTerm]);

  const getDisplayName = (user: UserType) => {
    const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    return fullName || user.email || "Unknown User";
  };

  const getInitials = (user: UserType) => {
    const firstName = user.firstName || "";
    const lastName = user.lastName || "";
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) return firstName[0].toUpperCase();
    if (user.email) return user.email[0].toUpperCase();
    return "U";
  };

  const handleSelect = (userId: string) => {
    setTempValue(userId);
  };

  const handleConfirm = () => {
    onChange(tempValue);
    onOpenChange(false);
  };

  return (
    <CustomDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      icon={<User className="w-5 h-5" />}
      sizeWidth="small"
      sizeHeight="medium"
      footer={
        <>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="accent"
            onClick={handleConfirm}
            disabled={!tempValue}
          >
            Select User
          </Button>
        </>
      }
    >
      <div className="space-y-4 h-full flex flex-col">
        <div className="relative">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder={placeholder || "Search users..."}
            className={cn(
              "bg-[var(--input-background)] border-[var(--glass-border)] text-foreground",
              error && "border-red-500 focus-visible:ring-red-500"
            )}
          />
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar border border-[var(--glass-border)] rounded-md bg-[var(--glass-bg)]">
          {filteredUsers.length === 0 ? (
            <div className="p-4 text-sm text-center text-muted-foreground">
              {searchTerm ? "No users found for this search." : "No users available."}
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {filteredUsers.map((user) => {
                const isSelected = String(user.id) === String(tempValue);
                return (
                  <button
                    key={String(user.id)}
                    type="button"
                    onClick={() => handleSelect(String(user.id))}
                    className={cn(
                      "w-full text-left flex items-center gap-3 p-2 rounded-md border transition-colors",
                      isSelected
                        ? "bg-[var(--accent-bg)] border-[var(--accent-border)]"
                        : "bg-transparent border-transparent hover:bg-[var(--accent-bg)]/60"
                    )}
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={formatAvatarUrl(user.avatar, user.firstName, user.lastName)}
                        alt={getDisplayName(user)}
                      />
                      <AvatarFallback className="text-xs">
                        {getInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground truncate">{getDisplayName(user)}</p>
                      {user.email && (
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                      )}
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-[var(--accent-text)] shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </CustomDialog>
  );
};
