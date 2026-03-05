import { useNavigate } from "react-router-dom";
import { ServiceCard } from "../services/ServicesPage/components/ServiceCard";
import { SpaceCard } from "../spaces/SpacesPage/components/SpaceCard";
import { UserCard } from "../users/UserCard";
import { StaffCard } from "../staff/StaffPage/components/StaffCard";
import { CompanyCard } from "../companies/CompanyCard/CompanyCard";
import { AppointmentCard } from "../appointments/AppointmentCard/AppointmentCard";
import { TagCard } from "../tags/TagsPage/components/TagCard";
import { SearchResultCard } from "./SearchResultCard";

interface SearchResult {
  id: string;
  type: 'user' | 'appointment' | 'notification' | 'product' | 'service' | 'company' | 'staff' | 'space' | 'category' | 'tag' | 'sale';
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
    [key: string]: any;
  };
  relevanceScore?: number;
  [key: string]: any; // Allow additional properties for entity-specific data
}

interface SearchResultRendererProps {
  result: SearchResult;
  searchQuery: string;
  onNavigate?: (type: string, id: string) => void;
  onAction?: (type: string, id: string, action: string) => void;
}

export const SearchResultRenderer = ({ result, searchQuery, onNavigate, onAction }: SearchResultRendererProps) => {
  const navigate = useNavigate();

  // Helper function to format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // Helper function to format duration
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  // Helper function to get image URL
  const getImageUrl = (url?: string) => {
    return url || '';
  };

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'confirmed':
        return 'bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30';
      case 'inactive':
      case 'cancelled':
        return 'bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30';
      default:
        return 'bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-500/30';
    }
  };

  // Map search result to entity card props and render appropriate card
  switch (result.type) {
    case 'service':
      return (
        <ServiceCard
          service={{
            id: result.id,
            name: result.title,
            description: result.description,
            price: result.metadata?.price || 0,
            duration: result.metadata?.duration || 0,
            status: result.status || 'Active',
            category: result.metadata?.category || '',
            tags: result.metadata?.tags || [],
            image: result.metadata?.image || result.avatar || '',
          }}
          onView={(service) => navigate(`/system/services/${service.id}`)}
          formatPrice={formatPrice}
          formatDuration={formatDuration}
          getImageUrl={getImageUrl}
          getStatusColor={getStatusColor}
          viewMode="grid"
        />
      );

    case 'space':
      return (
        <SpaceCard
          space={{
            id: result.id,
            name: result.title,
            description: result.description,
            status: result.status || 'Active',
            capacity: result.metadata?.capacity || 0,
            imageUrl: result.metadata?.image || result.avatar || '',
            appointments: result.metadata?.appointments || { today: 0, thisWeek: 0 },
            tags: result.metadata?.tags || [],
          }}
          viewMode="grid"
          onView={(space) => navigate(`/system/spaces/${space.id}`)}
        />
      );

    case 'user':
      return (
        <UserCard
          id={result.id}
          name={result.title}
          email={result.metadata?.email || result.subtitle || ''}
          phone={result.metadata?.phone || ''}
          avatar={result.avatar}
          role={result.metadata?.role || result.subtitle || 'User'}
          status={result.status === 'Active' ? 'active' : 'inactive'}
          location={result.metadata?.location || ''}
          onViewProfile={(userId) => navigate(`/system/users/${userId}`)}
        />
      );

    case 'staff':
      return (
        <StaffCard
          member={{
            id: result.id,
            name: result.title,
            email: result.metadata?.email || result.subtitle || '',
            phone: result.metadata?.phone || '',
            avatar: result.avatar,
            role: result.metadata?.role || result.subtitle || 'Staff',
            status: result.status === 'Active' ? 'active' : 'inactive',
            joinDate: result.metadata?.joinDate || '',
          }}
          viewMode="grid"
          onView={(member) => navigate(`/system/staff/${member.id}`)}
        />
      );

    case 'company':
      return (
        <CompanyCard
          company={{
            id: result.id,
            name: result.title,
            description: result.description,
            logo: result.avatar,
            status: result.status || 'Active',
            address: result.metadata?.location || '',
            tags: result.metadata?.tags || [],
          }}
          onViewCompany={(companyId) => navigate(`/system/companies/${companyId}`)}
        />
      );

    case 'appointment':
      return (
        <AppointmentCard
          id={result.id}
          patientName={result.title}
          patientImage={result.avatar}
          date={result.metadata?.date || ''}
          time={result.metadata?.time || ''}
          duration={result.metadata?.duration || '30m'}
          type={result.metadata?.type || result.subtitle || 'Appointment'}
          status={result.status || 'Scheduled'}
          phone={result.metadata?.phone || ''}
          location={result.metadata?.location || ''}
          service={result.metadata?.service || ''}
          viewMode="card"
        />
      );

    case 'tag':
      return (
        <TagCard
          tag={{
            id: result.id,
            name: result.title,
            description: result.description,
            color: result.metadata?.color || '#000000',
            icon: result.metadata?.icon || 'Tag',
            isActive: result.status === 'Active',
            usageCount: result.metadata?.usageCount || 0,
            createdDate: result.metadata?.createdDate || new Date().toISOString(),
            lastModified: result.metadata?.lastModified || new Date().toISOString(),
          }}
          viewMode="grid"
          onEdit={() => {}}
          onDelete={() => {}}
          onToggleStatus={() => {}}
        />
      );

    default:
      // Fallback to generic SearchResultCard for unsupported types
      return (
        <SearchResultCard
          result={result}
          searchQuery={searchQuery}
          onNavigate={onNavigate}
          onAction={onAction}
        />
      );
  }
};
