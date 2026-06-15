const { Observer, SearchLunarEclipse, SearchGlobalSolarEclipse, SearchLocalSolarEclipse, AstroTime } = require("astronomy-engine");

const date = new AstroTime(new Date());
const observer = new Observer(12.973, 77.531, 0); // Bengaluru

try {
  console.log("Searching for next lunar eclipse...");
  const lunar = SearchLunarEclipse(date);
  console.log("Next Lunar Eclipse:", lunar.kind, lunar.peak.date.toISOString());
  
  console.log("Searching for next global solar eclipse...");
  const globalSolar = SearchGlobalSolarEclipse(date);
  console.log("Next Global Solar Eclipse:", globalSolar.kind, globalSolar.peak.date.toISOString());

  console.log("Searching for next local solar eclipse...");
  const localSolar = SearchLocalSolarEclipse(date, observer);
  console.log("Next Local Solar Eclipse:", localSolar ? localSolar.peak.time.date.toISOString() : "None found nearby");

} catch (e) {
  console.error("Error:", e);
}
