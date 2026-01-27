import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";

// Types
import type { Theme, AccentColor } from "./types";

// Utils
import { applyTheme, storage, performance } from "./utils";

// Layout Components
import {
  MainLayout,
  AuthLayout,
  LoadingLayout,
  ErrorLayout,
} from "./pages/layout";

// Auth Pages
import { LoginPage, SignUpPage } from "./pages/auth";

// Dashboard
import { Dashboard } from "./pages/dashboard";

// Appointments
import { AppointmentsPage, UserAppointmentHistoryPage } from "./pages/appointments";

// Companies
import { CompaniesPage, CompanyProfilePage, CompanySettingsPage } from "./pages/companies";

// Products
import { ProductsPage, SystemProductsPage, ProductDetailPage, CompanyProductDetailPage } from "./pages/products";
import { VariantStockDetailsPage } from "./pages/products/VariantStockDetailsPage";

// Tags
import { TagsPage } from "./pages/tags";

// Sales
import { SalesPage } from "./pages/sales";
import { SalesDetailPage } from "./pages/sales/SalesDetailPage";

// Services
import { ServicesPage } from "./pages/services";

// Settings
import { SettingsPage } from "./pages/settings";

// Spaces
import { SpacesPage } from "./pages/spaces";

// Staff
import { StaffPage } from "./pages/staff";

// Users
import { UsersPage, ProfilePage } from "./pages/users";
import { UserProfilePage } from "./pages/users/UserProfilePage";

// Notifications
import { NotificationsPage } from "./pages/notifications";

// Search
import { SearchPage } from "./pages/search";

// Analytics
import { AnalyticsPage } from "./pages/analytics";

// Website
import { WebsiteSetupPage, ThemeFormPage } from "./pages/website";

// State management
import { useAppDispatch, useAppSelector } from "./store/hooks";
import { loginSuccess, logout, refreshUserRequest } from "./store/slices/authSlice";

// Wrapper component for website routes (no MainLayout)
function WebsiteRouteWrapper({ children }: { children: React.ReactNode }) {
  const { user } = useAppSelector((state) => state.auth);
  const isAuthenticated = !!user;

  if (!isAuthenticated) {
    return <Navigate to="/system/login" replace />;
  }

  return <>{children}</>;
}

