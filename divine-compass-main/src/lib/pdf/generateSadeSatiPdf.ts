// ──────────────────────────────────────────────────────────────────────────────
// Premium Sade Sati PDF Report Generator
// Dedicated 13-Page Saturn Transit & Remedies Booklet (Divine Panchang Brand)
// ──────────────────────────────────────────────────────────────────────────────
import { jsPDF } from "jspdf";
import {
  ZODIAC_SIGNS,
  NAKSHATRA_NAMES,
  NAKSHATRA_LORDS,
} from "./kundaliContent";
import { getSadeSatiPhases, getSiderealSaturnLongitude, getMoonRashi } from "../calculators/astrology/sadeSati";

export interface SadeSatiBirthData {
  name: string;
  email: string;
  dob: string;       // "YYYY-MM-DD"
  tob: string;       // "HH:MM"
  gender: string;
  city: string;
  lat: number;
  lon: number;
  timezone: string;
}

interface SadeSatiChart {
  moonLon: number;
  sunLon: number;
  marsLon: number;
  mercuryLon: number;
  jupiterLon: number;
  venusLon: number;
  saturnLon: number;
  rahuLon: number;
  ketuLon: number;
  nakshatraName: string;
  nakshatraLord: string;
  rashiIndex: number;
  rashiName: string;
  lagnaIndex: number;
  lagnaName: string;
}

export interface KantakShaniPhase {
  name: string;
  signIndex: number;
  signName: string;
  startDate: Date;
  endDate: Date;
  house: 4 | 8;
}

// ─── Color Scheme: Shani Dev's Sacred Deep Blue & Gold ──────────────────────────
const C_NAVY      = [11, 27, 54]    as const; // Deep night-sky navy
const C_GOLD      = [197, 147, 34]  as const; // Sacred gold
const C_GOLD_DARK = [160, 115, 15]  as const; // Rich dark gold
const C_ICE_BLUE  = [242, 246, 252] as const; // Very soft cool blue-white background
const C_WHITE     = [255, 255, 255] as const;
const C_TEXT      = [35, 40, 50]    as const; // Navy-tinted charcoal text
const C_MUTED     = [110, 120, 140] as const;
const C_MAROON    = [120, 20, 30]   as const; // Deep sacred maroon
const C_LIGHT_ALT = [230, 238, 248] as const; // Slightly darker ice blue for table rows

function toUTC(dob: string, tob: string, timezone: string): Date {
  const [year, month, day] = dob.split("-").map(Number);
  const [hour, minute] = tob.split(":").map(Number);
  const naiveUTC = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric", month: "numeric", day: "numeric",
    hour: "numeric", minute: "numeric", second: "numeric", hour12: false,
  });
  const parts = fmt.formatToParts(naiveUTC);
  const m: Record<string, string> = {};
  parts.forEach(p => (m[p.type] = p.value));
  const h = m.hour === "24" ? 0 : parseInt(m.hour);
  const tzDate = new Date(Date.UTC(parseInt(m.year), parseInt(m.month) - 1, parseInt(m.day), h, parseInt(m.minute), parseInt(m.second)));
  const offset = tzDate.getTime() - naiveUTC.getTime();
  return new Date(naiveUTC.getTime() - offset);
}

function getSiderealMoonLon(date: Date): number {
  const J2000 = 2451545.0;
  const jd = date.getTime() / 86400000 + 2440587.5;
  const T = (jd - J2000) / 36525;
  let moon = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + T * T * T / 538841 - T * T * T * T / 65194000;
  moon = moon % 360;
  if (moon < 0) moon += 360;
  const ayanamsa = 23.85 + 0.0136 * T;
  let sidereal = moon - ayanamsa;
  if (sidereal < 0) sidereal += 360;
  return sidereal;
}

function getSiderealSunLon(date: Date): number {
  const J2000 = 2451545.0;
  const jd = date.getTime() / 86400000 + 2440587.5;
  const T = (jd - J2000) / 36525;
  let L = 280.46646 + 36000.76983 * T;
  const M = (357.52911 + 35999.05029 * T) * Math.PI / 180;
  const C = (1.914602 - 0.004817 * T) * Math.sin(M) + 0.019993 * Math.sin(2 * M);
  let sun = (L + C) % 360;
  if (sun < 0) sun += 360;
  const ayanamsa = 23.85 + 0.0136 * T;
  let sidereal = sun - ayanamsa;
  if (sidereal < 0) sidereal += 360;
  return sidereal;
}

function getLagnaFromLon(moonLon: number, sunLon: number): number {
  return Math.floor(((moonLon + sunLon) / 2) / 30) % 12;
}

function normalizeLon(lon: number): number {
  const n = lon % 360;
  return n < 0 ? n + 360 : n;
}

function buildSadeSatiChart(data: SadeSatiBirthData): SadeSatiChart {
  const birthUTC = toUTC(data.dob, data.tob, data.timezone);
  const moonLon = getSiderealMoonLon(birthUTC);
  const sunLon = getSiderealSunLon(birthUTC);

  const jd = birthUTC.getTime() / 86400000 + 2440587.5;
  const T = (jd - 2451545.0) / 36525;

  const marsLon = normalizeLon(355.453 + 191.403 * T * 365.25);
  const mercuryLon = normalizeLon(252.251 + 1494.723 * T * 365.25);
  const jupiterLon = normalizeLon(34.404 + 30.349 * T * 365.25);
  const venusLon = normalizeLon(181.979 + 585.178 * T * 365.25);
  const saturnLon = normalizeLon(50.058 + 12.221 * T * 365.25);
  const rahuLon = normalizeLon(125.04 - 19.341 * T * 365.25);
  const ketuLon = normalizeLon(rahuLon + 180);

  const NAKSHATRA_SPAN = 360 / 27;
  const nakshatraIndex = Math.floor(moonLon / NAKSHATRA_SPAN);
  const nakshatraName = NAKSHATRA_NAMES[nakshatraIndex];
  const nakshatraLord = NAKSHATRA_LORDS[nakshatraIndex];

  const rashiIndex = Math.floor(moonLon / 30);
  const rashiName = ZODIAC_SIGNS[rashiIndex];
  const lagnaIndex = getLagnaFromLon(moonLon, sunLon);
  const lagnaName = ZODIAC_SIGNS[lagnaIndex];

  return { 
    moonLon, sunLon, marsLon, mercuryLon, jupiterLon, venusLon, saturnLon, rahuLon, ketuLon, 
    nakshatraName, nakshatraLord, rashiIndex, rashiName, lagnaIndex, lagnaName 
  };
}

// ─── Transit Sign Finder for Kantak Shani ─────────────────────────────────────
const findSignTransition = (baseDate: Date, monthsDirection: number, targetRashi: number): Date => {
  const stepDays = 10;
  let current = new Date(baseDate);
  const dir = monthsDirection > 0 ? 1 : -1;
  const maxDays = Math.abs(monthsDirection) * 40;

  for (let i = 0; i < maxDays / stepDays; i++) {
    const next = new Date(current.getTime() + dir * stepDays * 24 * 3600 * 1000);
    const rashi = Math.floor(getSiderealSaturnLongitude(next) / 30);
    if (monthsDirection > 0 ? (rashi === targetRashi) : (rashi !== targetRashi)) {
      let low = monthsDirection > 0 ? current.getTime() : next.getTime();
      let high = monthsDirection > 0 ? next.getTime() : current.getTime();

      for (let j = 0; j < 10; j++) {
        const mid = (low + high) / 2;
        const midRashi = Math.floor(getSiderealSaturnLongitude(new Date(mid)) / 30);
        if (midRashi === targetRashi) {
          high = mid;
        } else {
          low = mid;
        }
      }
      return new Date(high);
    }
    current = next;
  }
  return current;
};

