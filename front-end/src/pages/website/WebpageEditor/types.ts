export interface WebpageEditorProps {
  pageId: string;
  onSave?: () => void;
  onCancel?: () => void;
}

export interface EditorContent {
  html: string;
  css: string;
  js?: string;
}

export interface EditorState {
  content: EditorContent;
  isDirty: boolean;
  isSaving: boolean;
}

export type ViewMode = 'visual' | 'edit';

/** Grid-based layout for one breakpoint - matches CSS grid-area (row / col / span row / span col) */
export interface BreakpointLayout {
  gridRowStart: number;    // 1-based
  gridColumnStart: number; // 1-based, 1–12
  rowSpan: number;
  colSpan: number;        // 1–12
}

/** Legacy pixel-based layout (we convert to grid when resolving) */
export interface LegacyBreakpointLayout {
  x?: number;
  y?: number;
  height?: number;
  colSpan?: number;
  gridRowStart?: number;
  gridColumnStart?: number;
  rowSpan?: number;
}

/** Breakpoint names matching Tailwind (sm, md, lg, xl, 2xl) */
export type BreakpointName = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/** Layout overrides per screen size - store grid values so saved data matches rendered grid-area */
export type LayoutByBreakpoint = Partial<Record<BreakpointName, LegacyBreakpointLayout | BreakpointLayout>>;

/** Per-block display settings (e.g. background color) */
export interface ContentBlockSettings {
  backgroundColor?: string;
}

export type ContentAddonType = 'image' | 'text' | 'button' | (string & {});

export interface ContentAddonBaseData {
  companyId?: string;
  contentElementId?: string;
}

export interface ImageContentAddonData extends ContentAddonBaseData {
  imagePath: string;
  view: 'best-fit' | 'full-width';
  /** Optional fixed height in px. If missing/empty => auto height. */
  height?: number;
}

/** Theme text style name from `themeData.textSettings` (or font fallback). */
export interface TextContentAddonData extends ContentAddonBaseData {
  text: string;
  textStyleName: string;
  /**
   * Snapshot of the selected theme text style at save time — used for public view
   * when theme list is not loaded (e.g. unauthenticated).
   */
  googleFontUrl?: string;
  fontFamily?: string;
  fontSize?: string;
  fontColor?: string;
}

/** Theme button (`themeData.buttons`) — `buttonName` selects the style. */
export interface ButtonContentAddonData extends ContentAddonBaseData {
  /** Visible label on the button */
  label: string;
  /** Matches `ThemeButtonSetting.buttonName` */
  buttonName: string;
  backgroundColor?: string;
  fontColor?: string;
  textStyleName?: string;
  borderColor?: string;
  borderRadius?: string;
  /** Snapshot of label typography when theme is unavailable */
  labelFontFamily?: string;
  labelFontSize?: string;
  labelFontColor?: string;
  labelGoogleFontUrl?: string;
  /** Target company web page id (from Website → Webpages). */
  linkWebPageId?: string;
  /** Snapshot of `CompanyWebPage.url` at save time for public view when page list is not loaded. */
  linkPagePublicPath?: string;
}

export type ContentAddonData = ImageContentAddonData | TextContentAddonData | ButtonContentAddonData;

/**
 * Inner 12-column grid inside a content block (same model as page blocks).
 * Row height is fixed (e.g. 60px) per grid row unit; `rowSpan` stacks units.
 */
export interface AddonGridLayout {
  gridRowStart: number;
  gridColumnStart: number;
  rowSpan: number;
  colSpan: number;
}

export interface ContentAddon {
  id: string;
  type: ContentAddonType;
  data: ContentAddonData;
  layout?: AddonGridLayout;
  /** Stacking order inside the content block (higher = more in front). */
  zIndex?: number;
}

export interface ContentBlock {
  id: string;
  content: string;
  type?: string;
  /** Base layout (2xl). Prefer grid fields; x,y,height,colSpan kept for legacy. */
  gridRowStart?: number;
  gridColumnStart?: number;
  rowSpan?: number;
  colSpan?: number;
  /** Legacy base position/size - used when grid fields missing (e.g. old saved data) */
  x?: number;
  y?: number;
  height?: number;
  /** Position and size per breakpoint (sm, md, lg, xl, 2xl). Stored as grid (gridRowStart, gridColumnStart, rowSpan, colSpan). */
  layoutByBreakpoint?: LayoutByBreakpoint;
  /** Display settings (background color, etc.) - saved with the block */
  settings?: ContentBlockSettings;
  /** Addons attached to this content block */
  addons?: ContentAddon[];
  /** Stacking order on the page canvas (higher = more in front when blocks overlap). */
  zIndex?: number;
  responsiveCols?: { sm?: number; md?: number; lg?: number; xl?: number };
  width?: number;
}

