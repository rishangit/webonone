import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { formatAvatarUrl } from "../../../utils";
import { UserForSelection } from "./types";

interface SelectedUserSummaryProps {
  user: UserForSelection;
}

export const SelectedUserSummary = ({ user }: SelectedUserSummaryProps) => {
  return (
    <div className="p-3 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)]">
      <div className="flex items-center gap-3">
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage 
            src={formatAvatarUrl(user.avatar, user.firstName, user.lastName)} 
            alt={user.name}
          />
          <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)] text-xs">
            {user.name.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-foreground text-sm truncate">{user.name}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
      </div>
    </div>
  );
};
