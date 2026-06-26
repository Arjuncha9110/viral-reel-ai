import React from "react";
import { cn } from "@/lib/utils";
import { lookupTranslation } from "@/lib/pdf/preTranslate";
import { KANNADA_DICT } from "@/lib/pdf/kannadaTranslations";

function t(text: string, language?: "en" | "kn"): string {
  if (language === "kn" && text) {
    const cleanText = text.trim();
    const cachedTranslation = lookupTranslation(cleanText) ?? lookupTranslation(text);
    if (cachedTranslation) return cachedTranslation;
    if (KANNADA_DICT[cleanText]) return KANNADA_DICT[cleanText];
    if (KANNADA_DICT[text]) return KANNADA_DICT[text];

    let result = text;
    if (cleanText === "Divine Panchang · Premium Horoscope") return "ಡಿವೈನ್ ಪಂಚಾಂಗ · ಪ್ರೀಮಿಯಂ ಜನ್ಮ ಪತ್ರಿಕೆ";
    if (cleanText === "The chart of the soul, inner potential, and marriage/harmonious path")
      return "ಆತ್ಮದ ಸಾಮರ್ಥ್ಯ, ಆಂತರಿಕ ಬಲ ಮತ್ತು ವಿವಾಹ ಯೋಗವನ್ನು ತಿಳಿಸುವ ವರ್ಗ ಕುಂಡಲಿ";

    if (result.includes("deg N")) result = result.replace("deg N", "ಡಿಗ್ರಿ ಉ");
    if (result.includes("deg S")) result = result.replace("deg S", "ಡಿಗ್ರಿ ದ");
    if (result.includes("deg E")) result = result.replace("deg E", "ಡಿಗ್ರಿ ಪೂ");
    if (result.includes("deg W")) result = result.replace("deg W", "ಡಿಗ್ರಿ ಪ");
    if (result.includes("Approx")) result = result.replace("Approx", "ಅಂದಾಜು");
    if (result.includes("Years")) result = result.replace("Years", "ವರ್ಷಗಳು");
    if (result.includes("Bhukti")) result = result.replace("Bhukti", "ಭುಕ್ತಿ");
    if (result.includes("ACTIVE")) result = result.replace("ACTIVE", "ಸಕ್ರಿಯ");
    if (result.includes("CURRENT")) result = result.replace("CURRENT", "ಪ್ರಸ್ತುತ");
    if (result.includes("deg")) result = result.replace("deg", "ಡಿಗ್ರಿ");
    return result;
  }
  return text;
}

// ─── Reusable Ornate Corner Decal Component ───
const GoldCorners = () => (
  <>
    <div className="absolute top-[8mm] left-[8mm] w-8 h-8 rounded-tl-[18px] border-t-2 border-l-2 border-[#c7a65a] pointer-events-none z-20" />
    <div className="absolute top-[8mm] right-[8mm] w-8 h-8 rounded-tr-[18px] border-t-2 border-r-2 border-[#c7a65a] pointer-events-none z-20" />
    <div className="absolute bottom-[8mm] left-[8mm] w-8 h-8 rounded-bl-[18px] border-b-2 border-l-2 border-[#c7a65a] pointer-events-none z-20" />
    <div className="absolute bottom-[8mm] right-[8mm] w-8 h-8 rounded-br-[18px] border-b-2 border-r-2 border-[#c7a65a] pointer-events-none z-20" />
    <div className="absolute top-[9.5mm] left-[9.5mm] w-1.5 h-1.5 rounded-full bg-[#c7a65a] pointer-events-none z-20" />
    <div className="absolute top-[9.5mm] right-[9.5mm] w-1.5 h-1.5 rounded-full bg-[#c7a65a] pointer-events-none z-20" />
    <div className="absolute bottom-[9.5mm] left-[9.5mm] w-1.5 h-1.5 rounded-full bg-[#c7a65a] pointer-events-none z-20" />
    <div className="absolute bottom-[9.5mm] right-[9.5mm] w-1.5 h-1.5 rounded-full bg-[#c7a65a] pointer-events-none z-20" />
  </>
);

