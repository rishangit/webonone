import { useState } from "react";
import { MoreVertical, Bell, Check, X, Clock, Users, Calendar, AlertTriangle, Info, CheckCircle, Star, Eye } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { DateDisplay } from "../../components/common/DateDisplay";

interface NotificationCardProps {
  notification: {
    id: string;
    type: 'appointment' | 'staff' | 'system' | 'payment' | 'reminder' | 'update' | 'alert';
    title: string;
    message: string;
    timestamp: string;
    isRead: boolean;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    sender?: {
      name: string;
      avatar?: string;
      role?: string;
    };
    relatedData?: {
      appointmentId?: string;
      userId?: string;
      companyId?: string;
    };
    actionRequired?: boolean;
    actionLabel?: string;
  };
  onMarkAsRead: (id: string) => void;
  onMarkAsUnread: (id: string) => void;
  onDelete: (id: string) => void;
  onAction?: (id: string, action: string) => void;
}

export function NotificationCard({
  notification,
  onMarkAsRead,
  onMarkAsUnread,
  onDelete,
  onAction
}: NotificationCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'appointment':
        return <Calendar className="w-5 h-5" />;
      case 'staff':
        return <Users className="w-5 h-5" />;
      case 'system':
        return <Info className="w-5 h-5" />;
      case 'payment':
        return <CheckCircle className="w-5 h-5" />;
      case 'reminder':
        return <Clock className="w-5 h-5" />;
      case 'update':
        return <Star className="w-5 h-5" />;
      case 'alert':
        return <AlertTriangle className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  const getNotificationIconColor = (type: string) => {
    switch (type) {
      case 'appointment':
        return "text-blue-600 dark:text-blue-400";
      case 'staff':
        return "text-green-600 dark:text-green-400";
      case 'system':
        return "text-gray-600 dark:text-gray-400";
      case 'payment':
        return "text-emerald-600 dark:text-emerald-400";
      case 'reminder':
        return "text-yellow-600 dark:text-yellow-400";
      case 'update':
        return "text-purple-600 dark:text-purple-400";
      case 'alert':
        return "text-red-600 dark:text-red-400";
      default:
        return "text-[var(--accent-text)]";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30";
      case 'high':
        return "bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30";
      case 'medium':
        return "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30";
      case 'low':
        return "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30";
      default:
        return "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'appointment':
        return "Appointment";
      case 'staff':
        return "Staff";
      case 'system':
        return "System";
      case 'payment':
        return "Payment";
      case 'reminder':
        return "Reminder";
      case 'update':
        return "Update";
      case 'alert':
        return "Alert";
      default:
        return "Notification";
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return <span>{diffInMinutes < 1 ? "Just now" : `${diffInMinutes}m ago`}</span>;
    } else if (diffInHours < 24) {
      return <span>{Math.floor(diffInHours)}h ago</span>;
    } else if (diffInHours < 48) {
      return <span>Yesterday</span>;
    } else {
      return <DateDisplay date={date} />;
    }
  };

  return (
    <Card 
      className={`p-4 md:p-6 backdrop-blur-xl transition-all duration-200 group ${
        notification.isRead 
          ? 'bg-[var(--glass-bg)] border-[var(--glass-border)]' 
          : 'bg-[var(--accent-bg)] border-[var(--accent-border)] shadow-md ring-1 ring-[var(--accent-primary)]/20'
      } hover:bg-accent/50 hover:border-[var(--accent-border)] hover:shadow-lg hover:shadow-[var(--glass-shadow)]`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex flex-col md:flex-row items-start gap-3 md:gap-4">
        {/* Top row for mobile: Icon + Title + Actions */}
        <div className="flex items-start gap-3 w-full md:w-auto">
          {/* Notification Icon */}
          <div className={`p-2 md:p-3 rounded-full shrink-0 transition-all duration-200 bg-[var(--accent-bg)] border border-[var(--accent-border)] ${getNotificationIconColor(notification.type)} group-hover:scale-110`}>
            {getNotificationIcon(notification.type)}
          </div>

          {/* Mobile: Title and Time */}
          <div className="flex-1 min-w-0 md:hidden">
            <h3 className={`text-sm font-medium ${notification.isRead ? 'text-foreground' : 'text-[var(--accent-text)]'} line-clamp-2 mb-1`}>
              {notification.title}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatTimestamp(notification.timestamp)}
              </span>
              {!notification.isRead && (
                <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)] shrink-0"></div>
              )}
            </div>
          </div>

          {/* Mobile: Actions dropdown - always visible */}
          <div className="md:hidden shrink-0">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 transition-all duration-200 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)]"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
                  {notification.isRead ? (
                    <DropdownMenuItem onClick={() => onMarkAsUnread(notification.id)} className="hover:bg-accent/50">
                      <Bell className="h-4 w-4 mr-2" />
                      Mark as Unread
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => onMarkAsRead(notification.id)} className="hover:bg-accent/50">
                      <Check className="h-4 w-4 mr-2" />
                      Mark as Read
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600 dark:text-red-400 hover:bg-red-500/10"
                    onClick={() => onDelete(notification.id)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
          </div>
        </div>

        {/* Desktop: Main Content */}
        <div className="hidden md:block flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <h3 className={`font-medium ${notification.isRead ? 'text-foreground' : 'text-[var(--accent-text)]'} truncate`}>
                {notification.title}
              </h3>
              <Badge className={`${getPriorityColor(notification.priority)} text-xs`} variant="outline">
                {notification.priority}
              </Badge>
              <Badge variant="outline" className="text-muted-foreground text-xs">
                {getTypeLabel(notification.type)}
              </Badge>
            </div>
            
            <div className="flex items-center gap-2 shrink-0 ml-4">
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {formatTimestamp(notification.timestamp)}
              </span>
              
              {/* Unread indicator */}
              {!notification.isRead && (
                <div className="w-2 h-2 rounded-full bg-[var(--accent-primary)] shrink-0"></div>
              )}

              {/* Actions dropdown - Desktop */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 transition-all duration-200 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)]"
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
                  {notification.isRead ? (
                    <DropdownMenuItem onClick={() => onMarkAsUnread(notification.id)} className="hover:bg-accent/50">
                      <Bell className="h-4 w-4 mr-2" />
                      Mark as Unread
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={() => onMarkAsRead(notification.id)} className="hover:bg-accent/50">
                      <Check className="h-4 w-4 mr-2" />
                      Mark as Read
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600 dark:text-red-400 hover:bg-red-500/10"
                    onClick={() => onDelete(notification.id)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Message */}
          <p className={`text-sm mb-3 ${notification.isRead ? 'text-muted-foreground' : 'text-foreground'} leading-relaxed`}>
            {notification.message}
          </p>

          {/* Sender Information */}
          {notification.sender && (
            <div className="flex items-center gap-2 mb-3">
              <Avatar className="w-6 h-6">
                <AvatarImage src={notification.sender.avatar} alt={notification.sender.name} />
                <AvatarFallback className="text-xs bg-[var(--accent-bg)] text-[var(--accent-text)]">
                  {notification.sender.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>{notification.sender.name}</span>
                {notification.sender.role && (
                  <>
                    <span>•</span>
                    <span>{notification.sender.role}</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Action Button - Desktop */}
          {notification.actionRequired && notification.actionLabel && onAction && (
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[var(--glass-border)]">
              <Button 
                size="sm" 
                onClick={() => onAction(notification.id, 'primary')}
                className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:from-[var(--accent-primary-hover)] hover:to-[var(--accent-primary)] text-[var(--accent-button-text)] shadow-sm"
              >
                {notification.actionLabel}
              </Button>
              {notification.type === 'appointment' && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onAction(notification.id, 'secondary')}
                  className="bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-[var(--accent-bg)]"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View Details
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Mobile: Content Section */}
        <div className="md:hidden w-full space-y-3">
          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={`${getPriorityColor(notification.priority)} text-xs`} variant="outline">
              {notification.priority}
            </Badge>
            <Badge variant="outline" className="text-muted-foreground text-xs">
              {getTypeLabel(notification.type)}
            </Badge>
          </div>

          {/* Message */}
          <p className={`text-sm ${notification.isRead ? 'text-muted-foreground' : 'text-foreground'} leading-relaxed`}>
            {notification.message}
          </p>

          {/* Sender Information */}
          {notification.sender && (
            <div className="flex items-center gap-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src={notification.sender.avatar} alt={notification.sender.name} />
                <AvatarFallback className="text-xs bg-[var(--accent-bg)] text-[var(--accent-text)]">
                  {notification.sender.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>{notification.sender.name}</span>
                {notification.sender.role && (
                  <>
                    <span>•</span>
                    <span>{notification.sender.role}</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Action Button - Mobile */}
          {notification.actionRequired && notification.actionLabel && onAction && (
            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-[var(--glass-border)]">
              <Button 
                size="sm" 
                onClick={() => onAction(notification.id, 'primary')}
                className="w-full sm:w-auto bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:from-[var(--accent-primary-hover)] hover:to-[var(--accent-primary)] text-[var(--accent-button-text)] shadow-sm"
              >
                {notification.actionLabel}
              </Button>
              {notification.type === 'appointment' && (
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onAction(notification.id, 'secondary')}
                  className="w-full sm:w-auto bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-[var(--accent-bg)]"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  View Details
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}