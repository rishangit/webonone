"use client";

import { Copy, Edit, MoreVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createShowcaseNoopHandler } from "../../fixtures";

export function MenusSection() {
  const noop = createShowcaseNoopHandler();

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold text-foreground">Menus (kebab)</h2>
      <p className="text-sm text-muted-foreground">Pattern from AppointmentCardHeader / system-kebab-menu rule</p>
      <div className="flex items-center gap-4 p-4 rounded-lg bg-[var(--glass-bg)] border border-[var(--glass-border)]">
        <span className="text-sm text-foreground flex-1">Row with actions</span>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent"
              onClick={(e) => e.stopPropagation()}
              aria-label="Row actions"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border-border" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={noop}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={noop}>
              <Copy className="w-4 h-4 mr-2" />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={noop} className="text-red-600 dark:text-red-400">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </section>
  );
}