const SwastikGeometry: React.FC<{
  className?: string;
  strokeColor?: string;
  strokeWidth?: number;
}> = ({ className, strokeColor, strokeWidth }) => {
  const primaryStroke = strokeColor ?? "#f1d78a";

  return (
    <svg
      viewBox="0 0 100 100"
      className={cn("overflow-visible", className)}
      aria-hidden="true"
      role="presentation"
    >
      <g stroke={primaryStroke} strokeWidth={strokeWidth ?? 12} strokeLinecap="square" fill="none">
        <line x1="50" y1="16" x2="50" y2="84" />
        <line x1="16" y1="50" x2="84" y2="50" />
        <line x1="50" y1="16" x2="72" y2="16" />
        <line x1="84" y1="50" x2="84" y2="72" />
        <line x1="50" y1="84" x2="28" y2="84" />
        <line x1="16" y1="50" x2="16" y2="28" />
      </g>
    </svg>
  );
};

const SpiritualGlyphBadge: React.FC<{
  symbol: string;
  label: string;
}> = ({ symbol, label }) => {
  const isOm = symbol === "ॐ" || symbol === "om";
  const isSwastik = symbol === "swastik" || symbol === "卐";

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-full border text-center shadow-sm w-20 h-20 border-[#d9bd73]/45 bg-[#0a1c35]/70 text-[#f1d78a] shadow-[0_10px_24px_rgba(8,24,45,0.22)]"
      )}
    >
      {isOm ? (
        <svg viewBox="0 0 100 100" className="w-[32px] h-[32px]" aria-hidden="true">
          <text x="50" y="72" textAnchor="middle" fontSize="72" fontFamily="serif" fill="#f1d78a">ॐ</text>
        </svg>
      ) : isSwastik ? (
        <SwastikGeometry className="w-[28px] h-[28px]" />
      ) : (
        <span className="leading-none text-[30px]">{symbol}</span>
      )}
      <span
        className="mt-1 uppercase tracking-[0.18em] text-[8px] text-[#fff3c6]/72"
      >
        {label}
      </span>
    </div>
  );
};

// ─── 1. Upgraded Report Page Wrapper ───
interface ReportPageProps {
  children: React.ReactNode;
  pageNumber?: number;
  sectionTitle?: string;
  className?: string;
  isDark?: boolean;
  language?: "en" | "kn";
  exportMode?: boolean;
}

