import React, { useState, useMemo } from "react";
import AppShell from "./AppShell";
import { CalendarDays } from "lucide-react";
import { cn } from "../../lib/utils";
import { getTithiData } from "../../lib/panchang/astroEngine";

interface Festival {
  name: string;
  sanskrit?: string;
  date: string; // display string
  isoDate: string; // for sorting YYYY-MM-DD
  tithi: string;
  significance: string;
  observance: string;
  type: "major" | "ekadashi" | "puja" | "fast";
}

const FESTIVALS_2025_2026: Festival[] = [
  // 2025
  { name: "Maha Shivaratri",       sanskrit: "महाशिवरात्रि",   date: "26 Feb 2025", isoDate: "2025-02-26", tithi: "Krishna Chaturdashi, Phalguna",  type: "major",   significance: "The great night of Lord Shiva. One of the most sacred Hindu observances.", observance: "All-night vigil, fasting, abhishek of Shivalinga with milk, honey, and water." },
  { name: "Holi",                  sanskrit: "होली",            date: "14 Mar 2025", isoDate: "2025-03-14", tithi: "Purnima, Phalguna",              type: "major",   significance: "Festival of colors celebrating the triumph of devotion over evil. Holika Dahan the night before.", observance: "Holika Dahan on the 13th evening. Color celebration on the 14th." },
  { name: "Gudi Padwa / Ugadi",    sanskrit: "गुढीपाडवा",      date: "30 Mar 2025", isoDate: "2025-03-30", tithi: "Chaitra Shukla Pratipada",       type: "major",   significance: "Hindu New Year in Maharashtra and South India. Start of the Vikram Samvat.", observance: "Raise Gudi flag, eat neem-jaggery mix, new beginnings." },
  { name: "Rama Navami",           sanskrit: "रामनवमी",         date: "6 Apr 2025",  isoDate: "2025-04-06", tithi: "Chaitra Shukla Navami",          type: "major",   significance: "Birth anniversary of Lord Rama, the seventh avatar of Vishnu.", observance: "Temple visits, Ramayana recitation, fasting, Rama puja at noon." },
  { name: "Hanuman Jayanti",       sanskrit: "हनुमान जयंती",   date: "12 Apr 2025", isoDate: "2025-04-12", tithi: "Chaitra Purnima",                type: "puja",    significance: "Birth anniversary of Lord Hanuman, embodiment of devotion and strength.", observance: "Hanuman Chalisa recitation, sindoor offering, visiting temples." },
  { name: "Akshaya Tritiya",       sanskrit: "अक्षय तृतीया",   date: "30 Apr 2025", isoDate: "2025-04-30", tithi: "Vaishakha Shukla Tritiya",       type: "major",   significance: "Most auspicious day of the year — every action begun now is said to grow permanently.", observance: "Gold purchase, new ventures, charity, Vishnu puja." },
  { name: "Buddha Purnima",        date: "12 May 2025",         isoDate: "2025-05-12", tithi: "Vaishakha Purnima",                type: "major",   significance: "Birth, enlightenment, and Mahaparinirvana of Gautama Buddha.", observance: "Meditation, Dana (charity), visiting monasteries or temples." },
  { name: "Nirjala Ekadashi",      date: "6 Jun 2025",          isoDate: "2025-06-06", tithi: "Jyeshtha Shukla Ekadashi",         type: "ekadashi", significance: "Most powerful Ekadashi — waterless fast observed for full 24-hour period.", observance: "Complete fast without water from sunrise to next day sunrise. Vishnu puja." },
  { name: "Guru Purnima",          sanskrit: "गुरु पूर्णिमा", date: "10 Jul 2025",  isoDate: "2025-07-10", tithi: "Ashadha Purnima",                type: "major",   significance: "Day to honour the Guru — spiritual teacher. Vyasa Puja commemorates Veda Vyasa.", observance: "Offering gratitude to teachers, reading scriptures, Guru Vandana." },
  { name: "Nag Panchami",          date: "28 Jul 2025",         isoDate: "2025-07-28", tithi: "Shravana Shukla Panchami",         type: "puja",    significance: "Worship of the Naga serpent deities for protection from snakes and evil.", observance: "Offer milk at snake anthills, fast, visit Nag temples." },
  { name: "Raksha Bandhan",        sanskrit: "रक्षाबंधन",      date: "9 Aug 2025",  isoDate: "2025-08-09", tithi: "Shravana Purnima",               type: "major",   significance: "Bond of protection between brothers and sisters. Sisters tie rakhi on brother's wrist.", observance: "Rakhi tying, exchange of gifts, family meals." },
  { name: "Janmashtami",           sanskrit: "जन्माष्टमी",     date: "16 Aug 2025", isoDate: "2025-08-16", tithi: "Bhadrapada Krishna Ashtami",     type: "major",   significance: "Birth of Lord Krishna, eighth avatar of Vishnu, at midnight in Mathura.", observance: "Fast until midnight, Dahi Handi celebrations, Krishna bhajan, puja at midnight." },
  { name: "Ganesh Chaturthi",      sanskrit: "गणेश चतुर्थी",  date: "27 Aug 2025", isoDate: "2025-08-27", tithi: "Bhadrapada Shukla Chaturthi",    type: "major",   significance: "Birth of Lord Ganesha. 10-day festival in Maharashtra.", observance: "Install Ganesha idol, modak offering, aarti twice daily, visarjan on the 10th day." },
  { name: "Onam",                  date: "5 Sep 2025",          isoDate: "2025-09-05", tithi: "Thiruvonam Nakshatra",             type: "major",   significance: "Harvest festival of Kerala, celebrating the return of mythical King Mahabali.", observance: "Pookalam (flower rangoli), Onasadya feast, traditional games, vallamkali boat race." },
  { name: "Navratri (Sharada)",    sanskrit: "शारदीय नवरात्रि", date: "2–11 Oct 2025", isoDate: "2025-10-02", tithi: "Ashwin Shukla Pratipada to Navami", type: "major", significance: "Nine nights of Goddess Durga worship in her nine forms.", observance: "Garba and Dandiya dances, fasting, Devi puja, Kanya puja on Ashtami." },
  { name: "Dussehra / Vijayadashami", sanskrit: "दशहरा",      date: "2 Oct 2025",  isoDate: "2025-10-02", tithi: "Ashwin Shukla Dashami",          type: "major",   significance: "Victory of Lord Rama over Ravana — triumph of good over evil.", observance: "Ravan dahan, Ramlila performances, Shastra puja, new beginnings." },
  { name: "Karva Chauth",          date: "10 Oct 2025",         isoDate: "2025-10-10", tithi: "Kartik Krishna Chaturthi",         type: "fast",    significance: "Married women fast for the longevity and well-being of their husbands.", observance: "Sunrise-to-moonrise fast, Karva Chauth katha, sieve moon ritual at night." },
  { name: "Dhanteras",             date: "18 Oct 2025",         isoDate: "2025-10-18", tithi: "Kartik Krishna Trayodashi",        type: "major",   significance: "First day of Diwali — worship of Goddess Lakshmi and Dhanvantari (god of health).", observance: "Gold/silver/utensil purchase, Dhanvantari puja, diyas." },
  { name: "Diwali",                sanskrit: "दीपावली",        date: "20 Oct 2025", isoDate: "2025-10-20", tithi: "Kartik Amavasya",                type: "major",   significance: "Festival of lights — Lakshmi puja and celebration of Lord Rama's return to Ayodhya.", observance: "Lakshmi-Ganesha puja at dusk, lighting diyas, fireworks, family feasting." },
  { name: "Chhath Puja",           date: "28 Oct 2025",         isoDate: "2025-10-28", tithi: "Kartik Shukla Shashthi",           type: "major",   significance: "Worship of Surya (Sun) and Chhathi Maiya. Unique standing-in-water arghya ritual.", observance: "36-hour fast, offering arghya to rising and setting Sun from riverbank." },
  // 2026
  { name: "Makar Sankranti",       sanskrit: "मकर संक्रांति",  date: "14 Jan 2026", isoDate: "2026-01-14", tithi: "Sun enters Capricorn (Makar)",   type: "major",   significance: "Sun's transit into Capricorn. End of Dakshinayana, start of Uttarayana.", observance: "Sesame-jaggery sweets, kite flying, holy dip in rivers, tarpan for ancestors." },
  { name: "Basant Panchami",       date: "25 Jan 2026",         isoDate: "2026-01-25", tithi: "Magha Shukla Panchami",            type: "puja",    significance: "Saraswati Puja — goddess of wisdom, art, and knowledge.", observance: "Saraswati puja, books and instruments worshipped, yellow attire." },
  { name: "Maha Shivaratri",       sanskrit: "महाशिवरात्रि",   date: "15 Feb 2026", isoDate: "2026-02-15", tithi: "Phalguna Krishna Chaturdashi",  type: "major",   significance: "The great night of Lord Shiva.", observance: "All-night vigil, fasting, four-prahar puja of Shivalinga." },
  { name: "Holi",                  sanskrit: "होली",            date: "3 Mar 2026",  isoDate: "2026-03-03", tithi: "Phalguna Purnima",               type: "major",   significance: "Festival of colors and the triumph of devotion.", observance: "Holika Dahan the evening before, color celebration the next morning." },
  { name: "Rama Navami",           date: "26 Mar 2026",         isoDate: "2026-03-26", tithi: "Chaitra Shukla Navami",            type: "major",   significance: "Birth of Lord Rama.", observance: "Fasting, Ramayana recitation, Rama puja at noon." },
  { name: "Akshaya Tritiya",       sanskrit: "अक्षय तृतीया",   date: "19 Apr 2026", isoDate: "2026-04-19", tithi: "Vaishakha Shukla Tritiya",       type: "major",   significance: "Most auspicious Tithi of the year — Akshaya means 'that which never diminishes'.", observance: "Gold purchase, new ventures, charity, Vishnu and Lakshmi puja." },
  { name: "Buddha Purnima",        date: "1 May 2026",          isoDate: "2026-05-01", tithi: "Vaishakha Purnima",                type: "major",   significance: "Birth, enlightenment, and Mahaparinirvana of Gautama Buddha.", observance: "Meditation, Dana (charity), visiting monasteries or temples." },
  { name: "Nirjala Ekadashi",      date: "26 May 2026",         isoDate: "2026-05-26", tithi: "Jyeshtha Shukla Ekadashi",         type: "ekadashi", significance: "Most powerful Ekadashi — waterless fast observed for full 24-hour period.", observance: "Complete fast without water from sunrise to next day sunrise. Vishnu puja." },
  { name: "Guru Purnima",          sanskrit: "गुरु पूर्णिमा", date: "29 Jun 2026",  isoDate: "2026-06-29", tithi: "Ashadha Purnima",                type: "major",   significance: "Day to honour the Guru — spiritual teacher. Vyasa Puja commemorates Veda Vyasa.", observance: "Offering gratitude to teachers, reading scriptures, Guru Vandana." },
  { name: "Nag Panchami",          date: "17 Jul 2026",         isoDate: "2026-07-17", tithi: "Shravana Shukla Panchami",         type: "puja",    significance: "Worship of the Naga serpent deities for protection from snakes and evil.", observance: "Offer milk at snake anthills, fast, visit Nag temples." },
  { name: "Raksha Bandhan",        sanskrit: "रक्षाबंधन",      date: "28 Aug 2026", isoDate: "2026-08-28", tithi: "Shravana Purnima",               type: "major",   significance: "Bond of protection between brothers and sisters. Sisters tie rakhi on brother's wrist.", observance: "Rakhi tying, exchange of gifts, family meals." },
  { name: "Janmashtami",           sanskrit: "जन्माष्टमी",     date: "4 Sep 2026",  isoDate: "2026-09-04", tithi: "Bhadrapada Krishna Ashtami",     type: "major",   significance: "Birth of Lord Krishna, eighth avatar of Vishnu, at midnight in Mathura.", observance: "Fast until midnight, Dahi Handi celebrations, Krishna bhajan, puja at midnight." },
  { name: "Ganesh Chaturthi",      sanskrit: "गणेश चतुर्थी",  date: "14 Sep 2026", isoDate: "2026-09-14", tithi: "Bhadrapada Shukla Chaturthi",    type: "major",   significance: "Birth of Lord Ganesha. 10-day festival in Maharashtra.", observance: "Install Ganesha idol, modak offering, aarti twice daily, visarjan on the 10th day." },
  { name: "Navratri Starts",       sanskrit: "शारदीय नवरात्रि", date: "10 Oct 2026", isoDate: "2026-10-10", tithi: "Ashwin Shukla Pratipada",        type: "major",   significance: "Nine nights of Goddess Durga worship in her nine forms.", observance: "Garba and Dandiya dances, fasting, Devi puja, Kanya puja on Ashtami." },
  { name: "Dussehra / Vijayadashami", sanskrit: "दशहरा",      date: "19 Oct 2026", isoDate: "2026-10-19", tithi: "Ashwin Shukla Dashami",          type: "major",   significance: "Victory of Lord Rama over Ravana — triumph of good over evil.", observance: "Ravan dahan, Ramlila performances, Shastra puja, new beginnings." },
  { name: "Karva Chauth",          date: "30 Oct 2026",         isoDate: "2026-10-30", tithi: "Kartik Krishna Chaturthi",         type: "fast",    significance: "Married women fast for the longevity and well-being of their husbands.", observance: "Sunrise-to-moonrise fast, Karva Chauth katha, sieve moon ritual at night." },
  { name: "Diwali",                sanskrit: "दीपावली",        date: "8 Nov 2026",  isoDate: "2026-11-08", tithi: "Kartik Amavasya",                type: "major",   significance: "Festival of lights — Lakshmi puja and celebration of Lord Rama's return to Ayodhya.", observance: "Lakshmi-Ganesha puja at dusk, lighting diyas, fireworks, family feasting." },
  { name: "Chhath Puja",           date: "14 Nov 2026",         isoDate: "2026-11-14", tithi: "Kartik Shukla Shashthi",           type: "major",   significance: "Worship of Surya (Sun) and Chhathi Maiya. Unique standing-in-water arghya ritual.", observance: "36-hour fast, offering arghya to rising and setting Sun from riverbank." },
];

