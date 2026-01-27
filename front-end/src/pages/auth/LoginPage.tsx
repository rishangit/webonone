import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, Shield, Zap } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Checkbox } from "../../components/ui/checkbox";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { loginRequest, clearError } from "../../store/slices/authSlice";
import { RoleSelectionDialog } from "../../components/auth/RoleSelectionDialog";

export function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated } = useAppSelector((state) => state.auth);
  const authState = useAppSelector((state) => state.auth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showRoleSelection, setShowRoleSelection] = useState(false);
  const [pendingUser, setPendingUser] = useState<any>(null);
  const [pendingRoles, setPendingRoles] = useState<any[]>([]);

  // Check for role selection requirement
  useEffect(() => {
    const pendingUser = (authState as any).pendingUser;
    const pendingRoles = (authState as any).pendingRoles;
    
    console.log('[LoginPage] Role selection check:', { 
      hasPendingUser: !!pendingUser, 
      pendingUserEmail: pendingUser?.email,
      pendingRolesCount: pendingRoles?.length,
      currentEmail: email 
    });
    
    if (pendingUser && pendingRoles && pendingRoles.length > 0) {
      // Verify that the pending user matches the current email
      if (pendingUser.email !== email) {
        console.warn('[LoginPage] Pending user email mismatch. Clearing role selection state.');
        setShowRoleSelection(false);
        setPendingUser(null);
        setPendingRoles([]);
        return;
      }
      
      console.log('[LoginPage] Showing role selection dialog');
      console.log('[LoginPage] Available roles:', pendingRoles.map((r: any) => ({ id: r.id, role: r.roleName, companyId: r.companyId })));
      setPendingUser(pendingUser);
      setPendingRoles(pendingRoles);
      setShowRoleSelection(true);
    }
  }, [authState, email]);

  // Handle authentication success
  useEffect(() => {
    if (isAuthenticated && !showRoleSelection) {
      toast.success("Login successful! Welcome back!");
      navigate('/system/dashboard');
    }
  }, [isAuthenticated, showRoleSelection, navigate]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear any previous errors and role selection state
    dispatch(clearError());
    setShowRoleSelection(false);
    setPendingUser(null);
    setPendingRoles([]);
    
    // Dispatch login request
    dispatch(loginRequest({ email, password }));
  };

  const handleQuickLogin = (userEmail: string, userPassword: string) => {
    dispatch(clearError());
    // Clear any previous role selection state
    setShowRoleSelection(false);
    setPendingUser(null);
    setPendingRoles([]);
    
    // Just fill the email and password fields - user will click Sign In manually
    setEmail(userEmail);
    setPassword(userPassword);
  };

  const handleRoleSelect = (roleId: string | null) => {
    if (!pendingUser || !email) return;
    
    // Validate that the selected role belongs to the current user
    if (roleId !== null) {
      const selectedRole = pendingRoles.find(r => r.id === roleId);
      if (!selectedRole) {
        console.error('[Role Selection] Selected role not found in available roles:', roleId);
        toast.error('Invalid role selection. Please try again.');
        return;
      }
      console.log('[Role Selection] Selected role:', selectedRole);
    }
    
    // Dispatch action to complete login with selected role
    // roleId can be null for USER role
    dispatch({ 
      type: 'auth/completeLoginWithRoleRequest', 
      payload: { email, roleId: roleId ?? null } 
    });
    
    setShowRoleSelection(false);
    setPendingUser(null);
    setPendingRoles([]);
  };

  const handleRoleSelectionCancel = () => {
    setShowRoleSelection(false);
    setPendingUser(null);
    setPendingRoles([]);
    dispatch(clearError());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:bg-gradient-to-br dark:from-gray-900 dark:via-black dark:to-gray-800 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--accent-primary)]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/10 dark:bg-red-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-[var(--accent-primary)]/5 to-red-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-primary-hover)] shadow-lg shadow-[var(--accent-primary)]/25 mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">AppointmentPro</h1>
          <p className="text-muted-foreground">Advanced Appointment Management System</p>
        </div>

        {/* Demo Info Card */}
        <div className="mb-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 backdrop-blur-sm">
          <div className="flex items-start gap-2">
            <Zap className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-blue-600 dark:text-blue-400 font-medium">Test Account Available</p>
              <p className="text-blue-600/80 dark:text-blue-400/80 text-xs">
                Click the quick login button below to fill in test credentials, then click Sign In.
              </p>
            </div>
          </div>
        </div>

        {/* Login Card */}
        <Card className="p-8 backdrop-blur-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-2xl">
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Welcome Back</h2>
              <p className="text-muted-foreground text-sm">Sign in to your account to continue</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 bg-[var(--input-background)] border-[var(--glass-border)] text-foreground placeholder:text-muted-foreground focus:border-[var(--accent-border)] focus:ring-[var(--accent-primary)]/20"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 bg-[var(--input-background)] border-[var(--glass-border)] text-foreground placeholder:text-muted-foreground focus:border-[var(--accent-border)] focus:ring-[var(--accent-primary)]/20"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    className="border-border data-[state=checked]:bg-[var(--accent-primary)] data-[state=checked]:border-[var(--accent-primary)]"
                  />
                  <Label htmlFor="remember" className="text-sm text-muted-foreground">Remember me</Label>
                </div>
                <Button variant="link" className="text-sm text-[var(--accent-text)] hover:text-[var(--accent-primary-hover)] p-0 h-auto">
                  Forgot password?
                </Button>
              </div>

              {/* Login Button */}
              <Button 
                type="submit" 
                variant="accent"
                className="w-full font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[var(--glass-bg)] px-2 text-muted-foreground">Or continue with test account</span>
              </div>
            </div>

            {/* Quick Login Options */}
            <div className="space-y-2">
              <Button 
                type="button"
                variant="outline"
                onClick={() => handleQuickLogin("admin@appointmentpro.com", "SuperAdmin2024!")}
                className="w-full border-border bg-accent/30 text-foreground hover:bg-accent hover:text-foreground hover:border-[var(--accent-border)] transition-all"
                disabled={isLoading}
              >
                <Shield className="w-4 h-4 mr-2" />
                Super Admin
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Click to fill credentials, then click Sign In
              </p>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 space-y-2">
          <p className="text-muted-foreground text-sm">
            Don't have an account? 
            <Button 
              variant="link" 
              asChild
              className="text-[var(--accent-text)] hover:text-[var(--accent-primary-hover)] p-0 ml-1 h-auto"
            >
              <Link to="/system/signup">
                Sign up
              </Link>
            </Button>
          </p>
          <p className="text-muted-foreground text-xs">
            © 2024 AppointmentPro. All rights reserved.
          </p>
        </div>

        {/* Security Badge */}
        <div className="mt-6 p-3 rounded-lg bg-[var(--glass-bg)] backdrop-blur-sm border border-[var(--glass-border)]">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4 text-green-500" />
            <span>Secured with enterprise-grade encryption</span>
          </div>
        </div>
      </div>

      {/* Additional Background Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-primary-hover)] opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--accent-primary-hover)] to-[var(--accent-primary)] opacity-50"></div>
      
      {/* Role Selection Dialog */}
      {showRoleSelection && pendingUser && pendingRoles.length > 0 && (
        <RoleSelectionDialog
          open={showRoleSelection}
          user={pendingUser}
          roles={pendingRoles}
          onRoleSelect={handleRoleSelect}
          onCancel={handleRoleSelectionCancel}
        />
      )}
    </div>
  );
}