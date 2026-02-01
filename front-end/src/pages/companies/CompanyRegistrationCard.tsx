import { useState } from "react";
import { Building, Sparkles, ArrowRight, X } from "lucide-react";
import { Card } from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { CompanyRegistrationWizard } from "./CompanyRegistrationWizard";

interface CompanyRegistrationCardProps {
  onDismiss?: () => void;
  showCloseButton?: boolean;
}

export function CompanyRegistrationCard({ onDismiss, showCloseButton = true }: CompanyRegistrationCardProps) {
  const [showWizard, setShowWizard] = useState(false);

  return (
    <>
      <Card className="p-6 backdrop-blur-sm bg-gradient-to-br from-[var(--accent-primary)]/10 to-[var(--accent-secondary)]/5 border border-[var(--accent-border)] shadow-lg shadow-[var(--accent-primary)]/10 hover:shadow-[var(--accent-primary)]/20 transition-all duration-300">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4 flex-1">
            <div className="p-3 rounded-xl bg-gradient-to-br from-[var(--accent-primary)] to-[var(--accent-secondary)] shadow-lg shadow-[var(--accent-primary)]/25">
              <Building className="w-6 h-6 text-[var(--accent-button-text)]" />
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-foreground">Register Your Company</h3>
                <Sparkles className="w-4 h-4 text-[var(--accent-text)]" />
              </div>
              <p className="text-muted-foreground text-sm mb-4">
                Join our platform and start managing appointments for your business. Get access to powerful tools for scheduling, customer management, and analytics.
              </p>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <Button
                  onClick={() => setShowWizard(true)}
                  className="bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] hover:from-[var(--accent-primary-hover)] hover:to-[var(--accent-primary)] text-[var(--accent-button-text)] shadow-md hover:shadow-lg transition-all duration-200"
                >
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <span className="text-xs text-muted-foreground">
                  ✨ Free to register
                </span>
              </div>
            </div>
          </div>
          
          {showCloseButton && onDismiss && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onDismiss}
              className="text-muted-foreground hover:text-foreground hover:bg-accent flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </Card>

      {/* Registration Wizard */}
      <CompanyRegistrationWizard
        open={showWizard}
        onOpenChange={setShowWizard}
      />
    </>
  );
}