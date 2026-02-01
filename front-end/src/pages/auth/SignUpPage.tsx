import React, { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Eye, EyeOff, Lock, Mail, Shield, Zap, User, UserPlus, Check, Phone } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Checkbox } from "../../components/ui/checkbox";
import { PhoneInput } from "../../components/common/PhoneInput";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { signUpRequest, clearError } from "../../store/slices/authSlice";
import { signUpSchema, SignUpFormData } from "../../schemas/authValidation";
import { UserRole } from "../../types/user";

export function SignUpPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error, signUpStep, user } = useAppSelector((state) => state.auth);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    trigger,
    control
  } = useForm<SignUpFormData>({
    resolver: yupResolver(signUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      mobileNumber: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false
    },
    mode: 'onChange'
  });

  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  
  const password = watch('password') || '';
  const confirmPassword = watch('confirmPassword') || '';

  // Handle Redux state changes
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
      // Reset submission flag on error
      submissionInProgress.current = false;
      lastSubmissionTime.current = 0;
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (signUpStep === 'complete' && user) {
      toast.success("Account created successfully! Welcome to WebOnOne!");
      
    // Reset submission flag on success
    submissionInProgress.current = false;
    lastSubmissionTime.current = 0;
      
      // Navigate to dashboard after successful signup
      navigate('/system/dashboard');
    }
  }, [signUpStep, user, navigate]);

  // Add a ref to track if submission is in progress
  const submissionInProgress = React.useRef(false);
  const lastSubmissionTime = React.useRef(0);

  const onSubmit = (data: SignUpFormData) => {
    console.log('=== FORM SUBMISSION DEBUG ===');
    console.log('onSubmit called with data:', data);
    console.log('isLoading:', isLoading, 'isSubmitting:', isSubmitting);
    console.log('submissionInProgress:', submissionInProgress.current);
    console.log('Form errors:', errors);
    console.log('Form values:', watch());
    
    // Prevent multiple submissions
    const currentTime = Date.now();
    const timeSinceLastSubmission = currentTime - lastSubmissionTime.current;
    
    if (isLoading || isSubmitting || submissionInProgress.current) {
      console.log('Submission prevented - already loading, submitting, or in progress');
      return;
    }
    
    if (timeSinceLastSubmission < 2000) {
      console.log('Submission prevented - too soon after last submission:', timeSinceLastSubmission, 'ms');
      return;
    }
    
    // Set submission flag and timestamp
    submissionInProgress.current = true;
    lastSubmissionTime.current = currentTime;
    
    // Clear any previous errors
    dispatch(clearError());
    
    // Prepare sign-up data with role
    const signUpData = {
      ...data,
      role: UserRole.USER // Default role for sign-ups
    };

    console.log('Signup form submitted:', signUpData);
    console.log('Dispatching signUpRequest action...');
    
    // Dispatch sign-up request - validation is handled by React Hook Form
    const action = signUpRequest(signUpData);
    console.log('Action to dispatch:', action);
    dispatch(action);
    console.log('Action dispatched successfully');
    console.log('=== END FORM SUBMISSION DEBUG ===');
    
    // Reset submission flag after a delay (fallback)
    setTimeout(() => {
      submissionInProgress.current = false;
      lastSubmissionTime.current = 0;
    }, 5000);
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:bg-gradient-to-br dark:from-gray-900 dark:via-black dark:to-gray-800 flex items-center justify-center p-2 md:p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--accent-primary)]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 dark:bg-green-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-[var(--accent-primary)]/5 to-green-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-primary-hover)] shadow-lg shadow-[var(--accent-primary)]/25 mb-4">
            <Zap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">WebOnOne</h1>
          <p className="text-muted-foreground">Create your user account to get started</p>
        </div>

        {/* Signup Card */}
        <Card className="p-8 backdrop-blur-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-2xl">
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Create Your Account</h2>
              <p className="text-muted-foreground text-sm">Join as a user to book and manage appointments</p>
            </div>

            {/* Signup Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Name Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-foreground">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      {...register('firstName')}
                      className="pl-10 bg-[var(--input-background)] border-[var(--glass-border)] text-foreground placeholder:text-muted-foreground focus:border-[var(--accent-border)] focus:ring-[var(--accent-primary)]/20"
                    />
                  </div>
                  {errors.firstName && (
                    <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-foreground">Last Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      {...register('lastName')}
                      className="pl-10 bg-[var(--input-background)] border-[var(--glass-border)] text-foreground placeholder:text-muted-foreground focus:border-[var(--accent-border)] focus:ring-[var(--accent-primary)]/20"
                    />
                  </div>
                  {errors.lastName && (
                    <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
                  )}
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    {...register('email')}
                    className="pl-10 bg-[var(--input-background)] border-[var(--glass-border)] text-foreground placeholder:text-muted-foreground focus:border-[var(--accent-border)] focus:ring-[var(--accent-primary)]/20"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Mobile Number Field */}
              <div className="space-y-2">
                <Label htmlFor="mobileNumber" className="text-foreground">Mobile Number</Label>
                <Controller
                  name="mobileNumber"
                  control={control}
                  render={({ field }) => (
                    <PhoneInput
                      id="mobileNumber"
                      value={field.value || ''}
                      onChange={(value) => {
                        field.onChange(value);
                        trigger('mobileNumber');
                      }}
                      onBlur={field.onBlur}
                      placeholder="Enter your mobile number"
                      error={!!errors.mobileNumber}
                      className="w-full"
                    />
                  )}
                />
                {errors.mobileNumber && (
                  <p className="text-red-500 text-xs mt-1">{errors.mobileNumber.message}</p>
                )}
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-foreground">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      {...register('password')}
                      className="pl-10 pr-10 bg-[var(--input-background)] border-[var(--glass-border)] text-foreground placeholder:text-muted-foreground focus:border-[var(--accent-border)] focus:ring-[var(--accent-primary)]/20"
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
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-foreground">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Confirm your password"
                      {...register('confirmPassword')}
                      className="pl-10 pr-10 bg-[var(--input-background)] border-[var(--glass-border)] text-foreground placeholder:text-muted-foreground focus:border-[var(--accent-border)] focus:ring-[var(--accent-primary)]/20"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>
                  )}
                </div>
              </div>

              {/* Password Requirements */}
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Password must contain:</p>
                <div className="flex items-center gap-2">
                  <Check className={`w-3 h-3 ${password.length >= 6 ? 'text-green-500' : 'text-gray-400'}`} />
                  <span className={password.length >= 6 ? 'text-green-600 dark:text-green-400' : ''}>
                    At least 6 characters
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Check className={`w-3 h-3 ${password === confirmPassword && password.length > 0 ? 'text-green-500' : 'text-gray-400'}`} />
                  <span className={password === confirmPassword && password.length > 0 ? 'text-green-600 dark:text-green-400' : ''}>
                    Passwords match
                  </span>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="flex items-start gap-2">
                <Checkbox 
                  id="terms"
                  checked={!!watch('agreeToTerms')}
                  onCheckedChange={async (checked) => {
                    console.log('Checkbox changed:', checked);
                    const booleanValue = !!checked;
                    setValue('agreeToTerms', booleanValue, { shouldValidate: true, shouldDirty: true });
                    console.log('Form value after setValue:', watch('agreeToTerms'));
                    console.log('Boolean value set:', booleanValue);
                    
                    // Trigger validation for this field
                    await trigger('agreeToTerms');
                    console.log('Validation triggered for agreeToTerms');
                  }}
                  className="border-border data-[state=checked]:bg-[var(--accent-primary)] data-[state=checked]:border-[var(--accent-primary)] mt-1 flex-shrink-0"
                />
                <Label htmlFor="terms" className="text-sm text-muted-foreground leading-relaxed flex-1 block">
                  I agree to the{" "}
                  <Button variant="link" className="text-[var(--accent-text)] hover:text-[var(--accent-primary-hover)] p-0 h-auto text-sm inline-block">
                    Terms and Conditions
                  </Button>
                  {" "}and{" "}
                  <Button variant="link" className="text-[var(--accent-text)] hover:text-[var(--accent-primary-hover)] p-0 h-auto text-sm inline-block">
                    Privacy Policy
                  </Button>
                </Label>
              </div>
              {errors.agreeToTerms && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.agreeToTerms.message}
                </p>
              )}

              {/* Signup Button */}
              <Button 
                type="submit" 
                variant="accent"
                className="w-full font-medium"
                disabled={isLoading || isSubmitting}
                onClick={() => {
                  console.log('Submit button clicked');
                  console.log('Form errors:', errors);
                  console.log('Form values:', watch());
                }}
              >
                {isLoading || isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Creating account...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4" />
                    Create Account
                  </div>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-[var(--glass-bg)] px-2 text-muted-foreground">Already have an account?</span>
              </div>
            </div>

            {/* Back to Login */}
            <Button 
              type="button"
              variant="outline"
              asChild
              className="w-full border-border bg-accent/30 text-foreground hover:bg-accent hover:text-foreground hover:border-[var(--accent-border)]"
            >
              <Link to="/system/login">
                <Shield className="w-4 h-4 mr-2" />
                Sign In to Existing Account
              </Link>
            </Button>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 space-y-2">
          <p className="text-muted-foreground text-xs">
            © 2024 WebOnOne. All rights reserved.
          </p>
          <p className="text-muted-foreground text-xs">
            By creating an account, you agree to our terms and privacy policy.
          </p>
        </div>

        {/* Security Badge */}
        <div className="mt-6 p-3 rounded-lg bg-[var(--glass-bg)] backdrop-blur-sm border border-[var(--glass-border)]">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="w-4 h-4 text-green-500" />
            <span>Your data is protected with enterprise-grade security</span>
          </div>
        </div>
      </div>

      {/* Additional Background Elements */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-primary-hover)] opacity-50"></div>
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--accent-primary-hover)] to-[var(--accent-primary)] opacity-50"></div>
    </div>
  );
}