import { useEffect, useMemo, useState } from "react";
import { Database, ShieldCheck } from "lucide-react";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { CustomDialog } from "@/components/ui/custom-dialog";
import { Card } from "@/components/ui/card";
import type { CreateSystemServiceData } from "@/features/services/services/systemServices";
import { ServiceWizardHeader } from "./components/ServiceWizardHeader";
import { WizardProgress } from "./components/WizardProgress";
import { WizardDialogFooter } from "./components/WizardFooter";
import { getSystemCatalogWizardSteps } from "./stepDefinitions";
import { SystemBasicStep, SystemDefaultsStep, SystemImagesStep } from "./steps";
import type { SystemWizardProps } from "./types";
import { useAppSelector } from "@/store/hooks";
import { UserRole, isRole } from "@/shared/types/user";

export function SystemCatalogWizard({
  open,
  onOpenChange,
  title,
  mode,
  initialSystemService,
  initialStepIndex = 0,
  onSave,
}: SystemWizardProps) {
  const isEdit = mode === "edit";
  const { user } = useAppSelector((state) => state.auth);
  const isSystemAdmin = isRole(user?.role, UserRole.SYSTEM_ADMIN);
  const showUnverifiedNotice = !isSystemAdmin && !isEdit;
  const steps = useMemo(() => getSystemCatalogWizardSteps(), []);
  const [currentStep, setCurrentStep] = useState(0);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [tagIds, setTagIds] = useState<string[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [defaultDuration, setDefaultDuration] = useState("");
  const [defaultPrice, setDefaultPrice] = useState("");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!open) return;
    const maxStep = Math.max(0, steps.length - 1);
    const start = Math.min(Math.max(0, initialStepIndex), maxStep);
    setCurrentStep(start);
    if (initialSystemService) {
      setName(initialSystemService.name || "");
      setDescription(initialSystemService.description || "");
      setTagIds(
        Array.isArray(initialSystemService.tags)
          ? initialSystemService.tags.map((t) => t.id).filter((id): id is string => Boolean(id))
          : []
      );
      setImages(
        Array.isArray(initialSystemService.images)
          ? [...initialSystemService.images]
          : initialSystemService.image
            ? [initialSystemService.image]
            : []
      );
      setDefaultDuration(
        initialSystemService.defaultDuration === null || initialSystemService.defaultDuration === undefined
          ? ""
          : String(initialSystemService.defaultDuration)
      );
      setDefaultPrice(
        initialSystemService.defaultPrice === null || initialSystemService.defaultPrice === undefined
          ? ""
          : String(initialSystemService.defaultPrice)
      );
      setIsActive(Boolean(initialSystemService.isActive));
    } else {
      setName("");
      setDescription("");
      setTagIds([]);
      setImages([]);
      setDefaultDuration("");
      setDefaultPrice("");
      setIsActive(true);
    }
  }, [open, initialSystemService, initialStepIndex, steps.length]);

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

  const canContinue = currentStep === 0 ? Boolean(name.trim()) : true;

  const submit = () => {
    if (!name.trim()) return;
    const durationNum = defaultDuration.trim() === "" ? null : Number(defaultDuration);
    const priceNum = defaultPrice.trim() === "" ? null : Number(defaultPrice);
    if (defaultDuration.trim() !== "" && (!Number.isFinite(durationNum) || (durationNum as number) < 1)) {
      return;
    }
    if (defaultPrice.trim() !== "" && (!Number.isFinite(priceNum) || (priceNum as number) < 0)) {
      return;
    }
    const payload: CreateSystemServiceData = {
      name: name.trim(),
      description: description.trim() || undefined,
      images: images.length > 0 ? images : undefined,
      defaultDuration: durationNum,
      defaultPrice: priceNum,
      isActive,
      tagIds: tagIds.length > 0 ? tagIds : undefined,
    };
    onSave(payload);
    onOpenChange(false);
  };

  const catalogDescription = "Manage the shared catalog service used by company owners.";
  const step = steps[currentStep];

  const renderStepContent = () => {
    if (!step) return null;
    switch (step.id) {
      case "system-basic":
        return (
          <SystemBasicStep
            name={name}
            description={description}
            tagIds={tagIds}
            onNameChange={setName}
            onDescriptionChange={setDescription}
            onTagIdsChange={setTagIds}
          />
        );
      case "system-images":
        return (
          <SystemImagesStep
            images={images}
            onFileUploaded={addImage}
            onRemoveImage={removeImage}
            onMoveImageUp={moveImageUp}
            onMoveImageDown={moveImageDown}
          />
        );
      case "system-defaults":
        return (
          <SystemDefaultsStep
            defaultDuration={defaultDuration}
            defaultPrice={defaultPrice}
            isActive={isActive}
            onDefaultDurationChange={setDefaultDuration}
            onDefaultPriceChange={setDefaultPrice}
            onIsActiveChange={setIsActive}
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
      customHeader={
        <ServiceWizardHeader
          title={title}
          subtitle={catalogDescription}
          currentStep={currentStep}
          steps={steps}
          icon={Database}
        />
      }
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
          submitLabel={isEdit ? "Save Changes" : "Create Service"}
        />
      }
    >
      <VisuallyHidden>
        <span>System catalog service wizard: {catalogDescription}</span>
      </VisuallyHidden>

      <div className="flex flex-col h-full min-h-0 overflow-hidden">
        <div className="shrink-0 w-1/2 mx-auto">
          <WizardProgress currentStep={currentStep} steps={steps} />
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar px-3 sm:px-4 pt-2 pb-4 space-y-3">
          {showUnverifiedNotice && (
            <div className="flex items-start gap-2 rounded-lg border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3 text-xs sm:text-sm text-muted-foreground">
              <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-[var(--accent-text)]" />
              <span>
                This catalog entry will be submitted as <span className="font-medium text-foreground">unverified</span>. A
                system administrator will review and verify it before it is featured to other companies.
              </span>
            </div>
          )}
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
