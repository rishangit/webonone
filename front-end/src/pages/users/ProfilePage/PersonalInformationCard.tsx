import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Save, X, User, Edit, AlertCircle } from "lucide-react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import { PhoneInput } from "../../../components/common/PhoneInput";
import { DatePicker } from "../../../components/common/DatePicker";
import { DateDisplay } from "../../../components/common/DateDisplay";
import { User as UserType } from "../../../types/user";
import { profileUpdateSchema, ProfileUpdateFormData } from "../../../schemas/profileValidation";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import { updateProfileRequest } from "../../../store/slices/profileSlice";

interface PersonalInformationCardProps {
  user: UserType;
  userId?: string;
}

export const PersonalInformationCard = ({ user, userId }: PersonalInformationCardProps) => {
  const dispatch = useAppDispatch();
  const { isUpdating } = useAppSelector((state) => state.profile);
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
    trigger,
    control
  } = useForm<ProfileUpdateFormData>({
    resolver: yupResolver(profileUpdateSchema) as any,
    defaultValues: {
      firstName: user?.firstName || undefined,
      lastName: user?.lastName || undefined,
      email: user?.email || undefined,
      phone: user?.phone || undefined,
      address: user?.address || undefined,
      dateOfBirth: user?.dateOfBirth ? (typeof user.dateOfBirth === 'string' 
        ? user.dateOfBirth.split('T')[0] 
        : (() => {
            const date = new Date(user.dateOfBirth);
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
          })()) : undefined,
    },
    mode: 'onBlur',
    reValidateMode: 'onChange'
  });

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        email: user.email || undefined,
        phone: user.phone || undefined,
        address: user.address || undefined,
        dateOfBirth: user.dateOfBirth ? (typeof user.dateOfBirth === 'string' ? user.dateOfBirth.split('T')[0] : new Date(user.dateOfBirth).toISOString().split('T')[0]) : undefined,
      });
    }
  }, [user, reset]);

  const onSubmit = (data: ProfileUpdateFormData) => {
    if (user) {
      const updateData: Partial<typeof user> = {
        firstName: data.firstName || undefined,
        lastName: data.lastName || undefined,
        email: data.email || undefined,
        phone: data.phone || undefined,
        address: data.address || undefined,
        dateOfBirth: data.dateOfBirth ? (typeof data.dateOfBirth === 'string' ? data.dateOfBirth : (() => {
          const date = data.dateOfBirth as Date;
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}-${month}-${day}`;
        })()) : undefined,
      };

      dispatch(updateProfileRequest(updateData));
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    reset();
    setIsEditing(false);
  };

  return (
    <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-foreground flex items-center gap-2">
          <User className="w-5 h-5 text-[var(--accent-text)]" />
          Personal Information
        </h3>
        {!userId && !isEditing && (
          <Button 
            onClick={() => setIsEditing(true)} 
            size="sm"
            className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:from-[var(--accent-primary-hover)] hover:to-[var(--accent-primary)] text-[var(--accent-button-text)] shadow-lg shadow-[var(--accent-primary)]/25 transition-all duration-200"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>
      {isEditing && !userId ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-muted-foreground">First Name <span className="text-red-500">*</span></Label>
              <Input
                id="firstName"
                {...register('firstName')}
                disabled={isUpdating}
                placeholder="Enter your first name"
                className={`bg-[var(--input-background)] border-[var(--glass-border)] ${errors.firstName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              />
              {errors.firstName && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.firstName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-muted-foreground">Last Name <span className="text-red-500">*</span></Label>
              <Input
                id="lastName"
                {...register('lastName')}
                disabled={isUpdating}
                placeholder="Enter your last name"
                className={`bg-[var(--input-background)] border-[var(--glass-border)] ${errors.lastName ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
              />
              {errors.lastName && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-muted-foreground">Email Address <span className="text-red-500">*</span></Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              disabled={isUpdating}
              placeholder="Enter your email address"
              className={`bg-[var(--input-background)] border-[var(--glass-border)] ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-muted-foreground">Phone Number <span className="text-red-500">*</span></Label>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <PhoneInput
                  id="phone"
                  value={field.value || ""}
                  onChange={(value) => {
                    field.onChange(value);
                    trigger('phone');
                  }}
                  onBlur={field.onBlur}
                  disabled={isUpdating}
                  placeholder="Enter phone number"
                  error={!!errors.phone}
                />
              )}
            />
            {errors.phone && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.phone.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address" className="text-muted-foreground">Address</Label>
            <Input
              id="address"
              {...register('address')}
              disabled={isUpdating}
              placeholder="Enter your address"
              className={`bg-[var(--input-background)] border-[var(--glass-border)] ${errors.address ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
            />
            {errors.address && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.address.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateOfBirth" className="text-muted-foreground">Date of Birth</Label>
            <Controller
              name="dateOfBirth"
              control={control}
              render={({ field }) => (
                <DatePicker
                  id="dateOfBirth"
                  value={field.value || undefined}
                  onChange={(date) => {
                    if (date) {
                      const year = date.getFullYear();
                      const month = String(date.getMonth() + 1).padStart(2, '0');
                      const day = String(date.getDate()).padStart(2, '0');
                      field.onChange(`${year}-${month}-${day}`);
                    } else {
                      field.onChange(undefined);
                    }
                    trigger('dateOfBirth');
                  }}
                  onBlur={field.onBlur}
                  disabled={isUpdating}
                  placeholder="Select date of birth"
                  maxDate={new Date()}
                  error={!!errors.dateOfBirth}
                />
              )}
            />
            {errors.dateOfBirth && (
              <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3" />
                {errors.dateOfBirth.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              disabled={isUpdating}
              className="border-[var(--glass-border)] bg-[var(--input-background)] hover:bg-[var(--accent-bg)] hover:border-[var(--accent-border)] hover:text-[var(--accent-text)] transition-all duration-200"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUpdating || !isDirty}
              className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:from-[var(--accent-primary-hover)] hover:to-[var(--accent-primary)] text-[var(--accent-button-text)] shadow-lg shadow-[var(--accent-primary)]/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              <Save className="w-4 h-4 mr-2" />
              {isUpdating ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">First Name</Label>
              <p className="text-foreground">{user?.firstName || 'Not provided'}</p>
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Last Name</Label>
              <p className="text-foreground">{user?.lastName || 'Not provided'}</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Email Address</Label>
            <p className="text-foreground">{user?.email}</p>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Phone Number</Label>
            <p className="text-foreground">{user?.phone || 'Not provided'}</p>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Address</Label>
            <p className="text-foreground">{user?.address || 'Not provided'}</p>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Date of Birth</Label>
            <p className="text-foreground">
              <DateDisplay date={user?.dateOfBirth} fallback="Not provided" />
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};