export const ReportPage: React.FC<ReportPageProps> = ({
  children,
  pageNumber,
  sectionTitle = "Vedic Astrology Report",
  className,
  isDark = false,
  language = "en",
  exportMode = false,
}) => {
  const useDarkStyle = isDark && !exportMode;

  return (
      <div
        data-report-page="true"
        data-report-language={language}
        data-export-mode={exportMode ? "true" : "false"}
        lang={language === "kn" ? "kn" : "en"}
        className={cn(
          "relative w-[210mm] min-h-[296.8mm] h-max print:h-[297mm] print:overflow-hidden p-[16mm] flex flex-col justify-between select-none print:m-0 print:border-none print:shadow-none print:rounded-none",
        exportMode && "min-h-[297mm] h-[297mm] p-[13mm]",
        useDarkStyle
          ? "bg-[#07182d] text-[#fffaf0] border-2 border-[#c7a65a] page-break-dark"
          : exportMode 
            ? "bg-white text-black border border-gray-300 page-break"
            : "bg-[#fffaf0] text-[#243040] border-2 border-[#d7b96a]/70 page-break",
        exportMode
          ? "shadow-none my-0 mx-auto"
          : "shadow-[0_28px_80px_rgba(8,24,45,0.28)] rounded-sm my-6 mx-auto print:my-0 print:shadow-none",
        className
      )}
      style={{
        boxSizing: "border-box",
        pageBreakAfter: "always",
        breakAfter: "page",
        WebkitPrintColorAdjust: "exact",
        printColorAdjust: "exact",
      }}
    >
      {!exportMode && (
        <>
          <div
            className={cn(
              "absolute inset-0 pointer-events-none",
              useDarkStyle
                ? "bg-[radial-gradient(circle_at_50%_24%,rgba(199,166,90,0.16),transparent_30%),linear-gradient(155deg,#07182d_0%,#0a2440_48%,#061225_100%)]"
                : "bg-[radial-gradient(circle_at_18%_12%,rgba(215,185,106,0.18),transparent_26%),radial-gradient(circle_at_88%_76%,rgba(114,47,55,0.08),transparent_32%),linear-gradient(180deg,#fffdf7_0%,#fff7e8_100%)]"
            )}
          />
          <div
            className={cn(
              "absolute left-1/2 top-[47%] h-[118mm] w-[118mm] -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none",
              useDarkStyle
                ? "border-[10px] border-[#c7a65a]/[0.055] shadow-[0_0_0_26px_rgba(199,166,90,0.03)]"
                : "border-[10px] border-[#c7a65a]/[0.045] shadow-[0_0_0_22px_rgba(114,47,55,0.025)]"
            )}
          />
          <div
            className={cn(
              "absolute left-[24mm] right-[24mm] top-[13mm] h-px pointer-events-none",
              useDarkStyle ? "bg-gradient-to-r from-transparent via-[#c7a65a]/60 to-transparent" : "bg-gradient-to-r from-transparent via-[#9a6a24]/40 to-transparent"
            )}
          />
        </>
      )}
      <div
        className={cn(
          "absolute top-[6mm] bottom-[6mm] left-[6mm] right-[6mm] pointer-events-none border",
          useDarkStyle ? "border-[#c7a65a]/20" : exportMode ? "border-gray-200" : "border-[#9a6a24]/15"
        )}
      />
      <div
        className={cn(
          "absolute top-[8mm] bottom-[8mm] left-[8mm] right-[8mm] pointer-events-none border-2",
          useDarkStyle ? "border-[#c7a65a]/70" : exportMode ? "border-gray-300" : "border-[#d7b96a]/55"
        )}
      />

      {/* Traditional Ornate Corner Accents */}
      <GoldCorners />

      {/* Header (Hidden on Cover Page / Dark Pages) */}
      {!useDarkStyle && (
        <div className={cn("flex justify-between items-center pb-2.5 z-10 font-serif", exportMode ? "border-b border-gray-300" : "border-b-2 border-[#d7b96a]/35")}>
          <span className={cn("text-[10px] uppercase tracking-[0.28em] font-extrabold", exportMode ? "text-gray-800" : "text-[#7b2d36]")}>
            {t("Divine Panchang · Premium Horoscope", language)}
          </span>
          <span className={cn("text-[10px] uppercase tracking-[0.22em] font-extrabold", exportMode ? "text-gray-700" : "text-[#9a6a24]")}>
            {t(sectionTitle, language)}
          </span>
        </div>
      )}

      {/* Page Content */}
      <div className={cn(
        "flex-1 py-5 z-10 overflow-visible flex flex-col font-serif relative [font-feature-settings:'kern']",
        exportMode && "py-3"
      )}>
        {children}
      </div>

      {/* Footer */}
      <div className={cn("flex justify-between items-center pt-2 z-10 font-serif", exportMode ? "border-t border-gray-300" : "border-t border-[#d7b96a]/25")}>
        <span className={cn("text-[9px] uppercase tracking-[0.24em] font-bold", useDarkStyle ? "text-[#fffaf0]/45" : exportMode ? "text-gray-700" : "text-[#7b2d36]/55")}>
          divinepanchang.space
        </span>
        {pageNumber !== undefined && (
          <span className={cn("text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border", useDarkStyle ? "text-[#fffaf0] bg-[#c7a65a]/15 border-[#c7a65a]/35" : exportMode ? "text-gray-800 bg-gray-100 border-gray-300" : "text-[#7b2d36] bg-[#d7b96a]/15 border-[#d7b96a]/35")}>
            {t("Page", language)} {pageNumber}
          </span>
        )}
      </div>
    </div>
  );
};

