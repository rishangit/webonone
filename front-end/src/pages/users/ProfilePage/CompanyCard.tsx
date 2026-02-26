import { Mail, Phone, MapPin, Clock, CheckCircle, MoreVertical, Eye, Edit, Trash2, LogIn, XCircle } from "lucide-react";
import { Card } from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../components/ui/dropdown-menu";
import { DateDisplay } from "../../../components/common/DateDisplay";
import { Company } from "../../../services/companies";

interface CompanyCardProps {
  company: Company;
  status: 'pending' | 'approved' | 'rejected';
  isSystemAdmin: boolean;
  companiesLoading: boolean;
  loggingIn: string | null;
  onViewDetails: (companyId: string) => void;
  onEditDetails: (companyId: string) => void;
  onDelete: (company: { id: string; name: string }) => void;
  onApprove?: (companyId: string) => void;
  onReject?: (companyId: string) => void;
  onLogin?: (companyId: string) => void;
}

export const CompanyCard = ({
  company,
  status,
  isSystemAdmin,
  companiesLoading,
  loggingIn,
  onViewDetails,
  onEditDetails,
  onDelete,
  onApprove,
  onReject,
  onLogin,
}: CompanyCardProps) => {
  const isActive = company.isActive === true || company.isActive === 1;
  const borderColor = status === 'approved' 
    ? 'border-green-500/30 bg-green-500/5' 
    : status === 'pending'
    ? 'border-yellow-500/30 bg-yellow-500/5'
    : 'border-red-500/30 bg-red-500/5';

  return (
    <Card className={`p-4 border-2 ${borderColor}`}>
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-semibold text-foreground">{company.name}</h4>
            {company.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{company.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge className={
              status === 'approved' 
                ? 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30'
                : status === 'pending'
                ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30'
                : 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30'
            }>
              {status === 'approved' && <CheckCircle className="w-3 h-3 mr-1" />}
              {status === 'pending' && <Clock className="w-3 h-3 mr-1" />}
              {status === 'rejected' && <XCircle className="w-3 h-3 mr-1" />}
              {status === 'approved' ? 'Approved' : status === 'pending' ? 'Pending' : 'Rejected'}
            </Badge>
            {/* 3-dot menu for non-admin users */}
            {!isSystemAdmin && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="bg-popover border-border" align="end">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails(String(company.id));
                  }}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onEditDetails(String(company.id));
                  }}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Details
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="text-red-600 dark:text-red-400"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete({ id: String(company.id), name: company.name });
                    }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        
        <div className="space-y-2 text-sm">
          {company.email && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="w-3 h-3" />
              <span className="truncate">{company.email}</span>
            </div>
          )}
          {company.phone && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="w-3 h-3" />
              <span>{company.phone}</span>
            </div>
          )}
          {company.address && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{company.address}</span>
            </div>
          )}
        </div>

        {company.createdAt && status === 'pending' && (
          <p className="text-xs text-muted-foreground">
            Submitted: <DateDisplay date={company.createdAt} />
          </p>
        )}

        {company.updatedAt && status === 'approved' && (
          <p className="text-xs text-muted-foreground">
            Approved: <DateDisplay date={company.updatedAt} />
          </p>
        )}

        {/* Action buttons - only show for System Admins */}
        {isSystemAdmin && status === 'pending' && onApprove && onReject && (
          <div className="flex gap-2 pt-2">
            <Button
              size="sm"
              className="flex-1 bg-green-500 hover:bg-green-600 text-white"
              onClick={() => onApprove(String(company.id))}
              disabled={companiesLoading}
            >
              <CheckCircle className="w-3 h-3 mr-1" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              className="flex-1"
              onClick={() => {
                if (window.confirm('Are you sure you want to reject this company registration?')) {
                  onReject(String(company.id));
                }
              }}
              disabled={companiesLoading}
            >
              <XCircle className="w-3 h-3 mr-1" />
              Reject
            </Button>
          </div>
        )}

        {/* Login Button - only show for non-admin users and approved companies */}
        {!isSystemAdmin && status === 'approved' && isActive && onLogin && (
          <Button
            variant="accent"
            size="sm"
            className="w-full mt-3"
            onClick={(e) => {
              e.stopPropagation();
              onLogin(String(company.id));
            }}
            disabled={loggingIn === String(company.id)}
          >
            <LogIn className="w-4 h-4 mr-2" />
            {loggingIn === String(company.id) ? "Logging in..." : "Login to Account"}
          </Button>
        )}
      </div>
    </Card>
  );
};
