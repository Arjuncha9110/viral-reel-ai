import { getSiderealMoonLongitude, getNakshatraData } from "../../panchang/astroEngine";
// Consts
export const NAKSHATRA_SPAN = 360 / 27; // 13°20' = 13.333333333333334
export const DASHA_ORDER = [
    "Ketu", "Venus", "Sun", "Moon", "Mars", "Rahu", "Jupiter", "Saturn", "Mercury"
];
export const DASHA_YEARS = {
    Ketu: 7,
    Venus: 20,
    Sun: 6,
    Moon: 10,
    Mars: 7,
    Rahu: 18,
    Jupiter: 16,
    Saturn: 19,
    Mercury: 17
};
export const TOTAL_DASHA_CYCLE_YEARS = 120;
/**
 * Parses date, time, and timezone to a precise UTC Date.
 */
export function toUTC(dob, tob, timezone) {
    const [year, month, day] = dob.split("-").map(Number);
    const [hour, minute] = tob.split(":").map(Number);
    // 1. Create a "naive" date representing the local time digits in UTC
    const naiveDate = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
    // 2. Adjust offset using standard Intl formatter
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        year: 'numeric', month: 'numeric', day: 'numeric',
        hour: 'numeric', minute: 'numeric', second: 'numeric',
        hour12: false
    });
    const parts = formatter.formatToParts(naiveDate);
    const map = {};
    parts.forEach(p => map[p.type] = p.value);
    const reportedHour = map.hour === '24' ? 0 : parseInt(map.hour);
    const tzDateNaive = new Date(Date.UTC(parseInt(map.year), parseInt(map.month) - 1, parseInt(map.day), reportedHour, parseInt(map.minute), parseInt(map.second)));
    const offsetMs = tzDateNaive.getTime() - naiveDate.getTime();
    return new Date(naiveDate.getTime() - offsetMs);
}
/**
 * Calculates Antardashas inside a Mahadasha starting at `start` and ending at `end`
 * for a planet that has `mahaYears` full years in the Vimshottari cycle.
 */
function calculateAntardashas(maha, start, end, mahaYears) {
    const mahaIdx = DASHA_ORDER.indexOf(maha);
    const antardashas = [];
    const totalMs = end.getTime() - start.getTime();
    let cursor = new Date(start);
    for (let i = 0; i < 9; i++) {
        const pIdx = (mahaIdx + i) % 9;
        const planet = DASHA_ORDER[pIdx];
        const antarYears = DASHA_YEARS[planet];
        // Proportional fraction of the Mahadasha duration
        const fraction = antarYears / 120;
        const ms = totalMs * fraction;
        const adStart = new Date(cursor);
        const adEnd = new Date(cursor.getTime() + ms);
        // Generate Pratyantardashas under this Antardasha period
        const pratyantardashas = calculatePratyantardashas(planet, adStart, adEnd);
        antardashas.push({
            planet,
            start: adStart,
            end: adEnd,
            pratyantardashas
        });
        cursor = adEnd;
    }
    return antardashas;
}
/**
 * Calculates Pratyantardashas inside an Antardasha starting at `start` and ending at `end`
 * for an Antardasha planet.
 */
function calculatePratyantardashas(antarLord, start, end) {
    const antarIdx = DASHA_ORDER.indexOf(antarLord);
    const pratyantardashas = [];
    const totalMs = end.getTime() - start.getTime();
    let cursor = new Date(start);
    for (let i = 0; i < 9; i++) {
        const pIdx = (antarIdx + i) % 9;
        const planet = DASHA_ORDER[pIdx];
        const pdYears = DASHA_YEARS[planet];
        // Proportional fraction of the Antardasha duration
        const fraction = pdYears / 120;
        const ms = totalMs * fraction;
        const pdStart = new Date(cursor);
        const pdEnd = new Date(cursor.getTime() + ms);
        pratyantardashas.push({
            planet,
            start: pdStart,
            end: pdEnd
        });
        cursor = pdEnd;
    }
    return pratyantardashas;
}
/**
 * Resolves active Mahadasha, Antardasha, and Pratyantardasha periods at a target date.
 */
export function getCurrentDasha(mahadashas, date = new Date()) {
    let activeMaha = null;
    let activeAntar = null;
    let activePratyantar = null;
    const targetTime = date.getTime();
    for (const d of mahadashas) {
        if (targetTime >= d.start.getTime() && targetTime <= d.end.getTime()) {
            activeMaha = d;
            for (const a of d.antardashas) {
                if (targetTime >= a.start.getTime() && targetTime <= a.end.getTime()) {
                    activeAntar = a;
                    if (a.pratyantardashas) {
                        for (const p of a.pratyantardashas) {
                            if (targetTime >= p.start.getTime() && targetTime <= p.end.getTime()) {
                                activePratyantar = p;
                                break;
                            }
                        }
                    }
                    break;
                }
            }
            break;
        }
    }
    return {
        mahadasha: activeMaha,
        antardasha: activeAntar,
        pratyantardasha: activePratyantar
    };
}
/**
 * Standard date formatting.
 */
export function formatDashaDate(date) {
    return date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric"
    });
}
/**
 * Calculates complete Vimshottari Dasha timeline based on sidereal Moon longitude.
 */
