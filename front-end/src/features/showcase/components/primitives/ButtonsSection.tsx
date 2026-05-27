"use client";

import { Edit, Plus, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function ButtonsSection() {
  return (
    <section id="showcase-primary-buttons" className="space-y-4 scroll-mt-24">
      <h2 className="text-2xl font-semibold text-foreground">Buttons</h2>
      <Card className="bg-[var(--glass-bg)] border-[var(--glass-border)]">
        <CardHeader>
          <CardTitle>Button primitives</CardTitle>
          <CardDescription>
            Base <code className="text-xs">@/components/ui/button</code> variants, sizes, and states. Composed
            control patterns (back, filter, page actions) live on the Controls tab.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-wrap gap-3">
            <Button variant="accent">Accent</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
          <Separator />
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="accent" size="sm">
              Small
            </Button>
            <Button variant="accent" size="default">
              Medium
            </Button>
            <Button variant="accent" size="lg">
              Large
            </Button>
            <Button variant="accent" size="icon" aria-label="Add">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <Separator />
          <div className="flex flex-wrap gap-3">
            <Button variant="accent">
              <Plus className="h-4 w-4 mr-2" />
              With icon
            </Button>
            <Button variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="accent" className="h-10">
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button variant="destructive">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
          <Separator />
          <div className="flex flex-wrap gap-3">
            <Button variant="accent" disabled>
              Disabled accent
            </Button>
            <Button variant="outline" disabled>
              Disabled outline
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
