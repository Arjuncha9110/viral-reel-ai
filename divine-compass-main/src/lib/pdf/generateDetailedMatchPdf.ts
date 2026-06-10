import jsPDF from "jspdf";
import type { ExtractedKundliData, MatchAnalysisResult } from "../kundliMatching/types";
import type { AshtakootResult } from "../calculators/astrology/ashtakoot";

// ─── Constants & Palette ──────────────────────────────────────────────────
const W = 210; // A4 width mm
const H = 297; // A4 height mm
const ML = 15; // margin left
const MR = 15; // margin right
const CW = W - ML - MR; // content width

const C_CREAM      = [255, 250, 240] as const;
const C_MAROON     = [123, 45, 54]   as const;
const C_GOLD       = [215, 185, 106] as const;
const C_GOLD_DARK  = [154, 106, 36]  as const;
const C_TEXT       = [47, 55, 68]    as const;
const C_LIGHT_ALT  = [247, 236, 217] as const;
const C_WHITE      = [255, 255, 255] as const;
const C_GREEN      = [16, 185, 129]  as const;
const C_MUTED      = [140, 122, 107] as const;

// ─── Helpers ───────────────────────────────────────────────────────────────
function setColor(doc: jsPDF, c: readonly [number, number, number]) {
  doc.setTextColor(c[0], c[1], c[2]);
}

function setFill(doc: jsPDF, c: readonly [number, number, number]) {
  doc.setFillColor(c[0], c[1], c[2]);
}

function setDraw(doc: jsPDF, c: readonly [number, number, number]) {
  doc.setDrawColor(c[0], c[1], c[2]);
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

function applyPageBackground(doc: jsPDF) {
  setFill(doc, C_CREAM);
  doc.rect(0, 0, W, H, "F");
  setDraw(doc, C_GOLD);
  doc.setLineWidth(0.18);
  doc.circle(W / 2, H / 2, 54, "D");
  doc.circle(W / 2, H / 2, 65, "D");
}

function addSectionHeader(doc: jsPDF, title: string, subtitle: string, y: number): number {
  const titleLines = wrap(doc, title, CW - 12);
  const subtitleLines = wrap(doc, subtitle, CW - 12);
  const blockHeight = Math.max(18, 5 + titleLines.length * 5.2 + 1.5 + subtitleLines.length * 4.4 + 4);

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
    textY += 5.2;
  }

  setColor(doc, C_TEXT);
  doc.setFont("times", "italic");
  doc.setFontSize(8.5);
  for (const line of subtitleLines) {
    doc.text(line, ML + 6, textY);
    textY += 4.4;
  }

  setDraw(doc, C_GOLD);
  doc.setLineWidth(0.4);
  doc.line(ML, y - 4 + blockHeight, ML + CW, y - 4 + blockHeight);

  return y - 4 + blockHeight + 6;
}

function addParagraph(doc: jsPDF, text: string, x: number, y: number, maxW: number, startNewPage: () => number): number {
  setColor(doc, C_TEXT);
  doc.setFont("times", "normal");
  doc.setFontSize(9.5);
  const lines = wrap(doc, text, maxW);
  for (const line of lines) {
    if (y > H - 15) y = startNewPage();
    doc.text(line, x, y);
    y += 5.2;
  }
  return y + 4;
}

