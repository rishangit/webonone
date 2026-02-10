import { Card } from "../../../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import { CheckCircle, Mail, Phone, MapPin } from "lucide-react";
import { formatAvatarUrl } from "../../../utils";
import { UserForSelection } from "./types";

interface UserCardProps {
  user: UserForSelection;
  isSelected: boolean;
  onSelect: (user: UserForSelection) => void;
}

const getRoleColor = (role: string) => {
  const roleColors: Record<string, string> = {
    'Admin': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    'Manager': 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    'Staff': 'bg-green-500/10 text-green-600 border-green-500/20',
    'User': 'bg-gray-500/10 text-gray-600 border-gray-500/20',
  };
  return roleColors[role] || roleColors['User'];
};

const getStatusColor = (status: string) => {
  const statusColors: Record<string, string> = {
    'active': 'bg-green-500/10 text-green-600 border-green-500/20',
    'pending': 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    'inactive': 'bg-red-500/10 text-red-600 border-red-500/20',
  };
  return statusColors[status] || statusColors['inactive'];
};

export const UserCard = ({ user, isSelected, onSelect }: UserCardProps) => {
  return (
    <Card
      className={`cursor-pointer transition-all duration-200 p-3 ${
        isSelected
          ? 'border-[var(--accent-border)] bg-[var(--accent-bg)] ring-2 ring-[var(--accent-border)]'
          : 'border-[var(--glass-border)] bg-[var(--glass-bg)] hover:border-[var(--accent-border)]'
      }`}
      onClick={() => onSelect(user)}
    >
      <div className="flex items-center gap-3">
        <Avatar className="w-10 h-10 ring-2 ring-[var(--glass-border)] flex-shrink-0">
          <AvatarImage 
            src={formatAvatarUrl(user.avatar, user.firstName, user.lastName)} 
            alt={user.name}
          />
          <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)]">
            {user.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-medium text-foreground truncate text-sm">{user.name}</h3>
            {isSelected && (
              <CheckCircle className="w-4 h-4 text-[var(--accent-text)] flex-shrink-0" />
            )}
          </div>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <Mail className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              <span className="text-muted-foreground truncate">{user.email}</span>
            </div>
            {user.phone && (
              <div className="flex items-center gap-2 text-xs">
                <Phone className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">{user.phone}</span>
              </div>
            )}
            {user.location && (
              <div className="flex items-center gap-2 text-xs">
                <MapPin className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                <span className="text-muted-foreground">{user.location}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2 mt-2">
            <Badge className={`${getRoleColor(user.role)} border text-xs`}>
              {user.role}
            </Badge>
            <Badge className={`${getStatusColor(user.status)} border text-xs`}>
              {user.status}
            </Badge>
          </div>
        </div>
      </div>
    </Card>
  );
};
