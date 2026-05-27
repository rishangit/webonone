import { useCallback, useEffect, useState } from "react";
import { Layers } from "lucide-react";
import { BackButton } from "@/components/common/BackButton";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/EmptyState";
import { categoriesService } from "../services";
import type { IndustryCategory } from "../types";

export interface CategoryDetailPageProps {
  categoryId: string;
  onBack: () => void;
}

export const CategoryDetailPage = ({ categoryId, onBack }: CategoryDetailPageProps) => {
  const [category, setCategory] = useState<IndustryCategory | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await categoriesService.getById(categoryId);
      setCategory(data ?? null);
    } catch {
      setCategory(null);
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-wrap items-center gap-3">
        <BackButton onClick={onBack} label="Back" />
        {loading ? (
          <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
        ) : category ? (
          <div className="flex items-center gap-2">
            {category.icon ? (
              <span className="text-2xl" aria-hidden>
                {category.icon}
              </span>
            ) : null}
            <h1 className="text-2xl font-semibold text-foreground">{category.name}</h1>
            {category.isActive === false ? (
              <Badge variant="outline">Inactive</Badge>
            ) : (
              <Badge variant="secondary">Active</Badge>
            )}
          </div>
        ) : (
          <h1 className="text-2xl font-semibold text-foreground">Category not found</h1>
        )}
      </div>

      {loading ? (
        <Card className="h-40 animate-pulse border-[var(--glass-border)] bg-[var(--glass-bg)]" />
      ) : !category ? (
        <Card className="border-[var(--glass-border)] bg-[var(--glass-bg)] p-8 text-center text-muted-foreground">
          This category does not exist or was removed.
        </Card>
      ) : (
        <>
          {category.description ? (
            <p className="max-w-3xl text-sm text-muted-foreground">{category.description}</p>
          ) : null}

          <div>
            <div className="mb-3 flex items-center gap-2 text-foreground">
              <Layers className="h-5 w-5 text-[var(--accent-text)]" />
              <h2 className="text-lg font-medium">Subcategories</h2>
            </div>
            {category.subcategories && category.subcategories.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {category.subcategories.map((sub) => (
                  <Card
                    key={sub.id}
                    className="border-[var(--glass-border)] bg-[var(--glass-bg)] p-4"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-medium text-foreground">{sub.name}</h3>
                      {sub.isActive === false ? (
                        <Badge variant="outline" className="shrink-0 text-xs">
                          Inactive
                        </Badge>
                      ) : null}
                    </div>
                    {sub.description ? (
                      <p className="mt-2 text-sm text-muted-foreground">{sub.description}</p>
                    ) : null}
                    {typeof sub.companyCount === "number" ? (
                      <p className="mt-3 text-xs text-muted-foreground">
                        {sub.companyCount} companies
                      </p>
                    ) : null}
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={Layers}
                title="No subcategories yet"
                description="There are no subcategories for this industry yet."
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};
