import { useState, useEffect } from "react";
import { Building, MapPin, Phone, Mail, Globe, Users, CheckCircle, XCircle, Clock, ArrowLeft } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Separator } from "../../components/ui/separator";
import { Textarea } from "../../components/ui/textarea";
import { Label } from "../../components/ui/label";
import { GoogleMapComponent } from "../../components/GoogleMapComponent";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchCompanyRequest, clearError, approveCompanyRequest, rejectCompanyRequest } from "../../store/slices/companiesSlice";
import { toast } from "sonner";
import { formatAvatarUrl } from "../../utils";
import { DateDisplay } from "../../components/common/DateDisplay";

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
  postalCode?: string;
  category?: string;
  subCategory?: string;
  employees?: string;
  companySize?: string;
  status: "pending" | "approved" | "rejected";
  submittedDate: string;
  approvedDate?: string;
  rejectedDate?: string;
  rejectionReason?: string;
  logo?: string;
  isActive?: boolean | number | null;
  latitude?: number | null;
  longitude?: number | null;
}

interface CompanyProfilePageProps {
  companyId: string;
  onBack: () => void;
}

export function CompanyProfilePage({ companyId, onBack }: CompanyProfilePageProps) {
  const dispatch = useAppDispatch();
  const { companies: reduxCompanies, currentCompany, loading, error } = useAppSelector((state) => state.companies);
  
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionForm, setShowRejectionForm] = useState(false);

  // Find company from Redux store (check both companies array and currentCompany)
  const reduxCompany = reduxCompanies.find(comp => comp.id === companyId) || 
                      (currentCompany && currentCompany.id === companyId ? currentCompany : null);

  // Fetch company if not found in store (e.g., on page refresh)
  useEffect(() => {
    if (!reduxCompany && companyId) {
      dispatch(fetchCompanyRequest(companyId));
    }
  }, [reduxCompany, companyId, dispatch]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // Transform Redux company data to match the expected format for the UI
  const transformCompanyData = (companyData: any): Company | null => {
    if (!companyData) return null;

    // Use separate address fields from database if available
    const city = companyData.city || "";
    const state = companyData.state || "";
    const country = companyData.country || "";
    const postalCode = companyData.postalCode || "";
    const address = companyData.address || "";

    // Map isActive to status
    let status: "pending" | "approved" | "rejected" = "pending";
    const isActiveValue = companyData.isActive;
    
    if (isActiveValue === true || isActiveValue === 1) {
      status = "approved";
    } else if (isActiveValue === false || isActiveValue === 0) {
      status = "pending";
    } else if (isActiveValue === null || isActiveValue === undefined) {
      status = "pending";
    }

    return {
      id: companyData.id,
      name: companyData.name,
      description: companyData.description || "",
      contactPerson: companyData.contactPerson || "",
      email: companyData.email || "",
      phone: companyData.phone || "",
      website: companyData.website || "",
      address: address,
      city: city,
      state: state,
      country: country,
      postalCode: postalCode,
      latitude: companyData.latitude !== undefined && companyData.latitude !== null ? companyData.latitude : null,
      longitude: companyData.longitude !== undefined && companyData.longitude !== null ? companyData.longitude : null,
      category: companyData.category || "",
      subCategory: companyData.subcategory || "",
      employees: companyData.companySize || "",
      status: status,
      submittedDate: companyData.createdAt || new Date().toISOString(),
      logo: companyData.logo || "",
      isActive: companyData.isActive
    };
  };

  const company = transformCompanyData(reduxCompany || currentCompany);

  // Show loading state
  if (loading && !company) {
    return (
      <div className="flex-1 p-4 lg:p-6 flex items-center justify-center">
        <Card className="p-8 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] text-center">
          <div className="flex flex-col items-center gap-3">
            <Building className="w-12 h-12 text-muted-foreground animate-pulse" />
            <h3 className="text-lg font-semibold text-foreground">Loading company...</h3>
            <p className="text-muted-foreground">Please wait while we fetch the data</p>
          </div>
        </Card>
      </div>
    );
  }

  // Show error state if company not found
  if (!company) {
    return (
      <div className="flex-1 p-4 lg:p-6 flex items-center justify-center">
        <Card className="p-8 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] text-center">
          <div className="flex flex-col items-center gap-3">
            <Building className="w-12 h-12 text-muted-foreground" />
            <h3 className="text-lg font-semibold text-foreground">Company not found</h3>
            <p className="text-muted-foreground mb-4">The company you're looking for doesn't exist or has been removed.</p>
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Companies
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const getStatusColor = (status: Company["status"]) => {
    switch (status) {
      case "approved":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "rejected":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusIcon = (status: Company["status"]) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4" />;
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const handleApprove = () => {
    if (!company) return;
    
    dispatch(approveCompanyRequest(company.id));
    // Refetch company data after approval to update UI
    setTimeout(() => {
      dispatch(fetchCompanyRequest(company.id));
    }, 500);
  };

  const handleReject = () => {
    if (!company) return;
    
    if (!rejectionReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }
    
    dispatch(rejectCompanyRequest({ id: company.id, reason: rejectionReason }));
    setShowRejectionForm(false);
    setRejectionReason("");
    
    // Refetch company data after rejection to update UI
    setTimeout(() => {
      dispatch(fetchCompanyRequest(company.id));
    }, 500);
  };

  return (
    <div className="flex-1 p-4 lg:p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon"
          onClick={onBack}
          className="bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent text-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Company Profile</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Review company registration details</p>
        </div>
        {company.status === "pending" && (
          <div className="flex items-center gap-2">
            <Button 
              variant="outline"
              onClick={() => setShowRejectionForm(true)}
              disabled={loading}
              className="bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300 disabled:opacity-50"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
            <Button 
              onClick={handleApprove}
              disabled={loading}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/25 text-white disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              {loading ? "Approving..." : "Approve"}
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Company Overview */}
        <div className="lg:col-span-2 space-y-6">
          {/* Company Profile */}
          <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] shadow-lg">
            <div className="flex items-center gap-2 mb-6">
              <Building className="w-5 h-5 text-[var(--accent-text)]" />
              <h3 className="font-semibold text-foreground">Company Profile</h3>
            </div>

            <div className="space-y-6">
              {/* Logo Upload */}
              <div className="space-y-2">
                <Label className="text-foreground">Company Logo</Label>
                <div className="flex items-center gap-4">
                  <Avatar className="w-20 h-20 ring-2 ring-[var(--accent-border)]">
                    <AvatarImage 
                      src={company.logo ? formatAvatarUrl(company.logo) : undefined} 
                      alt="Company Logo" 
                    />
                    <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)] text-lg">
                      {(company.name || '').slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {company.logo && (
                    <p className="text-sm text-muted-foreground">Logo uploaded</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-foreground">Company Name <span className="text-red-500">*</span></Label>
                  <p className="p-2 text-foreground">{company.name || 'Not provided'}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-foreground">Contact Person</Label>
                  <p className="p-2 text-foreground">{company.contactPerson || 'Not provided'}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Company Description <span className="text-red-500">*</span></Label>
                <p className="p-2 text-foreground">{company.description || 'Not provided'}</p>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Company Size</Label>
                <p className="p-2 text-foreground">{company.companySize ? `${company.companySize} employees` : (company.employees ? `${company.employees} employees` : 'Not provided')}</p>
              </div>
            </div>
          </Card>

          {/* Contact Information */}
          <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] shadow-lg">
            <div className="flex items-center gap-2 mb-6">
              <Phone className="w-5 h-5 text-[var(--accent-text)]" />
              <h3 className="font-semibold text-foreground">Contact Information</h3>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-foreground">Email Address <span className="text-red-500">*</span></Label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <a href={`mailto:${company.email}`} className="text-[var(--accent-text)] hover:text-[var(--accent-primary-hover)]">
                      {company.email || 'Not provided'}
                    </a>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-foreground">Phone Number <span className="text-red-500">*</span></Label>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <a href={`tel:${company.phone}`} className="text-[var(--accent-text)] hover:text-[var(--accent-primary-hover)]">
                      {company.phone || 'Not provided'}
                    </a>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Website URL</Label>
                {company.website ? (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-muted-foreground" />
                    <a 
                      href={company.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-[var(--accent-text)] hover:text-[var(--accent-primary-hover)]"
                    >
                      {company.website}
                    </a>
                  </div>
                ) : (
                  <p className="p-2 text-foreground">Not provided</p>
                )}
              </div>
            </div>
          </Card>

          {/* Location Information */}
          <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] shadow-lg">
            <div className="flex items-center gap-2 mb-6">
              <MapPin className="w-5 h-5 text-[var(--accent-text)]" />
              <h3 className="font-semibold text-foreground">Location Information</h3>
            </div>

            <div className="space-y-6">
              {/* Map Integration - Moved to top */}
              <div>
                <Label className="text-foreground mb-2 block">Location on Map</Label>
                <GoogleMapComponent 
                  address={company.address}
                  city={company.city}
                  state={company.state}
                  country={company.country}
                  editMode={false}
                  height="400px"
                  initialLat={company.latitude}
                  initialLng={company.longitude}
                />
              </div>

              {/* Address Fields */}
              <div className="space-y-2">
                <Label className="text-foreground">Street Address <span className="text-red-500">*</span></Label>
                <p className="p-2 text-foreground">{company.address || 'Not provided'}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label className="text-foreground">City <span className="text-red-500">*</span></Label>
                  <p className="p-2 text-foreground">{company.city || 'Not provided'}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-foreground">State/Province <span className="text-red-500">*</span></Label>
                  <p className="p-2 text-foreground">{company.state || 'Not provided'}</p>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-foreground">Postal Code</Label>
                  <p className="p-2 text-foreground">{company.postalCode || 'Not provided'}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground">Country</Label>
                <p className="p-2 text-foreground">{company.country || 'Not provided'}</p>
              </div>
            </div>
          </Card>

          {/* Rejection Reason (if rejected) */}
          {company.status === "rejected" && company.rejectionReason && (
            <Card className="p-6 backdrop-blur-sm bg-red-500/10 border border-red-500/30">
              <h3 className="font-medium text-red-400 mb-4 flex items-center gap-2">
                <XCircle className="w-5 h-5" />
                Rejection Reason
              </h3>
              <p className="text-foreground">{company.rejectionReason}</p>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Current Status */}
          <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
            <h3 className="font-semibold text-foreground mb-4">Company Status</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                {company.status === "approved" ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : company.status === "rejected" ? (
                  <XCircle className="w-5 h-5 text-red-500" />
                ) : (
                  <Clock className="w-5 h-5 text-yellow-500" />
                )}
                <div>
                  <p className="font-medium text-foreground">
                    {company.status === "approved" ? "Approved & Active" : 
                     company.status === "rejected" ? "Rejected" : 
                     "Pending Approval"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {company.status === "approved" ? "Ready to accept appointments" : 
                     company.status === "rejected" ? "Application has been rejected" : 
                     "Awaiting admin approval"}
                  </p>
                </div>
              </div>
              <Badge className={`${getStatusColor(company.status)} border`}>
                <span className="flex items-center gap-1">
                  {getStatusIcon(company.status)}
                  {company.status.charAt(0).toUpperCase() + company.status.slice(1)}
                </span>
              </Badge>
            </div>
          </Card>

          {/* Admin Actions */}
          {company.status === "pending" && (
            <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
              <h3 className="font-semibold text-foreground mb-4">Admin Actions</h3>
              <div className="space-y-3">
                <Button 
                  onClick={handleApprove}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-lg shadow-green-500/25 text-white disabled:opacity-50"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {loading ? "Approving..." : "Approve Company"}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowRejectionForm(true)}
                  disabled={loading}
                  className="w-full bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20 hover:text-red-300 disabled:opacity-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject Application
                </Button>
              </div>
            </Card>
          )}

          {/* Account Information */}
          <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] shadow-lg">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Building className="w-5 h-5 text-[var(--accent-text)]" />
              Account Information
            </h3>
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Registration Date</p>
                <p className="font-medium text-foreground">
                  <DateDisplay date={company.submittedDate} fallback="Not available" />
                </p>
              </div>
              {company.approvedDate && (
                <div>
                  <p className="text-sm text-muted-foreground">Approved Date</p>
                  <p className="font-medium text-foreground">
                    <DateDisplay date={company.approvedDate} />
                  </p>
                </div>
              )}
              {company.rejectedDate && (
                <div>
                  <p className="text-sm text-muted-foreground">Rejected Date</p>
                  <p className="font-medium text-foreground">
                    <DateDisplay date={company.rejectedDate} />
                  </p>
                </div>
              )}
            </div>
          </Card>

        </div>
      </div>

      {/* Rejection Form Modal */}
      {showRejectionForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] shadow-2xl">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">Reject Application</h3>
              <p className="text-muted-foreground mb-4">Please provide a reason for rejecting this company registration:</p>
              
              <Textarea
                placeholder="Enter rejection reason..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground placeholder:text-muted-foreground resize-none mb-4"
                rows={4}
              />
              
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline"
                  onClick={() => setShowRejectionForm(false)}
                  className="flex-1 bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground hover:bg-accent hover:text-foreground"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleReject}
                  disabled={loading || !rejectionReason.trim()}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white disabled:opacity-50"
                >
                  {loading ? "Rejecting..." : "Reject Application"}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}