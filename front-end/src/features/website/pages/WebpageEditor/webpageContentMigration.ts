import { ensureAddonLayouts } from "./addons/addonGridUtils";
import type { ContentAddon, ContentBlock, ContentContainerSettings, EditorContent } from "./types";
import type { VisualWebEditorSnapshot } from "./VisualWebEditor";

/** Saved webpage or header JSON (same shape). Accepts API loose typing. */
export type SavedVisualContent =
  | {
      blocks?: ContentBlock[] | Record<string, unknown>[];
      contentContainer?: ContentContainerSettings;
      html?: string;
      css?: string;
      js?: string;
    }
  | null
  | undefined;

/** Normalize saved webpage/header JSON into blocks + editor HTML/CSS/JS for VisualWebEditor. */
export function webPageContentToSnapshot(content: SavedVisualContent): VisualWebEditorSnapshot {
  if (!content) {
    return {
      contentBlocks: [],
      editorContent: { html: "", css: "", js: "" },
      contentContainer: undefined,
    };
  }

  const savedContent = content;
  let contentBlocks: ContentBlock[] = [];

  if (savedContent.blocks && Array.isArray(savedContent.blocks)) {
    contentBlocks = savedContent.blocks.map((block) => {
      let next: ContentBlock & { width?: number } = {
        ...(block as ContentBlock & { width?: number }),
      };
      if (!next.colSpan && next.width) {
        const defaultContainerWidth = 1200;
        const columnWidth = defaultContainerWidth / 12;
        const colSpan = Math.round(next.width / columnWidth);
        next = { ...next, colSpan: Math.max(1, Math.min(12, colSpan)) };
      }
      next = { ...next, colSpan: next.colSpan || 4 };
      const rawAddons = Array.isArray(next.addons) ? next.addons : [];
      return {
        ...next,
        addons: ensureAddonLayouts(rawAddons as ContentAddon[]),
      };
    }) as ContentBlock[];
  }

  const editorContent: EditorContent = {
    html: savedContent.html || "",
    css: savedContent.css || "",
    js: savedContent.js || "",
  };

  const contentContainer =
    savedContent.contentContainer && typeof savedContent.contentContainer === "object"
      ? (savedContent.contentContainer as ContentContainerSettings)
      : undefined;

  return { contentBlocks, editorContent, contentContainer };
}
