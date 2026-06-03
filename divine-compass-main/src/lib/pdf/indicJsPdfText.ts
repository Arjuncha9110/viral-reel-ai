import { jsPDF } from "jspdf";

const INDIC_TEXT_RE =
  /[\u0900-\u097F\u0980-\u09FF\u0A00-\u0A7F\u0A80-\u0AFF\u0B00-\u0B7F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F]/;

const MM_PER_PX = 25.4 / 96;
const PX_PER_PT = 96 / 72;
const TEXT_RENDER_SCALE = 2;
const DEFAULT_LINE_HEIGHT_FACTOR = 1.15;

type TextAlign = "left" | "center" | "right" | "justify";

type JsPdfTextOptions = {
  align?: TextAlign;
  baseline?: string;
  lineHeightFactor?: number;
};

type RenderedText = {
  dataUrl: string;
  textWidthMm: number;
  widthMm: number;
  heightMm: number;
  ascentMm: number;
};

type FontDescriptor = {
  family: string;
  weight: number;
  style: "normal" | "italic";
};

const renderCache = new Map<string, RenderedText>();

function getCanvas(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  return canvas;
}

function getColorHex(doc: jsPDF): string {
  const raw = (doc as any).getTextColor?.() ?? "000000";
  return String(raw).startsWith("#") ? String(raw) : `#${String(raw)}`;
}

function getRequestedFont(doc: jsPDF): FontDescriptor {
  const requestedName =
    (doc as any).__indicRequestedFontName ??
    (doc as any).getFont?.()?.fontName ??
    "times";
  const requestedStyle =
    (doc as any).__indicRequestedFontStyle ??
    (doc as any).getFont?.()?.fontStyle ??
    "normal";

  const isSerif = /times|serif/i.test(String(requestedName));
  const isBold = /bold/i.test(String(requestedStyle));
  const isItalic = /italic/i.test(String(requestedStyle));

  return {
    family: isSerif
      ? '"Noto Serif Kannada","Noto Sans Kannada","Noto Sans Devanagari","Nirmala UI",serif'
      : '"Noto Sans Kannada","Noto Sans Devanagari","Nirmala UI",sans-serif',
    weight: isBold ? 700 : 400,
    style: isItalic ? "italic" : "normal",
  };
}

function getFontSizePt(doc: jsPDF): number {
  return Number((doc as any).getFontSize?.() ?? 12);
}

function getLineHeightMm(doc: jsPDF, lineHeightFactor?: number): number {
  const factor =
    typeof lineHeightFactor === "number" ? lineHeightFactor : DEFAULT_LINE_HEIGHT_FACTOR;
  const scaleFactor = (doc as any).internal?.scaleFactor ?? 2.834645669;
  return (getFontSizePt(doc) * factor) / scaleFactor;
}

function pxToMm(px: number): number {
  return px * MM_PER_PX;
}

function getGraphemes(text: string): string[] {
  if (typeof Intl !== "undefined" && typeof (Intl as any).Segmenter === "function") {
    const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    return Array.from(segmenter.segment(text), (part) => part.segment);
  }
  return Array.from(text);
}

function measureTextPx(text: string, fontSizePt: number, font: FontDescriptor): TextMetrics {
  const canvas = getCanvas();
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context is unavailable for Indic PDF text rendering.");

  const fontSizePx = fontSizePt * PX_PER_PT;
  ctx.font = `${font.style} ${font.weight} ${fontSizePx}px ${font.family}`;
  return ctx.measureText(text);
}

function renderTextImage(doc: jsPDF, text: string): RenderedText {
  const font = getRequestedFont(doc);
  const fontSizePt = getFontSizePt(doc);
  const color = getColorHex(doc);
  const cacheKey = [
    text,
    font.family,
    font.weight,
    font.style,
    fontSizePt,
    color,
  ].join("::");

  const cached = renderCache.get(cacheKey);
  if (cached) return cached;

  const metrics = measureTextPx(text, fontSizePt, font);
  const fontSizePx = fontSizePt * PX_PER_PT;
  const ascentPx = Math.max(metrics.actualBoundingBoxAscent || fontSizePx * 0.82, fontSizePx * 0.82);
  const descentPx = Math.max(metrics.actualBoundingBoxDescent || fontSizePx * 0.3, fontSizePx * 0.3);
  const paddingPx = Math.max(3, fontSizePx * 0.22);
  const widthPx = Math.max(1, Math.ceil(metrics.width + paddingPx * 2));
  const heightPx = Math.max(1, Math.ceil(ascentPx + descentPx + paddingPx * 2));

  const canvas = getCanvas();
  canvas.width = Math.ceil(widthPx * TEXT_RENDER_SCALE);
  canvas.height = Math.ceil(heightPx * TEXT_RENDER_SCALE);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context is unavailable for Indic PDF text rendering.");

  ctx.scale(TEXT_RENDER_SCALE, TEXT_RENDER_SCALE);
  ctx.clearRect(0, 0, widthPx, heightPx);
  ctx.font = `${font.style} ${font.weight} ${fontSizePx}px ${font.family}`;
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = color;
  ctx.fillText(text, paddingPx, paddingPx + ascentPx);

  const rendered = {
    dataUrl: canvas.toDataURL("image/png"),
    textWidthMm: pxToMm(metrics.width),
    widthMm: pxToMm(widthPx),
    heightMm: pxToMm(heightPx),
    ascentMm: pxToMm(paddingPx + ascentPx),
  };

  renderCache.set(cacheKey, rendered);
  return rendered;
}

function measureRenderedWidthMm(doc: jsPDF, text: string): number {
  if (!text) return 0;
  return renderTextImage(doc, text).textWidthMm;
}

