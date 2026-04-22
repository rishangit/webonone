import { useState, useEffect, useMemo, useRef } from "react";
import { AppointmentStatus } from "@/types/appointmentStatus";
import { CustomDialog } from "@/components/ui/custom-dialog";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
// Import extracted components
import { WizardHeader } from "./components/WizardHeader";
import { WizardProgress } from "./components/WizardProgress";
import { SummaryCard } from "./components/SummaryCard";
import { DateTimeStep, ServiceStep, StaffStep, SpaceStep, ClientStep, NotesStep, ReviewStep } from "./steps";
import { getSteps } from "./stepDefinitions";
import { convertTo24Hour } from "./utils";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';
import { 
  Calendar, 
  Briefcase, 
  Users, 
  MapPin, 
  User, 
  FileText,
  CheckCircle,
  X,
  Search,
  DollarSign,
  Timer,
  ChevronLeft,
  ChevronRight,
  Check,
  UserPlus
} from "lucide-react";
import { ViewSwitcher } from "@/components/ui/view-switcher";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchServicesRequest } from "@/store/slices/servicesSlice";
import { fetchStaffRequest } from "@/store/slices/staffSlice";
import { fetchUserRequest, fetchUsersRequest } from "@/store/slices/usersSlice";
import { fetchSpacesRequest } from "@/store/slices/spacesSlice";
import { createAppointmentRequest } from "@/store/slices/appointmentsSlice";
import { formatAvatarUrl } from "../../../utils";
import { DateDisplay } from "@/components/common/DateDisplay";
import { Currency } from "@/services/currencies";
import { fetchCurrencyRequest } from "@/store/slices/currenciesSlice";
import { CreateUserDialog } from "../../users/CreateUserDialog";

interface AppointmentWizardProps {
  currentUser: any;
  selectedDate?: Date;
  selectedTime?: string;
  selectedServiceId?: string;
  selectedUserId?: string;
  companyIdOverride?: string;
  trigger?: React.ReactNode;
}

// Enhanced mock data with images
const mockServices = [
  {
    id: "consultation",
    name: "General Consultation",
    description: "Comprehensive health assessment and consultation",
    duration: "30 min",
    price: "$120",
    image: "https://images.unsplash.com/photo-1758691463198-dc663b8a64e4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwY29uc3VsdGF0aW9uJTIwZG9jdG9yfGVufDF8fHx8MTc1ODk5ODU2Mnww&ixlib=rb-4.1.0&q=80&w=1080",
    rating: 4.9,
    category: "Medical"
  },
  {
    id: "checkup",
    name: "Regular Checkup",
    description: "Routine health screening and preventive care",
    duration: "45 min",
    price: "$80",
    image: "https://images.unsplash.com/photo-1744723856265-866d19b9cf1a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW50YWwlMjBjaGVja3VwJTIwY2xpbmljfGVufDF8fHx8MTc1OTA0NTY2NHww&ixlib=rb-4.1.0&q=80&w=1080",
    rating: 4.7,
    category: "Medical"
  },
  {
    id: "therapy",
    name: "Therapy Session",
    description: "Specialized therapeutic treatment and rehabilitation",
    duration: "60 min",
    price: "$150",
    image: "https://images.unsplash.com/photo-1606738157849-bf12a05454f8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGElMjB0aGVyYXB5JTIwbWFzc2FnZXxlbnwxfHx8fDE3NTkwNDU2Njh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    rating: 4.8,
    category: "Therapy"
  },
  {
    id: "dental",
    name: "Dental Care",
    description: "Professional dental examination and cleaning",
    duration: "50 min",
    price: "$95",
    image: "https://images.unsplash.com/photo-1698749778813-ad5f2814e50f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW50YWwlMjBjYXJlJTIwZGVudGlzdHxlbnwxfHx8fDE3NTkwNDgxMjh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    rating: 4.6,
    category: "Dental"
  },
  {
    id: "physiotherapy",
    name: "Physiotherapy",
    description: "Physical rehabilitation and movement therapy",
    duration: "45 min",
    price: "$110",
    image: "https://images.unsplash.com/photo-1545463913-5083aa7359a6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwaHlzaW90aGVyYXB5JTIwcmVoYWJpbGl0YXRpb258ZW58MXx8fHwxNzU5MDQ4MTMyfDA&ixlib=rb-4.1.0&q=80&w=1080",
    rating: 4.7,
    category: "Therapy"
  },
  {
    id: "counseling",
    name: "Counseling Session",
    description: "Mental health support and psychological counseling",
    duration: "50 min",
    price: "$130",
    image: "https://images.unsplash.com/photo-1758273241078-8eec353836be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3Vuc2VsaW5nJTIwdGhlcmFweSUyMHNlc3Npb258ZW58MXx8fHwxNzU5MDQ4MTQ0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    rating: 4.9,
    category: "Mental Health"
  },
  {
    id: "nutrition",
    name: "Nutrition Consultation",
    description: "Personalized nutrition and wellness planning",
    duration: "40 min",
    price: "$85",
    image: "https://images.unsplash.com/photo-1740560052706-fd75ee856b44?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3ZWxsbmVzcyUyMG51dHJpdGlvbiUyMGNvbnN1bHRhdGlvbnxlbnwxfHx8fDE3NTkwNDgxNTh8MA&ixlib=rb-4.1.0&q=80&w=1080",
    rating: 4.5,
    category: "Wellness"
  },
  {
    id: "cardiology",
    name: "Cardiology Specialist",
    description: "Heart and cardiovascular system examination",
    duration: "60 min",
    price: "$200",
    image: "https://images.unsplash.com/photo-1659353885824-1199aeeebfc6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwc3BlY2lhbGlzdCUyMGNhcmRpb2xvZ3l8ZW58MXx8fHwxNzU5MDQ4MTY1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    rating: 4.8,
    category: "Specialist"
  }
];

