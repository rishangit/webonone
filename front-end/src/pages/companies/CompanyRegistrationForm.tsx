import { useState } from "react";
import { MapPin, Building, Phone, Mail, Globe, Users, X, Check, Upload, Camera, Trash2 } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { toast } from "sonner";

interface CompanyFormData {
  companyName: string;
  description: string;
  contactPerson: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  category: string;
  subCategory: string;
  employees: string;
  logo?: string;
}

interface CompanyRegistrationFormProps {
  onSubmit: (data: CompanyFormData) => void;
  onCancel: () => void;
}

const businessCategories = [
  {
    category: "Healthcare & Medical",
    subCategories: ["General Practice", "Dental Services", "Specialized Medicine", "Physiotherapy", "Mental Health"]
  },
  {
    category: "Beauty & Wellness", 
    subCategories: ["Hair & Beauty Salons", "Spa & Massage", "Nail Salons", "Tattoo & Piercing"]
  },
  {
    category: "Fitness & Wellness",
    subCategories: ["Fitness Centers", "Yoga Studios", "Personal Training", "Sports Medicine"]
  },
  {
    category: "Food & Beverage",
    subCategories: ["Restaurants", "Cafes", "Bakeries", "Food Trucks"]
  },
  {
    category: "Professional Services",
    subCategories: ["Legal Services", "Accounting", "Consulting", "Marketing", "Real Estate"]
  },
  {
    category: "Automotive",
    subCategories: ["Auto Repair", "Car Wash", "Auto Sales", "Towing Services"]
  },
  {
    category: "Home Services", 
    subCategories: ["Cleaning Services", "Landscaping", "Home Repair", "Moving Services"]
  },
  {
    category: "Pet Services",
    subCategories: ["Veterinary", "Pet Grooming", "Pet Training", "Pet Boarding"]
  },
  {
    category: "Education",
    subCategories: ["Training Centers", "Tutoring", "Online Learning", "Language Schools"]
  },
  {
    category: "Technology",
    subCategories: ["IT Services", "Web Development", "Software Development", "Tech Support"]
  }
];

const employeeSizes = [
  "1-5",
  "6-10",
  "11-20", 
  "21-50",
  "51-200",
  "201-500",
  "500+"
];

