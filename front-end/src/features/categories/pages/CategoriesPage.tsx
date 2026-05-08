import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowRight, Layers } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/common/SearchInput";
import { EmptyState } from "@/components/common/EmptyState";
import type { User } from "@/shared/types/user";
import { categoriesService } from "../services";
import type { IndustryCategory } from "../types";

export interface CategoriesPageProps {
  currentUser: User | null;
  onViewCategory: (categoryId: string) => void;
}

export const CategoriesPage = ({
  currentUser: _currentUser,
  onViewCategory,
}: CategoriesPageProps) => {
  const [items, setItems] = useState<IndustryCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await categoriesService.getAll();
      setItems(Array.isArray(data) ? data : []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.description && c.description.toLowerCase().includes(q))
    );
  }, [items, debouncedSearch]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Industry categories</h1>
          <p className="text-sm text-muted-foreground">
            Browse industry groupings used for companies and services.
          </p>
        </div>
        <div className="w-full max-w-md">
          <SearchInput
            value={search}
            onChange={setSearch}
            onDebouncedChange={setDebouncedSearch}
            placeholder="Search categories..."
          />
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card
              key={i}
              className="h-36 animate-pulse border-[var(--glass-border)] bg-[var(--glass-bg)]"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No categories"
          description={
            debouncedSearch
              ? "Try a different search term."
              : "No industry categories are available yet."
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((category) => (
            <Card
              key={category.id}
              className="flex flex-col border-[var(--glass-border)] bg-[var(--glass-bg)] p-5 transition hover:border-[var(--accent-text)]/40"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    {category.icon ? (
                      <span className="text-xl" aria-hidden>
                        {category.icon}
                      </span>
                    ) : null}
                    <h2 className="text-lg font-medium text-foreground">{category.name}</h2>
                  </div>
                  {category.description ? (
                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                      {category.description}
                    </p>
                  ) : null}
                </div>
                <Badge variant="secondary" className="shrink-0">
                  {category.subcategories?.length ?? 0} sub
                </Badge>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {typeof category.companyCount === "number"
                    ? `${category.companyCount} companies`
                    : ""}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1 text-[var(--accent-text)]"
                  onClick={() => onViewCategory(category.id)}
                >
                  View
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