// Wrapper component for protected routes with logout functionality
function ProtectedRouteWrapper({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Get current page from URL
  const getCurrentPage = () => {
    const path = location.pathname;
    if (path.includes('/companies')) return 'companies';
    if (path.includes('/appointments')) return 'appointments';
    if (path.includes('/users')) return 'users';
    if (path.includes('/system-products')) return 'system-products';
    if (path.includes('/products')) return 'products';
    if (path.includes('/tags')) return 'tags';
    if (path.includes('/sales')) return 'sales';
    if (path.includes('/services')) return 'services';
    if (path.includes('/spaces')) return 'spaces';
    if (path.includes('/staff')) return 'staff';
    if (path.includes('/profile')) return 'profile';
    if (path.includes('/company-settings')) return 'company-settings';
    if (path.includes('/notifications')) return 'notifications';
    if (path.includes('/search')) return 'search';
    if (path.includes('/analytics')) return 'analytics';
    if (path.includes('/settings')) return 'settings';
    return 'dashboard';
  };

  const handleLogout = () => {
    console.log('Logout clicked');
    dispatch(logout());
    // Show logout success message
    toast.success('Logged out successfully');
    // Small delay to ensure state is updated before navigation
    setTimeout(() => {
      navigate('/system/login');
    }, 100);
  };

  const handlePageChange = (page: string) => {
    // Handle navigation for different pages
    switch (page) {
      case 'dashboard':
        navigate('/system/dashboard');
        break;
      case 'appointments':
        navigate('/system/appointments');
        break;
      case 'companies':
        navigate('/system/companies');
        break;
      case 'products':
        navigate('/system/company-products');
        break;
      case 'sales':
        navigate('/system/sales');
        break;
      case 'services':
        navigate('/system/services');
        break;
      case 'settings':
        navigate('/system/settings');
        break;
      case 'spaces':
        navigate('/system/spaces');
        break;
      case 'staff':
        navigate('/system/staff');
        break;
      case 'users':
        navigate('/system/users');
        break;
      case 'profile':
        navigate('/system/profile');
        break;
      case 'notifications':
        navigate('/system/notifications');
        break;
      case 'search':
        navigate('/system/search');
        break;
      case 'analytics':
        navigate('/system/analytics');
        break;
      case 'company-settings':
        navigate('/system/company-settings');
        break;
      case 'system-products':
        navigate('/system/system-products');
        break;
      case 'tags':
        navigate('/system/tags');
        break;
      default:
        // Handle company-settings with ID (e.g., "company-settings/4")
        if (page.startsWith('company-settings/')) {
          const companyId = page.split('/')[1];
          navigate(`/system/company-settings/${companyId}`);
        } else {
          navigate('/system/dashboard');
        }
        break;
    }
  };

  return (
    <MainLayout
      currentPage={getCurrentPage()}
      onPageChange={handlePageChange}
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
      currentUser={user as any}
      onLogout={handleLogout}
    >
      {children}
    </MainLayout>
  );
}


// CompaniesPage Wrapper Component
function CompaniesPageWrapper() {
  const navigate = useNavigate();

  const handleViewCompany = (id: string) => {
    navigate(`/system/companies/${id}`);
  };

  return <CompaniesPage onViewCompany={handleViewCompany} />;
}

// UsersPage Wrapper Component
function UsersPageWrapper() {
  const navigate = useNavigate();

  const handleViewProfile = (userId: string) => {
    navigate(`/system/users/${userId}`);
  };

  const handleViewAppointments = (userId: string) => {
    navigate(`/system/users/${userId}/history`);
  };

  return <UsersPage onViewProfile={handleViewProfile} onViewAppointments={handleViewAppointments} />;
}

// CompanyProfilePage Wrapper Component
function CompanyProfilePageWrapper() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/system/companies');
  };

  if (!id) {
    return <div>Company ID not found</div>;
  }

  return (
    <CompanyProfilePage 
      companyId={id} 
      onBack={handleBack} 
    />
  );
}

// UserProfilePage Wrapper Component
function UserProfilePageWrapper() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/system/users');
  };

  if (!userId) {
    return <div>User ID not found</div>;
  }

  return (
    <UserProfilePage 
      userId={userId} 
      onBack={handleBack} 
    />
  );
}

// CompanySettingsPage Wrapper Component
function CompanySettingsPageWrapper() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const { user } = useAppSelector((state) => state.auth);
  const { companies } = useAppSelector((state) => state.companies);

  // If no ID in URL, try to find user's company and redirect
  useEffect(() => {
    if (!id && user?.id) {
      const userCompany = companies.find(c => 
        c.ownerId !== null && String(c.ownerId) === String(user.id)
      );
      if (userCompany) {
        navigate(`/system/company-settings/${userCompany.id}`, { replace: true });
      }
    }
  }, [id, user?.id, companies, navigate]);

  const handleBack = () => {
    navigate('/system/dashboard');
  };

  return (
    <CompanySettingsPage 
      onBack={handleBack} 
    />
  );
}

// VariantStockDetailsPage Wrapper Component
function VariantStockDetailsPageWrapper() {
  const { id: productId, variantId } = useParams<{ id: string; variantId: string }>();
  const navigate = useNavigate();

  const handleBack = () => {
    if (productId) {
      navigate(`/system/company-products/${productId}`);
    } else {
      navigate('/system/company-products');
    }
  };

  if (!productId || !variantId) {
    return <div>Product ID or Variant ID not found</div>;
  }

  return (
    <VariantStockDetailsPage 
      productId={productId} 
      variantId={variantId}
      onBack={handleBack} 
    />
  );
}