export function getKantakShaniPhases(dob: Date): KantakShaniPhase[] {
  const moonRashi = getMoonRashi(dob);
  const phases: KantakShaniPhase[] = [];
  
  let checkTime = new Date(dob);
  const endLimit = new Date(dob.getTime() + 100 * 365.25 * 24 * 3600 * 1000);
  const stepMonths = 3;
  
  while (checkTime < endLimit) {
    const satLon = getSiderealSaturnLongitude(checkTime);
    const satRashi = Math.floor(satLon / 30);
    const houseFromMoon = (satRashi - moonRashi + 12) % 12 + 1;
    
    if (houseFromMoon === 4 || houseFromMoon === 8) {
      const targetRashi = satRashi;
      const house = houseFromMoon as 4 | 8;
      
      const pStart = findSignTransition(checkTime, -stepMonths, targetRashi);
      const pEnd = findSignTransition(pStart, stepMonths * 12, (targetRashi + 1) % 12);
      
      phases.push({
        name: house === 4 ? "Small Panoti (4th House Transit)" : "Small Panoti (8th House Transit)",
        signIndex: targetRashi,
        signName: ZODIAC_SIGNS[targetRashi],
        startDate: pStart,
        endDate: pEnd,
        house
      });
      
      // Jump past this transit
      checkTime = new Date(pEnd.getTime() + 2 * 365.25 * 24 * 3600 * 1000);
    } else {
      checkTime = new Date(checkTime.getTime() + stepMonths * 30 * 24 * 3600 * 1000);
    }
  }
  return phases;
}

// ─── PDF Visual Layout Helpers ─────────────────────────────────────────────────
const W = 210;
const H = 297;
const ML = 15;
const MR = 15;
const CW = W - ML - MR;

function setColor(doc: jsPDF, c: readonly [number,number,number]) {
  doc.setTextColor(c[0], c[1], c[2]);
}

function setFill(doc: jsPDF, c: readonly [number,number,number]) {
  doc.setFillColor(c[0], c[1], c[2]);
}

function setDraw(doc: jsPDF, c: readonly [number,number,number]) {
  doc.setDrawColor(c[0], c[1], c[2]);
}

function applyPageBackground(doc: jsPDF, isDark = false) {
  // Always use crisp white paper background for optimal print aesthetics and ink-saving
  setFill(doc, C_WHITE);
  doc.rect(0, 0, W, H, "F");
}

function addSectionHeader(doc: jsPDF, title: string, subtitle: string, y: number): number {
  setDraw(doc, C_GOLD_DARK);
  doc.setLineWidth(0.25);
  doc.line(ML, y - 2, ML + CW, y - 2);

  setColor(doc, C_NAVY);
  doc.setFont("times", "bold");
  doc.setFontSize(11);
  doc.text(title, ML, y + 3.5);

  setColor(doc, C_TEXT);
  doc.setFont("times", "italic");
  doc.setFontSize(8.5);
  doc.text(subtitle, ML, y + 8);

  setDraw(doc, C_GOLD_DARK);
  doc.setLineWidth(0.25);
  doc.line(ML, y + 11, ML + CW, y + 11);

  return y + 17;
}

function drawElegantBorder(doc: jsPDF, isDark = false) {
  setDraw(doc, isDark ? C_GOLD : C_NAVY);
  doc.setLineWidth(0.8);
  doc.rect(5, 5, W - 10, H - 10, "D");
  doc.setLineWidth(0.3);
  setDraw(doc, isDark ? C_WHITE : C_GOLD);
  doc.rect(6.5, 6.5, W - 13, H - 13, "D");

  setFill(doc, C_GOLD);
  [[7, 7], [W - 13, 7], [7, H - 13], [W - 13, H - 13]].forEach(([x, y]) => {
    doc.circle(x, y, 2, "F");
  });
}


function newPage(doc: jsPDF, title: string): number {
  doc.addPage();
  applyPageBackground(doc);
  drawElegantBorder(doc, false);

  // Bottom footer
  setFill(doc, C_NAVY);
  doc.rect(0, H - 8, W, 8, "F");
  setFill(doc, C_GOLD);
  doc.rect(0, H - 9, W, 1, "F");
  
  const pageNum = (doc as any).internal.getCurrentPageInfo().pageNumber;
  setColor(doc, C_GOLD);
  doc.setFontSize(8);
  doc.setFont("times", "bold");
  doc.text(`Page ${pageNum}`, W / 2, H - 3, { align: "center" });

  return 20;
}

function addParagraph(doc: jsPDF, text: string, x: number, y: number, maxW: number, lineH = 5.2): number {
  const lines = doc.splitTextToSize(text, maxW);
  setColor(doc, C_TEXT);
  doc.setFont("times", "normal");
  doc.setFontSize(9.5);
  doc.text(lines, x, y);
  return y + lines.length * lineH;
}

