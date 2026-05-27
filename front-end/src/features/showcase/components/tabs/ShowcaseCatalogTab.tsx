"use client";

import { SearchInput } from "@/components/common/SearchInput";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useShowcaseCatalogFilter } from "../../hooks";
import type { ShowcaseCatalogEntry, ShowcaseTabId } from "../../types";

interface ShowcaseCatalogTabProps {
  onNavigateTab: (tab: ShowcaseTabId, sectionId?: string) => void;
}

export function ShowcaseCatalogTab({ onNavigateTab }: ShowcaseCatalogTabProps) {
  const { query, setQuery, filtered } = useShowcaseCatalogFilter();

  const handleJump = (entry: ShowcaseCatalogEntry) => {
    onNavigateTab(entry.tab, entry.sectionId);
    if (entry.sectionId) {
      requestAnimationFrame(() => {
        document.getElementById(entry.sectionId!)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  };

  return (
    <div className="space-y-6 mt-6">
      <SearchInput
        value={query}
        onChange={setQuery}
        placeholder="Search components by name, import path, or category..."
        className="max-w-xl"
      />
      <p className="text-sm text-muted-foreground">{filtered.length} components</p>
      <div className="rounded-lg border border-[var(--glass-border)] overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-[var(--glass-bg)] border-b border-[var(--glass-border)]">
            <tr className="text-left text-muted-foreground">
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium hidden sm:table-cell">Category</th>
              <th className="p-3 font-medium hidden md:table-cell">Import</th>
              <th className="p-3 font-medium">Tab</th>
              <th className="p-3 font-medium w-24" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((entry) => (
              <tr key={entry.id} className="border-b border-[var(--glass-border)] hover:bg-accent/30">
                <td className="p-3 text-foreground font-medium">{entry.name}</td>
                <td className="p-3 hidden sm:table-cell">
                  <Badge variant="outline" className="capitalize">
                    {entry.category}
                  </Badge>
                </td>
                <td className="p-3 hidden md:table-cell font-mono text-xs text-muted-foreground">{entry.importPath}</td>
                <td className="p-3 capitalize text-muted-foreground">{entry.tab}</td>
                <td className="p-3">
                  <Button type="button" variant="outline" size="sm" onClick={() => handleJump(entry)}>
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
