import { useState } from "react";
import { Calendar, User, Building, Package, MapPin, Bell, Users, CreditCard, MoreVertical, Eye, ExternalLink } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";

interface SearchResult {
  id: string;
  type: 'user' | 'appointment' | 'notification' | 'product' | 'service' | 'company' | 'staff' | 'space' | 'category';
  title: string;
  subtitle?: string;
  description: string;
  avatar?: string;
  status?: string;
  metadata?: {
    date?: string;
    time?: string;
    location?: string;
    price?: number;
    category?: string;
    tags?: string[];
  };
  relevanceScore?: number;
}

interface SearchResultCardProps {
  result: SearchResult;
  searchQuery: string;
  onNavigate?: (type: string, id: string) => void;
  onAction?: (type: string, id: string, action: string) => void;
}

export function SearchResultCard({ result, searchQuery, onNavigate, onAction }: SearchResultCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'user':
        return <User className="w-5 h-5" />;
      case 'appointment':
        return <Calendar className="w-5 h-5" />;
      case 'notification':
        return <Bell className="w-5 h-5" />;
      case 'product':
        return <Package className="w-5 h-5" />;
      case 'service':
        return <CreditCard className="w-5 h-5" />;
      case 'company':
        return <Building className="w-5 h-5" />;
      case 'staff':
        return <Users className="w-5 h-5" />;
      case 'space':
        return <MapPin className="w-5 h-5" />;
      case 'category':
        return <Package className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'user':
        return "bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30";
      case 'appointment':
        return "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30";
      case 'notification':
        return "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30";
      case 'product':
        return "bg-purple-500/20 text-purple-600 dark:text-purple-400 border-purple-500/30";
      case 'service':
        return "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30";
      case 'company':
        return "bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30";
      case 'staff':
        return "bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 border-indigo-500/30";
      case 'space':
        return "bg-pink-500/20 text-pink-600 dark:text-pink-400 border-pink-500/30";
      case 'category':
        return "bg-teal-500/20 text-teal-600 dark:text-teal-400 border-teal-500/30";
      default:
        return "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'confirmed':
      case 'completed':
        return "bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30";
      case 'pending':
      case 'scheduled':
        return "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30";
      case 'cancelled':
      case 'inactive':
        return "bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30";
    }
  };

  const highlightSearchTerm = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      if (regex.test(part)) {
        return (
          <mark key={index} className="bg-[var(--accent-bg)] text-[var(--accent-text)] px-1 py-0.5 rounded">
            {part}
          </mark>
        );
      }
      return part;
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const handleNavigate = () => {
    if (onNavigate) {
      onNavigate(result.type, result.id);
    }
  };

  return (
    <Card 
      className="p-4 md:p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] hover:shadow-lg hover:shadow-[var(--glass-shadow)] transition-all duration-200 group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleNavigate}
    >
      <div className="flex flex-col md:flex-row items-start gap-3 md:gap-4">
        {/* Type Icon & Avatar */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className={`p-2 rounded-lg ${getTypeColor(result.type)} transition-all duration-200 group-hover:scale-110 shrink-0`}>
            {getTypeIcon(result.type)}
          </div>
          
          {result.avatar && (
            <Avatar className="w-10 h-10 shrink-0">
              <AvatarImage src={result.avatar} alt={result.title} />
              <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)]">
                {result.title.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </AvatarFallback>
            </Avatar>
          )}
          
          {/* Mobile: Show relevance and actions on same row */}
          <div className="flex items-center gap-2 ml-auto md:hidden">
            {result.relevanceScore && (
              <div className="text-xs text-muted-foreground px-2 py-1 bg-[var(--glass-bg)] rounded-full border border-[var(--glass-border)] whitespace-nowrap">
                {Math.round(result.relevanceScore * 100)}%
              </div>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200 shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNavigate();
                  }}
                  className="hover:bg-accent/50"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => {
                    e.stopPropagation();
                    onAction?.(result.type, result.id, 'open_new_tab');
                  }}
                  className="hover:bg-accent/50"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in New Tab
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {result.type === 'appointment' && (
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction?.(result.type, result.id, 'reschedule');
                    }}
                    className="hover:bg-accent/50"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Reschedule
                  </DropdownMenuItem>
                )}
                {(result.type === 'user' || result.type === 'staff') && (
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction?.(result.type, result.id, 'contact');
                    }}
                    className="hover:bg-accent/50"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Contact
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0 w-full">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between mb-2 gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h3 className="font-medium text-foreground group-hover:text-[var(--accent-text)] transition-colors break-words">
                  {highlightSearchTerm(result.title, searchQuery)}
                </h3>
                <Badge className={`${getTypeColor(result.type)} text-xs`} variant="outline">
                  {result.type.charAt(0).toUpperCase() + result.type.slice(1)}
                </Badge>
                {result.status && (
                  <Badge className={`${getStatusColor(result.status)} text-xs`} variant="outline">
                    {result.status}
                  </Badge>
                )}
              </div>
              
              {result.subtitle && (
                <p className="text-sm text-[var(--accent-text)] mb-1 break-words">
                  {highlightSearchTerm(result.subtitle, searchQuery)}
                </p>
              )}
              
              <p className="text-sm text-muted-foreground leading-relaxed break-words">
                {highlightSearchTerm(result.description, searchQuery)}
              </p>
            </div>

            {/* Actions - Desktop only */}
            <div className="hidden md:flex items-center gap-2 ml-4 shrink-0">
              {result.relevanceScore && (
                <div className="text-xs text-muted-foreground px-2 py-1 bg-[var(--glass-bg)] rounded-full border border-[var(--glass-border)] whitespace-nowrap">
                  {Math.round(result.relevanceScore * 100)}% match
                </div>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNavigate();
                    }}
                    className="hover:bg-accent/50"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      onAction?.(result.type, result.id, 'open_new_tab');
                    }}
                    className="hover:bg-accent/50"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in New Tab
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {result.type === 'appointment' && (
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        onAction?.(result.type, result.id, 'reschedule');
                      }}
                      className="hover:bg-accent/50"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Reschedule
                    </DropdownMenuItem>
                  )}
                  {(result.type === 'user' || result.type === 'staff') && (
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        onAction?.(result.type, result.id, 'contact');
                      }}
                      className="hover:bg-accent/50"
                    >
                      <User className="h-4 w-4 mr-2" />
                      Contact
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Metadata */}
          {result.metadata && (
            <div className="flex flex-wrap items-center gap-3 md:gap-4 mt-3 text-xs text-muted-foreground">
              {result.metadata.date && (
                <div className="flex items-center gap-1 whitespace-nowrap">
                  <Calendar className="w-3 h-3 shrink-0" />
                  <span className="truncate">{result.metadata.date}</span>
                  {result.metadata.time && <span className="truncate">at {result.metadata.time}</span>}
                </div>
              )}
              
              {result.metadata.location && (
                <div className="flex items-center gap-1 min-w-0">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span className="truncate">{result.metadata.location}</span>
                </div>
              )}
              
              {result.metadata.price && (
                <div className="flex items-center gap-1 whitespace-nowrap">
                  <CreditCard className="w-3 h-3 shrink-0" />
                  <span>{formatPrice(result.metadata.price)}</span>
                </div>
              )}
              
              {result.metadata.category && (
                <Badge variant="outline" className="text-xs shrink-0">
                  {result.metadata.category}
                </Badge>
              )}
              
              {result.metadata.tags && result.metadata.tags.length > 0 && (
                <div className="flex flex-wrap items-center gap-1">
                  {result.metadata.tags.slice(0, 2).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {result.metadata.tags.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{result.metadata.tags.length - 2}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}