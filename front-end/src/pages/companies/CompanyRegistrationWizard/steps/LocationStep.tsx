import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { GoogleMapComponent } from "../../../../components/GoogleMapComponent";
import { WizardHeader } from "../components/WizardHeader";
import { CompanyFormData } from "../types";

interface LocationStepProps {
  formData: CompanyFormData;
  onInputChange: (field: keyof CompanyFormData, value: string) => void;
  onLocationChange: (location: {
    lat: number;
    lng: number;
    streetAddress?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  }) => void;
}

export const LocationStep = ({ formData, onInputChange, onLocationChange }: LocationStepProps) => {
  return (
    <div className="space-y-4">
      <WizardHeader
        title="Location Information"
        description="Add your business location on the map and complete address details"
      />
      
      <div className="space-y-4">
        {/* Map Integration */}
        <div>
          <Label className="text-foreground mb-2 block">Location on Map</Label>
          <GoogleMapComponent 
            address={formData.address}
            city={formData.city}
            state={formData.state}
            country={formData.country}
            editMode={true}
            height="400px"
            initialLat={formData.latitude}
            initialLng={formData.longitude}
            onLocationChange={(location) => {
              onLocationChange(location);
              
              // Update address fields with parsed location data
              if (location.streetAddress) {
                onInputChange('address', location.streetAddress);
              }
              if (location.city) {
                onInputChange('city', location.city);
              }
              if (location.state) {
                onInputChange('state', location.state);
              }
              if (location.postalCode) {
                onInputChange('postalCode', location.postalCode);
              }
              if (location.country) {
                onInputChange('country', location.country);
              }
            }}
          />
        </div>

        {/* Address Fields */}
        <div className="space-y-2">
          <Label htmlFor="address" className="text-foreground">Street Address *</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => onInputChange('address', e.target.value)}
            placeholder="123 Main Street, Suite 100"
            className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city" className="text-foreground">City *</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => onInputChange('city', e.target.value)}
              placeholder="City name"
              className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="state" className="text-foreground">State/Province *</Label>
            <Input
              id="state"
              value={formData.state}
              onChange={(e) => onInputChange('state', e.target.value)}
              placeholder="State/Province"
              className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="postalCode" className="text-foreground">Postal Code</Label>
            <Input
              id="postalCode"
              value={formData.postalCode}
              onChange={(e) => onInputChange('postalCode', e.target.value)}
              placeholder="Postal code"
              className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="country" className="text-foreground">Country *</Label>
          <Input
            id="country"
            value={formData.country}
            onChange={(e) => onInputChange('country', e.target.value)}
            placeholder="Country"
            className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
          />
        </div>
      </div>
    </div>
  );
};