const TYPE_COLORS: Record<Festival["type"], { bg: string; text: string; label: string }> = {
  major:    { bg: "bg-amber-100",   text: "text-amber-800",   label: "Festival"  },
  ekadashi: { bg: "bg-indigo-100",  text: "text-indigo-800",  label: "Ekadashi"  },
  puja:     { bg: "bg-rose-100",    text: "text-rose-800",    label: "Puja"      },
  fast:     { bg: "bg-emerald-100", text: "text-emerald-800", label: "Fast"      },
};

const MONTHS_ORDER = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function generateDynamicFestivals(): Festival[] {
  const fests: Festival[] = [];
  const now = new Date();
  now.setHours(12, 0, 0, 0);
  
  for (let i = 0; i <= 90; i++) {
    const d = new Date(now.getTime() + i * 86400000);
    const tithi = getTithiData(d);
    const isoDate = d.toISOString().split("T")[0];
    const displayDate = `${d.getDate()} ${MONTHS_ORDER[d.getMonth()]} ${d.getFullYear()}`;
    
    if (tithi.index === 10 || tithi.index === 25) {
      fests.push({
        name: tithi.name,
        date: displayDate,
        isoDate,
        tithi: tithi.name,
        significance: "A sacred day of fasting and spiritual discipline devoted to Lord Vishnu.",
        observance: "Fasting from grains and beans, chanting, and prayer.",
        type: "ekadashi"
      });
    } else if (tithi.index === 14) {
      fests.push({
        name: "Purnima",
        sanskrit: "पूर्णिमा",
        date: displayDate,
        isoDate,
        tithi: tithi.name,
        significance: "Full moon day, highly auspicious for spiritual practices and Satyanarayan Puja.",
        observance: "Fasting, river baths, and charity.",
        type: "puja"
      });
    } else if (tithi.index === 29) {
      fests.push({
        name: "Amavasya",
        sanskrit: "अमावस्या",
        date: displayDate,
        isoDate,
        tithi: tithi.name,
        significance: "New moon day, dedicated to ancestral offerings (Tarpan).",
        observance: "Tarpan, fasting, and deep meditation.",
        type: "fast"
      });
    }
  }
  return fests;
}

