"use client";

import { useState } from "react";
import { Package, Plus } from "lucide-react";
import { EmptyState } from "@/components/common/EmptyState";
import { Pagination } from "@/components/common/Pagination";
import { SearchInput } from "@/components/common/SearchInput";
import { TabSwitcher } from "@/components/ui/tab-switcher";
import { ViewSwitcher } from "@/components/ui/view-switcher";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { TagCard, TagSelector } from "@/shared/components/tags";
import { createShowcaseNoopHandler, notifyShowcaseOnly, showcaseTag } from "../../fixtures";
import { AvatarSection, ControlButtonsSection, MenusSection } from "../primitives";

export function ShowcaseControlsTab() {
  const [miniTab, setMiniTab] = useState("one");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState("");
  const noop = createShowcaseNoopHandler();

  return (
    <div className="space-y-8 mt-6">
      <ControlButtonsSection />

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">TabSwitcher</h2>
        <TabSwitcher
          tabs={[
            { value: "one", label: "Tab one" },
            { value: "two", label: "Tab two" },
          ]}
          activeTab={miniTab}
          onTabChange={setMiniTab}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">ViewSwitcher</h2>
        <ViewSwitcher viewMode={viewMode} onViewModeChange={setViewMode} />
      </section>

      <MenusSection />

      <AvatarSection />

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">SearchInput</h2>
        <SearchInput value={filter} onChange={setFilter} placeholder="Filter demo..." className="max-w-md" />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Tags</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl">
          <TagCard tag={showcaseTag} viewMode="grid" onEdit={noop} onDelete={noop} onToggleStatus={noop} />
        </div>
        <div className="max-w-md space-y-2">
          <p className="text-sm text-muted-foreground">TagSelector (may load tags from API when opened)</p>
          <TagSelector value={[]} onChange={() => notifyShowcaseOnly()} />
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">EmptyState</h2>
        <EmptyState
          icon={Package}
          title="No items found"
          description="Example empty state used on list pages."
          action={{ label: "Add item", onClick: () => notifyShowcaseOnly(), icon: Plus }}
        />
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Pagination</h2>
        <Pagination totalItems={50} itemsPerPage={10} currentPage={2} onPageChange={() => notifyShowcaseOnly()} />
      </section>

      <Card className="bg-[var(--glass-bg)] border-[var(--glass-border)]">
        <CardHeader>
          <CardTitle>Card primitive</CardTitle>
          <CardDescription>Base card shell</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
          </div>
          <Separator />
          <div className="flex gap-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="button" variant="outline" size="sm">
                  Hover tooltip
                </Button>
              </TooltipTrigger>
              <TooltipContent>Tooltip content</TooltipContent>
            </Tooltip>
          </div>
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="#">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Showcase</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <Accordion type="single" collapsible>
            <AccordionItem value="item-1">
              <AccordionTrigger>Accordion item</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">Collapsible content block.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
