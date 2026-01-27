import { useState, useEffect } from "react";
import { toast } from "sonner";

// Types
import type { User, Theme, AccentColor } from "./types";

// Services
import { authService } from "./services";

// Utils
import { applyTheme, storage, performance as perfUtils } from "./utils";

// Hooks
import { useIsMobile } from "./hooks";

// Pages - Components will be moved gradually
import {
  // Auth
  LoginPage,
  SignUpPage,
  // Layout
  MainLayout,
  AuthLayout,
  LoadingLayout,
  ErrorLayout,
  // Dashboard (moved)
  Dashboard,
} from "./pages";

// Pages - properly organized
import { AppointmentsPage, MyAppointmentsPage, UserAppointmentHistoryPage } from "./pages/appointments";

// Temporary imports still from components (to be moved gradually)
// Companies pages (moved to pages/companies)
import { CompaniesPage, CompanyProfilePage, CompanySettingsPage } from "./pages/companies";

// Categories pages (moved to pages/categories)
import { CategoriesPage, CategoryDetailPage } from "./pages/categories";

// Products pages (moved to pages/products)
import { ProductsPage, SystemProductsPage, ProductDetailPage } from "./pages/products";

// Sales pages (moved to pages/sales)
import { SalesPage } from "./pages/sales";

// Services pages (moved to pages/services)
import { ServicesPage } from "./pages/services";

// Settings pages (moved to pages/settings)
import { SettingsPage } from "./pages/settings";

// Spaces pages (moved to pages/spaces)
import { SpacesPage } from "./pages/spaces";

// Staff pages (moved to pages/staff)
import { StaffPage, StaffDetailPage } from "./pages/staff";

// Users pages (moved to pages/users)
import { UsersPage, ProfilePage } from "./pages/users";

// Notifications pages (moved to pages/notifications)
import { NotificationsPage } from "./pages/notifications";

// Search pages (moved to pages/search)
import { SearchPage } from "./pages/search";

