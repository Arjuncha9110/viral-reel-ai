import { SearchLunarEclipse, SearchGlobalSolarEclipse, AstroTime } from "astronomy-engine";

const getCalendar = () => {
  let dateLunar = new AstroTime(new Date());
  let dateSolar = new AstroTime(new Date());
  
  console.log("Upcoming Lunar Eclipses:");
  for (let i = 0; i < 5; i++) {
    const lunar = SearchLunarEclipse(dateLunar);
    console.log(`- ${lunar.kind} at ${lunar.peak.date.toISOString()}`);
    dateLunar = new AstroTime(new Date(lunar.peak.date.getTime() + 5 * 24 * 3600 * 1000));
  }

  console.log("\nUpcoming Solar Eclipses:");
  for (let i = 0; i < 5; i++) {
    const solar = SearchGlobalSolarEclipse(dateSolar);
    console.log(`- ${solar.kind} at ${solar.peak.date.toISOString()}`);
    dateSolar = new AstroTime(new Date(solar.peak.date.getTime() + 5 * 24 * 3600 * 1000));
  }
};

getCalendar();
