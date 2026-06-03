import {
    PanchangData,
    PanchangSegment,
    HoraPeriod,
    dayLords,
    horaSequence,
    rahuKaalSlots,
    yamagandamSlots,
    gulikaSlots
} from "../../data/panchang";
import {
    getSiderealMoonLongitude,
    getNakshatraData,
    getTithiData,
    getYogaData,
    getKaranaData,
    findSegmentEnd
} from "../../panchang/astroEngine";

const formatTime = (hours: number, minutes: number): string => {
    const h = Math.floor(hours);
    const m = Math.round(minutes);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h > 12 ? h - 12 : (h === 0 ? 12 : h);
    return `${displayHour.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')} ${period}`;
};

const calculateHora = (date: Date, sunriseHours: number, sunsetHours: number): HoraPeriod[] => {
    const dayOfWeek = date.getDay();
    const dayLordName = dayLords[dayOfWeek];
    const startIndex = horaSequence.findIndex(h => h.name === dayLordName);

    const dayDuration = sunsetHours - sunriseHours;
    const nightDuration = 24 - dayDuration;
    const dayHoraDuration = dayDuration / 12;
    const nightHoraDuration = nightDuration / 12;

    const horas: HoraPeriod[] = [];

    // 12 day horas (sunrise to sunset)
    for (let i = 0; i < 12; i++) {
        const planetIndex = (startIndex + i) % 7;
        const planet = horaSequence[planetIndex];
        const startHours = sunriseHours + (i * dayHoraDuration);
        const endHours = sunriseHours + ((i + 1) * dayHoraDuration);

        horas.push({
            planet: planet.name,
            symbol: planet.symbol,
            startTime: formatTime(startHours, (startHours % 1) * 60),
            endTime: formatTime(endHours, (endHours % 1) * 60),
            isDay: true
        });
    }

    // 12 night horas (sunset to next sunrise)
    for (let i = 0; i < 12; i++) {
        const planetIndex = (startIndex + 12 + i) % 7;
        const planet = horaSequence[planetIndex];
        let startHours = sunsetHours + (i * nightHoraDuration);
        let endHours = sunsetHours + ((i + 1) * nightHoraDuration);

        if (startHours >= 24) startHours -= 24;
        if (endHours >= 24) endHours -= 24;

        horas.push({
            planet: planet.name,
            symbol: planet.symbol,
            startTime: formatTime(startHours, (startHours % 1) * 60),
            endTime: formatTime(endHours, (endHours % 1) * 60),
            isDay: false
        });
    }

    return horas;
};

const calculateInauspiciousPeriod = (slot: number, sunriseHours: number, sunsetHours: number): string => {
    const dayDuration = sunsetHours - sunriseHours;
    const periodDuration = dayDuration / 8;

    const startHours = sunriseHours + ((slot - 1) * periodDuration);
    const endHours = startHours + periodDuration;

    return `${formatTime(startHours, (startHours % 1) * 60)} - ${formatTime(endHours, (endHours % 1) * 60)}`;
};

