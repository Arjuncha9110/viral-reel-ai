export interface HoraPeriod {
    planet: string;
    symbol: string;
    startTime: string;
    endTime: string;
    isDay: boolean;
}

export interface PanchangSegment {
    name: string;
    endTime: string;
    index: number;
    startTime?: string;
    paksha?: string;
    lord?: string;
    pada?: number;
    spansNextDay?: boolean;
}

export interface PanchangData {
    date: string;
    day: string;
    tithi: PanchangSegment[];
    nakshatra: PanchangSegment[];
    yoga: PanchangSegment[];
    karana: PanchangSegment[];
    sunrise: string;
    sunset: string;
    moonrise: string;
    moonset: string;
    rahuKaal: string;
    yamagandam: string;
    gulikaKaal: string;
    abhijitMuhurat: string;
    auspiciousTimings: string[];
    inauspiciousTimings: string[];
    hora: HoraPeriod[];
}

// ... unchanged ...
export const horaSequence = [
    { name: "Sun", symbol: "☉" },
    { name: "Venus", symbol: "♀" },
    { name: "Mercury", symbol: "☿" },
    { name: "Moon", symbol: "☽" },
    { name: "Saturn", symbol: "♄" },
    { name: "Jupiter", symbol: "♃" },
    { name: "Mars", symbol: "♂" }
];

export const dayLords = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];

export const rahuKaalSlots: Record<number, number> = {
    0: 8, 1: 2, 2: 7, 3: 5, 4: 6, 5: 4, 6: 3
};

export const yamagandamSlots: Record<number, number> = {
    0: 5, 1: 4, 2: 3, 3: 2, 4: 1, 5: 7, 6: 6
};

export const gulikaSlots: Record<number, number> = {
    0: 7, 1: 6, 2: 5, 3: 4, 4: 3, 5: 2, 6: 1
};

export const locations = [
    { city: "Mumbai", state: "Maharashtra", timezone: "Asia/Kolkata", lat: 19.076, lng: 72.877 },
    { city: "Delhi", state: "Delhi", timezone: "Asia/Kolkata", lat: 28.644, lng: 77.216 },
    { city: "Bangalore", state: "Karnataka", timezone: "Asia/Kolkata", lat: 12.971, lng: 77.594 },
    { city: "Chennai", state: "Tamil Nadu", timezone: "Asia/Kolkata", lat: 13.082, lng: 80.270 },
    { city: "Kolkata", state: "West Bengal", timezone: "Asia/Kolkata", lat: 22.572, lng: 88.363 },
    { city: "Hyderabad", state: "Telangana", timezone: "Asia/Kolkata", lat: 17.385, lng: 78.486 },
    { city: "Ahmedabad", state: "Gujarat", timezone: "Asia/Kolkata", lat: 23.022, lng: 72.571 },
    { city: "Pune", state: "Maharashtra", timezone: "Asia/Kolkata", lat: 18.520, lng: 73.856 },
    { city: "Jaipur", state: "Rajasthan", timezone: "Asia/Kolkata", lat: 26.912, lng: 75.787 },
    { city: "Varanasi", state: "Uttar Pradesh", timezone: "Asia/Kolkata", lat: 25.317, lng: 82.987 },
    { city: "Lucknow", state: "Uttar Pradesh", timezone: "Asia/Kolkata", lat: 26.846, lng: 80.946 },
    { city: "Ujjain", state: "Madhya Pradesh", timezone: "Asia/Kolkata", lat: 23.179, lng: 75.784 },
];
