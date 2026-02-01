import { useState, useEffect, useMemo } from "react";
import { AppointmentStatus } from "../../types/appointmentStatus";
import { CustomDialog } from "../../components/ui/custom-dialog";
import { VisuallyHidden } from "../../components/ui/visually-hidden";
import { Button } from "../../components/ui/button";
import { Card } from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../../components/ui/avatar";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Calendar as CalendarComponent } from "../../components/ui/calendar";
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { 
  Calendar, 
  Clock, 
  Briefcase, 
  Users, 
  MapPin, 
  User, 
  FileText,
  CheckCircle,
  X,
  Search,
  Star,
  DollarSign,
  Timer,
  ChevronLeft,
  ChevronRight,
  Check,
  UserPlus
} from "lucide-react";
import { ViewSwitcher } from "../../components/ui/view-switcher";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchServicesRequest } from "../../store/slices/servicesSlice";
import { fetchStaffRequest } from "../../store/slices/staffSlice";
import { fetchUsersRequest } from "../../store/slices/usersSlice";
import { fetchSpacesRequest } from "../../store/slices/spacesSlice";
import { createAppointmentRequest } from "../../store/slices/appointmentsSlice";
import { formatAvatarUrl, formatDate } from "../../utils";
import { DateDisplay } from "../../components/common/DateDisplay";
import { Currency } from "../../services/currencies";
import { fetchCurrencyRequest } from "../../store/slices/currenciesSlice";
import { CreateUserDialog } from "../users/CreateUserDialog";

interface AppointmentWizardProps {
  currentUser: any;
  selectedDate?: Date;
  selectedTime?: string;
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

// Generate 15-minute time slots from 7:00 AM to 7:00 PM
const timeSlots = (() => {
  const slots = [];
  const startHour = 7; // 7 AM
  const endHour = 19; // 7 PM (19:00)
  
  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      if (hour === endHour && minute > 0) break; // Stop at exactly 7:00 PM
      
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(timeString);
    }
  }
  
  return slots;
})();

