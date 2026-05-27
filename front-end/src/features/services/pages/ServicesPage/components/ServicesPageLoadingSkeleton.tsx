import { Card } from "@/components/ui/card";
import { LIST_CARD_LIST_MEDIA_WIDTH_CLASS } from "@/components/common/CardKebabTrigger";

export interface ServicesPageLoadingSkeletonProps {
  viewMode: "grid" | "list";
}

export function ServicesPageLoadingSkeleton({ viewMode }: ServicesPageLoadingSkeletonProps) {
  if (viewMode === "list") {
    return (
      <div className="flex-1">
        <div className="space-y-4">
          {[...Array(6)].map((_, index) => (
            <Card key={index} className="p-6 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-6">
                <div className={`flex-shrink-0 ${LIST_CARD_LIST_MEDIA_WIDTH_CLASS} min-h-48 bg-gray-200 dark:bg-gray-700 animate-pulse`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 min-w-0 mr-2">
                      <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                      <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                      <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                    </div>
                  </div>
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-3" />
                  <div className="flex items-center gap-4 mb-3">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                      <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    </div>
                    <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                    <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, index) => (
          <Card key={index} className="overflow-hidden bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <div className="relative h-48 bg-gray-200 dark:bg-gray-700 animate-pulse">
              <div className="absolute top-3 left-3">
                <div className="h-6 w-16 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
              </div>
              <div className="absolute bottom-3 right-3">
                <div className="h-6 w-20 bg-gray-300 dark:bg-gray-600 rounded animate-pulse" />
              </div>
            </div>
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <div className="h-5 w-40 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
                <div className="h-8 w-8 rounded bg-gray-200 dark:bg-gray-700 animate-pulse flex-shrink-0" />
              </div>
              <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4" />
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-1.5">
                  <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700 animate-pulse" />
                  <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
              <div className="flex flex-wrap gap-1">
                <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
