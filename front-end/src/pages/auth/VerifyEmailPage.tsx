import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Mail, CheckCircle, XCircle, Loader2, Eye, EyeOff, Lock } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { authService } from "../../services/auth";
import { toast } from "sonner";
import * as yup from "yup";
import { useAppDispatch } from "../../store/hooks";
import { loginSuccess } from "../../store/slices/authSlice";

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

export const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error' | 'password-setup'>('verifying');
  const [message, setMessage] = useState<string>('');
  const [needsPassword, setNeedsPassword] = useState(false);
  const [verificationToken, setVerificationToken] = useState<string>('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSettingPassword, setIsSettingPassword] = useState(false);

  const passwordForm = useForm<{ password: string; confirmPassword: string }>({
    resolver: yupResolver(passwordSchema),
    defaultValues: { password: '', confirmPassword: '' },
    mode: 'onChange'
  });

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link. No token provided.');
      return;
    }

    const verifyEmail = async () => {
      try {
        const result = await authService.verifyEmail(token);
        
        if (result.success) {
          if (result.needsPassword) {
            setNeedsPassword(true);
            setVerificationToken(token);
            setStatus('password-setup');
            setMessage('Email verified! Please set your password to complete registration.');
          } else if (result.alreadyVerified) {
            setStatus('success');
            setMessage('Your email is already verified. You can now log in.');
          } else {
            setStatus('success');
            setMessage('Your email has been verified successfully! You can now log in.');
          }
        } else {
          setStatus('error');
          setMessage(result.message || 'Email verification failed.');
        }
      } catch (error: any) {
        setStatus('error');
        setMessage(error.message || 'Failed to verify email. Please try again.');
      }
    };

    verifyEmail();
  }, [searchParams]);

  const onPasswordSubmit = async (data: { password: string; confirmPassword: string }) => {
    try {
      setIsSettingPassword(true);
      const result = await authService.verifyEmailSetPassword(
        verificationToken,
        data.password,
        data.confirmPassword
      );
      
      // Store token and user data
      localStorage.setItem('authToken', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
      dispatch(loginSuccess({ user: result.user, token: result.token }));
      
      toast.success("Password set successfully! You can now log in.");
      setStatus('success');
      setMessage('Password set successfully! You can now log in to your account.');
    } catch (error: any) {
      toast.error(error.message || 'Failed to set password');
    } finally {
      setIsSettingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:bg-gradient-to-br dark:from-gray-900 dark:via-black dark:to-gray-800 flex items-center justify-center p-2 md:p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[var(--accent-primary)]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/10 dark:bg-green-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <Card className="p-8 backdrop-blur-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-2xl">
          <div className="text-center space-y-6">
            {/* Icon */}
            <div className="flex justify-center">
              {status === 'verifying' && (
                <div className="w-16 h-16 rounded-full bg-[var(--accent-primary)]/10 flex items-center justify-center">
                  <Loader2 className="w-8 h-8 text-[var(--accent-primary)] animate-spin" />
                </div>
              )}
              {status === 'success' && (
                <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              )}
              {status === 'error' && (
                <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                  <XCircle className="w-8 h-8 text-red-500" />
                </div>
              )}
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-foreground">
                {status === 'verifying' && 'Verifying Your Email'}
                {status === 'success' && 'Email Verified!'}
                {status === 'error' && 'Verification Failed'}
              </h1>
              <p className="text-muted-foreground">{message}</p>
            </div>

            {/* Password Setup Form */}
            {status === 'password-setup' && (
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
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

                <Button
                  type="submit"
                  variant="accent"
                  className="w-full font-medium"
                  disabled={isSettingPassword}
                >
                  {isSettingPassword ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Setting Password...
                    </div>
                  ) : (
                    'Set Password'
                  )}
                </Button>
              </form>
            )}

            {/* Actions */}
            {status === 'success' && (
              <div className="space-y-3">
                <Button
                  variant="accent"
                  className="w-full font-medium"
                  onClick={() => navigate('/system/dashboard')}
                >
                  Go to Dashboard
                </Button>
                <Link
                  to="/system/login"
                  className="block text-sm text-muted-foreground hover:text-[var(--accent-text)]"
                >
                  Or click here to sign in
                </Link>
              </div>
            )}

            {status === 'error' && (
              <div className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate('/system/signup')}
                >
                  Back to Sign Up
                </Button>
                <Link
                  to="/system/login"
                  className="block text-sm text-muted-foreground hover:text-[var(--accent-text)]"
                >
                  Already have an account? Sign in
                </Link>
              </div>
            )}
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-muted-foreground text-xs">
            © {new Date().getFullYear()} WebOnOne. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};
