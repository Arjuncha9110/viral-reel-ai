import { SearchAltitude, Body, Observer, AstroTime } from "astronomy-engine";
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
    let localMidnightUTC = date.getTime();
    for (let i = -24; i < 24; i++) {
        const test = new Date(date.getTime() + i * 3600 * 1000);
        const lParts = new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: 'numeric', hour12: false }).formatToParts(test);
        const hour = lParts.find(p => p.type === 'hour')!.value;
        if (hour === "24" || hour === "00" || hour === "0") {
            test.setMinutes(0, 0, 0);
            localMidnightUTC = test.getTime();
            break;
        }
    }

    const startOfDay = new Date(localMidnightUTC);
    const observer = new Observer(lat, lon, 0);

    let todaySunriseDate = SearchAltitude(Body.Sun, observer, +1, new AstroTime(startOfDay), 1, 0)?.date;
    let todaySunsetDate = SearchAltitude(Body.Sun, observer, -1, new AstroTime(startOfDay), 1, 0)?.date;

    if (!todaySunriseDate) todaySunriseDate = new Date(localMidnightUTC + 6 * 3600000);
    if (!todaySunsetDate) todaySunsetDate = new Date(localMidnightUTC + 18 * 3600000);

    const getLocalDecimalHours = (d: Date) => {
        const parts = new Intl.DateTimeFormat("en-US", { timeZone: timezone, hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false }).formatToParts(d);
        let h = parseInt(parts.find(p => p.type === 'hour')!.value);
        if (h === 24) h = 0;
        const m = parseInt(parts.find(p => p.type === 'minute')!.value);
        const s = parseInt(parts.find(p => p.type === 'second')!.value);
        return h + m/60 + s/3600;
    };

    const sunriseHoursRaw = getLocalDecimalHours(todaySunriseDate);
    const sunsetHoursRaw = getLocalDecimalHours(todaySunsetDate);

    // Provide the start of the panchang day approx. at sunrise
    const startOfPanchangDay = todaySunriseDate;
    const endOfPanchangDay = new Date(startOfPanchangDay.getTime() + 24 * 3600 * 1000);

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

    const sunriseHours = sunriseHoursRaw;
    let sunsetHours = sunsetHoursRaw;
    if (sunsetHours < sunriseHours) sunsetHours += 24;

    const lunarDay = tithi[0].index;
    const moonriseOffset = lunarDay * 0.8;
    const moonrise = formatTime(sunriseHours + moonriseOffset, ((sunriseHours + moonriseOffset) % 1) * 60);
    const moonset = formatTime(sunsetHours + moonriseOffset, ((sunsetHours + moonriseOffset) % 1) * 60);

    const rahuKaal = calculateInauspiciousPeriod(rahuKaalSlots[dayIndex], sunriseHours, sunsetHours);
    const yamagandam = calculateInauspiciousPeriod(yamagandamSlots[dayIndex], sunriseHours, sunsetHours);
    const gulikaKaal = calculateInauspiciousPeriod(gulikaSlots[dayIndex], sunriseHours, sunsetHours);

    const middayHours = (sunriseHours + sunsetHours) / 2;
    const abhijitMuhurat = `${formatTime(middayHours - 0.4, ((middayHours - 0.4) % 1) * 60)} - ${formatTime(middayHours + 0.4, ((middayHours + 0.4) % 1) * 60)}`;
    const brahmaMuhurat = `${formatTime(sunriseHours - 1.6, ((sunriseHours - 1.6) % 1) * 60)} - ${formatTime(sunriseHours - 0.8, ((sunriseHours - 0.8) % 1) * 60)}`;
    const vijayaMuhurat = `${formatTime(middayHours + 1.5, ((middayHours + 1.5) % 1) * 60)} - ${formatTime(middayHours + 2.22, ((middayHours + 2.22) % 1) * 60)}`;

    const hora = calculateHora(startOfPanchangDay, sunriseHours, sunsetHours);

    return {
        date: startOfPanchangDay.toLocaleDateString('en-IN', { timeZone: timezone, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
        day: days[dayIndex],
        tithi,
        nakshatra,
        yoga,
        karana,
        sunrise: formatTime(sunriseHours, (sunriseHours % 1) * 60),
        sunset: formatTime(sunsetHours, (sunsetHours % 1) * 60),
        moonrise,
        moonset,
        rahuKaal,
        yamagandam,
        gulikaKaal,
        abhijitMuhurat,
        auspiciousTimings: [
            `Brahma Muhurta: ${brahmaMuhurat}`,
            `Abhijit Muhurta: ${abhijitMuhurat}`,
            `Vijaya Muhurta: ${vijayaMuhurat}`
        ],
        inauspiciousTimings: [
            `Rahu Kaal: ${rahuKaal}`,
            `Yamagandam: ${yamagandam}`,
            `Gulika Kaal: ${gulikaKaal}`
        ],
        hora
    };
};
