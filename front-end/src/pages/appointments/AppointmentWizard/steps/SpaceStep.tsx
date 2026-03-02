import { MapPin, Users, Search, Check } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { Card } from "../../../../components/ui/card";
import { Input } from "../../../../components/ui/input";
import { Badge } from "../../../../components/ui/badge";
import { ViewSwitcher } from "../../../../components/ui/view-switcher";
import { ImageWithFallback } from "../../../../components/figma/ImageWithFallback";
import { formatAvatarUrl } from "../../../../utils";
import { toast } from "sonner";

interface SpaceStepProps {
  spaces: any[];
  spacesLoading: boolean;
  spacesError: string | null;
  activeSpaces: any[];
  filteredActiveSpaces: any[];
  selectedSpace: string;
  setSelectedSpace: (space: string) => void;
  spaceSearchQuery: string;
  setSpaceSearchQuery: (query: string) => void;
  spaceViewMode: "grid" | "list";
  setSpaceViewMode: (mode: "grid" | "list") => void;
  companyId?: string;
  isCompanyOwner: boolean;
  onRetry: () => void;
}

export const SpaceStep = ({
  spaces,
  spacesLoading,
  spacesError,
  activeSpaces,
  filteredActiveSpaces,
  selectedSpace,
  setSelectedSpace,
  spaceSearchQuery,
  setSpaceSearchQuery,
  spaceViewMode,
  setSpaceViewMode,
  isCompanyOwner,
  onRetry
}: SpaceStepProps) => {
  // Get image URL - handle both imageUrl property, and format if needed
  const getImageUrl = (space: any) => {
    const imageSrc = space.imageUrl;
    if (!imageSrc) return undefined;
    // Check if it's a URL path that needs formatting
    if (imageSrc.startsWith('companies/') || imageSrc.startsWith('/uploads/')) {
      return formatAvatarUrl(imageSrc);
    }
    return imageSrc;
  };

  if (spacesLoading) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-sm">Loading spaces...</p>
      </div>
    );
  }

  if (spacesError) {
    return (
      <div className="text-center py-8">
        <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50 text-red-500" />
        <p className="text-sm text-red-600 dark:text-red-400 mb-2">Error loading spaces</p>
        <p className="text-xs text-muted-foreground">{spacesError}</p>
        <Button
          variant="outline"
          size="sm"
          className="mt-4"
          onClick={onRetry}
        >
          Retry
        </Button>
      </div>
    );
  }

  if (activeSpaces.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">
          {spaces.length === 0 
            ? "No spaces available." 
            : `No active spaces available. Found ${spaces.length} space(s) but none are active.`}
        </p>
        {isCompanyOwner && (
          <p className="text-xs mt-2">
            <Button
              variant="link"
              className="text-[var(--accent-text)] p-0 h-auto"
              onClick={() => {
                toast.info("Please add spaces from the Spaces page");
              }}
            >
              Add spaces
            </Button>
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Search Input and View Switcher */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search spaces by name or description..."
            value={spaceSearchQuery}
            onChange={(e) => setSpaceSearchQuery(e.target.value)}
            className="pl-10 bg-[var(--glass-bg)] border-[var(--glass-border)] focus:border-[var(--accent-border)]"
          />
        </div>
        <ViewSwitcher 
          viewMode={spaceViewMode} 
          onViewModeChange={setSpaceViewMode}
        />
      </div>

      {/* Spaces Count */}
      {spaceSearchQuery && (
        <div className="text-xs text-muted-foreground">
          Found {filteredActiveSpaces.length} of {activeSpaces.length} space{activeSpaces.length !== 1 ? 's' : ''}
        </div>
      )}

      {/* Spaces Grid/List */}
      {filteredActiveSpaces.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No spaces found matching "{spaceSearchQuery}"</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-4"
            onClick={() => setSpaceSearchQuery("")}
          >
            Clear search
          </Button>
        </div>
      ) : spaceViewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredActiveSpaces.map((space) => (
            <Card
              key={space.id}
              className={`cursor-pointer transition-all duration-200 touch-manipulation ${
                selectedSpace === space.id 
                  ? 'border-[var(--accent-border)] bg-[var(--accent-bg)] ring-2 ring-[var(--accent-border)]' 
                  : 'border-[var(--glass-border)] bg-[var(--glass-bg)] hover:border-[var(--accent-border)] active:bg-[var(--accent-bg)]'
              }`}
              onClick={() => setSelectedSpace(space.id)}
            >
              <div className="aspect-video relative overflow-hidden rounded-t-lg">
                <ImageWithFallback
                  src={getImageUrl(space)}
                  alt={space.name}
                  className="w-full h-full object-cover"
                  fallbackSrc="https://images.unsplash.com/photo-1703355685952-03ed19f70f51?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjBtZWV0aW5nJTIwcm9vbXxlbnwxfHx8fDE3NTkwNDU2NzF8MA&ixlib=rb-4.1.0&q=80&w=1080"
                />
                {space.status && (
                  <div className="absolute top-2 right-2">
                    <Badge className="bg-[var(--accent-bg)] text-[var(--accent-text)] border-[var(--accent-border)] text-xs">
                      {space.status}
                    </Badge>
                  </div>
                )}
                {selectedSpace === space.id && (
                  <div className="absolute inset-0 bg-[var(--accent-primary)]/20 flex items-center justify-center">
                    <div className="w-8 h-8 bg-[var(--accent-primary)] text-white rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5" />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-3 space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="font-medium text-foreground text-sm">{space.name}</h4>
                </div>
                
                {space.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {space.description}
                  </p>
                )}
                
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="w-3 h-3" />
                    <span>Capacity: {space.capacity}</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredActiveSpaces.map((space) => (
            <Card
              key={space.id}
              className={`cursor-pointer transition-all duration-200 touch-manipulation ${
                selectedSpace === space.id 
                  ? 'border-[var(--accent-border)] bg-[var(--accent-bg)] ring-2 ring-[var(--accent-border)]' 
                  : 'border-[var(--glass-border)] bg-[var(--glass-bg)] hover:border-[var(--accent-border)] active:bg-[var(--accent-bg)]'
              }`}
              onClick={() => setSelectedSpace(space.id)}
            >
              <div className="flex items-start gap-4 p-4">
                {/* Space Image */}
                <div className="flex-shrink-0 relative overflow-hidden rounded-lg w-24 h-20">
                  <ImageWithFallback
                    src={getImageUrl(space)}
                    alt={space.name}
                    className="w-full h-full object-cover"
                    fallbackSrc="https://images.unsplash.com/photo-1703355685952-03ed19f70f51?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjBtZWV0aW5nJTIwcm9vbXxlbnwxfHx8fDE3NTkwNDU2NzF8MA&ixlib=rb-4.1.0&q=80&w=1080"
                  />
                  {selectedSpace === space.id && (
                    <div className="absolute inset-0 bg-[var(--accent-primary)]/20 flex items-center justify-center">
                      <div className="w-6 h-6 bg-[var(--accent-primary)] text-white rounded-full flex items-center justify-center">
                        <Check className="w-4 h-4" />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Space Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-foreground text-base mb-1">{space.name}</h4>
                      {space.status && (
                        <Badge className="bg-[var(--accent-bg)] text-[var(--accent-text)] border-[var(--accent-border)] text-xs mb-2">
                          {space.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {space.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {space.description}
                    </p>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="w-3 h-3" />
                      <span>Capacity: {space.capacity}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
