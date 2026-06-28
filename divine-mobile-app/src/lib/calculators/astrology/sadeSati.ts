import { getSiderealMoonLongitude } from "../../panchang/astroEngine";

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;

const normalizeAngle = (deg: number): number => {
    let angle = deg % 360;
    if (angle < 0) angle += 360;
    return angle;
};

const getJulianDay = (date: Date): number => {
    return (date.getTime() / 86400000) + 2440587.5;
};

// Low-precision Keplerian positions for planets (Meeus Ch 31)
// Used to find Saturn's sign entry/exit dates within ~24h accuracy.
const getSaturnHeliocentric = (T: number) => {
    const L = normalizeAngle(50.0774443 + 1222.1137943 * T);
    const a = 9.554909192;
    const e = 0.05550825 - 0.00034681 * T;
    const i = 2.4888787 - 0.0037362 * T;
    const Omega = 113.6655025 + 1.0229089 * T;
    const pi = 92.8613606 + 1.9637613 * T;
    const M = normalizeAngle(L - pi);

    // Solve Kepler's equation (Approx for low e)
    let E = M + R2D * e * Math.sin(M * D2R) * (1 + e * Math.cos(M * D2R));

    // Refine once
    E = E - (E - R2D * e * Math.sin(E * D2R) - M) / (1 - e * Math.cos(E * D2R));

    const x = a * (Math.cos(E * D2R) - e);
    const y = a * Math.sqrt(1 - e * e) * Math.sin(E * D2R);

    const r = Math.sqrt(x * x + y * y);
    const v = R2D * Math.atan2(y, x);

    const lon = normalizeAngle(v + pi);

    // Convert to heliocentric ecliptic rectangular coordinates
    const cosI = Math.cos(i * D2R);
    const sinI = Math.sin(i * D2R);
    const cosOmega = Math.cos(Omega * D2R);
    const sinOmega = Math.sin(Omega * D2R);
    const sinLOmega = Math.sin((lon - Omega) * D2R);
    const cosLOmega = Math.cos((lon - Omega) * D2R);

    const X = r * (cosOmega * cosLOmega - sinOmega * sinLOmega * cosI);
    const Y = r * (sinOmega * cosLOmega + cosOmega * sinLOmega * cosI);
    const Z = r * (sinLOmega * sinI);

    return { X, Y, Z };
};

const getEarthHeliocentric = (T: number) => {
    const L = normalizeAngle(100.4664485 + 35999.3728519 * T);
    const a = 1.000001018;
    const e = 0.01670863 - 0.000042037 * T;
    const i = 0.00005; // Approx 0
    const Omega = 0; // Relative
    const pi = 102.9373481 + 0.3232736 * T;
    const M = normalizeAngle(L - pi);

    let E = M + R2D * e * Math.sin(M * D2R);
    const x = a * (Math.cos(E * D2R) - e);
    const y = a * Math.sqrt(1 - e * e) * Math.sin(E * D2R);

    const r = Math.sqrt(x * x + y * y);
    const v = R2D * Math.atan2(y, x);
    const lon = normalizeAngle(v + pi);

    const X = r * Math.cos(lon * D2R);
    const Y = r * Math.sin(lon * D2R);
    const Z = 0;

    return { X, Y, Z };
};

export const getSiderealSaturnLongitude = (date: Date): number => {
    const JD = getJulianDay(date);
    const T = (JD - 2451545.0) / 36525;

    const sat = getSaturnHeliocentric(T);
    const earth = getEarthHeliocentric(T);

    const dx = sat.X - earth.X;
    const dy = sat.Y - earth.Y;
    const dz = sat.Z - earth.Z;

    const tropicalLon = normalizeAngle(R2D * Math.atan2(dy, dx));

    // Lahiri Ayanamsha
    const ayanamsha = 23.85708 + (1.39688 * T);
    return normalizeAngle(tropicalLon - ayanamsha);
};

export const getMoonRashi = (date: Date): number => {
    const lon = getSiderealMoonLongitude(date);
    return Math.floor(lon / 30);
};

export const RASHI_NAMES = [
    "Mesha (Aries)", "Vrishabha (Taurus)", "Mithuna (Gemini)", "Karka (Cancer)",
    "Simha (Leo)", "Kanya (Virgo)", "Tula (Libra)", "Vrishchika (Scorpio)",
    "Dhanu (Sagittarius)", "Makara (Capricorn)", "Kumbha (Aquarius)", "Meena (Pisces)"
];

export interface SadeSatiPhase {
    name: string;
    signIndex: number;
    startDate: Date;
    endDate: Date;
    status: 'Completed' | 'Current' | 'Upcoming';
    meaning: string;
}