// ─── Main Generator ────────────────────────────────────────────────────────
export async function generateDetailedMatchPdf(
  groomData: ExtractedKundliData,
  brideData: ExtractedKundliData,
  analysis: MatchAnalysisResult,
  ashtakoot: AshtakootResult
): Promise<Blob> {
  const doc = new jsPDF("p", "mm", "a4");
  let pageNum = 1;

  function startNewPage() {
    if (pageNum > 1) doc.addPage();
    applyPageBackground(doc);

    // Top border
    setFill(doc, C_MAROON);
    doc.rect(0, 0, W, 10, "F");
    setColor(doc, C_GOLD);
    doc.setFont("times", "bold");
    doc.setFontSize(9);
    doc.text("DIVINE PANCHANG  ·  DETAILED KUNDALI MATCHING", ML, 6.5);
    
    // Bottom border
    setFill(doc, C_MAROON);
    doc.rect(0, H - 8, W, 8, "F");
    setFill(doc, C_GOLD);
    doc.rect(0, H - 9, W, 1, "F");
    
    setColor(doc, C_GOLD);
    doc.setFontSize(8);
    doc.setFont("times", "bold");
    doc.text(`Page ${pageNum}`, W / 2, H - 3, { align: "center" });

    pageNum++;
    return 20;
  }

  // ─── COVER PAGE ────────────────────────────────────────────────────
  applyPageBackground(doc);
  setDraw(doc, C_MAROON);
  doc.setLineWidth(0.8);
  doc.rect(5, 5, W - 10, H - 10, "D");
  doc.setLineWidth(0.3);
  setDraw(doc, C_GOLD);
  doc.rect(6.5, 6.5, W - 13, H - 13, "D");

  setColor(doc, C_MAROON);
  doc.setFont("times", "bold");
  doc.setFontSize(22);
  doc.text("DIVINE MATCH ANALYSIS", W / 2, 25, { align: "center" });

  setColor(doc, C_GOLD_DARK);
  doc.setFont("times", "italic");
  doc.setFontSize(10);
  doc.text("Vedic Guidance & Premium Compatibility Report", W / 2, 31, { align: "center" });

  drawGoldenMandala(doc, W / 2, 75, 28);
  setColor(doc, C_MAROON);
  doc.setFont("times", "bold");
  doc.setFontSize(38);
  doc.text("ॐ", W / 2, 80, { align: "center" });

  // Groom vs Bride Names
  let coverY = 130;
  setColor(doc, C_TEXT);
  doc.setFontSize(18);
  doc.setFont("times", "bold");
  doc.text(groomData.name || analysis.groomName || "Groom", W / 4, coverY, { align: "center" });
  doc.text(brideData.name || analysis.brideName || "Bride", (W / 4) * 3, coverY, { align: "center" });
  
  setColor(doc, C_GOLD_DARK);
  doc.setFontSize(14);
  doc.setFont("times", "italic");
  doc.text("Weds", W / 2, coverY, { align: "center" });

  coverY += 30;

  // Rating Badge
  setFill(doc, C_MAROON);
  doc.roundedRect(W / 2 - 20, coverY, 40, 25, 2, 2, "F");
  setDraw(doc, C_GOLD);
  doc.roundedRect(W / 2 - 20, coverY, 40, 25, 2, 2, "D");
  
  setColor(doc, C_GOLD);
  doc.setFontSize(10);
  doc.text("MATCH RATING", W / 2, coverY + 7, { align: "center" });
  doc.setFontSize(24);
  setColor(doc, C_WHITE);
  doc.text(`${analysis.recommendationRating}/10`, W / 2, coverY + 18, { align: "center" });

  // ─── PAGE 2: CHART DATA ────────────────────────────────────────────
  let y = startNewPage();
  y = addSectionHeader(doc, "Partner Profiles", "Extracted details from provided Janam Kundlis", y);

  // Side by Side details
  const drawDetails = (data: ExtractedKundliData, cx: number) => {
    setFill(doc, C_WHITE);
    setDraw(doc, C_GOLD);
    doc.roundedRect(cx, y, CW / 2 - 2, 50, 1.5, 1.5, "FD");
    
    setColor(doc, C_MAROON);
    doc.setFont("times", "bold");
    doc.setFontSize(11);
    doc.text(data.name || "Unknown", cx + 5, y + 8);
    
    setColor(doc, C_TEXT);
    doc.setFontSize(9);
    doc.setFont("times", "normal");
    
    let ly = y + 15;
    const dy = 5.5;
    
    doc.setFont("times", "bold"); doc.text("DOB: ", cx + 5, ly);
    doc.setFont("times", "normal"); doc.text(data.dateOfBirth || "N/A", cx + 20, ly);
    ly += dy;
    
    doc.setFont("times", "bold"); doc.text("Time: ", cx + 5, ly);
    doc.setFont("times", "normal"); doc.text(data.timeOfBirth || "N/A", cx + 20, ly);
    ly += dy;
    
    doc.setFont("times", "bold"); doc.text("Lagna: ", cx + 5, ly);
    doc.setFont("times", "normal"); doc.text(data.lagna || "N/A", cx + 20, ly);
    ly += dy;
    
    doc.setFont("times", "bold"); doc.text("Moon: ", cx + 5, ly);
    doc.setFont("times", "normal"); doc.text(data.moonSign || "N/A", cx + 20, ly);
    ly += dy;
    
    doc.setFont("times", "bold"); doc.text("Nak: ", cx + 5, ly);
    doc.setFont("times", "normal"); doc.text(data.nakshatra || "N/A", cx + 20, ly);
  };

  drawDetails(groomData, ML);
  drawDetails(brideData, ML + CW / 2 + 2);
  y += 60;

  // ─── SUMMARY SCORE & VERDICT ─────────────────────────────────────────
  if (y > H - 60) y = startNewPage();
  setFill(doc, C_LIGHT_ALT);
  setDraw(doc, C_GOLD);
  doc.roundedRect(ML, y, CW, 45, 2, 2, "FD");

  setColor(doc, C_MAROON);
  doc.setFont("times", "bold");
  doc.setFontSize(14);
  doc.text("ASHTAKOOT MILAN SCORE", ML + CW/2, y + 10, { align: "center" });

  setColor(doc, C_GOLD_DARK);
  doc.setFontSize(26);
  doc.text(`${ashtakoot.totalScore} / 36`, ML + CW/2, y + 22, { align: "center" });

  setColor(doc, C_TEXT);
  doc.setFontSize(10);
  doc.setFont("times", "normal");
  let summaryText = ashtakoot.totalScore >= 18 
    ? "A score of 18 or above indicates a mathematically favorable union according to Vedic principles. The alignment of Nakshatras and Moon signs provides a strong foundation."
    : "A score below 18 suggests structural challenges in natural compatibility. Additional remedies and conscious effort may be required for long-term harmony.";
  
  if (ashtakoot.nadi.score === 0) {
    summaryText += " Note: Nadi Dosha is present, which traditionally requires careful consideration regarding health and lineage.";
  } else if (ashtakoot.bhakoot.score === 0) {
    summaryText += " Note: Bhakoot Dosha is present, suggesting potential emotional or material friction that requires mutual understanding.";
  }
  
  const sumLines = wrap(doc, summaryText, CW - 20);
  let sy = y + 30;
  for (const l of sumLines) { doc.text(l, ML + 10, sy); sy += 5; }
  y += 55;

  // ─── ASHTAKOOT DETAILED BREAKDOWN ───────────────────────────────────
  y = startNewPage();
  y = addSectionHeader(doc, "Detailed Ashtakoot Breakdown", "In-depth analysis of the 8 Vedic compatibility factors", y);

  const kootas = [
    { 
      name: "1. Varna (Spiritual & Work Alignment)", 
      score: ashtakoot.varna.score, max: ashtakoot.varna.max, 
      meaning: "Varna measures the alignment of ego, spiritual development, and innate work tendencies. It ensures that the partners have compatible core values and mutual respect.",
      interpretation: ashtakoot.varna.score > 0 
        ? "Excellent compatibility. The groom's energetic temperament supports the bride's, creating a natural dynamic of leadership and harmony without ego clashes." 
        : "Varna mismatch. There may be occasional differences in spiritual priorities or work ethics. Cultivating mutual respect for each other's career and life choices is essential."
    },
    { 
      name: "2. Vashya (Magnetic Attraction & Influence)", 
      score: ashtakoot.vashya.score, max: ashtakoot.vashya.max, 
      meaning: "Vashya indicates the degree of magnetic attraction, affection, and the natural ability to positively influence each other.",
      interpretation: ashtakoot.vashya.score === 2 
        ? "High magnetic attraction. The couple naturally draws toward each other and can easily resolve conflicts through mutual affection and underlying devotion." 
        : "Average magnetic attraction. While the initial spark may vary, the couple will need to build influence through conscious communication rather than relying solely on instinctual pull."
    },
    { 
      name: "3. Tara (Destiny & Mutual Fortune)", 
      score: ashtakoot.tara.score, max: ashtakoot.tara.max, 
      meaning: "Tara assesses the auspiciousness of the stars relative to each other, indicating whether the partners bring good fortune, health, and prosperity into each other's lives.",
      interpretation: ashtakoot.tara.score >= 2 
        ? "Highly auspicious destiny alignment. The union is likely to bring mutual luck, growth in wealth, and overall well-being. You act as lucky charms for each other." 
        : "Average destiny alignment. While not inherently harmful, fortune will rely more on individual karmic efforts and hard work rather than spontaneous luck from the union."
    },
    { 
      name: "4. Yoni (Physical & Intimate Chemistry)", 
      score: ashtakoot.yoni.score, max: ashtakoot.yoni.max, 
      meaning: "Yoni measures instinctual physical compatibility, sexual chemistry, and the natural biological harmony between the couple.",
      interpretation: ashtakoot.yoni.score >= 3 
        ? "Excellent physical compatibility. There is a deep, instinctive physical bond that fosters intimacy, satisfaction, and romantic longevity." 
        : "Moderate physical compatibility. While there is no intense biological clash, building a fulfilling intimate life will require open communication and learning each other's needs."
    },
    { 
      name: "5. Graha Maitri (Mental & Friendship Compatibility)", 
      score: ashtakoot.grahaMaitri.score, max: ashtakoot.grahaMaitri.max, 
      meaning: "Graha Maitri is governed by the planetary lords of the Moon signs. It reveals psychological compatibility, friendship, and how well the couple's minds harmonize.",
      interpretation: ashtakoot.grahaMaitri.score >= 4 
        ? "Outstanding mental compatibility. The planetary lords are friends, meaning you share a natural intellectual rapport, similar worldviews, and a deep bedrock of true friendship." 
        : "Average mental harmony. You may occasionally view the world through different lenses. Cultivating patience and seeking to understand the other's perspective is key."
    },
    { 
      name: "6. Gana (Temperament & Behavioral Nature)", 
      score: ashtakoot.gana.score, max: ashtakoot.gana.max, 
      meaning: "Gana categorizes nature into Deva (Divine), Manushya (Human), and Rakshasa (Fierce). It determines how the couple reacts to stress, daily challenges, and life rhythms.",
      interpretation: ashtakoot.gana.score >= 5 
        ? "Harmonious temperaments. You naturally synchronize in your daily behaviors and reactions to stress, making domestic life peaceful and predictable." 
        : "Temperament mismatch. One partner may be significantly more intense, aggressive, or fast-paced than the other. Giving each other grace during stressful times is vital."
    },
    { 
      name: "7. Bhakoot (Emotional Resonance & Family Growth)", 
      score: ashtakoot.bhakoot.score, max: ashtakoot.bhakoot.max, 
      meaning: "Bhakoot looks at the relative distance between the Moon signs. It strongly influences emotional health, the ability to build a family, and long-term domestic prosperity.",
      interpretation: ashtakoot.bhakoot.score === 7 
        ? "Excellent emotional harmony. The moon signs are positioned auspiciously, promoting a nurturing home environment, emotional safety, and shared prosperity." 
        : "Bhakoot Dosha present. The signs are in a challenging angle (such as 6/8 or 2/12). This can occasionally bring emotional friction or financial hurdles. Transparency and avoiding ego battles are crucial remedies."
    },
    { 
      name: "8. Nadi (Genetic Energy & Vitality)", 
      score: ashtakoot.nadi.score, max: ashtakoot.nadi.max, 
      meaning: "Nadi represents the physiological and genetic energies (Vata, Pitta, Kapha). Traditional astrology uses this to gauge health, vitality, and the wellness of future progeny.",
      interpretation: ashtakoot.nadi.score === 8 
        ? "Perfect Nadi compatibility. The differing vital energies create a healthy biological balance, ensuring strong vitality and auspicious prospects for lineage and overall health." 
        : "Nadi Dosha present (Same Nadi). Traditional texts advise caution as similar energies can cause biological or energetic imbalances. However, modern astrology views this not as a curse, but as a prompt to maintain healthy lifestyles, consider medical genetic screening if planning a family, and perform Nadi Dosha parihara (charity and spiritual remedies) to mitigate energetic friction."
    }
  ];

  kootas.forEach(koota => {
    // Check if we need a new page
    if (y > H - 55) y = startNewPage();

    setFill(doc, C_WHITE);
    setDraw(doc, C_GOLD);
    doc.setLineWidth(0.2);
    
    // Estimate height
    const meanLines = wrap(doc, koota.meaning, CW - 20);
    const intLines = wrap(doc, koota.interpretation, CW - 20);
    const boxH = 32 + (meanLines.length * 4.5) + (intLines.length * 4.5);

    if (y + boxH > H - 15) {
      y = startNewPage();
    }

    doc.roundedRect(ML, y, CW, boxH, 1.5, 1.5, "FD");
    
    setColor(doc, C_MAROON);
    doc.setFont("times", "bold");
    doc.setFontSize(11);
    doc.text(koota.name, ML + 5, y + 8);

    const isPerfect = koota.score === koota.max;
    const isZero = koota.score === 0;
    
    if (isPerfect) setFill(doc, [209, 250, 229]); // emerald-100
    else if (isZero) setFill(doc, [254, 226, 226]); // red-100
    else setFill(doc, [254, 243, 199]); // amber-100

    doc.roundedRect(ML + CW - 25, y + 4, 20, 6, 1, 1, "F");
    
    if (isPerfect) setColor(doc, [5, 150, 105]); // emerald-600
    else if (isZero) setColor(doc, [220, 38, 38]); // red-600
    else setColor(doc, [217, 119, 6]); // amber-600
    
    doc.setFontSize(10);
    doc.text(`${koota.score} / ${koota.max}`, ML + CW - 15, y + 8.5, { align: "center" });

    setColor(doc, C_GOLD_DARK);
    doc.setFontSize(9);
    doc.setFont("times", "bold");
    doc.text("Astrological Meaning:", ML + 5, y + 16);
    
    setColor(doc, C_TEXT);
    doc.setFont("times", "normal");
    let textY = y + 21;
    for (const l of meanLines) { doc.text(l, ML + 5, textY); textY += 4.5; }

    textY += 2;
    setColor(doc, C_MAROON);
    doc.setFont("times", "bold");
    doc.text("Interpretation & Practical Impact:", ML + 5, textY);
    textY += 5;

    setColor(doc, C_TEXT);
    doc.setFont("times", "normal");
    for (const l of intLines) { doc.text(l, ML + 5, textY); textY += 4.5; }

    y += boxH + 6;
  });

  // ─── ANALYSIS SECTIONS ──────────────────────────────────────────────
  const renderSection = (title: string, subtitle: string, content: string) => {
    if (y > H - 40) y = startNewPage();
    y = addSectionHeader(doc, title, subtitle, y);
    y = addParagraph(doc, content, ML, y, CW, startNewPage);
    y += 5;
  };

  renderSection("Emotional & Mental Harmony", "Moon signs, emotional needs, and communication compatibility", analysis.emotionalHarmony);
  renderSection("Practical & Life Compatibility", "Shared goals, day-to-day life, and mutual understanding", analysis.practicalCompatibility);
  renderSection("Physical & Passion Chemistry", "Attraction, physical energy, and romantic synergy", analysis.physicalChemistry);
  renderSection("Manglik Dosha Analysis", "Assessment of Mars placement and cancellation factors", analysis.manglikDoshaAnalysis);

  if (analysis.groomPlanets && analysis.bridePlanets && analysis.groomPlanets.length > 0) {
    if (y > H - 100) y = startNewPage();
    y = addSectionHeader(doc, "Planetary Placements (D1 & D9)", "Deterministic comparison of classical planets", y);
    
    // Draw Table Header
    setFill(doc, C_MAROON);
    doc.rect(ML, y, CW, 8, "F");
    setColor(doc, C_WHITE);
    doc.setFont("times", "bold");
    doc.setFontSize(9);
    
    const cw1 = 25, cw2 = 25, cw3 = 20, cw4 = 25, cw5 = 25, cw6 = 20, cw7 = 25;
    let cx = ML;
    doc.text("Planet", cx + 2, y + 5); cx += cw1;
    doc.text("Groom D1", cx + 2, y + 5); cx += cw2;
    doc.text("Degree", cx + 2, y + 5); cx += cw3;
    doc.text("Groom D9", cx + 2, y + 5); cx += cw4;
    doc.text("Bride D1", cx + 2, y + 5); cx += cw5;
    doc.text("Degree", cx + 2, y + 5); cx += cw6;
    doc.text("Bride D9", cx + 2, y + 5);
    
    y += 8;
    
    // Draw Rows
    for (let i = 0; i < analysis.groomPlanets.length; i++) {
      const gp = analysis.groomPlanets[i];
      const bp = analysis.bridePlanets.find(p => p.name === gp.name);
      if (!bp) continue;
      
      if (y > H - 15) {
        y = startNewPage();
      }
      
      setFill(doc, i % 2 === 0 ? C_WHITE : C_LIGHT_ALT);
      doc.rect(ML, y, CW, 7, "F");
      
      setColor(doc, C_TEXT);
      doc.setFont("times", "normal");
      doc.setFontSize(8);
      
      cx = ML;
      doc.setFont("times", "bold");
      doc.text(gp.name, cx + 2, y + 5); 
      doc.setFont("times", "normal");
      cx += cw1;
      
      doc.text(gp.d1Sign, cx + 2, y + 5); cx += cw2;
      doc.text(`${gp.d1Degree.toFixed(2)}°`, cx + 2, y + 5); cx += cw3;
      
      setColor(doc, C_MAROON);
      doc.setFont("times", "bold");
      doc.text(gp.d9Sign, cx + 2, y + 5); cx += cw4;
      
      setColor(doc, C_TEXT);
      doc.setFont("times", "normal");
      doc.text(bp.d1Sign, cx + 2, y + 5); cx += cw5;
      doc.text(`${bp.d1Degree.toFixed(2)}°`, cx + 2, y + 5); cx += cw6;
      
      setColor(doc, C_MAROON);
      doc.setFont("times", "bold");
      doc.text(bp.d9Sign, cx + 2, y + 5);
      
      y += 7;
    }
    
    y += 10;
  }

  if (analysis.d9NavamsaIndications) {
    renderSection("Navamsa (D9) Marriage Indications", "Deeper spiritual and marital destiny insights", analysis.d9NavamsaIndications);
  }

  // ─── STRENGTHS AND CAUTIONS ──────────────────────────────────────────
  if (y > H - 60) y = startNewPage();
  
  y = addSectionHeader(doc, "Key Observations", "Strengths and potential areas of caution", y);
  
  setColor(doc, C_GREEN);
  doc.setFont("times", "bold");
  doc.setFontSize(10);
  doc.text("Greatest Strengths:", ML, y);
  y += 5;
  analysis.strengths.forEach(s => {
    if (y > H - 15) y = startNewPage();
    setColor(doc, C_TEXT);
    doc.setFont("times", "normal");
    const lines = wrap(doc, `• ${s}`, CW - 5);
    for (const l of lines) { doc.text(l, ML + 3, y); y += 5; }
  });
  
  y += 5;
  setColor(doc, C_MAROON);
  doc.setFont("times", "bold");
  doc.setFontSize(10);
  doc.text("Caution Areas / Remedies:", ML, y);
  y += 5;
  analysis.cautionAreas.forEach(c => {
    if (y > H - 15) y = startNewPage();
    setColor(doc, C_TEXT);
    doc.setFont("times", "normal");
    const lines = wrap(doc, `• ${c}`, CW - 5);
    for (const l of lines) { doc.text(l, ML + 3, y); y += 5; }
  });

  // ─── VERDICT ───────────────────────────────────────────────────────
  if (y > H - 40) y = startNewPage();
  y += 5;
  setFill(doc, C_LIGHT_ALT);
  setDraw(doc, C_GOLD);
  doc.roundedRect(ML, y, CW, 35, 2, 2, "FD");
  
  setColor(doc, C_MAROON);
  doc.setFont("times", "bold");
  doc.setFontSize(12);
  doc.text("FINAL VEDIC VERDICT", ML + CW/2, y + 8, { align: "center" });
  
  y += 15;
  y = addParagraph(doc, analysis.finalVerdict, ML + 5, y, CW - 10, startNewPage);

  // Disclaimer
  if (y > H - 30) y = startNewPage();
  y += 10;
  setColor(doc, C_MUTED);
  doc.setFont("times", "italic");
  doc.setFontSize(8);
  const disclaimer = "Disclaimer: This compatibility report uses advanced astrological chart parsing to provide spiritual and educational guidance based on Vedic principles. It should not replace professional counseling or absolute decision-making.";
  wrap(doc, disclaimer, CW).forEach(l => {
    doc.text(l, ML, y);
    y += 4;
  });

  return doc.output("blob");
}