export function calculateVimshottariDasha({ dob, tob, timezone }) {
    const birthUTC = toUTC(dob, tob, timezone);
    const moonLongitude = getSiderealMoonLongitude(birthUTC);
    const nakshatra = getNakshatraData(moonLongitude);
    const birthNakshatra = nakshatra.name;
    const birthNakshatraLord = nakshatra.lord;
    const degreeElapsedInNakshatra = nakshatra.percent * NAKSHATRA_SPAN;
    const elapsedFraction = nakshatra.percent;
    const remainingFraction = 1 - elapsedFraction;
    const lordDashaYears = DASHA_YEARS[birthNakshatraLord];
    const dashaDaysPerYear = 365.2425;
    const totalDashaDays = lordDashaYears * dashaDaysPerYear;
    const elapsedDays = elapsedFraction * totalDashaDays;
    const remainingDays = remainingFraction * totalDashaDays;
    // True Mahadasha Boundary: starts BEFORE birth, ends AFTER birth
    const firstStartDate = new Date(birthUTC.getTime() - elapsedDays * 24 * 60 * 60 * 1000);
    const firstEndDate = new Date(birthUTC.getTime() + remainingDays * 24 * 60 * 60 * 1000);
    const startPlanetIndex = DASHA_ORDER.indexOf(birthNakshatraLord);
    // Compute precise birth balance
    const balanceYearsFloat = remainingFraction * lordDashaYears;
    const balanceYears = Math.floor(balanceYearsFloat);
    const balanceMonthsFloat = (balanceYearsFloat - balanceYears) * 12;
    const balanceMonths = Math.floor(balanceMonthsFloat);
    const balanceDays = Math.round((balanceMonthsFloat - balanceMonths) * 30.436875);
    const dashaBalanceAtBirth = {
        years: balanceYears,
        months: balanceMonths,
        days: balanceDays,
        totalYears: balanceYearsFloat
    };
    const mahadashas = [];
    // Generate timelines starting from firstStartDate
    let cursor = firstStartDate;
    let dashaIndex = 0;
    while (true) {
        const pIdx = (startPlanetIndex + dashaIndex) % 9;
        const planet = DASHA_ORDER[pIdx];
        const fullYears = DASHA_YEARS[planet];
        const durationDays = fullYears * dashaDaysPerYear;
        const start = new Date(cursor);
        const end = new Date(cursor.getTime() + durationDays * 24 * 60 * 60 * 1000);
        const antardashas = calculateAntardashas(planet, start, end, fullYears);
        mahadashas.push({
            planet,
            start,
            end,
            antardashas
        });
        cursor = end;
        dashaIndex++;
        // Terminate when we've generated at least 120 years from birth, and at least 9 periods
        const targetEndMs = birthUTC.getTime() + 120 * dashaDaysPerYear * 24 * 60 * 60 * 1000;
        if (cursor.getTime() >= targetEndMs && dashaIndex >= 9) {
            break;
        }
    }
    const now = new Date();
    const current = getCurrentDasha(mahadashas, now);
    return {
        birthNakshatra,
        birthNakshatraLord,
        moonLongitude,
        degreeElapsedInNakshatra,
        dashaBalanceAtBirth,
        mahadashas,
        currentMahadasha: current.mahadasha,
        currentAntardasha: current.antardasha,
        currentPratyantardasha: current.pratyantardasha
    };
}
// ─── Self-Contained Safe Diagnostic Logger for Arjun ───
if (typeof window !== "undefined" || typeof global !== "undefined") {
    try {
        const arjunData = {
            name: "Arjun",
            dob: "1992-12-05",
            tob: "15:30",
            city: "Bengaluru",
            timezone: "Asia/Kolkata"
        };
        const testResult = calculateVimshottariDasha(arjunData);
        console.log("=== VIMSHOTTARI DASHA VALIDATION TEST (ARJUN) ===", "\nBirth Nakshatra:", testResult.birthNakshatra, "\nBirth Nakshatra Lord (Birth Mahadasha Lord):", testResult.birthNakshatraLord, "\nMoon Longitude at Birth:", testResult.moonLongitude.toFixed(4) + "°", "\nNakshatra Degree Elapsed:", testResult.degreeElapsedInNakshatra.toFixed(4) + "°", "\nDasha Balance at Birth:", `${testResult.dashaBalanceAtBirth.years} Years, ${testResult.dashaBalanceAtBirth.months} Months, ${testResult.dashaBalanceAtBirth.days} Days`, "\nFirst Mahadasha Period (Starts before birth):", formatDashaDate(testResult.mahadashas[0].start), "to", formatDashaDate(testResult.mahadashas[0].end), "\nActive Mahadasha Now:", testResult.currentMahadasha?.planet || "None", "\nActive Antardasha Now:", testResult.currentAntardasha?.planet || "None", "\nActive Pratyantardasha Now:", testResult.currentPratyantardasha?.planet || "None", "\n=================================================");
    }
    catch (e) {
        // Avoid crashing during static initialization in environments lacking standard timezones or Intl support
        console.warn("Vimshottari initialization diagnostic skipped:", e);
    }
}
