import { Calendar, Clock, CreditCard, Users, Package, FileText, MoreVertical, Eye, Trash2 } from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { Button } from "../../../../components/ui/button";
import { Badge } from "../../../../components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "../../../../components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../../../../components/ui/dropdown-menu";
import { DateDisplay } from "../../../../components/common/DateDisplay";
import { SalesCardProps } from "../types";

export const SalesCard = ({
  sale,
  formatCurrency,
  onViewDetails,
  onDeleteSale,
  onDeleteItem,
  isCompanyOwner,
}: SalesCardProps) => {
  return (
    <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--glass-shadow)]">
      <div className="flex items-start gap-4">
        <Avatar className="w-12 h-12 sm:w-16 sm:h-16 ring-2 ring-[var(--accent-border)] flex-shrink-0">
          <AvatarImage src={sale.customerImage} />
          <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)]">
            {sale.customerName.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="font-semibold text-foreground truncate">{sale.customerName}</h3>
                <Badge 
                  variant="outline" 
                  className={sale.type === 'appointment' 
                    ? 'bg-blue-50 border-blue-200 text-blue-700 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-300' 
                    : 'bg-green-50 border-green-200 text-green-700 dark:bg-green-950 dark:border-green-800 dark:text-green-300'
                  }
                >
                  {sale.type === 'appointment' ? 'Appointment' : 'Product Sale'}
                </Badge>
                <Badge 
                  className={sale.status === 'completed' 
                    ? 'bg-green-500/20 text-green-600 border-green-500/30' 
                    : sale.status === 'processing'
                    ? 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30'
                    : 'bg-red-500/20 text-red-600 border-red-500/30'
                  }
                >
                  {sale.status.charAt(0).toUpperCase() + sale.status.slice(1)}
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Sale ID: {sale.id}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span><DateDisplay date={sale.date} /></span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  <span>{sale.paymentMethod}</span>
                </div>
                {sale.staffMember && (
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{sale.staffMember}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-2xl font-bold text-[var(--accent-text)] mb-1">
                {formatCurrency(sale.totalAmount)}
              </p>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-muted-foreground hover:text-foreground">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover border-border">
                  <DropdownMenuItem 
                    className="text-foreground hover:bg-accent"
                    onClick={() => onViewDetails(sale.id)}
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  {isCompanyOwner && (
                    <DropdownMenuItem 
                      className="text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                      onClick={() => onDeleteSale(sale.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Sale
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg p-4">
            <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
              <Package className="w-4 h-4 text-[var(--accent-text)]" />
              Items ({sale.items.length})
            </h4>
            <div className="space-y-2">
              {sale.items.map((item, index) => (
                <div key={item.id || index} className="flex items-center justify-between py-2 border-b border-[var(--glass-border)] last:border-b-0 group">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Qty: {item.quantity} • Unit Price: {formatCurrency(item.unitPrice)}
                      {item.discount > 0 && (
                        <span className="text-green-600 ml-2">
                          {item.discount}% discount applied
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      {item.discount > 0 ? (
                        <div>
                          <p className="text-xs text-muted-foreground line-through">
                            {formatCurrency(item.quantity * item.unitPrice)}
                          </p>
                          <p className="font-semibold text-foreground">
                            {formatCurrency(item.quantity * item.unitPrice * (1 - item.discount / 100))}
                          </p>
                        </div>
                      ) : (
                        <p className="font-semibold text-foreground">
                          {formatCurrency(item.quantity * item.unitPrice)}
                        </p>
                      )}
                    </div>
                    {isCompanyOwner && item.id && !item.id.startsWith('service-') && !item.id.startsWith('product-') && !item.id.startsWith('default-') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDeleteItem(sale.id, item.id!)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {sale.notes && (
            <div className="mt-3 p-3 bg-[var(--accent-bg)] border border-[var(--accent-border)] rounded-lg">
              <p className="text-sm text-muted-foreground">
                <FileText className="w-4 h-4 inline mr-2" />
                {sale.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
