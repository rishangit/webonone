import { User } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DatePicker } from "@/components/common/DatePicker";
import { UserSelectionDialog } from "@/components/common/UserSelectionDialog";
import { Controller } from "react-hook-form";
import { formatAvatarUrl } from "../../../../../utils";
import { X } from "lucide-react";

interface StockFormFieldsProps {
  register: any;
  control: any;
  errors: any;
  users?: any[];
  isUserSelectionDialogOpen: boolean;
  onUserSelectionDialogOpen: (open: boolean) => void;
  formId?: string;
}

export const StockFormFields = ({
  register,
  control,
  errors,
  users,
  isUserSelectionDialogOpen,
  onUserSelectionDialogOpen,
  formId = "",
}: StockFormFieldsProps) => {
  const getDisplayName = (user: any) => {
    const firstName = user?.firstName || "";
    const lastName = user?.lastName || "";
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || user?.email || "Unknown User";
  };

  const getInitials = (user: any) => {
    const firstName = user?.firstName || "";
    const lastName = user?.lastName || "";
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (firstName) {
      return firstName[0].toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <Label htmlFor={`${formId}quantity`} className="text-foreground">
          Quantity <span className="text-[var(--accent-primary)]">*</span>
        </Label>
        <Input
          id={`${formId}quantity`}
          type="number"
          {...register("quantity")}
          className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground focus:border-[var(--accent-primary)] focus:ring-[var(--accent-primary)]/20"
          placeholder="Enter quantity"
        />
        {errors.quantity && (
          <p className="text-sm text-red-500">{errors.quantity.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${formId}batchNumber`} className="text-foreground">Batch Number</Label>
        <Input
          id={`${formId}batchNumber`}
          {...register("batchNumber")}
          className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground focus:border-[var(--accent-primary)] focus:ring-[var(--accent-primary)]/20"
          placeholder="Enter batch number"
        />
        {errors.batchNumber && (
          <p className="text-sm text-red-500">{errors.batchNumber.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${formId}costPrice`} className="text-foreground">
          Cost Price <span className="text-[var(--accent-primary)]">*</span>
        </Label>
        <Input
          id={`${formId}costPrice`}
          type="number"
          step="0.01"
          {...register("costPrice")}
          className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground focus:border-[var(--accent-primary)] focus:ring-[var(--accent-primary)]/20"
          placeholder="0.00"
        />
        {errors.costPrice && (
          <p className="text-sm text-red-500">{errors.costPrice.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${formId}sellPrice`} className="text-foreground">
          Sell Price
        </Label>
        <Input
          id={`${formId}sellPrice`}
          type="number"
          step="0.01"
          {...register("sellPrice")}
          className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground focus:border-[var(--accent-primary)] focus:ring-[var(--accent-primary)]/20"
          placeholder="0.00 (optional)"
        />
        {errors.sellPrice && (
          <p className="text-sm text-red-500">{errors.sellPrice.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-foreground">Purchase Date</Label>
        <Controller
          name="purchaseDate"
          control={control}
          render={({ field }) => (
            <DatePicker
              value={field.value || undefined}
              onChange={(date) => field.onChange(date || null)}
              placeholder="Select purchase date"
              className="w-full"
            />
          )}
        />
        {errors.purchaseDate && (
          <p className="text-sm text-red-500">{errors.purchaseDate.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label className="text-foreground">Expiry Date</Label>
        <Controller
          name="expiryDate"
          control={control}
          render={({ field }) => (
            <DatePicker
              value={field.value || undefined}
              onChange={(date) => field.onChange(date || null)}
              placeholder="Select expiry date"
              className="w-full"
            />
          )}
        />
        {errors.expiryDate && (
          <p className="text-sm text-red-500">{errors.expiryDate.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${formId}supplierId`} className="text-foreground">Supplier</Label>
        <Controller
          name="supplierId"
          control={control}
          render={({ field }) => {
            const selectedUser = users?.find((u) => String(u.id) === String(field.value || null));
            
            return (
              <div className="space-y-2">
                {selectedUser ? (
                  <div className="flex items-center gap-3 p-3 bg-[var(--input-background)] border border-[var(--glass-border)] rounded-md">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarImage
                        src={formatAvatarUrl(selectedUser.avatar, selectedUser.firstName, selectedUser.lastName)}
                        alt={getDisplayName(selectedUser)}
                      />
                      <AvatarFallback className="text-sm">
                        {getInitials(selectedUser)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-sm font-medium text-foreground truncate">
                        {getDisplayName(selectedUser)}
                      </span>
                      {selectedUser.email && (
                        <span className="text-xs text-muted-foreground truncate">
                          {selectedUser.email}
                        </span>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => field.onChange(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start bg-[var(--input-background)] border-[var(--glass-border)] text-foreground hover:bg-[var(--accent-bg)] hover:border-[var(--accent-border)]"
                    onClick={() => onUserSelectionDialogOpen(true)}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Select Supplier
                  </Button>
                )}
                <UserSelectionDialog
                  open={isUserSelectionDialogOpen}
                  onOpenChange={onUserSelectionDialogOpen}
                  value={field.value ?? null}
                  onChange={(userId) => field.onChange(userId)}
                  users={users || []}
                  title="Select Supplier"
                  description="Choose a supplier from the list"
                  placeholder="Select a supplier (optional)"
                  error={!!errors.supplierId}
                />
              </div>
            );
          }}
        />
        {errors.supplierId && (
          <p className="text-sm text-red-500">{errors.supplierId.message}</p>
        )}
      </div>
    </div>
  );
};