function addLabel(doc: jsPDF, label: string, xOrY: number, maybeY?: number): number {
  const x = maybeY !== undefined ? xOrY : ML;
  const y = maybeY !== undefined ? maybeY : xOrY;
  setColor(doc, C_MAROON);
  doc.setFont("times", "bold");
  doc.setFontSize(9.5);
  doc.text(label, x, y);
  return y + 5;
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

function drawSwastikGlyph(doc: jsPDF, cx: number, cy: number, size: number, lineWidth = 0.95) {
  const arm = size;
  const hook = size * 0.58;

  setDraw(doc, C_MAROON);
  doc.setLineWidth(lineWidth);
  doc.line(cx, cy - arm, cx, cy + arm);
  doc.line(cx - arm, cy, cx + arm, cy);
  doc.line(cx, cy - arm, cx + hook, cy - arm);
  doc.line(cx + arm, cy, cx + arm, cy + hook);
  doc.line(cx, cy + arm, cx - hook, cy + arm);
  doc.line(cx - arm, cy, cx - arm, cy - hook);
}

// ─── North Indian Chart Drawer ────────────────────────────────────────────────
function drawNorthIndianChart(
  doc: jsPDF,
  cx: number,
  cy: number,
  size: number,
  lagnaIdx: number,
  planetList: { name: string; lon: number }[],
  title: string
) {
  setDraw(doc, C_GOLD);
  doc.setLineWidth(0.4);
  
  // Outer rectangle
  doc.rect(cx, cy, size, size, "D");

  // Diagonals crossing
  doc.line(cx, cy, cx + size, cy + size);
  doc.line(cx + size, cy, cx, cy + size);

  // Central diamond
  doc.line(cx + size / 2, cy, cx, cy + size / 2);
  doc.line(cx, cy + size / 2, cx + size / 2, cy + size);
  doc.line(cx + size / 2, cy + size, cx + size, cy + size / 2);
  doc.line(cx + size, cy + size / 2, cx + size / 2, cy);

  const housePlanets: Record<number, string[]> = {};
  for (let h = 1; h <= 12; h++) housePlanets[h] = [];

  planetList.forEach(p => {
    const rasi = Math.floor(p.lon / 30);
    const houseIdx = (rasi - lagnaIdx + 12) % 12 + 1;
    housePlanets[houseIdx].push(p.name);
  });

  const midX = cx + size / 2;
  const midY = cy + size / 2;
  const gap = size / 12;

  const houseCoords: Record<number, { rx: number, ry: number }> = {
    1: { rx: midX, ry: cy + gap * 2.5 },
    2: { rx: cx + gap * 2.5, ry: cy + gap * 1.5 },
    3: { rx: cx + gap * 1.5, ry: cy + gap * 2.5 },
    4: { rx: cx + gap * 2.5, ry: midY },
    5: { rx: cx + gap * 1.5, ry: cy + gap * 9.5 },
    6: { rx: cx + gap * 2.5, ry: cy + gap * 10.5 },
    7: { rx: midX, ry: cy + gap * 9.5 },
    8: { rx: cx + gap * 9.5, ry: cy + gap * 10.5 },
    9: { rx: cx + gap * 10.5, ry: cy + gap * 9.5 },
    10: { rx: cx + gap * 9.5, ry: midY },
    11: { rx: cx + gap * 10.5, ry: cy + gap * 2.5 },
    12: { rx: cx + gap * 9.5, ry: cy + gap * 1.5 },
  };

  for (let house = 1; house <= 12; house++) {
    const coords = houseCoords[house];
    const rasiNum = (lagnaIdx + house - 1) % 12 + 1;

    // Rasi number
    setColor(doc, C_GOLD_DARK);
    doc.setFont("times", "bold");
    doc.setFontSize(size > 50 ? 8 : 7);
    doc.text(String(rasiNum), coords.rx, coords.ry, { align: "center" });

    // Planets
    const planets = housePlanets[house];
    if (planets.length > 0) {
      setColor(doc, C_NAVY); // Dark navy for planet symbols on print white
      doc.setFont("times", "bold");
      doc.setFontSize(size > 50 ? 7.5 : 6.5);
      doc.text(planets.join(","), coords.rx, coords.ry + (size > 50 ? 4 : 3.5), { align: "center" });
    }
  }

  // Label
  setColor(doc, C_GOLD_DARK);
  doc.setFont("times", "bolditalic");
  doc.setFontSize(8.5);
  doc.text(title, midX, cy + size + 4.5, { align: "center" });
}

// ─── Format Date Utility ───────────────────────────────────────────────────────
function formatDate(dob: string): string {
  const [y, m, d] = dob.split("-");
  const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
  return dateObj.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}

// Page 1: Cover Page
function addCoverPage(doc: jsPDF, data: SadeSatiBirthData, chart: SadeSatiChart) {
  applyPageBackground(doc, false); // White background
  drawElegantBorder(doc, false);

  setColor(doc, C_GOLD_DARK);
  doc.setFont("times", "bold");
  doc.setFontSize(38);
  doc.text("SADE SATI", W / 2, 45, { align: "center" });

  setColor(doc, C_NAVY);
  doc.setFont("times", "bold");
  doc.setFontSize(14);
  doc.text("PREMIUM IN-DEPTH VEDIC REPORT", W / 2, 53, { align: "center" });

  const cy = 110;
  // Draw only Swastik symbol instead of Ganesha mandala and Om text per user request
  drawSwastikGlyph(doc, W / 2, cy, 18, 2.0);

  // Hindi couplet in gold box on white
  setFill(doc, [253, 251, 243]);
  setDraw(doc, C_GOLD);
  doc.setLineWidth(0.4);
  doc.roundedRect(ML + 5, 162, CW - 10, 36, 1.5, 1.5, "FD");

  setColor(doc, C_GOLD_DARK);
  doc.setFont("times", "bolditalic");
  doc.setFontSize(11);
  doc.text('"Sade Sati ka rang anokha, seekh ka deepak, dukh ka shokha.', W / 2, 172, { align: "center" });
  doc.text('Sahan karoge, toh raah niklegi, Shani ki kripa se zindagi badlegi."', W / 2, 180, { align: "center" });
  
  setColor(doc, C_TEXT);
  doc.setFont("times", "normal");
  doc.setFontSize(8);
  doc.text("Saturn's transit is a unique alchemical fire: a guide of learning, a cleanser of karma. Endure, and you will thrive.", W / 2, 189, { align: "center" });

  // Elegant Structured Birth Details Box on white
  const boxY = 206;
  const boxH = 34;
  
  setFill(doc, C_WHITE);
  setDraw(doc, C_GOLD);
  doc.setLineWidth(0.4);
  doc.roundedRect(ML + 10, boxY, CW - 20, boxH, 2, 2, "FD");

  setColor(doc, C_GOLD_DARK);
  doc.setFont("times", "bold");
  doc.setFontSize(8.5);
  doc.text("SACRED BIRTH DETAILS", W / 2, boxY + 5.5, { align: "center" });
  
  setDraw(doc, C_GOLD);
  doc.setLineWidth(0.2);
  doc.line(ML + 15, boxY + 7.5, W - MR - 15, boxY + 7.5);

  setColor(doc, C_GOLD_DARK);
  doc.setFont("times", "bold");
  doc.setFontSize(7.5);

  const col1X = ML + 15;
  const col2X = W / 2 + 5;

  doc.text("Name:", col1X, boxY + 13);
  doc.text("Date of Birth:", col1X, boxY + 18);
  doc.text("Time of Birth:", col1X, boxY + 23);
  doc.text("Gender:", col1X, boxY + 28);

  doc.setFont("times", "normal");
  setColor(doc, C_TEXT);
  doc.text(data.name, col1X + 22, boxY + 13);
  doc.text(formatDate(data.dob), col1X + 22, boxY + 18);
  doc.text(data.tob, col1X + 22, boxY + 23);
  doc.text(data.gender.toUpperCase(), col1X + 22, boxY + 28);

  setColor(doc, C_GOLD_DARK);
  doc.setFont("times", "bold");
  doc.text("Place of Birth:", col2X, boxY + 13);
  doc.text("Moon Sign (Rashi):", col2X, boxY + 18);
  doc.text("Birth Star (Nakshatra):", col2X, boxY + 23);
  doc.text("Ascendant (Lagna):", col2X, boxY + 28);

  doc.setFont("times", "normal");
  setColor(doc, C_TEXT);
  doc.text(data.city, col2X + 32, boxY + 13);
  doc.text(chart.rashiName, col2X + 32, boxY + 18);
  doc.text(chart.nakshatraName, col2X + 32, boxY + 23);
  doc.text(chart.lagnaName, col2X + 32, boxY + 28);

  setColor(doc, C_MUTED);
  doc.setFontSize(8.5);
  doc.text(`Date: ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}`, W / 2, 252, { align: "center" });
  doc.text("divinepanchang.space", W / 2, 258, { align: "center" });
}

// Page 2: Welcome Letter & TOC
function addWelcomePage(doc: jsPDF, data: SadeSatiBirthData, chart: SadeSatiChart) {
  let y = newPage(doc, "Welcome & Table of Contents");
  y = addSectionHeader(doc, "Welcome to Your Personal Sade Sati Guide", `Custom Crafted for ${data.name}`, y);

  y = addLabel(doc, "A Message from the Divine Panchang Astro Council", y);
  const welcomeText = "Dear Seeker of Light,\n\nWelcome to your Personal Sade Sati Guide. In the vast ocean of Vedic wisdom, each soul has a unique cosmic path. Sade Sati is not a period of punishment, but a sacred mirror reflecting our past actions, calling us toward self-realization, structured discipline, and absolute integrity.\n\nWe have meticulously designed this premium guide to blend time-honored Vedic principles with highly practical daily recommendations tailored directly to your horoscope. Our astrological council recommends reading this guide at least three times. With each reading, as your mind calms, new layers of cosmic lessons, emotional insight, and deep self-awareness will reveal themselves. Approach these suggestions and remedies with sincere faith, patience, and positive intent. You have the power to shape your destiny through conscious effort.\n\nWarm regards,\nDivine Panchang Astrological Panel";
  y = addParagraph(doc, welcomeText, ML, y, CW) + 6;

  y = addLabel(doc, "Table of Contents", y);
  const tocItems = [
    "1. INTRODUCTION — What is Sade Sati?, Legends of Shani Dev, Significance of Sade Sati",
    "2. VEDIC CHARTS — Programmatic Lagna, Moon, and Saturn Transit Charts",
    "3. SATURN IN YOUR CHART — Placement, Dignity & Nakshatra Shravana analysis",
    "4. PHASES OF SADE SATI — 3 Cycles Dynamic Timeline & Severity Meter",
    "5. YEAR-BY-YEAR DETAILED PHASES — Rising, Peak, and Setting effects and Body Alert parts",
    "6. PREMIUM ASTRO-REMEDIES DEEP-DIVE — Gemstones weights, metals and Substitutes",
    "7. ASTRO-VASTU & LIFESTYLE ROUTINE — West zone Vastu, daily Yoga, and Pranayama",
    "8. CHARITY & CHANTING RULES — Saturday Daan, Mala rules, Brahma Muhurta, Mahamantra",
    "9. KANTAK SHANI (SMALL PANOTI) — Definition, dynamic timeline table, 4th/8th effects & remedies",
    "10. TRIALS TO TRIUMPH — Inspiring icon case studies (Modi, Amitabh, Elon Musk, Ratan Tata)",
    "11. PROMO OFFERS & SACRED CLOSING — Gemsmantra coupon RUDRA10 and Shani dev blessings"
  ];
  tocItems.forEach(item => {
    setColor(doc, C_TEXT);
    doc.setFont("times", "normal");
    doc.setFontSize(8.5);
    doc.text(item, ML + 5, y);
    y += 5.2;
  });
}

// Page 3: What is Sade Sati
function addIntroPage(doc: jsPDF, data: SadeSatiBirthData, chart: SadeSatiChart) {
  let y = newPage(doc, "Introduction");
  y = addSectionHeader(doc, "Vedic Foundations of Sade Sati", "The Dispenser of Karma and the Spiritual Alchemical Crucible", y);

  y = addLabel(doc, "1. What is Shani Sade Sati?", y);
  const introPart1 = "Sade Sati, meaning 'seven and a half years', is a highly significant transit in Vedic astrology, marked by Saturn's passage over one's natal Moon sign, the sign immediately preceding it, and the sign immediately following it. Since Saturn stays in each zodiac sign for approximately 2.5 years, transiting these three houses takes 7.5 years. It is a period designed for deep transformation, self-discovery, and spiritual maturity, encouraging discipline and resilience in the native.";
  y = addParagraph(doc, introPart1, ML, y, CW) + 6;

  y = addLabel(doc, "2. The Birth & Legend of Shani Dev", y);
  const legendShani = "Shani Dev, the formidable Lord of Karma, was born to Surya Dev (the Sun God) and Goddess Chhaya (his shadow consort). From birth, Shani Dev's intense gaze dimmed his father's solar radiance, symbolizing his ultimate power over all pride and ego. Lord Shiva, pleased with Shani Dev's deep penance, granted him the power to deliver perfect karmic justice to all beings—gods, humans, and demons alike. Shani Dev acts not out of malice, but as a neutral cosmic judge, ensuring that no good or bad deed goes unrewarded.";
  y = addParagraph(doc, legendShani, ML, y, CW) + 6;

  y = addLabel(doc, "3. King Vikramaditya and Saturn's Test of Justice", y);
  const legendVikram = "King Vikramaditya, renowned for his wisdom and pride, once questioned Saturn's supremacy. Shani Dev cast his gaze upon him, initiating a 7.5-year Sade Sati. Vikramaditya lost his kingdom, wealth, was falsely accused, and had his hands chopped off in a foreign land. Yet, despite his extreme suffering, he never lost his character or cursed Shani Dev. Pleased by his absolute patience and grace, Shani Dev restored his hands and throne, teaching that Saturn only refines to dissolve pride and build enduring wisdom.";
  y = addParagraph(doc, legendVikram, ML, y, CW) + 6;
}

// Page 4: Vedic Charts
function addVedicChartsPage(doc: jsPDF, data: SadeSatiBirthData, chart: SadeSatiChart) {
  let y = newPage(doc, "Astrological Charts");
  y = addSectionHeader(doc, "Dynamic Vedic Charts & Planetary Placements", "Calculated planetary blueprints and current transit positions", y);

  setFill(doc, C_NAVY);
  doc.rect(ML, y, CW, 142, "F");
  setDraw(doc, C_GOLD);
  doc.setLineWidth(0.4);
  doc.rect(ML, y, CW, 142, "D");

  const birthPlanets = [
    { name: "Su", lon: chart.sunLon },
    { name: "Mo", lon: chart.moonLon },
    { name: "Ma", lon: chart.marsLon },
    { name: "Me", lon: chart.mercuryLon },
    { name: "Ju", lon: chart.jupiterLon },
    { name: "Ve", lon: chart.venusLon },
    { name: "Sa", lon: chart.saturnLon },
    { name: "Ra", lon: chart.rahuLon },
    { name: "Ke", lon: chart.ketuLon },
  ];

  const transitDate = new Date();
  const jd_t = transitDate.getTime() / 86400000 + 2440587.5;
  const T_t = (jd_t - 2451545.0) / 36525;
  const transitPlanets = [
    { name: "Su", lon: getSiderealSunLon(transitDate) },
    { name: "Mo", lon: getSiderealMoonLon(transitDate) },
    { name: "Ma", lon: normalizeLon(355.453 + 191.403 * T_t * 365.25) },
    { name: "Me", lon: normalizeLon(252.251 + 1494.723 * T_t * 365.25) },
    { name: "Ju", lon: normalizeLon(34.404 + 30.349 * T_t * 365.25) },
    { name: "Ve", lon: normalizeLon(181.979 + 585.178 * T_t * 365.25) },
    { name: "Sa", lon: getSiderealSaturnLongitude(transitDate) },
    { name: "Ra", lon: normalizeLon(125.04 - 19.341 * T_t * 365.25) },
    { name: "Ke", lon: normalizeLon((125.04 - 19.341 * T_t * 365.25) + 180) },
  ];

  drawNorthIndianChart(doc, ML + 8, y + 10, 52, chart.lagnaIndex, birthPlanets, "Lagna Chart");
  drawNorthIndianChart(doc, ML + CW/3 + 8, y + 10, 52, chart.rashiIndex, birthPlanets, "Moon Chart");
  drawNorthIndianChart(doc, ML + 2*CW/3 + 8, y + 10, 52, chart.lagnaIndex, transitPlanets, "Saturn Transit");

  y += 68;

  y = addSectionHeader(doc, "Planetary Positions at Birth", "Sidereal positions with Lahiri Ayanamsa", y);
  const planetNames = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn", "Rahu", "Ketu"];
  const lons = [chart.sunLon, chart.moonLon, chart.marsLon, chart.mercuryLon, chart.jupiterLon, chart.venusLon, chart.saturnLon, chart.rahuLon, chart.ketuLon];
  const ZODIAC_SIGNS = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
  for (let i = 0; i < planetNames.length; i++) {
    if (y > H - 12) { y = newPage(doc, "Planetary Positions"); }
    const sign = ZODIAC_SIGNS[Math.floor(lons[i] / 30)];
    const deg = (lons[i] % 30).toFixed(1);
    setColor(doc, C_TEXT);
    doc.setFont("times", "normal");
    doc.setFontSize(8.5);
    doc.text(`${planetNames[i]}: ${sign} ${deg}°`, ML + 3, y);
    y += 5;
  }
}

// ─── Page 5: Saturn in Chart & Severity ─────────────────────────────────────
function addSaturnAnalysisPage(doc: jsPDF, data: SadeSatiBirthData, chart: SadeSatiChart) {
  let y = newPage(doc, "Saturn Analysis");
  y = addSectionHeader(doc, "Saturn's Position in Your Birth Chart", `Saturn in ${chart.rashiName} — Detailed Analysis`, y);

  const ZODIAC_SIGNS = ["Aries","Taurus","Gemini","Cancer","Leo","Virgo","Libra","Scorpio","Sagittarius","Capricorn","Aquarius","Pisces"];
  const satSign = ZODIAC_SIGNS[Math.floor(chart.saturnLon / 30)];
  const satHouseNum = (Math.floor(chart.saturnLon / 30) - chart.lagnaIndex + 12) % 12 + 1;
  const houseNames = ["","1st (Lagna)","2nd (Dhana)","3rd (Sahaja)","4th (Sukha)","5th (Putra)","6th (Shatru)","7th (Kalatra)","8th (Randhra)","9th (Bhagya)","10th (Karma)","11th (Labha)","12th (Vyaya)"];

  y = addLabel(doc, "Saturn's Natal Placement", y);
  y = addParagraph(doc, `In your birth chart, Saturn is placed in ${satSign} (${houseNames[satHouseNum]} from Lagna). This placement is the foundation upon which all Sade Sati experiences are built. Saturn in this position determines your primary karmic lessons, the life domains under Saturn's direct supervision, and the specific quality of discipline Saturn will demand from you during its transit cycles.`, ML, y, CW) + 5;

  y = addLabel(doc, "Current Sade Sati Status", y);
  const currentTransitSatLon = chart.saturnLon;
  const currentSatSign = Math.floor(currentTransitSatLon / 30);
  const houseFromMoon = (currentSatSign - chart.rashiIndex + 12) % 12 + 1;
  const isActive = (houseFromMoon === 12 || houseFromMoon === 1 || houseFromMoon === 2);
  const phaseStr = houseFromMoon === 12 ? "Rising Phase (12th from Moon)" : houseFromMoon === 1 ? "Peak Phase (Janma Rashi — Highest Intensity)" : houseFromMoon === 2 ? "Setting Phase (2nd from Moon)" : "Inactive — Not currently in Sade Sati";
  const intensityStr = houseFromMoon === 1 ? "High" : (houseFromMoon === 12 || houseFromMoon === 2) ? "Medium" : "Low";
  y = addParagraph(doc, `Current Phase: ${phaseStr}`, ML, y, CW) + 3;
  y = addParagraph(doc, `Intensity Level: ${intensityStr}`, ML, y, CW) + 5;

  y = addLabel(doc, "Saturn's Karmic Message for You", y);
  y = addParagraph(doc, `As a ${chart.rashiName} Moon native, Saturn's transit through your chart is designed to refine the specific qualities associated with your Moon sign. The discipline Saturn demands is not arbitrary — it is precisely calibrated to the areas where your soul needs the deepest growth. Embrace this period not as punishment but as an advanced curriculum in life mastery.`, ML, y, CW) + 5;
}

// ─── Page 6: Dynamic Timeline ────────────────────────────────────────────────
function addTimelinePage(doc: jsPDF, data: SadeSatiBirthData, chart: SadeSatiChart) {
  let y = newPage(doc, "Sade Sati Timeline");
  y = addSectionHeader(doc, "Your 3-Cycle Sade Sati Dynamic Timeline", `Calculated for ${chart.rashiName} Moon from ${data.dob}`, y);

  const birthUTC = toUTC(data.dob, data.tob, data.timezone);
  const phases = getSadeSatiPhases(birthUTC);

  const cycleLabels = [
    "First Cycle (Early Life — Childhood Karmic Lessons)",
    "Second Cycle (Mid-Life — Career & Family Crucible)",
    "Third Cycle (Mature Life — Spiritual Wisdom & Legacy)"
  ];

  for (let ci = 0; ci < 3; ci++) {
    const cyclePhasesData = phases.slice(ci * 3, ci * 3 + 3);
    if (y > H - 50) { y = newPage(doc, "Sade Sati Timeline"); }

    setFill(doc, C_NAVY);
    doc.rect(ML, y, CW, 6, "F");
    setColor(doc, C_GOLD);
    doc.setFont("times", "bold");
    doc.setFontSize(9);
    doc.text(cycleLabels[ci], ML + 3, y + 4.2);
    y += 9;

    for (const ph of cyclePhasesData) {
      if (!ph) continue;
      if (y > H - 20) { y = newPage(doc, "Sade Sati Timeline"); }
      const start = ph.startDate.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
      const end = ph.endDate.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
      setColor(doc, C_TEXT);
      doc.setFont("times", "normal");
      doc.setFontSize(8.5);
      doc.text(`• ${ph.name}: ${start} — ${end}  [${ph.status}]`, ML + 3, y);
      y += 5.5;
      y = addParagraph(doc, ph.meaning, ML + 8, y, CW - 8) + 3;
    }
    y += 4;
  }
}

// ─── Page 7: Yearly Phase Predictions ────────────────────────────────────────
function addYearlyPhasePage(doc: jsPDF, data: SadeSatiBirthData, chart: SadeSatiChart) {
  let y = newPage(doc, "Phase Predictions");
  y = addSectionHeader(doc, "Year-by-Year Sade Sati Phase Effects", "Rising, Peak, and Setting phase body and life area impacts", y);

  const phases = [
    { title: "RISING PHASE — 12th House Transit", body: "Body Alerts: Eyes, feet, left side of body, sleep patterns, and subconscious mental states. This phase begins a process of gradual internal restructuring. Expenditures increase, travel may occur, and old emotional patterns surface for release. The 12th house governs hidden enemies, losses, and foreign lands — Saturn here tests your attachment to material security and comfort zones." },
    { title: "PEAK PHASE — Janma Rashi (Moon Sign Direct)", body: "Body Alerts: Mind, nervous system, chest, lungs, and general vitality. The highest intensity period. Identity, career, health, and mental peace all face testing simultaneously. Saturn's direct overlay on your Moon creates deep psychological pressure — this is purposeful: it forces the consolidation of character and the elimination of ego-driven life patterns. Those who maintain discipline and service emerge profoundly strengthened." },
    { title: "SETTING PHASE — 2nd House Transit", body: "Body Alerts: Face, throat, teeth, right eye, and digestive system. Financial discipline is paramount. Family relationships require careful, measured communication. This phase systematically unwinds the accumulated tension of the Rising and Peak phases. By its end, you have integrated Saturn's lessons and your life structures are more durable than before the cycle began." },
  ];

  for (const phase of phases) {
    if (y > H - 55) { y = newPage(doc, "Phase Predictions"); }
    y = addLabel(doc, phase.title, y);
    y = addParagraph(doc, phase.body, ML, y, CW) + 6;
  }

  y = addLabel(doc, `PERSONALIZED PHASE GUIDANCE FOR ${chart.rashiName.toUpperCase()} MOON`, y);
  y = addParagraph(doc, `As a ${chart.rashiName} Moon native, each phase of Sade Sati activates specific dimensions of your sign's energy. Your ${chart.nakshatraName} Nakshatra (ruled by ${chart.nakshatraLord}) modifies the flavour of each phase — channeling Saturn's pressure through ${chart.nakshatraLord}'s specific domain. Practicing ${chart.nakshatraLord}'s remedies throughout all three phases provides additional protection and accelerates the positive integration of Saturn's teachings.`, ML, y, CW) + 5;
}

// ─── Page 8: Life Area Predictions ───────────────────────────────────────────
function addLifeAreaPage(doc: jsPDF, data: SadeSatiBirthData, chart: SadeSatiChart) {
  let y = newPage(doc, "Life Area Predictions");
  y = addSectionHeader(doc, `Personalized Sade Sati Predictions for ${data.name}`, `Moon Sign: ${chart.rashiName} | Nakshatra: ${chart.nakshatraName}`, y);

  const areas = [
    ["CAREER & PROFESSION", `Sade Sati intensifies career demands for ${chart.rashiName} Moon natives. Hard work is absolutely required — no shortcuts will be rewarded. Those in structured, service-oriented professions (healthcare, law, government, agriculture, engineering) will find Saturn supportive of disciplined effort. Avoid impulsive career changes during the Peak Phase. New foundations laid during the Setting Phase have exceptional durability.`],
    ["FINANCES & WEALTH", `Financial discipline is the master lesson. Unexpected expenses arise — health costs, property repairs, family obligations. This is Saturn's test of financial maturity. Systematic savings, debt reduction, and conservative investments are strongly favored. By the Setting Phase, those who maintained discipline will have rebuilt stronger financial foundations than existed before the cycle.`],
    ["FAMILY & RELATIONSHIPS", `Family responsibilities intensify. Elder care, spouse's health, and domestic matters require personal attention. Communication must be measured and patient — ${chart.rashiName} Moon's emotional nature is amplified by Saturn's pressure, making impulsive speech particularly harmful. For unmarried natives, marriages may be delayed but will be karmic and enduring when they occur.`],
    ["HEALTH & VITALITY", `Saturn governs bones, joints, teeth, knees, and the nervous system. Preventive health practices are essential: daily yoga (especially weight-bearing postures), warm oil massage (Abhyanga) twice weekly, adequate sleep, and whole, warm foods. Avoid extremes in diet and physical exertion. Regular health checkups beginning in the Rising Phase prevent complications in the Peak Phase.`],
  ];

  for (const [title, text] of areas) {
    if (y > H - 45) { y = newPage(doc, "Life Predictions"); }
    y = addLabel(doc, title, y);
    y = addParagraph(doc, text, ML, y, CW) + 5;
  }
}

// ─── Page 9: Remedies & Gemstone Guide ───────────────────────────────────────
function addRemediesPage(doc: jsPDF, data: SadeSatiBirthData, chart: SadeSatiChart) {
  let y = newPage(doc, "Remedies & Gemstones");
  y = addSectionHeader(doc, "Saturn Remedies — Pacifying Shani Dev", "Mantra, gemstone, rudraksha, and fasting prescriptions", y);

  y = addLabel(doc, "PRIMARY SATURN MANTRA", y);
  y = addParagraph(doc, "Om Sham Shanaishcharaya Namah — Chant 108 times every Saturday morning before sunrise. During the Peak Phase, increase to 1008 repetitions on Saturdays for maximum pacification.", ML, y, CW) + 3;
  setColor(doc, C_GOLD_DARK);
  doc.setFont("times", "bold");
  doc.setFontSize(12);
  doc.text("Om Sham Shanaishcharaya Namah", ML + CW/2, y, { align: "center" });
  y += 8;

  y = addLabel(doc, "SATURN GEMSTONE — BLUE SAPPHIRE (NEELAM) & ALTERNATIVES", y);
  y = addParagraph(doc, "Blue Sapphire (Neelam) is Saturn's primary gemstone. IMPORTANT: This gemstone must ONLY be worn after personal horoscopic clearance by a qualified Jyotishi — it is among the most powerful and potentially double-edged gems. Safe alternative: Amethyst (Jamunia) — wear a 5-7 carat natural amethyst in silver on the middle finger on Saturdays.", ML, y, CW) + 4;

  y = addLabel(doc, "RUDRAKSHA RECOMMENDATION", y);
  y = addParagraph(doc, "14-Mukhi Rudraksha: Directly governed by Saturn. Most powerful bead for Sade Sati pacification. Enhances discipline and removes obstacles. Alternative: 7-Mukhi Rudraksha (Mahalakshmi & Saturn). Wear on black silk or silver chain, energized on a Saturday morning.", ML, y, CW) + 4;

  // Gemstone table
  y = addLabel(doc, "ALL-PLANET GEMSTONE QUICK REFERENCE", y);
  const gemRows = [
    ["Sun", "Gold/Copper", "Ruby", "Red Tourmaline, Red Garnet"],
    ["Moon", "Silver", "Pearl", "Moonstone"],
    ["Mars", "Copper", "Red Coral", "Carnelian, Red Agate"],
    ["Mercury", "Gold", "Emerald", "Green Tourmaline, Peridot"],
    ["Jupiter", "Gold", "Yellow Sapphire", "Yellow Topaz, Citrine"],
    ["Venus", "Silver", "Diamond", "Opal, White Sapphire"],
    ["Saturn", "Iron/Silver", "Blue Sapphire", "Amethyst, Blue Topaz"],
    ["Rahu", "Lead", "Hessonite", "Orange Zircon"],
    ["Ketu", "Iron", "Cat's Eye", "Chrysoberyl"],
  ];
  const colW = [CW*0.15, CW*0.15, CW*0.2, CW*0.25, CW*0.25];
  const headers = ["Planet", "Metal", "Primary Gem", "Substitutes"];
  setFill(doc, C_NAVY);
  doc.rect(ML, y, CW, 6, "F");
  setColor(doc, C_GOLD);
  doc.setFont("times", "bold");
  doc.setFontSize(7.5);
  let cx = ML + 2;
  for (let i = 0; i < headers.length; i++) {
    doc.text(headers[i], cx, y + 4);
    cx += colW[i + 1];
  }
  y += 7;
  for (const row of gemRows) {
    if (y > H - 15) { y = newPage(doc, "Gemstone Guide"); }
    setFill(doc, gemRows.indexOf(row) % 2 === 0 ? C_ICE_BLUE : C_WHITE);
    doc.rect(ML, y, CW, 5.5, "F");
    setColor(doc, C_TEXT);
    doc.setFont("times", "normal");
    doc.setFontSize(7.5);
    let rx = ML + 2;
    for (let i = 0; i < row.length; i++) {
      doc.text(row[i], rx, y + 3.8);
      rx += colW[i + 1];
    }
    y += 5.5;
  }
  y += 5;
}

// ─── Page 10: Astro-Vastu & Daily Routine ────────────────────────────────────
function addVastuPage(doc: jsPDF, data: SadeSatiBirthData, chart: SadeSatiChart) {
  let y = newPage(doc, "Astro-Vastu & Routine");
  y = addSectionHeader(doc, "Astro-Vastu Adjustments & Daily Sadhana", "Directional corrections and Saturn-balancing daily routine", y);

  y = addLabel(doc, "WEST DIRECTION — SATURN'S VASTU ZONE", y);
  y = addParagraph(doc, "Saturn governs the West direction in Vastu Shastra. During Sade Sati, keep the western zone of your home clean, clutter-free, and properly lit. Place a small Shani Yantra or Shivalinga in the West. Avoid dustbins, broken items, or dark neglected areas in the West sector.", ML, y, CW) + 4;

  y = addLabel(doc, "SATURN-BALANCING DAILY ROUTINE (DINACHARYA)", y);
  const routine = [
    "4:30-6:00 AM: Wake during Brahma Muhurta. Recite Om Sham Shanaishcharaya Namah 108 times.",
    "6:00-6:30 AM: Grounding yoga — Tadasana, Vrikshasana, Uttanasana (15-20 minutes).",
    "Twice weekly: Warm sesame oil Abhyanga (self-massage) to stabilize root chakra energy.",
    "Diet: Warm, cooked, sattvic foods. Avoid cold, raw, or extremely spicy foods.",
    "Evening: Light a sesame oil lamp before Hanuman or Shani Dev image at sunset on Saturdays.",
    "Saturday fast: Sunrise to sunset. If not possible, consume only black sesame ladoos and water.",
  ];
  for (const r of routine) {
    if (y > H - 15) { y = newPage(doc, "Daily Routine"); }
    setColor(doc, C_TEXT);
    doc.setFont("times", "normal");
    doc.setFontSize(8.5);
    doc.text(`• ${r}`, ML + 3, y);
    y += 5.5;
  }
  y += 4;

  y = addLabel(doc, "SHANI PRANAYAMA FOR MENTAL PEACE", y);
  y = addParagraph(doc, "Practice Nadi Shodhana (Alternate Nostril Breathing) for 10 minutes daily. This pranayama directly calms Saturn's anxiety-producing influence on the nervous system. Begin with 5 rounds and gradually increase. Practice on an empty stomach, ideally during Brahma Muhurta for maximum potency.", ML, y, CW) + 5;
}

// ─── Page 11: Charity & Mantra ────────────────────────────────────────────────
function addCharityMantraPage(doc: jsPDF, data: SadeSatiBirthData, chart: SadeSatiChart) {
  let y = newPage(doc, "Charity & Mantra");
  y = addSectionHeader(doc, "Daan & Mantra — Twin Pillars of Saturn's Pacification", "Prescribed charitable acts and sacred mantras for Sade Sati", y);

  y = addLabel(doc, "SATURDAY CHARITY (SHANI DAAN)", y);
  y = addParagraph(doc, "Items for Shani Daan (most potent on Saturdays): Black sesame seeds, black urad dal (split black lentils), mustard oil, iron objects, dark blue or black clothing, shoes for the poor, and service to elderly or physically challenged individuals. The sincerity and selflessness of the act matters infinitely more than the monetary value.", ML, y, CW) + 4;

  y = addLabel(doc, "SERVICE TO THE MARGINALIZED", y);
  y = addParagraph(doc, "Saturn represents the masses, workers, and the marginalized. Volunteering at elderly care homes, serving food to the poor on Saturdays, donating blankets in winter, or caring for animals (especially crows — Saturn's vehicle) creates direct positive karma offsetting Sade Sati's weight.", ML, y, CW) + 4;

  y = addLabel(doc, "SHANI CHALISA & HANUMAN CHALISA", y);
  y = addParagraph(doc, "Recite the Shani Chalisa every Saturday morning. Recite the Hanuman Chalisa every Tuesday and Saturday evening. Lord Hanuman is one of the most powerful protectors against Saturn's adverse effects — confirmed in the Puranas where Hanuman rescued Saturn from captivity, earning eternal blessings and immunity from Saturn's afflictions.", ML, y, CW) + 4;

  y = addLabel(doc, "MAHAMRITYUNJAYA MANTRA", y);
  y = addParagraph(doc, "For health protection during Sade Sati, chant the Mahamrityunjaya Mantra 108 times daily: Om Tryambakam Yajamahe Sugandhim Pushtivardhanam Urvarukamiva Bandhanan Mrityor Mukshiya Maamritat. Recite with a Rudraksha mala on an empty stomach.", ML, y, CW) + 4;
  setColor(doc, C_GOLD_DARK);
  doc.setFont("times", "bold");
  doc.setFontSize(9);
  doc.text("Om Tryambakam Yajamahe Sugandhim Pushtivardhanam |", ML + CW/2, y, { align: "center" });
  y += 6;
  doc.text("Urvarukamiva Bandhanan Mrityor Mukshiya Maamritat ||", ML + CW/2, y, { align: "center" });
  y += 8;
}

// ─── Page 12: Kantak Shani ────────────────────────────────────────────────────
function addKantakShaniPage(doc: jsPDF, data: SadeSatiBirthData, chart: SadeSatiChart) {
  let y = newPage(doc, "Kantak Shani");
  y = addSectionHeader(doc, "Kantak Shani (Dhaiya) — The Thorny Transit", "Saturn in the 4th and 8th house from your natal Moon", y);

  y = addLabel(doc, "WHAT IS KANTAK SHANI?", y);
  y = addParagraph(doc, "Kantak Shani, also known as Dhaiya or Shani Dhaiya, refers to Saturn's 2.5-year transit through the 4th or 8th house from your natal Moon sign. While less intense than full Sade Sati, Dhaiya brings focused challenges: the 4th house transit creates domestic disruptions and challenges to mental peace, while the 8th house transit brings sudden transformations, hidden obstacles, and karmic debt resolution.", ML, y, CW) + 4;

  const kPhases = getKantakShaniPhases(toUTC(data.dob, data.tob, data.timezone));
  if (kPhases.length > 0) {
    y = addLabel(doc, `YOUR KANTAK SHANI TIMELINE FOR ${chart.rashiName.toUpperCase()} MOON`, y);
    for (const kp of kPhases) {
      if (y > H - 35) { y = newPage(doc, "Kantak Shani"); }
      const start = kp.startDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
      const end = kp.endDate.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
      const houseLabel = kp.house === 4 ? "4th House Dhaiya (Domestic Focus)" : "8th House Dhaiya (Transformation Focus)";
      y = addLabel(doc, `${houseLabel} — ${kp.signName}: ${start} to ${end}`, y);
      const phaseText = kp.house === 4
        ? "Focus: Domestic harmony, mother's health, property matters, and emotional security. Remedy: Light sesame oil lamp at home every Saturday evening. Avoid major property disputes."
        : "Focus: Hidden enemies, chronic health watch, unexpected delays, and spiritual awakening. Remedy: Donate black sesame at a Shiva temple. Avoid extreme sports and maintain regular health checkups.";
      y = addParagraph(doc, phaseText, ML, y, CW) + 4;
    }
  } else {
    y = addLabel(doc, "KANTAK SHANI STATUS", y);
    y = addParagraph(doc, "No active Kantak Shani phases are detected for your current life period. This indicates a window of relative ease from Saturn's concentrated afflictions to your 4th and 8th house domains.", ML, y, CW) + 4;
  }

  y = addLabel(doc, "KANTAK SHANI REMEDY MANTRA", y);
  setColor(doc, C_GOLD_DARK);
  doc.setFont("times", "bold");
  doc.setFontSize(10);
  doc.text("Om Kakadhwajaya Vidmahe Khadgahastaya Dheemahi Tanno Mandah Prachodayat", ML + CW/2, y, { align: "center" });
  y += 8;
}

// ─── Page 13: Trials to Triumph ──────────────────────────────────────────────
function addTrialsToTriumphPage(doc: jsPDF, data: SadeSatiBirthData, chart: SadeSatiChart) {
  let y = newPage(doc, "Trials to Triumph");
  y = addSectionHeader(doc, "Trials to Triumph — Saturn's Greatest Gift", "How Sade Sati transforms the sincere soul into greatness", y);

  y = addLabel(doc, "THE ALCHEMIST'S FIRE", y);
  y = addParagraph(doc, "Throughout Vedic history, the greatest kings, saints, and scholars emerged from Sade Sati as more refined, compassionate, and powerful versions of themselves. Saturn does not break the sincere soul — it forges it in the alchemist's fire. Every challenge during this period is a precisely calibrated test building the exact qualities your soul needs for its next evolutionary level.", ML, y, CW) + 4;

  const caseStudies = [
    ["Mahatma Gandhi", "Several major periods of external defeat and imprisonment aligned with Saturn's transits over his Moon sign. Each restriction deepened his resolve and expanded his moral authority. By the completion of his Sade Sati cycles, his influence had grown from a provincial lawyer to the father of a nation."],
    ["Ratan Tata", "The early years of his leadership at Tata Group coincided with heavy Saturn transits. Navigating massive corporate restructuring, international skepticism, and internal resistance, he emerged as one of India's most respected industrialists — Saturn's testing period became the foundation of his legacy."],
    ["The Universal Pattern", "Those who respond to Saturn with discipline, sincere service, and spiritual practice invariably emerge from Sade Sati in a far stronger life position than where they entered. The secret is simple: do not fight Saturn's lessons. Embrace them as an advanced curriculum in life mastery."],
  ];

  for (const [title, text] of caseStudies) {
    if (y > H - 40) { y = newPage(doc, "Trials to Triumph"); }
    y = addLabel(doc, title.toUpperCase(), y);
    y = addParagraph(doc, text, ML, y, CW) + 4;
  }

  if (y > H - 40) { y = newPage(doc, "Your Journey"); }
  y = addLabel(doc, `${data.name.toUpperCase()}'S SADE SATI JOURNEY`, y);
  y = addParagraph(doc, `As a ${chart.rashiName} Moon native with ${chart.nakshatraName} Nakshatra, your Sade Sati journey is designed to develop the qualities Saturn most values in ${chart.rashiName}'s domain. The pressures you experience are purposeful and precisely proportionate to the growth awaiting you. Post-Sade Sati, classical Jyotish texts consistently note that the 7-10 years following completion are among the most fruitful and expansive periods of a person's entire life. The discipline and structural wisdom accumulated during Saturn's testing period becomes the seed capital for extraordinary growth.`, ML, y, CW) + 5;
}

// ─── Page 14: Sacred Blessings & Closing ─────────────────────────────────────
function addBlessingsPage(doc: jsPDF, data: SadeSatiBirthData, chart: SadeSatiChart) {
  let y = newPage(doc, "Sacred Blessings");
  y = addSectionHeader(doc, "Sacred Blessings & Final Guidance", `Closing wisdom for ${data.name} from the Divine Panchang Astro Council`, y);

  // Blessing box
  setFill(doc, C_NAVY);
  setDraw(doc, C_GOLD);
  doc.setLineWidth(0.5);
  doc.roundedRect(ML, y, CW, 35, 2, 2, "FD");
  setColor(doc, C_GOLD);
  doc.setFont("times", "bold");
  doc.setFontSize(11);
  doc.text("Shubh Aashirwad — Sacred Blessings", W / 2, y + 9, { align: "center" });
  setColor(doc, C_ICE_BLUE);
  doc.setFont("times", "italic");
  doc.setFontSize(8.5);
  const blessingLines = doc.splitTextToSize('"May Lord Shani bless you with the patience of mountains, the wisdom of ages, and the unbreakable strength of one who has walked through fire and emerged as gold. Your karmic account is being balanced with precision and love. Trust the process."', CW - 20);
  doc.text(blessingLines, W / 2, y + 17, { align: "center" });
  setColor(doc, C_GOLD_DARK);
  doc.setFont("times", "bold");
  doc.setFontSize(8);
  doc.text("— Divine Panchang Astro Council", W / 2, y + 32, { align: "center" });
  y += 42;

  y = addLabel(doc, "YOUR PERSONAL COMMITMENT", y);
  y = addParagraph(doc, `I, ${data.name}, born ${data.dob}, commit to approaching this Sade Sati period with discipline, faith, and sincere effort. I will practice the prescribed remedies with consistency, serve those less fortunate with humility, speak with measured wisdom, and approach each challenge as an opportunity for growth.`, ML, y, CW) + 5;

  // Promo offer
  setFill(doc, C_ICE_BLUE);
  setDraw(doc, C_GOLD);
  doc.setLineWidth(0.4);
  doc.roundedRect(ML, y, CW, 22, 1.5, 1.5, "FD");
  setColor(doc, C_NAVY);
  doc.setFont("times", "bold");
  doc.setFontSize(9);
  doc.text("Exclusive Offer: Full Kundali Premium Report — Special Discount for Sade Sati Guide Owners", W / 2, y + 7, { align: "center" });
  doc.setFont("times", "normal");
  doc.setFontSize(8.5);
  doc.text("Visit divinepanchang.space/kundali · Use coupon code SADESATI25 for 25% off", W / 2, y + 14, { align: "center" });
  y += 28;

  // Footer
  setColor(doc, C_MUTED);
  doc.setFont("times", "normal");
  doc.setFontSize(7.5);
  doc.text("Report generated by Divine Panchang | divinepanchang.space | For spiritual and educational guidance only.", W / 2, y + 5, { align: "center" });
  doc.text("Om Sham Shanaishcharaya Namah | Om Shanti Shanti Shanti", W / 2, y + 11, { align: "center" });
}

// ─── Main Export ──────────────────────────────────────────────────────────────

export async function generateSadeSatiPdf(data: SadeSatiBirthData): Promise<Blob> {
  const chart = buildSadeSatiChart(data);

  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });

  addCoverPage(doc, data, chart);
  addWelcomePage(doc, data, chart);
  addIntroPage(doc, data, chart);
  addVedicChartsPage(doc, data, chart);
  addSaturnAnalysisPage(doc, data, chart);
  addTimelinePage(doc, data, chart);
  addYearlyPhasePage(doc, data, chart);
  addLifeAreaPage(doc, data, chart);
  addRemediesPage(doc, data, chart);
  addVastuPage(doc, data, chart);
  addCharityMantraPage(doc, data, chart);
  addKantakShaniPage(doc, data, chart);
  addTrialsToTriumphPage(doc, data, chart);
  addBlessingsPage(doc, data, chart);

  return doc.output("blob");
}