export const getSamplePanchangData = (
    date: Date,
    lat: number = 12.9716,
    lon: number = 77.5946,
    timezone: string = "Asia/Kolkata"
): PanchangData => {
    // 1. Calculate boundaries in the target timezone
    // Get year/month/day of selected date in target timezone
    const dtFormatter = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        year: 'numeric', month: '2-digit', day: '2-digit'
    });
    const parts = dtFormatter.formatToParts(date);
    const y = parts.find(p => p.type === 'year')!.value;
    const m = parts.find(p => p.type === 'month')!.value;
    const d = parts.find(p => p.type === 'day')!.value;

    // Identifying the 06:00 AM local moment in UTC
    let startOfPanchangDayUTC = date.getTime();
    for (let i = -24; i < 24; i++) {
        const test = new Date(date.getTime() + i * 3600 * 1000);
        const lParts = new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: 'numeric', hour12: false }).formatToParts(test);
        const hour = lParts.find(p => p.type === 'hour')!.value;
        if (hour === "6" || hour === "06") {
            test.setMinutes(0, 0, 0);
            startOfPanchangDayUTC = test.getTime();
            break;
        }
    }

    const startOfPanchangDay = new Date(startOfPanchangDayUTC);
    const endOfPanchangDay = new Date(startOfPanchangDayUTC + 24 * 3600 * 1000);

    const timeFormatter = new Intl.DateTimeFormat("en-IN", {
        timeZone: timezone,
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
    });

    const formatDate = (d: Date): string => {
        return timeFormatter.format(d).toLowerCase();
    };

    const isCalendarNextDay = (testDate: Date): boolean => {
        const dStr = testDate.toLocaleDateString("en-US", { timeZone: timezone });
        const startStr = startOfPanchangDay.toLocaleDateString("en-US", { timeZone: timezone });
        return dStr !== startStr;
    };

    const isPastEndOfPanchangDay = (testDate: Date): boolean => {
        return testDate.getTime() >= endOfPanchangDay.getTime();
    };

    const formatSegmentEnd = (end: Date): string => {
        const timeStr = formatDate(end);
        if (isCalendarNextDay(end)) {
            return `${timeStr} (next day)`;
        }
        return timeStr;
    };

    const getIntervals = (getter: (d: Date) => any): PanchangSegment[] => {
        const segments: PanchangSegment[] = [];
        const firstData = getter(startOfPanchangDay);
        const firstEnd = findSegmentEnd(startOfPanchangDay, getter);

        segments.push({
            ...firstData,
            endTime: formatSegmentEnd(firstEnd),
            spansNextDay: isCalendarNextDay(firstEnd)
        });

        if (!isPastEndOfPanchangDay(firstEnd)) {
            const nextStart = new Date(firstEnd.getTime() + 10000);
            const nextData = getter(nextStart);
            const nextEnd = findSegmentEnd(nextStart, getter);

            segments.push({
                ...nextData,
                endTime: formatSegmentEnd(nextEnd),
                spansNextDay: isCalendarNextDay(nextEnd)
            });
        }
        return segments;
    };

    const tithi = getIntervals((d) => {
        const data = getTithiData(d);
        return { name: data.name, paksha: data.paksha, index: data.index, targetLon: data.targetLon };
    });

    const nakshatra = getIntervals((d) => {
        const lon = getSiderealMoonLongitude(d);
        const data = getNakshatraData(lon);
        return { name: data.name, lord: data.lord, pada: data.pada, index: data.index, targetLon: data.targetLon };
    });

    const yoga = getIntervals((d) => {
        const data = getYogaData(d);
        return { name: data.name, index: data.index, targetLon: data.targetLon };
    });

    const karana = getIntervals((d) => {
        const data = getKaranaData(d);
        return { name: data.name, index: data.index, targetLon: data.targetLon };
    });

    // Daily Metadata
    const dayIndex = startOfPanchangDay.getDay();
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

    const sunriseHours = 6.0;
    const sunsetHours = 18.2;

    // Formatting helpers for sub-components using the local start date as baseline
    const formatH = (h: number) => {
        const d = new Date(startOfPanchangDayUTC);
        const hoursToAdd = h - 6;
        const result = new Date(d.getTime() + hoursToAdd * 3600 * 1000);
        return formatDate(result);
    };

    const sunrise = formatH(6.0);
    const sunset = formatH(18.2);

    const lunarDay = tithi[0].index;
    const moonriseOffset = lunarDay * 0.8;
    const moonrise = formatH((18.2 + moonriseOffset));
    const moonset = formatH((6.0 + moonriseOffset));

    const rahuKaal = calculateInauspiciousPeriod(rahuKaalSlots[dayIndex], sunriseHours, sunsetHours);
    const yamagandam = calculateInauspiciousPeriod(yamagandamSlots[dayIndex], sunriseHours, sunsetHours);
    const gulikaKaal = calculateInauspiciousPeriod(gulikaSlots[dayIndex], sunriseHours, sunsetHours);

    const middayHours = (sunriseHours + sunsetHours) / 2;
    const abhijitMuhurat = `${formatH(middayHours - 0.4)} - ${formatH(middayHours + 0.4)}`;
    const brahmaMuhurat = `${formatH(sunriseHours - 1.6)} - ${formatH(sunriseHours - 0.8)}`;

    const hora = calculateHora(startOfPanchangDay, sunriseHours, sunsetHours);

    return {
        date: startOfPanchangDay.toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        day: days[dayIndex],
        tithi,
        nakshatra,
        yoga,
        karana,
        sunrise,
        sunset,
        moonrise,
        moonset,
        rahuKaal,
        yamagandam,
        gulikaKaal,
        abhijitMuhurat,
        auspiciousTimings: [
            `Brahma Muhurta: ${brahmaMuhurat}`,
            `Abhijit Muhurta: ${abhijitMuhurat}`,
            `Vijaya Muhurta: ${formatH(middayHours + 1.5)} - ${formatH(middayHours + 2.22)}`
        ],
        inauspiciousTimings: [
            `Rahu Kaal: ${rahuKaal}`,
            `Yamagandam: ${yamagandam}`,
            `Gulika Kaal: ${gulikaKaal}`
        ],
        hora
    };
};
