import { SearchRiseSet, Observer, Body, MakeTime } from "../../astro/astronomy-core";
import { getSunriseSunset } from "../../panchang/astroEngine";

export type ChoghadiyaName = "Udveg" | "Char" | "Labh" | "Amrit" | "Kaal" | "Shubh" | "Rog";
export type ChoghadiyaStatus = "favorable" | "neutral" | "avoid";

export interface ChoghadiyaSegment {
    name: ChoghadiyaName;
    status: ChoghadiyaStatus;
    startTime: Date;
    endTime: Date;
    isDay: boolean;
    meaning: string;
}

export interface DailyChoghadiya {
    date: Date;
    sunrise: Date;
    sunset: Date;
    nextSunrise: Date;
    daySegments: ChoghadiyaSegment[];
    nightSegments: ChoghadiyaSegment[];
}

const CHOGHADIYA_SEQUENCE: ChoghadiyaName[] = ["Udveg", "Char", "Labh", "Amrit", "Kaal", "Shubh", "Rog"];

const DAY_START_INDEX = [0, 3, 6, 2, 5, 1, 4]; // Sun, Mon, Tue, Wed, Thu, Fri, Sat
const NIGHT_START_INDEX = [5, 1, 4, 0, 3, 6, 2];

const getStatus = (name: ChoghadiyaName): ChoghadiyaStatus => {
    switch (name) {
        case "Amrit":
        case "Shubh":
        case "Labh":
            return "favorable";
        case "Char":
            return "neutral";
        case "Rog":
        case "Kaal":
        case "Udveg":
            return "avoid";
    }
};

const getMeaning = (name: ChoghadiyaName): string => {
    switch (name) {
        case "Amrit": return "Nectar - Highly auspicious for all works";
        case "Shubh": return "Auspicious - Good for ceremonies and wealth";
        case "Labh": return "Gain - Favorable for starting a business or learning";
        case "Char": return "Variable - Neutral, workable for movement, travel, communication, and routine starts";
        case "Rog": return "Disease - Inauspicious, avoid medical treatments or new starts";
        case "Kaal": return "Death - Inauspicious, strictly avoid for new beginnings";
        case "Udveg": return "Anxiety - Inauspicious, causes distress and obstacles";
    }
};

/**
 * We use getSunriseSunset from astroEngine to ensure timezone-accurate LMT anchoring.
 */

export const calculateChoghadiya = (date: Date, lat: number, lon: number): DailyChoghadiya => {
    const { sunrise, sunset, nextSunrise } = getSunriseSunset(date, lat, lon);
    const dayOfWeek = sunrise.getDay(); // Use sunrise day

    const dayDurationMs = sunset.getTime() - sunrise.getTime();
    const daySegmentDuration = dayDurationMs / 8;

    const nightDurationMs = nextSunrise.getTime() - sunset.getTime();
    const nightSegmentDuration = nightDurationMs / 8;

    const daySegments: ChoghadiyaSegment[] = [];
    let currentDayIndex = DAY_START_INDEX[dayOfWeek];

    for (let i = 0; i < 8; i++) {
        const name = CHOGHADIYA_SEQUENCE[currentDayIndex];
        const startTime = new Date(sunrise.getTime() + i * daySegmentDuration);
        const endTime = new Date(sunrise.getTime() + (i + 1) * daySegmentDuration);
        
        daySegments.push({
            name,
            status: getStatus(name),
            startTime,
            endTime,
            isDay: true,
            meaning: getMeaning(name)
        });

        currentDayIndex = (currentDayIndex + 1) % 7;
    }

    const nightSegments: ChoghadiyaSegment[] = [];
    let currentNightIndex = NIGHT_START_INDEX[dayOfWeek];

    for (let i = 0; i < 8; i++) {
        const name = CHOGHADIYA_SEQUENCE[currentNightIndex];
        const startTime = new Date(sunset.getTime() + i * nightSegmentDuration);
        const endTime = new Date(sunset.getTime() + (i + 1) * nightSegmentDuration);
        
        nightSegments.push({
            name,
            status: getStatus(name),
            startTime,
            endTime,
            isDay: false,
            meaning: getMeaning(name)
        });

        currentNightIndex = (currentNightIndex + 1) % 7;
    }

    return {
        date,
        sunrise,
        sunset,
        nextSunrise,
        daySegments,
        nightSegments
    };
};

export const getActiveChoghadiya = (segments: ChoghadiyaSegment[], now: Date): ChoghadiyaSegment | null => {
    const nowTime = now.getTime();
    return segments.find(s => nowTime >= s.startTime.getTime() && nowTime < s.endTime.getTime()) || null;
};