const mockSpaces = [
  {
    id: "room1",
    name: "Consultation Room A",
    description: "Private consultation room with modern equipment",
    capacity: "1-2 people",
    features: ["Privacy", "Equipment", "Comfortable seating"],
    image: "https://images.unsplash.com/photo-1703355685952-03ed19f70f51?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBvZmZpY2UlMjBtZWV0aW5nJTIwcm9vbXxlbnwxfHx8fDE3NTkwNDU2NzF8MA&ixlib=rb-4.1.0&q=80&w=1080",
    available: true
  },
  {
    id: "room2",
    name: "Examination Room B",
    description: "Fully equipped medical examination facility",
    capacity: "1-3 people",
    features: ["Medical equipment", "Sterile environment", "Emergency access"],
    image: "https://images.unsplash.com/photo-1758654859934-2a03792260a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwZXhhbWluYXRpb24lMjByb29tJTIwaG9zcGl0YWx8ZW58MXx8fHwxNzU5MDQ1Njc0fDA&ixlib=rb-4.1.0&q=80&w=1080",
    available: true
  },
  {
    id: "room3",
    name: "Private Suite C",
    description: "Luxury private consultation suite",
    capacity: "1-4 people",
    features: ["Premium amenities", "Extended privacy", "Refreshments"],
    image: "https://images.unsplash.com/photo-1730701878011-a423ec61c328?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcml2YXRlJTIwY29uc3VsdGF0aW9uJTIwcm9vbSUyMGNsaW5pY3xlbnwxfHx8fDE3NTkwNDU2Nzd8MA&ixlib=rb-4.1.0&q=80&w=1080",
    available: false
  },
  {
    id: "room4",
    name: "Therapy Room D",
    description: "Specialized therapy and rehabilitation room",
    capacity: "1-3 people",
    features: ["Exercise equipment", "Therapy tools", "Recovery area"],
    image: "https://images.unsplash.com/photo-1712725213051-8d7d6a52edaf?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpY2FsJTIwdGhlcmFweSUyMHJvb218ZW58MXx8fHwxNzU5MDQ4NjU1fDA&ixlib=rb-4.1.0&q=80&w=1080",
    available: true
  },
  {
    id: "room5",
    name: "Dental Suite E",
    description: "Modern dental care and treatment facility",
    capacity: "1-2 people",
    features: ["Dental chair", "X-ray equipment", "Sterilization"],
    image: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZW50YWwlMjBvZmZpY2UlMjByb29tfGVufDF8fHx8MTc1OTA0ODY1OXww&ixlib=rb-4.1.0&q=80&w=1080",
    available: true
  },
  {
    id: "room6",
    name: "Rehabilitation Center F",
    description: "Comprehensive physical rehabilitation facility",
    capacity: "1-5 people",
    features: ["Exercise machines", "Parallel bars", "Mobility aids"],
    image: "https://images.unsplash.com/photo-1717500252010-d708ec89a0a2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZWhhYmlsaXRhdGlvbiUyMHJvb20lMjBwaHlzaW90aGVyYXB5fGVufDF8fHx8MTc1OTA0ODY2M3ww&ixlib=rb-4.1.0&q=80&w=1080",
    available: true
  },
  {
    id: "room7",
    name: "Procedure Room G",
    description: "Sterile procedure and minor surgery room",
    capacity: "1-4 people",
    features: ["Surgical equipment", "Sterile field", "Emergency protocols"],
    image: "https://images.unsplash.com/photo-1728474372689-c3072b79806e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXJnZXJ5JTIwcm9vbSUyMGhvc3BpdGFsfGVufDF8fHx8MTc1OTA0ODY2Nnww&ixlib=rb-4.1.0&q=80&w=1080",
    available: false
  },
  {
    id: "room8",
    name: "Comfort Lounge H",
    description: "Relaxing space for consultation and recovery",
    capacity: "1-6 people",
    features: ["Comfortable seating", "Natural light", "Calming atmosphere"],
    image: "https://images.unsplash.com/photo-1732376800645-c066f9e283e8?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YWl0aW5nJTIwcm9vbSUyMG1lZGljYWx8ZW58MXx8fHwxNzU5MDQ4NjcwfDA&ixlib=rb-4.1.0&q=80&w=1080",
    available: true
  }
];

const mockStaff = [
  {
    id: "staff1",
    name: "Dr. Sarah Johnson",
    role: "Senior Consultant",
    specialization: "Internal Medicine",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=100&h=100&fit=crop&crop=face",
    available: true,
    rating: 4.9,
    experience: "15+ years"
  },
  {
    id: "staff2",
    name: "Dr. Michael Chen",
    role: "Specialist",
    specialization: "Cardiology",
    avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=100&h=100&fit=crop&crop=face",
    available: true,
    rating: 4.8,
    experience: "12+ years"
  },
  {
    id: "staff3",
    name: "Dr. Emily Rodriguez",
    role: "Therapist",
    specialization: "Physical Therapy",
    avatar: "https://images.unsplash.com/photo-1594824694996-50906e8d71a2?w=100&h=100&fit=crop&crop=face",
    available: false,
    rating: 4.7,
    experience: "8+ years"
  }
];

const mockUsers = [
  {
    id: "user1",
    name: "John Smith",
    email: "john.smith@email.com",
    phone: "+1 (555) 123-4567",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    lastVisit: "2024-01-15"
  },
  {
    id: "user2",
    name: "Emma Watson",
    email: "emma.watson@email.com",
    phone: "+1 (555) 234-5678",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    lastVisit: "2024-01-10"
  },
  {
    id: "user3",
    name: "Michael Brown",
    email: "michael.brown@email.com",
    phone: "+1 (555) 345-6789",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    lastVisit: "2024-01-08"
  },
  {
    id: "user4",
    name: "Sarah Davis",
    email: "sarah.davis@email.com",
    phone: "+1 (555) 456-7890",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b5e3?w=100&h=100&fit=crop&crop=face",
    lastVisit: "2024-01-12"
  },
  {
    id: "user5",
    name: "David Wilson",
    email: "david.wilson@email.com",
    phone: "+1 (555) 567-8901",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    lastVisit: "2024-01-05"
  },
  {
    id: "user6",
    name: "Lisa Johnson",
    email: "lisa.johnson@email.com",
    phone: "+1 (555) 678-9012",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
    lastVisit: "2024-01-20"
  },
  {
    id: "user7",
    name: "Robert Miller",
    email: "robert.miller@email.com",
    phone: "+1 (555) 789-0123",
    avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671d66?w=100&h=100&fit=crop&crop=face",
    lastVisit: "2024-01-18"
  },
  {
    id: "user8",
    name: "Amanda Chen",
    email: "amanda.chen@email.com",
    phone: "+1 (555) 890-1234",
    avatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=100&h=100&fit=crop&crop=face",
    lastVisit: "2024-01-22"
  },
  {
    id: "user9",
    name: "Kevin Thompson",
    email: "kevin.thompson@email.com",
    phone: "+1 (555) 901-2345",
    avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=100&h=100&fit=crop&crop=face",
    lastVisit: "2024-01-14"
  },
  {
    id: "user10",
    name: "Jessica Rodriguez",
    email: "jessica.rodriguez@email.com",
    phone: "+1 (555) 012-3456",
    avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100&h=100&fit=crop&crop=face",
    lastVisit: "2024-01-25"
  },
  {
    id: "user11",
    name: "Mark Anderson",
    email: "mark.anderson@email.com",
    phone: "+1 (555) 123-4567",
    avatar: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&h=100&fit=crop&crop=face",
    lastVisit: "2024-01-17"
  },
  {
    id: "user12",
    name: "Rachel Green",
    email: "rachel.green@email.com",
    phone: "+1 (555) 234-5678",
    avatar: "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=100&h=100&fit=crop&crop=face",
    lastVisit: "2024-01-19"
  }
];

