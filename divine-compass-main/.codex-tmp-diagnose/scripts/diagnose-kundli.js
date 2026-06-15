import { getAscendant, getPlanetPositions } from "../src/lib/astro/kundaliEngine";
import { getLahiriAyanamsha } from "../src/lib/astro/ephemeris";
import { calculateVimshottariDasha, toUTC } from "../src/lib/calculators/astrology/vimshottari";
import { getSiderealMoonLongitude, getNakshatraData } from "../src/lib/panchang/astroEngine";
const dob = "1978-06-09";
const tob = "18:45";
const timezone = "Asia/Kolkata";
const lat = 12.9716;
const lon = 77.5946;
const birthUtc = toUTC(dob, tob, timezone);
const planets = getPlanetPositions(birthUtc, lat, lon);
const lagna = getAscendant(birthUtc, lat, lon);
const moonFromPanchang = getSiderealMoonLongitude(birthUtc);
const moonNak = getNakshatraData(moonFromPanchang);
const dasha = calculateVimshottariDasha({ dob, tob, timezone });
const moonFromChart = planets.find((planet) => planet.name === "Moon");
console.log(JSON.stringify({
    input: { dob, tob, timezone, lat, lon, birthUtc: birthUtc.toISOString() },
    lagna,
    lagnaSignIndex: Math.floor(lagna / 30),
    ayanamsha: getLahiriAyanamsha(birthUtc),
    moonFromChart,
    moonFromPanchang,
    moonNakshatraFromPanchang: moonNak,
    dashaBirthNakshatra: dasha.birthNakshatra,
    dashaBirthNakshatraLord: dasha.birthNakshatraLord,
    dashaMoonLongitude: dasha.moonLongitude,
    planets: planets.map((planet) => ({
        name: planet.name,
        longitude: Number(planet.longitude.toFixed(6)),
        sign: planet.sign,
        degree: Number(planet.degree.toFixed(6)),
        house: planet.house,
        nakshatra: planet.nakshatra,
        pada: planet.pada,
    })),
}, null, 2));
