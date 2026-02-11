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
import { loginRequest, clearError, setLoading } from "../../store/slices/authSlice";
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
      // Normalize emails for comparison (trim and lowercase)
      const normalizedPendingEmail = pendingUser.email?.trim().toLowerCase();
      const normalizedCurrentEmail = email?.trim().toLowerCase();
      
      // Verify that the pending user matches the current email (case-insensitive)
      // If current email is empty (edge case), still show dialog since user just submitted form
      if (normalizedPendingEmail && normalizedCurrentEmail && normalizedPendingEmail !== normalizedCurrentEmail) {
        console.warn('[LoginPage] Pending user email mismatch. Clearing role selection state.', {
          pendingEmail: normalizedPendingEmail,
          currentEmail: normalizedCurrentEmail
        });
        setShowRoleSelection(false);
        setPendingUser(null);
        setPendingRoles([]);
        return;
      }
      
      // If emails match or current email is empty (user just submitted), proceed to show dialog
      
      // Show dialog when Redux state has pending data
      // Always update local state from Redux state to ensure consistency
      console.log('[LoginPage] Showing role selection dialog');
      console.log('[LoginPage] Available roles:', pendingRoles.map((r: any) => ({ id: r.id, role: r.roleName, companyId: r.companyId })));
      setPendingUser(pendingUser);
      setPendingRoles(pendingRoles);
      setShowRoleSelection(true);
    } else {
      // If Redux state doesn't have pending data, ensure dialog is closed
      if (showRoleSelection) {
        setShowRoleSelection(false);
        setPendingUser(null);
        setPendingRoles([]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState, email]);

  // Handle authentication success - navigate after role selection completes
  useEffect(() => {
    if (isAuthenticated) {
      // Clear role selection state when authenticated
      if (showRoleSelection) {
        setShowRoleSelection(false);
        setPendingUser(null);
        setPendingRoles([]);
      }
      toast.success("Login successful! Welcome back!");
      navigate('/system/dashboard');
    }
  }, [isAuthenticated, navigate]);

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

  const handleRoleSelect = (roleId: string | null) => {
    // Use Redux state as primary source, fallback to local state
    const reduxPendingUser = (authState as any).pendingUser;
    const reduxPendingRoles = (authState as any).pendingRoles;
    
    // Get user and roles from Redux state (source of truth) or local state (fallback)
    const userToUse = reduxPendingUser || pendingUser;
    const rolesToUse = reduxPendingRoles || pendingRoles;
    const emailToUse = userToUse?.email || email;
    
    if (!userToUse || !emailToUse) {
      console.error('[Role Selection] Missing pendingUser or email', {
        hasReduxUser: !!reduxPendingUser,
        hasLocalUser: !!pendingUser,
        reduxUserEmail: reduxPendingUser?.email,
        localEmail: email,
        emailToUse
      });
      toast.error('Unable to complete login. Please try logging in again.');
      return;
    }
    
    if (!rolesToUse || rolesToUse.length === 0) {
      console.error('[Role Selection] Missing roles', {
        hasReduxRoles: !!reduxPendingRoles,
        hasLocalRoles: !!pendingRoles,
        reduxRolesCount: reduxPendingRoles?.length,
        localRolesCount: pendingRoles?.length
      });
      toast.error('No roles available. Please try logging in again.');
      return;
    }
    
    // Validate that the selected role belongs to the current user
    if (roleId !== null) {
      const selectedRole = rolesToUse.find((r: any) => r.id === roleId);
      if (!selectedRole) {
        console.error('[Role Selection] Selected role not found in available roles:', roleId);
        toast.error('Invalid role selection. Please try again.');
        return;
      }
      console.log('[Role Selection] Selected role:', selectedRole);
    } else {
      // USER role selected (roleId is null)
      const userRole = rolesToUse.find((r: any) => r.id === null && r.role === 3);
      if (userRole) {
        console.log('[Role Selection] Selected USER role (default)');
      } else {
        console.warn('[Role Selection] USER role not found in available roles');
      }
    }
    
    console.log('[Role Selection] Dispatching completeLoginWithRoleRequest with:', { 
      email: emailToUse, 
      roleId,
      userEmail: userToUse.email 
    });
    
    // Set loading state
    dispatch(setLoading(true));
    
    // Dispatch action to complete login with selected role
    // Use email from user object (most reliable source)
    dispatch({ 
      type: 'auth/completeLoginWithRoleRequest', 
      payload: { email: emailToUse, roleId: roleId ?? null } 
    });
  };

  const handleRoleSelectionCancel = () => {
    setShowRoleSelection(false);
    setPendingUser(null);
    setPendingRoles([]);
    dispatch(clearError());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:bg-gradient-to-br dark:from-gray-900 dark:via-black dark:to-gray-800 flex items-center justify-center p-2 md:p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--accent-primary)]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-500/10 dark:bg-red-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-[var(--accent-primary)]/5 to-red-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo/Brand Section */}
        <div className="text-center mb-10 md:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-primary-hover)] shadow-lg shadow-[var(--accent-primary)]/25 mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">WebOnOne</h1>
          <p className="text-muted-foreground mb-4">All Your Web Solutions in One</p>
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
                className="w-full font-medium mb-4"
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
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 md:mt-10 space-y-2">
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
            © 2024 WebOnOne. All rights reserved.
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
          isLoading={isLoading}
        />
      )}
    </div>
  );
}