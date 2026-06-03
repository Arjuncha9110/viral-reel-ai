import { Observer, SearchLunarEclipse, SearchLocalSolarEclipse, SearchGlobalSolarEclipse, AstroTime } from "astronomy-engine";

export interface EclipseData {
  type: "Solar" | "Lunar";
  kind: string;
  peakTime: Date;
  sutakStartTime: Date;
  isLocallyVisible: boolean;
  localContactBegin?: Date;
  localContactEnd?: Date;
}

export const getUpcomingEclipses = (lat: number, lon: number, fromDate: Date = new Date()): { nextSolar: EclipseData, nextLunar: EclipseData } => {
  const observer = new Observer(lat, lon, 0);
  const astroFromDate = new AstroTime(fromDate);

  // --- 1. Lunar Eclipse ---
  const lunarObj = SearchLunarEclipse(astroFromDate);
  const lunarPeak = lunarObj.peak.date;
  
  // Sutak Kaal for Lunar Eclipse begins 9 hours before the eclipse (roughly before peak if we don't have exact first contact)
  // To be more precise, we can estimate first contact. astronomy-engine sd_penum is the semi-duration of penumbral phase in minutes.
  const lunarContactBegin = new Date(lunarPeak.getTime() - (lunarObj.sd_penum * 60 * 1000));
  const lunarContactEnd = new Date(lunarPeak.getTime() + (lunarObj.sd_penum * 60 * 1000));
  
  // Sutak Kaal starts 9 hours (9 * 3600 * 1000 ms) before first contact
  const lunarSutak = new Date(lunarContactBegin.getTime() - (9 * 3600 * 1000));

  let lunarKindStr = "Lunar Eclipse";
  if (lunarObj.kind) {
    lunarKindStr = lunarObj.kind.charAt(0).toUpperCase() + lunarObj.kind.slice(1) + " Lunar Eclipse";
  }

  // Lunar eclipses are visible if the moon is above the horizon. 
  // astronomy-engine doesn't provide a direct local visibility check for lunar eclipses out of the box in the search result,
  // but if the peak happens at night locally, it's generally visible.
  // We can approximate visibility if peak time is between sunset and sunrise, but we'll default to globally applicable for this card.
  
  const nextLunar: EclipseData = {
    type: "Lunar",
    kind: lunarKindStr,
    peakTime: lunarPeak,
    sutakStartTime: lunarSutak,
    isLocallyVisible: true, // Lunar eclipses are globally visible for half the earth
    localContactBegin: lunarContactBegin,
    localContactEnd: lunarContactEnd,
  };

  // --- 2. Solar Eclipse ---
  // Search global first to get the next absolute solar eclipse
  const globalSolarObj = SearchGlobalSolarEclipse(astroFromDate);
  const solarPeak = globalSolarObj.peak.date;
  
  // Sutak starts 12 hours before peak (approximation if local contact isn't available)
  let solarSutak = new Date(solarPeak.getTime() - (12 * 3600 * 1000));
  
  let solarKindStr = "Solar Eclipse";
  if (globalSolarObj.kind) {
    solarKindStr = globalSolarObj.kind.charAt(0).toUpperCase() + globalSolarObj.kind.slice(1) + " Solar Eclipse";
  }

  let isSolarVisible = false;
  let localSolarBegin: Date | undefined;
  let localSolarEnd: Date | undefined;

  // Search if there is a local solar eclipse nearby
  const localSolarObj = SearchLocalSolarEclipse(astroFromDate, observer);
  if (localSolarObj && localSolarObj.peak) {
    // Check if the local eclipse happens within a few days of the global one
    if (Math.abs(localSolarObj.peak.time.date.getTime() - solarPeak.getTime()) < 3 * 24 * 3600 * 1000) {
      isSolarVisible = true;
      if (localSolarObj.partial_begin) {
        localSolarBegin = localSolarObj.partial_begin.time.date;
        solarSutak = new Date(localSolarBegin.getTime() - (12 * 3600 * 1000));
      }
      if (localSolarObj.partial_end) {
        localSolarEnd = localSolarObj.partial_end.time.date;
      }
    }
  }

  const nextSolar: EclipseData = {
    type: "Solar",
    kind: solarKindStr,
    peakTime: solarPeak,
    sutakStartTime: solarSutak,
    isLocallyVisible: isSolarVisible,
    localContactBegin: localSolarBegin,
    localContactEnd: localSolarEnd,
  };

  return { nextSolar, nextLunar };
};

