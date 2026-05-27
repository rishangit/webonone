"use client";

import { useCallback, useState } from "react";
import { TabSwitcher } from "@/components/ui/tab-switcher";
import { SHOWCASE_TABS } from "../constants";
import type { ShowcasePageProps, ShowcaseTabId } from "../types";
import { ShowcasePageHeader } from "../components/ShowcasePageHeader";
import {
  ShowcaseCardsTab,
  ShowcaseCatalogTab,
  ShowcaseControlsTab,
  ShowcaseDialogsTab,
  ShowcaseListsTab,
  ShowcasePrimaryTab,
} from "../components/tabs";

export default function ShowcasePage({
  onThemeChange,
  currentTheme = "dark",
  onAccentColorChange,
  currentAccentColor = "orange",
}: ShowcasePageProps) {
  const [activeTab, setActiveTab] = useState<ShowcaseTabId>("catalog");

  const handleNavigateTab = useCallback((tab: ShowcaseTabId, _sectionId?: string) => {
    setActiveTab(tab);
  }, []);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="space-y-6 max-w-[1600px] mx-auto">
        <ShowcasePageHeader />
        <TabSwitcher tabs={SHOWCASE_TABS} activeTab={activeTab} onTabChange={(t) => setActiveTab(t as ShowcaseTabId)} />
        {activeTab === "catalog" && <ShowcaseCatalogTab onNavigateTab={handleNavigateTab} />}
        {activeTab === "primary" && (
          <ShowcasePrimaryTab
            onThemeChange={onThemeChange}
            currentTheme={currentTheme}
            onAccentColorChange={onAccentColorChange}
            currentAccentColor={currentAccentColor}
            onNavigateTab={handleNavigateTab}
          />
        )}
        {activeTab === "controls" && <ShowcaseControlsTab />}
        {activeTab === "cards" && <ShowcaseCardsTab />}
        {activeTab === "lists" && <ShowcaseListsTab />}
        {activeTab === "dialogs" && <ShowcaseDialogsTab />}
      </div>
    </div>
  );
}
