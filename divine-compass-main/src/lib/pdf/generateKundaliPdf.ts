// ──────────────────────────────────────────────────────────────────────────────
// Kundali PDF Generator — jsPDF-based client-side generation
// Rebuilt to match the React live preview 100% identical page-for-page
// ──────────────────────────────────────────────────────────────────────────────
import jsPDF from "jspdf";
import {
  buildSharedReportData,
  SharedBirthData,
  chunkEntries,
  getRashiSanskritName,
  getRashiTemperament,
  getRashiCareer,
  getRashiRelationship,
  getChandraMandate,
  getNakshatraSymbolism,
  getNakshatraDeity,
  getNakshatraPersonality,
  getNakshatraRemedies,
  shortPlanetName
} from "./sharedReportModel";
import { containsIndicText } from "./indicJsPdfText";
import { lookupTranslation } from "./preTranslate";
import { getPlanetDignity, getDignityMarker } from "../astro/chartPresentation";

// ─── PDF Layout Constants ────────────────────────────────────────────────────
const W = 210; // A4 width mm
const H = 297; // A4 height mm
const ML = 15; // margin left
const MR = 15; // margin right
const MT = 20; // margin top
const CW = W - ML - MR; // content width = 180mm

// Premium print palette
const C_CREAM      = [255, 250, 240] as const;
const C_MAROON     = [123, 45, 54]   as const;
const C_NAVY       = [27, 45, 69]    as const;
const C_GREEN      = [13, 107, 44]   as const;
const C_GOLD       = [215, 185, 106] as const;
const C_GOLD_DARK  = [154, 106, 36]  as const;
const C_TEXT       = [47, 55, 68]    as const;
const C_MUTED      = [110, 91, 76]   as const;
const C_LIGHT_ALT  = [247, 236, 217] as const;
const C_WHITE      = [255, 255, 255] as const;

// ─── Color & Drawing Helpers ─────────────────────────────────────────────────
function setColor(doc: jsPDF, c: readonly [number, number, number]) {
  doc.setTextColor(c[0], c[1], c[2]);
}

function setFill(doc: jsPDF, c: readonly [number, number, number]) {
  doc.setFillColor(c[0], c[1], c[2]);
}

function setDraw(doc: jsPDF, c: readonly [number, number, number]) {
  doc.setDrawColor(c[0], c[1], c[2]);
}

function applyPageBackground(doc: jsPDF) {
  setFill(doc, C_CREAM);
  doc.rect(0, 0, W, H, "F");
  setDraw(doc, C_GOLD);
  doc.setLineWidth(0.18);
  doc.circle(W / 2, H / 2, 54, "D");
  doc.circle(W / 2, H / 2, 65, "D");
}

function wrap(doc: jsPDF, text: string, maxWidth: number): string[] {
  return doc.splitTextToSize(text, maxWidth);
}

function drawGoldenMandala(doc: jsPDF, cx: number, cy: number, r: number) {
  setDraw(doc, C_GOLD);
  doc.setLineWidth(0.3);
  doc.circle(cx, cy, r, "D");
  doc.circle(cx, cy, r - 3, "D");
  doc.circle(cx, cy, r - 7, "D");
  doc.circle(cx, cy, r - 12, "D");
  doc.circle(cx, cy, r - 13.5, "D");

  for (let i = 0; i < 16; i++) {
    const angle = (i * Math.PI) / 8;
    const x1 = cx + (r - 12) * Math.cos(angle);
    const y1 = cy + (r - 12) * Math.sin(angle);
    const x2 = cx + r * Math.cos(angle);
    const y2 = cy + r * Math.sin(angle);
    doc.line(x1, y1, x2, y2);
  }
}

function drawAstroDivider(doc: jsPDF, y: number) {
  setDraw(doc, C_GOLD);
  doc.setLineWidth(0.4);
  const midX = W / 2;
  doc.line(ML + 10, y, midX - 8, y);
  doc.line(midX + 8, y, W - MR - 10, y);
  setFill(doc, C_MAROON);
  doc.circle(midX, y, 2.5, "FD");
  setDraw(doc, C_GOLD);
  doc.circle(midX - 4, y, 1, "D");
  doc.circle(midX + 4, y, 1, "D");
}

function addSectionHeader(doc: jsPDF, title: string, subtitle: string, y: number, t: (txt: string) => string): number {
  const translatedTitle = t(title);
  const translatedSubtitle = t(subtitle);
  const titleLines = wrap(doc, translatedTitle, CW - 12);
  const subtitleLines = wrap(doc, translatedSubtitle, CW - 12);
  const titleLineH = containsIndicText(translatedTitle) ? 6.2 : 5.2;
  const subtitleLineH = containsIndicText(translatedSubtitle) ? 5.2 : 4.4;
  const contentHeight =
    5 +
    titleLines.length * titleLineH +
    1.5 +
    subtitleLines.length * subtitleLineH +
    4;
  const blockHeight = Math.max(18, contentHeight);

  setFill(doc, C_LIGHT_ALT);
  doc.rect(ML, y - 4, CW, blockHeight, "F");

  setFill(doc, C_MAROON);
  doc.rect(ML, y - 4, 3, blockHeight, "F");

  setColor(doc, C_MAROON);
  doc.setFont("times", "bold");
  doc.setFontSize(13);
  let textY = y + 4;
  for (const line of titleLines) {
    doc.text(line, ML + 6, textY);
    textY += titleLineH;
  }

  setColor(doc, C_TEXT);
  doc.setFont("times", "italic");
  doc.setFontSize(8.5);
  for (const line of subtitleLines) {
    doc.text(line, ML + 6, textY);
    textY += subtitleLineH;
  }

  setDraw(doc, C_GOLD);
  doc.setLineWidth(0.4);
  doc.line(ML, y - 4 + blockHeight, ML + CW, y - 4 + blockHeight);

  return y - 4 + blockHeight + 6;
}

function addParagraph(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxW: number,
  t: (txt: string) => string,
  lineH = 5.2
): number {
  const translatedText = t(text);
  const lines = wrap(doc, translatedText, maxW);
  const isIndic = containsIndicText(translatedText);
  const actualLineH = isIndic ? 6.2 : lineH;

  setColor(doc, C_TEXT);
  doc.setFont("times", "normal");
  doc.setFontSize(9.5);

  for (const line of lines) {
    doc.text(line, x, y);
    y += actualLineH;
  }
  return y;
}

function addLabelAndParagraph(
  doc: jsPDF,
  label: string,
  paragraph: string,
  y: number,
  t: (txt: string) => string,
  sectionTitle: string,
  startNewPage: (title: string) => number,
  language: "en" | "kn"
): number {
  const translatedParagraph = t(paragraph);
  const fontSize = 9.5;
  const lineH = language === "kn" ? 5.8 : 5.2;
  const labelH = 5;
  const paraH = measureWrappedTextHeight(doc, translatedParagraph, CW, fontSize, lineH);
  const totalH = labelH + paraH + 4;
  
  if (y + totalH > H - 14) {
    y = startNewPage(sectionTitle);
  }
  
  y = addLabel(doc, label, ML, y, t);
  y = addParagraph(doc, paragraph, ML, y, CW, t, lineH) + 4;
  return y;
}

function addLabel(doc: jsPDF, label: string, x: number, y: number, t: (txt: string) => string): number {
  setColor(doc, C_MAROON);
  doc.setFont("times", "bold");
  doc.setFontSize(9.5);
  doc.text(t(label), x, y);
  return y + 5;
}

function addInfoBox(doc: jsPDF, rows: [string, string][], x: number, y: number, boxW: number, t: (txt: string) => string): number {
  // Measure every row first so we can size the box correctly for Kannada
  const PAD = 5;
  const keyW = boxW * 0.42;
  const valW = boxW - keyW - PAD * 2 - 2;
  const rowSpecs: { kLines: string[]; vLines: string[]; rowH: number }[] = [];
  for (const [k, v] of rows) {
    const kTxt = t(k);
    const vTxt = t(v);
    doc.setFont("times", "bold"); doc.setFontSize(8.5);
    const kLines = wrap(doc, kTxt, keyW);
    const kLineH = containsIndicText(kTxt) ? 5.2 : 4.6;
    doc.setFont("times", "bold"); doc.setFontSize(9);
    const vLines = wrap(doc, vTxt, valW);
    const vLineH = containsIndicText(vTxt) ? 5.2 : 4.6;
    const rowH = Math.max(kLines.length * kLineH, vLines.length * vLineH) + 3;
    rowSpecs.push({ kLines, vLines, rowH });
  }
  const totalInner = rowSpecs.reduce((s, r) => s + r.rowH, 0);
  const boxH = totalInner + 8;

  setFill(doc, C_LIGHT_ALT);
  doc.roundedRect(x, y, boxW, boxH, 1, 1, "F");
  setDraw(doc, C_GOLD);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, boxW, boxH, 1, 1, "D");

  let iy = y + 6;
  for (const { kLines, vLines, rowH } of rowSpecs) {
    setColor(doc, C_MUTED); doc.setFont("times", "bold"); doc.setFontSize(8.5);
    const kLineH = containsIndicText(kLines.join("")) ? 5.2 : 4.6;
    kLines.forEach((line, li) => doc.text(line, x + PAD, iy + li * kLineH));
    setColor(doc, C_MAROON); doc.setFont("times", "bold"); doc.setFontSize(9);
    const vLineH = containsIndicText(vLines.join("")) ? 5.2 : 4.6;
    vLines.forEach((line, li) => doc.text(line, x + boxW - PAD, iy + li * vLineH, { align: "right" }));
    iy += rowH;
  }
  return y + boxH + 4;
}

// Returns only the height of the box (without the +4 gap) — used for pre-measuring side-by-side boxes
function measureInfoBoxHeight(doc: jsPDF, rows: [string, string][], boxW: number, t: (txt: string) => string): number {
  const PAD = 5;
  const keyW = boxW * 0.42;
  const valW = boxW - keyW - PAD * 2 - 2;
  let total = 0;
  for (const [k, v] of rows) {
    const kTxt = t(k); const vTxt = t(v);
    doc.setFont("times", "bold"); doc.setFontSize(8.5);
    const kLines = wrap(doc, kTxt, keyW);
    const kLineH = containsIndicText(kTxt) ? 5.2 : 4.6;
    doc.setFont("times", "bold"); doc.setFontSize(9);
    const vLines = wrap(doc, vTxt, valW);
    const vLineH = containsIndicText(vTxt) ? 5.2 : 4.6;
    total += Math.max(kLines.length * kLineH, vLines.length * vLineH) + 3;
  }
  return total + 8;
}

function measureWrappedTextHeight(
  doc: jsPDF,
  text: string,
  maxW: number,
  fontSize = 9.5,
  lineH = 5.2
): number {
  if (!text) return 0;
  doc.setFontSize(fontSize);
  const lines = wrap(doc, text, maxW);
  const actualLineH = containsIndicText(text) ? Math.max(lineH, fontSize <= 8.5 ? 5.1 : 6.2) : lineH;
  return lines.length * actualLineH;
}

function drawWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxW: number,
  options?: {
    font?: "times";
    style?: "normal" | "bold" | "italic" | "bolditalic";
    fontSize?: number;
    lineH?: number;
    color?: readonly [number, number, number];
  }
): number {
  const { font = "times", style = "normal", fontSize = 9.5, lineH = 5.2, color = C_TEXT } = options ?? {};
  if (!text) return y;
  doc.setFont(font, style);
  doc.setFontSize(fontSize);
  setColor(doc, color);
  const lines = wrap(doc, text, maxW);
  const actualLineH = containsIndicText(text) ? Math.max(lineH, fontSize <= 8.5 ? 5.1 : 6.2) : lineH;
  for (const line of lines) {
    doc.text(line, x, y);
    y += actualLineH;
  }
  return y;
}

const MAHADASHA_LABELS_KN: Record<string, string> = {
  "Dasha Remedies": "ದಶಾ ಪರಿಹಾರಗಳು",
  "Mahadasha Remedies, Mantras & Spiritual Supports": "ಮಹಾದಶಾ ಪರಿಹಾರಗಳು, ಮಂತ್ರಗಳು ಮತ್ತು ಆಧ್ಯಾತ್ಮಿಕ ಬೆಂಬಲಗಳು",
  "Continuing Mahadasha Remedies to 2065": "2065ರವರೆಗೆ ಮುಂದುವರಿಯುವ ಮಹಾದಶಾ ಪರಿಹಾರಗಳು",
  "Detailed devotional guidance for each Mahadasha period through 2065": "2065ರವರೆಗೆ ಪ್ರತಿಯೊಂದು ಮಹಾದಶಾ ಅವಧಿಗೆ ವಿವರವಾದ ಭಕ್ತಿ ಮಾರ್ಗದರ್ಶನ",
  "Further Mahadasha-specific remedies, yantras, mantra disciplines, and supportive devotional practices for the remaining periods": "ಉಳಿದಿರುವ ಅವಧಿಗಳಿಗೆ ಸಂಬಂಧಿಸಿದ ಮಹಾದಶಾ-ನಿರ್ದಿಷ್ಟ ಪರಿಹಾರಗಳು, ಯಂತ್ರಗಳು, ಮಂತ್ರಶಿಸ್ತು ಮತ್ತು ಸಹಾಯಕ ಭಕ್ತಿಪರ ಆಚರಣೆಗಳು",
  "Mahadasha cycle": "ಮಹಾದಶಾ ಚಕ್ರ",
  "Presiding Devata": "ಅಧಿಷ್ಠಾತೃ ದೇವತೆ",
  "Spiritual Guidelines & Mantra support:": "ಆಧ್ಯಾತ್ಮಿಕ ಮಾರ್ಗದರ್ಶನ ಮತ್ತು ಮಂತ್ರ ಬೆಂಬಲ:",
  "Morning Prayer": "ಪ್ರಾತಃ ಪ್ರಾರ್ಥನೆ",
  "Main Chanting Mantra": "ಮುಖ್ಯ ಜಪ ಮಂತ್ರ",
  "Chanting Discipline": "ಜಪ ಶಿಸ್ತು",
  "Pooja & Offerings": "ಪೂಜೆ ಮತ್ತು ಅರ್ಪಣೆಗಳು",
  "Dress & Color support": "ಉಡುಪು ಮತ್ತು ಬಣ್ಣ ಬೆಂಬಲ",
  "Devata Bhajan": "ದೇವತಾ ಭಜನೆ",
  "Vedic Vrata/Fasting": "ವೈದಿಕ ವ್ರತ / ಉಪವಾಸ",
  "Digital Yantra": "ಡಿಜಿಟಲ್ ಯಂತ್ರ",
  "Additional Support": "ಹೆಚ್ಚುವರಿ ಬೆಂಬಲ",
};

const MAHADASHA_DEITY_KN: Record<string, string> = {
  "Surya Narayana": "ಸೂರ್ಯ ನಾರಾಯಣ",
  "Chandra Deva / Divine Mother": "ಚಂದ್ರ ದೇವ / ದಿವ್ಯ ಮಾತೆ",
  "Hanuman / Subrahmanya / Mangala": "ಹನುಮಾನ್ / ಸುಬ್ರಹ್ಮಣ್ಯ / ಮಂಗಳ",
  "Vishnu / Narayana / Budha": "ವಿಷ್ಣು / ನಾರಾಯಣ / ಬುಧ",
  "Brihaspati / Guru / Vishnu": "ಬೃಹಸ್ಪತಿ / ಗುರು / ವಿಷ್ಣು",
  "Mahalakshmi / Parashakti / Shukra": "ಮಹಾಲಕ್ಷ್ಮಿ / ಪರಾಶಕ್ತಿ / ಶುಕ್ರ",
  "Shani Dev / Kala Bhairava / Hanuman": "ಶನಿ ದೇವ / ಕಾಲ ಭೈರವ / ಹನುಮಾನ್",
  "Durga / Sarpa Devata / Rahu": "ದುರ್ಗಾ / ಸರ್ಪ ದೇವತೆ / ರಾಹು",
  "Ganesha / Matsya / Ketu": "ಗಣೇಶ / ಮತ್ಸ್ಯ / ಕೇತು",
};

function translateMahadashaLabel(text: string, language: "en" | "kn", t: (txt: string) => string): string {
  if (language === "kn" && MAHADASHA_LABELS_KN[text]) {
    return MAHADASHA_LABELS_KN[text];
  }
  return t(text);
}

function translateMahadashaDeity(text: string, language: "en" | "kn", t: (txt: string) => string): string {
  if (language === "kn" && MAHADASHA_DEITY_KN[text]) {
    return MAHADASHA_DEITY_KN[text];
  }
  return t(text);
}

const PLANET_ABBR: Record<string, string> = {
  Sun: "Su", Moon: "Mo", Mars: "Ma", Mercury: "Me", Jupiter: "Ju",
  Venus: "Ve", Saturn: "Sa", Rahu: "Ra", Ketu: "Ke",
  "Sun (Surya)": "Su", "Moon (Chandra)": "Mo", "Mars (Mangal)": "Ma", "Mercury (Budha)": "Me", "Jupiter (Guru)": "Ju",
  "Venus (Shukra)": "Ve", "Saturn (Shani)": "Sa", "Rahu (North Node)": "Ra", "Ketu (South Node)": "Ke",
  "Ascendant (Lagna)": "Asc"
};