// Analytics
import { AnalyticsPage } from "./pages/analytics";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedUserForAppointments, setSelectedUserForAppointments] = useState<string | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>("dark");
  const [accentColor, setAccentColor] = useState<AccentColor>("orange");
  const [isLoading, setIsLoading] = useState(true);
  const [showSignUp, setShowSignUp] = useState(false);
  const isMobile = useIsMobile();

  // Apply theme and accent color
  useEffect(() => {
    applyTheme(theme, accentColor);
  }, [accentColor, theme]);

  // Listen for system theme changes
  useEffect(() => {
    if (theme === "system") {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      let timeoutId: number;
      
      const handleChange = () => {
        clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => {
          requestAnimationFrame(() => {
            const root = window.document.documentElement;
            root.classList.remove("light", "dark");
            root.classList.add(mediaQuery.matches ? "dark" : "light");
          });
        }, 50);
      };

      mediaQuery.addEventListener("change", handleChange);
      return () => {
        mediaQuery.removeEventListener("change", handleChange);
        clearTimeout(timeoutId);
      };
    }
  }, [theme]);

  // Load settings from localStorage
  useEffect(() => {
    let isMounted = true;
    
    const loadSettings = async () => {
      try {
        if (window.requestIdleCallback) {
          window.requestIdleCallback(() => {
            if (!isMounted) return;
            
            const savedTheme = storage.get("theme") as Theme | null;
            const savedAccentColor = storage.get("accentColor") as AccentColor | null;
            
            if (savedTheme) setTheme(savedTheme);
            if (savedAccentColor) setAccentColor(savedAccentColor);
            setIsLoading(false);
          });
        } else {
          const savedTheme = storage.get("theme") as Theme | null;
          const savedAccentColor = storage.get("accentColor") as AccentColor | null;
          
          if (savedTheme) setTheme(savedTheme);
          if (savedAccentColor) setAccentColor(savedAccentColor);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error loading theme settings:", error);
        if (isMounted) setIsLoading(false);
      }
    };

    loadSettings();
    
    return () => {
      isMounted = false;
    };
  }, []);

  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    storage.set("theme", newTheme);
  };

  const handleAccentColorChange = (newAccentColor: AccentColor) => {
    setAccentColor(newAccentColor);
    storage.set("accentColor", newAccentColor);
  };

  const renderPage = () => {
    perfUtils.mark('page-render-start');
    
    try {
      if (currentPage === "company-profile" && selectedCompanyId) {
        return (
          <CompanyProfilePage 
            companyId={selectedCompanyId} 
            onBack={() => {
              setCurrentPage("companies");
              setSelectedCompanyId(null);
            }} 
          />
        );
      }

      if (currentPage === "product-detail" && selectedProductId) {
        return (
          <ProductDetailPage 
            productId={selectedProductId} 
            onBack={() => {
              setCurrentPage("system-products");
              setSelectedProductId(null);
            }} 
          />
        );
      }

      if (currentPage === "company-product-detail" && selectedProductId) {
        return (
          <ProductDetailPage 
            productId={selectedProductId} 
            productType="company"
            onBack={() => {
              setCurrentPage("products");
              setSelectedProductId(null);
            }} 
          />
        );
      }

      if (currentPage === "category-detail" && selectedCategoryId) {
        return (
          <CategoryDetailPage 
            categoryId={selectedCategoryId} 
            onBack={() => {
              setCurrentPage("categories");
              setSelectedCategoryId(null);
            }} 
          />
        );
      }

      if (currentPage === "user-profile" && selectedUserId) {
        return (
          <ProfilePage 
            userId={selectedUserId}
            onBack={() => {
              setCurrentPage("users");
              setSelectedUserId(null);
            }} 
          />
        );
      }

      if (currentPage === "user-appointment-history" && selectedUserForAppointments) {
        return (
          <UserAppointmentHistoryPage 
            userId={selectedUserForAppointments}
            onBack={() => {
              setCurrentPage("users");
              setSelectedUserForAppointments(null);
            }}
            currentUser={currentUser}
          />
        );
      }

      if (currentPage === "staff-detail" && selectedStaffId) {
        return (
          <StaffDetailPage 
            staffId={selectedStaffId}
            onBack={() => {
              setCurrentPage("staff");
              setSelectedStaffId(null);
            }}
            currentUser={currentUser}
          />
        );
      }

      switch (currentPage) {
        case "appointments":
          return <AppointmentsPage currentUser={currentUser} />;
        case "my-appointments":
          return <MyAppointmentsPage currentUser={currentUser} />;
        case "users":
          return <UsersPage 
            currentUser={currentUser} 
            onViewProfile={(userId) => {
              setSelectedUserId(userId);
              setCurrentPage("user-profile");
            }}
            onViewAppointments={(userId) => {
              setSelectedUserForAppointments(userId);
              setCurrentPage("user-appointment-history");
            }}
          />;
        case "staff":
          return <StaffPage 
            currentUser={currentUser}
            onViewStaff={(staffId) => {
              setSelectedStaffId(staffId);
              setCurrentPage("staff-detail");
            }}
          />;
        case "notifications":
          return <NotificationsPage currentUser={currentUser} />;
        case "search":
          return <SearchPage currentUser={currentUser} onNavigate={handlePageChange} />;
        case "spaces":
          return <SpacesPage />;
        case "services":
          return <ServicesPage />;
        case "products":
          return <ProductsPage 
            currentUser={currentUser} 
            onNavigate={handlePageChange}
            onViewProduct={(productId) => {
              setSelectedProductId(productId);
              setCurrentPage("company-product-detail");
            }} 
          />;
        case "system-products":
          return <SystemProductsPage 
            currentUser={currentUser} 
            onViewProduct={(productId) => {
              setSelectedProductId(productId);
              setCurrentPage("product-detail");
            }} 
          />;
        case "categories":
          return <CategoriesPage 
            currentUser={currentUser} 
            onViewCategory={(categoryId) => {
              setSelectedCategoryId(categoryId);
              setCurrentPage("category-detail");
            }} 
          />;
        case "sales":
          return <SalesPage />;
        case "analytics":
          return <AnalyticsPage currentUser={currentUser} />;
        case "settings":
          return <SettingsPage onThemeChange={handleThemeChange} currentTheme={theme} onAccentColorChange={handleAccentColorChange} currentAccentColor={accentColor} />;
        case "company-settings":
          return <CompanySettingsPage onBack={() => setCurrentPage("dashboard")} />;
        case "companies":
          return (
            <CompaniesPage 
              onViewCompany={(companyId) => {
                setSelectedCompanyId(companyId);
                setCurrentPage("company-profile");
              }} 
            />
          );
        case "profile":
          return <ProfilePage />;
        case "dashboard":
        default:
          return <Dashboard />;
      }
    } catch (error) {
      console.error("Error rendering page:", error);
      perfUtils.mark('page-render-error');
      
      return (
        <ErrorLayout
          onRetry={() => {
            setCurrentPage("dashboard");
            setSelectedCompanyId(null);
            setSelectedProductId(null);
            setSelectedCategoryId(null);
            setSelectedUserId(null);
            setSelectedUserForAppointments(null);
          }}
        />
      );
    } finally {
      perfUtils.mark('page-render-end');
    }
  };

  const handleLogin = async (credentials: { email: string; password: string }) => {
    try {
      console.log('Attempting login with:', { email: credentials.email, password: '***' });
      const user = await authService.login(credentials) as User;
      console.log('Login successful, user:', user);
      setCurrentUser(user);
      setIsAuthenticated(true);
      toast.success(`Welcome ${user.name}!`);
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error instanceof Error ? error.message : "Login failed. Please try again.";
      toast.error(errorMessage);
    }
  };

  const handleSignUp = async (userData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    agreeToTerms: boolean;
  }) => {
    try {
      await authService.register(userData);
      setShowSignUp(false);
      toast.success(`Welcome ${userData.firstName}! Your account has been created. Please sign in with your credentials.`);
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Registration failed. Please try again.");
    }
  };

  const handleLogout = () => {
    authService.logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCurrentPage("dashboard");
    setShowSignUp(false);
  };

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
  };

  // Show loading screen while initializing
  if (isLoading) {
    return <LoadingLayout />;
  }

  // Show login or signup page if not authenticated
  if (!isAuthenticated) {
    return (
      <AuthLayout>
        {showSignUp ? (
          <SignUpPage 
            onSignUp={handleSignUp}
            onSwitchToLogin={() => setShowSignUp(false)}
          />
        ) : (
          <LoginPage 
            onLogin={handleLogin}
            onSwitchToSignUp={() => setShowSignUp(true)}
          />
        )}
      </AuthLayout>
    );
  }

  return (
    <MainLayout
      currentPage={currentPage}
      onPageChange={handlePageChange}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      currentUser={currentUser}
      onLogout={handleLogout}
    >
      {renderPage()}
    </MainLayout>
  );
}