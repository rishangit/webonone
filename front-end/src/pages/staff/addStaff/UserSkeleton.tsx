import { Card } from "../../../components/ui/card";

interface UserSkeletonProps {
  count?: number;
}

export const UserSkeleton = ({ count = 1 }: UserSkeletonProps) => {
  return (
    <>
      {[...Array(count)].map((_, index) => (
        <Card
          key={`skeleton-${index}`}
          className="border-[var(--glass-border)] bg-[var(--glass-bg)] p-3 animate-pulse"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--glass-border)] flex-shrink-0"></div>
            <div className="flex-1 min-w-0 space-y-2">
              <div className="h-4 bg-[var(--glass-border)] rounded w-3/4"></div>
              <div className="h-3 bg-[var(--glass-border)] rounded w-1/2"></div>
              <div className="h-3 bg-[var(--glass-border)] rounded w-2/3"></div>
              <div className="flex items-center gap-2 mt-2">
                <div className="h-5 bg-[var(--glass-border)] rounded w-16"></div>
                <div className="h-5 bg-[var(--glass-border)] rounded w-16"></div>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </>
  );
};
