import React, { useState } from "react";
import { format } from "date-fns";
import { Layout } from "@/components/layout/Layout";
import { SeoHead } from "@/components/shared/SeoHead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Moon, Calendar, Sparkles, Compass, AlertCircle, RefreshCw, Info, CheckCircle2 } from "lucide-react";

// Known reference New Moon (UTC)
const REFERENCE_NEW_MOON = new Date(Date.UTC(2024, 0, 11, 11, 57));
const SYNODIC_MONTH_DAYS = 29.530588853;

interface TithiDetail {
  name: string;
  sanskrit: string;
  deity: string;
  nature: string;
  suitability: string;
  avoid: string;
  summary: string;
}

const TITHIS: Record<number, TithiDetail> = {
  1: {
    name: "Prathama (1st Day)",
    sanskrit: "प्रतिपदा",
    deity: "Agni (Lord of Fire)",
    nature: "Neutral / Shukla Paksha",
    suitability: "Planning, organizing, spiritual fire offerings (havan), planting seeds.",
    avoid: "Beginning long journeys, legal marriages.",
    summary: "As the first sliver of light emerges, it is the time of new ideas. Meditate on pure fire and formulate clear intentions for the upcoming cycle."
  },
  2: {
    name: "Dwitiya (2nd Day)",
    sanskrit: "द्वितीया",
    deity: "Brahma (Lord of Creation)",
    nature: "Highly Auspicious (Shubha)",
    suitability: "Laying foundations, architectural projects, weddings, purchasing assets, travel.",
    avoid: "Fasting, physical conflicts.",
    summary: "Brahma's creative energy flows abundantly. Ideal for physical implementation, initiating structures, and beginning auspicious enterprises."
  },
  3: {
    name: "Tritiya (3rd Day)",
    sanskrit: "तृतीया",
    deity: "Gauri (Divine Mother / Shakti)",
    nature: "Extremely Auspicious (Shubha)",
    suitability: "Artistic learning, music, naming ceremonies, styling hair/grooming, home improvements.",
    avoid: "Cutting trees, severe acts.",
    summary: "Governed by Goddess Gauri, this day represents divine grace, nourishment, and abundance. An exceptionally auspicious day for starting beauty, art, or family activities."
  },
  4: {
    name: "Chaturthi (4th Day)",
    sanskrit: "चतुर्थी",
    deity: "Ganesha (Obstacle Remover)",
    nature: "Challenging (Rikta - Empty)",
    suitability: "Overcoming hurdles, clearing clutter, legal resolutions, Ganapati prayers, internal purification.",
    avoid: "Financial loans, beginning major happy travels, starting long-term construction.",
    summary: "A Rikta (empty) day meant for inward work. Pray to Lord Ganesha to eliminate obstacles and focus on removing spiritual and emotional baggage."
  },
  5: {
    name: "Panchami (5th Day)",
    sanskrit: "पञ्चमी",
    deity: "Naagas (Divine Serpents / Wisdom)",
    nature: "Highly Auspicious (Shubha)",
    suitability: "Medicine preparation, healing practices, educational learning, starting new books, spiritual initiations.",
    avoid: "Lending money, physical arguments.",
    summary: "Naagas govern primal wisdom and healing. Today's energy is highly stable, making it one of the absolute best days to start therapies, studies, or spiritual training."
  },
  6: {
    name: "Shashti (6th Day)",
    sanskrit: "षष्ठी",
    deity: "Kartikeya (Lord of Strength & Courage)",
    nature: "Auspicious (Yasho-Prada - Success)",
    suitability: "Physical training, building endurance, strategic defense, starting minor projects, meeting friends.",
    avoid: "Long travels, surgery if avoidable.",
    summary: "Governed by the celestial commander Kartikeya. This day channels focus, courage, and vitality. Use this time to assert boundaries and execute physically demanding tasks."
  },
  7: {
    name: "Saptami (7th Day)",
    sanskrit: "सप्तमी",
    deity: "Surya (The Sun God)",
    nature: "Highly Auspicious (Shubha)",
    suitability: "Meeting authoritative figures, government work, purchasing vehicles, traveling, entering a new house.",
    avoid: "Acts of dishonesty, dark rooms.",
    summary: "The radiant force of Surya brings clarity and luck. Best for outward expression, taking charge in career, and starting positive social events."
  },
  8: {
    name: "Ashtami (8th Day)",
    sanskrit: "अष्टमी",
    deity: "Durga / Rudra (Protectors)",
    nature: "Neutral / Half Moon Balance",
    suitability: "Durga Puja, mental centering, writing journals, starting research, artistic hobbies.",
    avoid: "Meat consumption, large financial investments, major domestic changes.",
    summary: "The exact quarter moon, representing equal light and dark. It is a day of balance and power. Pray to Goddess Durga for inner strength, courage, and balance of emotions."
  },
  9: {
    name: "Navami (9th Day)",
    sanskrit: "नवमी",
    deity: "Durga (Destroyer of Negative Forces)",
    nature: "Challenging (Rikta - Empty)",
    suitability: "Confronting fears, competitive challenges, physical work, victory over bad habits.",
    avoid: "Starting auspicious travels, entering a new home, marriage.",
    summary: "Another Rikta Tithi meant for battle and inner purging. Excellent for breaking bad habits, tackling major difficult challenges, and cleansing exercises."
  },
  10: {
    name: "Dashami (10th Day)",
    sanskrit: "दशमी",
    deity: "Yamaraja (Lord of Dharma & Duty)",
    nature: "Extremely Auspicious (Shubha)",
    suitability: "Starting new businesses, corporate contracts, buying gold, major travel, long-term investments.",
    avoid: "Legal lawsuits, severe punishments.",
    summary: "Governed by the Lord of Dharma, this day guarantees steady success and righteous outcomes. Highly recommended for any constructive business or lifestyle changes."
  },
  11: {
    name: "Ekadashi (11th Day)",
    sanskrit: "एकादशी",
    deity: "Kubera / Vishnu (Abundance & Preservation)",
    nature: "Highly Auspicious & Sacred",
    suitability: "Fasting, meditation, Vishnu prayers, silent retreats, spiritual study, charity.",
    avoid: "Eating grains (especially rice), major material indulgences, cutting hair.",
    summary: "The most sacred spiritual day of the lunar month. Fasting on Ekadashi purifies the physical body and cleanses negative karmas, leading to deep spiritual growth."
  },
  12: {
    name: "Dwadashi (12th Day)",
    sanskrit: "द्वादशी",
    deity: "Vishnu (Lord of Preservation)",
    nature: "Auspicious (Shubha)",
    suitability: "Breaking fasts with satvik food, charity, planting trees, home entry, general happy tasks.",
    avoid: "Starting oil massages, travel to dark forests.",
    summary: "Following the spiritual intensity of Ekadashi, Dwadashi brings peace, grounding, and preservation. Focus on charitable acts and steady preservation of life."
  },
  13: {
    name: "Trayodashi (13th Day)",
    sanskrit: "त्रयोदशी",
    deity: "Kamadeva (Love) & Shiva (Pradosham)",
    nature: "Highly Auspicious (Shubha)",
    suitability: "Pradosham Shiva worship, friendships, wearing new elegant clothes, romantic commitments.",
    avoid: "Entering disputes, starting wars.",
    summary: "Governed by Shiva and Kamadeva. The evening of Trayodashi (Pradosham) is highly sacred; Shiva worship during this window dissolves heavy negative karmas."
  },
  14: {
    name: "Chaturdashi (14th Day)",
    sanskrit: "चतुर्दशी",
    deity: "Shiva / Rudra (Transforming Force)",
    nature: "Intense / Challenging (Rikta)",
    suitability: "Shiva worship, mantra japa, intense spiritual cleansing, resting, avoiding high activity.",
    avoid: "Auspicious marriages, starting new homes, long journeys.",
    summary: "The dark/glowing energy reaches its peak tension just before New/Full Moon. Reserved strictly for spiritual, quiet meditation and resting. Avoid major material launches."
  },
  15: {
    name: "Purnima (15th Day - Full Moon)",
    sanskrit: "पूर्णिमा",
    deity: "Chandra / Vishnu (Full Light)",
    nature: "Extremely Auspicious & High Energy",
    suitability: "Satyanarayan Vrat, full moon group meditation, outdoor walks, emotional healing, expansion of projects.",
    avoid: "Surgical operations (due to high blood flow), major anger, heavy conflicts.",
    summary: "The apex of lunar energy! Purnima illuminates the subconscious mind. Perfect for expansion of projects, group meditations, prayers, and expressing pure gratitude."
  },
  16: {
    name: "Krishna Prathama (16th Day)",
    sanskrit: "प्रतिपदा",
    deity: "Agni (Lord of Fire)",
    nature: "Neutral / Krishna Paksha",
    suitability: "Quiet planning, introspective readings, starting minor tasks, home decluttering.",
    avoid: "Beginning major public launches, heavy emotional debates.",
    summary: "As the waning phase begins, Chandra starts pulling back. It is time to harvest the ideas of the full moon and bring them into quiet reflection."
  },
  17: {
    name: "Krishna Dwitiya (17th Day)",
    sanskrit: "द्वितीया",
    deity: "Brahma (Lord of Creation)",
    nature: "Auspicious (Krishna Paksha)",
    suitability: "Maintenance of assets, structural studies, research, mild travel.",
    avoid: "Intense physical fights.",
    summary: "Stable waning energy. Good for evaluating and preserving what you have recently built, and maintaining healthy daily routines."
  },
  18: {
    name: "Krishna Tritiya (18th Day)",
    sanskrit: "तृतीया",
    deity: "Gauri (Preservation of Grace)",
    nature: "Auspicious",
    suitability: "Art appreciation, internal yoga, quiet learning, standard home maintenance.",
    avoid: "Aggressive behavior, heavy manual cutting.",
    summary: "Gauri's blessing encourages internal peace and gratitude. Ideal for personal hobbies, gentle self-care, and spending quiet moments with family."
  },
  19: {
    name: "Krishna Chaturthi (19th Day)",
    sanskrit: "चतुर्थी",
    deity: "Ganesha (Sankashti Chaturthi)",
    nature: "Challenging / Introspective",
    suitability: "Breaking bad habits, Ganesh prayers, quiet reflection, detox diets, decluttering files.",
    avoid: "Major business deals, marriages, starting journeys.",
    summary: "Known as Sankashti Chaturthi in the waning phase. Best used for spiritual detoxing, removing obstacles from the mind, and cleaning the home environment."
  },
  20: {
    name: "Krishna Panchami (20th Day)",
    sanskrit: "पञ्चमी",
    deity: "Naagas (Deep Knowledge)",
    nature: "Highly Auspicious",
    suitability: "Medical therapies, study of spiritual scriptures, minor business deals, research.",
    avoid: "Arguing with elders, intense social parties.",
    summary: "Highly stabilizing waning day. Excellent for deep studies, logical analysis, medical consultations, and focusing on sound health practices."
  },
  21: {
    name: "Krishna Shashti (21st Day)",
    sanskrit: "षष्ठी",
    deity: "Kartikeya (Courage)",
    nature: "Neutral",
    suitability: "Physical discipline, internal resolve, spiritual cleansing, resolving past debts.",
    avoid: "Auspicious starting of travel.",
    summary: "Kartikeya's discipline assists in cleaning up debts, resolving old pending bills, and building physical and mental fortitude."
  },
  22: {
    name: "Krishna Saptami (22nd Day)",
    sanskrit: "सप्तमी",
    deity: "Surya (Sun God)",
    nature: "Auspicious",
    suitability: "Completing existing work, quiet travel, meeting friends, personal growth.",
    avoid: "Complex financial loans.",
    summary: "Surya brings warm light even in the waning phase. Good for wrapping up old tasks and checking on the progress of team duties."
  },
  23: {
    name: "Krishna Ashtami (23rd Day)",
    sanskrit: "अष्टमी",
    deity: "Durga / Rudra (Waning Half Moon)",
    nature: "Neutral / Deep Meditation",
    suitability: "Durga mantra japa, quiet self-reflection, emotional grounding, healing.",
    avoid: "Starting new partnerships, commercial expansion.",
    summary: "The waning quarter moon representing the turn towards the deep inner dark. A prime day for silent meditation, letting go of expectations, and Durga prayers."
  },
  24: {
    name: "Krishna Navami (24th Day)",
    sanskrit: "नवमी",
    deity: "Durga (Eradicator of Ignorance)",
    nature: "Challenging / rikta",
    suitability: "Internal weeding, competitive research, physical workouts, minor cleansing.",
    avoid: "Auspicious starting of trips, entering homes, signing long-term deals.",
    summary: "Rikta Tithi in waning phase. Highly recommended for physical purging, clearing email inboxes, decluttering active workspace, and letting go of old projects."
  },
  25: {
    name: "Krishna Dashami (25th Day)",
    sanskrit: "दशमी",
    deity: "Yamaraja (Moral Duty)",
    nature: "Auspicious",
    suitability: "Wrapping up old contracts, organizing archives, studying ethics/history, paying taxes.",
    avoid: "Beginning massive expansion campaigns.",
    summary: "Dharma energy rules today. Perfect for auditing your lifestyle, organizing historical data, archiving completed work, and discharging ethical duties."
  },
  26: {
    name: "Krishna Ekadashi (26th Day)",
    sanskrit: "एकादशी",
    deity: "Kubera / Vishnu (Yogini Ekadashi)",
    nature: "Highly Auspicious & Spiritually Intense",
    suitability: "Fasting, reading Bhagavad Gita, silent meditation, offering charity, resting.",
    avoid: "Grains, commercial trading, cutting trees.",
    summary: "Waning Ekadashi represents a deep spiritual purification. Fasting and praying today clears the mind of heavy emotional thoughts and elevates consciousness."
  },
  27: {
    name: "Krishna Dwadashi (27th Day)",
    sanskrit: "द्वादशी",
    deity: "Vishnu (Preserver)",
    nature: "Auspicious",
    suitability: "Breaking fasts with fruits, organic gardening, offering charity, quiet reading.",
    avoid: "Beginning travels to faraway islands.",
    summary: "A peaceful day after the rigorous Ekadashi fast. Focus on grounding yourself, consuming pure satvik foods, and practicing gentle charity."
  },
  28: {
    name: "Krishna Trayodashi (28th Day)",
    sanskrit: "त्रयोदशी",
    deity: "Shiva (Pradosham Waning)",
    nature: "Sacred / Calm",
    suitability: "Shiva Pradosham prayers, mantra chanting, resolving conflicts, quiet reading.",
    avoid: "Auspicious launches, weddings.",
    summary: "The waning Pradosham evening is exceptionally powerful for spiritual practice. Offering simple milk/water to Shiva cleanses deep emotional distress."
  },
  29: {
    name: "Krishna Chaturdashi (29th Day)",
    sanskrit: "चतुर्दशी",
    deity: "Shiva / Kali (The Great Dissolution)",
    nature: "Highly Challenging / Rikta",
    suitability: "Deep silent meditation, Shivaratri prayers, resting, fasting, cleansing bad dreams.",
    avoid: "Almost all material endeavors, marriages, starting houses, high investments.",
    summary: "The day of near-total darkness just before Amavasya. Energy is highly quiet and internal. Dedicate this day solely to quiet restoration, sleep, and Shiva mantra."
  },
  30: {
    name: "Amavasya (30th Day - New Moon)",
    sanskrit: "अमावस्या",
    deity: "Pitrus (Ancestors / Stillness)",
    nature: "Deep Spiritual Stillness",
    suitability: "Pitru Tarpan (ancestral offerings), charity, cleaning the house, deep silent meditation, resting.",
    avoid: "Beginning any new material ventures, purchasing luxury vehicles, signing happy marriages.",
    summary: "The absolute silence of the lunar cycle. Amavasya represents the void. Honour your ancestors through simple charity or offerings, and embrace total inner silence."
  }
};