export function CompanyRegistrationForm({ onSubmit, onCancel }: CompanyRegistrationFormProps) {
  const [formData, setFormData] = useState<CompanyFormData>({
    companyName: "",
    description: "",
    contactPerson: "",
    email: "",
    phone: "",
    website: "",
    address: "",
    city: "",
    state: "",
    country: "United States",
    postalCode: "",
    category: "",
    subCategory: "",
    employees: "",
    logo: ""
  });

  const selectedCategory = businessCategories.find(cat => cat.category === formData.category);
  const availableSubCategories = selectedCategory ? selectedCategory.subCategories : [];

  const handleInputChange = (field: keyof CompanyFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCategoryChange = (category: string) => {
    const categoryData = businessCategories.find(cat => cat.category === category);
    setFormData(prev => ({
      ...prev,
      category: category,
      subCategory: categoryData ? categoryData.subCategories[0] : ""
    }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // In a real app, you would upload to a file storage service
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({ ...prev, logo: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
      toast.success("Logo uploaded successfully!");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    const requiredFields = ['companyName', 'description', 'contactPerson', 'email', 'phone', 'address', 'city', 'state', 'country', 'category'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof CompanyFormData]?.trim());
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Information */}
        <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
          <div className="flex items-center gap-2 mb-6">
            <Building className="w-5 h-5 text-[var(--accent-text)]" />
            <h3 className="font-semibold text-foreground">Company Information</h3>
          </div>

          <div className="space-y-4">
            {/* Logo Upload */}
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-muted rounded-lg border border-border flex items-center justify-center overflow-hidden">
                {formData.logo ? (
                  <img src={formData.logo} alt="Company Logo" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <Label className="text-foreground mb-2 block">Company Logo</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <Label
                    htmlFor="logo-upload"
                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-[var(--glass-bg)] border border-[var(--glass-border)] rounded-lg hover:bg-accent text-foreground hover:text-foreground transition-colors"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Logo
                  </Label>
                  {formData.logo && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, logo: "" }))}
                      className="bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent text-foreground hover:text-foreground"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="company-name" className="text-foreground">Company Name *</Label>
                <Input
                  id="company-name"
                  value={formData.companyName}
                  onChange={(e) => handleInputChange('companyName', e.target.value)}
                  placeholder="Enter your company name"
                  className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="contact-person" className="text-foreground">Contact Person *</Label>
                <Input
                  id="contact-person"
                  value={formData.contactPerson}
                  onChange={(e) => handleInputChange('contactPerson', e.target.value)}
                  placeholder="Primary contact person"
                  className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description" className="text-foreground">Company Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe your company and the services you provide..."
                rows={3}
                className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground resize-none"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="category" className="text-foreground">Business Category *</Label>
                <Select value={formData.category} onValueChange={handleCategoryChange} required>
                  <SelectTrigger className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {businessCategories.map((cat) => (
                      <SelectItem key={cat.category} value={cat.category}>
                        {cat.category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="sub-category" className="text-foreground">Sub Category *</Label>
                <Select 
                  value={formData.subCategory} 
                  onValueChange={(value) => handleInputChange('subCategory', value)}
                  disabled={!formData.category}
                  required
                >
                  <SelectTrigger className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground">
                    <SelectValue placeholder="Select sub category" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {availableSubCategories.map((subCat) => (
                      <SelectItem key={subCat} value={subCat}>
                        {subCat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="employees" className="text-foreground">Company Size *</Label>
                <Select value={formData.employees} onValueChange={(value) => handleInputChange('employees', value)} required>
                  <SelectTrigger className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover border-border">
                    {employeeSizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size} employees
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </Card>

        {/* Contact Information */}
        <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
          <div className="flex items-center gap-2 mb-6">
            <Phone className="w-5 h-5 text-[var(--accent-text)]" />
            <h3 className="font-semibold text-foreground">Contact Information</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email" className="text-foreground">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="company@example.com"
                  className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="phone" className="text-foreground">Phone Number *</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="website" className="text-foreground">Website URL</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                placeholder="https://yourcompany.com"
                className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
              />
            </div>
          </div>
        </Card>

        {/* Location Information */}
        <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
          <div className="flex items-center gap-2 mb-6">
            <MapPin className="w-5 h-5 text-[var(--accent-text)]" />
            <h3 className="font-semibold text-foreground">Location Information</h3>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="address" className="text-foreground">Street Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                placeholder="123 Main Street, Suite 100"
                className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city" className="text-foreground">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange('city', e.target.value)}
                  placeholder="City name"
                  className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="state" className="text-foreground">State/Province *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange('state', e.target.value)}
                  placeholder="State/Province"
                  className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="postal-code" className="text-foreground">Postal Code</Label>
                <Input
                  id="postal-code"
                  value={formData.postalCode}
                  onChange={(e) => handleInputChange('postalCode', e.target.value)}
                  placeholder="12345"
                  className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="country" className="text-foreground">Country *</Label>
              <Input
                id="country"
                value={formData.country}
                onChange={(e) => handleInputChange('country', e.target.value)}
                className="bg-[var(--input-background)] border-[var(--glass-border)] text-foreground"
                required
              />
            </div>
          </div>
        </Card>

        {/* Form Actions */}
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent text-foreground hover:text-foreground"
          >
            Cancel
          </Button>
          
          <Button
            type="submit"
            className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:from-[var(--accent-primary-hover)] hover:to-[var(--accent-primary)] text-[var(--accent-button-text)] shadow-lg shadow-[var(--accent-primary)]/25"
          >
            <Check className="w-4 h-4 mr-2" />
            Submit Registration
          </Button>
        </div>
      </form>
    </div>
  );
}