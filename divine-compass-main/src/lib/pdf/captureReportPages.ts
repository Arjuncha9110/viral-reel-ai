import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

const A4_W = 210;
const A4_H = 297;
const MIN_CAPTURE_WIDTH = 794;
const MIN_CAPTURE_HEIGHT = 1123;
const SINGLE_PAGE_HEIGHT_RATIO_LIMIT = 1.35;

function waitFrame() {
  return new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

function waitMs(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

function injectFreezeStyle() {
  const style = document.createElement("style");
  style.id = "__pdf-freeze__";
  style.textContent = `
    [data-report-page="true"],
    [data-report-page="true"] *,
    [data-report-page="true"] *::before,
    [data-report-page="true"] *::after {
      animation: none !important;
      animation-play-state: paused !important;
      transition: none !important;
      caret-color: transparent !important;
      scroll-behavior: auto !important;
    }
  `;
  document.head.appendChild(style);
  return style;
}

function addCanvasAsSingleA4Page(
  pdf: jsPDF,
  canvas: HTMLCanvasElement,
  backgroundColor: string,
  hasPdfPage: boolean
) {
  if (hasPdfPage) {
    pdf.addPage();
  }

  const pageRatio = canvas.height / canvas.width;
  const canvasWidthOnPage = Math.min(A4_W, A4_H / pageRatio);
  const canvasHeightOnPage = canvasWidthOnPage * pageRatio;
  const x = (A4_W - canvasWidthOnPage) / 2;
  const y = (A4_H - canvasHeightOnPage) / 2;
  const fillColor = backgroundColor === "#07182d" ? [7, 24, 45] : [255, 250, 240];

  pdf.setFillColor(fillColor[0], fillColor[1], fillColor[2]);
  pdf.rect(0, 0, A4_W, A4_H, "F");
  const imgData = canvas.toDataURL("image/jpeg", 0.94);
  pdf.addImage(imgData, "JPEG", x, y, canvasWidthOnPage, canvasHeightOnPage, undefined, "FAST");
  return true;
}

function addCanvasAsA4Pages(
  pdf: jsPDF,
  canvas: HTMLCanvasElement,
  backgroundColor: string,
  hasPdfPage: boolean
) {
  const pageSliceHeight = Math.floor(canvas.width * (A4_H / A4_W));

  for (let y = 0; y < canvas.height; y += pageSliceHeight) {
    const visibleSliceHeight = Math.min(pageSliceHeight, canvas.height - y);
    const sliceCanvas = document.createElement("canvas");
    sliceCanvas.width = canvas.width;
    sliceCanvas.height = pageSliceHeight;

    const ctx = sliceCanvas.getContext("2d");
    if (!ctx) {
      throw new Error("Could not prepare the PDF page canvas.");
    }

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
    ctx.drawImage(
      canvas,
      0,
      y,
      canvas.width,
      visibleSliceHeight,
      0,
      0,
      canvas.width,
      visibleSliceHeight
    );

    if (hasPdfPage) {
      pdf.addPage();
    }

    const imgData = sliceCanvas.toDataURL("image/jpeg", 0.92);
    pdf.addImage(imgData, "JPEG", 0, 0, A4_W, A4_H, undefined, "FAST");
    hasPdfPage = true;
  }

  return hasPdfPage;
}

function isZeroPatternError(error: unknown) {
  if (!(error instanceof Error)) return false;
  return error.message.includes("createPattern")
    || error.message.includes("canvas element with a width or height of 0");
}

async function renderReportPageCanvas(
  page: HTMLElement,
  backgroundColor: string
) {
  const pageRect = page.getBoundingClientRect();
  const captureWidth = Math.max(MIN_CAPTURE_WIDTH, Math.ceil(pageRect.width));
  const captureHeight = Math.max(
    MIN_CAPTURE_HEIGHT,
    Math.ceil(pageRect.height),
    Math.ceil(page.scrollHeight),
    Math.ceil(page.clientHeight)
  );

  const baseOptions = {
    backgroundColor,
    scale: 2,
    useCORS: true,
    allowTaint: false,
    logging: false,
    ignoreElements: (element: Element) => {
      if (!(element instanceof HTMLElement || element instanceof SVGElement)) {
        return false;
      }

      const rect = element.getBoundingClientRect();
      return rect.width === 0 && rect.height === 0;
    },
  } satisfies Parameters<typeof html2canvas>[1];

  const html2canvasFn = typeof html2canvas === "function" ? html2canvas : (html2canvas as any).default;

  try {
    return await html2canvasFn(page, baseOptions);
  } catch (error) {
    if (!isZeroPatternError(error)) {
      throw error;
    }

    // Some SVG/background combinations intermittently trip html2canvas's
    // pattern renderer. Retrying with foreignObject rendering avoids that
    // canvas pattern path while preserving the visible layout.
    return html2canvasFn(page, {
      ...baseOptions,
      allowTaint: false,
      foreignObjectRendering: true,
      width: captureWidth,
      height: captureHeight,
    });
  }
}

export async function captureReportPages(
  container: HTMLElement,
  fileName: string,
  onProgress?: (current: number, total: number) => void
): Promise<void> {
  const pages = Array.from(container.querySelectorAll<HTMLElement>('[data-report-page="true"]'));
  if (pages.length === 0) {
    throw new Error("No report pages found in the preview.");
  }

  if (pages.some((page) => page.dataset.reportLanguage === "kn") && "fonts" in document) {
    await Promise.allSettled([
      document.fonts.load('400 16px "Noto Sans Kannada"'),
      document.fonts.load('600 16px "Noto Sans Kannada"'),
      document.fonts.load('700 18px "Noto Serif Kannada"'),
    ]);
  }

  // Wait for all fonts (incl. Devanagari / CJK) to be fully loaded before capture
  await document.fonts.ready;

  const freezeStyle = injectFreezeStyle();

  await waitFrame();
  await waitMs(300);

  const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
  let hasPdfPage = false;

  try {
    for (let i = 0; i < pages.length; i += 1) {
      const page = pages[i];
      const isDark = page.classList.contains("page-break-dark");
      const backgroundColor = isDark ? "#07182d" : "#fffaf0";

      await waitFrame();
      await waitMs(120);

      onProgress?.(i + 1, pages.length);

      const canvas = await renderReportPageCanvas(page, backgroundColor);

      const expectedSinglePageHeight = canvas.width * (A4_H / A4_W);
      const heightRatio = canvas.height / expectedSinglePageHeight;
      hasPdfPage = heightRatio <= SINGLE_PAGE_HEIGHT_RATIO_LIMIT
        ? addCanvasAsSingleA4Page(pdf, canvas, backgroundColor, hasPdfPage)
        : addCanvasAsA4Pages(pdf, canvas, backgroundColor, hasPdfPage);
    }

    pdf.save(fileName);
  } finally {
    freezeStyle.remove();
  }
}