function getPdfPlanetAbbr(name: string, language: "en" | "kn"): string {
  if (language === "kn") {
    const map: Record<string, string> = {
      Sun: "ರವಿ", Moon: "ಚಂದ್ರ", Mars: "ಮಂಗಳ", Mercury: "ಬುಧ", Jupiter: "ಗುರು",
      Venus: "ಶುಕ್ರ", Saturn: "ಶನಿ", Rahu: "ರಾಹು", Ketu: "ಕೇತು",
      "Sun (Surya)": "ರವಿ", "Moon (Chandra)": "ಚಂದ್ರ", "Mars (Mangal)": "ಮಂಗಳ",
      "Mercury (Budha)": "ಬುಧ", "Jupiter (Guru)": "ಗುರು", "Venus (Shukra)": "ಶುಕ್ರ",
      "Saturn (Shani)": "ಶನಿ", "Rahu (North Node)": "ರಾಹು", "Ketu (South Node)": "ಕೇತು",
      "Ascendant (Lagna)": "ಲಗ್ನ", Lagna: "ಲಗ್ನ", Ascendant: "ಲಗ್ನ"
    };
    const sName = shortPlanetName(name);
    return map[sName] || map[name] || name.substring(0, 2);
  } else {
    const sName = shortPlanetName(name);
    return PLANET_ABBR[sName] || PLANET_ABBR[name] || name.substring(0, 2);
  }
}

function drawHousePlanets(doc: jsPDF, planets: string[], rx: number, ry: number) {
  if (planets.length === 0) return;
  let fontSize = 7.5;
  if (planets.length > 3) fontSize = 6.0;
  if (planets.length > 5) fontSize = 5.0;

  doc.setFontSize(fontSize);
  if (planets.length <= 2) {
    doc.text(planets.join(", "), rx, ry, { align: "center" });
  } else if (planets.length <= 4) {
    const row1 = planets.slice(0, 2).join(", ");
    const row2 = planets.slice(2).join(", ");
    doc.text(row1, rx, ry - 1, { align: "center" });
    doc.text(row2, rx, ry + 2, { align: "center" });
  } else {
    const row1 = planets.slice(0, 2).join(", ");
    const row2 = planets.slice(2, 4).join(", ");
    const row3 = planets.slice(4).join(", ");
    doc.text(row1, rx, ry - 2, { align: "center" });
    doc.text(row2, rx, ry + 1, { align: "center" });
    doc.text(row3, rx, ry + 4, { align: "center" });
  }
}

function drawChartLegend(
  doc: jsPDF,
  cx: number,
  cy: number,
  size: number,
  t: (txt: string) => string
) {
  const legendY = cy + size + 3;
  doc.setFont("times", "bold");
  doc.setFontSize(6.5);

  const items = [
    { symbol: "*", label: t("Retrograde"), color: [197, 90, 17] as const },
    { symbol: "^", label: t("Combust"), color: [220, 50, 50] as const },
    { symbol: "↑", label: t("Exalted"), color: [13, 107, 44] as const },
    { symbol: "↓", label: t("Debilitated"), color: [112, 48, 160] as const },
  ];

  const colW = (size + 6) / 2;
  items.forEach((item, index) => {
    const row = Math.floor(index / 2);
    const col = index % 2;
    const itemX = cx - 3 + col * colW + 4;
    const itemY = legendY + row * 4.5 + 4;

    doc.setTextColor(item.color[0], item.color[1], item.color[2]);
    doc.setFont("times", "bold");
    doc.text(item.symbol, itemX, itemY);

    setColor(doc, C_MUTED);
    doc.setFont("times", "normal");
    const textOffset = item.symbol === "*" ? 2.5 : item.symbol === "^" ? 2.5 : 2.0;
    doc.text(item.label, itemX + textOffset, itemY);
  });
}

// ─── North Indian Chart Renderer ─────────────────────────────────────────────
function drawNorthIndianChart(
  doc: jsPDF,
  cx: number,
  cy: number,
  size: number,
  lagnaIdx: number,
  planets: any[],
  t: (txt: string) => string,
  language: "en" | "kn"
) {
  setFill(doc, C_WHITE);
  setDraw(doc, C_GOLD);
  doc.roundedRect(cx - 3, cy - 3, size + 6, size + 16, 1.5, 1.5, "FD");

  setDraw(doc, C_NAVY);
  doc.setLineWidth(0.7);
  doc.rect(cx, cy, size, size, "D");

  doc.line(cx, cy, cx + size, cy + size);
  doc.line(cx + size, cy, cx, cy + size);

  doc.line(cx + size / 2, cy, cx, cy + size / 2);
  doc.line(cx, cy + size / 2, cx + size / 2, cy + size);
  doc.line(cx + size / 2, cy + size, cx + size, cy + size / 2);
  doc.line(cx + size, cy + size / 2, cx + size / 2, cy);

  const housePlanets: Record<number, any[]> = {};
  for (let h = 1; h <= 12; h++) housePlanets[h] = [];

  planets.forEach(p => {
    const rasi = Math.floor((p.lon % 360) / 30);
    const houseIdx = (rasi - lagnaIdx + 12) % 12 + 1;
    housePlanets[houseIdx].push(p);
  });

  const scale = (val: number) => (val / 500) * size;
  const houseConfig = [
    { house: 1,  cx: 250, cy: 125, numX: 250, numY: 30,  align: "center" as const }, 
    { house: 2,  cx: 134, cy: 57,  numX: 30,  numY: 30,  align: "left" as const }, 
    { house: 3,  cx: 57,  cy: 134, numX: 28,  numY: 134, align: "left" as const }, 
    { house: 4,  cx: 134, cy: 250, numX: 28,  numY: 250, align: "left" as const }, 
    { house: 5,  cx: 57,  cy: 366, numX: 28,  numY: 366, align: "left" as const }, 
    { house: 6,  cx: 134, cy: 443, numX: 30,  numY: 470, align: "left" as const }, 
    { house: 7,  cx: 250, cy: 375, numX: 250, numY: 470, align: "center" as const }, 
    { house: 8,  cx: 366, cy: 443, numX: 470, numY: 470, align: "right" as const }, 
    { house: 9,  cx: 443, cy: 366, numX: 472, numY: 366, align: "right" as const }, 
    { house: 10, cx: 366, cy: 250, numX: 472, numY: 250, align: "right" as const }, 
    { house: 11, cx: 443, cy: 134, numX: 472, numY: 134, align: "right" as const }, 
    { house: 12, cx: 366, cy: 57,  numX: 470, numY: 30,  align: "right" as const }, 
  ];

  for (const config of houseConfig) {
    const rx = cx + scale(config.cx);
    const ry = cy + scale(config.cy);
    const numX = cx + scale(config.numX);
    const numY = cy + scale(config.numY);
    const rasiNum = (lagnaIdx + config.house - 1) % 12 + 1;

    setColor(doc, C_MAROON);
    doc.setFont("times", "bold");
    doc.setFontSize(8.5);
    doc.text(String(rasiNum), numX, numY, { align: config.align });

    const housePlanList = housePlanets[config.house];
    if (housePlanList.length > 0) {
      doc.setFont("times", "bold");
      
      let fontSize = 7.0;
      let lineH = 2.8;
      if (housePlanList.length > 3) {
        fontSize = 6.0;
        lineH = 2.2;
      }
      doc.setFontSize(fontSize);

      const startY = ry - ((housePlanList.length - 1) * lineH) / 2;
      housePlanList.forEach((p, idx) => {
        const name = shortPlanetName(p.name);
        const abbr = getPdfPlanetAbbr(p.name, language);
        const deg = Math.floor(p.lon % 30);
        const rasiIdx = Math.floor(p.lon / 30) % 12;
        const dignity = getPlanetDignity(name, rasiIdx);
        const digMarker = getDignityMarker(dignity);
        const ret = p.retrograde ? "*" : "";
        const comb = p.combust ? "^" : "";
        
        let color = C_GREEN;
        if (dignity === "exalted") color = [13, 107, 44] as const;
        else if (dignity === "debilitated") color = [112, 48, 160] as const;
        else if (p.combust) color = [220, 50, 50] as const;

        doc.setTextColor(color[0], color[1], color[2]);
        doc.text(`${abbr} ${deg}°${ret}${comb}${digMarker}`, rx, startY + idx * lineH, { align: "center" });
      });
    }
  }

  drawChartLegend(doc, cx, cy, size, t);
}

// ─── South Indian Chart Renderer ─────────────────────────────────────────────
function drawSouthIndianChart(
  doc: jsPDF,
  cx: number,
  cy: number,
  size: number,
  lagnaIdx: number,
  planets: any[],
  t: (txt: string) => string,
  language: "en" | "kn"
) {
  setFill(doc, C_WHITE);
  setDraw(doc, C_GOLD);
  doc.roundedRect(cx - 3, cy - 3, size + 6, size + 16, 1.5, 1.5, "FD");

  setDraw(doc, C_NAVY);
  doc.setLineWidth(0.7);

  const cellSize = size / 4;
  const grid = [
    [11, 0, 1, 2],
    [10, null, null, 3],
    [9, null, null, 4],
    [8, 7, 6, 5]
  ];

  const signPlanets: Record<number, any[]> = {};
  for (let s = 0; s < 12; s++) signPlanets[s] = [];

  planets.forEach(p => {
    const sIdx = Math.floor((p.lon % 360) / 30) % 12;
    signPlanets[sIdx].push(p);
  });

  const SANSKRIT_SIGNS_SHORT = [
    "Mes", "Vri", "Mit", "Kar", "Sim", "Kan",
    "Tul", "Vrs", "Dha", "Mak", "Kum", "Mee"
  ];

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const signIdx = grid[row][col];
      const cellX = cx + col * cellSize;
      const cellY = cy + row * cellSize;

      if (signIdx === null) {
        setFill(doc, [248, 245, 235]);
        doc.rect(cellX, cellY, cellSize, cellSize, "F");
        continue;
      }

      setDraw(doc, C_NAVY);
      doc.rect(cellX, cellY, cellSize, cellSize, "D");

      const isLagna = signIdx === lagnaIdx;
      const signAbbr = SANSKRIT_SIGNS_SHORT[signIdx];

      setColor(doc, C_MUTED);
      doc.setFont("times", "bold");
      doc.setFontSize(6.5);
      doc.text(t(signAbbr), cellX + 1.5, cellY + 5);

      if (isLagna) {
        setColor(doc, C_MAROON);
        doc.setFont("times", "bold");
        doc.setFontSize(6.5);
        doc.text(t("ASC"), cellX + cellSize - 1.5, cellY + 5, { align: "right" });
      }

      const cellPlanets = signPlanets[signIdx];
      const count = cellPlanets.length;
      if (count > 0) {
        doc.setFont("times", "bold");
        
        let fontSize = 6.0;
        let lineH = 2.3;
        if (count > 3) {
          fontSize = 5.2;
          lineH = 1.9;
        }
        if (count > 5) {
          fontSize = 4.2;
          lineH = 1.5;
        }
        doc.setFontSize(fontSize);

        const availH = 10.5;
        const totalBlockH = (count - 1) * lineH;
        const startY = cellY + 6.0 + (availH - totalBlockH) / 2 + (fontSize / 7.2) * 0.7;

        cellPlanets.forEach((p, idx) => {
          const name = shortPlanetName(p.name);
          const abbr = getPdfPlanetAbbr(p.name, language);
          const deg = Math.floor(p.lon % 30);
          const rasiIdx = Math.floor(p.lon / 30) % 12;
          const dignity = getPlanetDignity(name, rasiIdx);
          const digMarker = getDignityMarker(dignity);
          const ret = p.retrograde ? "*" : "";
          const comb = p.combust ? "^" : "";
          
          let color = C_GREEN;
          if (dignity === "exalted") color = [13, 107, 44] as const;
          else if (dignity === "debilitated") color = [112, 48, 160] as const;
          else if (p.combust) color = [220, 50, 50] as const;

          doc.setTextColor(color[0], color[1], color[2]);
          doc.text(`${abbr} ${deg}°${ret}${comb}${digMarker}`, cellX + cellSize / 2, startY + idx * lineH, { align: "center" });
        });
      }
    }
  }

  drawChartLegend(doc, cx, cy, size, t);
}

function addSimpleTable(
  doc: jsPDF,
  y: number,
  headers: string[],
  rows: string[][],
  widths: number[],
  title: string,
  t: (txt: string) => string,
  startNewPage: (title: string) => number
): number {
  if (y > H - 28) y = startNewPage(title);
  setFill(doc, C_MAROON);
  doc.rect(ML, y - 4, CW, 8, "F");
  setColor(doc, C_GOLD);
  doc.setFont("times", "bold");
  doc.setFontSize(7.8);

  let x = ML + 2;
  headers.forEach((h, i) => {
    doc.text(t(h), x, y + 1);
    x += widths[i];
  });
  y += 6.5;

  rows.forEach((row, rowIndex) => {
    if (y > H - 14) {
      y = startNewPage(title);
      setFill(doc, C_MAROON);
      doc.rect(ML, y - 4, CW, 8, "F");
      setColor(doc, C_GOLD);
      doc.setFont("times", "bold");
      doc.setFontSize(7.8);
      let hx = ML + 2;
      headers.forEach((h, i) => {
        doc.text(t(h), hx, y + 1);
        hx += widths[i];
      });
      y += 6.5;
    }

    if (rowIndex % 2 === 1) {
      setFill(doc, C_LIGHT_ALT);
      doc.rect(ML, y - 3, CW, 6.6, "F");
    }
    setColor(doc, C_TEXT);
    doc.setFont("times", "normal");
    doc.setFontSize(7.4);
    let rx = ML + 2;
    row.forEach((cell, i) => {
      const translatedCell = t(cell);
      const clipped = translatedCell.length > 28 ? `${translatedCell.slice(0, 25)}...` : translatedCell;
      doc.text(clipped, rx, y + 1);
      rx += widths[i];
    });
    y += 6.6;
  });

  return y + 5;
}

