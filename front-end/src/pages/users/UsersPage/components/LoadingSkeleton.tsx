import { Card } from "../../../../components/ui/card";
import { LoadingSkeletonProps } from "../types";

export const LoadingSkeleton = ({ viewMode }: LoadingSkeletonProps) => {
  if (viewMode === "list") {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, index) => (
          <Card key={index} className="p-6 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />

              <div className="flex-1">
                {/* Name and Status */}
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                    <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                  <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                </div>

                {/* Email, Phone, Location */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
                    <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
                    <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                </div>

                {/* Role Badges and Member Since */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                  <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[...Array(8)].map((_, index) => (
        <Card key={index} className="p-6 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          {/* Avatar, Name, Status, Menu */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-20 w-20 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
              <div>
                <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            </div>
            <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
          </div>

          {/* Email, Phone, Location */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
              <div className="h-4 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
              <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
              <div className="h-4 w-36 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            </div>
          </div>

          {/* Role Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>

          {/* Member Since */}
          <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </Card>
      ))}
    </div>
  );
};
