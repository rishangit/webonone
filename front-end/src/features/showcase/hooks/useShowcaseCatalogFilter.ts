import { useMemo, useState } from "react";
import { SHOWCASE_CATALOG_ENTRIES } from "../constants";
import type { ShowcaseCatalogEntry } from "../types";

export function useShowcaseCatalogFilter() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return SHOWCASE_CATALOG_ENTRIES;
    return SHOWCASE_CATALOG_ENTRIES.filter(
      (entry: ShowcaseCatalogEntry) =>
        entry.name.toLowerCase().includes(q) ||
        entry.importPath.toLowerCase().includes(q) ||
        entry.category.toLowerCase().includes(q) ||
        entry.tab.toLowerCase().includes(q) ||
        (entry.notes?.toLowerCase().includes(q) ?? false)
    );
  }, [query]);

  return { query, setQuery, filtered };
}
