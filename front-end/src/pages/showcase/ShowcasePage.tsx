"use client";

import { useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../../components/ui/select";
import { MultiSelect } from "../../components/ui/multi-select";
import { Checkbox } from "../../components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "../../components/ui/radio-group";
import { Switch } from "../../components/ui/switch";
import { Slider } from "../../components/ui/slider";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../components/ui/card";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../../components/ui/alert-dialog";
import { CustomDialog } from "../../components/ui/custom-dialog";
import { Popover, PopoverContent, PopoverTrigger } from "../../components/ui/popover";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "../../components/ui/sheet";
import { RightPanel } from "../../components/common/RightPanel";
import { EmptyState } from "../../components/common/EmptyState";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { Separator } from "../../components/ui/separator";
import { Progress } from "../../components/ui/progress";
import { Skeleton } from "../../components/ui/skeleton";
import { 
  Package, 
  Plus, 
  Trash2, 
  Edit, 
  Info,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Moon,
  Sun,
  Monitor,
  Clock,
  Building,
  DollarSign,
  Stethoscope,
  ShoppingCart,
  Users,
  UserCheck
} from "lucide-react";
import type { Theme, AccentColor } from "../../types";
import { ViewSwitcher } from "../../components/ui/view-switcher";
import { AppointmentCard } from "../appointments/AppointmentCard";
import { CompanyCard } from "../companies/CompanyCard";
import { CompanyListItem } from "../companies/CompanyListItem";
import { CompanyProductCard } from "../products/CompanyProductCard";
import { UserCard } from "../users/UserCard";
import { AppointmentStatus } from "../../types/appointmentStatus";

interface ShowcasePageProps {
  onThemeChange?: (theme: Theme) => void;
  currentTheme?: Theme;
  onAccentColorChange?: (accentColor: AccentColor) => void;
  currentAccentColor?: AccentColor;
}

const ShowcasePage = ({ 
  onThemeChange, 
  currentTheme = "dark", 
  onAccentColorChange, 
  currentAccentColor = "orange" 
}: ShowcasePageProps = {}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [alertDialogOpen, setAlertDialogOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [checkboxChecked, setCheckboxChecked] = useState(true);
  const [switchChecked, setSwitchChecked] = useState(true);
  const [radioValue, setRadioValue] = useState("option1");
  const [sliderValue, setSliderValue] = useState([50]);
  const [progressValue, setProgressValue] = useState(65);
  const [selectedValue, setSelectedValue] = useState("");
  const [multiSelectValue, setMultiSelectValue] = useState<string[]>([]);
  const [cardsViewMode, setCardsViewMode] = useState<"grid" | "list">("grid");

  // Sample data for showcase cards

  const sampleCompany = {
    id: "1",
    name: "Acme Healthcare Corp",
    description: "Leading healthcare services provider specializing in wellness and preventive care",
    contactPerson: "John Smith",
    email: "contact@acmehealth.com",
    phone: "+1 (555) 987-6543",
    address: "123 Main Street",
    city: "New York",
    state: "NY",
    country: "USA",
    category: "Healthcare",
    subCategory: "Medical Services",
    employees: "25",
    status: "approved" as const,
    submittedDate: "2024-01-01T00:00:00Z",
    logo: undefined,
    isActive: true,
    tags: [],
    owner: null
  };

  const sampleProduct = {
    id: "1",
    companyId: "1",
    systemProductId: "1",
    name: "Premium Skincare Set",
    description: "Complete skincare routine package with all essential products",
    imageUrl: "",
    sku: "SKU-001",
    brand: "Premium Brand",
    isAvailableForPurchase: true,
    notes: "Popular product",
    tags: [],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z"
  };

  const sampleUser = {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    phone: "+1 (555) 123-4567",
    avatar: undefined,
    role: "Customer",
    roles: [],
    roleNames: ["Customer"],
    status: "active" as const,
    location: "New York, NY",
    createdAt: "2024-01-01T00:00:00Z",
    firstName: "John",
    lastName: "Doe"
  };

  const multiSelectOptions = [
    { label: "Option 1", value: "option1" },
    { label: "Option 2", value: "option2" },
    { label: "Option 3", value: "option3" },
    { label: "Option 4", value: "option4" },
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Component Showcase</h1>
          <p className="text-muted-foreground text-lg">
            A comprehensive display of all commonly used UI components and controls
          </p>
        </div>

        <Tabs defaultValue="controls" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="controls">Controls</TabsTrigger>
            <TabsTrigger value="cards">Cards & Lists</TabsTrigger>
            <TabsTrigger value="popups">Popups & Dialogs</TabsTrigger>
            <TabsTrigger value="components">Components</TabsTrigger>
          </TabsList>

          {/* Controls Tab */}
          <TabsContent value="controls" className="space-y-8 mt-6">
            {/* Theme & Accent Color Section */}
            {onThemeChange && onAccentColorChange && (
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-foreground">Theme & Accent Color</h2>
                <Card>
                  <CardHeader>
                    <CardTitle>Theme Preference</CardTitle>
                    <CardDescription>Control the application theme and accent color</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-3">Theme Options</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                          { value: "light", label: "Light Mode", icon: Sun, description: "Light theme for better visibility" },
                          { value: "dark", label: "Dark Mode", icon: Moon, description: "Dark theme for reduced eye strain" },
                          { value: "system", label: "System", icon: Monitor, description: "Follow system preference" }
                        ].map((option) => {
                          const Icon = option.icon;
                          const isSelected = currentTheme === option.value;
                          return (
                            <Card 
                              key={option.value}
                              className={`p-4 cursor-pointer transition-all duration-300 backdrop-blur-xl border-[var(--glass-border)] ${
                                isSelected 
                                  ? "bg-[var(--accent-bg)] border-[var(--accent-border)] shadow-lg shadow-[var(--glass-shadow)]" 
                                  : "bg-[var(--glass-bg)] hover:border-[var(--accent-border)] hover:bg-accent/50"
                              }`}
                              onClick={() => onThemeChange(option.value as Theme)}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-lg ${isSelected ? "bg-[var(--accent-bg)]" : "bg-accent/50"}`}>
                                  <Icon className={`w-5 h-5 ${isSelected ? "text-[var(--accent-text)]" : "text-muted-foreground"}`} />
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <h3 className={`font-medium ${isSelected ? "text-[var(--accent-text)]" : "text-foreground"}`}>
                                      {option.label}
                                    </h3>
                                    {isSelected && (
                                      <Badge className="bg-[var(--accent-bg)] text-[var(--accent-text)] border-[var(--accent-border)]">
                                        Active
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                                </div>
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-3">Accent Color</h3>
                      <p className="text-sm text-muted-foreground mb-4">Choose your preferred accent color for buttons and highlights</p>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {[
                          { value: "orange", label: "Orange", color: "#f97316", bgColor: "rgba(249, 115, 22, 0.2)" },
                          { value: "red", label: "Red", color: "#ef4444", bgColor: "rgba(239, 68, 68, 0.2)" },
                          { value: "green", label: "Green", color: "#22c55e", bgColor: "rgba(34, 197, 94, 0.2)" },
                          { value: "blue", label: "Blue", color: "#3b82f6", bgColor: "rgba(59, 130, 246, 0.2)" },
                          { value: "yellow", label: "Yellow", color: "#eab308", bgColor: "rgba(234, 179, 8, 0.2)" }
                        ].map((color) => {
                          const isSelected = currentAccentColor === color.value;
                          return (
                            <Card 
                              key={color.value}
                              className={`p-4 cursor-pointer transition-all duration-300 backdrop-blur-xl border-[var(--glass-border)] ${
                                isSelected 
                                  ? "border-2 shadow-lg" 
                                  : "hover:border-2 hover:bg-accent/50"
                              }`}
                              style={{
                                borderColor: isSelected ? color.color : undefined,
                                backgroundColor: isSelected ? color.bgColor : undefined
                              }}
                              onClick={() => onAccentColorChange(color.value as AccentColor)}
                            >
                              <div className="flex flex-col items-center gap-2">
                                <div 
                                  className="w-8 h-8 rounded-full"
                                  style={{ backgroundColor: color.color }}
                                />
                                <span className={`text-sm font-medium ${isSelected ? 'opacity-100' : 'text-muted-foreground'}`} style={{ color: isSelected ? color.color : undefined }}>
                                  {color.label}
                                </span>
                                {isSelected && (
                                  <Badge className="text-xs" style={{ backgroundColor: color.bgColor, color: color.color, borderColor: color.color }}>
                                    Active
                                  </Badge>
                                )}
                              </div>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </section>
            )}

            {/* Buttons Section */}
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Buttons</h2>
              <Card>
                <CardHeader>
                  <CardTitle>Button Variants</CardTitle>
                  <CardDescription>All available button styles and sizes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">Variants</h3>
                    <div className="flex flex-wrap gap-3">
                      <Button variant="default">Default</Button>
                      <Button variant="accent">Accent</Button>
                      <Button variant="secondary">Secondary</Button>
                      <Button variant="destructive">Destructive</Button>
                      <Button variant="outline">Outline</Button>
                      <Button variant="ghost">Ghost</Button>
                      <Button variant="link">Link</Button>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">Sizes</h3>
                    <div className="flex flex-wrap items-center gap-3">
                      <Button size="sm">Small</Button>
                      <Button size="default">Default</Button>
                      <Button size="lg">Large</Button>
                      <Button size="icon">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">With Icons</h3>
                    <div className="flex flex-wrap gap-3">
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Item
                      </Button>
                      <Button variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button variant="destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">States</h3>
                    <div className="flex flex-wrap gap-3">
                      <Button disabled>Disabled</Button>
                      <Button variant="outline" disabled>Disabled Outline</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Form Controls Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Form Controls</CardTitle>
                  <CardDescription>Input fields, selects, and form elements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">Input Fields</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="text-input">Text Input</Label>
                        <Input id="text-input" placeholder="Enter text..." />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email-input">Email Input</Label>
                        <Input id="email-input" type="email" placeholder="email@example.com" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="password-input">Password Input</Label>
                        <Input id="password-input" type="password" placeholder="Enter password" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="disabled-input">Disabled Input</Label>
                        <Input id="disabled-input" disabled placeholder="Disabled input" />
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">Textarea</h3>
                    <div className="space-y-2">
                      <Label htmlFor="textarea">Textarea</Label>
                      <Textarea id="textarea" placeholder="Enter multiline text..." rows={4} />
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">Select</h3>
                    <div className="space-y-2">
                      <Label htmlFor="select">Single Select</Label>
                      <Select value={selectedValue} onValueChange={setSelectedValue}>
                        <SelectTrigger id="select" className="w-full">
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="option1">Option 1</SelectItem>
                          <SelectItem value="option2">Option 2</SelectItem>
                          <SelectItem value="option3">Option 3</SelectItem>
                          <SelectItem value="option4">Option 4</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">Multi Select</h3>
                    <div className="space-y-2">
                      <Label>Multi Select</Label>
                      <MultiSelect
                        options={multiSelectOptions}
                        value={multiSelectValue}
                        onValueChange={setMultiSelectValue}
                        placeholder="Select multiple options"
                      />
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">Checkbox</h3>
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="checkbox" 
                        checked={checkboxChecked}
                        onCheckedChange={(checked) => setCheckboxChecked(checked === true)}
                      />
                      <Label htmlFor="checkbox" className="cursor-pointer">
                        Accept terms and conditions
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="checkbox-disabled" disabled />
                      <Label htmlFor="checkbox-disabled" className="cursor-pointer text-muted-foreground">
                        Disabled checkbox
                      </Label>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">Radio Group</h3>
                    <RadioGroup value={radioValue} onValueChange={setRadioValue}>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="option1" id="radio1" />
                        <Label htmlFor="radio1" className="cursor-pointer">Option 1</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="option2" id="radio2" />
                        <Label htmlFor="radio2" className="cursor-pointer">Option 2</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="option3" id="radio3" />
                        <Label htmlFor="radio3" className="cursor-pointer">Option 3</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">Switch</h3>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="switch" 
                        checked={switchChecked}
                        onCheckedChange={setSwitchChecked}
                      />
                      <Label htmlFor="switch" className="cursor-pointer">
                        Enable notifications
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="switch-disabled" disabled />
                      <Label htmlFor="switch-disabled" className="cursor-pointer text-muted-foreground">
                        Disabled switch
                      </Label>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">Slider</h3>
                    <div className="space-y-2">
                      <Label>Volume: {sliderValue[0]}%</Label>
                      <Slider
                        value={sliderValue}
                        onValueChange={setSliderValue}
                        max={100}
                        step={1}
                        className="w-full"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Badges & Avatars Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Badges & Avatars</CardTitle>
                  <CardDescription>Status indicators and user avatars</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">Badges</h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge>Default</Badge>
                      <Badge variant="secondary">Secondary</Badge>
                      <Badge variant="destructive">Destructive</Badge>
                      <Badge variant="outline">Outline</Badge>
                      <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30">
                        Success
                      </Badge>
                      <Badge className="bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-500/30">
                        Warning
                      </Badge>
                      <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30">
                        Info
                      </Badge>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">Avatars</h3>
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <Avatar>
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <Avatar className="h-16 w-16">
                        <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Progress & Skeleton Section */}
              <Card>
                <CardHeader>
                  <CardTitle>Progress & Loading</CardTitle>
                  <CardDescription>Progress indicators and loading states</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">Progress Bar</h3>
                    <div className="space-y-2">
                      <Progress value={progressValue} className="w-full" />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => setProgressValue(Math.max(0, progressValue - 10))}>
                          Decrease
                        </Button>
                        <Button size="sm" onClick={() => setProgressValue(Math.min(100, progressValue + 10))}>
                          Increase
                        </Button>
                      </div>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">Skeleton Loaders</h3>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <div className="flex gap-4 mt-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2 flex-1">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-2/3" />
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          </TabsContent>

          {/* Cards & Lists Tab */}
          <TabsContent value="cards" className="space-y-8 mt-6">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Cards & List Items</h2>

              {/* Basic Cards */}
              <Card>
                <CardHeader>
                  <CardTitle>Card Components</CardTitle>
                  <CardDescription>Different card layouts and styles</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Simple Card */}
                    <Card className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <CardTitle>Simple Card</CardTitle>
                        <CardDescription>A basic card with header and content</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          This is a simple card component with standard styling.
                        </p>
                      </CardContent>
                    </Card>

                    {/* Card with Footer */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Card with Footer</CardTitle>
                        <CardDescription>Card including footer actions</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          This card includes a footer section for actions.
                        </p>
                      </CardContent>
                      <CardFooter className="flex gap-2">
                        <Button size="sm" variant="outline">Cancel</Button>
                        <Button size="sm">Save</Button>
                      </CardFooter>
                    </Card>

                    {/* Card with Badge */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>Card with Badge</CardTitle>
                          <Badge>New</Badge>
                        </div>
                        <CardDescription>Card with status indicator</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          This card includes a badge for status indication.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>

              {/* Common List Item Patterns */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Common List Item Patterns</CardTitle>
                      <CardDescription>All card and list item types used throughout the application</CardDescription>
                    </div>
                    <ViewSwitcher 
                      viewMode={cardsViewMode} 
                      onViewModeChange={setCardsViewMode}
                    />
                  </div>
                </CardHeader>
                <CardContent className="space-y-8">
                  {/* Appointment Card */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-[var(--accent-text)]" />
                      Appointment Card
                    </h3>
                    <div className={cardsViewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
                      <AppointmentCard
                        id="1"
                        patientName="John Doe"
                        date="2024-01-15T10:00:00Z"
                        time="10:00 AM"
                        duration="30 min"
                        type="General Consultation"
                        status={AppointmentStatus.CONFIRMED}
                        phone="+1 (555) 123-4567"
                        location="Room 101"
                        staff={{
                          name: "Dr. Sarah Miller",
                          specialization: "General Practitioner"
                        }}
                        service="General Consultation"
                        viewMode={cardsViewMode === "grid" ? "card" : "list"}
                      />
                    </div>
                  </div>

                  {/* Staff Card - Matching actual StaffCard structure from StaffPage */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <UserCheck className="w-5 h-5 text-[var(--accent-text)]" />
                      Staff Card
                    </h3>
                    {cardsViewMode === "list" ? (
                      <Card className="p-6 backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-200">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-20 h-20">
                            <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)]">SM</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-semibold text-foreground">Sarah Miller</h3>
                                <p className="text-[var(--accent-text)] text-sm">Senior Therapist</p>
                              </div>
                              <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30">Active</Badge>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Mail className="w-4 h-4" />
                                <span className="truncate">sarah.miller@example.com</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Phone className="w-4 h-4" />
                                <span>+1 (555) 987-6543</span>
                              </div>
                              <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                <span>Joined Jan 2023</span>
                              </div>
                            </div>
                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-muted-foreground">Therapist</Badge>
                              </div>
                              <span className="text-xs text-muted-foreground">Last active: 2 hours ago</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ) : (
                      <Card className="overflow-hidden backdrop-blur-xl bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-300 hover:shadow-lg hover:shadow-[var(--glass-shadow)] group">
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-20 h-20">
                                <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)]">SM</AvatarFallback>
                              </Avatar>
                              <div>
                                <h3 className="font-semibold text-foreground">Sarah Miller</h3>
                                <p className="text-[var(--accent-text)] text-sm">Senior Therapist</p>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-3 mb-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Mail className="w-4 h-4" />
                              <span className="truncate">sarah.miller@example.com</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Phone className="w-4 h-4" />
                              <span>+1 (555) 987-6543</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="w-4 h-4" />
                              <span>Joined Jan 2023</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-4">
                            <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30">Active</Badge>
                            <Badge variant="outline" className="text-muted-foreground">Therapist</Badge>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>Last active: 2 hours ago</span>
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>

                  {/* Space Card - Using actual SpaceCard structure from SpacesPage */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-[var(--accent-text)]" />
                      Space Card
                    </h3>
                    {cardsViewMode === "list" ? (
                      <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-300 hover:shadow-lg hover:shadow-[var(--glass-shadow)]">
                        <div className="flex items-center gap-6">
                          <div className="flex-shrink-0">
                            <div className="w-20 h-16 bg-muted rounded-lg flex items-center justify-center">
                              <MapPin className="w-8 h-8 text-muted-foreground" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="text-lg font-semibold text-foreground">Conference Room A</h3>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30 border">Active</Badge>
                              </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Users className="w-4 h-4" />
                                <span>Capacity: 20</span>
                              </div>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                <span>0 appointments today</span>
                              </div>
                            </div>
                            <p className="text-sm text-foreground mb-3 line-clamp-1">Large meeting space with AV equipment</p>
                          </div>
                        </div>
                      </Card>
                    ) : (
                      <Card className="overflow-hidden backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-300 hover:shadow-lg hover:shadow-[var(--glass-shadow)] group">
                        <div className="relative h-48 overflow-hidden">
                          <div className="w-full h-full bg-muted flex items-center justify-center">
                            <MapPin className="w-16 h-16 text-muted-foreground" />
                          </div>
                          <div className="absolute top-3 left-3">
                            <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30 backdrop-blur-sm border">Active</Badge>
                          </div>
                        </div>
                        <div className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <h3 className="text-lg font-semibold text-foreground mb-1">Conference Room A</h3>
                            </div>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Users className="w-4 h-4" />
                              <span>Capacity: 20 people</span>
                            </div>
                            <p className="text-sm text-foreground line-clamp-2">Large meeting space with AV equipment</p>
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>

                  {/* Service Card - Using actual ServiceCard structure from ServicesPage */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Stethoscope className="w-5 h-5 text-[var(--accent-text)]" />
                      Service Card
                    </h3>
                    <Card className="overflow-hidden backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all duration-300 hover:shadow-lg hover:shadow-[var(--glass-shadow)] group">
                      <div className="relative h-48 overflow-hidden">
                        <div className="w-full h-full bg-muted flex items-center justify-center">
                          <Stethoscope className="w-16 h-16 text-muted-foreground" />
                        </div>
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30 backdrop-blur-sm border">Active</Badge>
                        </div>
                        <div className="absolute bottom-3 right-3">
                          <Badge className="bg-black/70 text-white backdrop-blur-sm border border-white/20 px-3 py-1.5 font-semibold">
                            $ 120.00
                          </Badge>
                        </div>
                      </div>
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-foreground mb-1">Massage Therapy</h3>
                            <p className="text-[var(--accent-text)] text-sm">Wellness</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>60 minutes</span>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Product Card - Using actual CompanyProductCard */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Package className="w-5 h-5 text-[var(--accent-text)]" />
                      Product Card
                    </h3>
                    <div className={cardsViewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
                      <CompanyProductCard
                        product={sampleProduct}
                        viewMode={cardsViewMode}
                      />
                    </div>
                  </div>

                  {/* Sales Card */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <ShoppingCart className="w-5 h-5 text-[var(--accent-text)]" />
                      Sales Card
                    </h3>
                    {cardsViewMode === "grid" ? (
                      <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-accent/50 hover:border-[var(--accent-border)] transition-all">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-semibold text-foreground">Sale #1234</h4>
                              <p className="text-sm text-muted-foreground">Jan 15, 2024</p>
                            </div>
                            <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30">Completed</Badge>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Items:</span>
                              <span className="text-foreground font-medium">3</span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Total:</span>
                              <span className="text-foreground font-semibold">$249.97</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ) : (
                      <Card className="p-6 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] hover:bg-accent/50 transition-all">
                        <div className="flex items-center gap-4">
                          <div className="p-3 bg-[var(--accent-bg)] rounded-lg">
                            <ShoppingCart className="w-6 h-6 text-[var(--accent-text)]" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <div>
                                <h4 className="font-semibold text-foreground text-lg">Sale #1234</h4>
                                <p className="text-sm text-muted-foreground">Jan 15, 2024 at 2:30 PM</p>
                              </div>
                              <Badge className="bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30">Completed</Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <Package className="w-4 h-4 text-[var(--accent-text)]" />
                                <span className="text-muted-foreground">3 items</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-[var(--accent-text)]" />
                                <span className="text-foreground font-semibold">$249.97</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    )}
                  </div>

                  {/* User Card - Using actual UserCard */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Users className="w-5 h-5 text-[var(--accent-text)]" />
                      User Card
                    </h3>
                    <div className={cardsViewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
                      <UserCard
                        id={sampleUser.id}
                        name={sampleUser.name}
                        email={sampleUser.email}
                        phone={sampleUser.phone}
                        avatar={sampleUser.avatar}
                        role={sampleUser.role}
                        status={sampleUser.status}
                        location={sampleUser.location}
                        viewMode={cardsViewMode}
                        user={sampleUser}
                      />
                    </div>
                  </div>

                  {/* Company Card - Using actual CompanyCard and CompanyListItem */}
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                      <Building className="w-5 h-5 text-[var(--accent-text)]" />
                      Company Card
                    </h3>
                    {cardsViewMode === "grid" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <CompanyCard
                          company={sampleCompany}
                          onViewCompany={() => {}}
                        />
                      </div>
                    ) : (
                      <CompanyListItem
                        company={sampleCompany}
                        onViewCompany={() => {}}
                      />
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Empty State */}
              <Card>
                <CardHeader>
                  <CardTitle>Empty State</CardTitle>
                  <CardDescription>Empty state component for when there's no data</CardDescription>
                </CardHeader>
                <CardContent>
                  <EmptyState
                    icon={Package}
                    title="No items found"
                    description="There are no items to display. Try adjusting your filters or add a new item."
                    action={{
                      label: "Add New Item",
                      onClick: () => console.log("Add clicked"),
                      icon: Plus,
                    }}
                  />
                </CardContent>
              </Card>
            </section>
          </TabsContent>

          {/* Popups & Dialogs Tab */}
          <TabsContent value="popups" className="space-y-8 mt-6">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Popups & Dialogs</h2>

              {/* Alert Dialog */}
              <Card>
                <CardHeader>
                  <CardTitle>Alert Dialog</CardTitle>
                  <CardDescription>Confirmation dialogs for critical actions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <AlertDialog open={alertDialogOpen} onOpenChange={setAlertDialogOpen}>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Open Alert Dialog</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your
                          account and remove your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => setAlertDialogOpen(false)}>
                          Continue
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardContent>
              </Card>

              {/* Custom Dialog */}
              <Card>
                <CardHeader>
                  <CardTitle>Custom Dialog</CardTitle>
                  <CardDescription>Customizable dialog component</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={() => setDialogOpen(true)}>Open Custom Dialog</Button>
                  <CustomDialog
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    title="Custom Dialog"
                    description="This is a custom dialog with full control over content"
                    icon={<Info className="h-5 w-5" />}
                    footer={
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={() => setDialogOpen(false)}>
                          Confirm
                        </Button>
                      </div>
                    }
                  >
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        This dialog can contain any custom content you need. You have full
                        control over the header, body, and footer sections.
                      </p>
                      <div className="p-4 bg-accent rounded-lg">
                        <p className="text-sm">Custom content area</p>
                      </div>
                    </div>
                  </CustomDialog>
                </CardContent>
              </Card>

              {/* Popover */}
              <Card>
                <CardHeader>
                  <CardTitle>Popover</CardTitle>
                  <CardDescription>Contextual popover for additional information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-4">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline">Open Popover</Button>
                      </PopoverTrigger>
                      <PopoverContent>
                        <div className="space-y-2">
                          <h4 className="font-medium">Popover Title</h4>
                          <p className="text-sm text-muted-foreground">
                            This is a popover component that appears on click.
                          </p>
                        </div>
                      </PopoverContent>
                    </Popover>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline">Popover with Content</Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Settings</h4>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label>Notifications</Label>
                                <Switch />
                              </div>
                              <div className="flex items-center justify-between">
                                <Label>Email Alerts</Label>
                                <Switch />
                              </div>
                            </div>
                          </div>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </CardContent>
              </Card>

              {/* Sheet */}
              <Card>
                <CardHeader>
                  <CardTitle>Sheet</CardTitle>
                  <CardDescription>Slide-out panel component</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                    <SheetTrigger asChild>
                      <Button>Open Sheet</Button>
                    </SheetTrigger>
                    <SheetContent>
                      <SheetHeader>
                        <SheetTitle>Sheet Title</SheetTitle>
                        <SheetDescription>
                          This is a sheet component that slides in from the side.
                        </SheetDescription>
                      </SheetHeader>
                      <div className="mt-6 space-y-4">
                        <div className="space-y-2">
                          <Label>Name</Label>
                          <Input placeholder="Enter name" />
                        </div>
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input type="email" placeholder="Enter email" />
                        </div>
                        <Button className="w-full">Save</Button>
                      </div>
                    </SheetContent>
                  </Sheet>
                </CardContent>
              </Card>

              {/* Right Panel */}
              <Card>
                <CardHeader>
                  <CardTitle>Right Panel</CardTitle>
                  <CardDescription>Custom right-side panel component</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button onClick={() => setRightPanelOpen(true)}>Open Right Panel</Button>
                  <RightPanel
                    open={rightPanelOpen}
                    onOpenChange={setRightPanelOpen}
                    title="Right Panel"
                  >
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        This is a custom right panel component that slides in from the right side.
                      </p>
                      <div className="space-y-2">
                        <Label>Filter Options</Label>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="filter1" />
                            <Label htmlFor="filter1" className="cursor-pointer">Option 1</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="filter2" />
                            <Label htmlFor="filter2" className="cursor-pointer">Option 2</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="filter3" />
                            <Label htmlFor="filter3" className="cursor-pointer">Option 3</Label>
                          </div>
                        </div>
                      </div>
                    </div>
                  </RightPanel>
                </CardContent>
              </Card>
            </section>
          </TabsContent>

          {/* Individual Components Tab */}
          <TabsContent value="components" className="space-y-8 mt-6">
            <section className="space-y-4">
              <h2 className="text-2xl font-semibold text-foreground">Individual Components</h2>
              <p className="text-muted-foreground">
                Each component displayed individually for detailed inspection
              </p>

              <div className="grid grid-cols-1 gap-6">
                {/* Button Component */}
                <Card>
                  <CardHeader>
                    <CardTitle>Button Component</CardTitle>
                    <CardDescription>Standalone button component showcase</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-3">
                        <Button>Default Button</Button>
                        <Button variant="accent">Accent Button</Button>
                        <Button variant="secondary">Secondary</Button>
                        <Button variant="destructive">Destructive</Button>
                        <Button variant="outline">Outline</Button>
                        <Button variant="ghost">Ghost</Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Input Component */}
                <Card>
                  <CardHeader>
                    <CardTitle>Input Component</CardTitle>
                    <CardDescription>Standalone input component showcase</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <Input placeholder="Enter text..." />
                      <Input type="email" placeholder="Enter email..." />
                      <Input type="password" placeholder="Enter password..." />
                      <Input disabled placeholder="Disabled input" />
                    </div>
                  </CardContent>
                </Card>

                {/* Select Component */}
                <Card>
                  <CardHeader>
                    <CardTitle>Select Component</CardTitle>
                    <CardDescription>Standalone select component showcase</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Select>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="option1">Option 1</SelectItem>
                        <SelectItem value="option2">Option 2</SelectItem>
                        <SelectItem value="option3">Option 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                {/* Badge Component */}
                <Card>
                  <CardHeader>
                    <CardTitle>Badge Component</CardTitle>
                    <CardDescription>Standalone badge component showcase</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Badge>Default</Badge>
                      <Badge variant="secondary">Secondary</Badge>
                      <Badge variant="destructive">Destructive</Badge>
                      <Badge variant="outline">Outline</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* Avatar Component */}
                <Card>
                  <CardHeader>
                    <CardTitle>Avatar Component</CardTitle>
                    <CardDescription>Standalone avatar component showcase</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src="https://github.com/shadcn.png" alt="User" />
                        <AvatarFallback>U</AvatarFallback>
                      </Avatar>
                      <Avatar>
                        <AvatarFallback>JD</AvatarFallback>
                      </Avatar>
                      <Avatar className="h-16 w-16">
                        <AvatarFallback>LG</AvatarFallback>
                      </Avatar>
                    </div>
                  </CardContent>
                </Card>

                {/* Card Component */}
                <Card>
                  <CardHeader>
                    <CardTitle>Card Component</CardTitle>
                    <CardDescription>Standalone card component showcase</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Card>
                      <CardHeader>
                        <CardTitle>Example Card</CardTitle>
                        <CardDescription>This is an example card inside the showcase</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          Card content goes here. This demonstrates the card component structure.
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button size="sm">Action</Button>
                      </CardFooter>
                    </Card>
                  </CardContent>
                </Card>
              </div>
            </section>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ShowcasePage;
