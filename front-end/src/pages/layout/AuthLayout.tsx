import { ReactNode } from "react";
import { Toaster } from "../../components/ui/sonner";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <>
      {children}
      {/* Toast notifications */}
      <Toaster />
    </>
  );
}