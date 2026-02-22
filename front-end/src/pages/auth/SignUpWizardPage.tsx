import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Eye, EyeOff, Lock, Mail, User, UserPlus, Phone, ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { PhoneInput } from "../../components/common/PhoneInput";
import { toast } from "sonner";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { signUpRequest } from "../../store/slices/authSlice";
import { authService } from "../../services/auth";
import { UserRole } from "../../types/user";
import * as yup from "yup";

// Step 1: Email validation schema
const emailSchema = yup.object({
  email: yup
    .string()
    .required('Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
});

// Step 2: Mobile validation schema
const mobileSchema = yup.object({
  mobileNumber: yup
    .string()
    .required('Mobile number is required')
    .matches(/^\+\d{1,4}\d{6,14}$/, 'Please enter a valid mobile number with country code'),
});

// Step 3/4: Name validation schema
const nameSchema = yup.object({
  firstName: yup
    .string()
    .required('First name is required')
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name must be less than 50 characters')
    .matches(/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces'),
  lastName: yup
    .string()
    .required('Last name is required')
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name must be less than 50 characters')
    .matches(/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces'),
});

// Step 5: Password validation schema
const passwordSchema = yup.object({
  password: yup
    .string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password must be less than 128 characters'),
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords must match'),
});

type WizardFormData = {
  email: string;
  mobileNumber: string;
  firstName: string;
  lastName: string;
  password: string;
  confirmPassword: string;
};

export const SignUpWizardPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { signUpStep, user } = useAppSelector((state) => state.auth);
  
  const [currentStep, setCurrentStep] = useState(1);
  const [existingUser, setExistingUser] = useState<any>(null);
  const [isExistingUser, setIsExistingUser] = useState<boolean | null>(null);
  const [isCheckingUser, setIsCheckingUser] = useState(false);
  const [isSettingUpAccount, setIsSettingUpAccount] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [setupComplete, setSetupComplete] = useState(false);
  const [signupComplete, setSignupComplete] = useState(false);
  
  // Form for each step
  const emailForm = useForm<{ email: string }>({
    resolver: yupResolver(emailSchema),
    defaultValues: { email: '' },
    mode: 'onChange'
  });

  const mobileForm = useForm<{ mobileNumber: string }>({
    resolver: yupResolver(mobileSchema),
    defaultValues: { mobileNumber: '' },
    mode: 'onChange'
  });

  const nameForm = useForm<{ firstName: string; lastName: string }>({
    resolver: yupResolver(nameSchema),
    defaultValues: { firstName: '', lastName: '' },
    mode: 'onChange'
  });

  const passwordForm = useForm<{ password: string; confirmPassword: string }>({
    resolver: yupResolver(passwordSchema),
    defaultValues: { password: '', confirmPassword: '' },
    mode: 'onChange'
  });

  // Step 1: Email submission
  const onEmailSubmit = async (data: { email: string }) => {
    try {
      setIsCheckingUser(true);
      const result = await authService.checkUser(data.email);
      
      if (result.exists && result.user) {
        setExistingUser(result.user);
        setCurrentStep(3); // Skip to step 3 (user exists check)
      } else {
        setCurrentStep(2); // Move to mobile number step
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to check user');
    } finally {
      setIsCheckingUser(false);
    }
  };

  // Step 2: Mobile submission
  const onMobileSubmit = async (data: { mobileNumber: string }) => {
    try {
      setIsCheckingUser(true);
      const emailValue = emailForm.getValues('email');
      const result = await authService.checkUser(emailValue, data.mobileNumber);
      
      if (result.exists && result.user) {
        setExistingUser(result.user);
        setCurrentStep(3); // Move to user exists check
      } else {
        // No existing user found, proceed to name step
        setIsExistingUser(false);
        setCurrentStep(4); // Move directly to name step (skip user exists check)
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to check user');
    } finally {
      setIsCheckingUser(false);
    }
  };

  // Step 3: Handle existing user response
  const handleExistingUserResponse = (isUser: boolean) => {
    setIsExistingUser(isUser);
    if (isUser) {
      // Pre-fill name form with existing user data
      nameForm.setValue('firstName', existingUser.firstName || '');
      nameForm.setValue('lastName', existingUser.lastName || '');
      setCurrentStep(4); // Move to name step (editable)
    } else {
      setCurrentStep(4); // Move to name step (new user)
    }
  };

  // Step 4: Name submission
  const onNameSubmit = async (data: { firstName: string; lastName: string }) => {
    // If this is an existing user, send setup emails instead of going to password step
    if (isExistingUser && existingUser) {
      try {
        setIsSettingUpAccount(true);
        const mobileValue = mobileForm.getValues('mobileNumber');
        await authService.setupExistingAccount(
          existingUser.id,
          data.firstName,
          data.lastName,
          mobileValue || undefined
        );
        
        setSetupComplete(true);
        setCurrentStep(6); // Move to summary step
      } catch (error: any) {
        toast.error(error.message || 'Failed to setup account');
      } finally {
        setIsSettingUpAccount(false);
      }
    } else {
      // New user - create user without password and send verification email
      try {
        setIsSettingUpAccount(true);
        const emailValue = emailForm.getValues('email');
        const mobileValue = mobileForm.getValues('mobileNumber');
        await authService.createUserWithoutPassword(
          emailValue,
          data.firstName,
          data.lastName,
          mobileValue || undefined
        );
        
        setSetupComplete(true);
        setCurrentStep(6); // Move to summary step
      } catch (error: any) {
        toast.error(error.message || 'Failed to create account');
      } finally {
        setIsSettingUpAccount(false);
      }
    }
  };

  // Step 5: Final submission (only for new users)
  const onPasswordSubmit = async (data: { password: string; confirmPassword: string }) => {
    try {
      const formData: any = {
        email: emailForm.getValues('email'),
        firstName: nameForm.getValues('firstName'),
        lastName: nameForm.getValues('lastName'),
        password: data.password,
        confirmPassword: data.confirmPassword,
        mobileNumber: mobileForm.getValues('mobileNumber'),
        role: UserRole.USER
      };

      // Dispatch signup request
      dispatch(signUpRequest(formData));
    } catch (error: any) {
      toast.error(error.message || 'Failed to create account');
    }
  };

  // Watch for successful signup
  useEffect(() => {
    if (signUpStep === 'complete' && user) {
      setSignupComplete(true);
      setCurrentStep(6); // Move to summary step
    }
  }, [signUpStep, user]);

  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const totalSteps = (setupComplete || signupComplete) ? 6 : 5;
  const progress = (currentStep / totalSteps) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:bg-gradient-to-br dark:from-gray-900 dark:via-black dark:to-gray-800 flex items-center justify-center p-2 md:p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--accent-primary)]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 dark:bg-green-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Logo/Brand Section */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-primary-hover)] shadow-lg shadow-[var(--accent-primary)]/25 mb-4">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">Create Your Account</h1>
          <p className="text-muted-foreground">Step {currentStep} of {totalSteps}</p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-primary-hover)] h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>

        {/* Signup Card */}
        <Card className="p-8 backdrop-blur-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-2xl">
          {/* Step 1: Email */}
          {currentStep === 1 && (
            <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
              <div className="text-center space-y-2 mb-6">
                <h2 className="text-xl font-semibold text-foreground">Enter Your Email</h2>
                <p className="text-muted-foreground text-sm">We'll check if you already have an account</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="john.doe@example.com"
                    {...emailForm.register('email')}
                    className="pl-10 bg-[var(--input-background)] border-[var(--glass-border)] text-foreground placeholder:text-muted-foreground focus:border-[var(--accent-border)] focus:ring-[var(--accent-primary)]/20"
                  />
                </div>
                {emailForm.formState.errors.email && (
                  <p className="text-red-500 text-xs mt-1">{emailForm.formState.errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                variant="accent"
                className="w-full font-medium"
                disabled={isCheckingUser}
              >
                {isCheckingUser ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Checking...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </div>
                )}
              </Button>
            </form>
          )}

          {/* Step 2: Mobile Number */}
          {currentStep === 2 && (
            <form onSubmit={mobileForm.handleSubmit(onMobileSubmit)} className="space-y-4">
              <div className="text-center space-y-2 mb-6">
                <h2 className="text-xl font-semibold text-foreground">Enter Your Mobile Number</h2>
                <p className="text-muted-foreground text-sm">We'll use this to verify your account</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobileNumber" className="text-foreground">Mobile Number</Label>
                <Controller
                  name="mobileNumber"
                  control={mobileForm.control}
                  render={({ field }) => (
                    <PhoneInput
                      id="mobileNumber"
                      value={field.value || ''}
                      onChange={(value) => {
                        field.onChange(value);
                        mobileForm.trigger('mobileNumber');
                      }}
                      onBlur={field.onBlur}
                      placeholder="Enter your mobile number"
                      error={!!mobileForm.formState.errors.mobileNumber}
                      className="w-full"
                    />
                  )}
                />
                {mobileForm.formState.errors.mobileNumber && (
                  <p className="text-red-500 text-xs mt-1">{mobileForm.formState.errors.mobileNumber.message}</p>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={goToPreviousStep}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="accent"
                  className="flex-1 font-medium"
                  disabled={isCheckingUser}
                >
                  {isCheckingUser ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Checking...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Continue
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* Step 3: Existing User Check */}
          {currentStep === 3 && existingUser && (
            <div className="space-y-4">
              <div className="text-center space-y-2 mb-6">
                <h2 className="text-xl font-semibold text-foreground">Is This You?</h2>
                <p className="text-muted-foreground text-sm">We found an account with this email</p>
              </div>

              <div className="bg-[var(--input-background)] border border-[var(--glass-border)] rounded-lg p-4 space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="text-foreground font-medium">
                    {existingUser.firstName} {existingUser.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="text-foreground font-medium">{existingUser.email}</p>
                </div>
                {existingUser.phone && (
                  <div>
                    <p className="text-sm text-muted-foreground">Phone</p>
                    <p className="text-foreground font-medium">{existingUser.phone}</p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleExistingUserResponse(false)}
                  className="flex-1"
                >
                  <X className="w-4 h-4 mr-2" />
                  No, Not Me
                </Button>
                <Button
                  type="button"
                  variant="accent"
                  onClick={() => handleExistingUserResponse(true)}
                  className="flex-1 font-medium"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Yes, That's Me
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Name */}
          {currentStep === 4 && (
            <form onSubmit={nameForm.handleSubmit(onNameSubmit)} className="space-y-4">
              <div className="text-center space-y-2 mb-6">
                <h2 className="text-xl font-semibold text-foreground">Enter Your Name</h2>
                <p className="text-muted-foreground text-sm">
                  {isExistingUser 
                    ? 'Update your name if needed. We\'ll send you password reset and verification links.' 
                    : 'Tell us your name'}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-foreground">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      {...nameForm.register('firstName')}
                      className="pl-10 bg-[var(--input-background)] border-[var(--glass-border)] text-foreground placeholder:text-muted-foreground focus:border-[var(--accent-border)] focus:ring-[var(--accent-primary)]/20"
                    />
                  </div>
                  {nameForm.formState.errors.firstName && (
                    <p className="text-red-500 text-xs mt-1">{nameForm.formState.errors.firstName.message}</p>
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
                      {...nameForm.register('lastName')}
                      className="pl-10 bg-[var(--input-background)] border-[var(--glass-border)] text-foreground placeholder:text-muted-foreground focus:border-[var(--accent-border)] focus:ring-[var(--accent-primary)]/20"
                    />
                  </div>
                  {nameForm.formState.errors.lastName && (
                    <p className="text-red-500 text-xs mt-1">{nameForm.formState.errors.lastName.message}</p>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={goToPreviousStep}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="accent"
                  className="flex-1 font-medium"
                  disabled={isSettingUpAccount}
                >
                  {isSettingUpAccount ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Sending...
                    </div>
                  ) : (
                    <>
                      Next
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}

          {/* Step 5: Password */}
          {currentStep === 5 && (
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <div className="text-center space-y-2 mb-6">
                <h2 className="text-xl font-semibold text-foreground">Create Password</h2>
                <p className="text-muted-foreground text-sm">Choose a strong password for your account</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    {...passwordForm.register('password')}
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
                {passwordForm.formState.errors.password && (
                  <p className="text-red-500 text-xs mt-1">{passwordForm.formState.errors.password.message}</p>
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
                    {...passwordForm.register('confirmPassword')}
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
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{passwordForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={goToPreviousStep}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="accent"
                  className="flex-1 font-medium"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Create Account
                </Button>
              </div>
            </form>
          )}

          {/* Step 6: Summary (for both existing and new users) */}
          {currentStep === 6 && (setupComplete || signupComplete) && (
            <div className="space-y-6">
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                    <Mail className="w-8 h-8 text-green-500" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-semibold text-foreground">
                    {setupComplete && isExistingUser ? 'Emails Sent Successfully!' : 'Verification Email Sent!'}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {setupComplete && isExistingUser 
                      ? "We've sent important links to your email address"
                      : "We've sent a verification link to your email address"}
                  </p>
                </div>
              </div>

              <div className="bg-[var(--input-background)] border border-[var(--glass-border)] rounded-lg p-4 space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Email Address</p>
                  <p className="text-foreground font-medium">{emailForm.getValues('email')}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-blue-500" />
                    What's Next?
                  </h3>
                  {setupComplete && isExistingUser ? (
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <span className="text-blue-500">1.</span>
                        <span>Check your email inbox for two important links</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-blue-500">2.</span>
                        <span><strong className="text-foreground">Email Verification Link:</strong> Click to verify your email address</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-blue-500">3.</span>
                        <span>After completing both steps, you can log in to your account</span>
                      </li>
                    </ul>
                  ) : (
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <span className="text-blue-500">1.</span>
                        <span>Check your email inbox for a verification link</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-blue-500">2.</span>
                        <span><strong className="text-foreground">Email Verification Link:</strong> Click the link in the email to verify your email address</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-blue-500">3.</span>
                        <span><strong className="text-foreground">Set Password:</strong> After clicking the verification link, you'll be asked to set your account password</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-blue-500">4.</span>
                        <span>After setting your password, you can log in to your account</span>
                      </li>
                    </ul>
                  )}
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Note:</strong> If you don't see the {setupComplete && isExistingUser ? 'emails' : 'email'}, please check your spam folder. 
                    The link will expire in 24 hours.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/system/login')}
                  className="flex-1"
                >
                  Go to Login
                </Button>
                <Button
                  type="button"
                  variant="accent"
                  onClick={() => {
                    // Reset wizard state
                    setCurrentStep(1);
                    setSetupComplete(false);
                    setIsExistingUser(null);
                    setExistingUser(null);
                    emailForm.reset();
                    mobileForm.reset();
                    nameForm.reset();
                  }}
                  className="flex-1 font-medium"
                >
                  Start Over
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-muted-foreground text-sm">
            Already have an account?{" "}
            <Link to="/system/login" className="text-[var(--accent-text)] hover:text-[var(--accent-primary-hover)] font-medium">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