export default function MoonCyclePage() {
  const [selectedTithi, setSelectedTithi] = useState<number>(15); // Default to Purnima

  // Calculator State
  const [calcDate, setCalcDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [calcTime, setCalcTime] = useState<string>("12:00");
  const [calcResult, setCalcResult] = useState<{
    age: number;
    illPct: number;
    tithiNum: number;
    paksha: string;
    details: TithiDetail;
  } | null>(null);

  // SVG Moon Path Calculation
  const getMoonPath = (tithi: number) => {
    let phase = 0;
    if (tithi <= 15) {
      phase = -1 + (tithi - 1) * (2 / 14);
    } else {
      phase = 1 - (tithi - 15) * (2 / 15);
    }

    const r = 50;
    const rx = Math.abs(phase) * r;
    const isWaxing = tithi <= 15;

    if (phase === -1) return ""; // New moon
    if (phase === 1) return `M 50,0 A 50,50 0 1,1 49.9,0 Z`; // Full moon

    if (isWaxing) {
      if (phase < 0) {
        // Waxing Crescent: light grows on right (cut right)
        return `M 50,0 A 50,50 0 0,1 50,100 A ${rx},50 0 0,0 50,0 Z`;
      } else {
        // Waxing Gibbous: light mostly full on right (bulge left)
        return `M 50,0 A 50,50 0 0,1 50,100 A ${rx},50 0 0,1 50,0 Z`;
      }
    } else {
      if (phase > 0) {
        // Waning Gibbous: light mostly full on left (bulge right)
        return `M 50,0 A 50,50 0 0,0 50,100 A ${rx},50 0 0,0 50,0 Z`;
      } else {
        // Waning Crescent: light thin sliver on left (cut left)
        return `M 50,0 A 50,50 0 0,0 50,100 A ${rx},50 0 0,1 50,0 Z`;
      }
    }
  };

  const handleCalculate = () => {
    if (!calcDate) return;
    const [year, month, day] = calcDate.split("-").map(Number);
    const [hour, minute] = calcTime.split(":").map(Number);

    // Create UTC date representation
    const targetUTC = new Date(Date.UTC(year, month - 1, day, hour, minute));

    // Calculate difference in milliseconds
    const diffMs = targetUTC.getTime() - REFERENCE_NEW_MOON.getTime();
    const diffDays = diffMs / 86400000;

    // Synodic Age (0 to 29.53059)
    const lunarAge = ((diffDays % SYNODIC_MONTH_DAYS) + SYNODIC_MONTH_DAYS) % SYNODIC_MONTH_DAYS;

    // Illumination %
    const illPct = Math.round((1 - Math.cos((lunarAge / SYNODIC_MONTH_DAYS) * 2 * Math.PI)) * 50);

    // Tithi Number (1 to 30)
    const tithiNum = Math.min(30, Math.max(1, Math.floor((lunarAge / SYNODIC_MONTH_DAYS) * 30) + 1));
    const paksha = tithiNum <= 15 ? "Shukla Paksha (Waxing)" : "Krishna Paksha (Waning)";

    setCalcResult({
      age: lunarAge,
      illPct,
      tithiNum,
      paksha,
      details: TITHIS[tithiNum]
    });
  };

  const currentTithiInfo = TITHIS[selectedTithi];

  return (
    <Layout>
      <SeoHead
        title="Vedic Moon Cycle | Chandra Tithi Phases"
        description="Track the Vedic lunar calendar, view illuminated moon phases, and calculate the tithi (moon age) for any date with spiritual guides."
      />

      <div className="min-h-screen bg-[#fcfaf5] text-[#3d2b1f] pt-24 pb-20 font-sans">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-sm font-bold tracking-[0.3em] uppercase text-[#c05621] mb-2 flex items-center justify-center gap-2">
              <Moon className="h-4 w-4" /> VEDIC MOON CYCLE
            </h1>
            <h2 className="text-3xl font-display font-bold text-[#4a3424] mb-4">चन्द्र तिथि चक्र</h2>
            <p className="text-sm text-[#8c7a6b] max-w-2xl mx-auto">
              Chandra (the Moon) rules the Mind, Emotions, and Prana. Follow the 30 Vedic Tithis of Shukla Paksha (Waxing) and Krishna Paksha (Waning) to align your daily life with the natural tides of cosmos.
            </p>
          </div>

          {/* SECTION 1: INTERACTIVE VISUALIZER */}
          <div className="grid lg:grid-cols-[400px_1fr] gap-8 items-start mb-16">
            
            {/* Visualizer Widget */}
            <div className="bg-[#14121a] rounded-[2rem] p-8 text-white shadow-[0_25px_60px_rgba(20,18,26,0.22)] border border-[#c05621]/20 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,101,26,0.12),transparent_50%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(33,27,72,0.06),transparent_50%)]" />
              
              <div className="relative z-10 flex flex-col items-center">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#ff9c5a] mb-6">Interactive Moon Phase</p>
                
                {/* 3D Vector SVG Moon Render */}
                <div className="relative h-48 w-48 mb-8 flex items-center justify-center">
                  {/* Outer Glow */}
                  <div className="absolute inset-1 rounded-full bg-[#fef3c7]/5 blur-xl transition-all duration-500" />
                  
                  <svg viewBox="0 0 100 100" className="h-full w-full drop-shadow-[0_0_15px_rgba(254,243,199,0.15)]">
                    {/* Dark Background side */}
                    <circle cx="50" cy="50" r="50" fill="#2d2620" />
                    
                    {/* Crater details for dark side */}
                    <circle cx="28" cy="30" r="4" fill="#221c17" opacity="0.4" />
                    <circle cx="70" cy="40" r="6" fill="#221c17" opacity="0.4" />
                    <circle cx="48" cy="74" r="8" fill="#221c17" opacity="0.4" />

                    {/* Illuminated Path */}
                    <path d={getMoonPath(selectedTithi)} fill="#fef3c7" />

                    {/* Crater details for illuminated side */}
                    <g opacity="0.15">
                      <circle cx="28" cy="30" r="4" fill="#14121a" />
                      <circle cx="70" cy="40" r="6" fill="#14121a" />
                      <circle cx="48" cy="74" r="8" fill="#14121a" />
                      <circle cx="38" cy="52" r="3.5" fill="#14121a" />
                      <circle cx="62" cy="65" r="5" fill="#14121a" />
                    </g>
                  </svg>
                </div>

                {/* Day Selector Details */}
                <div className="text-center w-full bg-white/5 rounded-2xl p-4 border border-white/10 mb-6">
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#ff9c5a]">
                    {selectedTithi <= 15 ? "Shukla Paksha (Waxing)" : "Krishna Paksha (Waning)"}
                  </span>
                  <h3 className="text-2xl font-bold mt-1 text-[#fef3c7]">{currentTithiInfo.name}</h3>
                  <p className="text-xs text-white/50 font-serif italic mt-0.5">Sanskrit: {currentTithiInfo.sanskrit}</p>
                </div>

                {/* Day Slider Input */}
                <div className="w-full space-y-2">
                  <div className="flex justify-between text-[10px] font-bold text-white/45 uppercase tracking-wider">
                    <span>New Moon</span>
                    <span>Full (Day 15)</span>
                    <span>New (Day 30)</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    value={selectedTithi}
                    onChange={(e) => setSelectedTithi(Number(e.target.value))}
                    className="w-full h-2 rounded-lg bg-[#2d2620] appearance-none cursor-pointer accent-[#c05621] outline-none"
                  />
                  <div className="text-center text-xs font-bold text-white/60 pt-2">
                    Slide to change lunar day (Tithi Day {selectedTithi} / 30)
                  </div>
                </div>

              </div>
            </div>

            {/* Information Details Card */}
            <div className="bg-white border border-[#eae2ce] p-6 md:p-8 rounded-[2rem] shadow-sm space-y-6">
              
              <div className="flex flex-wrap items-center gap-3 justify-between border-b border-[#f5efde] pb-4">
                <div>
                  <h3 className="text-xl font-bold text-[#4a3424]">{currentTithiInfo.name}</h3>
                  <p className="text-xs font-semibold text-[#c05621] uppercase tracking-wider">Astrological Significance</p>
                </div>
                <div className="px-3 py-1 rounded-full bg-[#fbeee6] text-[#c05621] text-xs font-bold uppercase tracking-wider border border-[#f5d9cc]">
                  Deity: {currentTithiInfo.deity}
                </div>
              </div>

              {/* Grid detail pieces */}
              <div className="grid md:grid-cols-2 gap-5">
                <div className="bg-[#fcfaf5] p-4 rounded-xl border border-[#e5dec5] space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#c05621] flex items-center gap-1.5">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Best Activities (Do's)
                  </h4>
                  <p className="text-sm leading-relaxed text-[#4a3424]/90">{currentTithiInfo.suitability}</p>
                </div>

                <div className="bg-[#fff5f5] p-4 rounded-xl border border-[#ffd5d5] space-y-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-red-600 flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5" /> Avoid Initiating (Don'ts)
                  </h4>
                  <p className="text-sm leading-relaxed text-red-950/90">{currentTithiInfo.avoid}</p>
                </div>
              </div>

              {/* Ritual & Summary */}
              <div className="bg-[#f6f2eb] p-5 rounded-2xl border border-[#e8dfcf] space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-[#8c7a6b] flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-[#c05621]" /> Spiritual Practice & Ritual Guidance
                </h4>
                <p className="text-sm leading-relaxed text-[#4a3828]/85 font-serif italic">
                  "{currentTithiInfo.summary}"
                </p>
              </div>

              {/* Highlighting Major Days */}
              <div className="border-t border-[#f5efde] pt-5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#8c7a6b] mb-3">Major Lunar Pillars</h4>
                <div className="grid grid-cols-3 gap-3">
                  <button 
                    onClick={() => setSelectedTithi(30)}
                    className={`p-3 rounded-xl border text-center transition-all ${selectedTithi === 30 ? 'bg-[#14121a] text-white border-transparent' : 'bg-white border-[#eae2ce] text-[#4a3424] hover:bg-[#fcfaf5]'}`}
                  >
                    <p className="text-xs font-black uppercase tracking-wider">Amavasya</p>
                    <p className="text-[10px] opacity-60">New Moon (Day 30)</p>
                  </button>
                  <button 
                    onClick={() => setSelectedTithi(8)}
                    className={`p-3 rounded-xl border text-center transition-all ${selectedTithi === 8 ? 'bg-[#14121a] text-white border-transparent' : 'bg-white border-[#eae2ce] text-[#4a3424] hover:bg-[#fcfaf5]'}`}
                  >
                    <p className="text-xs font-black uppercase tracking-wider">Ashtami</p>
                    <p className="text-[10px] opacity-60">Half Moon (Day 8)</p>
                  </button>
                  <button 
                    onClick={() => setSelectedTithi(15)}
                    className={`p-3 rounded-xl border text-center transition-all ${selectedTithi === 15 ? 'bg-[#14121a] text-white border-transparent' : 'bg-white border-[#eae2ce] text-[#4a3424] hover:bg-[#fcfaf5]'}`}
                  >
                    <p className="text-xs font-black uppercase tracking-wider">Purnima</p>
                    <p className="text-[10px] opacity-60">Full Moon (Day 15)</p>
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* SECTION 2: MOON AGE CALCULATOR */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#faf6ee] border border-[#e5dfd2] rounded-[2.5rem] p-6 md:p-10 shadow-sm relative overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#c05621]/40 to-transparent" />
              
              <div className="relative z-10">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-display font-bold text-[#4a3424] mb-2">Vedic Tithi & Moon Age Detector</h3>
                  <p className="text-xs text-[#8c7a6b] max-w-lg mx-auto">
                    Input your birth date or any specific calendar date to calculate the exact astronomical Moon age, illumination %, Paksha, and custom Vedic Tithi advice!
                  </p>
                </div>

                {/* Form Input Rows */}
                <div className="grid md:grid-cols-[1.5fr_1fr_1fr] gap-4 items-end mb-6 bg-white p-4 rounded-2xl border border-[#eadeca]">
                  <div>
                    <label className="block text-[10px] font-bold text-[#8c7a6b] uppercase tracking-wider mb-1 flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Select Date
                    </label>
                    <Input
                      type="date"
                      value={calcDate}
                      onChange={(e) => setCalcDate(e.target.value)}
                      className="h-11 border-[#eae2ce] focus:border-[#c05621]"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-[#8c7a6b] uppercase tracking-wider mb-1">Time (24 Hr)</label>
                    <Input
                      type="time"
                      value={calcTime}
                      onChange={(e) => setCalcTime(e.target.value)}
                      className="h-11 border-[#eae2ce] focus:border-[#c05621]"
                    />
                  </div>
                  <Button 
                    onClick={handleCalculate}
                    className="h-11 rounded-lg bg-[#c05621] hover:bg-[#b04c10] text-white font-bold"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" /> Calculate Tithi
                  </Button>
                </div>

                {/* Calculator Results */}
                {calcResult && (
                  <div className="bg-white border border-[#eae2ce] rounded-3xl p-6 shadow-sm animate-in fade-in slide-in-from-bottom-3 duration-500">
                    <h4 className="text-xs font-bold text-[#c05621] uppercase tracking-widest mb-4 flex items-center gap-1">
                      <Compass className="h-4 w-4" /> Calculated Astrological Results
                    </h4>

                    <div className="grid md:grid-cols-3 gap-4 mb-6">
                      
                      {/* Metric 1 */}
                      <div className="border border-[#f2eadd] bg-[#fdfaf6] p-4 rounded-2xl text-center">
                        <p className="text-[10px] font-bold text-[#8c7a6b] uppercase tracking-wider">Estimated Moon Age</p>
                        <p className="text-2xl font-black text-[#4a3424] mt-1">{calcResult.age.toFixed(1)} Days</p>
                        <p className="text-[10px] text-[#8c7a6b] mt-0.5">Days since last New Moon</p>
                      </div>

                      {/* Metric 2 */}
                      <div className="border border-[#f2eadd] bg-[#fdfaf6] p-4 rounded-2xl text-center">
                        <p className="text-[10px] font-bold text-[#8c7a6b] uppercase tracking-wider">Illumination Level</p>
                        <p className="text-2xl font-black text-[#4a3424] mt-1">{calcResult.illPct}%</p>
                        <p className="text-[10px] text-[#8c7a6b] mt-0.5">Calculated surface light</p>
                      </div>

                      {/* Metric 3 */}
                      <div className="border border-[#f2eadd] bg-[#fdfaf6] p-4 rounded-2xl text-center">
                        <p className="text-[10px] font-bold text-[#8c7a6b] uppercase tracking-wider">Paksha Phase</p>
                        <p className="text-base font-bold text-[#c05621] mt-2">{calcResult.paksha}</p>
                        <p className="text-[10px] text-[#8c7a6b] mt-1">Growth progression direction</p>
                      </div>

                    </div>

                    {/* Vedic Tithi Summary card */}
                    <div className="bg-[#fdfbf7] border border-[#eadeca] rounded-2xl p-5">
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eadeca] pb-3 mb-3">
                        <div>
                          <p className="text-[10px] font-black text-[#c05621] uppercase tracking-widest">Active Vedic Tithi Day</p>
                          <h5 className="text-xl font-bold text-[#4a3424]">{calcResult.details.name}</h5>
                        </div>
                        <div className="px-3 py-1 rounded bg-[#f2eadd] border border-[#e6dfd5] text-xs font-semibold text-[#8c7a6b]">
                          Deity: {calcResult.details.deity}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <p className="text-sm text-[#4a3424] leading-relaxed">
                          <strong>Vedic Nature:</strong> {calcResult.details.nature}
                        </p>
                        <p className="text-sm text-[#4a3424] leading-relaxed">
                          <strong>Spiritual Practice:</strong> {calcResult.details.summary}
                        </p>
                        <div className="flex gap-4 pt-2">
                          <button
                            onClick={() => {
                              setSelectedTithi(calcResult.tithiNum);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="text-xs font-bold text-[#c05621] hover:text-[#9c4310] flex items-center gap-1"
                          >
                            <Info className="h-3.5 w-3.5" /> View full details on interactive slider above
                          </button>
                        </div>
                      </div>
                    </div>

                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      </div>
    </Layout>
  );
}
