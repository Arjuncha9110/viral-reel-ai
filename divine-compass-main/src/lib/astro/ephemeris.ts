/**
 * High-Precision Ephemeris
 * Uses astronomy-engine (VSOP87 / ELP-2000 quality).
 *
 * Planet longitudes: GeoVector (EQJ, aberration=true) → Ecliptic → tropical elon
 * Moon longitude  : EclipticGeoMoon → tropical lon (already in ECT frame of date)
 * Ayanamsha       : Lahiri/Chitrapaksha – IAU-1977 / Indian Ephemeris standard
 * Ascendant       : GAST from library + standard Sidereal-to-Ecliptic formula
 */

import {
  MakeTime,
  GeoVector,
  Ecliptic,
  EclipticGeoMoon,
  SiderealTime,
  e_tilt,
  Body,
} from "./astronomy-core";

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;

const normalize = (d: number): number => {
  let a = d % 360;
  if (a < 0) a += 360;
  return a;
};

/** Julian Day (UT) since J2000.0 epoch */
export const getJulianDay = (date: Date): number => MakeTime(date).ut;

/**
 * Lahiri (Chitrapaksha) Ayanamsha
 * Reference: Indian Astronomical Ephemeris; IAU 1977 value at J2000 = 23°51'(approx)
 * More precisely: 23.853021 degrees at J2000.0 TT.
 * Precession rate: 5029.0966 arcsec/century (Newcomb / IAU 1976).
 */
export const getLahiriAyanamsha = (date: Date): number => {
  const time = MakeTime(date);
  // T in Julian centuries from J2000.0 (TT)
  const T = time.tt / 36525.0;

  // Lahiri value at J2000.0 (widely-used: 23°51'11.5" ≈ 23.85320 deg)
  // Precession accumulation since J2000: 5029.0966 arcsec/cy
  const ayanamsha = 23.85320 + (5029.0966 / 3600) * T;

  return ayanamsha;
};

/**
 * Tropical geocentric ecliptic longitude of a planet (GeoVector → Ecliptic).
 * GeoVector returns EQJ (J2000 equatorial) with aberration correction.
 * Ecliptic() rotates EQJ to the true ecliptic of date (ECT).
 */
const getTropicalLon = (bodyName: string, time: ReturnType<typeof MakeTime>): number => {
  const body = Body[bodyName as keyof typeof Body];
  const vec = GeoVector(body, time, true); // true = correct for aberration
  const ecl = Ecliptic(vec);              // EQJ → ECT (true ecliptic of date)
  return normalize(ecl.elon);
};

/**
 * Tropical geocentric ecliptic longitude of the Moon.
 * EclipticGeoMoon returns true ECT spherical coords directly.
 */
const getMoonTropicalLon = (time: ReturnType<typeof MakeTime>): number => {
  const sph = EclipticGeoMoon(time);
  return normalize(sph.lon);
};

/**
 * Mean Lunar Node (Rahu) – IAU/Meeus formula.
 * Returns tropical longitude of the Mean North Node.
 */
const getMeanNode = (time: ReturnType<typeof MakeTime>): number => {
  const T = time.tt / 36525.0;
  const node = 125.04452 - 1934.136261 * T + 0.0020708 * T * T + T * T * T / 450000;
  return normalize(node);
};

/**
 * Local Apparent Sidereal Time at observer longitude.
 */
export const getLST = (date: Date, observerLon: number): number => {
  const time = MakeTime(date);
  const gastHours = SiderealTime(time); // GAST in sidereal hours
  const gastDeg = gastHours * 15;
  return normalize(gastDeg + observerLon);
};

/**
 * Tropical Ascendant (Eastern Rising point on ecliptic).
 * Standard formula: atan2(-cos(LAST), sin(LAST)·cos(ε) + tan(φ)·sin(ε))
 * This gives the tropical ecliptic longitude of the ascendant.
 */
export const getAscendantTropical = (date: Date, lat: number, lon: number): number => {
  const time = MakeTime(date);
  const lst = getLST(date, lon);

  const et = e_tilt(time);
  const eps = et.tobl; // true obliquity of date

  const α = lst * D2R;
  const φ = lat * D2R;
  const ε = eps * D2R;

  // Standard Ascendant formula (Meeus, "Astronomical Algorithms" ch.14)
  const y = -Math.cos(α);
  const x = Math.sin(α) * Math.cos(ε) + Math.tan(φ) * Math.sin(ε);

  let asc = Math.atan2(y, x) * R2D;
  // atan2 is in [-180,180]; shift to [0,360] then add 180° for ecliptic
  asc = normalize(asc + 180);
  return asc;
};

/**
 * All planetary tropical longitudes + speeds (deg/day).
 */
export const getPlanetaryPositionsTropicalWithSpeed = (
  date: Date
): Record<string, { lon: number; speed: number }> => {
  const time = MakeTime(date);
  const timePrev = time.AddDays(-1 / 1440); // 1 minute earlier

  const results: Record<string, { lon: number; speed: number }> = {};

  const planets = ["Sun", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"];
  planets.forEach((p) => {
    const lon = getTropicalLon(p, time);
    const prevLon = getTropicalLon(p, timePrev);
    let diff = lon - prevLon;
    if (diff < -180) diff += 360;
    if (diff > 180) diff -= 360;
    results[p] = { lon, speed: diff * 1440 }; // deg/day
  });

  // Moon – use dedicated high-precision function
  const moonLon = getMoonTropicalLon(time);
  const moonPrevLon = getMoonTropicalLon(timePrev);
  let moonDiff = moonLon - moonPrevLon;
  if (moonDiff < -180) moonDiff += 360;
  if (moonDiff > 180) moonDiff -= 360;
  results["Moon"] = { lon: moonLon, speed: moonDiff * 1440 };

  // Rahu / Ketu (Mean Node)
  const node = getMeanNode(time);
  const prevNode = getMeanNode(timePrev);
  let nodeDiff = node - prevNode;
  if (nodeDiff < -180) nodeDiff += 360;
  if (nodeDiff > 180) nodeDiff -= 360;
  results["Rahu"] = { lon: node, speed: nodeDiff * 1440 };
  results["Ketu"] = { lon: normalize(node + 180), speed: nodeDiff * 1440 };

  return results;
};

export const getPlanetaryPositionsTropical = (date: Date): Record<string, number> => {
  const full = getPlanetaryPositionsTropicalWithSpeed(date);
  const results: Record<string, number> = {};
  Object.entries(full).forEach(([k, v]) => (results[k] = v.lon));
  return results;
};
