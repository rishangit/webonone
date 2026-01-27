import { useState, useEffect, useMemo } from "react";
import { Search, Filter, X, Clock, TrendingUp, Zap, MoreHorizontal } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { Badge } from "../../components/ui/badge";
import { SearchResultCard } from "./SearchResultCard";
import { toast } from "sonner";

// Mock search data - in a real app this would come from an API
const mockSearchData = [
  // Users
  {
    id: "user_1",
    type: "user" as const,
    title: "Sarah Johnson",
    subtitle: "Company Owner",
    description: "Experienced beauty salon owner with over 10 years in the industry. Specializes in hair styling and color treatments.",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
    status: "Active",
    metadata: {
      location: "Los Angeles, CA",
      category: "Business Owner",
      tags: ["Beauty", "Management", "Color Treatments"]
    },
    relevanceScore: 0.95
  },
  {
    id: "user_2",
    type: "user" as const,
    title: "Dr. Michael Chen",
    subtitle: "Dental Practice Owner",
    description: "Licensed dentist and clinic owner specializing in general and cosmetic dentistry with 15+ years experience.",
    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face",
    status: "Active",
    metadata: {
      location: "San Francisco, CA",
      category: "Healthcare Provider",
      tags: ["Dentistry", "Cosmetic", "General Practice"]
    },
    relevanceScore: 0.88
  },
  // Appointments
  {
    id: "apt_1",
    type: "appointment" as const,
    title: "Dental Cleaning with Dr. Sarah Johnson",
    subtitle: "Patient: Emma Wilson",
    description: "Regular dental cleaning and checkup appointment. Includes professional cleaning, examination, and fluoride treatment.",
    status: "Confirmed",
    metadata: {
      date: "2024-12-15",
      time: "2:00 PM",
      location: "Dental Care Center",
      price: 150,
      category: "Dental Care"
    },
    relevanceScore: 0.92
  },
  {
    id: "apt_2",
    type: "appointment" as const,
    title: "Hair Color Treatment",
    subtitle: "Client: Jennifer Lopez",
    description: "Full hair color treatment with highlights and professional styling. Includes consultation and aftercare products.",
    status: "Scheduled",
    metadata: {
      date: "2024-12-20",
      time: "10:00 AM",
      location: "Beauty Space Salon",
      price: 280,
      category: "Beauty Services"
    },
    relevanceScore: 0.87
  },
  // Products
  {
    id: "prod_1",
    type: "product" as const,
    title: "Professional Hair Dye - Blonde #12",
    subtitle: "Premium Hair Color",
    description: "High-quality professional hair dye for salon use. Long-lasting color with minimal damage and excellent coverage.",
    status: "In Stock",
    metadata: {
      price: 45.99,
      category: "Hair Care",
      tags: ["Professional", "Blonde", "Color Treatment"]
    },
    relevanceScore: 0.83
  },
  {
    id: "prod_2",
    type: "product" as const,
    title: "Dental Cleaning Kit Pro",
    subtitle: "Professional Dental Tools",
    description: "Complete professional dental cleaning kit with ultrasonic scaler, polishing tools, and sterilization equipment.",
    status: "Available",
    metadata: {
      price: 1299.99,
      category: "Dental Equipment",
      tags: ["Professional", "Cleaning", "Ultrasonic"]
    },
    relevanceScore: 0.76
  },
  // Services
  {
    id: "serv_1",
    type: "service" as const,
    title: "Complete Dental Examination",
    subtitle: "Comprehensive Checkup",
    description: "Thorough dental examination including X-rays, oral cancer screening, and personalized treatment planning.",
    status: "Available",
    metadata: {
      price: 125,
      category: "Dental Services",
      tags: ["Examination", "X-rays", "Screening"]
    },
    relevanceScore: 0.91
  },
  {
    id: "serv_2",
    type: "service" as const,
    title: "Premium Hair Styling Package",
    subtitle: "Cut, Color & Style",
    description: "Complete hair transformation package including consultation, cut, color, and professional styling with premium products.",
    status: "Bookable",
    metadata: {
      price: 350,
      category: "Beauty Services",
      tags: ["Hair Styling", "Color", "Premium"]
    },
    relevanceScore: 0.89
  },
  // Companies
  {
    id: "comp_1",
    type: "company" as const,
    title: "Beauty Space Salon",
    subtitle: "Premium Beauty Services",
    description: "Award-winning beauty salon offering hair styling, coloring, treatments, and spa services in a luxurious environment.",
    avatar: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=100&h=100&fit=crop",
    status: "Active",
    metadata: {
      location: "Los Angeles, CA",
      category: "Beauty & Wellness",
      tags: ["Hair Salon", "Spa", "Beauty Treatments"]
    },
    relevanceScore: 0.94
  },
  {
    id: "comp_2",
    type: "company" as const,
    title: "Dental Care Center",
    subtitle: "Modern Dental Practice",
    description: "State-of-the-art dental facility providing comprehensive oral healthcare with the latest technology and techniques.",
    avatar: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?w=100&h=100&fit=crop",
    status: "Active",
    metadata: {
      location: "San Francisco, CA",
      category: "Healthcare",
      tags: ["Dental Care", "Modern", "Technology"]
    },
    relevanceScore: 0.86
  },
  // Staff
  {
    id: "staff_1",
    type: "staff" as const,
    title: "Alex Johnson",
    subtitle: "Senior Hair Stylist",
    description: "Experienced hair stylist specializing in color treatments and modern cuts. 8+ years of professional experience.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    status: "Available",
    metadata: {
      location: "Beauty Space Salon",
      category: "Hair Stylist",
      tags: ["Color Treatments", "Hair Extensions", "Modern Cuts"]
    },
    relevanceScore: 0.85
  },
  {
    id: "staff_2",
    type: "staff" as const,
    title: "Dr. Jennifer Anderson",
    subtitle: "Associate Dentist",
    description: "Specialist in pediatric and family dentistry with focus on preventive care and patient comfort.",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face",
    status: "Active",
    metadata: {
      location: "Dental Care Center",
      category: "Dentist",
      tags: ["Pediatric", "Family Dentistry", "Preventive Care"]
    },
    relevanceScore: 0.82
  },
  // Notifications
  {
    id: "notif_1",
    type: "notification" as const,
    title: "Appointment Reminder",
    subtitle: "Upcoming dental cleaning",
    description: "You have an appointment with Dr. Sarah Johnson tomorrow at 2:00 PM for dental cleaning. Please arrive 15 minutes early.",
    status: "Unread",
    metadata: {
      date: "2024-12-10",
      time: "2:00 PM",
      category: "Reminder"
    },
    relevanceScore: 0.79
  },
  // Spaces
  {
    id: "space_1",
    type: "space" as const,
    title: "Treatment Room A",
    subtitle: "Dental Treatment Room",
    description: "Fully equipped dental treatment room with modern equipment, sterilization station, and patient comfort amenities.",
    status: "Available",
    metadata: {
      location: "Dental Care Center - Floor 1",
      category: "Treatment Room",
      tags: ["Dental", "Sterilization", "Modern Equipment"]
    },
    relevanceScore: 0.74
  },
  {
    id: "space_2",
    type: "space" as const,
    title: "Hair Styling Station 3",
    subtitle: "Premium Styling Station",
    description: "Professional hair styling station with premium lighting, ergonomic design, and all necessary tools for color treatments.",
    status: "Occupied",
    metadata: {
      location: "Beauty Space Salon - Main Floor",
      category: "Styling Station",
      tags: ["Hair Styling", "Color Treatments", "Premium"]
    },
    relevanceScore: 0.78
  },
  // Categories
  {
    id: "cat_1",
    type: "category" as const,
    title: "Hair Color Treatments",
    subtitle: "Professional Hair Coloring",
    description: "Complete range of professional hair coloring services including highlights, lowlights, balayage, and color correction.",
    status: "Active",
    metadata: {
      category: "Beauty Services",
      tags: ["Hair Color", "Highlights", "Balayage", "Color Correction"]
    },
    relevanceScore: 0.81
  }
];