// UserAppointmentHistoryPage Wrapper Component
function UserAppointmentHistoryPageWrapper() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  const handleBack = () => {
    navigate('/system/users');
  };

  if (!userId) {
    return (
      <div className="flex-1 p-4 lg:p-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">User Not Found</h3>
          <p className="text-muted-foreground mb-4">Invalid user ID</p>
          <button 
            onClick={() => navigate('/system/users')}
            className="px-4 py-2 bg-[var(--accent-primary)] text-[var(--accent-button-text)] rounded-lg hover:bg-[var(--accent-primary-hover)]"
          >
            Back to Users
          </button>
        </div>
      </div>
    );
  }

  return (
    <UserAppointmentHistoryPage 
      userId={userId}
      onBack={handleBack}
      currentUser={user as any}
    />
  );
}

// SystemProductsPage Wrapper Component
function SystemProductsPageWrapper() {
  const { user } = useAppSelector((state) => state.auth);
  const navigate = useNavigate();

  const handleViewProduct = (productId: string) => {
    navigate(`/system/system-products/${productId}`);
  };

  return (
    <SystemProductsPage 
      currentUser={user as any}
      onViewProduct={handleViewProduct}
    />
  );
}


// ProductsPage Wrapper Component
function ProductsPageWrapper() {
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  return (
    <ProductsPage 
      currentUser={user as any}
      onNavigate={(path: string) => navigate(path)}
    />
  );
}

// ProductDetailPage Wrapper Component
function ProductDetailPageWrapper() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAppSelector((state) => state.auth);

  if (!id) {
    return (
      <div className="flex-1 p-4 lg:p-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">Product Not Found</h3>
          <p className="text-muted-foreground mb-4">Invalid product ID</p>
          <button 
            onClick={() => navigate('/system/system-products')}
            className="px-4 py-2 bg-[var(--accent-primary)] text-[var(--accent-button-text)] rounded-lg hover:bg-[var(--accent-primary-hover)]"
          >
            Back to System Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <ProductDetailPage 
      currentUser={user as any}
      productId={id}
      productType="system"
      onBack={() => navigate('/system/system-products')}
    />
  );
}

// CompanyProductDetailPage Wrapper Component
function CompanyProductDetailPageWrapper() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    return (
      <div className="flex-1 p-4 lg:p-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">Product Not Found</h3>
          <p className="text-muted-foreground mb-4">Invalid product ID</p>
          <button 
            onClick={() => navigate('/system/company-products')}
            className="px-4 py-2 bg-[var(--accent-primary)] text-[var(--accent-button-text)] rounded-lg hover:bg-[var(--accent-primary-hover)]"
          >
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <CompanyProductDetailPage 
      productId={id}
      onBack={() => navigate('/system/company-products')}
    />
  );
}

// SalesDetailPage Wrapper Component
function SalesDetailPageWrapper() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  if (!id) {
    return (
      <div className="flex-1 p-4 lg:p-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-foreground mb-2">Sale Not Found</h3>
          <p className="text-muted-foreground mb-4">Invalid sale ID</p>
          <button 
            onClick={() => navigate('/system/sales')}
            className="px-4 py-2 bg-[var(--accent-primary)] text-[var(--accent-button-text)] rounded-lg hover:bg-[var(--accent-primary-hover)]"
          >
            Back to Sales
          </button>
        </div>
      </div>
    );
  }

  return (
    <SalesDetailPage 
      saleId={id}
      onBack={() => navigate('/system/sales')}
    />
  );
}

