import { useState, useEffect, useRef } from "react";
import { MapPin, Search, Navigation, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";

interface GoogleMapComponentProps {
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  initialLat?: number | null;
  initialLng?: number | null;
  onLocationChange?: (location: { 
    lat: number; 
    lng: number; 
    address: string;
    streetAddress?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  }) => void;
  editMode?: boolean;
  height?: string;
}

interface MapLocation {
  lat: number;
  lng: number;
  address: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export function GoogleMapComponent({ 
  address, 
  city, 
  state, 
  country,
  initialLat,
  initialLng,
  onLocationChange, 
  editMode = false,
  height = "300px"
}: GoogleMapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);
  const [currentLocation, setCurrentLocation] = useState<MapLocation>({
    lat: 37.7749,
    lng: -122.4194,
    address: "Loading...",
    streetAddress: "",
    city: "",
    state: "",
    postalCode: "",
    country: ""
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Load Google Maps script
  useEffect(() => {
    if (isScriptLoaded || !apiKey) return;

    // Check if script already exists
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      // Script already loaded, check if Google Maps is available
      if (window.google && window.google.maps) {
        setIsScriptLoaded(true);
      }
      return;
    }

    // Create unique callback name
    const callbackName = `initMap_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Set up callback before creating script
    const callback = () => {
      setIsScriptLoaded(true);
      // Clean up callback after use
      try {
        delete (window as any)[callbackName];
      } catch (e) {
        // Ignore cleanup errors
      }
    };
    
    (window as any)[callbackName] = callback;

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=${callbackName}`;
    script.async = true;
    script.defer = true;
    script.id = 'google-maps-script';
    script.onerror = () => {
      console.error('Failed to load Google Maps script');
      setIsScriptLoaded(false);
    };

    document.head.appendChild(script);

    return () => {
      // Don't remove the script on cleanup - it's shared across components
      // The script should remain in the DOM for other components to use
    };
  }, [apiKey, isScriptLoaded]);

  // Initialize map when script is loaded
  useEffect(() => {
    if (!isScriptLoaded || !mapContainerRef.current || !window.google || !window.google.maps) return;

    let clickListener: any = null;
    let dragListener: any = null;
    let isMounted = true;

    // Clean up existing map instance if it exists
    if (mapInstanceRef.current) {
      try {
        // Clear all listeners
        if (window.google.maps.event) {
          window.google.maps.event.clearInstanceListeners(mapInstanceRef.current);
        }
        if (markerRef.current) {
          if (window.google.maps.event) {
            window.google.maps.event.clearInstanceListeners(markerRef.current);
          }
          markerRef.current.setMap(null);
        }
        // Clear the map instance
        mapInstanceRef.current = null;
      } catch (e) {
        // Ignore cleanup errors
      }
    }

    // Only initialize if component is still mounted and ref is valid
    if (!isMounted || !mapContainerRef.current) return;

    // Use initial coordinates if provided, otherwise use default
    const defaultLocation = {
      lat: initialLat !== undefined && initialLat !== null ? initialLat : 37.7749,
      lng: initialLng !== undefined && initialLng !== null ? initialLng : -122.4194
    };

    // Initialize map - wrap in try-catch to handle any initialization errors
    try {
      // Use the inner container div that Google Maps will control
      const mapContainer = mapContainerRef.current;
      
      if (mapContainer) {
        // Google Maps will take over this div's content
        mapInstanceRef.current = new window.google.maps.Map(mapContainer, {
          center: defaultLocation,
          zoom: 13,
          mapTypeControl: true,
          streetViewControl: false,
          fullscreenControl: false,
          zoomControl: false,
          // Remove custom styles to show natural map colors
        });

        // Initialize geocoder
        geocoderRef.current = new window.google.maps.Geocoder();

        // Initialize marker
        markerRef.current = new window.google.maps.Marker({
          map: mapInstanceRef.current,
          draggable: editMode,
          animation: window.google.maps.Animation.DROP
        });

        // Add click listener for edit mode
        if (editMode && mapInstanceRef.current) {
          clickListener = mapInstanceRef.current.addListener('click', (e: any) => {
            if (e.latLng && isMounted) {
              const location = {
                lat: e.latLng.lat(),
                lng: e.latLng.lng()
              };
              updateMarker(location);
              reverseGeocode(location);
            }
          });

          if (markerRef.current) {
            dragListener = markerRef.current.addListener('dragend', (e: any) => {
              if (e.latLng && isMounted) {
                const location = {
                  lat: e.latLng.lat(),
                  lng: e.latLng.lng()
                };
                reverseGeocode(location);
              }
            });
          }
        }

        if (isMounted) {
          setIsMapLoaded(true);
        }
      }
    } catch (error) {
      console.error('Error initializing Google Map:', error);
      if (isMounted) {
        setIsMapLoaded(false);
      }
    }

    // Cleanup function
    return () => {
      isMounted = false;
      
      // Remove event listeners safely
      if (clickListener && window.google?.maps?.event) {
        try {
          window.google.maps.event.removeListener(clickListener);
        } catch (e) {
          // Ignore errors during cleanup
        }
        clickListener = null;
      }
      if (dragListener && window.google?.maps?.event) {
        try {
          window.google.maps.event.removeListener(dragListener);
        } catch (e) {
          // Ignore errors during cleanup
        }
        dragListener = null;
      }
      
      // Clear marker from map
      if (markerRef.current) {
        try {
          markerRef.current.setMap(null);
        } catch (e) {
          // Ignore errors during cleanup
        }
        markerRef.current = null;
      }
      
      // Clear map instance listeners and nullify
      if (mapInstanceRef.current) {
        try {
          if (window.google?.maps?.event) {
            window.google.maps.event.clearInstanceListeners(mapInstanceRef.current);
          }
        } catch (e) {
          // Ignore errors during cleanup
        }
        mapInstanceRef.current = null;
      }
      
      geocoderRef.current = null;
      setIsMapLoaded(false);
    };
  }, [isScriptLoaded, editMode]);

  // Geocode address to coordinates
  const geocodeAddress = (addressString: string) => {
    if (!geocoderRef.current) return;

    geocoderRef.current.geocode({ address: addressString }, (results: any[], status: string) => {
      if (status === 'OK' && results[0]) {
        const newLocation = parseAddressComponents(results[0]);
        setCurrentLocation(newLocation);
        updateMarker(newLocation);
        onLocationChange?.(newLocation);
      } else {
        console.error('Geocoding failed:', status);
      }
    });
  };

  // Helper function to parse address components from Google Geocoding result
  const parseAddressComponents = (result: any): MapLocation => {
    const addressComponents = result.address_components || [];
    let streetAddress = "";
    let city = "";
    let state = "";
    let postalCode = "";
    let country = "";

    // Build street address from street_number and route
    const streetNumber = addressComponents.find((comp: any) => comp.types.includes('street_number'))?.long_name || "";
    const route = addressComponents.find((comp: any) => comp.types.includes('route'))?.long_name || "";
    streetAddress = [streetNumber, route].filter(Boolean).join(" ").trim();

    // Get city (locality or administrative_area_level_2)
    city = addressComponents.find((comp: any) => 
      comp.types.includes('locality') || comp.types.includes('administrative_area_level_2')
    )?.long_name || "";

    // Get state (administrative_area_level_1)
    state = addressComponents.find((comp: any) => 
      comp.types.includes('administrative_area_level_1')
    )?.long_name || "";

    // Get postal code
    postalCode = addressComponents.find((comp: any) => 
      comp.types.includes('postal_code')
    )?.long_name || "";

    // Get country
    country = addressComponents.find((comp: any) => 
      comp.types.includes('country')
    )?.long_name || "";

    return {
      lat: result.geometry.location.lat(),
      lng: result.geometry.location.lng(),
      address: result.formatted_address,
      streetAddress,
      city,
      state,
      postalCode,
      country
    };
  };

  // Reverse geocode coordinates to address
  const reverseGeocode = (location: { lat: number; lng: number }) => {
    if (!geocoderRef.current) return;

    geocoderRef.current.geocode({ location }, (results: any[], status: string) => {
      if (status === 'OK' && results[0]) {
        const newLocation = parseAddressComponents(results[0]);
        setCurrentLocation(newLocation);
        onLocationChange?.(newLocation);
      }
    });
  };

  // Update marker position
  const updateMarker = (location: { lat: number; lng: number }) => {
    if (markerRef.current && mapInstanceRef.current) {
      markerRef.current.setPosition(location);
      mapInstanceRef.current.setCenter(location);
    }
  };

  // Update map when address props change or initial coordinates are provided
  useEffect(() => {
    if (!isMapLoaded) return;

    // If initial coordinates are provided, use them instead of geocoding
    if (initialLat !== undefined && initialLat !== null && initialLng !== undefined && initialLng !== null) {
      const location = {
        lat: initialLat,
        lng: initialLng
      };
      updateMarker(location);
      reverseGeocode(location);
    } else if (geocoderRef.current) {
      const addressParts = [address, city, state, country].filter(Boolean);
      if (addressParts.length > 0) {
        const fullAddress = addressParts.join(', ');
        geocodeAddress(fullAddress);
      }
    }
  }, [address, city, state, country, isMapLoaded, initialLat, initialLng]);

  // Handle search with Places Autocomplete
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (!window.google || !window.google.maps || !window.google.maps.places) return;

    if (query.length > 2) {
      const service = new window.google.maps.places.AutocompleteService();
      service.getPlacePredictions(
        { input: query },
        (predictions: any[], status: string) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
            // Use first prediction to geocode
            const placeId = predictions[0].place_id;
            const placesService = new window.google.maps.places.PlacesService(mapInstanceRef.current);
            
            placesService.getDetails(
              { placeId, fields: ['geometry', 'formatted_address', 'address_components'] },
              (place: any, placeStatus: string) => {
                if (placeStatus === window.google.maps.places.PlacesServiceStatus.OK && place.geometry) {
                  const newLocation = parseAddressComponents(place);
                  setCurrentLocation(newLocation);
                  updateMarker(newLocation);
                  onLocationChange?.(newLocation);
                  setSearchQuery("");
                }
              }
            );
          }
        }
      );
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          updateMarker(location);
          reverseGeocode(location);
        },
        (error) => {
          console.error("Geolocation error:", error);
          toast.error("Unable to get your current location");
        }
      );
    }
  };

  const resetView = () => {
    if (mapInstanceRef.current && currentLocation) {
      mapInstanceRef.current.setCenter({ lat: currentLocation.lat, lng: currentLocation.lng });
      mapInstanceRef.current.setZoom(13);
    }
  };

  if (!apiKey) {
    return (
      <div className="w-full rounded-lg border border-[var(--glass-border)] bg-[var(--input-background)] flex items-center justify-center p-8" style={{ height }}>
        <p className="text-muted-foreground">Google Maps API key not configured</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      {editMode && (
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search for an address or place..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
            />
          </div>
        </div>
      )}

      {/* Map Container */}
      <div className="relative">
        <div 
          ref={mapRef}
          className="relative w-full rounded-lg border border-[var(--glass-border)] overflow-hidden"
          style={{ height }}
        >
          {/* Inner div that Google Maps will control - React won't try to manage its children */}
          <div 
            ref={mapContainerRef}
            className="w-full h-full"
            style={{ minHeight: height }}
          />
          {!isMapLoaded && (
            <div className="w-full h-full bg-[var(--input-background)] flex items-center justify-center pointer-events-none absolute inset-0 z-10">
              <p className="text-muted-foreground">Loading map...</p>
            </div>
          )}
        </div>

        {/* Map Controls */}
        {isMapLoaded && (
          <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
            {editMode && (
              <Button
                size="icon"
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation();
                  getCurrentLocation();
                }}
                className="w-8 h-8 bg-background/90 hover:bg-background border-border"
                title="Get current location"
              >
                <Navigation className="w-4 h-4" />
              </Button>
            )}
            <Button
              size="icon"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                resetView();
              }}
              className="w-8 h-8 bg-background/90 hover:bg-background border-border"
              title="Reset view"
            >
              <RotateCcw className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Location Info */}
      {isMapLoaded && (
        <div className="p-3 bg-[var(--accent-bg)] border border-[var(--accent-border)] rounded-lg">
          <div className="flex items-start gap-2">
            <MapPin className="w-4 h-4 text-[var(--accent-text)] mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground break-words">
                {currentLocation.address}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Coordinates: {currentLocation.lat.toFixed(6)}, {currentLocation.lng.toFixed(6)}
              </p>
              {editMode && (
                <p className="text-xs text-[var(--accent-text)] mt-1">
                  {markerRef.current?.getDraggable() ? 'Drag the marker or click on the map to update location' : 'Click on the map to set location'}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
