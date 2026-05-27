import { toast } from "sonner";

const SHOWCASE_TOAST = "Showcase only — no data saved";

export function notifyShowcaseOnly(message = SHOWCASE_TOAST): void {
  toast.info(message);
}

export function createShowcaseNoopHandler(_label?: string): () => void {
  return () => notifyShowcaseOnly();
}
