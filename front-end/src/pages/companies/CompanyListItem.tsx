import { MapPin, Users, Mail, Phone, Eye, CheckCircle, Clock, XCircle, MoreVertical, Tag, User } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../components/ui/dropdown-menu";
import { formatAvatarUrl } from "../../utils";
import { DateDisplay } from "../../components/common/DateDisplay";
import { useAppSelector } from "../../store/hooks";
import { isRole, UserRole } from "../../types/user";

interface Tag {
  id: number;
  name: string;
  color: string;
  icon?: string;
}

interface Owner {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  avatar?: string;
}

interface Company {
  id: string;
  name: string;
  description: string;
  contactPerson?: string;
  email: string;
  phone: string;
  website?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  category?: string;
  subCategory?: string;
  employees?: string;
  status: "pending" | "approved" | "rejected";
  submittedDate: string;
  logo?: string;
  isActive?: boolean | number | null;
  tags?: Tag[];
  owner?: Owner | null;
}

interface CompanyListItemProps {
  company: Company;
  onViewCompany: (companyId: string) => void;
}

export const CompanyListItem = ({ company, onViewCompany }: CompanyListItemProps) => {
  // Get current user from Redux to check if super admin
  const { user } = useAppSelector((state) => state.auth);
  const isSuperAdmin = isRole(user?.role, UserRole.SYSTEM_ADMIN);
  
  // Determine status from isActive if status is not explicitly set or needs validation
  const getActualStatus = (): "pending" | "approved" | "rejected" => {
    // If status is already set and valid, use it
    if (company.status && ['pending', 'approved', 'rejected'].includes(company.status)) {
      // Validate status against isActive for consistency
      const isActiveValue = company.isActive;
      
      // If isActive is explicitly true or 1, status should be approved
      if ((isActiveValue === true || isActiveValue === 1) && company.status !== 'approved') {
        return 'approved';
      }
      
      // If isActive is explicitly false, 0, null, or undefined, status should be pending
      if ((isActiveValue === false || isActiveValue === 0 || isActiveValue === null || isActiveValue === undefined) 
          && company.status === 'approved') {
        return 'pending';
      }
      
      return company.status;
    }
    
    // Fallback: determine status from isActive
    const isActiveValue = company.isActive;
    if (isActiveValue === true || isActiveValue === 1) {
      return 'approved';
    } else if (isActiveValue === false || isActiveValue === 0) {
      return 'pending';
    } else {
      return 'pending'; // null or undefined means pending
    }
  };

  const actualStatus = getActualStatus();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30';
      case 'pending': return 'bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-500/30';
      case 'rejected': return 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30';
    }
  };

  // Removed formatDate - using DateDisplay component for consistent date formatting

  return (
    <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--glass-shadow)]">
      <div className="flex items-start gap-4">
        <Avatar className="w-20 h-20 flex-shrink-0">
          <AvatarImage src={company.logo ? formatAvatarUrl(company.logo) : undefined} alt={company.name} />
          <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)]">
            {company.name.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground text-lg mb-1 truncate">{company.name}</h3>
              <p className="text-muted-foreground text-sm mb-2 line-clamp-2">{company.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-[var(--accent-text)]" />
                    <span className="text-muted-foreground">Contact:</span>
                    <span className="text-foreground">{company.contactPerson}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-[var(--accent-text)]" />
                    <span className="text-muted-foreground">Email:</span>
                    <span className="text-foreground">{company.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-[var(--accent-text)]" />
                    <span className="text-muted-foreground">Phone:</span>
                    <span className="text-foreground">{company.phone}</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  {company.city && company.state && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-[var(--accent-text)]" />
                      <span className="text-muted-foreground">Location:</span>
                      <span className="text-foreground">{company.city}, {company.state}</span>
                    </div>
                  )}
                  {company.address && !company.city && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="w-4 h-4 text-[var(--accent-text)]" />
                      <span className="text-muted-foreground">Address:</span>
                      <span className="text-foreground">{company.address}</span>
                    </div>
                  )}
                  {company.tags && company.tags.length > 0 && (
                    <div className="flex items-start gap-2 text-sm">
                      <Tag className="w-4 h-4 text-[var(--accent-text)] mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">Tags:</span>
                      <div className="flex flex-wrap gap-1.5 flex-1">
                        {company.tags.map((tag) => (
                          <Badge
                            key={tag.id}
                            variant="secondary"
                            className="text-xs"
                            style={{ 
                              backgroundColor: `${tag.color}20`, 
                              color: tag.color,
                              borderColor: `${tag.color}40`
                            }}
                          >
                            {tag.icon && <span className="mr-1">{tag.icon}</span>}
                            {tag.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {company.employees && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-[var(--accent-text)]" />
                      <span className="text-muted-foreground">Employees:</span>
                      <span className="text-foreground">{company.employees}</span>
                    </div>
                  )}
                  
                  {/* Owner Information - Show for super admin */}
                  {isSuperAdmin && company.owner && (
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-[var(--accent-text)]" />
                      <span className="text-muted-foreground">Owner:</span>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={company.owner.avatar ? formatAvatarUrl(company.owner.avatar) : undefined} alt={company.owner.name} />
                          <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)] text-xs">
                            {company.owner.name ? company.owner.name.substring(0, 2).toUpperCase() : 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-foreground font-medium">{company.owner.name}</div>
                          <div className="text-muted-foreground text-xs">{company.owner.email}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Badge className={`${getStatusColor(actualStatus)} border text-xs px-2 py-1`}>
                  {actualStatus.charAt(0).toUpperCase() + actualStatus.slice(1)}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Submitted: <DateDisplay date={company.submittedDate} />
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Only show View button if not super admin */}
              {!isSuperAdmin && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewCompany(company.id)}
                  className="bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent text-foreground hover:text-foreground"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-accent">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-popover border-border" align="end">
                  <DropdownMenuItem onClick={() => onViewCompany(company.id)}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Full Profile
                  </DropdownMenuItem>
                  {actualStatus === 'pending' && (
                    <>
                      <DropdownMenuItem className="text-green-600 dark:text-green-400">
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve Company
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600 dark:text-red-400">
                        <XCircle className="w-4 h-4 mr-2" />
                        Reject Company
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

