interface ErrorLayoutProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorLayout({ 
  title = "Something went wrong",
  message = "There was an error loading this page.",
  onRetry,
  retryLabel = "Go to Dashboard"
}: ErrorLayoutProps) {
  return (
    <div className="flex-1 p-4 lg:p-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground mb-2">{title}</h2>
        <p className="text-muted-foreground mb-4">{message}</p>
        {onRetry && (
          <button 
            onClick={onRetry}
            className="px-4 py-2 bg-[var(--accent-primary)] text-[var(--accent-button-text)] rounded-lg hover:bg-[var(--accent-primary-hover)] transition-colors"
          >
            {retryLabel}
          </button>
        )}
      </div>
    </div>
  );
}