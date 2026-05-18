import { useEffect, useMemo, useState } from "react";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { CustomDialog } from "@/components/ui/custom-dialog";
import { Card } from "@/components/ui/card";
import type { Service } from "@/features/services/services";
import { getCompanyProductDefaultUnitPrice } from "@/features/services/utils/serviceProductPricing";
import { ServiceWizardHeader } from "./components/ServiceWizardHeader";
import { WizardProgress } from "./components/WizardProgress";
import { WizardDialogFooter } from "./components/WizardFooter";
import { getCompanyWizardSteps } from "./stepDefinitions";
import { CompanyBasicStep, CompanyImagesStep, CompanyProductsStep } from "./steps";
import type { CompanyWizardProps, DefaultProductRow } from "./types";

export function CompanyServiceWizard({
  open,
  onOpenChange,
  title,
  companyId,
  availableProducts,
  initialService,
  selectedSystemCatalog,
  initialStepIndex = 0,
  onSave,
}: CompanyWizardProps) {
  const isEdit = Boolean(initialService);
  const steps = useMemo(() => getCompanyWizardSteps(), []);
  const [currentStep, setCurrentStep] = useState(0);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Service["status"]>("Active");
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [defaultProducts, setDefaultProducts] = useState<DefaultProductRow[]>([]);
  const [linkedSystemServiceId, setLinkedSystemServiceId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const maxStep = Math.max(0, steps.length - 1);
    setCurrentStep(Math.min(Math.max(0, initialStepIndex), maxStep));

    if (initialService) {
      setLinkedSystemServiceId(initialService.systemServiceId ?? null);
      setName(initialService.name || "");
      setDescription(initialService.description || "");
      setStatus(initialService.status || "Active");
      setTagIds(
        Array.isArray(initialService.tags)
          ? initialService.tags.map((tag) => (typeof tag === "string" ? tag : tag.id)).filter((id): id is string => Boolean(id))
          : []
      );
      setImages(initialService.images || (initialService.image ? [initialService.image] : []));
      setDuration(initialService.duration ? String(initialService.duration) : "");
      setPrice(initialService.price ? String(initialService.price) : "");
      setDefaultProducts(
        initialService.defaultProducts?.map((p) => {
          const parsedQty = Number(p.quantity);
          return {
            companyProductId: p.companyProductId,
            quantity: Number.isFinite(parsedQty) ? parsedQty : 1,
            discount: typeof p.discount === "number" ? Math.max(0, Math.min(100, p.discount)) : 0,
          };
        }) || []
      );
      return;
    }

    if (selectedSystemCatalog) {
      setLinkedSystemServiceId(selectedSystemCatalog.id);
      setName(selectedSystemCatalog.name || "");
      setDescription(selectedSystemCatalog.description || "");
      setStatus("Active");
      setTagIds(
        Array.isArray(selectedSystemCatalog.tags)
          ? selectedSystemCatalog.tags.map((t) => t.id).filter((id): id is string => Boolean(id))
          : []
      );
      setImages(
        Array.isArray(selectedSystemCatalog.images) && selectedSystemCatalog.images.length > 0
          ? [...selectedSystemCatalog.images]
          : selectedSystemCatalog.image
            ? [selectedSystemCatalog.image]
            : []
      );
      setDuration(
        selectedSystemCatalog.defaultDuration != null && selectedSystemCatalog.defaultDuration !== undefined
          ? String(selectedSystemCatalog.defaultDuration)
          : ""
      );
      setPrice(
        selectedSystemCatalog.defaultPrice != null && selectedSystemCatalog.defaultPrice !== undefined
          ? String(selectedSystemCatalog.defaultPrice)
          : ""
      );
      setDefaultProducts([]);
      return;
    }

    setLinkedSystemServiceId(null);
    setName("");
    setDescription("");
    setStatus("Active");
    setTagIds([]);
    setImages([]);
    setDuration("");
    setPrice("");
    setDefaultProducts([]);
  }, [open, initialService, selectedSystemCatalog, initialStepIndex, steps.length]);

  const folderPath = `companies/${companyId}/services`;

  const totals = useMemo(() => {
    let productsTotal = 0;
    const rows = defaultProducts.map((row) => {
      const product = availableProducts.find((p) => p.id === row.companyProductId);
      const unitPrice = product ? getCompanyProductDefaultUnitPrice(product) : 0;
      const discountPct = Math.max(0, Math.min(100, Number(row.discount) || 0));
      const rowTotal = unitPrice * row.quantity * (1 - discountPct / 100);
      productsTotal += rowTotal;
      return { row, product, unitPrice, rowTotal };
    });
    return { rows, productsTotal };
  }, [defaultProducts, availableProducts]);

  const addImage = (path: string) => setImages((prev) => [...prev, path]);
  const removeImage = (index: number) => setImages((prev) => prev.filter((_, i) => i !== index));

  const moveImageUp = (index: number) => {
    if (index <= 0) return;
    setImages((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const moveImageDown = (index: number) => {
    setImages((prev) => {
      if (index >= prev.length - 1) return prev;
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  const appendProductById = (companyProductId: string) => {
    setDefaultProducts((prev) => {
      if (prev.some((r) => r.companyProductId === companyProductId)) return prev;
      return [...prev, { companyProductId, quantity: 1, discount: 0 }];
    });
  };

  const updateDefaultProduct = (index: number, patch: Partial<DefaultProductRow>) => {
    setDefaultProducts((prev) => prev.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const removeDefaultProduct = (index: number) => {
    setDefaultProducts((prev) => prev.filter((_, i) => i !== index));
  };

  const canContinue =
    currentStep === 0
      ? Boolean(name.trim())
      : currentStep === 2
        ? Boolean(
            duration.trim() &&
              price.trim() &&
              defaultProducts.length > 0 &&
              defaultProducts.every((r) => Number(r.quantity) > 0)
          )
        : true;

  const submit = () => {
    const durationNum = Number(duration);
    const priceNum = Number(price);
    if (!name.trim() || !Number.isFinite(durationNum) || durationNum < 1 || !Number.isFinite(priceNum) || priceNum < 0) {
      return;
    }
    if (defaultProducts.length < 1) {
      return;
    }
    onSave({
      systemServiceId: linkedSystemServiceId || undefined,
      name: name.trim(),
      description: description.trim() || undefined,
      status,
      images,
      tagIds: tagIds.length > 0 ? tagIds : undefined,
      defaultProducts: defaultProducts.map((row) => {
        const qty = Number(row.quantity);
        return {
          companyProductId: row.companyProductId,
          quantity: Number.isFinite(qty) && qty > 0 ? qty : 1,
          ...(row.discount && row.discount > 0 ? { discount: Math.max(0, Math.min(100, row.discount)) } : {}),
        };
      }),
      duration: durationNum,
      price: priceNum,
    });
    onOpenChange(false);
  };

  const dialogDescription = isEdit ? "Update your service in three steps." : "Create a new service in three steps.";
  const step = steps[currentStep];

  const renderStepContent = () => {
    if (!step) return null;
    switch (step.id) {
      case "company-basic":
        return (
          <CompanyBasicStep
            name={name}
            description={description}
            tagIds={tagIds}
            onNameChange={setName}
            onDescriptionChange={setDescription}
            onTagIdsChange={setTagIds}
          />
        );
      case "company-images":
        return (
          <CompanyImagesStep
            folderPath={folderPath}
            images={images}
            onFileUploaded={addImage}
            onRemoveImage={removeImage}
            onMoveImageUp={moveImageUp}
            onMoveImageDown={moveImageDown}
          />
        );
      case "company-products":
        return (
          <CompanyProductsStep
            availableProducts={availableProducts}
            duration={duration}
            price={price}
            totals={totals}
            onAppendProduct={appendProductById}
            onUpdateDefaultProduct={updateDefaultProduct}
            onRemoveDefaultProduct={removeDefaultProduct}
            onDurationChange={setDuration}
            onPriceChange={setPrice}
            formatCurrency={(n) => {
              const v = Number(n) || 0;
              return v.toFixed(2);
            }}
          />
        );
      default:
        return null;
    }
  };

  const StepIcon = step?.icon;

  return (
    <CustomDialog
      open={open}
      onOpenChange={onOpenChange}
      customHeader={<ServiceWizardHeader title={title} subtitle={dialogDescription} currentStep={currentStep} steps={steps} />}
      sizeWidth="large"
      sizeHeight="xlarge"
      className="overflow-hidden backdrop-blur-sm bg-background dark:bg-[var(--glass-bg)] border-[var(--glass-border)] custom-scrollbar p-0 flex flex-col"
      disableContentScroll
      noContentPadding
      footer={
        <WizardDialogFooter
          onCancel={() => onOpenChange(false)}
          stepIndex={currentStep}
          stepCount={steps.length}
          onBack={() => setCurrentStep((s) => s - 1)}
          onNext={() => setCurrentStep((s) => s + 1)}
          nextDisabled={!canContinue}
          onSubmit={submit}
          submitLabel={isEdit ? "Update Service" : "Create Service"}
        />
      }
    >
      <VisuallyHidden>
        <span>Company service wizard: {dialogDescription}</span>
      </VisuallyHidden>

      <div className="flex flex-col h-full min-h-0 overflow-hidden">
        <div className="shrink-0 w-1/2 mx-auto">
          <WizardProgress currentStep={currentStep} steps={steps} />
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-3 sm:px-4 pt-2 pb-4">
          <Card className="flex flex-col p-3 sm:p-4 backdrop-blur-sm bg-[var(--glass-bg)] border border-[var(--glass-border)]">
            {StepIcon && (
              <div className="shrink-0 flex items-center gap-2 mb-3 sm:mb-4 border-b border-[var(--glass-border)] pb-3">
                <StepIcon className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--accent-text)]" />
                <h3 className="text-sm sm:text-base font-semibold text-foreground">{step.title}</h3>
              </div>
            )}
            <div className="flex-1">{renderStepContent()}</div>
          </Card>
        </div>
      </div>
    </CustomDialog>
  );
}
