// Illustrative Panchang generator - replace with a real astronomical or API-backed engine before claiming accuracy

export interface HoraPeriod {
  planet: string;
  symbol: string;
  startTime: string;
  endTime: string;
  isDay: boolean;
}

export interface PanchangData {
  date: string;
  day: string;
  tithi: {
    name: string;
    endTime: string;
    paksha: string;
    tithiNumber: number;
  };
  nakshatra: {
    name: string;
    endTime: string;
    lord: string;
    pada: number;
  };
  yoga: {
    name: string;
    endTime: string;
  };
  karana: {
    name: string;
    endTime: string;
  };
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

// Hora sequence for each day (starting from sunrise)
// Sunday=Sun, Monday=Moon, Tuesday=Mars, Wednesday=Mercury, Thursday=Jupiter, Friday=Venus, Saturday=Saturn
const horaSequence = [
  { name: "Sun", symbol: "☉" },
  { name: "Venus", symbol: "♀" },
  { name: "Mercury", symbol: "☿" },
  { name: "Moon", symbol: "☽" },
  { name: "Saturn", symbol: "♄" },
  { name: "Jupiter", symbol: "♃" },
  { name: "Mars", symbol: "♂" }
];

// Day lords in order (Sun=0, Mon=1, etc.)
const dayLords = ["Sun", "Moon", "Mars", "Mercury", "Jupiter", "Venus", "Saturn"];

// Rahu Kaal timings based on day (in 1.5-hour slots after sunrise)
const rahuKaalSlots: Record<number, number> = {
  0: 8, // Sunday - 8th period (4:30-6:00 PM approx)
  1: 2, // Monday - 2nd period (7:30-9:00 AM approx)
  2: 7, // Tuesday - 7th period (3:00-4:30 PM approx)
  3: 5, // Wednesday - 5th period (12:00-1:30 PM approx)
  4: 6, // Thursday - 6th period (1:30-3:00 PM approx)
  5: 4, // Friday - 4th period (10:30-12:00 PM approx)
  6: 3  // Saturday - 3rd period (9:00-10:30 AM approx)
};

// Yamagandam slots
const yamagandamSlots: Record<number, number> = {
  0: 5, // Sunday
  1: 4, // Monday
  2: 3, // Tuesday
  3: 2, // Wednesday
  4: 1, // Thursday
  5: 7, // Friday
  6: 6  // Saturday
};

// Gulika Kaal slots
const gulikaSlots: Record<number, number> = {
  0: 7, // Sunday
  1: 6, // Monday
  2: 5, // Tuesday
  3: 4, // Wednesday
  4: 3, // Thursday
  5: 2, // Friday
  6: 1  // Saturday
};

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

export const getSamplePanchangData = (date: Date): PanchangData => {
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const tithis = [
    "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami",
    "Shashthi", "Saptami", "Ashtami", "Navami", "Dashami",
    "Ekadashi", "Dwadashi", "Trayodashi", "Chaturdashi", "Purnima", "Amavasya"
  ];
  const nakshatras = [
    { name: "Ashwini", lord: "Ketu" },
    { name: "Bharani", lord: "Venus" },
    { name: "Krittika", lord: "Sun" },
    { name: "Rohini", lord: "Moon" },
    { name: "Mrigashira", lord: "Mars" },
    { name: "Ardra", lord: "Rahu" },
    { name: "Punarvasu", lord: "Jupiter" },
    { name: "Pushya", lord: "Saturn" },
    { name: "Ashlesha", lord: "Mercury" },
    { name: "Magha", lord: "Ketu" },
    { name: "Purva Phalguni", lord: "Venus" },
    { name: "Uttara Phalguni", lord: "Sun" },
    { name: "Hasta", lord: "Moon" },
    { name: "Chitra", lord: "Mars" },
    { name: "Swati", lord: "Rahu" },
    { name: "Vishakha", lord: "Jupiter" },
    { name: "Anuradha", lord: "Saturn" },
    { name: "Jyeshtha", lord: "Mercury" },
    { name: "Moola", lord: "Ketu" },
    { name: "Purva Ashadha", lord: "Venus" },
    { name: "Uttara Ashadha", lord: "Sun" },
    { name: "Shravana", lord: "Moon" },
    { name: "Dhanishtha", lord: "Mars" },
    { name: "Shatabhisha", lord: "Rahu" },
    { name: "Purva Bhadrapada", lord: "Jupiter" },
    { name: "Uttara Bhadrapada", lord: "Saturn" },
    { name: "Revati", lord: "Mercury" }
  ];
  const yogas = [
    "Vishkumbha", "Preeti", "Ayushman", "Saubhagya", "Shobhana",
    "Atiganda", "Sukarman", "Dhriti", "Shoola", "Ganda",
    "Vriddhi", "Dhruva", "Vyaghata", "Harshana", "Vajra",
    "Siddhi", "Vyatipata", "Variyan", "Parigha", "Shiva",
    "Siddha", "Sadhya", "Shubha", "Shukla", "Brahma",
    "Indra", "Vaidhriti"
  ];
  const karanas = [
    "Bava", "Balava", "Kaulava", "Taitila", "Gara",
    "Vanija", "Vishti", "Shakuni", "Chatushpada", "Naga", "Kimsthughna"
  ];

  const dayIndex = date.getDay();
  const dateNum = date.getDate();
  const monthNum = date.getMonth();
  const year = date.getFullYear();

  // Approximate tithi calculation based on a simple lunar cycle (~29.5 days)
  const baseDate = new Date(2024, 0, 11); // Known Amavasya date
  const daysSinceBase = Math.floor((date.getTime() - baseDate.getTime()) / (1000 * 60 * 60 * 24));
  const lunarDay = ((daysSinceBase % 30) + 30) % 30;
  const tithiIndex = lunarDay % 15;
  const paksha = lunarDay < 15 ? "Shukla Paksha" : "Krishna Paksha";
  
  // Nakshatra changes roughly every day (27 in ~27.3 days)
  const nakshatraIndex = Math.floor((daysSinceBase * 27 / 27.3) % 27);
  const pada = ((daysSinceBase % 4) + 1);
  
  // Yoga calculation
  const yogaIndex = Math.floor((daysSinceBase * 27 / 27) % 27);
  
  // Karana (2 per tithi)
  const karanaIndex = (lunarDay * 2) % 11;
  
  // Sample sunrise/sunset times (vary slightly by date)
  const sunriseBase = 6 + (monthNum < 6 ? (6 - monthNum) * 0.1 : (monthNum - 6) * 0.1);
  const sunsetBase = 18 + (monthNum < 6 ? monthNum * 0.05 : (12 - monthNum) * 0.05);
  
  const sunriseHours = sunriseBase + (dateNum % 5) * 0.02;
  const sunsetHours = sunsetBase + (dateNum % 5) * 0.02;
  
  const sunrise = formatTime(sunriseHours, (sunriseHours % 1) * 60);
  const sunset = formatTime(sunsetHours, (sunsetHours % 1) * 60);
  
  // Moonrise/moonset vary with tithi
  const moonriseOffset = lunarDay * 0.8;
  const moonriseHours = (sunsetHours + moonriseOffset) % 24;
  const moonsetHours = (sunriseHours + moonriseOffset) % 24;
  
  const moonrise = formatTime(moonriseHours, (moonriseHours % 1) * 60);
  const moonset = formatTime(moonsetHours, (moonsetHours % 1) * 60) + (moonsetHours < sunriseHours ? "+" : "");

  // Calculate inauspicious periods
  const rahuKaal = calculateInauspiciousPeriod(rahuKaalSlots[dayIndex], sunriseHours, sunsetHours);
  const yamagandam = calculateInauspiciousPeriod(yamagandamSlots[dayIndex], sunriseHours, sunsetHours);
  const gulikaKaal = calculateInauspiciousPeriod(gulikaSlots[dayIndex], sunriseHours, sunsetHours);
  
  // Abhijit Muhurat (midday, varies with sunrise/sunset)
  const middayHours = (sunriseHours + sunsetHours) / 2;
  const abhijitStart = middayHours - 0.4;
  const abhijitEnd = middayHours + 0.4;
  const abhijitMuhurat = `${formatTime(abhijitStart, (abhijitStart % 1) * 60)} - ${formatTime(abhijitEnd, (abhijitEnd % 1) * 60)}`;
  
  // Brahma Muhurat (96 min before sunrise)
  const brahmaStart = sunriseHours - 1.6;
  const brahmaEnd = sunriseHours - 0.8;
  const brahmaMuhurat = `${formatTime(brahmaStart, (brahmaStart % 1) * 60)} - ${formatTime(brahmaEnd, (brahmaEnd % 1) * 60)}`;

  // Calculate Hora
  const hora = calculateHora(date, sunriseHours, sunsetHours);

  // End times (simplified)
  const tithiEndHour = 18 + (tithiIndex % 5) * 0.5;
  const nakshatraEndHour = 21 + (nakshatraIndex % 4) * 0.5;
  const yogaEndHour = 4 + (yogaIndex % 6) * 0.5;
  const karanaEndHour = 8 + (karanaIndex % 4) * 0.5;

  return {
    date: date.toLocaleDateString('en-IN', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }),
    day: days[dayIndex],
    tithi: {
      name: lunarDay === 15 ? "Purnima" : (lunarDay === 0 || lunarDay === 30) ? "Amavasya" : tithis[tithiIndex],
      endTime: formatTime(tithiEndHour, (tithiEndHour % 1) * 60),
      paksha,
      tithiNumber: tithiIndex + 1
    },
    nakshatra: {
      name: nakshatras[nakshatraIndex].name,
      endTime: formatTime(nakshatraEndHour, (nakshatraEndHour % 1) * 60),
      lord: nakshatras[nakshatraIndex].lord,
      pada
    },
    yoga: {
      name: yogas[yogaIndex],
      endTime: formatTime(yogaEndHour, (yogaEndHour % 1) * 60) + "+"
    },
    karana: {
      name: karanas[karanaIndex],
      endTime: formatTime(karanaEndHour, (karanaEndHour % 1) * 60)
    },
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
      `Vijaya Muhurta: ${formatTime(middayHours + 1.5, 0)} - ${formatTime(middayHours + 2.25, 0)}`
    ],
    inauspiciousTimings: [
      `Rahu Kaal: ${rahuKaal}`,
      `Yamagandam: ${yamagandam}`,
      `Gulika Kaal: ${gulikaKaal}`
    ],
    hora
  };
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