export const getEclipseCalendarList = (lat: number, lon: number, count: number = 10, fromDate: Date = new Date()): EclipseData[] => {
  const observer = new Observer(lat, lon, 0);
  let eclipses: EclipseData[] = [];
  
  let dateLunar = new AstroTime(fromDate);
  let dateSolar = new AstroTime(fromDate);
  
  // Get next N lunar eclipses
  for (let i = 0; i < count; i++) {
    const lunarObj = SearchLunarEclipse(dateLunar);
    const lunarPeak = lunarObj.peak.date;
    const lunarContactBegin = new Date(lunarPeak.getTime() - (lunarObj.sd_penum * 60 * 1000));
    const lunarContactEnd = new Date(lunarPeak.getTime() + (lunarObj.sd_penum * 60 * 1000));
    const lunarSutak = new Date(lunarContactBegin.getTime() - (9 * 3600 * 1000));

    let lunarKindStr = "Lunar Eclipse";
    if (lunarObj.kind) {
      lunarKindStr = lunarObj.kind.charAt(0).toUpperCase() + lunarObj.kind.slice(1) + " Lunar Eclipse";
    }

    eclipses.push({
      type: "Lunar",
      kind: lunarKindStr,
      peakTime: lunarPeak,
      sutakStartTime: lunarSutak,
      isLocallyVisible: true,
      localContactBegin: lunarContactBegin,
      localContactEnd: lunarContactEnd,
    });

    dateLunar = new AstroTime(new Date(lunarPeak.getTime() + 5 * 24 * 3600 * 1000));
  }

  // Get next N solar eclipses
  for (let i = 0; i < count; i++) {
    const globalSolarObj = SearchGlobalSolarEclipse(dateSolar);
    const solarPeak = globalSolarObj.peak.date;
    let solarSutak = new Date(solarPeak.getTime() - (12 * 3600 * 1000));
    
    let solarKindStr = "Solar Eclipse";
    if (globalSolarObj.kind) {
      solarKindStr = globalSolarObj.kind.charAt(0).toUpperCase() + globalSolarObj.kind.slice(1) + " Solar Eclipse";
    }

    let isSolarVisible = false;
    let localSolarBegin: Date | undefined;
    let localSolarEnd: Date | undefined;

    // We pass a nearby date to SearchLocalSolarEclipse to see if this global eclipse is visible locally
    const localSolarObj = SearchLocalSolarEclipse(new AstroTime(new Date(solarPeak.getTime() - 2 * 24 * 3600 * 1000)), observer);
    if (localSolarObj && localSolarObj.peak) {
      if (Math.abs(localSolarObj.peak.time.date.getTime() - solarPeak.getTime()) < 3 * 24 * 3600 * 1000) {
        isSolarVisible = true;
        if (localSolarObj.partial_begin) {
          localSolarBegin = localSolarObj.partial_begin.time.date;
          solarSutak = new Date(localSolarBegin.getTime() - (12 * 3600 * 1000));
        }
        if (localSolarObj.partial_end) {
          localSolarEnd = localSolarObj.partial_end.time.date;
        }
      }
    }

    eclipses.push({
      type: "Solar",
      kind: solarKindStr,
      peakTime: solarPeak,
      sutakStartTime: solarSutak,
      isLocallyVisible: isSolarVisible,
      localContactBegin: localSolarBegin,
      localContactEnd: localSolarEnd,
    });

    dateSolar = new AstroTime(new Date(solarPeak.getTime() + 5 * 24 * 3600 * 1000));
  }

  // Sort chronologically and take only the next `count` overall eclipses
  eclipses.sort((a, b) => a.peakTime.getTime() - b.peakTime.getTime());
  return eclipses.slice(0, count);
};