function App() {
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, user } = useAppSelector((state) => state.auth);
  
  // Theme and accent color state
  const [theme, setTheme] = useState<Theme>("dark");
  const [accentColor, setAccentColor] = useState<AccentColor>("orange");
  
  // Authentication restoration state
  const [isRestoringAuth, setIsRestoringAuth] = useState(true);

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
            
            // Apply theme immediately after loading
            applyTheme(savedTheme || "dark", savedAccentColor || "orange");
          });
        } else {
          const savedTheme = storage.get("theme") as Theme | null;
          const savedAccentColor = storage.get("accentColor") as AccentColor | null;
          
          if (savedTheme) setTheme(savedTheme);
          if (savedAccentColor) setAccentColor(savedAccentColor);
          
          // Apply theme immediately after loading
          applyTheme(savedTheme || "dark", savedAccentColor || "orange");
        }
      } catch (error) {
        console.error("Error loading theme settings:", error);
        // Apply default theme if loading fails
        applyTheme("dark", "orange");
      }
    };

    loadSettings();
    
    return () => {
      isMounted = false;
    };
  }, []);

  // Theme change handlers
  const handleThemeChange = (newTheme: Theme) => {
    setTheme(newTheme);
    storage.set("theme", newTheme);
  };

  const handleAccentColorChange = (newAccentColor: AccentColor) => {
    setAccentColor(newAccentColor);
    storage.set("accentColor", newAccentColor);
  };

  // Performance monitoring
  useEffect(() => {
    performance.mark("app-init-start");
    performance.mark("app-init-end");
    performance.measure("app-init", "app-init-start", "app-init-end");
  }, []);

  // One-time authentication restoration on app mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');
    
    console.log('Initial auth restoration check:', { 
      hasToken: !!token, 
      hasSavedUser: !!savedUser, 
      isAuthenticated, 
      user: !!user 
    });
    
    if (token && savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        console.log('Restoring user from localStorage on app mount:', userData);
        dispatch(loginSuccess({ user: userData, token }));
        
        // Refresh user data from server to get latest information
        console.log('Refreshing user data from server...');
        dispatch(refreshUserRequest());
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      }
    }
    
    // Mark restoration as complete
    setIsRestoringAuth(false);
  }, []); // Empty dependency array - runs only once on mount

  // Handle authentication state changes
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');
    
    if (!token && !savedUser && isAuthenticated) {
      // If no token/user in localStorage but Redux says authenticated, log out
      console.log('No session data found, logging out');
      dispatch(logout());
    }
  }, [dispatch, isAuthenticated]);

  // Debug authentication state changes
  useEffect(() => {
    console.log('Authentication state changed:', { isAuthenticated });
  }, [isAuthenticated]);

  // Loading state
  if (isLoading || isRestoringAuth) {
    return <LoadingLayout />;
  }

  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground">
        <Routes>
          {/* Public Routes - Authentication */}
          <Route 
            path="/system/login" 
            element={
              isAuthenticated ? (
                <Navigate to="/system/dashboard" replace />
              ) : (
                <AuthLayout><LoginPage /></AuthLayout>
              )
            } 
          />
          <Route 
            path="/system/signup" 
            element={
              isAuthenticated ? (
                <Navigate to="/system/dashboard" replace />
              ) : (
                <AuthLayout><SignUpPage /></AuthLayout>
              )
            } 
          />
          
          {/* System root redirect */}
          <Route path="/system" element={<Navigate to="/system/login" replace />} />

          {/* Protected Routes */}
          <Route 
            path="/system/dashboard" 
            element={
              isAuthenticated ? (
                <ProtectedRouteWrapper>
                  <Dashboard />
                </ProtectedRouteWrapper>
              ) : (
                <Navigate to="/system/login" replace />
              )
            }
          />
          
          <Route 
            path="/system/appointments" 
            element={
              isAuthenticated ? (
                <ProtectedRouteWrapper>
                  <AppointmentsPage />
                </ProtectedRouteWrapper>
              ) : (
                <Navigate to="/system/login" replace />
              )
            }
          />
          
          <Route 
            path="/system/companies" 
            element={
              isAuthenticated ? (
                <ProtectedRouteWrapper>
                  <CompaniesPageWrapper />
                </ProtectedRouteWrapper>
              ) : (
                <Navigate to="/system/login" replace />
              )
            }
          />
          
          <Route 
            path="/system/companies/:id" 
            element={
              isAuthenticated ? (
                <ProtectedRouteWrapper>
                  <CompanyProfilePageWrapper />
                </ProtectedRouteWrapper>
              ) : (
                <Navigate to="/system/login" replace />
              )
            }
          />
          
          <Route 
            path="/system/company-products" 
            element={
              isAuthenticated ? (
                <ProtectedRouteWrapper>
                  <ProductsPageWrapper />
                </ProtectedRouteWrapper>
              ) : (
                <Navigate to="/system/login" replace />
              )
            }
          />
          
          <Route 
            path="/system/system-products" 
            element={
              isAuthenticated ? (
                <ProtectedRouteWrapper>
                  <SystemProductsPageWrapper />
                </ProtectedRouteWrapper>
              ) : (
                <Navigate to="/system/login" replace />
              )
            }
          />
          
          <Route 
            path="/system/tags" 
            element={
              isAuthenticated ? (
                <ProtectedRouteWrapper>
                  <TagsPage currentUser={user as any} />
                </ProtectedRouteWrapper>
              ) : (
                <Navigate to="/system/login" replace />
              )
            }
          />
          
          <Route 
            path="/system/system-products/:id" 
            element={
              isAuthenticated ? (
                <ProtectedRouteWrapper>
                  <ProductDetailPageWrapper />
                </ProtectedRouteWrapper>
              ) : (
                <Navigate to="/system/login" replace />
              )
            }
          />
          
          <Route 
            path="/system/company-products/:id/variants/:variantId/stock" 
            element={
              isAuthenticated ? (
                <ProtectedRouteWrapper>
                  <VariantStockDetailsPageWrapper />
                </ProtectedRouteWrapper>
              ) : (
                <Navigate to="/system/login" replace />
              )
            }
          />
          
          <Route 
            path="/system/company-products/:id" 
            element={
              isAuthenticated ? (
                <ProtectedRouteWrapper>
                  <CompanyProductDetailPageWrapper />
                </ProtectedRouteWrapper>
              ) : (
                <Navigate to="/system/login" replace />
              )
            }
          />
          
          <Route 
            path="/system/sales" 
            element={
              isAuthenticated ? (
                <ProtectedRouteWrapper>
                  <SalesPage />
                </ProtectedRouteWrapper>
              ) : (
                <Navigate to="/system/login" replace />
              )
            }
          />
          
          <Route 
            path="/system/sales/:id" 
            element={
              isAuthenticated ? (
                <ProtectedRouteWrapper>
                  <SalesDetailPageWrapper />
                </ProtectedRouteWrapper>
              ) : (
                <Navigate to="/system/login" replace />
              )
            }
          />
          
          <Route 
            path="/system/services" 
            element={
              isAuthenticated ? (
                <ProtectedRouteWrapper>
                  <ServicesPage />
                </ProtectedRouteWrapper>
              ) : (
                <Navigate to="/system/login" replace />
              )
            }
          />
          
          <Route 
            path="/system/settings" 
            element={
              isAuthenticated ? (
                <ProtectedRouteWrapper>
                  <SettingsPage 
                    onThemeChange={handleThemeChange}
                    currentTheme={theme}
                    onAccentColorChange={handleAccentColorChange}
                    currentAccentColor={accentColor}
                  />
                </ProtectedRouteWrapper>
              ) : (
                <Navigate to="/system/login" replace />
              )
            }
          />
          
          <Route 
            path="/system/spaces" 
            element={
              isAuthenticated ? (
                <ProtectedRouteWrapper>
                  <SpacesPage />
                </ProtectedRouteWrapper>
              ) : (
                <Navigate to="/system/login" replace />
              )
            }
          />
          
          <Route 
            path="/system/staff/:staffId" 
            element={
              isAuthenticated ? (
                <ProtectedRouteWrapper>
                  <StaffPage />
                </ProtectedRouteWrapper>
              ) : (
                <Navigate to="/system/login" replace />
              )
            }
          />
          
          <Route 
            path="/system/staff" 
            element={
              isAuthenticated ? (
                <ProtectedRouteWrapper>
                  <StaffPage />
                </ProtectedRouteWrapper>
              ) : (
                <Navigate to="/system/login" replace />
              )
            }
          />
          
          <Route 
            path="/system/users" 
            element={
              isAuthenticated ? (
                <ProtectedRouteWrapper>
                  <UsersPageWrapper />
                </ProtectedRouteWrapper>
              ) : (
                <Navigate to="/system/login" replace />
              )
            }
          />
          
          <Route 
            path="/system/users/:userId" 
            element={
              isAuthenticated ? (
                <ProtectedRouteWrapper>
                  <UserProfilePageWrapper />
                </ProtectedRouteWrapper>
              ) : (
                <Navigate to="/system/login" replace />
              )
            }
          />
          
          <Route 
            path="/system/users/:userId/history" 
            element={
              isAuthenticated ? (
                <ProtectedRouteWrapper>
                  <UserAppointmentHistoryPageWrapper />
                </ProtectedRouteWrapper>
              ) : (
                <Navigate to="/system/login" replace />
              )
            }
          />
          
          <Route 
            path="/system/profile" 
            element={
              isAuthenticated ? (
                <ProtectedRouteWrapper>
                  <ProfilePage />
                </ProtectedRouteWrapper>
              ) : (
                <Navigate to="/system/login" replace />
              )
            }
          />
          
          <Route 
            path="/system/company-settings/:id" 
            element={
              isAuthenticated ? (
                <ProtectedRouteWrapper>
                  <CompanySettingsPageWrapper />
                </ProtectedRouteWrapper>
              ) : (
                <Navigate to="/system/login" replace />
              )
            }
          />
          <Route 
            path="/system/company-settings" 
            element={
              isAuthenticated ? (
                <ProtectedRouteWrapper>
                  <CompanySettingsPageWrapper />
                </ProtectedRouteWrapper>
              ) : (
                <Navigate to="/system/login" replace />
              )
            }
          />
          
          <Route 
            path="/system/notifications" 
            element={
              isAuthenticated ? (
                <ProtectedRouteWrapper>
                  <NotificationsPage />
                </ProtectedRouteWrapper>
              ) : (
                <Navigate to="/system/login" replace />
              )
            }
          />
          
          <Route 
            path="/system/search" 
            element={
              isAuthenticated ? (
                <ProtectedRouteWrapper>
                  <SearchPage />
                </ProtectedRouteWrapper>
              ) : (
                <Navigate to="/system/login" replace />
              )
            }
          />
          
          <Route 
            path="/system/analytics" 
            element={
              isAuthenticated ? (
                <ProtectedRouteWrapper>
                  <AnalyticsPage />
                </ProtectedRouteWrapper>
              ) : (
                <Navigate to="/system/login" replace />
              )
            }
          />

          <Route 
            path="/web/:companyId/theme/new" 
            element={
              <WebsiteRouteWrapper>
                <ThemeFormPage />
              </WebsiteRouteWrapper>
            }
          />
          <Route 
            path="/web/:companyId/theme/:themeId" 
            element={
              <WebsiteRouteWrapper>
                <ThemeFormPage />
              </WebsiteRouteWrapper>
            }
          />
          <Route 
            path="/web/:companyId/:section" 
            element={
              <WebsiteRouteWrapper>
                <WebsiteSetupPage />
              </WebsiteRouteWrapper>
            }
          />
          <Route 
            path="/web/:companyId" 
            element={
              <WebsiteRouteWrapper>
                <WebsiteSetupPage />
              </WebsiteRouteWrapper>
            }
          />

          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/system" replace />} />
          
          {/* Catch all route */}
          <Route path="*" element={<ErrorLayout />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