function groupByMonth(festivals: Festival[]) {
  const now = new Date();
  const currentYear = now.getFullYear().toString();
  
  // Show festivals that are upcoming OR belong to the current calendar year
  const relevant = festivals.filter(f => {
    const isUpcoming = new Date(f.isoDate) >= new Date(now.setHours(0,0,0,0));
    const isCurrentYear = f.isoDate.startsWith(currentYear);
    return isUpcoming || isCurrentYear;
  });
  
  const grouped: Record<string, Festival[]> = {};
  relevant.forEach(f => {
    // f.date format is either "14 Mar 2025" or "2-11 Oct 2025"
    let mon = "";
    let year = "";
    const parts = f.date.split(" ");
    if (parts.length === 3) {
      mon = parts[1];
      year = parts[2];
    } else {
      // Fallback
      const d = new Date(f.isoDate);
      mon = MONTHS_ORDER[d.getMonth()];
      year = d.getFullYear().toString();
    }
    
    const key = `${mon} ${year}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(f);
  });
  return grouped;
}

const AppFestivals: React.FC = () => {
  const [filterType, setFilterType] = useState<Festival["type"] | "all">("all");
  
  const allFests = useMemo(() => {
    const dynamicFests = generateDynamicFestivals();
    const combined = [...FESTIVALS_2025_2026];
    
    dynamicFests.forEach(df => {
      // Don't add dynamic Purnima/Ekadashi if there's already a major festival on that exact day
      if (!combined.some(f => f.isoDate === df.isoDate)) {
        combined.push(df);
      }
    });
    return combined;
  }, []);

  const sorted = [...allFests].sort((a, b) => a.isoDate.localeCompare(b.isoDate));
  const filtered = filterType === "all" ? sorted : sorted.filter(f => f.type === filterType);
  const grouped = groupByMonth(filtered);

  const nextFest = sorted.find(f => new Date(f.isoDate) >= new Date(new Date().setHours(0,0,0,0)));

  return (
    <AppShell title="Festivals" eyebrow="Dynamic Vedic Calendar" showBack>
      {/* Next festival highlight */}
      {nextFest && (
        <div className="bg-gradient-to-br from-rose-600 to-pink-500 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-1.5 mb-2">
            <CalendarDays className="w-3.5 h-3.5 text-white/80" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-white/80">Coming Next</span>
          </div>
          <p className="font-display text-xl font-bold">{nextFest.name}</p>
          {nextFest.sanskrit && <p className="text-white/60 text-xs">{nextFest.sanskrit}</p>}
          <p className="text-white/80 text-sm mt-1">{nextFest.date}</p>
          <p className="text-white/60 text-xs mt-0.5 italic">{nextFest.tithi}</p>
          <p className="text-white/80 text-xs mt-2 leading-relaxed">{nextFest.significance}</p>
        </div>
      )}

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {(["all", "major", "ekadashi", "puja", "fast"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilterType(t)}
            className={cn(
              "shrink-0 px-3 py-1.5 rounded-full text-xs font-bold border transition-all",
              filterType === t
                ? "bg-rose-500 border-rose-500 text-white"
                : "bg-white border-stone-200 text-stone-600"
            )}
          >
            {t === "all" ? "All" : TYPE_COLORS[t].label + "s"}
          </button>
        ))}
      </div>

      {/* Festival list grouped by month */}
      {Object.entries(grouped).map(([month, fests]) => (
        <div key={month}>
          <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">{month}</p>
          <div className="space-y-2">
            {fests.map((f) => {
              const tc = TYPE_COLORS[f.type];
              return (
                <div key={f.isoDate + f.name} className="bg-white rounded-xl border border-stone-100 overflow-hidden">
                  <div className="px-4 py-3 flex items-start gap-3">
                    {/* Date block */}
                    <div className="shrink-0 w-10 text-center">
                      <p className="font-display text-lg font-bold text-stone-900 leading-none">
                        {f.date.split(" ")[0]}
                      </p>
                      <p className="text-[10px] text-stone-400">{f.date.split(" ")[1]}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-semibold text-[14px] text-stone-900 leading-tight">{f.name}</p>
                          {f.sanskrit && <p className="text-[11px] text-stone-400">{f.sanskrit}</p>}
                        </div>
                        <span className={cn("shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full", tc.bg, tc.text)}>
                          {tc.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-amber-600 italic mt-1">{f.tithi}</p>
                      <p className="text-xs text-stone-500 leading-relaxed mt-1">{f.significance}</p>
                      <div className="mt-2 pt-2 border-t border-stone-50">
                        <p className="text-[11px] text-stone-500 leading-relaxed">
                          <span className="font-semibold text-stone-600">Observance: </span>{f.observance}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
        <p className="text-[11px] text-amber-700 leading-relaxed">
          ✦ Festival dates follow the Hindu lunar calendar and may vary by region (Maharashtra, South India, Bengal). Confirm with a local panchang for your region.
        </p>
      </div>
    </AppShell>
  );
};

export default AppFestivals;