const PHASE_MEANINGS = [
    "Rising Phase (12th House): Mental stress, financial pressure, and new challenges. Focus on discipline and planning.",
    "Peak Phase (Janma Rashi): High pressure, transformation, and testing of character. Restructuring of life priorities.",
    "Setting Phase (2nd House): Financial recovery, family matters, and gradual relief from previous burdens."
];

export const getSadeSatiPhases = (dob: Date): SadeSatiPhase[] => {
    const moonRashi = getMoonRashi(dob);
    const targetRashiStart = (moonRashi - 1 + 12) % 12;
    const targetRashiEnd = (moonRashi + 1) % 12;

    const now = new Date();
    const phases: SadeSatiPhase[] = [];

    // Saturn takes ~2.5 years per sign. We search for periods throughout life (100 years).
    // Strategy: Step by 3 months to find transitions, then binary search for exact dates.
    let checkTime = new Date(dob);
    const endLimit = new Date(dob.getTime() + 100 * 365.25 * 24 * 3600 * 1000);

    const stepMonths = 3;

    while (checkTime < endLimit) {
        const lon = getSiderealSaturnLongitude(checkTime);
        const rashi = Math.floor(lon / 30);

        if (rashi === targetRashiStart) {
            // Found start of a Sade Sati cycle
            // Binary search for exact entry into targetRashiStart
            const cycleStart = findSignTransition(checkTime, -stepMonths, targetRashiStart);

            // Now find when it exits targetRashiStart (Phase 1 end)
            const p1End = findSignTransition(cycleStart, stepMonths * 12, (targetRashiStart + 1) % 12);

            // Phase 2 end (Exits Moon Rashi)
            const p2End = findSignTransition(p1End, stepMonths * 12, (moonRashi + 1) % 12);

            // Phase 3 end (Exits 2nd house)
            const p3End = findSignTransition(p2End, stepMonths * 12, (targetRashiEnd + 1) % 12);

            const status = (start: Date, end: Date) => {
                if (now < start) return 'Upcoming';
                if (now > end) return 'Completed';
                return 'Current';
            };

            phases.push({
                name: "Phase 1: Rising",
                signIndex: targetRashiStart,
                startDate: cycleStart,
                endDate: p1End,
                status: status(cycleStart, p1End),
                meaning: PHASE_MEANINGS[0]
            });

            phases.push({
                name: "Phase 2: Peak",
                signIndex: moonRashi,
                startDate: p1End,
                endDate: p2End,
                status: status(p1End, p2End),
                meaning: PHASE_MEANINGS[1]
            });

            phases.push({
                name: "Phase 3: Setting",
                signIndex: targetRashiEnd,
                startDate: p2End,
                endDate: p3End,
                status: status(p2End, p3End),
                meaning: PHASE_MEANINGS[2]
            });

            // Jump past this cycle to find the next one (Saturn orbits in ~29.5 years)
            checkTime = new Date(p3End.getTime() + 20 * 365.25 * 24 * 3600 * 1000);
        } else {
            checkTime = new Date(checkTime.getTime() + stepMonths * 30 * 24 * 3600 * 1000);
        }
    }

    return phases;
};

const findSignTransition = (baseDate: Date, monthsDirection: number, targetRashi: number): Date => {
    // Coarse step find
    const stepDays = 10;
    let current = new Date(baseDate);
    const dir = monthsDirection > 0 ? 1 : -1;
    const maxDays = Math.abs(monthsDirection) * 40;

    for (let i = 0; i < maxDays / stepDays; i++) {
        const next = new Date(current.getTime() + dir * stepDays * 24 * 3600 * 1000);
        const rashi = Math.floor(getSiderealSaturnLongitude(next) / 30);
        if (monthsDirection > 0 ? (rashi === targetRashi) : (rashi !== targetRashi)) {
            // Refine with binary search in this 10 day window
            let low = monthsDirection > 0 ? current.getTime() : next.getTime();
            let high = monthsDirection > 0 ? next.getTime() : current.getTime();

            for (let j = 0; j < 10; j++) {
                const mid = (low + high) / 2;
                const midRashi = Math.floor(getSiderealSaturnLongitude(new Date(mid)) / 30);
                if (midRashi === targetRashi) {
                    high = mid;
                } else {
                    low = mid;
                }
            }
            return new Date(high);
        }
        current = next;
    }
    return current;
};

export const getCurrentSadeSatiStatus = (phases: SadeSatiPhase[]) => {
    const current = phases.find(p => p.status === 'Current');
    if (current) return { status: 'Currently running', details: current };

    const upcoming = phases.find(p => p.status === 'Upcoming');
    if (upcoming) return { status: 'Upcoming', details: upcoming };

    const allCompleted = phases.length > 0 && phases.every(p => p.status === 'Completed');
    if (allCompleted) return { status: 'Completed previously', details: phases[phases.length - 1] };

    return { status: 'Not started', details: null };
};