const BREAKPOINT_ORDER: BreakpointName[] = ['sm', 'md', 'lg', 'xl', '2xl'];

const DEFAULT_ROW_HEIGHT = 60;
const DEFAULT_CONTAINER_WIDTH = 1200;

function isGridLayout(l: LegacyBreakpointLayout | BreakpointLayout | undefined): l is BreakpointLayout {
  return !!(
    l &&
    typeof (l as BreakpointLayout).gridRowStart === 'number' &&
    typeof (l as BreakpointLayout).gridColumnStart === 'number' &&
    typeof (l as BreakpointLayout).rowSpan === 'number' &&
    typeof (l as BreakpointLayout).colSpan === 'number'
  );
}

function legacyToGrid(
  x: number,
  y: number,
  height: number,
  colSpan: number,
  rowHeight = DEFAULT_ROW_HEIGHT,
  containerWidth = DEFAULT_CONTAINER_WIDTH
): BreakpointLayout {
  const padding = 20;
  const availableWidth = containerWidth - padding * 2;
  const adjustedX = Math.max(0, x - padding);
  const gridColumnStart = Math.max(1, Math.min(12, Math.floor((adjustedX / availableWidth) * 12) + 1));
  const gridRowStart = Math.max(1, Math.floor(y / rowHeight) + 1);
  const rowSpan = Math.max(1, Math.ceil(height / rowHeight));
  return {
    gridRowStart,
    gridColumnStart: Math.max(1, Math.min(13 - colSpan, gridColumnStart)),
    rowSpan,
    colSpan: Math.max(1, Math.min(12, colSpan)),
  };
}

/**
 * Resolve layout for a breakpoint. Returns grid-based layout (gridRowStart, gridColumnStart, rowSpan, colSpan)
 * so rendering can use it directly as grid-area. Converts legacy x,y,height,colSpan when present.
 */
export function resolveBlockLayout(
  block: ContentBlock,
  breakpoint: BreakpointName,
  rowHeight = DEFAULT_ROW_HEIGHT,
  containerWidth = DEFAULT_CONTAINER_WIDTH
): BreakpointLayout {
  const baseGrid: BreakpointLayout = block.gridRowStart != null && block.gridColumnStart != null && block.rowSpan != null && block.colSpan != null
    ? {
        gridRowStart: block.gridRowStart,
        gridColumnStart: block.gridColumnStart,
        rowSpan: block.rowSpan,
        colSpan: Math.max(1, Math.min(12, block.colSpan)),
      }
    : legacyToGrid(
        block.x ?? 0,
        block.y ?? 0,
        block.height ?? 120,
        block.colSpan ?? 4,
        rowHeight,
        containerWidth
      );

  const map = block.layoutByBreakpoint;
  if (!map) return baseGrid;

  const idx = BREAKPOINT_ORDER.indexOf(breakpoint);
  for (let i = idx; i < BREAKPOINT_ORDER.length; i++) {
    const bp = BREAKPOINT_ORDER[i];
    const layout = map[bp];
    if (!layout) continue;
    if (isGridLayout(layout)) {
      return {
        gridRowStart: layout.gridRowStart,
        gridColumnStart: layout.gridColumnStart,
        rowSpan: layout.rowSpan,
        colSpan: Math.max(1, Math.min(12, layout.colSpan)),
      };
    }
    if (
      typeof layout.x === 'number' &&
      typeof layout.y === 'number' &&
      typeof layout.height === 'number' &&
      typeof layout.colSpan === 'number'
    ) {
      return legacyToGrid(layout.x, layout.y, layout.height, layout.colSpan, rowHeight, containerWidth);
    }
  }
  return baseGrid;
}

/** Get breakpoint name from viewport width (px). */
export function getBreakpointFromWidth(width: number): BreakpointName {
  if (width >= 1536) return '2xl';
  if (width >= 1280) return 'xl';
  if (width >= 1024) return 'lg';
  if (width >= 768) return 'md';
  if (width >= 640) return 'sm';
  return 'sm';
}