interface SearchPageProps {
  currentUser?: {
    email: string;
    role: string;
    name: string;
  } | null;
  onNavigate?: (page: string, params?: any) => void;
}

export function SearchPage({ currentUser, onNavigate }: SearchPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("all");
  const [sortBy, setSortBy] = useState("relevance");
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([
    "dental cleaning",
    "hair color treatment",
    "Dr. Sarah Johnson",
    "appointment tomorrow"
  ]);

  // Load initial search query from sessionStorage (from header search)
  useEffect(() => {
    const initialQuery = sessionStorage.getItem("searchQuery");
    if (initialQuery) {
      setSearchQuery(initialQuery);
      // Add to recent searches if not already there
      setRecentSearches(prev => {
        if (!prev.includes(initialQuery)) {
          return [initialQuery, ...prev.slice(0, 9)];
        }
        return prev;
      });
      // Clear the session storage after loading
      sessionStorage.removeItem("searchQuery");
    }
  }, []);

  // Filter and search results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    let filtered = mockSearchData.filter(item => {
      const searchableText = `${item.title} ${item.subtitle} ${item.description} ${item.metadata?.tags?.join(' ') || ''}`.toLowerCase();
      const query = searchQuery.toLowerCase();
      
      const matchesQuery = searchableText.includes(query);
      const matchesType = searchType === "all" || item.type === searchType;
      
      return matchesQuery && matchesType;
    });

    // Sort results
    switch (sortBy) {
      case "relevance":
        filtered.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
        break;
      case "alphabetical":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "type":
        filtered.sort((a, b) => a.type.localeCompare(b.type));
        break;
      case "recent":
        // Would sort by last accessed/modified date in real app
        filtered.sort((a, b) => a.id.localeCompare(b.id));
        break;
    }

    return filtered;
  }, [searchQuery, searchType, sortBy]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Add to recent searches
      if (!recentSearches.includes(query)) {
        setRecentSearches(prev => [query, ...prev.slice(0, 9)]); // Keep last 10 searches
      }
    } catch (error) {
      console.error('Search error:', error);
      toast.error("Search failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(searchQuery);
    }
  };

  const handleRecentSearchClick = (query: string) => {
    setSearchQuery(query);
    handleSearch(query);
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    toast.success("Recent searches cleared");
  };

  const handleResultNavigate = (type: string, id: string) => {
    if (onNavigate) {
      // Map search result types to page routes
      const pageMap: Record<string, string> = {
        'user': 'users',
        'appointment': 'appointments', 
        'notification': 'notifications',
        'product': 'products',
        'service': 'services',
        'company': 'companies',
        'staff': 'staff',
        'space': 'spaces',
        'category': 'categories'
      };
      
      const page = pageMap[type] || 'dashboard';
      onNavigate(page, { selectedId: id });
      toast.success(`Opening ${type}: ${id}`);
    }
  };

  const handleResultAction = (type: string, id: string, action: string) => {
    toast.info(`Action: ${action} on ${type} ${id}`);
  };

  const getSearchStats = () => {
    const totalResults = searchResults.length;
    const typeBreakdown = searchResults.reduce((acc, result) => {
      acc[result.type] = (acc[result.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { totalResults, typeBreakdown };
  };

  const stats = getSearchStats();

  return (
    <div className="flex-1 space-y-4 md:space-y-6 p-3 sm:p-4 lg:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-semibold text-foreground flex items-center gap-2">
            <Search className="w-5 h-5 md:w-6 md:h-6 text-[var(--accent-text)] shrink-0" />
            <span className="truncate">Global Search</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Search across all users, appointments, products, services and more
          </p>
        </div>
        {searchQuery && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground shrink-0">
            <TrendingUp className="w-4 h-4" />
            <span className="whitespace-nowrap">{stats.totalResults} results</span>
          </div>
        )}
      </div>

      {/* Search Bar */}
      <Card className="p-4 md:p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
        <div className="space-y-3 md:space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 md:w-5 md:h-5 pointer-events-none" />
            <Input 
              placeholder="Search for anything..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10 md:pl-12 pr-10 md:pr-12 h-11 md:h-12 text-base md:text-lg bg-[var(--input-background)] border-[var(--glass-border)] hover:border-[var(--accent-border)] focus:border-[var(--accent-border)]"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 md:right-3 top-1/2 transform -translate-y-1/2 h-7 w-7 md:h-6 md:w-6 hover:bg-accent/50"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-3 w-3 md:h-4 md:w-4" />
              </Button>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-2 md:gap-3 sm:items-center">
            <Select value={searchType} onValueChange={setSearchType}>
              <SelectTrigger className="sm:w-48 bg-[var(--glass-bg)] border-[var(--glass-border)] hover:border-[var(--accent-border)]">
                <SelectValue placeholder="Search in..." />
              </SelectTrigger>
              <SelectContent className="backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="user">Users</SelectItem>
                <SelectItem value="appointment">Appointments</SelectItem>
                <SelectItem value="product">Products</SelectItem>
                <SelectItem value="service">Services</SelectItem>
                <SelectItem value="company">Companies</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="notification">Notifications</SelectItem>
                <SelectItem value="space">Spaces</SelectItem>
                <SelectItem value="category">Categories</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="sm:w-40 bg-[var(--glass-bg)] border-[var(--glass-border)] hover:border-[var(--accent-border)]">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent className="backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
                <SelectItem value="relevance">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Relevance
                  </div>
                </SelectItem>
                <SelectItem value="alphabetical">A-Z</SelectItem>
                <SelectItem value="type">Type</SelectItem>
                <SelectItem value="recent">Recent</SelectItem>
              </SelectContent>
            </Select>

            <Button
              onClick={() => handleSearch(searchQuery)}
              disabled={!searchQuery.trim() || loading}
              className="w-full sm:w-auto bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:from-[var(--accent-primary-hover)] hover:to-[var(--accent-primary)] text-[var(--accent-button-text)] h-10 md:h-auto"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              Search
            </Button>
          </div>
        </div>
      </Card>

      {/* Recent Searches & Quick Actions */}
      {!searchQuery && recentSearches.length > 0 && (
        <Card className="p-4 md:p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
          <div className="flex items-center justify-between mb-3 md:mb-4">
            <h3 className="text-sm md:text-base font-medium text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-[var(--accent-text)] shrink-0" />
              <span>Recent Searches</span>
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearRecentSearches}
              className="text-muted-foreground hover:text-foreground text-xs md:text-sm h-8"
            >
              Clear All
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {recentSearches.map((search, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => handleRecentSearchClick(search)}
                className="bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] text-xs md:text-sm h-8 md:h-9"
              >
                <Search className="w-3 h-3 mr-1 shrink-0" />
                <span className="truncate max-w-[120px] md:max-w-none">{search}</span>
              </Button>
            ))}
          </div>
        </Card>
      )}

      {/* Search Results */}
      {searchQuery && (
        <>
          {/* Results Summary */}
          {searchResults.length > 0 && (
            <Card className="p-3 md:p-4 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 md:gap-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 md:gap-4 min-w-0">
                  <span className="text-sm md:text-base font-medium text-foreground truncate">
                    {stats.totalResults} results for "<span className="text-[var(--accent-text)]">{searchQuery}</span>"
                  </span>
                  <div className="flex flex-wrap gap-1 md:gap-2">
                    {Object.entries(stats.typeBreakdown).map(([type, count]) => (
                      <Badge key={type} variant="outline" className="text-xs">
                        {type}: {count}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="text-xs md:text-sm text-muted-foreground shrink-0">
                  {loading ? "Searching..." : `Found in ${Math.random() * 100 + 50 | 0}ms`}
                </div>
              </div>
            </Card>
          )}

          {/* Results List */}
          {searchResults.length > 0 ? (
            <div className="space-y-4">
              {searchResults.map((result) => (
                <SearchResultCard
                  key={result.id}
                  result={result}
                  searchQuery={searchQuery}
                  onNavigate={handleResultNavigate}
                  onAction={handleResultAction}
                />
              ))}
            </div>
          ) : searchQuery && !loading ? (
            <Card className="p-12 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] text-center">
              <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No results found</h3>
              <p className="text-muted-foreground mb-6">
                We couldn't find anything matching "{searchQuery}". Try different keywords or search terms.
              </p>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Suggestions:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button variant="outline" size="sm" onClick={() => setSearchQuery("appointments")}>
                    Search appointments
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSearchQuery("services")}>
                    Search services
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSearchQuery("users")}>
                    Search users
                  </Button>
                </div>
              </div>
            </Card>
          ) : null}
        </>
      )}
    </div>
  );
}