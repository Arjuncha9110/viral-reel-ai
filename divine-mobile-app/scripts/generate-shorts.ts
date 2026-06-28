/**
 * Daily Panchang YouTube Shorts script generator.
 *
 * Reads the SAME panchang engine the website uses, then prints a complete,
 * ready-to-record Shorts script in English: hook, on-screen text beats,
 * ~35s voiceover, a light site call-to-action, and a caption + hashtags.
 *
 * Usage:
 *   npm run shorts                  # today, Bengaluru
 *   npm run shorts -- mumbai        # today, Mumbai
 *   npm run shorts -- delhi 2026-06-20   # specific date + city
 *
 * Cities: delhi, mumbai, bengaluru, kolkata, chennai, hyderabad, pune, varanasi
 */
import { getSamplePanchangData } from "../src/lib/calculators/astrology/panchang";

const SITE = "divinepanchang.space";

const CITIES: Record<string, { name: string; lat: number; lon: number; tz: string }> = {
  delhi: { name: "New Delhi", lat: 28.6139, lon: 77.209, tz: "Asia/Kolkata" },
  "new-delhi": { name: "New Delhi", lat: 28.6139, lon: 77.209, tz: "Asia/Kolkata" },
  mumbai: { name: "Mumbai", lat: 19.076, lon: 72.8777, tz: "Asia/Kolkata" },
  bengaluru: { name: "Bengaluru", lat: 12.9716, lon: 77.5946, tz: "Asia/Kolkata" },
  bangalore: { name: "Bengaluru", lat: 12.9716, lon: 77.5946, tz: "Asia/Kolkata" },
  kolkata: { name: "Kolkata", lat: 22.5726, lon: 88.3639, tz: "Asia/Kolkata" },
  chennai: { name: "Chennai", lat: 13.0827, lon: 80.2707, tz: "Asia/Kolkata" },
  hyderabad: { name: "Hyderabad", lat: 17.385, lon: 78.4867, tz: "Asia/Kolkata" },
  pune: { name: "Pune", lat: 18.5204, lon: 73.8567, tz: "Asia/Kolkata" },
  varanasi: { name: "Varanasi", lat: 25.3176, lon: 82.9739, tz: "Asia/Kolkata" },
};

// Short, plain-English meaning lines keyed by tithi/nakshatra family so each
// Short carries one genuine takeaway rather than just reading data aloud.
const TITHI_VIBE: Record<string, string> = {
  Pratipada: "a fresh start — good for new beginnings",
  Dwitiya: "building momentum — keep things steady",
  Tritiya: "creative energy — a good day to make or fix things",
  Chaturthi: "clear obstacles before starting anything big",
  Panchami: "learning and money matters are favoured",
  Shashthi: "energy and health are in focus",
  Saptami: "movement and travel flow well",
  Ashtami: "stay disciplined — avoid shortcuts today",
  Navami: "courage day — finish what you started",
  Dashami: "balanced and supportive for routine work",
  Ekadashi: "a spiritual day — fasting and reflection are powerful",
  Dwadashi: "wrap up and release — good for closure",
  Trayodashi: "auspicious for devotion and Shiva worship",
  Chaturdashi: "intense energy — keep calm and grounded",
  Purnima: "full moon — gratitude, charity, and completion",
  Amavasya: "new moon — rest, reset, and honour ancestors",
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function main() {
  const args = process.argv.slice(2);
  const cityKey = (args[0] || "bengaluru").toLowerCase();
  const city = CITIES[cityKey] || CITIES.bengaluru;
  const date = args[1] ? new Date(args[1] + "T06:00:00") : new Date();

  const p = getSamplePanchangData(date, city.lat, city.lon, city.tz);

  const tithiName = p.tithi[0].name;
  const tithiClean = tithiName.replace(/^(Shukla|Krishna)\s+/i, "").trim();
  const nakshatra = p.nakshatra[0].name;
  const yoga = p.yoga[0].name;
  const rahu = p.rahuKaal;
  const abhijit = p.abhijitMuhurat;
  const sunrise = p.sunrise;
  const vibe = TITHI_VIBE[tithiClean] || "a balanced day — move with intention";

  const dateLabel = p.date;

  const out: string[] = [];
  out.push("============================================================");
  out.push(`  DAILY PANCHANG SHORT  •  ${dateLabel}  •  ${city.name}`);
  out.push("============================================================\n");

  out.push("TITLE (paste in YouTube):");
  out.push(`  Today's Panchang ${city.name} | ${tithiClean}, ${nakshatra} & Rahu Kaal\n`);

  out.push("HOOK (0-3s) — say with energy, big on-screen text:");
  out.push(`  "Before you plan your day — here's today's panchang in 30 seconds."\n`);

  out.push("ON-SCREEN TEXT BEATS (one card each, ~4s):");
  out.push(`  1. 📅 ${dateLabel}`);
  out.push(`  2. 🌙 Tithi: ${tithiClean}`);
  out.push(`  3. ⭐ Nakshatra: ${nakshatra}`);
  out.push(`  4. 🕉️ Yoga: ${yoga}`);
  out.push(`  5. ☀️ Sunrise: ${sunrise}`);
  out.push(`  6. ⛔ Rahu Kaal: ${rahu}  (avoid new starts)`);
  out.push(`  7. ✅ Abhijit Muhurat: ${abhijit}  (best time today)\n`);

  out.push("VOICEOVER (~35s — read naturally over the cards):");
  out.push(
    `  "Namaste. Here's your panchang for ${dateLabel} in ${city.name}.\n` +
    `   Today is ${tithiClean} tithi, with the Moon in ${nakshatra} nakshatra —\n` +
    `   ${vibe}.\n` +
    `   The Sun rises at ${sunrise}.\n` +
    `   Avoid starting anything important during Rahu Kaal, from ${rahu}.\n` +
    `   Your most auspicious window today is Abhijit Muhurat, ${abhijit} —\n` +
    `   use it for anything that matters.\n` +
    `   Want your full panchang with your city's exact timings? Link below."\n`
  );

  out.push("CTA (last 3s, on-screen + voice):");
  out.push(`  "Full daily panchang — free at ${SITE}"\n`);

  out.push("CAPTION (paste under the Short):");
  out.push(
    `  Today's Panchang for ${city.name} 🌙\n` +
    `  Tithi: ${tithiClean} | Nakshatra: ${nakshatra}\n` +
    `  Rahu Kaal: ${rahu} (avoid new beginnings)\n` +
    `  Abhijit Muhurat: ${abhijit} (most auspicious)\n` +
    `  ➡️ Full free panchang for your city: ${SITE}\n`
  );

  out.push("HASHTAGS:");
  out.push(
    `  #panchang #todaypanchang #rahukaal #${city.name.toLowerCase().replace(/\s+/g, "")} ` +
    `#hinducalendar #vedicastrology #nakshatra #tithi #dailypanchang #astrology\n`
  );

  out.push("------------------------------------------------------------");
  out.push("TIP: paste the VOICEOVER block into ElevenLabs, drop the audio over");
  out.push("the 7 on-screen cards in your editor, and you have a Short in minutes.");
  out.push("------------------------------------------------------------");

  console.log(out.join("\n"));
}

main();