// timeSlots is now imported from constants

export function AppointmentWizard({
  currentUser: currentUserProp,
  selectedDate,
  selectedTime,
  selectedServiceId,
  selectedUserId,
  companyIdOverride,
  trigger,
}: AppointmentWizardProps) {
  const dispatch = useAppDispatch();
  const { services, loading: servicesLoading, error: servicesError, lastFetch } = useAppSelector((state) => state.services);
  const { staff, loading: staffLoading, error: staffError } = useAppSelector((state) => state.staff);
  const { users: reduxUsers, loading: usersLoading, error: usersError } = useAppSelector((state) => state.users);
  const { spaces, loading: spacesLoading, error: spacesError, lastFetch: spacesLastFetch } = useAppSelector((state) => state.spaces);
  const { companies, currentCompany, userCompany } = useAppSelector((state) => state.companies);
  const { currencies: reduxCurrencies, currenciesById } = useAppSelector((state) => state.currencies);
  
  // Get currentUser from Redux auth state as fallback if prop is not provided
  const authUser = useAppSelector((state) => state.auth.user);
  const currentUser = currentUserProp || authUser;
  const currentUserId = selectedUserId
    ? String(selectedUserId)
    : currentUser?.id
      ? String(currentUser.id)
      : (currentUser as any)?.userId
        ? String((currentUser as any).userId)
        : "";
  
  // Get companyId reliably
  const companyId = companyIdOverride || currentUser?.companyId || currentUser?.company?.id;
  
  // Get company's selected entities
  const company = (userCompany && String(userCompany.id) === String(companyId)) 
    ? userCompany 
    : companies.find(c => String(c.id) === String(companyId)) || currentCompany;
  const selectedEntities = (company as any)?.selectedEntities as string[] | null | undefined;
  
  const [companyCurrency, setCompanyCurrency] = useState<Currency | null>(null);
  
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serviceSearchQuery, setServiceSearchQuery] = useState("");
  const [serviceViewMode, setServiceViewMode] = useState<"grid" | "list">("grid");
  const [spaceSearchQuery, setSpaceSearchQuery] = useState("");
  const [spaceViewMode, setSpaceViewMode] = useState<"grid" | "list">("grid");

  // Form data
  // Initialize with selectedDate if provided, otherwise use current date
  const [appointmentDate, setAppointmentDate] = useState<Date | undefined>(selectedDate || new Date());
  const [appointmentTime, setAppointmentTime] = useState(selectedTime || "");
  const [selectedService, setSelectedService] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("");
  const [preferredStaff, setPreferredStaff] = useState<string[]>([]);
  const [selectedSpace, setSelectedSpace] = useState("");
  const [selectedUser, setSelectedUser] = useState("");
  const [notes, setNotes] = useState("");
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const missingSelectedUserFetchRef = useRef<string | null>(null);

  // convertTo24Hour is now imported from utils

  // Fetch company currency from Redux cache
  useEffect(() => {
    if (!companyId) {
      // Try to get USD as default if no company ID
      const usdCurrency = reduxCurrencies.find(c => c.name === 'USD');
      setCompanyCurrency(usdCurrency || null);
      return;
    }
    
    // Use userCompany if it matches the current user's companyId (cached)
    const company = (userCompany && String(userCompany.id) === String(companyId)) 
      ? userCompany 
      : companies.find(c => String(c.id) === String(companyId)) || currentCompany;
    
    const currencyId = company?.currencyId;
    
    if (currencyId) {
      // Check Redux cache first
      const cachedCurrency = currenciesById[currencyId];
      if (cachedCurrency) {
        setCompanyCurrency(cachedCurrency);
      } else {
        // If not in cache, fetch it (will be cached by epic)
        dispatch(fetchCurrencyRequest(currencyId));
        // Set a temporary USD fallback while fetching
        const usdCurrency = reduxCurrencies.find(c => c.name === 'USD');
        setCompanyCurrency(usdCurrency || null);
      }
    } else {
      // If no currency is set, use USD as default
      const usdCurrency = reduxCurrencies.find(c => c.name === 'USD');
      setCompanyCurrency(usdCurrency || null);
    }
  }, [companyId, companies, currentCompany, userCompany, reduxCurrencies, currenciesById, dispatch]);
  
  // Update currency when it's fetched and cached
  useEffect(() => {
    if (companyId) {
      const company = (userCompany && String(userCompany.id) === String(companyId)) 
        ? userCompany 
        : companies.find(c => String(c.id) === String(companyId)) || currentCompany;
      const currencyId = company?.currencyId;
      if (currencyId && currenciesById[currencyId]) {
        setCompanyCurrency(currenciesById[currencyId]);
      }
    }
  }, [currenciesById, companyId, companies, currentCompany, userCompany]);

  // Check if services need to be fetched (not loaded, different company, or stale > 5 minutes)
  const shouldFetchServices = useMemo(() => {
    if (!companyId) return false;
    
    // Check if services exist and belong to this company
    const servicesForCompany = services.filter(s => s.companyId === companyId);
    const hasServicesForCompany = servicesForCompany.length > 0;
    
    // Check if data is stale (older than 5 minutes)
    const isStale = lastFetch ? (Date.now() - lastFetch) > 5 * 60 * 1000 : true;
    
    // Fetch if: no services for this company, or data is stale, or currently loading
    return !hasServicesForCompany || isStale;
  }, [companyId, services, lastFetch]);

  // Fetch services and staff when dialog opens OR when companyId becomes available
  // Only fetch if services are not already loaded for this company
  useEffect(() => {
    if (open && companyId) {
      console.log('[AppointmentWizard] Dialog opened, checking if services need fetching:', {
        companyId,
        servicesCount: services.length,
        servicesForCompany: services.filter(s => s.companyId === companyId).length,
        shouldFetchServices,
        lastFetch,
        isStale: lastFetch ? (Date.now() - lastFetch) > 5 * 60 * 1000 : true
      });
      
      // Only fetch if we need to (not already loaded for this company or stale)
      if (shouldFetchServices && !servicesLoading) {
        console.log('[AppointmentWizard] Fetching services for companyId:', companyId);
        dispatch(fetchServicesRequest({ companyId }));
      } else {
        console.log('[AppointmentWizard] Services already loaded for company, skipping fetch');
      }
      
      // Always fetch staff (similar logic can be added if needed)
      dispatch(fetchStaffRequest({ companyId }));
      
      // Fetch spaces for space selection
      dispatch(fetchSpacesRequest({ companyId }));
      
      // Fetch all users for client selection
      dispatch(fetchUsersRequest({}));
    } else if (open && !companyId) {
      console.warn('[AppointmentWizard] Dialog opened but no companyId found.', {
        currentUserProp: currentUserProp ? 'present' : 'missing',
        authUser: authUser ? 'present' : 'missing',
        currentUser: currentUser ? 'present' : 'missing',
        companyId
      });
    }
  }, [open, companyId, dispatch, shouldFetchServices, servicesLoading, services.length]);

  const isCompanyOwner = currentUser?.role === "Company Owner";

  // Define steps based on user role and company's selected entities
  const steps = useMemo(() => getSteps(isCompanyOwner, selectedEntities), [isCompanyOwner, selectedEntities]);

  // Fetch services when moving to service step (step 2) - Only if not already loaded
  useEffect(() => {
    if (open && companyId) {
      const step = steps[currentStep];
      // Check if we're on the service step
      const isServiceStep = step?.id === "service";
      
      if (isServiceStep && !servicesLoading) {
        console.log('[AppointmentWizard] On service step, checking services:', {
          currentStep,
          stepId: step?.id,
          companyId,
          servicesCount: services.length,
          servicesForCompany: services.filter(s => s.companyId === companyId).length,
          shouldFetchServices,
          servicesLoading,
          servicesError
        });
        
        // Only fetch if services are not already loaded for this company or are stale
        if (shouldFetchServices) {
          console.log('[AppointmentWizard] Fetching services on service step');
          dispatch(fetchServicesRequest({ companyId }));
        } else {
          console.log('[AppointmentWizard] Services already available, using cached data');
        }
      }
    } else if (open && !companyId) {
      console.warn('[AppointmentWizard] On service step but no companyId.', {
        currentUserProp: currentUserProp ? 'present' : 'missing',
        authUser: authUser ? 'present' : 'missing',
        currentUser: currentUser ? 'present' : 'missing',
        companyId
      });
    }
  }, [open, currentStep, companyId, servicesLoading, dispatch, steps, shouldFetchServices, services.length]);

  // Fetch users when moving to client step - Only if not already loaded
  useEffect(() => {
    if (open) {
      const step = steps[currentStep];
      // Check if we're on the client step
      const isClientStep = step?.id === "client";
      
      if (isClientStep && !usersLoading) {
        console.log('[AppointmentWizard] On client step, checking users:', {
          currentStep,
          stepId: step?.id,
          usersCount: reduxUsers?.length || 0,
          usersLoading,
          usersError
        });
        
        // Fetch users if not already loaded
        if (!reduxUsers || reduxUsers.length === 0) {
          console.log('[AppointmentWizard] Fetching users on client step');
          dispatch(fetchUsersRequest({}));
        } else {
          console.log('[AppointmentWizard] Users already available, using cached data');
        }
      }
    }
  }, [open, currentStep, usersLoading, dispatch, steps, reduxUsers]);

  // Fetch spaces when moving to space step - Only if not already loaded
  useEffect(() => {
    if (open && companyId) {
      const step = steps[currentStep];
      // Check if we're on the space step
      const isSpaceStep = step?.id === "space";
      
      if (isSpaceStep && !spacesLoading) {
        // Check if spaces need to be fetched (not loaded, different company, or stale > 5 minutes)
        const spacesForCompany = spaces.filter(s => s.companyId === companyId);
        const hasSpacesForCompany = spacesForCompany.length > 0;
        const isStale = spacesLastFetch ? (Date.now() - spacesLastFetch) > 5 * 60 * 1000 : true;
        const shouldFetchSpaces = !hasSpacesForCompany || isStale;
        
        if (shouldFetchSpaces) {
          console.log('[AppointmentWizard] Fetching spaces on space step');
          dispatch(fetchSpacesRequest({ companyId }));
        } else {
          console.log('[AppointmentWizard] Spaces already available, using cached data');
        }
      }
    }
  }, [open, currentStep, companyId, spacesLoading, dispatch, steps, spaces, spacesLastFetch]);

  // Update form data when selectedDate or selectedTime props change and dialog opens
  useEffect(() => {
    if (open) {
      // Reset form first
      setCurrentStep(0);
      setSelectedService(selectedServiceId || "");
      setSelectedStaff("");
      setPreferredStaff([]);
      setSelectedSpace("");
      // Pre-fill client when known (e.g. regular user booking for themselves)
      setSelectedUser(selectedUserId || (!isCompanyOwner && currentUserId ? currentUserId : ""));
      setNotes("");
      setServiceSearchQuery("");
      setServiceViewMode("grid");
      setIsSubmitting(false);
      
      // Then set the provided date and time
      if (selectedDate) {
        setAppointmentDate(selectedDate);
      }
      if (selectedTime) {
        // Convert the time to 24-hour format for consistency
        const convertedTime = convertTo24Hour(selectedTime);
        setAppointmentTime(convertedTime);
      }
    }
  }, [open, selectedDate, selectedTime, selectedServiceId, selectedUserId, isCompanyOwner, currentUserId]);

  // For regular users, preselect the logged-in user as the default client.
  // Do not overwrite if user changes client manually.
  useEffect(() => {
    if (!open || isCompanyOwner || !currentUserId || selectedUser) return;
    if (String(selectedUser) !== String(currentUserId)) {
      setSelectedUser(currentUserId);
    }
  }, [open, isCompanyOwner, currentUserId, selectedUser]);

  // All users for client selection (searching is handled in UserSelectionDialog)
  const filteredUsers = useMemo(() => {
    return reduxUsers || [];
  }, [reduxUsers]);

  // Filter active services - show services with status 'Active' or no status, and for current company
  const activeServices = useMemo(() => {
    if (!companyId) return [];
    
    return services.filter(s => {
      // Only show services for the current company
      if (s.companyId !== companyId) return false;
      
      // Include services without status (for backward compatibility)
      if (!s.status) return true;
      // Check status (case-insensitive)
      const status = s.status.toString().toLowerCase().trim();
      return status === 'active';
    });
  }, [services, companyId]);

  // Filter services based on search query
  const filteredActiveServices = useMemo(() => {
    if (!serviceSearchQuery.trim()) {
      return activeServices;
    }
    
    const query = serviceSearchQuery.toLowerCase().trim();
    return activeServices.filter(service => {
      const name = (service.name || '').toLowerCase();
      const description = (service.description || '').toLowerCase();
      const category = (service.category || '').toLowerCase();
      
      return name.includes(query) || 
             description.includes(query) || 
             category.includes(query);
    });
  }, [activeServices, serviceSearchQuery]);

  // Debug: Log services when they change
  useEffect(() => {
    if (open) {
      console.log('[AppointmentWizard] Services state:', {
        totalServices: services.length,
        activeServices: activeServices.length,
        servicesLoading,
        servicesError,
        services: services.map(s => ({ 
          id: s.id, 
          name: s.name, 
          status: s.status,
          companyId: s.companyId 
        })),
        activeServicesList: activeServices.map(s => ({ 
          id: s.id, 
          name: s.name, 
          status: s.status 
        })),
        companyId
      });
    }
  }, [open, services, activeServices, servicesLoading, servicesError, companyId]);

  // Filter active spaces - show spaces with status 'Active' and for current company
  const activeSpaces = useMemo(() => {
    if (!companyId) return [];
    
    return spaces.filter(s => {
      // Only show spaces for the current company
      if (s.companyId !== companyId) return false;
      
      // Include spaces without status (for backward compatibility)
      if (!s.status) return true;
      // Check status (case-insensitive)
      const status = s.status.toString().toLowerCase().trim();
      return status === 'active';
    });
  }, [spaces, companyId]);

  // Filter spaces based on search query
  const filteredActiveSpaces = useMemo(() => {
    if (!spaceSearchQuery.trim()) {
      return activeSpaces;
    }
    
    const query = spaceSearchQuery.toLowerCase().trim();
    return activeSpaces.filter(space => {
      const name = (space.name || '').toLowerCase();
      const description = (space.description || '').toLowerCase();
      
      return name.includes(query) || description.includes(query);
    });
  }, [activeSpaces, spaceSearchQuery]);

  // Get selected data for review
  const selectedServiceData = activeServices.find(s => s.id === selectedService) || filteredActiveServices.find(s => s.id === selectedService);
  const selectedStaffData = staff.find(s => s.id === selectedStaff);
  const selectedSpaceData = activeSpaces.find(s => s.id === selectedSpace);
  const selectedUserData =
    filteredUsers.find((u) => String(u.id) === String(selectedUser)) ||
    (reduxUsers || []).find((u) => String(u.id) === String(selectedUser));

  // If a user is selected from paged dialog data but not yet in Redux list,
  // fetch that user once so the wizard can resolve and display the selection.
  useEffect(() => {
    if (!selectedUser || selectedUserData || usersLoading) {
      if (selectedUserData) {
        missingSelectedUserFetchRef.current = null;
      }
      return;
    }

    if (missingSelectedUserFetchRef.current === selectedUser) return;

    missingSelectedUserFetchRef.current = selectedUser;
    dispatch(fetchUserRequest(selectedUser));
  }, [dispatch, selectedUser, selectedUserData, usersLoading]);

  // Step validation
  const isStepValid = (stepIndex: number) => {
    const step = steps[stepIndex];
    switch (step.id) {
      case "datetime":
        return appointmentDate && appointmentTime;
      case "service":
        return selectedService;
      case "staff":
        return isCompanyOwner ? selectedStaff : preferredStaff.length > 0;
      case "space":
        return true; // Space selection is optional for all users
      case "client":
        return selectedUser; // Client selection is required for all users
      case "notes":
        return true; // Notes are optional
      case "review":
        return true;
      default:
        return false;
    }
  };

  const canProceed = isStepValid(currentStep);
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = () => {
    if (isLastStep) {
      handleSubmit();
    } else if (canProceed) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!companyId) {
      toast.error("Company ID not found. Please refresh and try again.");
      return;
    }

    if (!appointmentDate || !appointmentTime) {
      toast.error("Please select date and time");
      return;
    }

    // Check if service step exists (service entity is enabled)
    const hasServiceStep = steps.some(s => s.id === 'service');
    if (hasServiceStep && !selectedService) {
      toast.error("Please select a service");
      return;
    }

    // Check if staff step exists (staff entity is enabled)
    const hasStaffStep = steps.some(s => s.id === 'staff');
    if (hasStaffStep) {
      if (isCompanyOwner && !selectedStaff) {
        toast.error("Please select a staff member");
        return;
      }

      if (!isCompanyOwner && preferredStaff.length === 0) {
        toast.error("Please select at least one preferred staff member");
        return;
      }
    }

    if (!selectedUser) {
      toast.error("Please select a client");
      return;
    }

    setIsSubmitting(true);

    try {
      const serviceData = selectedServiceData;
      
      // Build minimal appointment data - only IDs and required fields
      // Format date in local timezone to avoid UTC conversion issues
      const year = appointmentDate.getFullYear();
      const month = String(appointmentDate.getMonth() + 1).padStart(2, '0');
      const day = String(appointmentDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      
      const appointmentData: any = {
        companyId,
        clientId: selectedUser,
        date: formattedDate,
        time: appointmentTime,
        status: AppointmentStatus.PENDING,
        paymentStatus: "Pending" as const,
      };

      // Add service if service entity is enabled and selected
      const hasServiceStep = steps.some(s => s.id === 'service');
      if (hasServiceStep && selectedService) {
        appointmentData.serviceId = selectedService;
        appointmentData.duration = serviceData?.duration || 30;
        appointmentData.price = serviceData?.price || 0;
      } else {
        // Default values if service is not enabled
        appointmentData.duration = 30;
        appointmentData.price = 0;
      }

      // Add staff if staff entity is enabled
      const hasStaffStep = steps.some(s => s.id === 'staff');
      if (hasStaffStep) {
        if (isCompanyOwner && selectedStaff) {
          appointmentData.staffId = selectedStaff;
        }
        
        // For non-company owners: if only one staff is selected, assign them directly
        // Otherwise, add them as preferred staff
        if (!isCompanyOwner) {
          if (preferredStaff.length === 1) {
            // Single selection: assign as staffId
            appointmentData.staffId = preferredStaff[0];
          } else if (preferredStaff.length > 1) {
            // Multiple selections: add as preferredStaffIds
            appointmentData.preferredStaffIds = preferredStaff;
          }
        }
      }
      
      // Add space if space entity is enabled and selected
      const hasSpaceStep = steps.some(s => s.id === 'space');
      if (hasSpaceStep && selectedSpace) {
        appointmentData.spaceId = selectedSpace;
      }
      
      if (notes && notes.trim()) {
        appointmentData.notes = notes.trim();
      }

      dispatch(createAppointmentRequest(appointmentData));
      handleReset();
    } catch (error: any) {
      toast.error(error.message || "Failed to create appointment");
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setAppointmentDate(new Date());
    setAppointmentTime("");
    setSelectedService("");
    setSelectedStaff("");
    setPreferredStaff([]);
    setSelectedSpace("");
    setSelectedUser("");
    setNotes("");
    setServiceSearchQuery("");
    setServiceViewMode("grid");
    setSpaceSearchQuery("");
    setSpaceViewMode("grid");
    setIsSubmitting(false);
    setOpen(false);
  };

  // Render footer buttons
  const renderFooter = () => {
    return (
      <div className="flex items-center justify-between w-full gap-2 sm:gap-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="sm:flex-none bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent-text)] h-10 sm:h-auto text-sm w-10 sm:w-auto px-2 sm:px-4"
        >
          <ChevronLeft className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Previous</span>
        </Button>

        {/* Mobile Summary Toggle Button */}
        <Button
          variant="outline"
          onClick={() => {
            // Toggle mobile summary view
            const summaryElement = document.querySelector('.mobile-summary');
            if (summaryElement) {
              summaryElement.classList.toggle('hidden');
            }
          }}
          className="lg:hidden bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-[var(--accent-bg)] hover:text-[var(--accent-text)] h-10 px-3 flex items-center gap-2"
        >
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm">Summary</span>
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleReset}
            disabled={isSubmitting}
            className="hidden sm:flex bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-red-50 hover:text-red-600 hover:border-red-200 dark:hover:bg-red-900/20 dark:hover:text-red-400"
          >
            Reset
          </Button>
          
          <Button
            variant="accent"
            onClick={handleNext}
            disabled={!canProceed || isSubmitting}
            className="flex-1 sm:flex-none min-w-20 sm:min-w-24 h-10 sm:h-auto text-sm"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin sm:mr-2" />
                <span className="hidden sm:inline">Creating...</span>
              </>
            ) : isLastStep ? (
              <>
                <CheckCircle className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Create</span>
                <span className="sm:hidden">Done</span>
              </>
            ) : (
              <>
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">Continue</span>
                <ChevronRight className="w-4 h-4 sm:ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    );
  };

  const renderStepContent = () => {
    const step = steps[currentStep];
    
    switch (step.id) {
      case "datetime":
        return (
          <DateTimeStep
            appointmentDate={appointmentDate}
            setAppointmentDate={setAppointmentDate}
            appointmentTime={appointmentTime}
            setAppointmentTime={setAppointmentTime}
          />
        );

      case "service":
        return (
          <ServiceStep
            services={services}
            servicesLoading={servicesLoading}
            servicesError={servicesError}
            activeServices={activeServices}
            filteredActiveServices={filteredActiveServices}
            selectedService={selectedService}
            setSelectedService={setSelectedService}
            serviceSearchQuery={serviceSearchQuery}
            setServiceSearchQuery={setServiceSearchQuery}
            serviceViewMode={serviceViewMode}
            setServiceViewMode={setServiceViewMode}
            companyCurrency={companyCurrency}
            companyId={companyId}
            isCompanyOwner={isCompanyOwner}
            onRetry={() => {
              if (companyId) {
                dispatch(fetchServicesRequest({ companyId }));
              }
            }}
          />
        );

      case "staff":
        return (
          <StaffStep
            staff={staff}
            staffLoading={staffLoading}
            selectedStaff={selectedStaff}
            setSelectedStaff={setSelectedStaff}
            preferredStaff={preferredStaff}
            setPreferredStaff={setPreferredStaff}
            isCompanyOwner={isCompanyOwner}
          />
        );

      case "space":
        return (
          <SpaceStep
            spaces={spaces}
            spacesLoading={spacesLoading}
            spacesError={spacesError}
            activeSpaces={activeSpaces}
            filteredActiveSpaces={filteredActiveSpaces}
            selectedSpace={selectedSpace}
            setSelectedSpace={setSelectedSpace}
            spaceSearchQuery={spaceSearchQuery}
            setSpaceSearchQuery={setSpaceSearchQuery}
            spaceViewMode={spaceViewMode}
            setSpaceViewMode={setSpaceViewMode}
            companyId={companyId}
            isCompanyOwner={isCompanyOwner}
            onRetry={() => {
              if (companyId) {
                dispatch(fetchSpacesRequest({ companyId }));
              }
            }}
          />
        );

      case "client":
        return (
          <ClientStep
            users={reduxUsers || []}
            usersLoading={usersLoading}
            usersError={usersError}
            filteredUsers={filteredUsers}
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
            isCompanyOwner={isCompanyOwner}
            onRetry={() => {
              dispatch(fetchUsersRequest({}));
            }}
            onCreateUser={() => setIsCreateUserDialogOpen(true)}
          />
        );

      case "notes":
        return (
          <NotesStep
            notes={notes}
            setNotes={setNotes}
          />
        );

      case "review":
        return (
          <ReviewStep
            appointmentDate={appointmentDate}
            appointmentTime={appointmentTime}
            selectedServiceData={selectedServiceData}
            selectedStaffData={selectedStaffData}
            preferredStaff={preferredStaff}
            staff={staff}
            selectedSpaceData={selectedSpaceData}
            selectedUserData={selectedUserData}
            notes={notes}
            isCompanyOwner={isCompanyOwner}
          />
        );

      default:
        return null;
    }
  };

  return (
    <>
      {trigger && <div onClick={() => setOpen(true)}>{trigger}</div>}
      
      <CustomDialog
        open={open}
        onOpenChange={setOpen}
        customHeader={<WizardHeader currentStep={currentStep} steps={steps} />}
        sizeWidth="large"
        sizeHeight="xlarge"
        className="overflow-hidden backdrop-blur-sm bg-background dark:bg-[var(--glass-bg)] border-[var(--glass-border)] custom-scrollbar p-0 flex flex-col"
        disableContentScroll={true}
        hideCloseButton={false}
        noContentPadding={true}
        footer={
          <div className="flex items-center gap-3 w-full sm:flex-row sm:justify-start">
            {renderFooter()}
          </div>
        }
      >
        <VisuallyHidden>
          <span id="appointment-wizard-description">
            Schedule a new appointment by completing each step of the booking process.
          </span>
        </VisuallyHidden>
        
        <div className="flex flex-col h-full overflow-hidden">
          {/* Progress Bar - Fixed */}
          <div className="shrink-0 w-1/2 mx-auto">
            <WizardProgress currentStep={currentStep} steps={steps} />
          </div>

          {/* Step Content with Summary - Scrollable */}
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-3 sm:px-4 pt-2">
            <div className={`grid grid-cols-1 ${isLastStep ? 'lg:grid-cols-1' : 'lg:grid-cols-3'} gap-3 sm:gap-4 pb-4`}>
              {/* Main Content Area - Hidden on last step */}
              {!isLastStep && (
                <div className="lg:col-span-2 flex flex-col min-h-0">
                  <Card className="flex flex-col p-3 sm:p-4 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                    {/* Fixed Title Area - Hidden for datetime step */}
                    {steps[currentStep].id !== 'datetime' && (
                      <div className="shrink-0 flex items-center gap-2 mb-3 sm:mb-4 border-b border-[var(--glass-border)] pb-3">
                        {(() => {
                          const StepIcon = steps[currentStep].icon;
                          return <StepIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--accent-text)]" />;
                        })()}
                        <h3 className="text-sm sm:text-base font-semibold text-foreground">{steps[currentStep].title}</h3>
                      </div>
                    )}
                    
                    {/* Content Area */}
                    <div className="flex-1">
                      {renderStepContent()}
                    </div>
                  </Card>
                </div>
              )}

              {/* Summary Section - Full width on last step, hidden on mobile otherwise */}
              <div className={`${isLastStep ? 'lg:col-span-1' : 'lg:col-span-1'} ${isLastStep ? 'block' : 'hidden lg:block'} flex flex-col`}>
                <SummaryCard
                  appointmentDate={appointmentDate}
                  appointmentTime={appointmentTime}
                  selectedService={selectedService}
                  selectedServiceData={selectedServiceData}
                  selectedStaff={selectedStaff}
                  selectedStaffData={selectedStaffData}
                  preferredStaff={preferredStaff}
                  staff={staff}
                  selectedSpace={selectedSpace}
                  selectedSpaceData={selectedSpaceData}
                  selectedUser={selectedUser}
                  selectedUserData={selectedUserData}
                  filteredUsers={filteredUsers}
                  notes={notes}
                  isCompanyOwner={isCompanyOwner}
                  companyCurrency={companyCurrency}
                  selectedEntities={selectedEntities}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Summary Overlay */}
          <div className="mobile-summary hidden lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] animate-in fade-in-0 duration-300" onClick={(e) => {
            if (e.target === e.currentTarget) {
              e.currentTarget.classList.add('hidden');
            }
          }}>
            <div className="absolute bottom-0 left-0 right-0 bg-[var(--glass-bg)] border-t border-[var(--glass-border)] rounded-t-xl max-h-[70vh] overflow-hidden animate-in slide-in-from-bottom-full duration-300">
              <div className="p-4 border-b border-[var(--glass-border)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[var(--accent-text)]" />
                    <h3 className="font-semibold text-foreground">Summary</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => document.querySelector('.mobile-summary')?.classList.add('hidden')}
                    className="h-8 w-8 p-0"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="p-4 overflow-y-auto max-h-[calc(70vh-80px)]">
                <div className="space-y-3">
                  {/* Mobile Summary Content */}
                  <div className="space-y-2 p-3 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-[var(--accent-text)]" />
                      <span className="text-sm font-medium text-foreground">Date & Time</span>
                    </div>
                    <div className="text-sm text-foreground">
                      {appointmentDate ? appointmentDate.toLocaleDateString() : 'Not selected'}
                      {appointmentTime && <span> at {appointmentTime}</span>}
                    </div>
                  </div>
                  
                  {/* Service - Only show if service entity is enabled */}
                  {(!selectedEntities || selectedEntities.includes('service')) && selectedService && (
                    <div className="space-y-2 p-3 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-[var(--accent-text)]" />
                        <span className="text-sm font-medium text-foreground">Service</span>
                      </div>
                      {selectedServiceData && (() => {
                        // Get image URL - handle both image and imageUrl properties, and format if needed
                        const imageSrc = selectedServiceData.image || selectedServiceData.imageUrl;
                        const serviceImageUrl = imageSrc 
                          ? (imageSrc.startsWith('companies/') || imageSrc.startsWith('/uploads/') 
                              ? formatAvatarUrl(imageSrc) 
                              : imageSrc)
                          : undefined;
                        
                        return serviceImageUrl ? (
                          <img 
                            src={serviceImageUrl}
                            alt="Service"
                            className="w-12 h-12 rounded object-cover"
                          />
                        ) : null;
                      })()}
                      <div className="text-sm text-foreground">
                        {selectedServiceData?.name}
                      </div>
                      {selectedServiceData && (
                        <div className="text-xs text-muted-foreground">
                          {companyCurrency ? `${companyCurrency.symbol} ${selectedServiceData.price.toFixed(companyCurrency.decimals || 2)}` : `$ ${selectedServiceData.price.toFixed(2)}`} • {selectedServiceData.duration} min
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Staff - Only show if staff entity is enabled */}
                  {(!selectedEntities || selectedEntities.includes('staff')) && ((selectedStaff && isCompanyOwner) || (!isCompanyOwner && preferredStaff.length > 0)) && (
                    <div className="space-y-2 p-3 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                      <div className="flex items-center gap-2">
                        {isCompanyOwner && selectedStaff && selectedStaffData && (
                          <Avatar className="w-8 h-8">
                            <AvatarImage 
                              src={formatAvatarUrl(selectedStaffData.avatar, selectedStaffData.firstName, selectedStaffData.lastName)}
                              alt={`${selectedStaffData.firstName || ''} ${selectedStaffData.lastName || ''}`.trim()}
                            />
                            <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)] text-xs">
                              {`${(selectedStaffData.firstName?.[0] || '')}${(selectedStaffData.lastName?.[0] || '')}`}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        {!isCompanyOwner && <Users className="w-4 h-4 text-[var(--accent-text)]" />}
                        <span className="text-sm font-medium text-foreground">
                          {isCompanyOwner ? 'Staff' : 'Preferred Staff'}
                        </span>
                      </div>
                      <div className="text-sm text-foreground">
                        {isCompanyOwner ? (
                          selectedStaffData ? `${selectedStaffData.firstName || ''} ${selectedStaffData.lastName || ''}`.trim() : 'Not selected'
                        ) : (
                          `${preferredStaff.length} staff selected`
                        )}
                      </div>
                      {isCompanyOwner && selectedStaff && selectedStaffData && (
                        <div className="text-xs text-muted-foreground">
                          {selectedStaffData.role || 'Staff Member'}
                        </div>
                      )}
                      {!isCompanyOwner && preferredStaff.length > 0 && (
                        <div className="space-y-2 mt-2">
                          {preferredStaff.map((staffId) => {
                            const staffData = staff.find(s => s.id === staffId);
                            return (
                              <div key={staffId} className="flex items-center gap-2 text-xs">
                                <Avatar className="w-8 h-8">
                                  <AvatarImage 
                                    src={staffData ? formatAvatarUrl(staffData.avatar, staffData.firstName, staffData.lastName) : undefined}
                                    alt={staffData ? `${staffData.firstName || ''} ${staffData.lastName || ''}`.trim() : 'Unknown'}
                                  />
                                  <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--accent-text)] text-xs">
                                    {staffData ? `${(staffData.firstName?.[0] || '')}${(staffData.lastName?.[0] || '')}` : '?'}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-muted-foreground">
                                  {staffData ? `${staffData.firstName || ''} ${staffData.lastName || ''}`.trim() : 'Unknown'}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Space Information - Only show if space entity is enabled */}
                  {(!selectedEntities || selectedEntities.includes('space')) && selectedSpace && (
                    <div className="space-y-2 p-3 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[var(--accent-text)]" />
                        <span className="text-sm font-medium text-foreground">Space</span>
                      </div>
                      {selectedSpaceData?.imageUrl && (
                        <img 
                          src={formatAvatarUrl(selectedSpaceData.imageUrl)}
                          alt="Space"
                          className="w-12 h-12 rounded object-cover"
                        />
                      )}
                      <div className="text-sm text-foreground">
                        {selectedSpaceData?.name}
                      </div>
                      {selectedSpaceData && (
                        <div className="text-xs text-muted-foreground">
                          Capacity: {selectedSpaceData.capacity}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Client Information */}
                  {selectedUser && (
                    <div className="space-y-2 p-3 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-[var(--accent-text)]" />
                        <span className="text-sm font-medium text-foreground">Client</span>
                      </div>
                      {filteredUsers.find(u => u.id === selectedUser)?.avatar && (
                        <img 
                          src={formatAvatarUrl(
                            filteredUsers.find(u => u.id === selectedUser)?.avatar,
                            filteredUsers.find(u => u.id === selectedUser)?.firstName,
                            filteredUsers.find(u => u.id === selectedUser)?.lastName
                          )}
                          alt="Client"
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      )}
                      <div className="text-sm text-foreground">
                        {selectedUserData ? `${selectedUserData.firstName || ''} ${selectedUserData.lastName || ''}`.trim() : 'Not selected'}
                      </div>
                      {selectedUserData && (
                        <div className="text-xs text-muted-foreground">
                          {selectedUserData.email}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Notes */}
                  {notes && (
                    <div className="space-y-2 p-3 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[var(--accent-text)]" />
                        <span className="text-sm font-medium text-foreground">Notes</span>
                      </div>
                      <div className="text-xs text-foreground bg-[var(--accent-bg)] border border-[var(--accent-border)] rounded p-2">
                        {notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
      </CustomDialog>
      
      {/* Create User Dialog */}
      {isCompanyOwner && (
        <CreateUserDialog
          open={isCreateUserDialogOpen}
          onOpenChange={setIsCreateUserDialogOpen}
          companyId={companyId}
          onSuccess={async (createdUser) => {
            // Refresh users list
            dispatch(fetchUsersRequest({}));
            // Auto-select the newly created user if available
            if (createdUser?.id) {
              // Wait a moment for the Redux state to update
              setTimeout(() => {
                setSelectedUser(createdUser.id);
              }, 500);
            }
          }}
        />
      )}
    </>
  );
}
