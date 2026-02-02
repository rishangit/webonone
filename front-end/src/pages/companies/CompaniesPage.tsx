import { useState, useEffect, useMemo, useCallback } from "react";
import { Building, CheckCircle, Clock, XCircle } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { ViewSwitcher } from "../../components/ui/view-switcher";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchCompaniesRequest, clearError } from "../../store/slices/companiesSlice";
import { toast } from "sonner";
import { CompanyCard } from "./CompanyCard";
import { CompanyListItem } from "./CompanyListItem";
import { SearchInput } from "../../components/common/SearchInput";
import { Pagination } from "../../components/common/Pagination";
import { EmptyState } from "../../components/common/EmptyState";

interface Tag {
  id: number;
  name: string;
  color: string;
  icon?: string;
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
}

interface CompaniesPageProps {
  onViewCompany: (companyId: string) => void;
}

export function CompaniesPage({ onViewCompany }: CompaniesPageProps) {
  const dispatch = useAppDispatch();
  const { companies: reduxCompanies, loading, error, pagination } = useAppSelector((state) => state.companies);
  
  // State declarations - must be before useEffect that uses them
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);

  // Memoize handlers to prevent SearchInput re-renders when parent re-renders
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);
  
  const handleDebouncedSearchChange = useCallback((value: string) => {
    setDebouncedSearchTerm(value);
  }, []);
  
  // Memoize clear filters handler to prevent re-renders
  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setDebouncedSearchTerm("");
    setStatusFilter("all");
  }, []);

  // Load companies from API with pagination and filters
  useEffect(() => {
    const offset = (currentPage - 1) * itemsPerPage;
    const filters: any = {
      limit: itemsPerPage,
      offset: offset,
      page: currentPage,
    };

    // Add search (use debounced value to avoid too many API calls)
    if (debouncedSearchTerm.trim()) {
      filters.search = debouncedSearchTerm.trim();
    }

    // Add status filter
    // Note: Status is derived from isActive in the UI transformation
    // approved = isActive=true, pending/rejected = isActive=false
    // If you need to distinguish rejected from pending, you may need a separate field
    if (statusFilter === "approved") {
      filters.isActive = true;
    } else if (statusFilter === "pending" || statusFilter === "rejected") {
      // Both pending and rejected are inactive companies
      // If you need to distinguish them, add a separate field in the database
      filters.isActive = false;
    }

    dispatch(fetchCompaniesRequest(filters));
  }, [dispatch, currentPage, itemsPerPage, debouncedSearchTerm, statusFilter]);

  // Reset to page 1 when filters change (but not when pagination changes)
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, statusFilter]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Transform Redux companies to match the expected format for the UI
  // Memoize to prevent recalculation on every render
  const companies: Company[] = useMemo(() => {
    return reduxCompanies.map((company: any) => {
    // Parse address to extract city, state, country if address is a combined string
    let city = "";
    let state = "";
    let country = "";
    
    if (company.address) {
      const addressParts = company.address.split(',').map((part: string) => part.trim());
      // Try to extract city, state, country from address string
      // This is a simple parsing - you may need to adjust based on your address format
      if (addressParts.length >= 2) {
        city = addressParts[addressParts.length - 3] || "";
        state = addressParts[addressParts.length - 2] || "";
        country = addressParts[addressParts.length - 1] || "";
      }
    }

    // Map isActive to status
    // Handle isActive as boolean (true/false), number (1/0), or null/undefined
    let status: "pending" | "approved" | "rejected" = "pending";
    const isActiveValue = company.isActive;
    
    // Check if isActive is true or 1 (approved)
    if (isActiveValue === true || isActiveValue === 1) {
      status = "approved";
    } 
    // Check if isActive is false or 0 (pending - not yet approved)
    else if (isActiveValue === false || isActiveValue === 0) {
      // If company has been created, it's pending approval
      status = "pending";
    }
    // If isActive is null or undefined, it's pending
    else if (isActiveValue === null || isActiveValue === undefined) {
      status = "pending";
    }

    return {
      id: company.id,
      name: company.name,
      description: company.description || "",
      contactPerson: "", // Not stored in database currently
      email: company.email || "",
      phone: company.phone || "",
      website: company.website || "",
      address: company.address || "",
      city: city,
      state: state,
      country: country,
      category: company.category || "",
      subCategory: company.subcategory || "",
      employees: "", // Not stored in database currently
      status: status,
      submittedDate: company.createdAt || new Date().toISOString(),
      logo: company.logo || "",
      isActive: company.isActive, // Pass isActive to components for validation
      tags: company.tags || [] // Include tags from API
    };
  });
  }, [reduxCompanies]);

  // For server-side pagination, use companies directly (no client-side filtering)
  const displayedCompanies = companies;

  // Statistics - use pagination total for accurate counts
  // Note: For status breakdown, we'd need separate stats endpoint or calculate from current page
  const stats = useMemo(() => {
    const totalCompanies = pagination?.total || companies.length;
    // Calculate status counts from current page data (limited accuracy)
    const approvedCount = companies.filter(c => c.status === 'approved').length;
    const pendingCount = companies.filter(c => c.status === 'pending').length;
    const rejectedCount = companies.filter(c => c.status === 'rejected').length;
    
    return [
      { label: 'Total Companies', count: totalCompanies, icon: Building, color: 'text-blue-600' },
      { label: 'Approved', count: approvedCount, icon: CheckCircle, color: 'text-green-600' },
      { label: 'Pending', count: pendingCount, icon: Clock, color: 'text-orange-600' },
      { label: 'Rejected', count: rejectedCount, icon: XCircle, color: 'text-red-600' }
    ];
  }, [pagination, companies]);

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Company Management</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">
            Review and manage company registrations across all industries
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="p-4 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200 hover:shadow-lg hover:shadow-[var(--glass-shadow)]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                  <p className="text-xl font-semibold text-foreground">{stat.count}</p>
                </div>
                <Icon className={`w-8 h-8 ${stat.color} dark:text-${stat.color.split('-')[1]}-400`} />
              </div>
            </Card>
          );
        })}
      </div>

      {/* Filters */}
      <Card className="p-4 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
        <div className="space-y-4">
          {/* Search Bar */}
          <SearchInput
            placeholder="Search companies by name, description, category, or location..."
            value={searchTerm}
            onChange={handleSearchChange}
            onDebouncedChange={handleDebouncedSearchChange}
            debounceDelay={500}
          />
          
          {/* Filter Controls */}
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-32 bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              
              {/* Clear Filters */}
              {(debouncedSearchTerm || statusFilter !== "all") && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleClearFilters}
                  className="bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground hover:bg-accent hover:text-foreground"
                >
                  Clear Filters
                </Button>
              )}
            </div>
            
            {/* View Mode Toggle */}
            <ViewSwitcher 
              viewMode={viewMode} 
              onViewModeChange={setViewMode} 
            />
          </div>
        </div>
      </Card>

      {/* Loading State - Skeleton for Company Cards */}
      {loading && displayedCompanies.length === 0 ? (
        <>
          {/* Skeleton for List View */}
          {viewMode === "list" ? (
            /* Skeleton for List View - Matching CompanyListItem structure */
            <div className="space-y-4">
              {[...Array(6)].map((_, index) => (
                <Card key={index} className="p-6 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          {/* Name and Description */}
                          <div className="h-6 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                          <div className="h-4 w-full max-w-md bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                          <div className="h-4 w-64 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3" />
                          
                          {/* Two-column grid for contact info */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
                                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
                                <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
                                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                <div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
                                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                              </div>
                              <div className="flex items-start gap-2">
                                <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0 mt-0.5" />
                                <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                <div className="flex flex-wrap gap-1.5 flex-1">
                                  <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                  <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Status badge and date */}
                          <div className="flex items-center gap-3">
                            <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          </div>
                        </div>
                        
                        {/* Buttons */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="h-9 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          <div className="h-9 w-9 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            /* Skeleton for Grid View - Matching CompanyCard structure */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <Card key={index} className="p-6 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                  <div className="space-y-4">
                    {/* Avatar, Name, Description, Status, Menu */}
                    <div className="flex items-start gap-3">
                      <div className="h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1" />
                            <div className="h-4 w-full max-w-xs bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                            <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          </div>
                          
                          <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Contact, Location, Tags */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
                        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
                        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0 mt-0.5" />
                        <div className="flex flex-wrap gap-1.5 flex-1">
                          <div className="h-5 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          <div className="h-5 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Date and View button */}
                    <div className="flex items-center justify-between pt-2">
                      <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      <div className="h-9 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : displayedCompanies.length > 0 ? (
        <>
          {viewMode === "list" ? (
            <div className="space-y-4">
              {displayedCompanies.map((company) => (
                <CompanyListItem
                  key={company.id}
                  company={company}
                  onViewCompany={onViewCompany}
                />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayedCompanies.map((company) => (
                <CompanyCard
                  key={company.id}
                  company={company}
                  onViewCompany={onViewCompany}
                />
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination && (
            <Pagination
              totalItems={pagination.total}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              showItemsPerPageSelector={true}
              itemsPerPageOptions={[12, 24, 48, 96]}
              onItemsPerPageChange={(newItemsPerPage) => {
                setItemsPerPage(newItemsPerPage);
                setCurrentPage(1);
              }}
            />
          )}
        </>
      ) : (
        <EmptyState
          icon={Building}
          title="No companies found"
          description={
            debouncedSearchTerm || statusFilter !== "all"
              ? "Try adjusting your filters or search query"
              : "No companies have been registered yet"
          }
        />
      )}
    </div>
  );
}