import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, ArrowLeft, Zap, Shield } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { toast } from "sonner";
import { authService } from "../../services/auth";

export const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error("Please enter your email address");
      return;
    }

    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      setEmailSent(true);
      toast.success("Password reset email sent successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to send password reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
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

        {/* Forgot Password Card */}
        <Card className="p-8 backdrop-blur-xl bg-[var(--glass-bg)] border border-[var(--glass-border)] shadow-2xl">
          <div className="space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                {emailSent ? "Check Your Email" : "Forgot Password"}
              </h2>
              <p className="text-muted-foreground text-sm">
                {emailSent 
                  ? "We've sent a password reset link to your email address"
                  : "Enter your email address and we'll send you a link to reset your password"
                }
              </p>
            </div>

            {!emailSent ? (
              /* Forgot Password Form */
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
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  variant="accent"
                  className="w-full font-medium mb-4"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Sending...
                    </div>
                  ) : (
                    "Request Password Reset"
                  )}
                </Button>
              </form>
            ) : (
              /* Email Sent Success Message */
              <div className="space-y-4">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm text-green-800 dark:text-green-200 font-medium mb-1">
                        Password reset email sent!
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-300">
                        We've sent a password reset link to <strong>{email}</strong>. 
                        Please check your inbox and click the link to reset your password.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    <strong>Note:</strong> The password reset link will expire in 1 hour. 
                    If you don't see the email, please check your spam folder.
                  </p>
                </div>

                <Button 
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setEmailSent(false);
                    setEmail("");
                  }}
                >
                  Send Another Email
                </Button>
              </div>
            )}

            {/* Back to Login */}
            <div className="pt-4 border-t border-[var(--glass-border)]">
              <Button 
                variant="ghost" 
                className="w-full"
                onClick={() => navigate('/system/login')}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Login
              </Button>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 md:mt-10 space-y-2">
          <p className="text-muted-foreground text-sm">
            Remember your password? 
            <Button 
              variant="link" 
              asChild
              className="text-[var(--accent-text)] hover:text-[var(--accent-primary-hover)] p-0 ml-1 h-auto"
            >
              <Link to="/system/login">
                Sign in
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
    </div>
  );
};
