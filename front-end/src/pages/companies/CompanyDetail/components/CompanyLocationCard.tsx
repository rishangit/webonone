import { MapPin } from "lucide-react";
import { Card } from "../../../../components/ui/card";
import { Label } from "../../../../components/ui/label";
import { GoogleMapComponent } from "../../../../components/GoogleMapComponent";
import { CardTitle } from "../../../../components/common/CardTitle";
import { Company } from "../types";

interface CompanyLocationCardProps {
  company: Company;
}

export const CompanyLocationCard = ({ company }: CompanyLocationCardProps) => {
  return (
    <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] shadow-lg">
      <CardTitle title="Location Information" icon={MapPin} className="mb-6" />

      <div className="space-y-6">
        {/* Map Integration */}
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
  );
};