function splitLongToken(doc: jsPDF, token: string, maxWidthMm: number): string[] {
  const graphemes = getGraphemes(token);
  const lines: string[] = [];
  let current = "";

  for (const grapheme of graphemes) {
    const candidate = current + grapheme;
    if (!current || measureRenderedWidthMm(doc, candidate) <= maxWidthMm) {
      current = candidate;
      continue;
    }
    lines.push(current);
    current = grapheme;
  }

  if (current) lines.push(current);
  return lines;
}

function splitIndicTextToSize(doc: jsPDF, text: string, maxWidthMm: number): string[] {
  const paragraphs = text.replace(/\r\n/g, "\n").split("\n");
  const lines: string[] = [];

  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      lines.push("");
      continue;
    }

    const words = paragraph.trim().split(/\s+/);
    let currentLine = "";

    for (const word of words) {
      const candidate = currentLine ? `${currentLine} ${word}` : word;
      if (!currentLine || measureRenderedWidthMm(doc, candidate) <= maxWidthMm) {
        currentLine = candidate;
        continue;
      }

      if (currentLine) lines.push(currentLine);

      if (measureRenderedWidthMm(doc, word) <= maxWidthMm) {
        currentLine = word;
        continue;
      }

      const brokenWordLines = splitLongToken(doc, word, maxWidthMm);
      const finalWordLine = brokenWordLines.pop();
      lines.push(...brokenWordLines);
      currentLine = finalWordLine ?? "";
    }

    if (currentLine) {
      lines.push(currentLine);
    }
  }

  return lines.length ? lines : [text];
}

function getAlignedX(x: number, widthMm: number, align: TextAlign): number {
  if (align === "center") return x - widthMm / 2;
  if (align === "right") return x - widthMm;
  return x;
}

function normalizeTextArg(text: unknown): string | string[] {
  if (Array.isArray(text)) {
    return text
      .map((line) => (line === null || line === undefined ? "" : String(line)))
      .filter((line, index, all) => line.length > 0 || all.length === 1);
  }
  if (text === null || text === undefined) {
    return "";
  }
  return String(text);
}

function drawIndicText(
  doc: jsPDF,
  text: string | string[],
  x: number,
  y: number,
  options?: JsPdfTextOptions
): jsPDF {
  const lines = Array.isArray(text) ? text.map((line) => String(line)) : [String(text)];
  const align: TextAlign = options?.align ?? "left";
  const lineAdvanceMm = getLineHeightMm(doc, options?.lineHeightFactor);

  lines.forEach((line, index) => {
    if (!line) return;
    const rendered = renderTextImage(doc, line);
    const baselineY = y + index * lineAdvanceMm;
    const drawX = getAlignedX(x, rendered.widthMm, align);
    const drawY = baselineY - rendered.ascentMm;
    doc.addImage(rendered.dataUrl, "PNG", drawX, drawY, rendered.widthMm, rendered.heightMm, undefined, "FAST");
  });

  return doc;
}

export function containsIndicText(value: unknown): boolean {
  if (Array.isArray(value)) {
    return value.some((item) => containsIndicText(item));
  }
  return typeof value === "string" && INDIC_TEXT_RE.test(value);
}

export async function installIndicTextSupport(doc: jsPDF): Promise<void> {
  if (typeof document === "undefined") return;

  try {
    await Promise.allSettled([
      document.fonts.load('400 16px "Noto Sans Kannada"'),
      document.fonts.load('700 16px "Noto Sans Kannada"'),
      document.fonts.load('400 16px "Noto Serif Kannada"'),
      document.fonts.ready,
    ]);
  } catch {
    // Browser font warmup is best-effort only.
  }

  const originalText = doc.text.bind(doc);
  const originalGetTextWidth = doc.getTextWidth.bind(doc);
  const originalSplitTextToSize = doc.splitTextToSize.bind(doc);

  (doc as any).__indicOriginalText = originalText;
  (doc as any).__indicOriginalGetTextWidth = originalGetTextWidth;
  (doc as any).__indicOriginalSplitTextToSize = originalSplitTextToSize;

  doc.getTextWidth = ((text: string) => {
    const normalized = normalizeTextArg(text);
    const flatText = Array.isArray(normalized) ? normalized.join(" ") : normalized;
    if (!containsIndicText(flatText)) {
      return originalGetTextWidth(flatText);
    }
    return measureRenderedWidthMm(doc, flatText);
  }) as typeof doc.getTextWidth;

  doc.splitTextToSize = ((text: string | string[], maxWidth: number, options?: unknown) => {
    const normalized = normalizeTextArg(text);
    if (Array.isArray(normalized) || !containsIndicText(normalized)) {
      return originalSplitTextToSize(normalized as any, maxWidth, options as any);
    }
    return splitIndicTextToSize(doc, normalized, Number(maxWidth));
  }) as typeof doc.splitTextToSize;

  doc.text = ((text: string | string[], x: number, y: number, options?: JsPdfTextOptions, transform?: unknown) => {
    const normalized = normalizeTextArg(text);
    const drawX = Number(x);
    const drawY = Number(y);

    if (!Number.isFinite(drawX) || !Number.isFinite(drawY)) {
      throw new Error(`Invalid jsPDF text coordinates: x=${String(x)}, y=${String(y)}`);
    }

    if (!containsIndicText(normalized)) {
      return originalText(normalized as any, drawX as any, drawY as any, options as any, transform as any);
    }

    if (Array.isArray(normalized) && normalized.length === 0) {
      return doc;
    }

    return drawIndicText(doc, normalized, drawX, drawY, options);
  }) as typeof doc.text;
}