export function AppointmentWizard({ currentUser: currentUserProp, selectedDate, selectedTime, trigger }: AppointmentWizardProps) {
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
  
  // Get companyId reliably
  const companyId = currentUser?.companyId || currentUser?.company?.id;
  
  const [companyCurrency, setCompanyCurrency] = useState<Currency | null>(null);
  
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clientSearchQuery, setClientSearchQuery] = useState("");
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

  // Helper function to convert 12-hour format to 24-hour format
  const convertTo24Hour = (time12h: string): string => {
    if (!time12h) return "";
    
    // If already in 24-hour format, return as is
    if (!time12h.includes('AM') && !time12h.includes('PM')) {
      return time12h;
    }
    
    const [time, modifier] = time12h.split(' ');
    let [hours, minutes] = time.split(':');
    
    if (hours === '12') {
      hours = '00';
    }
    
    if (modifier === 'PM') {
      hours = (parseInt(hours, 10) + 12).toString();
    }
    
    return `${hours.padStart(2, '0')}:${minutes || '00'}`;
  };

  // Fetch company currency from Redux cache
  useEffect(() => {
    if (!companyId) {
      // Try to get USD as default if no company ID
      const usdCurrency = reduxCurrencies.find(c => c.name === 'USD');
      setCompanyCurrency(usdCurrency || null);
      return;
    }
    
    // Use userCompany if it matches the current user's companyId (cached)
    let company = (userCompany && String(userCompany.id) === String(companyId)) 
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

  // Define steps based on user role using useMemo to avoid initialization issues
  const steps = useMemo(() => {
    return isCompanyOwner 
      ? [
          { id: "datetime", title: "Date & Time", icon: Calendar },
          { id: "service", title: "Service", icon: Briefcase },
          { id: "staff", title: "Staff", icon: Users },
          { id: "space", title: "Space", icon: MapPin },
          { id: "client", title: "Client", icon: User },
          { id: "notes", title: "Notes", icon: FileText },
          { id: "review", title: "Review", icon: CheckCircle }
        ]
      : [
          { id: "datetime", title: "Date & Time", icon: Calendar },
          { id: "service", title: "Service", icon: Briefcase },
          { id: "staff", title: "Preferred Staff", icon: Users },
          { id: "space", title: "Space", icon: MapPin },
          { id: "client", title: "Client", icon: User },
          { id: "notes", title: "Notes", icon: FileText },
          { id: "review", title: "Review", icon: CheckCircle }
        ];
  }, [isCompanyOwner]);

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
      setSelectedService("");
      setSelectedStaff("");
      setPreferredStaff([]);
      setSelectedSpace("");
      setSelectedUser("");
      setNotes("");
      setClientSearchQuery("");
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
  }, [open, selectedDate, selectedTime]);

  // Filter clients based on search query - show all users from user table
  const filteredUsers = useMemo(() => {
    if (!reduxUsers || reduxUsers.length === 0) return [];
    
    if (!clientSearchQuery.trim()) {
      // Show all users if no search query
      return reduxUsers;
    }
    
    const query = clientSearchQuery.toLowerCase().trim();
    return reduxUsers.filter(user => {
      const name = `${user.firstName || ''} ${user.lastName || ''}`.trim().toLowerCase();
      const email = (user.email || '').toLowerCase();
      const phone = (user.phone || '').toLowerCase();
      return name.includes(query) || email.includes(query) || phone.includes(query);
    });
  }, [reduxUsers, clientSearchQuery]);

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
  const selectedUserData = filteredUsers.find(u => u.id === selectedUser);

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

    if (!selectedService) {
      toast.error("Please select a service");
      return;
    }

    if (isCompanyOwner && !selectedStaff) {
      toast.error("Please select a staff member");
      return;
    }

    if (!isCompanyOwner && preferredStaff.length === 0) {
      toast.error("Please select at least one preferred staff member");
      return;
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
        companyId: companyId,
        clientId: selectedUser,
        serviceId: selectedService,
        date: formattedDate,
        time: appointmentTime,
        duration: serviceData?.duration || 30,
        status: AppointmentStatus.PENDING,
        price: serviceData?.price || 0,
        paymentStatus: "Pending" as const,
      };

      // Add optional fields only if they have values
      if (isCompanyOwner && selectedStaff) {
        appointmentData.staffId = selectedStaff;
      }
      
      if (selectedSpace) {
        appointmentData.spaceId = selectedSpace;
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
      setClientSearchQuery("");
      setServiceSearchQuery("");
      setServiceViewMode("grid");
      setSpaceSearchQuery("");
      setSpaceViewMode("grid");
      setIsSubmitting(false);
      setOpen(false);
  };

  const renderStepContent = () => {
    const step = steps[currentStep];
    
    switch (step.id) {
      case "datetime":
        return (
          <div className="space-y-3 sm:space-y-4 pb-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4">
              {/* Mobile-Optimized Calendar */}
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[var(--accent-text)]" />
                  <h4 className="text-sm font-medium text-foreground">Select Date</h4>
                </div>
                <div className="flex justify-center overflow-visible">
                  <CalendarComponent
                    mode="single"
                    selected={appointmentDate}
                    onSelect={setAppointmentDate}
                    disabled={(date) => date < new Date()}
                    className="rounded-lg border-[var(--glass-border)] text-sm scale-75 sm:scale-90 origin-center"
                  />
                </div>
              </div>

              {/* Mobile-Optimized Time Slots */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[var(--accent-text)]" />
                  <h4 className="text-sm font-medium text-foreground">Select Time</h4>
                  <Badge variant="outline" className="text-xs">
                    7AM - 7PM, 15min intervals
                  </Badge>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 p-1">
                  {timeSlots.map((time) => {
                    // Convert to 12-hour format for display
                    const [hours, minutes] = time.split(':').map(Number);
                    const displayTime = new Date(2000, 0, 1, hours, minutes).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true
                    });
                    
                    return (
                      <Button
                        key={time}
                        variant={appointmentTime === time ? "default" : "outline"}
                        size="sm"
                        onClick={() => setAppointmentTime(time)}
                        className={`text-xs h-9 px-2 touch-manipulation ${appointmentTime === time 
                          ? "bg-[var(--accent-primary)] hover:bg-[var(--accent-primary-hover)] text-[var(--accent-button-text)] ring-2 ring-[var(--accent-primary)]/20" 
                          : "bg-[var(--glass-bg)] border-[var(--glass-border)] hover:bg-[var(--accent-bg)] hover:border-[var(--accent-border)] hover:text-[var(--accent-text)]"
                        }`}
                      >
                        {displayTime}
                      </Button>
                    );
                  })}
                </div>
                
                {appointmentTime && (
                  <div className="p-3 bg-[var(--accent-bg)] border border-[var(--accent-border)] rounded-lg">
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="w-4 h-4 text-[var(--accent-text)]" />
                      <span className="text-foreground">
                        Selected: {new Date(2000, 0, 1, ...appointmentTime.split(':').map(Number)).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case "service":
        return (
          <div className="space-y-3">
            {servicesLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">Loading services...</p>
              </div>
            ) : servicesError ? (
              <div className="text-center py-8">
                <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-50 text-red-500" />
                <p className="text-sm text-red-600 dark:text-red-400 mb-2">Error loading services</p>
                <p className="text-xs text-muted-foreground">{servicesError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => {
                    if (companyId) {
                      dispatch(fetchServicesRequest({ companyId }));
                    }
                  }}
                >
                  Retry
                </Button>
              </div>
            ) : activeServices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {services.length === 0 
                    ? "No services available." 
                    : `No active services available. Found ${services.length} service(s) but none are active.`}
                </p>
                {services.length > 0 && (
                  <div className="mt-4 text-xs space-y-1">
                    <p className="font-semibold">Services found (not active):</p>
                    {services.map(s => (
                      <p key={s.id}>- {s.name} (Status: {s.status || 'Unknown'})</p>
                    ))}
                  </div>
                )}
                {currentUser?.role === "Company Owner" && (
                  <p className="text-xs mt-2">
                    <Button
                      variant="link"
                      className="text-[var(--accent-text)] p-0 h-auto"
                      onClick={() => {
                        // Navigate to services page or open add service dialog
                        toast.info("Please add services from the Services page");
                      }}
                    >
                      Add services
                    </Button>
                  </p>
                )}
              </div>
            ) : (
              <>
                {/* Search Input and View Switcher */}
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search services by name, description, or category..."
                      value={serviceSearchQuery}
                      onChange={(e) => setServiceSearchQuery(e.target.value)}
                      className="pl-10 bg-[var(--glass-bg)] border-[var(--glass-border)] focus:border-[var(--accent-border)]"
                    />
                  </div>
                  <ViewSwitcher 
                    viewMode={serviceViewMode} 
                    onViewModeChange={setServiceViewMode}
                  />
                </div>

                {/* Services Count */}
                {serviceSearchQuery && (
                  <div className="text-xs text-muted-foreground">
                    Found {filteredActiveServices.length} of {activeServices.length} service{activeServices.length !== 1 ? 's' : ''}
                  </div>
                )}

                {/* Services Grid/List */}
                {filteredActiveServices.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No services found matching "{serviceSearchQuery}"</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => setServiceSearchQuery("")}
                    >
                      Clear search
                    </Button>
                  </div>
                ) : serviceViewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {filteredActiveServices.map((service) => {
                      // Format price using company currency
                      const formatPrice = (price: number | string) => {
                        const numPrice = typeof price === 'string' 
                          ? parseFloat(price.replace(/[^0-9.]/g, '')) 
                          : Number(price) || 0;
                        
                        if (isNaN(numPrice)) {
                          return companyCurrency ? `${companyCurrency.symbol} ${(0).toFixed(companyCurrency.decimals || 2)}` : '$ 0.00';
                        }
                        
                        if (companyCurrency) {
                          const decimals = companyCurrency.decimals || 2;
                          const roundedPrice = Math.round(numPrice / companyCurrency.rounding) * companyCurrency.rounding;
                          const formattedNumber = new Intl.NumberFormat('en-US', {
                            minimumFractionDigits: decimals,
                            maximumFractionDigits: decimals
                          }).format(roundedPrice);
                          return `${companyCurrency.symbol} ${formattedNumber}`;
                        }
                        
                        return `$ ${numPrice.toFixed(2)}`;
                      };

                      // Get image URL - handle both image and imageUrl properties, and format if needed
                      const getImageUrl = (service: any) => {
                        const imageSrc = service.image || service.imageUrl;
                        if (!imageSrc) return undefined;
                        // Check if it's a URL path that needs formatting
                        if (imageSrc.startsWith('companies/') || imageSrc.startsWith('/uploads/')) {
                          return formatAvatarUrl(imageSrc);
                        }
                        return imageSrc;
                      };

                      return (
                        <Card
                          key={service.id}
                          className={`cursor-pointer transition-all duration-200 touch-manipulation ${
                            selectedService === service.id 
                              ? 'border-[var(--accent-border)] bg-[var(--accent-bg)] ring-2 ring-[var(--accent-border)]' 
                              : 'border-[var(--glass-border)] bg-[var(--glass-bg)] hover:border-[var(--accent-border)] active:bg-[var(--accent-bg)]'
                          }`}
                          onClick={() => setSelectedService(service.id)}
                        >
                          <div className="aspect-video relative overflow-hidden rounded-t-lg">
                            <ImageWithFallback
                              src={getImageUrl(service)}
                              alt={service.name}
                              className="w-full h-full object-cover"
                              fallbackSrc="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=200&fit=crop"
                            />
                            {service.category && (
                              <div className="absolute top-2 right-2">
                                <Badge className="bg-[var(--accent-bg)] text-[var(--accent-text)] border-[var(--accent-border)] text-xs">
                                  {service.category}
                                </Badge>
                              </div>
                            )}
                            {selectedService === service.id && (
                              <div className="absolute inset-0 bg-[var(--accent-primary)]/20 flex items-center justify-center">
                                <div className="w-8 h-8 bg-[var(--accent-primary)] text-white rounded-full flex items-center justify-center">
                                  <Check className="w-5 h-5" />
                                </div>
                              </div>
                            )}
                          </div>
                          
                          <div className="p-3 space-y-2">
                            <div className="flex items-start justify-between">
                              <h4 className="font-medium text-foreground text-sm">{service.name}</h4>
                            </div>
                            
                            {service.description && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {service.description}
                              </p>
                            )}
                            
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1 text-muted-foreground">
                                <Timer className="w-3 h-3" />
                                <span>{service.duration} min</span>
                              </div>
                              <div className="flex items-center gap-1 font-medium text-[var(--accent-text)]">
                                <DollarSign className="w-3 h-3" />
                                <span>{formatPrice(service.price)}</span>
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredActiveServices.map((service) => {
                      // Format price using company currency
                      const formatPrice = (price: number | string) => {
                        const numPrice = typeof price === 'string' 
                          ? parseFloat(price.replace(/[^0-9.]/g, '')) 
                          : Number(price) || 0;
                        
                        if (isNaN(numPrice)) {
                          return companyCurrency ? `${companyCurrency.symbol} ${(0).toFixed(companyCurrency.decimals || 2)}` : '$ 0.00';
                        }
                        
                        if (companyCurrency) {
                          const decimals = companyCurrency.decimals || 2;
                          const roundedPrice = Math.round(numPrice / companyCurrency.rounding) * companyCurrency.rounding;
                          const formattedNumber = new Intl.NumberFormat('en-US', {
                            minimumFractionDigits: decimals,
                            maximumFractionDigits: decimals
                          }).format(roundedPrice);
                          return `${companyCurrency.symbol} ${formattedNumber}`;
                        }
                        
                        return `$ ${numPrice.toFixed(2)}`;
                      };

                      // Get image URL - handle both image and imageUrl properties, and format if needed
                      const getImageUrl = (service: any) => {
                        const imageSrc = service.image || service.imageUrl;
                        if (!imageSrc) return undefined;
                        // Check if it's a URL path that needs formatting
                        if (imageSrc.startsWith('companies/') || imageSrc.startsWith('/uploads/')) {
                          return formatAvatarUrl(imageSrc);
                        }
                        return imageSrc;
                      };

                      return (
                        <Card
                          key={service.id}
                          className={`cursor-pointer transition-all duration-200 touch-manipulation ${
                            selectedService === service.id 
                              ? 'border-[var(--accent-border)] bg-[var(--accent-bg)] ring-2 ring-[var(--accent-border)]' 
                              : 'border-[var(--glass-border)] bg-[var(--glass-bg)] hover:border-[var(--accent-border)] active:bg-[var(--accent-bg)]'
                          }`}
                          onClick={() => setSelectedService(service.id)}
                        >
                          <div className="flex items-start gap-4 p-4">
                            {/* Service Image */}
                            <div className="flex-shrink-0 relative overflow-hidden rounded-lg w-24 h-20">
                              <ImageWithFallback
                                src={getImageUrl(service)}
                                alt={service.name}
                                className="w-full h-full object-cover"
                                fallbackSrc="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=200&fit=crop"
                              />
                              {selectedService === service.id && (
                                <div className="absolute inset-0 bg-[var(--accent-primary)]/20 flex items-center justify-center">
                                  <div className="w-6 h-6 bg-[var(--accent-primary)] text-white rounded-full flex items-center justify-center">
                                    <Check className="w-4 h-4" />
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {/* Service Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-semibold text-foreground text-base mb-1">{service.name}</h4>
                                  {service.category && (
                                    <Badge className="bg-[var(--accent-bg)] text-[var(--accent-text)] border-[var(--accent-border)] text-xs mb-2">
                                      {service.category}
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  <Badge className="bg-[var(--accent-bg)] text-[var(--accent-text)] border border-[var(--accent-border)] px-3 py-1 font-semibold">
                                    {formatPrice(service.price)}
                                  </Badge>
                                </div>
                              </div>
                              
                              {service.description && (
                                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                  {service.description}
                                </p>
                              )}
                              
                              <div className="flex items-center gap-4 text-xs">
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Timer className="w-3 h-3" />
                                  <span>{service.duration} min</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        );

      case "staff":
        return (
          <div className="space-y-4">
            {/* Instructions for different user roles */}
            <div className="p-3 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)]">
              <p className="text-sm text-foreground">
                {isCompanyOwner 
                  ? "Select the staff member who will handle this appointment."
                  : "Select 1 staff member to assign directly, or choose 2-3 preferred staff members for the company owner to assign."
                }
              </p>
            </div>
            
            {staffLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">Loading staff...</p>
              </div>
            ) : staff.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No staff members available. Please add staff first.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {staff.filter(s => s.status === 'Active').map((staffMember) => {
                    const isSelected = isCompanyOwner ? selectedStaff === staffMember.id : preferredStaff.includes(staffMember.id);
                    const canSelect = isCompanyOwner 
                      ? true 
                      : (preferredStaff.length < 3 || isSelected);
                    
                    return (
                      <Card
                        key={staffMember.id}
                        className={`cursor-pointer transition-all duration-200 relative touch-manipulation ${
                          !canSelect ? 'opacity-50 cursor-not-allowed' : ''
                        } ${
                          isSelected 
                            ? 'border-[var(--accent-border)] bg-[var(--accent-bg)] ring-2 ring-[var(--accent-border)]' 
                            : 'border-[var(--glass-border)] bg-[var(--glass-bg)] hover:border-[var(--accent-border)] active:bg-[var(--accent-bg)]'
                        }`}
                        onClick={() => {
                          if (!canSelect) return;
                          
                          if (isCompanyOwner) {
                            setSelectedStaff(staffMember.id);
                          } else {
                            const newPreferred = isSelected 
                              ? preferredStaff.filter(id => id !== staffMember.id)
                              : [...preferredStaff, staffMember.id];
                            setPreferredStaff(newPreferred);
                          }
                        }}
                      >
                        {/* Selection indicator for users */}
                        {!isCompanyOwner && isSelected && (
                          <div className="absolute -top-2 -right-2 w-6 h-6 bg-[var(--accent-primary)] text-white rounded-full flex items-center justify-center text-xs font-medium z-10">
                            {preferredStaff.indexOf(staffMember.id) + 1}
                          </div>
                        )}
                        
                        <div className="p-3 space-y-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="w-10 h-10 border-2 border-[var(--glass-border)]">
                              <AvatarImage src={formatAvatarUrl(staffMember.avatar, staffMember.firstName, staffMember.lastName)} alt={`${staffMember.firstName || ''} ${staffMember.lastName || ''}`} />
                              <AvatarFallback className="text-xs">
                                {(staffMember.firstName?.[0] || '')}{(staffMember.lastName?.[0] || '')}
                              </AvatarFallback>
                            </Avatar>
                            
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-foreground truncate text-sm">
                                {staffMember.firstName || ''} {staffMember.lastName || ''}
                              </h4>
                              <p className="text-xs text-[var(--accent-text)]">{staffMember.role || 'Staff Member'}</p>
                            </div>
                          </div>
                          
                          {staffMember.bio && (
                            <div className="space-y-1">
                              <p className="text-xs text-muted-foreground line-clamp-2">{staffMember.bio}</p>
                            </div>
                          )}
                          
                          <Badge 
                            variant={staffMember.status === 'Active' ? "default" : "secondary"}
                            className={`text-xs ${staffMember.status === 'Active'
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
                              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
                            }`}
                          >
                            {staffMember.status}
                          </Badge>
                        </div>
                      </Card>
                    );
                  })}
                </div>
                
                {/* Selection counter for users */}
                {!isCompanyOwner && (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">
                      {preferredStaff.length === 1 
                        ? "1 staff member selected - will be assigned directly"
                        : `Selected ${preferredStaff.length} of 3 preferred staff members`
                      }
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        );

      case "space":
        return (
          <div className="space-y-3">
            {spacesLoading ? (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">Loading spaces...</p>
              </div>
            ) : spacesError ? (
              <div className="text-center py-8">
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50 text-red-500" />
                <p className="text-sm text-red-600 dark:text-red-400 mb-2">Error loading spaces</p>
                <p className="text-xs text-muted-foreground">{spacesError}</p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => {
                    if (companyId) {
                      dispatch(fetchSpacesRequest({ companyId }));
                    }
                  }}
                >
                  Retry
                </Button>
              </div>
            ) : activeSpaces.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  {spaces.length === 0 
                    ? "No spaces available." 
                    : `No active spaces available. Found ${spaces.length} space(s) but none are active.`}
                </p>
                {currentUser?.role === "Company Owner" && (
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
            ) : (
              <>
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
                    {filteredActiveSpaces.map((space) => {
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

                      return (
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
                      );
                    })}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredActiveSpaces.map((space) => {
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

                      return (
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
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        );

      case "client":
        return (
          <div className="flex flex-col h-full space-y-3">
            {/* Search Input */}
            <div className="relative shrink-0">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users by name, email, or phone..."
                value={clientSearchQuery}
                onChange={(e) => setClientSearchQuery(e.target.value)}
                className="pl-10 bg-[var(--glass-bg)] border-[var(--glass-border)] focus:border-[var(--accent-border)]"
              />
            </div>

            {/* Users Count */}
            <div className="text-xs text-muted-foreground">
              {clientSearchQuery ? (
                <>Found {filteredUsers.length} of {reduxUsers?.length || 0} user{reduxUsers?.length !== 1 ? 's' : ''}</>
              ) : (
                <>{reduxUsers?.length || 0} user{(reduxUsers?.length || 0) !== 1 ? 's' : ''} available</>
              )}
            </div>
            
            <div className="flex-1 min-h-0 sm:h-80 overflow-y-auto overflow-x-hidden custom-scrollbar space-y-2 border border-[var(--glass-border)] rounded-lg p-2 bg-[var(--glass-bg)]/50">
              {usersLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent-primary)] mx-auto mb-2"></div>
                  <p className="text-sm">Loading users...</p>
                </div>
              ) : usersError ? (
                <div className="text-center py-8">
                  <User className="w-8 h-8 mx-auto mb-2 opacity-50 text-red-500" />
                  <p className="text-sm text-red-600 dark:text-red-400 mb-2">Error loading users</p>
                  <p className="text-xs text-muted-foreground">{usersError}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      dispatch(fetchUsersRequest({}));
                    }}
                  >
                    Retry
                  </Button>
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    {reduxUsers?.length === 0 
                      ? "No users available." 
                      : "No users found matching your search."}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center mt-4">
                    {clientSearchQuery && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setClientSearchQuery("")}
                      >
                        Clear search
                      </Button>
                    )}
                    {isCompanyOwner && (
                      <Button
                        variant="accent"
                        size="sm"
                        onClick={() => setIsCreateUserDialogOpen(true)}
                        className="flex items-center gap-2"
                      >
                        <UserPlus className="w-4 h-4" />
                        Create New User
                      </Button>
                    )}
                  </div>
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <Card
                    key={user.id}
                    className={`cursor-pointer transition-all duration-200 w-full touch-manipulation ${
                      selectedUser === user.id 
                        ? 'border-[var(--accent-border)] bg-[var(--accent-bg)] ring-2 ring-[var(--accent-border)]' 
                        : 'border-[var(--glass-border)] bg-[var(--glass-bg)] hover:border-[var(--accent-border)] active:bg-[var(--accent-bg)]'
                    }`}
                    onClick={() => setSelectedUser(user.id)}
                  >
                    <div className="p-3 flex items-center gap-3 w-full min-w-0">
                      <div className="relative flex-shrink-0">
                        <Avatar className="w-10 h-10 border border-[var(--glass-border)]">
                          <AvatarImage src={formatAvatarUrl(user.avatar, user.firstName, user.lastName)} alt={`${user.firstName || ''} ${user.lastName || ''}`} />
                          <AvatarFallback className="text-xs">
                            {(user.firstName?.[0] || '')}{(user.lastName?.[0] || '')}
                          </AvatarFallback>
                        </Avatar>
                        {selectedUser === user.id && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--accent-primary)] text-white rounded-full flex items-center justify-center">
                            <Check className="w-3 h-3" />
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0 overflow-hidden">
                        <h4 className="font-medium text-foreground truncate text-sm">
                          {`${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        {user.phone && (
                          <p className="text-xs text-muted-foreground truncate sm:hidden">{user.phone}</p>
                        )}
                      </div>
                      
                      <div className="flex-shrink-0 text-right hidden sm:block">
                        {user.createdAt && (
                          <>
                            <p className="text-xs text-muted-foreground whitespace-nowrap">Joined</p>
                            <p className="text-xs text-[var(--accent-text)] whitespace-nowrap"><DateDisplay date={user.createdAt} /></p>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        );

      case "notes":
        return (
          <div className="space-y-3 pb-4">
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any special instructions or notes for this appointment..."
              className="bg-[var(--glass-bg)] border-[var(--glass-border)] text-foreground resize-none min-h-24 sm:min-h-32 touch-manipulation"
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Optional: Provide any additional information that might be helpful for your appointment.
            </p>
          </div>
        );

      case "review":
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date & Time */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-[var(--accent-text)]">Date & Time</h4>
                <div className="p-3 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)]">
                  <p className="text-sm font-medium text-foreground">
                    <DateDisplay date={appointmentDate} fallback="Not selected" />
                  </p>
                  {appointmentTime && (
                    <p className="text-xs text-muted-foreground">at {appointmentTime}</p>
                  )}
                </div>
              </div>

              {/* Service */}
              {selectedServiceData && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-[var(--accent-text)]">Service</h4>
                  <div className="p-3 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)]">
                    <p className="text-sm font-medium text-foreground">{selectedServiceData.name}</p>
                    <p className="text-xs text-muted-foreground">{selectedServiceData.duration} • {selectedServiceData.price}</p>
                  </div>
                </div>
              )}

              {/* Staff */}
              {((selectedStaffData && isCompanyOwner) || (!isCompanyOwner && preferredStaff.length > 0)) && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-[var(--accent-text)]">
                    {isCompanyOwner ? 'Staff' : 'Preferred Staff'}
                  </h4>
                  <div className="p-3 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)]">
                    {isCompanyOwner && selectedStaffData ? (
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={formatAvatarUrl(selectedStaffData.avatar, selectedStaffData.firstName, selectedStaffData.lastName)} alt={`${selectedStaffData.firstName || ''} ${selectedStaffData.lastName || ''}`} />
                          <AvatarFallback className="text-xs">
                            {(selectedStaffData.firstName?.[0] || '')}{(selectedStaffData.lastName?.[0] || '')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {selectedStaffData.firstName || ''} {selectedStaffData.lastName || ''}
                          </p>
                          <p className="text-xs text-muted-foreground">{selectedStaffData.role || 'Staff Member'}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {preferredStaff.map((staffId, index) => {
                          const staffData = staff.find(s => s.id === staffId);
                          return (
                            <div key={staffId} className="flex items-center gap-3">
                              <div className="w-6 h-6 bg-[var(--accent-primary)] text-white rounded-full flex items-center justify-center text-xs font-medium">
                                {index + 1}
                              </div>
                              <Avatar className="w-8 h-8">
                                <AvatarImage src={formatAvatarUrl(staffData?.avatar, staffData?.firstName, staffData?.lastName)} alt={`${staffData?.firstName || ''} ${staffData?.lastName || ''}`} />
                                <AvatarFallback className="text-xs">
                                  {(staffData?.firstName?.[0] || '')}{(staffData?.lastName?.[0] || '')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">
                                  {staffData ? `${staffData.firstName || ''} ${staffData.lastName || ''}`.trim() : 'Unknown'}
                                </p>
                                <p className="text-xs text-muted-foreground">{staffData?.role || 'Staff Member'}</p>
                              </div>
                            </div>
                          );
                        })}
                        <p className="text-xs text-muted-foreground mt-2">
                          The company owner will assign one of these staff members when confirming your appointment.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Space */}
              {selectedSpaceData && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-[var(--accent-text)]">Space</h4>
                  <div className="p-3 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)]">
                    <p className="text-sm font-medium text-foreground">{selectedSpaceData.name}</p>
                    <p className="text-xs text-muted-foreground">Capacity: {selectedSpaceData.capacity}</p>
                  </div>
                </div>
              )}

              {/* Client */}
              {selectedUserData && isCompanyOwner && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-[var(--accent-text)]">Client</h4>
                    <div className="p-3 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center gap-3">
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={formatAvatarUrl(selectedUserData.avatar, selectedUserData.firstName, selectedUserData.lastName)} alt={`${selectedUserData.firstName || ''} ${selectedUserData.lastName || ''}`} />
                      <AvatarFallback className="text-xs">
                        {(selectedUserData.firstName?.[0] || '')}{(selectedUserData.lastName?.[0] || '')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {`${selectedUserData.firstName || ''} ${selectedUserData.lastName || ''}`.trim() || selectedUserData.email}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">{selectedUserData.email}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Notes */}
              {notes && (
                <div className="space-y-2 md:col-span-2">
                  <h4 className="text-sm font-medium text-[var(--accent-text)]">Notes</h4>
                  <div className="p-3 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)]">
                    <p className="text-xs text-muted-foreground">{notes}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
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
        title="Create Appointment"
        description="Schedule a new appointment by completing each step of the booking process."
        icon={
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center shrink-0">
            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-[var(--accent-text)]" />
          </div>
        }
        customHeader={
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-[var(--accent-bg)] border border-[var(--accent-border)] flex items-center justify-center shrink-0">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-[var(--accent-text)]" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-base sm:text-lg font-semibold text-foreground leading-none">
                  Create Appointment
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                  Schedule a new appointment by completing each step of the booking process.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block whitespace-nowrap">
                Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
              </p>
            </div>
          </div>
        }
        className="w-full max-w-none sm:max-w-[98vw] sm:w-[98vw] lg:max-w-[95vw] lg:w-[95vw] xl:max-w-[90vw] xl:w-[90vw] h-[100vh] sm:h-[92vh] max-h-[100vh] sm:max-h-[92vh] overflow-hidden backdrop-blur-sm bg-[var(--glass-bg)] border-0 sm:border border-[var(--glass-border)] custom-scrollbar p-0 sm:rounded-lg flex flex-col"
        disableContentScroll={true}
        hideCloseButton={false}
        noContentPadding={true}
      >
        <VisuallyHidden>
          <span id="appointment-wizard-description">
            Schedule a new appointment by completing each step of the booking process.
          </span>
        </VisuallyHidden>
        
        {/* Progress Stepper */}
        <div className="shrink-0 px-3 sm:px-4 py-3 sm:py-4 border-b border-[var(--glass-border)]">
          {/* Mobile step indicator */}
          <div className="block sm:hidden mb-3">
            <p className="text-xs text-muted-foreground text-center">
              Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
            </p>
          </div>
          
          {/* Responsive Stepper */}
          <div className="flex items-center justify-center">
            {/* Mobile: Simplified Progress Bar */}
            <div className="block sm:hidden w-full max-w-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground">Progress</span>
                <span className="text-xs text-[var(--accent-text)]">{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
              </div>
              <div className="w-full bg-[var(--glass-border)] rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                />
              </div>
            </div>
            
            {/* Desktop: Full Stepper */}
            <div className="hidden sm:flex items-center space-x-1 lg:space-x-2">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isCompleted = index < currentStep;
                const isCurrent = index === currentStep;
                
                return (
                  <div key={step.id} className="flex items-center">
                    <div
                      className={`w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center text-xs transition-all duration-200 ${
                        isCompleted
                          ? "bg-[var(--accent-primary)] text-white"
                          : isCurrent
                          ? "bg-[var(--accent-bg)] border-2 border-[var(--accent-primary)] text-[var(--accent-text)]"
                          : "bg-[var(--glass-bg)] border border-[var(--glass-border)] text-muted-foreground"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-3 h-3 lg:w-4 lg:h-4" />
                      ) : (
                        <StepIcon className="w-3 h-3 lg:w-4 lg:h-4" />
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`w-4 lg:w-8 h-0.5 mx-0.5 lg:mx-1 transition-all duration-200 ${
                          isCompleted
                            ? "bg-[var(--accent-primary)]"
                            : "bg-[var(--glass-border)]"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Step Content with Summary */}
        <div className="flex-1 min-h-0 overflow-hidden px-3 sm:px-4 pt-2 pb-20 sm:pb-4">
          <div className={`grid grid-cols-1 ${isLastStep ? 'lg:grid-cols-1' : 'lg:grid-cols-3'} gap-3 sm:gap-4 h-full min-h-0`}>
            {/* Main Content Area - Hidden on last step */}
            {!isLastStep && (
              <div className="lg:col-span-2 flex flex-col min-h-0">
                <Card className="flex-1 flex flex-col p-3 sm:p-4 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)] min-h-0 overflow-hidden">
                  {/* Fixed Title Area */}
                  <div className="shrink-0 flex items-center gap-2 mb-3 sm:mb-4 border-b border-[var(--glass-border)] pb-3">
                    {(() => {
                      const StepIcon = steps[currentStep].icon;
                      return <StepIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--accent-text)]" />;
                    })()}
                    <h3 className="text-sm sm:text-base font-semibold text-foreground">{steps[currentStep].title}</h3>
                  </div>
                  
                  {/* Scrollable Content Area */}
                  <div className={`flex-1 min-h-0 ${steps[currentStep].id === 'client' ? 'overflow-hidden' : 'overflow-y-auto custom-scrollbar'}`}>
                    {renderStepContent()}
                  </div>
                </Card>
              </div>
            )}

            {/* Summary Section - Full width on last step, hidden on mobile otherwise */}
            <div className={`${isLastStep ? 'lg:col-span-1' : 'lg:col-span-1'} ${isLastStep ? 'block' : 'hidden lg:block'} flex flex-col min-h-0 h-full`}>
              <Card className="bg-[var(--glass-bg)] border-[var(--glass-border)] backdrop-blur-md shadow-lg h-full flex flex-col min-h-0 sticky top-0">
                <div className="p-3 sm:p-4 border-b border-[var(--glass-border)] shrink-0">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[var(--accent-text)]" />
                    <h3 className="text-sm font-semibold text-foreground">Appointment Summary</h3>
                  </div>
                </div>
                
                <div className="p-3 sm:p-4 overflow-y-auto custom-scrollbar flex-1 min-h-0">
                  <div className={`grid ${isLastStep ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 xl:grid-cols-2'} gap-2 sm:gap-3 text-sm`}>
                    {/* Service */}
                    <div className="space-y-2 p-3 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4 text-[var(--accent-text)]" />
                        <span className="text-muted-foreground text-xs">Service</span>
                      </div>
                      {selectedService && selectedServiceData && (() => {
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
                      <div className="text-foreground font-medium text-sm">
                        {selectedService ? activeServices.find(s => s.id === selectedService)?.name : 'Not selected'}
                      </div>
                      {selectedService && selectedServiceData && (
                        <div className="text-xs text-muted-foreground">
                          {companyCurrency ? `${companyCurrency.symbol} ${selectedServiceData.price.toFixed(companyCurrency.decimals || 2)}` : `$ ${selectedServiceData.price.toFixed(2)}`} • {selectedServiceData.duration} min
                        </div>
                      )}
                    </div>

                    {/* Staff */}
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
                        <span className="text-muted-foreground text-xs">
                          {isCompanyOwner ? 'Staff' : 'Preferred Staff'}
                        </span>
                      </div>
                      <div className="text-foreground font-medium text-sm">
                        {isCompanyOwner ? (
                          selectedStaff && selectedStaffData ? `${selectedStaffData.firstName || ''} ${selectedStaffData.lastName || ''}`.trim() : 'Not selected'
                        ) : (
                          preferredStaff.length > 0 ? `${preferredStaff.length} selected` : 'Not selected'
                        )}
                      </div>
                      {isCompanyOwner && selectedStaff && selectedStaffData && (
                        <div className="text-xs text-muted-foreground">
                          {selectedStaffData.role || 'Staff Member'}
                        </div>
                      )}
                      {!isCompanyOwner && preferredStaff.length > 0 && (
                        <div className="space-y-2">
                          {preferredStaff.map((staffId, index) => {
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

                    {/* Space */}
                    <div className="space-y-2 p-3 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-[var(--accent-text)]" />
                        <span className="text-muted-foreground text-xs">Space</span>
                      </div>
                      {selectedSpace && selectedSpaceData?.imageUrl && (
                        <img 
                          src={formatAvatarUrl(selectedSpaceData.imageUrl)}
                          alt="Space"
                          className="w-12 h-12 rounded object-cover"
                        />
                      )}
                      <div className="text-foreground font-medium text-sm">
                        {selectedSpace ? selectedSpaceData?.name : 'Not selected'}
                      </div>
                      {selectedSpace && selectedSpaceData && (
                        <div className="text-xs text-muted-foreground">
                          Capacity: {selectedSpaceData.capacity}
                        </div>
                      )}
                    </div>

                    {/* Date & Time */}
                    <div className="space-y-2 p-3 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[var(--accent-text)]" />
                        <span className="text-muted-foreground text-xs">Date & Time</span>
                      </div>
                      <div className="text-foreground font-medium text-sm">
                        <DateDisplay date={appointmentDate} fallback="Not selected" />
                      </div>
                      <div className="text-foreground font-medium text-sm">
                        {appointmentTime || 'Time not selected'}
                      </div>
                    </div>

                    {/* Client */}
                    <div className="space-y-2 p-3 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-[var(--accent-text)]" />
                        <span className="text-muted-foreground text-xs">Client</span>
                      </div>
                      {selectedUser && selectedUserData?.avatar && (
                        <img 
                          src={formatAvatarUrl(selectedUserData.avatar, selectedUserData.firstName, selectedUserData.lastName)}
                          alt="Client"
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      )}
                      <div className="text-foreground font-medium text-sm">
                        {selectedUser ? filteredUsers.find(u => u.id === selectedUser)?.name : 'Not selected'}
                      </div>
                      {selectedUser && (
                        <div className="text-xs text-muted-foreground">
                          {filteredUsers.find(u => u.id === selectedUser)?.email}
                        </div>
                      )}
                    </div>

                    {/* Notes - Takes full width when exists */}
                    {notes && (
                      <div className="col-span-2 space-y-2 p-3 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)]">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[var(--accent-text)]" />
                          <span className="text-muted-foreground text-xs">Notes</span>
                        </div>
                        <div className="text-xs text-foreground bg-[var(--accent-bg)] border border-[var(--accent-border)] rounded p-2">
                          {notes}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Fixed Footer with Navigation */}
        <div className="shrink-0 fixed bottom-0 left-0 right-0 sm:sticky sm:bottom-auto backdrop-blur-md bg-[var(--glass-bg)]/95 border-t border-[var(--glass-border)] px-3 sm:px-4 py-2 sm:py-3 z-50">
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
                // Toggle mobile summary view - we'll implement this
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
                  
                  {selectedService && (
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
                  
                  {((selectedStaff && isCompanyOwner) || (!isCompanyOwner && preferredStaff.length > 0)) && (
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

                  {/* Space Information */}
                  {selectedSpace && (
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
                setClientSearchQuery(""); // Clear search to show the selected user
              }, 500);
            }
          }}
        />
      )}
    </>
  );
}