// ─── 2. Luxury Cover Page ───
interface CoverPageProps {
  name: string;
  dob: string;
  tob: string;
  city: string;
  lagna: string;
  rashi: string;
  nakshatra: string;
  reportType?: string;
  priceTag?: string;
  language?: "en" | "kn";
  exportMode?: boolean;
}

export const CoverPage: React.FC<CoverPageProps> = ({
  name,
  dob,
  tob,
  city,
  lagna,
  rashi,
  nakshatra,
  reportType = "Janma Kundali Report",
  priceTag,
  language = "en",
}) => {
  return (
    <ReportPage isDark={true} pageNumber={1} sectionTitle="Cover Page" language={language}>
      <div className="h-full flex flex-col justify-between items-center py-6 relative">

        {/* Sri Chakra logo — centered background watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-0">
          <img
            src="/logo-srichakra.png"
            alt=""
            aria-hidden
            className="w-[340px] h-[340px] object-contain opacity-[0.07] mix-blend-screen"
            style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" } as React.CSSProperties}
          />
        </div>

        {/* HUGE luxury background cosmic mandala watermark */}
        <div className="absolute top-[16%] w-[500px] h-[500px] rounded-full border-4 border-[#c7a65a]/12 flex items-center justify-center opacity-50 animate-[spin_180s_linear_infinite] pointer-events-none">
          <div className="w-[452px] h-[452px] rounded-full border-2 border-dashed border-[#c7a65a]/26 flex items-center justify-center">
            <div className="w-[382px] h-[382px] rounded-full border border-[#c7a65a]/18 flex items-center justify-center">
              <div className="w-[292px] h-[292px] rounded-full border-4 border-double border-[#c7a65a]/18" />
            </div>
          </div>
        </div>
        <div className="absolute bottom-[9%] left-[12%] h-[90px] w-[360px] rounded-[100%] border-t-2 border-[#c7a65a]/15 rotate-[-8deg] pointer-events-none" />

        {/* Top Ornate Flourish */}
        <div className="text-center z-10 font-serif mt-6">
          <p className="text-xs uppercase tracking-[0.45em] text-[#d9bd73] font-extrabold mb-1.5">
            {t("VEDIC ASTROLOGY STUDIES", language)}
          </p>
          <div className="flex items-center justify-center gap-1.5">
            <div className="w-10 h-[1px] bg-gradient-to-r from-transparent to-[#d9bd73]" />
            <span className="text-[#d9bd73] text-xs">✦</span>
            <div className="w-10 h-[1px] bg-gradient-to-l from-transparent to-[#d9bd73]" />
          </div>
        </div>

        {/* Big Premium Luxury Title */}
        <div className="text-center z-10 font-serif my-auto">
          <p className="text-[#fff4cf]/72 text-[11px] uppercase tracking-[0.32em] mb-3 font-semibold">
            {t("Premium Vedic Birth Analysis", language)}
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-[0.08em] text-transparent bg-clip-text bg-gradient-to-r from-[#fffaf0] via-[#f1d78a] to-[#c7a65a] drop-shadow-lg mb-4 leading-[0.95]">
            {t(reportType, language).toUpperCase()}
          </h1>
          <div className="h-[2px] w-28 bg-gradient-to-r from-transparent via-[#d9bd73] to-transparent mx-auto mb-4" />
          <p className="text-xs italic tracking-[0.16em] text-[#fffaf0]/90 max-w-[430px] mx-auto leading-relaxed">
            {t("\"A Complete Mathematical Journey Through Your Sacred Cosmic Alignment\"", language)}
          </p>

          {/* OM sacred seal */}
          <div className="relative inline-flex items-center justify-center mt-6 w-24 h-24 rounded-full border-2 border-[#d9bd73] bg-[#0b203a]/90 shadow-[0_18px_50px_rgba(0,0,0,0.45)]">
            <div className="absolute inset-1 rounded-full border border-dashed border-[#d9bd73]/60" />
            <div className="absolute inset-3 rounded-full bg-[#d9bd73]/8" />
            <span className="text-[2.4rem] text-[#d9bd73] font-bold select-none" style={{lineHeight:1, display:'block', transform:'translateY(-5px)'}}>ॐ</span>
          </div>
        </div>

        {/* Traditional Sanskrit Shloka Box (Luxury Ornate Decal) */}
        <div className="z-10 w-full max-w-[520px] border-2 border-double border-[#d9bd73]/85 bg-[#091b33]/92 p-4 rounded-xl text-center font-serif shadow-2xl">
          <p className="text-[#f1d78a] text-[13px] font-bold italic tracking-wider mb-2 leading-relaxed">
            {t("Janani Janma Soukhyaanaam, Vardhani Kula Sampadaam |", language)}<br/>
            {t("Padavee Poorva Punyaanaam, Likhyate Janma Patrikaa ||", language)}
          </p>
          <div className="h-[1px] w-16 bg-gradient-to-r from-transparent via-[#d9bd73]/55 to-transparent mx-auto my-1.5" />
          <p className="text-[10px] text-[#fffaf0]/78 leading-relaxed max-w-[440px] mx-auto">
            {t("\"For the welfare and happiness of the child, for the growth of lineage and wealth, and to trace the merits of past lives, this sacred horoscope is written.\"", language)}
          </p>
        </div>

        {/* User Specific Details (Luxury Parchment-style Grid) */}
        <div className="z-10 w-full max-w-[520px] mt-6 bg-[#fffaf0]/[0.075] border-2 border-[#d9bd73]/85 rounded-xl p-5 font-serif shadow-2xl relative backdrop-blur-sm">
          <div className="absolute top-2 left-2 text-[#d9bd73]/45 text-[10px]">✦</div>
          <div className="absolute top-2 right-2 text-[#d9bd73]/45 text-[10px]">✦</div>
          <h3 className="text-center text-[#f1d78a] font-extrabold text-sm tracking-[0.25em] uppercase mb-4 pb-2 border-b-2 border-[#d9bd73]/25">
            {t("SACRED BIRTH BLUEPRINT", language)}
          </h3>
          <div className="grid grid-cols-2 gap-y-3 gap-x-6 text-[13px]">
            <div className="flex justify-between border-b border-[#b59449]/20 pb-1">
              <span className="text-[#fdfbf7]/60">{t("Name", language)}:</span>
              <span className="font-bold text-[#fdfbf7]">{name}</span>
            </div>
            <div className="flex justify-between border-b border-[#b59449]/20 pb-1">
              <span className="text-[#fdfbf7]/60">{t("Lagna", language)}:</span>
              <span className="font-bold text-[#b59449]">{t(lagna, language)}</span>
            </div>
            <div className="flex justify-between border-b border-[#b59449]/20 pb-1">
              <span className="text-[#fdfbf7]/60">{t("Date of Birth", language)}:</span>
              <span className="font-bold text-[#fdfbf7]">{dob}</span>
            </div>
            <div className="flex justify-between border-b border-[#b59449]/20 pb-1">
              <span className="text-[#fdfbf7]/60">{t("Rashi", language)}:</span>
              <span className="font-bold text-[#b59449]">{t(rashi, language)}</span>
            </div>
            <div className="flex justify-between border-b border-[#b59449]/20 pb-1">
              <span className="text-[#fdfbf7]/60">{t("Time of Birth", language)}:</span>
              <span className="font-bold text-[#fdfbf7]">{tob}</span>
            </div>
            <div className="flex justify-between border-b border-[#b59449]/20 pb-1">
              <span className="text-[#fdfbf7]/60">{t("Nakshatra", language)}:</span>
              <span className="font-bold text-[#b59449]">{t(nakshatra, language)}</span>
            </div>
          </div>
          <div className="text-center text-xs text-[#fdfbf7]/80 mt-4 border-t border-[#b59449]/20 pt-2.5">
            <span>{t("Place of Birth", language)}: <strong>{city}</strong></span>
          </div>
        </div>
      </div>
    </ReportPage>
  );
};

// ─── 3. Section Divider with Stronger Ornaments ───
interface SectionDividerProps {
  title: string;
  subtitle: string;
  language?: "en" | "kn";
}

export const SectionDivider: React.FC<SectionDividerProps> = ({ title, subtitle, language = "en" }) => {
  return (
    <div className="w-full text-center py-6 font-serif">
      <div className="flex items-center justify-center gap-3 mb-2">
        <div className="h-[2px] w-24 bg-gradient-to-r from-transparent via-[#d7b96a] to-[#7b2d36]" />
        <span className="text-xl text-[#9a6a24] select-none">✦</span>
        <div className="h-[2px] w-24 bg-gradient-to-l from-transparent via-[#d7b96a] to-[#7b2d36]" />
      </div>
      <h2 className="text-[28px] font-extrabold tracking-[0.045em] text-[#1b2d45] mb-2 leading-tight">
        {t(title, language)}
      </h2>
      <p className="text-[13px] italic text-[#6e5b4c] max-w-[560px] mx-auto leading-relaxed">
        {t(subtitle, language)}
      </p>
      <div className="flex items-center justify-center gap-1.5 mt-3">
        <div className="w-2 h-2 rounded-full bg-[#d7b96a] border border-[#7b2d36]/20" />
        <div className="w-7 h-[2px] bg-[#7b2d36]" />
        <div className="w-2 h-2 rounded-full bg-[#d7b96a] border border-[#7b2d36]/20" />
      </div>
    </div>
  );
};

// ─── 4. Prediction Card (Increased Body Text Size) ───
interface PredictionCardProps {
  title: string;
  content: string;
  strengths?: string;
  challenges?: string;
  language?: "en" | "kn";
}

export const PredictionCard: React.FC<PredictionCardProps> = ({
  title,
  content,
  strengths,
  challenges,
  language = "en",
}) => {
  return (
    <div className="border border-[#d7b96a]/45 bg-gradient-to-br from-[#fffdf7] via-[#fff8ec] to-[#f7ecd9] rounded-[10px] p-5 my-4 font-serif shadow-[0_10px_28px_rgba(93,63,28,0.09)] transition hover:border-[#c7a65a]/70 relative overflow-hidden">
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-[#7b2d36] via-[#d7b96a] to-[#1b2d45]" />
      <h3 className="text-[16px] font-extrabold text-[#1b2d45] border-b border-[#d7b96a]/35 pb-2 mb-3.5 flex items-center gap-2 tracking-[0.01em]">
        <span className="text-[#9a6a24]">✦</span> {t(title, language)}
      </h3>
      {/* Body text polished to 13.5px for A4 readability (smaller for Indic languages) */}
      <p className={cn(
        "text-justify leading-[1.78] text-[#2f3744] mb-4",
        language && ["ml", "ta", "te", "kn", "hi", "mr", "bn", "or", "gu", "si"].includes(language) ? "text-[11.5px]" : "text-[13.5px]"
      )}>
        {t(content, language)}
      </p>
      {(strengths || challenges) && (
        <div className="grid grid-cols-2 gap-4 mt-3 pt-3.5 border-t border-[#b59449]/15 text-xs">
          {strengths && (
            <div className="bg-[#eef8f0] p-3 rounded-[9px] border border-[#bcd9c2] flex flex-col">
              <span className="font-bold text-[#27533a] block mb-1">{t("✓ Inherent Strengths:", language)}</span>
              <span className={cn("text-[#45515f] leading-relaxed flex-1", language && ["ml", "ta", "te", "kn", "hi", "mr", "bn", "or", "gu", "si"].includes(language) ? "text-[9.5px]" : "text-[11px]")}>{t(strengths, language)}</span>
            </div>
          )}
          {challenges && (
            <div className="bg-[#fff1ed] p-3 rounded-[9px] border border-[#e5c1b7] flex flex-col">
              <span className="font-bold text-[#7b2d36] block mb-1">{t("✗ Vulnerabilities:", language)}</span>
              <span className={cn("text-[#45515f] leading-relaxed flex-1", language && ["ml", "ta", "te", "kn", "hi", "mr", "bn", "or", "gu", "si"].includes(language) ? "text-[9.5px]" : "text-[11px]")}>{t(challenges, language)}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── 5. Remedy Box (More Luxury Accents) ───
interface RemedyBoxProps {
  remedyType: string;
  description: string;
  mantra?: string;
  language?: "en" | "kn";
}

export const RemedyBox: React.FC<RemedyBoxProps> = ({
  remedyType,
  description,
  mantra,
  language = "en",
}) => {
  return (
    <div className="border border-[#d7b96a]/60 bg-gradient-to-br from-[#fffdf7] to-[#f5ead4] rounded-[10px] p-5 my-4 font-serif relative shadow-[0_10px_30px_rgba(93,63,28,0.1)]">
      <div className="absolute -top-3.5 left-5 bg-[#1b2d45] px-3.5 py-0.5 text-xs font-extrabold text-[#fffaf0] tracking-widest uppercase border border-[#d7b96a] rounded-full shadow-sm">
        🕉 {t(remedyType, language)}
      </div>
      <p className="text-[13.5px] leading-[1.75] text-[#2f3744] mt-2">
        {t(description, language)}
      </p>
      {mantra && (
        <div className="mt-4 bg-[#1b2d45]/[0.06] border border-[#1b2d45]/15 p-3.5 rounded-[9px] text-center">
          <span className="text-[10px] uppercase tracking-widest font-extrabold text-[#7b2d36]/70 block mb-1.5">
            {t("Sacred Sloka / Mantra", language)}
          </span>
          <p className="text-sm font-extrabold italic text-[#1b2d45] leading-relaxed">
            "{t(mantra, language)}"
          </p>
        </div>
      )}
    </div>
  );
};

// ─── 6. Dasha Timeline ───
export interface DashaPeriod {
  planet: string;
  start: string;
  end: string;
  active: boolean;
}

interface DashaTimelineProps {
  periods: DashaPeriod[];
  language?: "en" | "kn";
}

export const DashaTimeline: React.FC<DashaTimelineProps> = ({ periods, language = "en" }) => {
  return (
    <div className="relative border-l-2 border-[#b59449]/40 pl-6 ml-4 my-5 space-y-4 font-serif">
      {periods.map((p, idx) => (
        <div key={p.planet + idx} className="relative">
          {/* Ornate Dot */}
          <div
            className={cn(
              "absolute -left-[32px] top-1 w-3.5 h-3.5 rounded-full border-2 shadow-sm",
              p.active
                ? "bg-[#722f37] border-[#b59449] scale-125 animate-pulse"
                : "bg-white border-[#b59449]"
            )}
          />
          <div className="flex justify-between items-center text-[13px]">
            <div>
              <span
                className={cn(
                  "font-extrabold",
                  p.active ? "text-[#722f37] underline underline-offset-4 decoration-2 decoration-[#b59449]" : "text-foreground"
                )}
              >
                {t(p.planet, language)} {t("Mahadasha", language)} {p.active && `(${t("(Active)", language)})`}
              </span>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {t("Lifetime astrological coordinate transit", language)}
              </p>
            </div>
            <div className="text-right text-xs">
              <span className="font-bold bg-[#b59449]/10 px-2 py-0.5 rounded border border-[#b59449]/20 text-[#722f37]">{p.start}</span>
              <span className="mx-1.5 text-muted-foreground font-semibold">{t("to", language)}</span>
              <span className="font-bold bg-[#b59449]/10 px-2 py-0.5 rounded border border-[#b59449]/20 text-[#722f37]">{p.end}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// ─── 7. Planet coordinates Table ───
export interface PlanetRow {
  name: string;
  longitude: string;
  rasi: string;
  nakshatra: string;
  pada: number;
}

interface PlanetTableProps {
  rows: PlanetRow[];
  language?: "en" | "kn";
}

export const PlanetTable: React.FC<PlanetTableProps> = ({ rows, language = "en" }) => {
  return (
    <div className="w-full my-5 border-2 border-[#b59449]/40 rounded-xl overflow-hidden shadow-md font-serif">
      <table className="w-full text-xs sm:text-sm text-left border-collapse bg-white">
        <thead>
          <tr className="bg-[#722f37] text-white">
            <th className="px-4 py-3 font-extrabold uppercase tracking-wider text-[11px]">{t("Planet", language)}</th>
            <th className="px-4 py-3 font-extrabold uppercase tracking-wider text-[11px]">{t("Longitude", language)}</th>
            <th className="px-4 py-3 font-extrabold uppercase tracking-wider text-[11px]">{t("Rashi Sign", language)}</th>
            <th className="px-4 py-3 font-extrabold uppercase tracking-wider text-[11px]">{t("Nakshatra Star", language)}</th>
            <th className="px-4 py-3 font-extrabold uppercase tracking-wider text-[11px] text-center">{t("Pada", language)}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#b59449]/20 text-[13px]">
          {rows.map((row, idx) => (
            <tr
              key={row.name + idx}
              className={idx % 2 === 0 ? "bg-white" : "bg-[#fdfbf7]"}
            >
              <td className="px-4 py-2 font-extrabold text-[#722f37]">{t(row.name, language)}</td>
              <td className="px-4 py-2 text-muted-foreground font-medium">{row.longitude}</td>
              <td className="px-4 py-2 text-foreground font-bold">{t(row.rasi, language)}</td>
              <td className="px-4 py-2 text-[#b59449] font-extrabold">{t(row.nakshatra, language)}</td>
              <td className="px-4 py-2 text-center font-extrabold text-[#722f37]">{row.pada}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ─── 8. Forecast 12-Month Section ───
export interface MonthForecast {
  monthName?: string;
  theme?: string;
  prediction: string;
  guidance?: string;
  caution?: string;
  bestAction?: string;
  month?: string;
}

interface ForecastSectionProps {
  forecasts: MonthForecast[];
  language?: "en" | "kn";
}

export const ForecastSection: React.FC<ForecastSectionProps> = ({ forecasts, language = "en" }) => {
  return (
    <div className="grid grid-cols-2 gap-3 my-1.5 font-serif">
      {forecasts.map((f, idx) => {
        const monthTitle = f.monthName || f.month || `Month ${idx + 1}`;
        return (
          <div
            key={monthTitle + idx}
            className="border-2 border-[#b59449]/20 bg-[#fffefd] p-3 rounded-xl flex flex-col justify-between shadow-sm transition hover:border-[#b59449]/40 text-left text-xs"
          >
            {/* Card Header: Month Name and Life Theme */}
            <div className="pb-1.5 border-b border-[#b59449]/15 mb-1.5">
              <div className="flex justify-between items-center mb-0.5">
                <span className="text-[12px] font-extrabold text-[#722f37] uppercase tracking-wide">
                  {t(monthTitle, language)}
                </span>
                <span className="text-[9px] text-[#b59449] font-extrabold bg-[#b59449]/10 px-1.5 py-0.5 rounded">{t("★ Transit", language)}</span>
              </div>
              {f.theme && (
                <div className="text-[11px] font-bold text-[#b59449] tracking-wide">
                  {t("Theme", language)}: {t(f.theme, language)}
                </div>
              )}
            </div>
            
            {/* Prediction */}
            <p className="text-[11px] leading-relaxed text-[#333333] text-justify flex-1 mb-2 font-medium">
              {t(f.prediction, language)}
            </p>
            
            {/* Guidance, Caution, and Best Action in clean micro-sections */}
            {(f.guidance || f.caution || f.bestAction) && (
              <div className="space-y-1 pt-1.5 border-t border-[#b59449]/10 text-[9.5px] leading-tight">
                {f.guidance && (
                  <div>
                    <span className="font-extrabold text-green-700">{t("✓ Guidance:", language)}</span>{" "}
                    <span className="text-[#4b5563]">{t(f.guidance, language)}</span>
                  </div>
                )}
                {f.caution && (
                  <div>
                    <span className="font-extrabold text-red-700">{t("✗ Caution:", language)}</span>{" "}
                    <span className="text-[#4b5563]">{t(f.caution, language)}</span>
                  </div>
                )}
                {f.bestAction && (
                  <div>
                    <span className="font-extrabold text-[#722f37]">{t("★ Best Action:", language)}</span>{" "}
                    <span className="text-[#4b5563]">{t(f.bestAction, language)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
