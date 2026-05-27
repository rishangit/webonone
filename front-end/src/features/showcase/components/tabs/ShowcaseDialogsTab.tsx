"use client";

import { useState } from "react";
import { Info, Save } from "lucide-react";
import { DeleteConfirmationDialog } from "@/components/common/DeleteConfirmationDialog";
import { ProductServiceSelectionDialog } from "@/components/common/ProductServiceSelectionDialog";
import { RightPanel } from "@/components/common/RightPanel";
import { SelectMediaDialog } from "@/components/common/SelectMediaDialog";
import { UserSelectionDialog } from "@/components/common/UserSelectionDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { CustomDialog } from "@/components/ui/custom-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { User } from "@/shared/types/user";
import { UserRole } from "@/shared/types/user";
import { notifyShowcaseOnly, showcaseFixtureProducts } from "../../fixtures";

export function ShowcaseDialogsTab() {
  const [customOpen, setCustomOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [userSelectOpen, setUserSelectOpen] = useState(false);
  const [mediaOpen, setMediaOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const demoUsers: User[] = [
    {
      id: "showcase-user-1",
      email: "alex@example.com",
      name: "Alex Rivera",
      role: UserRole.USER,
      isActive: true,
      createdAt: "2024-01-01T00:00:00Z",
    },
    {
      id: "showcase-user-2",
      email: "jordan@example.com",
      name: "Jordan Lee",
      role: UserRole.USER,
      isActive: true,
      createdAt: "2024-01-01T00:00:00Z",
    },
  ];

  const products = showcaseFixtureProducts.map((p) => ({
    id: p.id,
    name: p.name,
    description: "Demo product",
    price: p.price,
    inStock: 10,
    image: p.imageUrl,
  }));

  return (
    <div className="space-y-8 mt-6">
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Dialog shells</h2>

        <Card className="bg-[var(--glass-bg)] border-[var(--glass-border)]">
          <CardHeader>
            <CardTitle>CustomDialog</CardTitle>
            <CardDescription>Standard footer per dialog-windows rule</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={() => setCustomOpen(true)}>
              Open CustomDialog
            </Button>
            <CustomDialog
              open={customOpen}
              onOpenChange={setCustomOpen}
              title="Custom dialog"
              description="Compliant footer with h-10 actions"
              icon={<Info className="h-5 w-5" />}
              footer={
                <div className="flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    className="h-10 px-4 border-[var(--glass-border)] text-foreground hover:bg-accent"
                    onClick={() => setCustomOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button variant="accent" className="h-10" onClick={() => { notifyShowcaseOnly(); setCustomOpen(false); }}>
                    <Save className="w-4 h-4 mr-2" />
                    Save
                  </Button>
                </div>
              }
            >
              <p className="text-sm text-muted-foreground">Dialog body uses theme tokens and glass surfaces.</p>
            </CustomDialog>
          </CardContent>
        </Card>

        <Card className="bg-[var(--glass-bg)] border-[var(--glass-border)]">
          <CardHeader>
            <CardTitle>AlertDialog</CardTitle>
          </CardHeader>
          <CardContent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Open AlertDialog</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirm action</AlertDialogTitle>
                  <AlertDialogDescription>This is a destructive confirmation pattern.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => notifyShowcaseOnly()}>Continue</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        <Card className="bg-[var(--glass-bg)] border-[var(--glass-border)]">
          <CardHeader>
            <CardTitle>Sheet & Popover & RightPanel</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline">Open Sheet</Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Sheet</SheetTitle>
                  <SheetDescription>Side panel pattern</SheetDescription>
                </SheetHeader>
                <div className="mt-4 space-y-2">
                  <Label>Name</Label>
                  <Input placeholder="Name" className="bg-[var(--input-background)] border-[var(--glass-border)]" />
                </div>
              </SheetContent>
            </Sheet>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline">Open Popover</Button>
              </PopoverTrigger>
              <PopoverContent>
                <p className="text-sm font-medium">Popover</p>
                <p className="text-sm text-muted-foreground">Contextual content</p>
              </PopoverContent>
            </Popover>
            <Button variant="outline" onClick={() => setRightPanelOpen(true)}>
              Open RightPanel
            </Button>
            <RightPanel open={rightPanelOpen} onOpenChange={setRightPanelOpen} title="Right panel">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="rp-1" />
                  <Label htmlFor="rp-1">Filter option</Label>
                </div>
              </div>
            </RightPanel>
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">Common dialogs</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => setDeleteOpen(true)}>
            DeleteConfirmationDialog
          </Button>
          <Button variant="outline" onClick={() => setUserSelectOpen(true)}>
            UserSelectionDialog
          </Button>
          <Button variant="outline" onClick={() => setMediaOpen(true)}>
            SelectMediaDialog
          </Button>
          <Button variant="outline" onClick={() => setProductOpen(true)}>
            ProductServiceSelectionDialog
          </Button>
        </div>

        <DeleteConfirmationDialog
          open={deleteOpen}
          onOpenChange={setDeleteOpen}
          onConfirm={() => notifyShowcaseOnly()}
          itemName="Demo item"
          itemType="Item"
        />

        <UserSelectionDialog
          open={userSelectOpen}
          onOpenChange={setUserSelectOpen}
          value={selectedUserId}
          onChange={(id) => {
            setSelectedUserId(id);
            notifyShowcaseOnly();
          }}
          users={demoUsers}
        />

        <SelectMediaDialog
          open={mediaOpen}
          onOpenChange={setMediaOpen}
          companyId="showcase-company-1"
          onSelect={() => notifyShowcaseOnly()}
        />

        <ProductServiceSelectionDialog
          open={productOpen}
          onOpenChange={setProductOpen}
          products={products}
          services={[]}
          selectionMode="productsOnly"
          onSelectProduct={() => notifyShowcaseOnly()}
          onSelectService={() => notifyShowcaseOnly()}
          formatCurrency={(n) => `$ ${n.toFixed(2)}`}
        />
      </section>
    </div>
  );
}
