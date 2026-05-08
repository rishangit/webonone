import { Edit2, Save, X, Mail, Phone, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DateDisplay } from "@/components/common/DateDisplay";
import { formatAvatarUrl } from "../../../../utils";
import { StaffDetailHeaderProps } from "../types";
import { getStatusColor } from "../utils";

export const StaffDetailHeader = ({ 
  staff, 
  userInfo, 
  isEditing, 
  onEdit, 
  onCancel, 
  onSave 
}: StaffDetailHeaderProps) => {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Staff Details</h1>
        {!isEditing ? (
          <Button
            onClick={onEdit}
            className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:from-[var(--accent-primary-hover)] hover:to-[var(--accent-primary)] text-[var(--accent-button-text)] shadow-lg shadow-[var(--accent-primary)]/25"
          >
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </Button>
        ) : (
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={onCancel}
              className="border-[var(--glass-border)] bg-[var(--input-background)] hover:bg-[var(--accent-bg)] hover:border-[var(--accent-border)] hover:text-[var(--accent-text)] text-foreground transition-all duration-200"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={onSave}
              className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:from-[var(--accent-primary-hover)] hover:to-[var(--accent-primary)] text-[var(--accent-button-text)] shadow-lg shadow-[var(--accent-primary)]/25"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        )}
      </div>

      <Card className="p-6 bg-[var(--glass-bg)] border-[var(--glass-border)]">
        <div className="flex items-start gap-4">
          <Avatar className="w-20 h-20">
            <AvatarImage 
              src={formatAvatarUrl(staff.avatar, staff.firstName, staff.lastName)} 
              alt={`${staff.firstName} ${staff.lastName}`}
            />
            <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)] text-xl">
              {staff.firstName?.[0]}{staff.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">
                  {staff.firstName} {staff.lastName}
                </h2>
                <p className="text-muted-foreground">{staff.email}</p>
              </div>
              <Badge className={getStatusColor(staff.status)}>
                {staff.status}
              </Badge>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="w-4 h-4" />
                <span>{staff.email}</span>
              </div>
              {staff.phone && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{staff.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Joined <DateDisplay date={staff.joinDate || staff.createdAt} /></span>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </>
  );
};
