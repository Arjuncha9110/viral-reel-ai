/**
 * High Precision Moon Position Calculation
 * Based on Jean Meeus "Astronomical Algorithms", Chapter 47 (Moon)
 * Uses truncated ELP-2000/82 theory.
 * Accuracy: ~10 arcseconds (0.003 degrees) or better with these terms.
 */

const normalizeAngle = (deg: number): number => {
    let angle = deg % 360;
    if (angle < 0) angle += 360;
    return angle;
};

const D2R = Math.PI / 180;
const R2D = 180 / Math.PI;

export const getTropicalMoonLongitude = (date: Date): number => {
    // Julian Day
    const time = date.getTime();
    const JD = (time / 86400000) + 2440587.5;
    const T = (JD - 2451545.0) / 36525;

    // Mean arguments (degrees)
    const L_prime = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T + T * T * T / 538841;
    const D = 297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + T * T * T / 545868;
    const M = 357.5291092 + 35999.0502909 * T - 0.0001536 * T * T + T * T * T / 24490000; // Sun Mean Anomaly
    const M_prime = 134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + T * T * T / 69699; // Moon Mean Anomaly
    const F = 93.2720950 + 483202.0175233 * T - 0.0036539 * T * T + T * T * T / 3526000; // Argument of Latitude

    // Periodic terms for Longitude (Sum of Sigma_l)
    // Arguments: D, M, M', F
    // Coeff: 1/1,000,000 degrees

    // We use the largest ~30 terms for < 0.01 deg accuracy.
    // Ideally ~60 terms.

    // Multipliers of arguments [D, M, M', F]
    // See Meeus Table 47.A
    const terms = [
        [0, 0, 1, 0, 6288774],
        [2, 0, -1, 0, 1274027],
        [2, 0, 0, 0, 658314],
        [0, 0, 2, 0, 213618],
        [0, 1, 0, 0, -185116],
        [0, 0, 0, 2, -114332],
        [2, 0, -2, 0, 58793],
        [2, -1, -1, 0, 57066],
        [2, 0, 1, 0, 53322],
        [2, -1, 0, 0, 45758],
        [0, 1, -1, 0, -40923],
        [1, 0, 0, 0, -34720],
        [0, 1, 1, 0, -30383],
        [2, 0, -1, 2, 15327],
        [2, 0, 0, 2, -12528],
        [0, 0, 1, 2, 10980],
        [0, 0, 1, -2, 10675],
        [4, 0, -1, 0, 10034],
        [0, 0, 3, 0, 8548],
        [4, 0, -2, 0, -7888],
        [2, 1, -1, 0, -6766],
        [2, 1, 0, 0, -5163],
        [1, 0, -1, 0, 4987],
        [1, 1, 0, 0, 4036],
        [2, -1, 1, 0, 3994],
        [2, 0, 2, 0, 3861],
        [4, 0, 0, 0, 3665],
        [2, -1, -2, 0, -2689],
        [1, 0, 1, 0, -2602],
        [1, 1, -1, 0, 2390],
        [1, 1, 1, 0, -2348],
        [3, 0, -1, 0, 2236],
        [4, 0, -3, 0, -2120],
        [2, 0, 0, -2, -2069],
        [2, 0, -1, -2, 2048],
        [2, 0, -3, 0, -1773],
        [0, 1, -2, 0, -1595],
        [2, 1, 1, 0, 1215],
        [2, -2, 0, 0, -1110],
        [2, 1, -2, 0, -892],
        [2, -2, -1, 0, -810],
        [2, 0, 1, 2, 759],
        [2, 0, -2, 2, -713],
        [0, 1, 2, 0, -700],
        [4, 0, 1, 0, 691],
        [2, 0, 4, 0, 596],
        [0, 0, 2, 2, 549],
        [0, 0, 2, -2, 537],
        [1, 0, -2, 0, 520],
        [4, 0, -4, 0, -487],
        [0, 1, 0, 2, -399],
        [4, -1, -1, 0, -381],
        [0, 1, 0, -2, 351]
    ];

    let sumLon = 0;

    // Cache angles to avoid recalc? Optimizing in loop is better.
    // Angles to radians
    for (const [d_coef, m_coef, mp_coef, f_coef, amplitude] of terms) {
        let arg = 0;
        if (d_coef) arg += d_coef * D;
        if (m_coef) arg += m_coef * M;
        if (mp_coef) arg += mp_coef * M_prime;
        if (f_coef) arg += f_coef * F;

        // Sine
        sumLon += amplitude * Math.sin(arg * D2R);
    }

    // Add Planetary perturbations (approx ~0.001 deg) - Omitted for now.

    // Add Nutation? 
    // Meeus calc usually gives geometric longitude referred to mean equinox of date.
    // If we want True longitude (apparent), we need nutation.
    // Sidereal = True Tropical - True Ayanamsha 
    // OR Sidereal = Mean Tropical - Mean Ayanamsha + correction?
    // Standard Lahiri formula gives Mean Ayanamsha from Mean Equinox J2000.
    // So we should compare Mean Tropical.
    // However, DrikPanchang might use True.
    // Nutation is ~17 arcsec.
    // Let's stick to Mean output from this series (L_prime + sumLon).

    const longitude = L_prime + (sumLon / 1000000);

    // Add A1 (Venus term) + A2 (Jupiter)
    // A1 = 119.75 + 131.849 T
    // Term: +3958 * sin(A1)

    const A1 = 119.75 + 131.849 * T;
    const A2 = 53.09 + 479264.290 * T;

    let extra = 0;
    extra += 3958 * Math.sin(A1 * D2R);
    extra += 1962 * Math.sin((L_prime - F) * D2R);
    extra += 318 * Math.sin((A2) * D2R);

    return normalizeAngle(longitude + (extra / 1000000));
};
