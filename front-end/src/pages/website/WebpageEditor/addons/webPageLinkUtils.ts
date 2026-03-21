import type { CompanyWebPage } from "../../../../services/companyWebPages";
import type { ButtonContentAddonData } from "../types";

/** Normalize stored page URL to a path starting with `/` (matches preview / public routes). */
export function normalizeWebPagePath(url: string): string {
  let p = url.trim();
  if (p.startsWith("http://") || p.startsWith("https://")) {
    try {
      p = new URL(p).pathname;
    } catch {
      /* keep */
    }
  }
  if (!p.startsWith("/")) p = `/${p}`;
  return p;
}

/** In-app public URL for a company web page (`/web/:companyId/...`). */
export function buildPublicWebPageHref(companyId: string | undefined, pagePath: string): string {
  if (!companyId) return "#";
  const norm = normalizeWebPagePath(pagePath);
  return `/web/${companyId}${norm}`;
}

/** Resolve href for button addon: prefer live page list by id, else snapshot path. */
export function resolveButtonLinkHref(
  data: ButtonContentAddonData,
  companyId?: string,
  companyWebPages?: CompanyWebPage[]
): string | null {
  if (!companyId) return null;
  let path: string | undefined;
  if (data.linkWebPageId) {
    const p = companyWebPages?.find((wp) => wp.id === data.linkWebPageId);
    path = p?.url;
  }
  if (!path?.trim() && data.linkPagePublicPath?.trim()) {
    path = data.linkPagePublicPath;
  }
  if (!path?.trim()) return null;
  return buildPublicWebPageHref(companyId, path);
}
