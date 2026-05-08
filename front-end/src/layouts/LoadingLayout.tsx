interface LoadingLayoutProps {
  message?: string;
}

export function LoadingLayout({ message = "Loading..." }: LoadingLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:bg-gradient-to-br dark:from-gray-900 dark:via-black dark:to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-foreground">{message}</p>
      </div>
    </div>
  );
}