// ─── Main Programmatic PDF Exporter ──────────────────────────────────────────
export async function generateKundaliPdf(data: SharedBirthData, language: "en" | "kn" = "en"): Promise<Blob> {
  const sharedData = buildSharedReportData(data, language);
  const { t } = sharedData;

  const doc = new jsPDF("p", "mm", "a4");

  if (language === "kn") {
    const { installIndicTextSupport } = await import("./indicJsPdfText");
    await installIndicTextSupport(doc);
  }

  let pageNum = 1;

  function startNewPage(sectionTitle: string) {
    if (pageNum > 1) {
      doc.addPage();
    }
    applyPageBackground(doc);

    // Thick top decorative border
    setFill(doc, C_MAROON);
    doc.rect(0, 0, W, 10, "F");
    setColor(doc, C_GOLD);
    doc.setFont("times", "bold");
    doc.setFontSize(9);
    
    const headerText = t("DIVINE PANCHANG").toUpperCase() + "  ·  " + t("SACRED VEDIC HOROSCOPE").toUpperCase();
    doc.text(headerText, ML, 6.5);
    doc.text(t(sectionTitle).toUpperCase(), W - MR, 6.5, { align: "right" });

    // Gold rule below header
    setFill(doc, C_GOLD);
    doc.rect(0, 10, W, 1, "F");

    // Bottom border
    setFill(doc, C_MAROON);
    doc.rect(0, H - 8, W, 8, "F");
    setFill(doc, C_GOLD);
    doc.rect(0, H - 9, W, 1, "F");
    
    setColor(doc, C_GOLD);
    doc.setFontSize(8);
    doc.setFont("times", "bold");
    doc.text(t("Page") + " " + pageNum, W / 2, H - 3, { align: "center" });

    pageNum++;
    return 20; // content starts at Y=20
  }
  // ─── PAGE 1: COVER PAGE ────────────────────────────────────────────────────
  // ─── PAGE 1: COVER PAGE ────────────────────────────────────────────────────
  applyPageBackground(doc);
  setDraw(doc, C_MAROON);
  doc.setLineWidth(0.8);
  doc.rect(5, 5, W - 10, H - 10, "D");
  doc.setLineWidth(0.3);
  setDraw(doc, C_GOLD);
  doc.rect(6.5, 6.5, W - 13, H - 13, "D");

  setFill(doc, C_GOLD);
  const corners = [
    [7, 7], [W - 13, 7], [7, H - 13], [W - 13, H - 13]
  ];
  corners.forEach(([x, y]) => doc.circle(x, y, 2, "F"));

  setColor(doc, C_MAROON);
  doc.setFont("times", "bold");
  doc.setFontSize(22);
  doc.text(t("DIVINE PANCHANG"), W / 2, 25, { align: "center" });

  setColor(doc, C_GOLD_DARK);
  doc.setFont("times", "italic");
  doc.setFontSize(10);
  doc.text(t("Vedic Guidance & Kundali Astrology Portal"), W / 2, 31, { align: "center" });

  const mandalaY = 75;
  drawGoldenMandala(doc, W / 2, mandalaY, 28);
  setColor(doc, C_MAROON);
  doc.setFont("times", "bold");
  doc.setFontSize(38);
  doc.text("ॐ", W / 2, mandalaY + 5, { align: "center" });

  doc.setFont("times", "bolditalic");
  doc.setFontSize(11);
  setColor(doc, C_MAROON);
  doc.text(t("Janani Janma Soukhyaanaam, Vardhani Kula Sampadaam |"), W / 2, 118, { align: "center" });
  doc.text(t("Padavee Poorva Punyaanaam, Likhyate Janma Patrikaa ||"), W / 2, 124, { align: "center" });

  doc.setFont("times", "italic");
  doc.setFontSize(8.5);
  setColor(doc, C_TEXT);
  doc.text(t('"For the welfare and happiness of the child, for the growth of lineage and wealth,'), W / 2, 131, { align: "center" });
  doc.text(t('and to trace the merits of past lives, this sacred horoscope is written."'), W / 2, 136, { align: "center" });

  drawAstroDivider(doc, 144);

  setColor(doc, C_MAROON);
  doc.setFont("times", "bold");
  doc.setFontSize(26);
  doc.text(t("IN-DEPTH HOROSCOPE"), W / 2, 160, { align: "center" });

  doc.setFontSize(13);
  setColor(doc, C_GOLD_DARK);
  doc.text(data.plan === "detailed" ? t("PREMIUM 60-PAGE DETAILED REPORT") : t("SACRED VEDIC HOROSCOPE"), W / 2, 168, { align: "center" });

  setFill(doc, C_LIGHT_ALT);
  doc.setLineWidth(0.3);
  setDraw(doc, C_GOLD);
  doc.roundedRect(ML + 5, 185, CW - 10, 68, 2, 2, "FD");

  setColor(doc, C_MAROON);
  doc.setFont("times", "bold");
  doc.setFontSize(14);
  const horoscopeOfText = language === "kn" ? `${data.name} ಅವರ ಜನ್ಮ ಪತ್ರಿಕೆ` : `Horoscope of ${data.name}`;
  doc.text(horoscopeOfText, W / 2, 196, { align: "center" });

  const coverFields: [string, string][] = [
    ["Date of Birth", t(sharedData.panchanga.weekdayName) + ", " + data.dob],
    ["Time of Birth", data.tob],
    ["Place of Birth", t(data.city)],
    ["Coordinates", `${data.lat.toFixed(4)}° N, ${data.lon.toFixed(4)}° E`],
    ["Ruling Nakshatra", `${t(sharedData.nakshatraName)} (Pada ${sharedData.nakshatraPada})`],
  ];

  let cfY = 207;
  for (const [label, val] of coverFields) {
    setColor(doc, C_MUTED);
    doc.setFont("times", "bold");
    doc.setFontSize(8.5);
    doc.text(t(label).toUpperCase(), ML + 12, cfY);
    setColor(doc, C_TEXT);
    doc.setFont("times", "bold");
    doc.setFontSize(9.5);
    doc.text(val, ML + 65, cfY);
    cfY += 8;
  }

  setColor(doc, C_MAROON);
  doc.setFont("times", "italic");
  doc.setFontSize(9.5);
  doc.text(t("May the cosmic lights guide you toward prosperity, health, and peace."), W / 2, 272, { align: "center" });

  setColor(doc, C_GOLD_DARK);
  doc.setFont("times", "bold");
  doc.setFontSize(9);
  doc.text("www.divinepanchang.space", W / 2, 281, { align: "center" });

  setColor(doc, C_GOLD);
  doc.setFontSize(8);
  doc.setFont("times", "bold");
  doc.text(t("Page") + " 1", W / 2, H - 3, { align: "center" });
  pageNum++;

  // ─── PAGE 2: BIRTH DETAILS & SUMMARY ───────────────────────────────────────
  let y = startNewPage("Birth Details & D1 Chart");
  y = addSectionHeader(doc, "Birth Details & Astrological Profile", "Vedic calculations mapped to the cosmic canvas at your moment of incarnation", y, t);

  const colW = CW / 2 - 3;
  y = addInfoBox(doc, [
    ["Full Name", data.name],
    ["Date of Birth", data.dob],
    ["Time of Birth", data.tob],
    ["Birth Location", data.city],
    ["Timezone", data.timezone],
  ], ML, y, colW, t);

  // Right infobox aligned to same top as left infobox (y was advanced by left box + 4)
  // leftBoxH: pre-measured so both boxes align at the same top coordinate
  {
    const leftRows: [string, string][] = [
      ["Full Name",      data.name],
      ["Date of Birth",  data.dob],
      ["Time of Birth",  data.tob],
      ["Birth Location", data.city],
      ["Timezone",       data.timezone],
    ];
    const rightRows: [string, string][] = [
      ["Lagna Ascendant",  sharedData.lagnaName],
      ["Moon Sign (Rashi)", sharedData.rashiName],
      ["Nakshatra (Pada)", `${sharedData.nakshatraName} (Pada ${sharedData.nakshatraPada})`],
      ["Coordinates",      `${data.lat.toFixed(4)}°N, ${data.lon.toFixed(4)}°E`],
      ["Ayanamsa Method",  "Lahiri Chitra Paksha"],
    ];
    const leftBoxH  = measureInfoBoxHeight(doc, leftRows,  colW, t);
    const rightTopY = y - leftBoxH - 4; // y was advanced past left box
    addInfoBox(doc, rightRows, ML + colW + 6, rightTopY, colW, t);
  }

  y += 4;
  const chartSize = 68;
  const chartX = W / 2 - chartSize / 2;
  if (data.chartStyle === "south") {
    drawSouthIndianChart(doc, chartX, y, chartSize, sharedData.lagnaIndex, sharedData.listPlanets, t, language);
  } else {
    drawNorthIndianChart(doc, chartX, y, chartSize, sharedData.lagnaIndex, sharedData.listPlanets, t, language);
  }

  // ─── PAGE 3: DIVISIONAL NAVAMSA CHART (D9) ─────────────────────────────────
  y = startNewPage("D9 Navamsa Chart");
  y = addSectionHeader(doc, "Divisional Navamsa Chart (D9)", "The chart of the soul, inner potential, and marriage/harmonious path", y, t);

  const navamsaIntro = language === "kn"
    ? `ನಿಮ್ಮ ಲಗ್ನ ${sharedData.lagnaName}. ಇದು ಚಲನಶೀಲ ಭೌತಿಕ ದೇಹ, ಆರಂಭಿಕ ಪರಿಸರ ಮತ್ತು ನಿಮ್ಮ ಪ್ರಾಥಮಿಕ ಮಾರ್ಗಗಳಲ್ಲಿ ಸವಾಲುಗಳನ್ನು ಹೇಗೆ ಎದುರಿಸುತ್ತೀರಿ ಎಂಬುದನ್ನು ಪ್ರತಿನಿಧಿಸುತ್ತದೆ. ಇದು ನಿಮ್ಮ ವ್ಯಕ್ತಿತ್ವವನ್ನು ನಿರ್ಧರಿಸಿ ಜೀವನ ಗೋಚಾರಗಳಲ್ಲಿ ಯಾವ ಭಾವ ಗ್ರಹ ವ್ಯವಸ್ಥೆಗಳು ಸಕ್ರಿಯಗೊಳ್ಳುತ್ತವೆ ಎಂದು ತಿಳಿಸುತ್ತದೆ.`
    : `Your Lagna Ascendant is ${sharedData.lagnaName}. This represents the dynamic physical body, early environments, and how you approach challenges in your primary paths. It anchors your personality and determines which house planetary systems activate throughout your life transits.`;
  y = addParagraph(doc, navamsaIntro, ML, y, CW - 78, t);
  
  const navamsaD9Explain = "The Navamsa (D9) divisional chart details the spiritual core of your planetary systems. While D1 shows physical realities, D9 shows the spiritual potential and second-half of life.";
  y = addParagraph(doc, navamsaD9Explain, ML, y + 4, CW - 78, t);

  const chartD9Y = 32;
  const chartD9X = W - ML - chartSize;
  if (data.chartStyle === "south") {
    drawSouthIndianChart(doc, chartD9X, chartD9Y, chartSize, sharedData.navamsaIndex, sharedData.navamsaPlanets, t, language);
  } else {
    drawNorthIndianChart(doc, chartD9X, chartD9Y, chartSize, sharedData.navamsaIndex, sharedData.navamsaPlanets, t, language);
  }

  // ─── PAGE 4: BHAVA CHALIT CHART ────────────────────────────────────────────
  y = startNewPage("Bhava Chalit Chart");
  y = addSectionHeader(doc, "Vedic Bhava Chalit Chart (Cusp Positions)", "Astronomical house positions of planets based on the Ascendant degree boundary", y, t);

  const chalitExplain = language === "kn" ? "ಡಿ1 ಲಗ್ನ ಕುಂಡಲಿ ರಾಶಿ ಚಿಹ್ನೆಗಳ 30° ಮಿತಿಯಲ್ಲಿ ಗ್ರಹಗಳ ಸ್ಥಾನ ತೋರಿಸಿದರೆ, ಭಾವ ಚಲಿತ ಕುಂಡಲಿ ಗ್ರಹಗಳು ನೈಜವಾಗಿ ಯಾವ ಭಾವದಲ್ಲಿ ಕಾರ್ಯ ನಿರ್ವಹಿಸುತ್ತವೆ ಎಂಬ ನಿಖರ ಸ್ಥಾನ ನಕ್ಷೆ ನೀಡುತ್ತದೆ. ಲಗ್ನ ಡಿಗ್ರಿ ಬದಲಾದಾಗ, ರಾಶಿ ಅಂಚಿನ ಗ್ರಹಗಳು ಭಾವ ಚಲಿತ ಕುಂಡಲಿಯಲ್ಲಿ ಪಕ್ಕದ ಭಾವಕ್ಕೆ ಸ್ಥಳಾಂತರ ಆಗಬಹುದು. ಇದು ನಿಮ್ಮ ದೈನಂದಿನ ಜೀವನದಲ್ಲಿ ಗೋಚಾರ ಮತ್ತು ದಶಾ ಸಕ್ರಿಯಗೊಳಿಸುವಿಕೆಯ ನಿಜ ಫಲಿತಾಂಶ ನಿರ್ಧರಿಸುತ್ತದೆ." : "While the D1 Lagna chart represents the placement of planets within the 30° boundaries of zodiac signs, the Bhava Chalit (House Cusp) chart maps the exact physical houses where the planets operate. When the Ascendant degree is offset, planets near the edge of a sign may shift to an adjacent house in the Bhava Chalit chart. This determines the actual dynamic results of transits and dasha activations in your daily life.";
  y = addParagraph(doc, chalitExplain, ML, y, CW, t) + 8;

  if (data.chartStyle === "south") {
    drawSouthIndianChart(doc, chartX, y, chartSize, sharedData.lagnaIndex, sharedData.bhavaPlanets, t, language);
  } else {
    drawNorthIndianChart(doc, chartX, y, chartSize, sharedData.lagnaIndex, sharedData.bhavaPlanets, t, language);
  }

  // ─── PAGE 5: BHAVA TABLE ───────────────────────────────────────────────────
  y = startNewPage("Bhava Table");
  y = addSectionHeader(doc, "Bhava Table", "House cusp boundaries showing beginning, middle, ending, and the planets active within each Bhava", y, t);

  const tableIntro = "This table refines the house-based reading of your chart. It shows the Bhava entry point, midpoint, and ending point for each house, along with the planets operating inside that Bhava according to the Bhava Chalit system.";
  y = addParagraph(doc, tableIntro, ML, y, CW, t) + 6;

  const bhavaCols = [25, 38, 38, 38, 41];
  const bhavaHeaders = ["Bhava", "Arambha", "Madhya", "Anthya", "Planets"];
  const bhavaRows = sharedData.bhavaTableRows.map((row: any) => [
    String(row.bhava), row.beginning, row.middle, row.ending, row.planets
  ]);
  y = addSimpleTable(doc, y, bhavaHeaders, bhavaRows, bhavaCols, "Bhava Table", t, startNewPage);

  // ─── PAGE 6: PANCHANGA PREDICTIONS ─────────────────────────────────────────
  y = startNewPage("Panchanga Predictions");
  y = addSectionHeader(doc, "Panchanga Predictions", "Birth-day tendencies derived from weekday, Nakshatra, Thidhi, Karana, and Nithya Yoga", y, t);

  const panIntro = language === "kn"
    ? `ಓಂ ಶ್ರೀ. ${t(sharedData.panchanga.phaseName)} ಸಮಯದಲ್ಲಿ, ${t(sharedData.rashiName)} ರಾಶಿಯಲ್ಲಿ ಚಂದ್ರ ಮತ್ತು ${t(sharedData.nakshatraName)} ಜನ್ಮ ನಕ್ಷತ್ರದೊಂದಿಗೆ, ಈ ಕುಂಡಲಿಯು ${t(sharedData.panchanga.thidhiName)} ತಿಥಿ, ${t(sharedData.panchanga.karanaName)} ಕರಣ ಮತ್ತು ${t(sharedData.panchanga.yogaName)} ನಿತ್ಯ ಯೋಗದಿಂದ ಗುರುತಿಸಲ್ಪಟ್ಟಿದೆ. ಈ ಸೂಕ್ಷ್ಮ ಕ್ಯಾಲೆಂಡರ್ ಅಂಶಗಳು ನಿಮ್ಮ ಸ್ವಾಭಾವಿಕ ಮನೋಭಾವ, ಆಧ್ಯಾತ್ಮಿಕ ಒಲವು ಮತ್ತು ವಿಧಿ ತನ್ನನ್ನು ವ್ಯಕ್ತಪಡಿಸುವ ನೈಸರ್ಗಿಕ ಮಾದರಿಗಳನ್ನು ವಿವರಿಸುತ್ತವೆ.`
    : `Om Sri. During ${sharedData.panchanga.phaseName}, with the Moon in ${sharedData.rashiName} Rashi and birth star ${sharedData.nakshatraName}, this horoscope is marked by ${sharedData.panchanga.thidhiName} Thidhi, ${sharedData.panchanga.karanaName} Karana, and ${sharedData.panchanga.yogaName} Nithya Yoga. These subtle calendar factors describe your instinctive temperament, spiritual inclination, and the natural patterns through which destiny tends to express itself.`;

  // Renders beautiful intro box — dynamically sized for translated text
  {
    const panIntroTr = t(panIntro);
    doc.setFontSize(9.5);
    const panIntroH = measureWrappedTextHeight(doc, panIntroTr, CW - 10, 9.5, language === "kn" ? 5.8 : 5.0);
    const panIntroBoxH = panIntroH + 10;
    setFill(doc, [255, 253, 247]);
    setDraw(doc, C_GOLD);
    doc.setLineWidth(0.3);
    doc.roundedRect(ML, y, CW, panIntroBoxH, 1.5, 1.5, "FD");
    drawWrappedText(doc, panIntroTr, ML + 4, y + 6, CW - 10, { font: "times", style: "normal", fontSize: 9.5, lineH: language === "kn" ? 5.8 : 5.0, color: C_TEXT });
    y += panIntroBoxH + 4;
  }

  const panCards: [string, string][] = [
    [language === "kn" ? `${t("Weekday")}: ${t(sharedData.panchanga.weekdayName)}` : `Weekday: ${sharedData.panchanga.weekdayName}`, sharedData.panchanga.weekdayDesc],
    [language === "kn" ? `${t("Birth Star")}: ${t(sharedData.nakshatraName)}` : `Birth Star: ${sharedData.nakshatraName}`, sharedData.panchanga.starDesc],
    [language === "kn" ? `${t("Thidhi (Lunar Day)")}: ${t(sharedData.panchanga.thidhiName)}` : `Thidhi (Lunar Day): ${sharedData.panchanga.thidhiName}`, sharedData.panchanga.thidhiDesc],
    [language === "kn" ? `${t("Karanam")}: ${t(sharedData.panchanga.karanaName)}` : `Karanam: ${sharedData.panchanga.karanaName}`, sharedData.panchanga.karanaDesc],
    [language === "kn" ? `${t("Nithya Yoga")}: ${t(sharedData.panchanga.yogaName)}` : `Nithya Yoga: ${sharedData.panchanga.yogaName}`, sharedData.panchanga.yogaDesc],
  ];

  for (const [title, desc] of panCards) {
    const titleTr = t(title);
    const descTr  = t(desc);
    // Measure both parts to size the card
    doc.setFontSize(9.5);
    const titleH = measureWrappedTextHeight(doc, titleTr, CW - 10, 9.5, language === "kn" ? 5.8 : 4.8);
    const descH  = measureWrappedTextHeight(doc, descTr,  CW - 10, 9.5, language === "kn" ? 5.6 : 4.4);
    const panCardH = 6 + titleH + 3 + descH + 5;
    if (y + panCardH > H - 14) y = startNewPage("Panchanga Predictions");

    setFill(doc, C_WHITE);
    setDraw(doc, C_GOLD);
    doc.setLineWidth(0.2);
    doc.roundedRect(ML, y, CW, panCardH, 1.5, 1.5, "FD");

    let panY = y + 6;
    panY = drawWrappedText(doc, titleTr, ML + 4, panY, CW - 10, { font: "times", style: "bold", fontSize: 9.5, lineH: language === "kn" ? 5.8 : 4.8, color: C_MAROON }) + 3;
    drawWrappedText(doc, descTr, ML + 4, panY, CW - 10, { font: "times", style: "normal", fontSize: 9.5, lineH: language === "kn" ? 5.6 : 4.4, color: C_TEXT });
    y += panCardH + 4;
  }

  // ─── PAGES 7 to 18: BHAVA PREDICTIONS (DETAILED PLAN ONLY) ─────────────────
  if (data.plan === "detailed") {
    sharedData.houseAnalyses.forEach((houseAnalysis: any, idx: number) => {
      const houseNumber = idx + 1;
      const ordinalEn = houseNumber === 1 ? "st" : houseNumber === 2 ? "nd" : houseNumber === 3 ? "rd" : "th";
      const sectionLabel = language === "kn" ? `${t("House")} ${houseNumber}` : `House ${houseNumber}`;
      const houseTitle = language === "kn"
        ? `${houseNumber}ನೇ ${t("House")}: ${t(houseAnalysis.houseName)} (${t(houseAnalysis.houseSignName)} ${t("Sign")} · ${t("Lord")}: ${t(houseAnalysis.lord)})`
        : `${houseNumber}${ordinalEn} ${t("House")}: ${t(houseAnalysis.houseName)} (${t(houseAnalysis.houseSignName)} ${t("Sign")} · ${t("Lord")}: ${t(houseAnalysis.lord)})`;
      const coreThemeStr = t("Core Theme: ") + t(houseAnalysis.coreTheme);
      const strengthsStr = t(houseAnalysis.strengthsDescription) + " " + t("Key Areas:") + " " + houseAnalysis.keyLifeAreas.map((a: string) => t(a)).join(", ");
      const challengesStr = t(houseAnalysis.vulnerabilitiesDescription) + " " + t("Alignment Strength:") + " " + t(houseAnalysis.strengthIndicator.toUpperCase());
      const detailedStr = t(houseAnalysis.detailedAnalysis);

      const hSectionHeader = language === "kn"
        ? `${t("Focused reading for the")} ${t(houseAnalysis.houseName)} ${t("and the karmic themes anchored by")} ${t(houseAnalysis.houseSignName)}.`
        : `Focused reading for the ${houseAnalysis.houseName.toLowerCase()} and the karmic themes anchored by ${houseAnalysis.houseSignName}.`;

      y = startNewPage(`${t("Bhava Predictions")} - ${sectionLabel}`);
      y = addSectionHeader(doc, `${t("Bhava Predictions")} (${sectionLabel})`, hSectionHeader, y, t);

      let fontSize = 9.5;
      let titleFontSize = 11;
      let lineH = language === "kn" ? 5.8 : 5.0;
      let titleLineH = language === "kn" ? 6.5 : 5.8;
      
      const maxAvailableH = H - 14 - y;
      
      let titleH = measureWrappedTextHeight(doc, houseTitle, CW - 14, titleFontSize, titleLineH);
      let coreH  = measureWrappedTextHeight(doc, coreThemeStr, CW - 14, fontSize, lineH);
      let detH   = measureWrappedTextHeight(doc, detailedStr, CW - 14, fontSize, lineH);
      let strH   = measureWrappedTextHeight(doc, strengthsStr, CW - 14, fontSize, lineH);
      let chalH  = measureWrappedTextHeight(doc, challengesStr, CW - 14, fontSize, lineH);
      let cardH  = 10 + titleH + 3 + coreH + 6 + 5 + detH + 6 + 5 + strH + 6 + 5 + chalH + 10;
      
      if (cardH > maxAvailableH) {
        fontSize = 8.5;
        titleFontSize = 10;
        lineH = language === "kn" ? 5.0 : 4.4;
        titleLineH = language === "kn" ? 5.8 : 5.0;
        
        titleH = measureWrappedTextHeight(doc, houseTitle, CW - 14, titleFontSize, titleLineH);
        coreH  = measureWrappedTextHeight(doc, coreThemeStr, CW - 14, fontSize, lineH);
        detH   = measureWrappedTextHeight(doc, detailedStr, CW - 14, fontSize, lineH);
        strH   = measureWrappedTextHeight(doc, strengthsStr, CW - 14, fontSize, lineH);
        chalH  = measureWrappedTextHeight(doc, challengesStr, CW - 14, fontSize, lineH);
        cardH  = 10 + titleH + 3 + coreH + 6 + 5 + detH + 6 + 5 + strH + 6 + 5 + chalH + 10;
      }
      
      if (cardH > maxAvailableH) {
        fontSize = 7.8;
        titleFontSize = 9.2;
        lineH = language === "kn" ? 4.4 : 3.8;
        titleLineH = language === "kn" ? 5.0 : 4.2;
        
        titleH = measureWrappedTextHeight(doc, houseTitle, CW - 14, titleFontSize, titleLineH);
        coreH  = measureWrappedTextHeight(doc, coreThemeStr, CW - 14, fontSize, lineH);
        detH   = measureWrappedTextHeight(doc, detailedStr, CW - 14, fontSize, lineH);
        strH   = measureWrappedTextHeight(doc, strengthsStr, CW - 14, fontSize, lineH);
        chalH  = measureWrappedTextHeight(doc, challengesStr, CW - 14, fontSize, lineH);
        cardH  = 10 + titleH + 3 + coreH + 6 + 5 + detH + 6 + 5 + strH + 6 + 5 + chalH + 10;
      }

      setFill(doc, C_WHITE);
      setDraw(doc, C_GOLD);
      doc.setLineWidth(0.3);
      doc.roundedRect(ML, y, CW, cardH, 2, 2, "FD");

      let py = y + 7;
      py = drawWrappedText(doc, houseTitle, ML + 6, py, CW - 14, { font: "times", style: "bold", fontSize: titleFontSize, lineH: titleLineH, color: C_MAROON }) + 3;
      py = drawWrappedText(doc, coreThemeStr, ML + 6, py, CW - 14, { font: "times", style: "normal", fontSize: fontSize, lineH: lineH, color: C_GOLD_DARK }) + 6;

      setColor(doc, C_MAROON); doc.setFont("times", "bold"); doc.setFontSize(fontSize);
      doc.text(t("Detailed Astrological Prediction"), ML + 6, py); py += 5;
      py = drawWrappedText(doc, detailedStr, ML + 6, py, CW - 14, { font: "times", style: "normal", fontSize: fontSize, lineH: lineH, color: C_TEXT }) + 6;

      setColor(doc, C_MAROON); doc.setFont("times", "bold"); doc.setFontSize(fontSize);
      doc.text(t("Inherent Strengths & Supports"), ML + 6, py); py += 5;
      py = drawWrappedText(doc, strengthsStr, ML + 6, py, CW - 14, { font: "times", style: "normal", fontSize: fontSize, lineH: lineH, color: C_TEXT }) + 6;

      setColor(doc, C_MAROON); doc.setFont("times", "bold"); doc.setFontSize(fontSize);
      doc.text(t("Karmic Challenges & Remedies"), ML + 6, py); py += 5;
      drawWrappedText(doc, challengesStr, ML + 6, py, CW - 14, { font: "times", style: "normal", fontSize: fontSize, lineH: lineH, color: C_TEXT });

      y += cardH + 6;
    });
  }
  y = startNewPage("Planetary Positions");
  y = addSectionHeader(doc, "Planetary Coordinates & Longitudes", "Astronomical placements and Nirayana degrees of all major Grahas", y, t);

  const coordinatesHeaders = ["Planet", "Longitude Degree", "Rasi Sign", "Ruling Nakshatra", "Pada"];
  const coordinatesCols = [35, 41, 41, 41, 22];
  const coordinatesRows = sharedData.planetRows.map((row: any) => [
    row.name, row.longitude, row.rasi, row.nakshatra, String(row.pada)
  ]);
  y = addSimpleTable(doc, y, coordinatesHeaders, coordinatesRows, coordinatesCols, "Planetary Positions", t, startNewPage);

  // ─── PAGE 20: MOON SIGN ANALYSIS ───────────────────────────────────────────
  y = startNewPage("Moon Sign Analysis");
  const rashiSectionTitle = language === "kn"
    ? `ಚಂದ್ರ ರಾಶಿ: ${t(sharedData.rashiName)} ರಾಶಿ`
    : `Moon Sign: ${sharedData.rashiName} Rashi`;
  y = addSectionHeader(
    doc,
    rashiSectionTitle,
    language === "kn"
      ? "ನಿಮ್ಮ ಮನಸ್ಸು, ಭಾವನಾತ್ಮಕ ನೀಲನಕ್ಷೆ ಮತ್ತು ಜೀವನದ ಘಟನೆಗಳಿಗೆ ನಿಮ್ಮ ಆಂತರಿಕ ಪ್ರತಿಕ್ರಿಯೆಗಳು"
      : "Your mind, emotional blueprint, and internal reactions to life's events",
    y,
    t
  );

  const rashiLord = sharedData.luckySupportCards[1]?.planet || "Moon";
  const rashiSanskrit = sharedData.rashiSanskrit;
  
  // Render Rashi Elements Grid
  setFill(doc, C_LIGHT_ALT);
  setDraw(doc, C_GOLD);
  doc.setLineWidth(0.3);
  doc.roundedRect(ML, y, CW, 20, 1.5, 1.5, "FD");

  const elemW = CW / 4;
  const elementsList = [
    ["Sanskrit Sign", rashiSanskrit],
    ["Ruling Lord", language === "kn" ? `${t(rashiLord)} ದೇವ್` : `${rashiLord} Dev`],
    ["Moon Placement", `${(sharedData.moonLon % 30).toFixed(2)}°`],
    ["Ayanamsa", language === "kn" ? "ಚಿತ್ರ ಪಕ್ಷ" : "Chitra Paksha"],
  ];
  elementsList.forEach(([lbl, val], eIdx) => {
    setColor(doc, C_MUTED);
    doc.setFont("times", "bold");
    doc.setFontSize(8.0);
    doc.text(t(lbl).toUpperCase(), ML + eIdx * elemW + 5, y + 6);
    setColor(doc, C_MAROON);
    doc.setFont("times", "bold");
    doc.setFontSize(9.5);
    doc.text(t(val), ML + eIdx * elemW + 5, y + 13);
  });
  y += 25;
  const rashiCards = [
    ["1. Core Astrological Nature & Temperament", sharedData.rashiTemperamentText],
    ["2. Career, Ambition & Success Path", sharedData.rashiCareerText],
    ["3. Emotional Relationships & Marriage Compatibility", sharedData.rashiRelationshipText],
  ];

  for (const [title, desc] of rashiCards) {
    y = addLabelAndParagraph(doc, title, desc, y, t, "Moon Sign Analysis", startNewPage, language);
  }

  y = addLabelAndParagraph(doc, "✦ Chandra Mindset Reflection & Cosmic Mandate", sharedData.chandraMandateText, y, t, "Moon Sign Analysis", startNewPage, language);

  // ─── PAGE 21: NAKSHATRA ANALYSIS ───────────────────────────────────────────
  y = startNewPage("Nakshatra Analysis");
  const starSectionTitle = language === "kn"
    ? `ವೈದಿಕ ಜನ್ಮ ನಕ್ಷತ್ರ: ${t(sharedData.nakshatraName)}`
    : `Vedic Birth Star: ${sharedData.nakshatraName}`;
  const starSectionSub = language === "kn"
    ? `ನಿಮ್ಮ ಜನ್ಮದ ಸಮಯದಲ್ಲಿ ಮನಸ್ಸನ್ನು ಆಳುವ ನಿರ್ದಿಷ್ಟ ನಕ್ಷತ್ರ ಮಂಡಲ · ಅಧಿಪತಿ: ${t(sharedData.nakshatraLord)}`
    : `The specific star constellation ruling your mind at birth · Lord: ${sharedData.nakshatraLord}`;
  y = addSectionHeader(doc, starSectionTitle, starSectionSub, y, t);

  y = addInfoBox(doc, [
    ["Birth Star Star", sharedData.nakshatraName],
    ["Vedic Symbolism", sharedData.nakshatraSymbolismText],
    ["Nakshatra Lord", sharedData.nakshatraLord],
    ["Ruling Deity", sharedData.nakshatraDeityText],
    ["Birth Pada (Quarter)", language === "kn" ? `${sharedData.nakshatraPada}ನೇ ಪಾದ` : `Pada ${sharedData.nakshatraPada} of 4`],
  ], ML, y, CW, t);
  y += 2;

  const starCards = [
    ["Spiritual Nature & Character Predictions", sharedData.nakshatraPersonalityText],
    ["Star-Lord Remedies & Astrological Prescriptions", sharedData.nakshatraRemediesText],
  ];
  for (const [title, desc] of starCards) {
    y = addLabelAndParagraph(doc, title, desc, y, t, "Nakshatra Analysis", startNewPage, language);
  }

  // ─── PAGE 22: VIMSHOTTARI TIMELINE ─────────────────────────────────────────
  y = startNewPage("Vimshottari Dasha");
  y = addSectionHeader(doc, "Vimshottari Mahadasha Timeline", "Sacred Vedic lifetime timeline dictating planetary lords activation sequences", y, t);

  const timelineHeaders = ["Dasha Lord Planet", "Period Start Date", "Period End Date", "Current Phase Status"];
  const timelineCols = [50, 43, 43, 44];
  const timelineRows = sharedData.dashaPeriods.map((period: any) => [
    period.planet, period.start, period.end, period.active ? "ACTIVE NOW ◀" : "Upcoming Phase"
  ]);
  y = addSimpleTable(doc, y, timelineHeaders, timelineRows, timelineCols, "Vimshottari Dasha", t, startNewPage);

  // ─── PAGE 23: ACTIVE MAHADASHA DEEP-DIVE ───────────────────────────────────
  y = startNewPage("Mahadasha Deep-Dive");
  y = addSectionHeader(doc, "Active Mahadasha Deep-Dive Analysis", "Detailed predictions and cosmic trends for your current planetary cycle", y, t);

  if (sharedData.dashaAnalysis) {
    y = addLabel(doc, "Mahadasha Period Analysis", ML, y, t);
    y = addParagraph(doc, sharedData.dashaAnalysis.currentMahadashaPrediction, ML, y, CW, t) + 6;

    const boxW2 = CW / 2 - 3;
    y = addInfoBox(doc, [
      ["Opportunity Window", sharedData.dashaAnalysis.bestPeriodInMaha],
    ], ML, y, boxW2, t);

    addInfoBox(doc, [
      ["Cautionary Advisory", sharedData.dashaAnalysis.cautionPeriodInMaha],
    ], ML + boxW2 + 6, y - 14, boxW2, t);
  }

  // ─── PAGE 24: CAREER & BUSINESS TIMELINES ──────────────────────────────────
  y = startNewPage("Favourable Periods");
  y = addSectionHeader(doc, "Favourable Periods for Career & Business", "Dynamic Dasha & Apahara timelines indicating peak opportunities and professional growth", y, t);

  y = addLabel(doc, "💼 Career & Professional Growth (Ages 15 to 60)", ML, y, t);
  const careerHeaders = ["Dasa", "Apahara", "Period Start", "Period End", "Analysis Rating"];
  const careerCols = [30, 35, 40, 40, 35];
  const careerRows = sharedData.favourableCareerPeriods.map((p: any) => [
    p.dasa, p.apahara, p.start.toLocaleDateString("en-IN"), p.end.toLocaleDateString("en-IN"), p.analysis
  ]);
  y = addSimpleTable(doc, y, careerHeaders, careerRows, careerCols, "Favourable Periods", t, startNewPage) + 4;

  y = addLabel(doc, "📈 Business Expansion & Trade (Ages 15 to 60)", ML, y, t);
  const businessRows = sharedData.favourableBusinessPeriods.map((p: any) => [
    p.dasa, p.apahara, p.start.toLocaleDateString("en-IN"), p.end.toLocaleDateString("en-IN"), p.analysis
  ]);
  y = addSimpleTable(doc, y, careerHeaders, businessRows, careerCols, "Favourable Periods", t, startNewPage);

  // ─── PAGE 25: MARRIAGE & PROPERTY TIMELINES ────────────────────────────────
  y = startNewPage("Favourable Periods");
  y = addSectionHeader(doc, "Favourable Periods for Marriage & House Construction", "Sacred Vedic timings determining relationship union and real estate manifestation", y, t);

  y = addLabel(doc, "💖 Marriage & Conjugal Harmony (Ages 18 to 50)", ML, y, t);
  const marriageRows = sharedData.favourableMarriagePeriods.map((p: any) => [
    p.dasa, p.apahara, p.start.toLocaleDateString("en-IN"), p.end.toLocaleDateString("en-IN"), p.analysis
  ]);
  y = addSimpleTable(doc, y, careerHeaders, marriageRows, careerCols, "Favourable Periods", t, startNewPage) + 4;

  y = addLabel(doc, "🏡 House Construction & Real Estate (Ages 15 to 50)", ML, y, t);
  const houseRows = sharedData.favourableHousePeriods.map((p: any) => [
    p.dasa, p.apahara, p.start.toLocaleDateString("en-IN"), p.end.toLocaleDateString("en-IN"), p.analysis
  ]);
  y = addSimpleTable(doc, y, careerHeaders, houseRows, careerCols, "Favourable Periods", t, startNewPage);

  // ─── PAGE 26: ANTARDASHA DEEP-DIVE (DETAILED PLAN ONLY) ───────────────────
  if (data.plan === "detailed" && sharedData.dashaAnalysis) {
    y = startNewPage("Antardasha Analysis");
    y = addSectionHeader(doc, "Active Antardasha Sub-Period Analysis", "The precise planetary lens currently focusing your immediate life experiences", y, t);

    y = addLabel(doc, "Current Sub-Period Deep-Dive", ML, y, t);
    y = addParagraph(doc, sharedData.dashaAnalysis.currentAntardashaPrediction, ML, y, CW, t) + 6;

    y = addLabel(doc, "Pratyantardasha (Sub-Sub Period) Influence", ML, y, t);
    y = addParagraph(doc, sharedData.dashaAnalysis.currentPratyantarPrediction, ML, y, CW, t);
  }

  // ─── PAGES 27 to 29: UPCOMING FORECASTS (DETAILED PLAN ONLY) ───────────────
  if (data.plan === "detailed" && sharedData.dashaAnalysis) {
    let upcomingPageStarted = false;
    sharedData.dashaAnalysis.upcomingAntardashas.slice(0, 5).forEach((antar: any) => {
      // Build all translated strings first
      const uTitleStr = language === "kn"
        ? `${t(antar.antarLord)} ${t("Antardasha")}`
        : `${antar.antarLord} Sub-Period`;
      const uThemeStr = t(antar.theme).toUpperCase();
      const uBodyStr  = t(antar.detailedPrediction);
      const uDateStr  = `${antar.startDate.toLocaleDateString("en-IN")} - ${antar.endDate.toLocaleDateString("en-IN")}`;
      const boxW3 = (CW - 12) / 2;
      // Measure text blocks
      doc.setFontSize(9.5);
      const uTitleH = measureWrappedTextHeight(doc, uTitleStr, CW - 50, 9.5, language === "kn" ? 5.8 : 5.0);
      doc.setFontSize(7.5);
      const uThemeH = measureWrappedTextHeight(doc, uThemeStr, CW - 50, 7.5, language === "kn" ? 5.0 : 4.2);
      doc.setFontSize(9.5);
      const uBodyH  = measureWrappedTextHeight(doc, uBodyStr, CW - 10, 9.5, language === "kn" ? 5.8 : 4.2);
      // Measure both side-by-side boxes; use tallest
      const uBoxH1 = measureInfoBoxHeight(doc, [[t("Opportunity"), t(antar.bestOpportunity)]], boxW3, t);
      const uBoxH2 = measureInfoBoxHeight(doc, [[t("Caution"),     t(antar.caution)]],          boxW3, t);
      const uBoxRowH = Math.max(uBoxH1, uBoxH2);
      const uCardH  = 5 + uTitleH + uThemeH + 4 + uBodyH + 6 + uBoxRowH + 8;

      // Page break: start new page if card doesn't fit or first card
      if (!upcomingPageStarted || y + uCardH > H - 14) {
        y = startNewPage("Upcoming Forecast");
        y = addSectionHeader(doc, "Upcoming Sub-Period Chronology", "Strategic roadmap of planetary sub-influences for the next few years", y, t);
        upcomingPageStarted = true;
      }

      setFill(doc, C_WHITE);
      setDraw(doc, C_GOLD);
      doc.setLineWidth(0.2);
      doc.roundedRect(ML, y, CW, uCardH, 1.5, 1.5, "FD");

      let uy = y + 5;
      uy = drawWrappedText(doc, uTitleStr, ML + 4, uy, CW - 50, { font: "times", style: "bold", fontSize: 9.5, lineH: language === "kn" ? 5.8 : 5.0, color: C_MAROON });
      uy = drawWrappedText(doc, uThemeStr, ML + 4, uy, CW - 50, { font: "times", style: "italic", fontSize: 7.5, lineH: language === "kn" ? 5.0 : 4.2, color: C_MUTED });

      setColor(doc, C_GOLD_DARK); doc.setFont("times", "bold"); doc.setFontSize(9.5);
      doc.text(uDateStr, W - MR - 4, y + 5, { align: "right" });

      uy += 4;
      uy = drawWrappedText(doc, uBodyStr, ML + 4, uy, CW - 10, { font: "times", style: "normal", fontSize: 9.5, lineH: language === "kn" ? 5.8 : 4.2, color: C_TEXT }) + 6;

      addInfoBox(doc, [[t("Opportunity"), t(antar.bestOpportunity)]], ML + 4, uy, boxW3, t);
      addInfoBox(doc, [[t("Caution"), t(antar.caution)]], ML + 4 + boxW3 + 4, uy, boxW3, t);

      y += uCardH + 6;
    });
  }

  // ─── PAGES 30 to 47: DETAILED DASHA ROADMAP (DETAILED PLAN ONLY) ────────────
  if (data.plan === "detailed" && sharedData.dashaAnalysis) {
    let roadmapPageStarted = false;
    sharedData.dashaRoadmap.forEach((entry: any) => {
      // Build all translated strings first
      const rTitleStr = language === "kn"
        ? `${t(entry.mahaLord)} ${t("Mahadasha")} • ${t(entry.antarLord)} ${t("Antardasha")}`
        : `${entry.mahaLord} Mahadasha • ${entry.antarLord} Antardasha`;
      const rThemeStr = t(entry.theme).toUpperCase();
      const rBodyStr  = t(entry.detailedPrediction);
      const rDateStr  = `${entry.startDate.toLocaleDateString("en-IN")} - ${entry.endDate.toLocaleDateString("en-IN")}`;
      const boxW3 = (CW - 12) / 2;
      // Measure text blocks
      doc.setFontSize(9.5);
      const rTitleH = measureWrappedTextHeight(doc, rTitleStr, CW - 50, 9.5, language === "kn" ? 5.8 : 5.0);
      doc.setFontSize(7.5);
      const rThemeH = measureWrappedTextHeight(doc, rThemeStr, CW - 50, 7.5, language === "kn" ? 5.0 : 4.4);
      doc.setFontSize(9.5);
      const rBodyH  = measureWrappedTextHeight(doc, rBodyStr, CW - 10, 9.5, language === "kn" ? 5.8 : 4.4);
      // Measure actual box heights (may be taller for Kannada multi-line values)
      const rBoxH1 = measureInfoBoxHeight(doc, [[t("Opportunity"), t(entry.bestOpportunity)]], boxW3, t);
      const rBoxH2 = measureInfoBoxHeight(doc, [[t("Caution"),     t(entry.caution)]],          boxW3, t);
      const rBoxRowH = Math.max(rBoxH1, rBoxH2);
      const rCardH  = 5 + rTitleH + rThemeH + 4 + rBodyH + 6 + rBoxRowH + 8;

      // Page break: new page if card doesn't fit or this is the first entry
      if (!roadmapPageStarted || y + rCardH > H - 14) {
        y = startNewPage("Detailed Dasha Roadmap");
        y = addSectionHeader(doc, "Detailed Dasha & Antardasha Predictions to 2065", "Expanded Mahadasha and Antardasha guidance from your current timeline through 2065", y, t);
        roadmapPageStarted = true;
      }

      setFill(doc, C_WHITE);
      setDraw(doc, C_GOLD);
      doc.setLineWidth(0.25);
      doc.roundedRect(ML, y, CW, rCardH, 1.5, 1.5, "FD");

      let ry = y + 5;
      ry = drawWrappedText(doc, rTitleStr, ML + 4, ry, CW - 50, { font: "times", style: "bold", fontSize: 9.5, lineH: language === "kn" ? 5.8 : 5.0, color: C_MAROON });
      ry = drawWrappedText(doc, rThemeStr, ML + 4, ry, CW - 50, { font: "times", style: "italic", fontSize: 7.5, lineH: language === "kn" ? 5.0 : 4.4, color: C_MUTED });

      setColor(doc, C_GOLD_DARK); doc.setFont("times", "bold"); doc.setFontSize(9.5);
      doc.text(rDateStr, W - MR - 4, y + 5, { align: "right" });

      ry += 4;
      ry = drawWrappedText(doc, rBodyStr, ML + 4, ry, CW - 10, { font: "times", style: "normal", fontSize: 9.5, lineH: language === "kn" ? 5.8 : 4.4, color: C_TEXT }) + 6;

      // Draw both boxes at the same baseline so they are equal height
      addInfoBox(doc, [[t("Opportunity"), t(entry.bestOpportunity)]], ML + 4,           ry, boxW3, t);
      addInfoBox(doc, [[t("Caution"),     t(entry.caution)]],         ML + 4 + boxW3 + 4, ry, boxW3, t);

      y += rCardH + 6;
    });
  }

  // ─── PAGES 48 to 51: DASHA REMEDIES ────────────────────────────────────────
  const remedyPages = data.plan === "detailed" ? sharedData.mahaRemedyEntries : [sharedData.mahaRemedyEntries[0]];
  remedyPages.forEach((entry: any, remedyIndex: number) => {
    y = startNewPage(translateMahadashaLabel("Dasha Remedies", language, t));
    y = addSectionHeader(
      doc,
      translateMahadashaLabel(
        remedyIndex === 0 ? "Mahadasha Remedies, Mantras & Spiritual Supports" : "Continuing Mahadasha Remedies to 2065",
        language,
        t
      ),
      translateMahadashaLabel(
        remedyIndex === 0
          ? "Detailed devotional guidance for each Mahadasha period through 2065"
          : "Further Mahadasha-specific remedies, yantras, mantra disciplines, and supportive devotional practices for the remaining periods",
        language,
        t
      ),
      y,
      t
    );

    const remedyTitle =
      language === "kn"
        ? `${t(entry.planet)} ${translateMahadashaLabel("Mahadasha cycle", language, t)}`
        : `${entry.planet} Mahadasha cycle`;
    const deityLine =
      language === "kn"
        ? `${translateMahadashaLabel("Presiding Devata", language, t)}: ${translateMahadashaDeity(entry.guide.deity, language, t)}`
        : `Presiding Devata: ${entry.guide.deity}`;
    const predictionText = t(entry.prediction);
    const guideRows = [
      [translateMahadashaLabel("Morning Prayer", language, t), t(entry.guide.morningPrayer)],
      [translateMahadashaLabel("Main Chanting Mantra", language, t), t(entry.guide.mantra)],
      [translateMahadashaLabel("Chanting Discipline", language, t), t(entry.guide.chanting)],
      [translateMahadashaLabel("Pooja & Offerings", language, t), t(entry.guide.pooja)],
      [translateMahadashaLabel("Dress & Color support", language, t), t(entry.guide.dress)],
      [translateMahadashaLabel("Devata Bhajan", language, t), t(entry.guide.bhajan)],
      [translateMahadashaLabel("Vedic Vrata/Fasting", language, t), t(entry.guide.fasting)],
    ] as const;
    const yantraLabel = translateMahadashaLabel("Digital Yantra", language, t);
    const yantraNote = t(entry.guide.yantraNote);
    const additionalSupport =
      language === "kn"
        ? `${translateMahadashaLabel("Additional Support", language, t)}: ${t(entry.guide.offerings)}`
        : `Additional Support: ${entry.guide.offerings}`;

    const innerX = ML + 5;
    const innerW = CW - 10;
    const labelWidth = language === "kn" ? 52 : 34;
    const valueGap = language === "kn" ? 5 : 4;
    const valueX = innerX + labelWidth + valueGap;
    const valueW = innerW - labelWidth - valueGap;
    const titleWidth = innerW - 48;
    const titleHeight = measureWrappedTextHeight(doc, remedyTitle, titleWidth, 12, 5.4);
    const deityHeight = measureWrappedTextHeight(doc, deityLine, innerW - 42, 9, 4.6);
    const predictionHeight = measureWrappedTextHeight(doc, predictionText, innerW, 9.5, 4.8);
    let guideRowsHeight = 0;
    for (const [label, value] of guideRows) {
      const labelHeight = measureWrappedTextHeight(doc, label, labelWidth, language === "kn" ? 7.8 : 8, 4.6);
      const valueHeight = measureWrappedTextHeight(doc, value, valueW, language === "kn" ? 8.1 : 8.3, 4.6);
      guideRowsHeight += Math.max(4.8, labelHeight, valueHeight) + 1.5;
    }
    const supportWidth = innerW - 52;
    const supportHeight =
      measureWrappedTextHeight(doc, yantraNote, supportWidth, 8.5, 4.4) +
      measureWrappedTextHeight(doc, additionalSupport, supportWidth, 8.5, 4.4) +
      6;
    const cardHeight =
      10 +
      titleHeight +
      1.5 +
      deityHeight +
      5 +
      predictionHeight +
      5 +
      5 +
      guideRowsHeight +
      5 +
      Math.max(46, supportHeight + 6) +
      8;

    setFill(doc, [255, 252, 245]);
    setDraw(doc, C_GOLD);
    doc.setLineWidth(0.3);
    doc.roundedRect(ML, y, CW, cardHeight, 2, 2, "FD");

    setColor(doc, C_MAROON);
    doc.setFont("times", "bold");
    doc.setFontSize(12);
    const titleEndY = drawWrappedText(doc, remedyTitle, innerX, y + 8, titleWidth, {
      font: "times",
      style: "bold",
      fontSize: language === "kn" ? 11.2 : 12,
      lineH: language === "kn" ? 5.8 : 5.4,
      color: C_MAROON,
    });

    const deityEndY = drawWrappedText(doc, deityLine, innerX, titleEndY + 1.5, innerW - 42, {
      font: "times",
      style: "italic",
      fontSize: language === "kn" ? 8.7 : 9,
      lineH: 4.8,
      color: C_MUTED,
    });

    setColor(doc, C_GOLD_DARK);
    doc.setFont("times", "bold");
    doc.setFontSize(10);
    doc.text(`${entry.start.toLocaleDateString("en-IN")} - ${entry.end.toLocaleDateString("en-IN")}`, W - MR - 5, y + 8, { align: "right" });

    let contentY = drawWrappedText(doc, predictionText, innerX, deityEndY + 4, innerW, {
      font: "times",
      style: "normal",
      fontSize: 9.5,
      lineH: 4.8,
      color: C_TEXT,
    }) + 5;

    setColor(doc, C_MAROON);
    doc.setFont("times", "bold");
    doc.setFontSize(9);
    doc.text(translateMahadashaLabel("Spiritual Guidelines & Mantra support:", language, t), innerX, contentY);
    contentY += 5;

    for (const [label, value] of guideRows) {
      const labelEndY = drawWrappedText(doc, label, innerX, contentY, labelWidth, {
        font: "times",
        style: "bold",
        fontSize: language === "kn" ? 7.8 : 8,
        lineH: 4.6,
        color: C_MUTED,
      });
      const valueEndY = drawWrappedText(doc, value, valueX, contentY, valueW, {
        font: "times",
        style: "normal",
        fontSize: language === "kn" ? 8.1 : 8.3,
        lineH: 4.6,
        color: C_TEXT,
      });
      contentY = Math.max(labelEndY, valueEndY) + 1.5;
    }

    const yantraTop = contentY + 2;
    setColor(doc, C_GOLD_DARK);
    doc.setFont("times", "bold");
    doc.setFontSize(8.5);
    doc.text(yantraLabel, innerX, yantraTop);

    setFill(doc, C_WHITE);
    setDraw(doc, C_GOLD);
    doc.roundedRect(innerX, yantraTop + 4, 42, 42, 1, 1, "FD");

    setDraw(doc, C_MAROON);
    doc.setLineWidth(0.2);
    for (let r = 0; r <= 3; r += 1) doc.line(innerX + 6, yantraTop + 11 + r * 9, innerX + 33, yantraTop + 11 + r * 9);
    for (let c = 0; c <= 3; c += 1) doc.line(innerX + 6 + c * 9, yantraTop + 11, innerX + 6 + c * 9, yantraTop + 38);

    setColor(doc, C_MAROON);
    doc.setFont("times", "bold");
    doc.setFontSize(10);
    entry.guide.digitalYantra.forEach((row: number[], rIdx: number) => {
      row.forEach((digit: number, cIdx: number) => {
        doc.text(String(digit), innerX + 10.5 + cIdx * 9, yantraTop + 17.5 + rIdx * 9, { align: "center" });
      });
    });

    let supportY = drawWrappedText(doc, yantraNote, innerX + 52, yantraTop + 8, supportWidth, {
      font: "times",
      style: "normal",
      fontSize: 8.5,
      lineH: 4.4,
      color: C_TEXT,
    }) + 2;
    supportY = drawWrappedText(doc, additionalSupport, innerX + 52, supportY, supportWidth, {
      font: "times",
      style: "normal",
      fontSize: 8.5,
      lineH: 4.4,
      color: C_TEXT,
    });

    y += cardHeight + 6;
  });

  // ─── PAGE 52: LUCKY ASTROLOGICAL ELEMENTS ──────────────────────────────────
  y = startNewPage("Lucky Factors & Remedies");
  y = addSectionHeader(doc, "Lucky Astrological Elements & Supports", "Your cosmic alignments, gemstone suggestions, and mantra guides", y, t);

  const activeRemedyLord = sharedData.remedyPlanet;
  const luckyObj = sharedData.primaryLucky;
  const luckyHalfW = CW / 2 - 3;
  const luckyRows: [string, string][] = [
    ["Lucky Numbers",          luckyObj.numbers],
    ["Ruling Gemstone",        luckyObj.gem],
    ["Cosmic Colors",          luckyObj.colors],
    ["Auspicious Day",         luckyObj.day],
    ["Primary Support Planet", activeRemedyLord],
  ];
  // Pre-measure the info box so the mantra box can use the same height
  const luckyBoxH    = measureInfoBoxHeight(doc, luckyRows, luckyHalfW, t);
  const luckyBoxTopY = y;
  addInfoBox(doc, luckyRows, ML, luckyBoxTopY, luckyHalfW, t);

  // Sacred Beej Mantra Maroon Box — same top + same height as the info box
  const mantraBoxX = ML + luckyHalfW + 6;
  setFill(doc, C_MAROON);
  setDraw(doc, C_GOLD);
  doc.setLineWidth(0.4);
  doc.roundedRect(mantraBoxX, luckyBoxTopY, luckyHalfW, luckyBoxH, 1.5, 1.5, "FD");

  setColor(doc, C_GOLD);
  doc.setFont("times", "bold");
  doc.setFontSize(10);
  doc.text(t("SACRED BEEJ MANTRA"), mantraBoxX + 5, luckyBoxTopY + 8);

  const mantraInnerW = luckyHalfW - 10;
  let mantraY = luckyBoxTopY + 16;
  mantraY = drawWrappedText(doc, t(luckyObj.mantra), mantraBoxX + 5, mantraY, mantraInnerW, {
    font: "times", style: "bolditalic", fontSize: 11, lineH: language === "kn" ? 6.5 : 5.6, color: C_WHITE,
  }) + 3;
  drawWrappedText(doc, t("Recite this mantra 108 times daily in morning."), mantraBoxX + 5, mantraY, mantraInnerW, {
    font: "times", style: "italic", fontSize: 7.5, lineH: 4.2, color: C_GOLD,
  });

  // Advance y past both boxes
  y = luckyBoxTopY + luckyBoxH + 8;

  y = addLabel(doc, "SACRED GEMSTONE & RUDRAKSHA RECOMMENDATIONS", ML, y, t);
  const gemText = language === "kn"
    ? `ನಿಮ್ಮ ನಕ್ಷತ್ರಾಧಿಪತಿ ${t(activeRemedyLord)} ಗಾಗಿ, ಪ್ರಮುಖ ಜೀವರತ್ನವು ${t(luckyObj.gem)} ಆಗಿದೆ. ಶುಕ್ಲ ಪಕ್ಷದ ${t(luckyObj.day)} ಬೆಳಿಗ್ಗೆ ನಿಯೋಜಿತ ಬೆರಳಿನಲ್ಲಿ ೪-೬ ಕ್ಯಾರೆಟ್‌ನ ನೈಸರ್ಗಿಕ, ಕಳಂಕರಹಿತ ${t(luckyObj.gem)} ರತ್ನವನ್ನು ಚಿನ್ನದ ಅಥವಾ ಬೆಳ್ಳಿಯ ಉಂಗುರದಲ್ಲಿ ಧರಿಸುವುದು ಬ್ರಹ್ಮಾಂಡದ ರಕ್ಷಣೆಯನ್ನು ನೀಡುತ್ತದೆ.`
    : `For your Nakshatra lord ${activeRemedyLord}, the primary life gemstone is ${luckyObj.gem}. Wearing a natural, eye-clean ${luckyObj.gem} of 4-6 carats in a gold or silver ring on the specified finger on a ${luckyObj.day} morning during Shukla Paksha brings cosmic protection.`;
  y = addParagraph(doc, gemText, ML, y, CW, t) + 4;

  const rudrakshaText = language === "kn"
    ? `ನಿಮ್ಮ ಜನ್ಮ ಜಾತಕದ ಗಣಿತವು ಪವಿತ್ರ ರುದ್ರಾಕ್ಷಿಯನ್ನು ಧರಿಸಲು ಸೂಚಿಸುತ್ತದೆ. ಈ ದೈವಿಕ ಮಣಿಯು ${t(activeRemedyLord)} ನಿಂದ ಆಳಲ್ಪಡುತ್ತದೆ. ಸೋಮವಾರ ಬೆಳಿಗ್ಗೆ ಶಿವ ಮಂತ್ರಗಳೊಂದಿಗೆ ಇದನ್ನು ಸಕ್ರಿಯಗೊಳಿಸಿದ ನಂತರ ಕೆಂಪು ರೇಷ್ಮೆ ದಾರ ಅಥವಾ ಬೆಳ್ಳಿಯ ಸರದಲ್ಲಿ ಧರಿಸಿ.`
    : `Your birth chart calculations suggest wearing a sacred Rudraksha. This divine bead is ruled by ${activeRemedyLord}. Wear it on a red silk thread or silver chain after energizing it on a Monday morning with Shiva mantras.`;
  y = addParagraph(doc, rudrakshaText, ML, y, CW, t) + 4;

  y = addLabel(doc, "VEDIC NAKSHATRA REMEDIES", ML, y, t);
  const remediesList = [
    "Offer water to the Sun every morning at sunrise",
    "Recite Aditya Hridayam on Sundays",
    "Donate yellow grains or clean ghee on Thursdays",
    "Avoid toxic environments and practice absolute purity",
  ];
  for (const remedy of remediesList) {
    setColor(doc, C_TEXT);
    doc.setFont("times", "normal");
    doc.setFontSize(9.5);
    doc.text(`• ${t(remedy)}`, ML + 4, y);
    y += 5.5;
  }

  // ─── PAGES 53 to 55: SPECIAL AUSPICIOUS YOGAS ──────────────────────────────
  {
    let yogaPageOpen = false;
    const allYogas = sharedData.presentYogas as any[];
    allYogas.forEach((yoga: any) => {
      const yogaNameStr = t(yoga.name).toUpperCase();
      const fullDesc    = t(`${yoga.description}${yoga.prediction ? " " + yoga.prediction : ""}`);
      doc.setFontSize(9.5);
      const nameH  = measureWrappedTextHeight(doc, yogaNameStr, CW - 10, 9.5, language === "kn" ? 5.8 : 5.0);
      const descH  = measureWrappedTextHeight(doc, fullDesc,    CW - 10, 9.5, language === "kn" ? 5.8 : 4.4);
      const yCardH = 5 + nameH + 3 + descH + 6;

      if (!yogaPageOpen || y + yCardH > H - 14) {
        y = startNewPage("Planetary Yogas");
        y = addSectionHeader(doc, "Special Auspicious Yogas & Combinations", "Vedic combinations formed by planet conjunctions and their life-changing results", y, t);
        yogaPageOpen = true;
      }

      setFill(doc, C_LIGHT_ALT);
      setDraw(doc, C_GOLD);
      doc.setLineWidth(0.2);
      doc.roundedRect(ML, y, CW, yCardH, 1.5, 1.5, "FD");

      let yyPos = y + 5;
      yyPos = drawWrappedText(doc, yogaNameStr, ML + 4, yyPos, CW - 10, {
        font: "times", style: "bold", fontSize: 9.5, lineH: language === "kn" ? 5.8 : 5.0, color: C_MAROON,
      }) + 3;
      drawWrappedText(doc, fullDesc, ML + 4, yyPos, CW - 10, {
        font: "times", style: "normal", fontSize: 9.5, lineH: language === "kn" ? 5.8 : 4.4, color: C_TEXT,
      });
      y += yCardH + 4;
    });
  }

  // ─── PAGE 56 & 57: ASHTAKAVARGA PREDICTIONS ─────────────────────────────────
  // Page 56: Bindu table + Surya + Chandra cards
  y = startNewPage("Ashtakavarga");
  y = addSectionHeader(doc, "Ashtakavarga Bindu Table & Planetary Strengths", "The mathematical distribution of auspicious points (Bindus) for each planet across the 12 Sanskrit Signs", y, t);

  // Intro paragraph
  const avIntro = language === "kn"
    ? `ಅಷ್ಟಕವರ್ಗ ಎಂಬುದು ವೈದಿಕ ಜ್ಯೋತಿಷ್ಯದಲ್ಲಿ ಏಳು ಪ್ರಾಥಮಿಕ ಗ್ರಹಗಳ ಸಮ್ಮಿಳಿತ ಪ್ರಭಾವವನ್ನು ೧೨ ರಾಶಿಗಳ ಮೇಲೆ ಮೌಲ್ಯೀಕರಿಸುವ ಗಣಿತ ವ್ಯವಸ್ಥೆ. ಬಿಂದುಗಳು ಒಂದು ಗ್ರಹಕ್ಕೆ ನಿರ್ದಿಷ್ಟ ರಾಶಿಯಲ್ಲಿ ಇರುವ ರಕ್ಷಣೆ, ಶಕ್ತಿ ಮತ್ತು ಬೆಂಬಲದ ಮಟ್ಟವನ್ನು ಪ್ರತಿನಿಧಿಸುತ್ತವೆ.`
    : `Ashtakavarga evaluates the collective influence of the seven primary planets (grahas) on the 12 Sanskrit Signs. The Bindus represent the level of protection, strength, and support a planet enjoys in a particular rasi. The asterisk (*) marks the natal sign of each planet in your chart.`;
  y = addParagraph(doc, avIntro, ML, y, CW, t) + 3;

  // ── Bindu Table ──────────────────────────────────────────────────────────────
  const SANSKRIT_SIGNS_PDF = [
    "Mesha", "Vrishabha", "Mithuna", "Karkata", "Simha", "Kanya",
    "Tula", "Vrischika", "Dhanu", "Makara", "Kumbha", "Meena"
  ];
  const avPlanetArrays = [
    sharedData.suryaArr, sharedData.chandraArr, sharedData.marsArr,
    sharedData.mercuryArr, sharedData.jupiterArr, sharedData.venusArr, sharedData.saturnArr
  ];
  const avPlanetIdxs = [
    sharedData.sunSignIdx, sharedData.moonSignIdx, sharedData.marsSignIdx,
    sharedData.mercurySignIdx, sharedData.jupiterSignIdx, sharedData.venusSignIdx, sharedData.saturnSignIdx
  ];
  const avPlanetHeaders = ["Sign", "Su", "Ch", "Ku", "Bu", "Gu", "Sh", "Sa", "Total"];
  const avColWidths = [24, 18, 18, 18, 18, 18, 18, 18, 22];

  // Header row
  setFill(doc, C_MAROON);
  doc.rect(ML, y - 3, CW, 7, "F");
  setColor(doc, C_GOLD);
  doc.setFont("times", "bold");
  doc.setFontSize(7.2);
  let hx = ML + 2;
  avPlanetHeaders.forEach((h, i) => {
    doc.text(h, hx, y + 1);
    hx += avColWidths[i];
  });
  y += 6;

  SANSKRIT_SIGNS_PDF.forEach((sign, i) => {
    if (y > H - 14) y = startNewPage("Ashtakavarga");
    if (i % 2 === 1) {
      setFill(doc, C_LIGHT_ALT);
      doc.rect(ML, y - 2.5, CW, 6, "F");
    }
    setColor(doc, C_MAROON);
    doc.setFont("times", "bold");
    doc.setFontSize(7.0);
    let rx = ML + 2;
    doc.text(t(sign), rx, y + 1);
    rx += avColWidths[0];

    let rowTotal = 0;
    avPlanetArrays.forEach((arr, pi) => {
      const val = arr[i];
      rowTotal += val;
      const isNatal = avPlanetIdxs[pi] === i;
      setColor(doc, isNatal ? C_MAROON : C_TEXT);
      doc.setFont("times", isNatal ? "bold" : "normal");
      doc.setFontSize(7.0);
      doc.text(String(val) + (isNatal ? "*" : ""), rx, y + 1);
      rx += avColWidths[pi + 1];
    });

    setColor(doc, C_MAROON);
    doc.setFont("times", "bold");
    doc.text(String(rowTotal), rx, y + 1);
    y += 6;
  });
  y += 4;

  // ── Surya & Chandra prediction cards ─────────────────────────────────────────
  const suryaPoints = sharedData.suryaArr[sharedData.sunSignIdx];
  const chandraPoints = sharedData.chandraArr[sharedData.moonSignIdx];

  const avPredictions: { planet: string; natalSign: string; points: number; texts: [string, string, string] }[] = [
    {
      planet: "Surya (Sun)",
      natalSign: SANSKRIT_SIGNS_PDF[sharedData.sunSignIdx],
      points: suryaPoints,
      texts: [
        `Dear ${data.name}, with an impressive score of ${suryaPoints} Bindus in Surya's Ashtakavarga, your solar energy is incredibly powerful and radiant. This indicates a natural authority, excellent leadership abilities, strong health, and the capacity to command respect in professional and social spheres. Your self-worth and confidence will be exceptionally stable, helping you overcome obstacles with pure will and integrity.`,
        `Dear ${data.name}, with a balanced score of ${suryaPoints} Bindus in Surya's Ashtakavarga, your solar drive is steady and reliable. You have a healthy level of self-assurance and ambition without being overly domineering. This enables you to work well within organizational hierarchies while retaining your individuality. Career growth is steady, and you maintain cordial relations with mentors and father figures.`,
        `Dear ${data.name}, your score of ${suryaPoints} Bindus in Surya's Ashtakavarga is on the lower side, suggesting that your solar energy faces some blockages. You might experience occasional self-doubt, low energy levels, or friction with authority figures. Cultivating self-belief, waking up early, and offering water to the morning Sun (Surya Arghya) will significantly strengthen your solar vitality.`,
      ],
      knTexts: [
        `ಪ್ರಿಯ ${data.name}, ಸೂರ್ಯನ ಅಷ್ಟಕವರ್ಗದಲ್ಲಿ ${suryaPoints} ಬಿಂದುಗಳ ಉತ್ತಮ ಅಂಕದೊಂದಿಗೆ, ನಿಮ್ಮ ಸೌರ ಶಕ್ತಿ ಅತ್ಯಂತ ಪ್ರಬಲ ಮತ್ತು ತೇಜಸ್ವಿಯಾಗಿದೆ. ಇದು ನೈಸರ್ಗಿಕ ನಾಯಕತ್ವ, ಅತ್ಯುತ್ತಮ ನಾಯಕತ್ವ ಸಾಮರ್ಥ್ಯ, ಪ್ರಬಲ ಆರೋಗ್ಯ ಮತ್ತು ವೃತ್ತಿ ಹಾಗೂ ಸಾಮಾಜಿಕ ಕ್ಷೇತ್ರಗಳಲ್ಲಿ ಗೌರವ ಗಳಿಸುವ ಸಾಮರ್ಥ್ಯವನ್ನು ಸೂಚಿಸುತ್ತದೆ. ನಿಮ್ಮ ಆತ್ಮಸ್ಥೈರ್ಯ ಮತ್ತು ಆತ್ಮವಿಶ್ವಾಸ ಅಸಾಧಾರಣವಾಗಿ ಸ್ಥಿರವಾಗಿರಲಿದ್ದು, ಶುದ್ಧ ಇಚ್ಛಾಶಕ್ತಿ ಮತ್ತು ಪ್ರಾಮಾಣಿಕತೆಯಿಂದ ಅಡೆತಡೆಗಳನ್ನು ಮೀರಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.`,
        `ಪ್ರಿಯ ${data.name}, ಸೂರ್ಯನ ಅಷ್ಟಕವರ್ಗದಲ್ಲಿ ${suryaPoints} ಬಿಂದುಗಳ ಸಮತೋಲಿತ ಅಂಕದೊಂದಿಗೆ, ನಿಮ್ಮ ಸೌರ ಪ್ರೇರಣೆ ಸ್ಥಿರ ಮತ್ತು ವಿಶ್ವಾಸಾರ್ಹವಾಗಿದೆ. ಸ್ವಾಭಿಮಾನ ಮತ್ತು ಮಹತ್ವಾಕಾಂಕ್ಷೆಯ ಆರೋಗ್ಯಕರ ಮಟ್ಟ ನಿಮ್ಮಲ್ಲಿದ್ದು ವೃತ್ತಿ ಬೆಳವಣಿಗೆ ಸ್ಥಿರವಾಗಿರುತ್ತದೆ. ಗುರು ಮತ್ತು ಪಿತ್ರಾರ್ಥ ವ್ಯಕ್ತಿಗಳೊಂದಿಗೆ ನಿಮ್ಮ ಸಂಬಂಧ ಸೌಹಾರ್ದಯುತವಾಗಿ ಉಳಿಯಲಿದೆ.`,
        `ಪ್ರಿಯ ${data.name}, ಸೂರ್ಯನ ಅಷ್ಟಕವರ್ಗದಲ್ಲಿ ${suryaPoints} ಬಿಂದುಗಳ ಅಂಕ ಕಡಿಮೆ ಇದ್ದು, ನಿಮ್ಮ ಸೌರ ಶಕ್ತಿ ಕೆಲವು ತಡೆಗಳನ್ನು ಎದುರಿಸುತ್ತಿದೆ. ಆಗಾಗ ಆತ್ಮವಿಶ್ವಾಸದ ಕೊರತೆ, ಕಡಿಮೆ ಶಕ್ತಿ ಅಥವಾ ಅಧಿಕಾರಿಗಳೊಂದಿಗೆ ತಿಕ್ಕಾಟ ಉಂಟಾಗಬಹುದು. ಆತ್ಮಸ್ಥೈರ್ಯ ಬೆಳೆಸಿಕೊಳ್ಳಿ, ಬೆಳಿಗ್ಗೆ ಬೇಗ ಏಳಿ ಮತ್ತು ಸೂರ್ಯೋದಯ ಸಮಯದಲ್ಲಿ ಸೂರ್ಯಾರ್ಘ್ಯ ಕೊಡಿ.`,
      ],
    },
    {
      planet: "Chandra (Moon)",
      natalSign: SANSKRIT_SIGNS_PDF[sharedData.moonSignIdx],
      points: chandraPoints,
      texts: [
        `Dear ${data.name}, your stellar score of ${chandraPoints} Bindus in Chandra's Ashtakavarga blesses you with exceptional emotional resilience and mental stability. Your intuition is deep, and your capacity to nurture and empathize with others is a major life asset. This placement ensures a calm, peaceful mind and strong support from your mother or motherly figures throughout life.`,
        `Dear ${data.name}, with ${chandraPoints} Bindus in Chandra's Ashtakavarga, you possess a balanced and sensible emotional nature. While you feel things deeply, you generally have the maturity to process feelings logically, avoiding extreme mood swings. Your domestic life and mental peace remain stable, providing a secure foundation for your daily pursuits.`,
        `Dear ${data.name}, a score of ${chandraPoints} Bindus in Chandra's Ashtakavarga indicates that your emotional sphere requires conscious care. You may be prone to emotional fluctuations, anxiety, or feelings of isolation. Practicing meditation, keeping a journal, and drinking water from silver vessels can help ground your lunar energies.`,
      ],
      knTexts: [
        `ಪ್ರಿಯ ${data.name}, ಚಂದ್ರನ ಅಷ್ಟಕವರ್ಗದಲ್ಲಿ ${chandraPoints} ಬಿಂದುಗಳ ಉತ್ತಮ ಅಂಕ ನಿಮಗೆ ಅಸಾಧಾರಣ ಭಾವನಾತ್ಮಕ ಸ್ಥಿತಿಸ್ಥಾಪಕತ್ವ ಮತ್ತು ಮಾನಸಿಕ ಸ್ಥಿರತೆಯನ್ನು ನೀಡುತ್ತದೆ. ನಿಮ್ಮ ಅಂತಃಪ್ರಜ್ಞೆ ಆಳವಾಗಿದ್ದು, ಇತರರನ್ನು ಪೋಷಿಸುವ ಮತ್ತು ಅನುಭೂತಿ ತೋರಿಸುವ ಸಾಮರ್ಥ್ಯ ಪ್ರಮುಖ ಜೀವನ ಸಂಪತ್ತಾಗಿದೆ. ಈ ಸ್ಥಾನ ಶಾಂತ ಮನಸ್ಸು ಮತ್ತು ತಾಯಿ ಅಥವಾ ತಾಯಿ ಸ್ಥಾನದ ವ್ಯಕ್ತಿಗಳ ಬೆಂಬಲವನ್ನು ಜೀವನಪರ್ಯಂತ ಖಾತ್ರಿಪಡಿಸುತ್ತದೆ.`,
        `ಪ್ರಿಯ ${data.name}, ಚಂದ್ರನ ಅಷ್ಟಕವರ್ಗದಲ್ಲಿ ${chandraPoints} ಬಿಂದುಗಳೊಂದಿಗೆ, ನೀವು ಸಮತೋಲಿತ ಮತ್ತು ವಿವೇಕಯುತ ಭಾವನಾತ್ಮಕ ಸ್ವಭಾವ ಹೊಂದಿದ್ದೀರಿ. ಭಾವನೆಗಳನ್ನು ತಾರ್ಕಿಕವಾಗಿ ನಿಭಾಯಿಸುವ ಪ್ರಬುದ್ಧತೆ ನಿಮ್ಮಲ್ಲಿದ್ದು, ಗೃಹ ಜೀವನ ಮತ್ತು ಮಾನಸಿಕ ಶಾಂತಿ ಸ್ಥಿರವಾಗಿರುತ್ತದೆ.`,
        `ಪ್ರಿಯ ${data.name}, ಚಂದ್ರನ ಅಷ್ಟಕವರ್ಗದಲ್ಲಿ ${chandraPoints} ಬಿಂದುಗಳ ಅಂಕ ನಿಮ್ಮ ಭಾವನಾ ಕ್ಷೇತ್ರಕ್ಕೆ ಸಚೇತನ ಗಮನ ಅಗತ್ಯ ಎಂದು ಸೂಚಿಸುತ್ತದೆ. ಭಾವನಾ ಏರಿಳಿತ, ಆತಂಕ ಅಥವಾ ಏಕಾಂಗಿತನದ ಭಾವನೆ ಬರಬಹುದು. ಧ್ಯಾನ, ಡೈರಿ ಬರೆಯುವುದು ಮತ್ತು ಬೆಳ್ಳಿ ಪಾತ್ರೆಯಲ್ಲಿ ನೀರು ಕುಡಿಯುವುದು ಚಂದ್ರ ಶಕ್ತಿಯನ್ನು ಸ್ಥಿರಗೊಳಿಸಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.`,
      ],
    },
  ];

  function drawAvCard(cardData: typeof avPredictions[0]) {
    const { planet, natalSign, points, texts, knTexts } = cardData as any;
    const grade = points >= 5 ? "Strong" : points >= 3 ? "Balanced" : "Challenging";
    const bodyText = points >= 5 ? texts[0] : points >= 3 ? texts[1] : texts[2];
    const titleStr = t(`${planet} Ashtakavarga Predictions`);
    const subStr = `${t("Natal Sign")}: ${t(natalSign)} · ${t("Score")}: ${points} ${t("Bindus")} (${t(grade)})`;
    // For Kannada, use pre-built Kannada body text; for English fall through t()
    const bodyStr = (language === "kn" && knTexts)
      ? (points >= 5 ? knTexts[0] : points >= 3 ? knTexts[1] : knTexts[2])
      : t(bodyText);

    doc.setFontSize(8);
    const titleH = measureWrappedTextHeight(doc, titleStr, CW - 10, 8, 4.6);
    doc.setFontSize(7.5);
    const subH = measureWrappedTextHeight(doc, subStr, CW - 10, 7.5, 4.2);
    doc.setFontSize(9.5);
    const bodyH = measureWrappedTextHeight(doc, bodyStr, CW - 10, 9.5, 5.2);
    const cardH = 6 + titleH + subH + bodyH + 8;

    if (y + cardH > H - 14) y = startNewPage("Ashtakavarga");

    setFill(doc, [255, 254, 249]);
    setDraw(doc, C_GOLD);
    doc.setLineWidth(0.2);
    doc.roundedRect(ML, y, CW, cardH, 1.5, 1.5, "FD");

    let cy2 = y + 5;
    cy2 = drawWrappedText(doc, titleStr, ML + 4, cy2, CW - 10, { font: "times", style: "bold", fontSize: 8, lineH: 4.6, color: C_MAROON });
    cy2 = drawWrappedText(doc, subStr, ML + 4, cy2 + 1, CW - 10, { font: "times", style: "italic", fontSize: 7.5, lineH: 4.2, color: C_MUTED });
    drawWrappedText(doc, bodyStr, ML + 4, cy2 + 2, CW - 10, { font: "times", style: "normal", fontSize: 9.5, lineH: 5.2, color: C_TEXT });
    y += cardH + 4;
  }

  for (const card of avPredictions) drawAvCard(card);

  // ─── Page 57: remaining 5 planet cards + Sarvashtakavarga ─────────────────
  y = startNewPage("Ashtakavarga");
  y = addSectionHeader(doc, "Ashtakavarga Interpretations & Sarvashtakavarga", "Continuing deep-dive planetary strength predictions and final composite cosmic score", y, t);

  const kujaPoints = sharedData.marsArr[sharedData.marsSignIdx];
  const budhaPoints = sharedData.mercuryArr[sharedData.mercurySignIdx];
  const guruPoints = sharedData.jupiterArr[sharedData.jupiterSignIdx];
  const shukraPoints = sharedData.venusArr[sharedData.venusSignIdx];
  const shaniPoints = sharedData.saturnArr[sharedData.saturnSignIdx];

  const avPredictions2: { planet: string; natalSign: string; points: number; texts: [string, string, string] }[] = [
    {
      planet: "Kuja (Mars)",
      natalSign: SANSKRIT_SIGNS_PDF[sharedData.marsSignIdx],
      points: kujaPoints,
      texts: [
        `Dear ${data.name}, a robust score of ${kujaPoints} Bindus in Kuja's Ashtakavarga gives you immense courage, stamina, and drive. You are an action-oriented leader who excels under pressure and handles competition with ease. Your ability to execute projects with focus and determination is exceptional. Your physical energy and passion are keys to your success.`,
        `Dear ${data.name}, with a balanced ${kujaPoints} Bindus in Kuja's Ashtakavarga, your energy levels and courage are well-moderated. You possess enough ambition and drive to achieve your goals, but you also know when to hold back and avoid unnecessary conflicts. This helps you maintain long-term stamina without burning out or initiating impulsive disputes.`,
        `Dear ${data.name}, your score of ${kujaPoints} Bindus in Kuja's Ashtakavarga is challenging, which may manifest as low energy, lack of initiative, or a tendency to get frustrated easily. Engaging in regular physical exercise, chanting the Mangal Mantra, and practicing patience will help direct your Martian energy constructively.`,
      ],
      knTexts: [
        `ಪ್ರಿಯ ${data.name}, ಕುಜನ ಅಷ್ಟಕವರ್ಗದಲ್ಲಿ ${kujaPoints} ಬಿಂದುಗಳ ಉತ್ತಮ ಅಂಕ ನಿಮಗೆ ಅಪಾರ ಧೈರ್ಯ, ಸಹಿಷ್ಣುತೆ ಮತ್ತು ಚಾಲನಾ ಶಕ್ತಿ ನೀಡುತ್ತದೆ. ಒತ್ತಡದಲ್ಲಿ ಶ್ರೇಷ್ಠ ಸಾಧನೆ ಮಾಡುವ, ಸ್ಪರ್ಧೆ ಎದುರಿಸುವ ಕ್ರಿಯಾಶೀಲ ನಾಯಕ ನೀವು. ಗಮನ ಮತ್ತು ದೃಢನಿರ್ಧಾರದಿಂದ ಯೋಜನೆ ಕಾರ್ಯಗತಗೊಳಿಸುವ ಸಾಮರ್ಥ್ಯ ಅಸಾಧಾರಣ.`,
        `ಪ್ರಿಯ ${data.name}, ಕುಜನ ಅಷ್ಟಕವರ್ಗದಲ್ಲಿ ${kujaPoints} ಬಿಂದುಗಳ ಸಮತೋಲಿತ ಅಂಕ ನಿಮ್ಮ ಶಕ್ತಿ ಮತ್ತು ಧೈರ್ಯ ಸಮ ಪ್ರಮಾಣದಲ್ಲಿ ನಿಯಂತ್ರಿತವಾಗಿದೆ. ಗುರಿ ಸಾಧನೆಗೆ ಸಾಕಷ್ಟು ಮಹತ್ವಾಕಾಂಕ್ಷೆ ಇದ್ದರೂ ಅನಾವಶ್ಯಕ ಸಂಘರ್ಷ ತಪ್ಪಿಸಿ ದೀರ್ಘಕಾಲದ ಶ್ರಮ ಕಾಪಾಡಿಕೊಳ್ಳುವ ಚಾಣಾಕ್ಷತೆ ನಿಮ್ಮಲ್ಲಿದೆ.`,
        `ಪ್ರಿಯ ${data.name}, ಕುಜನ ಅಷ್ಟಕವರ್ಗದಲ್ಲಿ ${kujaPoints} ಬಿಂದುಗಳ ಸವಾಲಿನ ಅಂಕ ಕಡಿಮೆ ಶಕ್ತಿ, ಉಪಕ್ರಮದ ಕೊರತೆ ಅಥವಾ ಸಿಟ್ಟಿನ ಪ್ರವೃತ್ತಿ ತೋರಿಸಬಹುದು. ನಿಯಮಿತ ವ್ಯಾಯಾಮ, ಮಂಗಳ ಮಂತ್ರ ಜಪ ಮತ್ತು ತಾಳ್ಮೆ ಅಭ್ಯಾಸ ಮಾಡಿ.`,
      ],
    },
    {
      planet: "Budha (Mercury)",
      natalSign: SANSKRIT_SIGNS_PDF[sharedData.mercurySignIdx],
      points: budhaPoints,
      texts: [
        `Dear ${data.name}, an outstanding score of ${budhaPoints} Bindus in Budha's Ashtakavarga highlights your highly refined intellect and analytical mind. You possess excellent communication skills, sharp wit, and a natural aptitude for business, writing, or strategic planning. Your ability to learn new concepts rapidly and articulate them persuasively is a stellar gift.`,
        `Dear ${data.name}, with a healthy score of ${budhaPoints} Bindus in Budha's Ashtakavarga, your communication and logical capacities are steady and balanced. You are a sensible thinker who makes rational, practical decisions. Your speech is pleasant, and your social interactions are cordial.`,
        `Dear ${data.name}, with ${budhaPoints} Bindus in Budha's Ashtakavarga, you might experience occasional communication gaps, mental fatigue, or difficulty in making decisions. Maintaining clear written records, avoiding gossip, and learning to simplify your thoughts will assist in sharpening your Mercury's potential.`,
      ],
      knTexts: [
        `ಪ್ರಿಯ ${data.name}, ಬುಧನ ಅಷ್ಟಕವರ್ಗದಲ್ಲಿ ${budhaPoints} ಬಿಂದುಗಳ ಉತ್ತಮ ಅಂಕ ನಿಮ್ಮ ಉತ್ಕೃಷ್ಟ ಬುದ್ಧಿ ಮತ್ತು ವಿಶ್ಲೇಷಣಾ ಮನಸ್ಸನ್ನು ಎತ್ತಿ ತೋರಿಸುತ್ತದೆ. ಅತ್ಯುತ್ತಮ ಸಂವಹನ ಕೌಶಲ, ತೀಕ್ಷ್ಣ ಬುದ್ಧಿ ಮತ್ತು ವ್ಯವಹಾರ, ಬರವಣಿಗೆ ಅಥವಾ ತಂತ್ರ ಯೋಜನೆಯಲ್ಲಿ ನೈಸರ್ಗಿಕ ಪ್ರತಿಭೆ ನಿಮ್ಮಲ್ಲಿದೆ.`,
        `ಪ್ರಿಯ ${data.name}, ಬುಧನ ಅಷ್ಟಕವರ್ಗದಲ್ಲಿ ${budhaPoints} ಬಿಂದುಗಳ ಸಮತೋಲಿತ ಅಂಕ ನಿಮ್ಮ ಸಂವಹನ ಮತ್ತು ತಾರ್ಕಿಕ ಸಾಮರ್ಥ್ಯ ಸ್ಥಿರ ಮತ್ತು ಸಮತೋಲಿತ ಎಂದು ತೋರಿಸುತ್ತದೆ. ವ್ಯಾವಹಾರಿಕ ನಿರ್ಧಾರ ತೆಗೆದುಕೊಳ್ಳುವ ಸಂವೇದನಾಶೀಲ ಚಿಂತಕ ನೀವಾಗಿದ್ದೀರಿ.`,
        `ಪ್ರಿಯ ${data.name}, ಬುಧನ ಅಷ್ಟಕವರ್ಗದಲ್ಲಿ ${budhaPoints} ಬಿಂದುಗಳ ಅಂಕ ಆಗಾಗ ಸಂವಹನ ಅಂತರ, ಮಾನಸಿಕ ದಣಿವು ಅಥವಾ ನಿರ್ಧಾರ ತೆಗೆದುಕೊಳ್ಳಲು ಕಷ್ಟ ಉಂಟಾಗಬಹುದು. ಸ್ಪಷ್ಟ ಲಿಖಿತ ದಾಖಲೆ ಇರಿಸಿ, ಚಾಡಿ ಮಾತು ತಪ್ಪಿಸಿ ಮತ್ತು ಆಲೋಚನೆ ಸರಳಗೊಳಿಸಲು ಕಲಿಯಿರಿ.`,
      ],
    },
    {
      planet: "Guru (Jupiter)",
      natalSign: SANSKRIT_SIGNS_PDF[sharedData.jupiterSignIdx],
      points: guruPoints,
      texts: [
        `Dear ${data.name}, your exceptional score of ${guruPoints} Bindus in Guru's Ashtakavarga brings immense divine grace, wisdom, and fortune into your life. You have a philosophical outlook, high moral values, and a natural desire for higher learning and spiritual growth. This strong energy attracts prosperity, excellent mentors, and opportunities for expansion.`,
        `Dear ${data.name}, with a balanced ${guruPoints} Bindus in Guru's Ashtakavarga, you possess a solid, practical sense of wisdom and standard level of luck. You value ethics and learning, seeking to apply them in your everyday life.`,
        `Dear ${data.name}, a lower score of ${guruPoints} Bindus in Guru's Ashtakavarga suggests that divine guidance and good fortune might feel delayed at times. Honoring teachers, donating to spiritual or educational causes, and practicing gratitude will help open up your Jupiterian blessings.`,
      ],
      knTexts: [
        `ಪ್ರಿಯ ${data.name}, ಗುರುವಿನ ಅಷ್ಟಕವರ್ಗದಲ್ಲಿ ${guruPoints} ಬಿಂದುಗಳ ಅಸಾಧಾರಣ ಅಂಕ ನಿಮ್ಮ ಜೀವನದಲ್ಲಿ ಅಪಾರ ದೈವಿಕ ಕೃಪೆ, ಜ್ಞಾನ ಮತ್ತು ಭಾಗ್ಯ ತರುತ್ತದೆ. ತಾತ್ವಿಕ ದೃಷ್ಟಿ, ಉಚ್ಚ ನೈತಿಕ ಮೌಲ್ಯಗಳು ಮತ್ತು ಆಧ್ಯಾತ್ಮಿಕ ಬೆಳವಣಿಗೆಯ ಬಯಕೆ ಸಮೃದ್ಧಿ ಮತ್ತು ವಿಸ್ತರಣೆ ಸೆಳೆಯುತ್ತದೆ.`,
        `ಪ್ರಿಯ ${data.name}, ಗುರುವಿನ ಅಷ್ಟಕವರ್ಗದಲ್ಲಿ ${guruPoints} ಬಿಂದುಗಳ ಸಮತೋಲಿತ ಅಂಕ ಜ್ಞಾನ ಮತ್ತು ಭಾಗ್ಯ ಸ್ಥಿರ ಪ್ರಮಾಣದಲ್ಲಿ ಇದೆ ಎಂದು ತೋರಿಸುತ್ತದೆ. ನೈತಿಕತೆ ಮತ್ತು ಅಧ್ಯಯನಕ್ಕೆ ಬೆಲೆ ನೀಡಿ ಅವುಗಳನ್ನು ದೈನಂದಿನ ಜೀವನದಲ್ಲಿ ಅಳವಡಿಸಿಕೊಳ್ಳುತ್ತೀರಿ.`,
        `ಪ್ರಿಯ ${data.name}, ಗುರುವಿನ ಅಷ್ಟಕವರ್ಗದಲ್ಲಿ ${guruPoints} ಬಿಂದುಗಳ ಕಡಿಮೆ ಅಂಕ ದೈವಿಕ ಮಾರ್ಗದರ್ಶನ ಮತ್ತು ಸೌಭಾಗ್ಯ ಕೆಲವೊಮ್ಮೆ ತಡವಾಗಿ ಅನಿಸಬಹುದು. ಗುರುಗಳನ್ನು ಗೌರವಿಸಿ, ಆಧ್ಯಾತ್ಮಿಕ ಕಾರ್ಯಗಳಿಗೆ ದಾನ ಮಾಡಿ ಮತ್ತು ಕೃತಜ್ಞತೆ ಅಭ್ಯಾಸ ಮಾಡಿ.`,
      ],
    },
    {
      planet: "Shukra (Venus)",
      natalSign: SANSKRIT_SIGNS_PDF[sharedData.venusSignIdx],
      points: shukraPoints,
      texts: [
        `Dear ${data.name}, a wonderful score of ${shukraPoints} Bindus in Shukra's Ashtakavarga indicates a highly refined aesthetic sense, charisma, and a natural capacity for love and luxury. You attract harmonious relationships, artistic appreciation, and comfort easily.`,
        `Dear ${data.name}, with a balanced score of ${shukraPoints} Bindus in Shukra's Ashtakavarga, your relationships and material desires are well-regulated. You appreciate comforts and seek pleasant partnerships without getting overly attached to materialistic pursuits.`,
        `Dear ${data.name}, your score of ${shukraPoints} Bindus in Shukra's Ashtakavarga is on the lower side, which can sometimes bring relationship hurdles, creative blocks, or dissatisfaction with material comforts. Cultivating self-love and honoring women will steady your Venusian energy.`,
      ],
      knTexts: [
        `ಪ್ರಿಯ ${data.name}, ಶುಕ್ರನ ಅಷ್ಟಕವರ್ಗದಲ್ಲಿ ${shukraPoints} ಬಿಂದುಗಳ ಉತ್ತಮ ಅಂಕ ಅತ್ಯಂತ ಪರಿಷ್ಕೃತ ಸೌಂದರ್ಯ ಪ್ರಜ್ಞೆ, ಕಾಂತಿ ಮತ್ತು ಪ್ರೀತಿ ಮತ್ತು ಐಶ್ವರ್ಯದ ನೈಸರ್ಗಿಕ ಸಾಮರ್ಥ್ಯ ಸೂಚಿಸುತ್ತದೆ. ಸಾಮರಸ್ಯದ ಸಂಬಂಧ ಮತ್ತು ಸೌಕರ್ಯ ಸಹಜವಾಗಿ ಆಕರ್ಷಿತವಾಗುತ್ತದೆ.`,
        `ಪ್ರಿಯ ${data.name}, ಶುಕ್ರನ ಅಷ್ಟಕವರ್ಗದಲ್ಲಿ ${shukraPoints} ಬಿಂದುಗಳ ಸಮತೋಲಿತ ಅಂಕ ಸಂಬಂಧ ಮತ್ತು ಭೌತಿಕ ಬಯಕೆಗಳು ಸುಸಂಘಟಿತ ಎಂದು ತೋರಿಸುತ್ತದೆ. ಸೌಕರ್ಯ ಮೆಚ್ಚಿ ಆದರೆ ಭೌತಿಕತೆಗೆ ಅತಿ ಅಂಟಿಕೊಳ್ಳದೆ ಸುಖಕರ ಸಂಬಂಧ ಅರಸುತ್ತೀರಿ.`,
        `ಪ್ರಿಯ ${data.name}, ಶುಕ್ರನ ಅಷ್ಟಕವರ್ಗದಲ್ಲಿ ${shukraPoints} ಬಿಂದುಗಳ ಅಂಕ ಕೆಲವೊಮ್ಮೆ ಸಂಬಂಧದ ಅಡೆತಡೆ, ಸೃಜನಶೀಲ ತಡೆ ಅಥವಾ ಭೌತಿಕ ಸೌಕರ್ಯದ ಅಸಮಾಧಾನ ತರಬಹುದು. ಸ್ವಪ್ರೀತಿ ಬೆಳೆಸಿ ಮತ್ತು ಮಹಿಳೆಯರನ್ನು ಗೌರವಿಸಿ.`,
      ],
    },
    {
      planet: "Shani (Saturn)",
      natalSign: SANSKRIT_SIGNS_PDF[sharedData.saturnSignIdx],
      points: shaniPoints,
      texts: [
        `Dear ${data.name}, with a high score of ${shaniPoints} Bindus in Shani's Ashtakavarga, you are blessed with incredible discipline, patience, and endurance. You have a strong sense of duty and the ability to work tirelessly toward your long-term goals. Success will be highly durable and well-deserved.`,
        `Dear ${data.name}, a balanced score of ${shaniPoints} Bindus in Shani's Ashtakavarga indicates that your capacity for hard work and responsibility is well-proportioned. You handle structural duties and boundaries with a sensible attitude, leading to stable growth.`,
        `Dear ${data.name}, with ${shaniPoints} Bindus in Shani's Ashtakavarga, you might sometimes feel overwhelmed by responsibilities or experience delays. Developing structured routines, engaging in selfless service (Seva), and cultivating perseverance will help transform these Saturnian trials into strengths.`,
      ],
      knTexts: [
        `ಪ್ರಿಯ ${data.name}, ಶನಿಯ ಅಷ್ಟಕವರ್ಗದಲ್ಲಿ ${shaniPoints} ಬಿಂದುಗಳ ಉತ್ತಮ ಅಂಕ ಅಪಾರ ಶಿಸ್ತು, ತಾಳ್ಮೆ ಮತ್ತು ಸಹಿಷ್ಣುತೆ ಆಶೀರ್ವಾದ ಮಾಡುತ್ತದೆ. ದೀರ್ಘಕಾಲದ ಗುರಿ ಸಾಧನೆಗೆ ಕರ್ತವ್ಯ ಪ್ರಜ್ಞೆ ಮತ್ತು ಅವಿರಾಮ ಶ್ರಮ ಮಾಡುವ ಸಾಮರ್ಥ್ಯ ನಿಮ್ಮಲ್ಲಿದೆ.`,
        `ಪ್ರಿಯ ${data.name}, ಶನಿಯ ಅಷ್ಟಕವರ್ಗದಲ್ಲಿ ${shaniPoints} ಬಿಂದುಗಳ ಸಮತೋಲಿತ ಅಂಕ ಕಠಿಣ ಪರಿಶ್ರಮ ಮತ್ತು ಜವಾಬ್ದಾರಿ ಸಮ ಪ್ರಮಾಣದಲ್ಲಿ ಇದೆ ಎಂದು ತೋರಿಸುತ್ತದೆ. ರಚನಾತ್ಮಕ ಕರ್ತವ್ಯ ಮತ್ತು ಮಿತಿಗಳನ್ನು ವಿವೇಕದಿಂದ ನಿಭಾಯಿಸಿ ಸ್ಥಿರ ಬೆಳವಣಿಗೆ ಸಾಧಿಸುತ್ತೀರಿ.`,
        `ಪ್ರಿಯ ${data.name}, ಶನಿಯ ಅಷ್ಟಕವರ್ಗದಲ್ಲಿ ${shaniPoints} ಬಿಂದುಗಳ ಅಂಕ ಕೆಲವೊಮ್ಮೆ ಜವಾಬ್ದಾರಿಗಳ ಭಾರ ಅಥವಾ ವಿಳಂಬ ಅನುಭವ ನೀಡಬಹುದು. ಶಿಸ್ತಿನ ದಿನಚರಿ ರೂಢಿಸಿ, ನಿಸ್ವಾರ್ಥ ಸೇವೆ ಮಾಡಿ ಮತ್ತು ಛಲ ಬೆಳೆಸಿ.`,
      ],
    },
  ];

  for (const card of avPredictions2) drawAvCard(card);

  // ── Sarvashtakavarga final card ───────────────────────────────────────────────
  {
    const sarva = sharedData.sarvaPoints;
    const sarvaTitle = t("Sarvashtakavarga Predictions & Composite Score");
    const sarvaSub = `${t("Natal Moon Sign")}: ${t(sharedData.rashiName)} · ${t("Total Score")}: ${sarva} ${t("Bindus")}`;
    const sarvaBody1 = t("The proliferation of maximum bindus in your chart appears in Simha to Vrischika, signifying that the years of your youth and mature middle age will be highly active and prosperous. Your career path will take off to unexpected heights. Academic and personal aspirations will get a head start during this stage of life, and happiness and prosperity will seem to be at their peak. Destiny will protect you from the worries of severe professional stagnation, and domestic bliss will also come seeking you.");
    const sarvaBody2 = `${t("At the age corresponding to the figures in the signs occupied by Jupiter, Venus, and Mercury, your fortune turns for the better. In your case, these special turning points occur at your")} ${sharedData.jupAge}, ${sharedData.venAge}, ${t("and")} ${sharedData.merAge} ${t("years of age.")}\n\n${t("In your horoscope, the Lagna (1st house) has")} ${sharedData.lagnaSarva} ${t("bindus, the 9th house of fortune has")} ${sharedData.h9Sarva} ${t("bindus, the 10th house of career has")} ${sharedData.h10Sarva} ${t("bindus, and the 11th house of gains has")} ${sharedData.h11Sarva} ${t("bindus.")}`;

    doc.setFontSize(8);
    const tH = measureWrappedTextHeight(doc, sarvaTitle, CW - 10, 8, 4.6);
    doc.setFontSize(7.5);
    const sH = measureWrappedTextHeight(doc, sarvaSub, CW - 10, 7.5, 4.2);
    doc.setFontSize(9.5);
    const b1H = measureWrappedTextHeight(doc, sarvaBody1, CW - 10, 9.5, 5.2);
    const b2H = measureWrappedTextHeight(doc, sarvaBody2, CW - 10, 9.5, 5.2);
    const sarvaCardH = 6 + tH + sH + b1H + b2H + 14;

    if (y + sarvaCardH > H - 14) y = startNewPage("Ashtakavarga");

    setFill(doc, C_LIGHT_ALT);
    setDraw(doc, C_GOLD);
    doc.setLineWidth(0.25);
    doc.roundedRect(ML, y, CW, sarvaCardH, 1.5, 1.5, "FD");

    let sy = y + 5;
    sy = drawWrappedText(doc, sarvaTitle, ML + 4, sy, CW - 10, { font: "times", style: "bold", fontSize: 8, lineH: 4.6, color: C_MAROON });
    sy = drawWrappedText(doc, sarvaSub, ML + 4, sy + 1, CW - 10, { font: "times", style: "italic", fontSize: 7.5, lineH: 4.2, color: C_MUTED });
    sy += 3;
    sy = drawWrappedText(doc, sarvaBody1, ML + 4, sy, CW - 10, { font: "times", style: "normal", fontSize: 9.5, lineH: 5.2, color: C_TEXT });
    sy += 4;
    drawWrappedText(doc, sarvaBody2, ML + 4, sy, CW - 10, { font: "times", style: "normal", fontSize: 9.5, lineH: 5.2, color: C_TEXT });
    y += sarvaCardH + 6;
  }

  // ─── PAGE 61: DISCLAIMER & BLESSING ───────────────────────────────────────
  y = startNewPage("Disclaimer & Blessing");

  // Renders the OM symbol nicely
  setColor(doc, C_GOLD);
  doc.setFont("times", "bold");
  doc.setFontSize(38);
  doc.text("ॐ", W / 2, y + 15, { align: "center" });

  setColor(doc, C_MAROON);
  doc.setFont("times", "bold");
  doc.setFontSize(15);
  doc.text(t("Auspicious Vedic Blessing"), W / 2, y + 30, { align: "center" });

  setColor(doc, C_MUTED);
  doc.setFont("times", "italic");
  doc.setFontSize(9.5);
  const blessingText = "May the divine stars and celestial bodies cast their most benevolent glance upon you. Approach your blueprint not with fear, but as a map of sacred opportunities, learning, and self-realization.";
  const blessingLines = wrap(doc, t(blessingText), 130);
  doc.text(blessingLines, W / 2, y + 38, { align: "center" });

  drawAstroDivider(doc, y + 60);

  // Disclaimer box
  const boxY = y + 70;
  setFill(doc, [255, 253, 247]);
  setDraw(doc, C_GOLD);
  doc.setLineWidth(0.3);
  doc.roundedRect(ML + 10, boxY, CW - 20, 52, 2, 2, "FD");

  setColor(doc, C_MAROON);
  doc.setFont("times", "bold");
  doc.setFontSize(10);
  doc.text(t("Astrological Disclaimer"), W / 2, boxY + 8, { align: "center" });

  setColor(doc, C_TEXT);
  doc.setFont("times", "normal");
  doc.setFontSize(8.5);
  const disclaimerBody = "Astrology is an ancient diagnostic tool and spiritual counseling framework based on astronomical coordinates at your birth. Predictions represent probabilities and cosmic potentials. This report does not substitute professional legal, financial, or medical advice. The ultimate agency and free will remain with the individual as they write their destiny.";
  const disclaimerLines = wrap(doc, t(disclaimerBody), CW - 32);
  let dy = boxY + 15;
  for (const line of disclaimerLines) {
    doc.text(line, ML + 16, dy);
    dy += 4.5;
  }

  // Footer branding
  setColor(doc, C_MAROON);
  doc.setFont("times", "bold");
  doc.setFontSize(9.5);
  doc.text(t("DIVINE PANCHANG astrology").toUpperCase(), W / 2, boxY + 76, { align: "center" });

  setColor(doc, C_GOLD_DARK);
  doc.setFont("times", "normal");
  doc.setFontSize(8.5);
  doc.text("www.divinepanchang.space  ·  support@divinepanchang.space", W / 2, boxY + 82, { align: "center" });

  return doc.output("blob");
}
