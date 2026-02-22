import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Mail, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { authService } from "../../services/auth";
import { toast } from "sonner";

export const VerifyEmailPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState<string>('');

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
          if (result.alreadyVerified) {
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

            {/* Actions */}
            {status === 'success' && (
              <div className="space-y-3">
                <Button
                  variant="accent"
                  className="w-full font-medium"
                  onClick={() => navigate('/system/login')}
                >
                  Go to Login
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
