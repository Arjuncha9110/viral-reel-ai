import React, { useState, useEffect, useRef } from "react";
import { Loader2, MapPin, Navigation, ChevronDown } from "lucide-react";

interface BirthDetails {
  date: string;
  time: string;
  googlePlaceId: string | null;
  formattedAddress: string;
  latitude: number | null;
  longitude: number | null;
  city: string;
  state: string;
  country: string;
  timezoneId: string;
  timezoneName: string;
  rawOffset: number;
  dstOffset: number;
  utcOffset: string;
}

interface BirthDetailsStepProps {
  initialData: Partial<BirthDetails>;
  onNext: (data: BirthDetails) => void;
  onBack: () => void;
}

interface ResolvedLocation {
  lat: number;
  lon: number;
  city: string;
  state: string;
  country: string;
  displayName: string;
  timezoneId: string;
  timezoneName: string;
  rawOffset: number;
  utcOffset: string;
}

interface Suggestion {
  placeId: string;
  displayName: string;
  shortName: string;
  city: string;
  state: string;
  country: string;
  lat: number;
  lon: number;
}

// ---------------------------------------------------------------------------
// Timezone estimation (no API key needed)
// ---------------------------------------------------------------------------
const estimateTimezone = (
  lat: number,
  lon: number
): { id: string; name: string; rawOffset: number; utcOffset: string } => {
  if (lon >= 68 && lon <= 98 && lat >= 6 && lat <= 38)
    return { id: "Asia/Kolkata", name: "India Standard Time", rawOffset: 19800, utcOffset: "+05:30" };
  if (lon >= 80 && lon <= 89 && lat >= 26 && lat <= 31)
    return { id: "Asia/Kathmandu", name: "Nepal Time", rawOffset: 20700, utcOffset: "+05:45" };
  if (lon >= 79 && lon <= 82 && lat >= 5 && lat <= 10)
    return { id: "Asia/Colombo", name: "Sri Lanka Time", rawOffset: 19800, utcOffset: "+05:30" };
  if (lon >= 60 && lon <= 78 && lat >= 23 && lat <= 38)
    return { id: "Asia/Karachi", name: "Pakistan Standard Time", rawOffset: 18000, utcOffset: "+05:00" };
  if (lon >= 88 && lon <= 93 && lat >= 20 && lat <= 27)
    return { id: "Asia/Dhaka", name: "Bangladesh Standard Time", rawOffset: 21600, utcOffset: "+06:00" };
  if (lon >= 51 && lon <= 60 && lat >= 22 && lat <= 28)
    return { id: "Asia/Dubai", name: "Gulf Standard Time", rawOffset: 14400, utcOffset: "+04:00" };
  if (lon >= -11 && lon <= 2 && lat >= 49 && lat <= 61)
    return { id: "Europe/London", name: "Greenwich Mean Time", rawOffset: 0, utcOffset: "+00:00" };
  if (lon >= 2 && lon <= 25 && lat >= 36 && lat <= 56)
    return { id: "Europe/Paris", name: "Central European Time", rawOffset: 3600, utcOffset: "+01:00" };
  if (lon >= -82 && lon <= -65 && lat >= 24 && lat <= 50)
    return { id: "America/New_York", name: "Eastern Time", rawOffset: -18000, utcOffset: "-05:00" };
  if (lon >= -100 && lon <= -82 && lat >= 25 && lat <= 50)
    return { id: "America/Chicago", name: "Central Time", rawOffset: -21600, utcOffset: "-06:00" };
  if (lon >= -125 && lon <= -114 && lat >= 32 && lat <= 50)
    return { id: "America/Los_Angeles", name: "Pacific Time", rawOffset: -28800, utcOffset: "-08:00" };
  if (lon >= 148 && lon <= 154 && lat >= -38 && lat <= -28)
    return { id: "Australia/Sydney", name: "AE Standard Time", rawOffset: 36000, utcOffset: "+10:00" };
  if (lon >= 100 && lon <= 117 && lat >= 1 && lat <= 7)
    return { id: "Asia/Singapore", name: "Singapore Standard Time", rawOffset: 28800, utcOffset: "+08:00" };

  const offsetHours = Math.round(lon / 15);
  const rawOffset = offsetHours * 3600;
  const sign = offsetHours >= 0 ? "+" : "-";
  const absH = Math.abs(offsetHours);
  return {
    id: `Etc/GMT${offsetHours >= 0 ? "-" : "+"}${absH}`,
    name: `UTC${sign}${absH.toString().padStart(2, "0")}:00`,
    rawOffset,
    utcOffset: `${sign}${absH.toString().padStart(2, "0")}:00`,
  };
};

// ---------------------------------------------------------------------------
// Nominatim helpers
// ---------------------------------------------------------------------------
const HEADERS = {
  "Accept-Language": "en",
  "User-Agent": "DivinePanchang/1.0 (arjunchandru9110@gmail.com)",
};

async function searchSuggestions(query: string): Promise<Suggestion[]> {
  if (query.trim().length < 2) return [];
  try {
    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=6&addressdetails=1`;
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) return [];
    const data: any[] = await res.json();
    return data.map((item) => {
      const addr = item.address || {};
      const city = addr.city || addr.town || addr.village || addr.county || query;
      const state = addr.state || addr.region || "";
      const country = addr.country || "";
      const shortName = [city, state && state !== city ? state : "", country]
        .filter(Boolean)
        .join(", ");
      return {
        placeId: item.place_id?.toString() || Math.random().toString(),
        displayName: item.display_name || query,
        shortName,
        city,
        state,
        country,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
      };
    });
  } catch {
    return [];
  }
}

async function reverseGeocode(
  lat: number,
  lon: number
): Promise<{ city: string; state: string; country: string; displayName: string } | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) return null;
    const data: any = await res.json();
    const addr = data.address || {};
    const city = addr.city || addr.town || addr.village || addr.county || "My Location";
    return { city, state: addr.state || "", country: addr.country || "", displayName: data.display_name || "My Location" };
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export const BirthDetailsStep: React.FC<BirthDetailsStepProps> = ({ initialData, onNext, onBack }) => {
  const [date, setDate] = useState(initialData.date || "");
  const [time, setTime] = useState(initialData.time || "");
  const [placeOfBirth, setPlaceOfBirth] = useState(initialData.formattedAddress || "");
  const [resolvedLocation, setResolvedLocation] = useState<ResolvedLocation | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [error, setError] = useState("");
  const [activeSuggestionIdx, setActiveSuggestionIdx] = useState(-1);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search as user types
  const handlePlaceChange = (value: string) => {
    setPlaceOfBirth(value);
    setResolvedLocation(null);
    setError("");
    setActiveSuggestionIdx(-1);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (value.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchSuggestions(value);
      setSuggestions(results);
      setShowDropdown(results.length > 0);
      setIsSearching(false);
    }, 350);
  };

  // Select a suggestion from dropdown
  const handleSelectSuggestion = (s: Suggestion) => {
    const tz = estimateTimezone(s.lat, s.lon);
    setPlaceOfBirth(s.shortName);
    setResolvedLocation({
      lat: s.lat,
      lon: s.lon,
      city: s.city,
      state: s.state,
      country: s.country,
      displayName: s.displayName,
      timezoneId: tz.id,
      timezoneName: tz.name,
      rawOffset: tz.rawOffset,
      utcOffset: tz.utcOffset,
    });
    setSuggestions([]);
    setShowDropdown(false);
    setError("");
    inputRef.current?.blur();
  };

  // Keyboard navigation inside dropdown
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestionIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestionIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeSuggestionIdx >= 0) {
      e.preventDefault();
      handleSelectSuggestion(suggestions[activeSuggestionIdx]);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  };

  // GPS detection
  const handleDetectLocation = async () => {
    if (!navigator.geolocation) {
      setError("GPS not supported by your browser. Please type your city name.");
      return;
    }
    setIsGeolocating(true);
    setError("");
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 10000 })
      );
      const { latitude: lat, longitude: lon } = pos.coords;
      const deviceTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const tzEst = estimateTimezone(lat, lon);
      const geo = await reverseGeocode(lat, lon);
      const city = geo?.city || "My Location";
      const shortName = [city, geo?.state, geo?.country].filter(Boolean).join(", ");

      setPlaceOfBirth(shortName);
      setResolvedLocation({
        lat, lon,
        city,
        state: geo?.state || "",
        country: geo?.country || "",
        displayName: geo?.displayName || shortName,
        timezoneId: deviceTz || tzEst.id,
        timezoneName: tzEst.name,
        rawOffset: tzEst.rawOffset,
        utcOffset: tzEst.utcOffset,
      });
      setSuggestions([]);
      setShowDropdown(false);
    } catch (e: any) {
      if (e?.code === 1) {
        setError("Location access denied. Please type your city name.");
      } else {
        setError("Could not detect location. Please type your city manually.");
      }
    } finally {
      setIsGeolocating(false);
    }
  };

  const handleNext = async () => {
    setError("");
    if (!date) return setError("Date of Birth is required.");
    if (!time) return setError("Time of Birth is required.");
    if (placeOfBirth.trim().length < 2) return setError("Please enter your place of birth.");

    const birthDateObj = new Date(date);
    if (birthDateObj > new Date()) return setError("Date of Birth cannot be in the future.");
    if (birthDateObj.getFullYear() < 1900) return setError("Please enter a valid birth year.");

    let loc = resolvedLocation;

    // If user typed but didn't pick from dropdown, try geocoding on submit
    if (!loc) {
      setIsGeocoding(true);
      try {
        const results = await searchSuggestions(placeOfBirth.trim());
        if (results.length > 0) {
          const s = results[0];
          const tz = estimateTimezone(s.lat, s.lon);
          loc = {
            lat: s.lat, lon: s.lon,
            city: s.city, state: s.state, country: s.country,
            displayName: s.displayName,
            timezoneId: tz.id, timezoneName: tz.name,
            rawOffset: tz.rawOffset, utcOffset: tz.utcOffset,
          };
        }
      } finally {
        setIsGeocoding(false);
      }
    }

    onNext({
      date, time,
      googlePlaceId: null,
      formattedAddress: loc?.displayName || placeOfBirth.trim(),
      city: loc?.city || placeOfBirth.trim(),
      state: loc?.state || "",
      country: loc?.country || "",
      latitude: loc?.lat ?? null,
      longitude: loc?.lon ?? null,
      timezoneId: loc?.timezoneId || "Asia/Kolkata",
      timezoneName: loc?.timezoneName || "India Standard Time",
      rawOffset: loc?.rawOffset ?? 19800,
      dstOffset: 0,
      utcOffset: loc?.utcOffset || "+05:30",
    });
  };

  const isLoading = isGeolocating || isGeocoding;
  const canProceed = !isLoading && !!date && !!time && placeOfBirth.trim().length >= 2;

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-extrabold text-slate-900 font-display">Birth Details</h2>
        <p className="text-sm text-slate-600">Essential for accurate cosmic guidance.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-lg text-center">
          {error}
        </div>
      )}

      <div className="space-y-5">
        {/* Date */}
        <div>
          <label htmlFor="dob" className="block text-sm font-medium text-slate-700 mb-1">Date of Birth *</label>
          <input
            id="dob"
            type="date"
            max={new Date().toISOString().split("T")[0]}
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="appearance-none rounded-xl block w-full px-4 py-3 border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-shadow"
          />
        </div>

        {/* Time */}
        <div>
          <label htmlFor="tob" className="block text-sm font-medium text-slate-700 mb-1">
            Time of Birth * <span className="text-slate-400 font-normal">(24-hour)</span>
          </label>
          <input
            id="tob"
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="appearance-none rounded-xl block w-full px-4 py-3 border border-slate-300 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-shadow"
          />
        </div>

        {/* Place of Birth with autocomplete dropdown */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="pob" className="block text-sm font-medium text-slate-700">
              Place of Birth *
            </label>
            <button
              type="button"
              onClick={handleDetectLocation}
              disabled={isGeolocating}
              className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 hover:text-amber-700 disabled:opacity-50 transition-colors"
            >
              {isGeolocating
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : <Navigation className="w-3.5 h-3.5" />}
              {isGeolocating ? "Detecting…" : "Use GPS"}
            </button>
          </div>

          <div ref={wrapperRef} className="relative">
            {/* Input */}
            <div className="relative">
              <input
                ref={inputRef}
                id="pob"
                type="text"
                value={placeOfBirth}
                onChange={(e) => handlePlaceChange(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                placeholder="e.g. Bengaluru, Mumbai, Delhi"
                autoComplete="off"
                className="appearance-none rounded-xl block w-full px-4 py-3 pr-10 border border-slate-300 placeholder-slate-400 text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 sm:text-sm transition-shadow"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                {isSearching
                  ? <Loader2 className="w-4 h-4 text-amber-500 animate-spin" />
                  : <ChevronDown className="w-4 h-4 text-slate-400" />}
              </div>
            </div>

            {/* Dropdown */}
            {showDropdown && suggestions.length > 0 && (
              <ul className="absolute z-50 left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden max-h-56 overflow-y-auto">
                {suggestions.map((s, i) => (
                  <li
                    key={s.placeId}
                    onMouseDown={(e) => { e.preventDefault(); handleSelectSuggestion(s); }}
                    onMouseEnter={() => setActiveSuggestionIdx(i)}
                    className={`flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-slate-50 last:border-0 transition-colors ${
                      i === activeSuggestionIdx ? "bg-amber-50" : "hover:bg-slate-50"
                    }`}
                  >
                    <MapPin className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{s.shortName}</p>
                      <p className="text-xs text-slate-400 truncate">{s.displayName}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Resolved badge */}
          {resolvedLocation && (
            <div className="mt-2 flex items-center gap-2 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl">
              <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-emerald-700">✓ Location resolved</p>
                <p className="text-[11px] text-emerald-600 truncate">
                  {resolvedLocation.city}{resolvedLocation.country ? `, ${resolvedLocation.country}` : ""} · {resolvedLocation.utcOffset} ({resolvedLocation.timezoneId})
                </p>
              </div>
            </div>
          )}

          <p className="mt-1.5 text-[11px] text-slate-400">
            Type your birth city and select from the dropdown, or tap <span className="text-amber-600 font-semibold">Use GPS</span>.
          </p>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onBack}
          disabled={isLoading}
          className="w-1/3 py-3 border border-slate-300 bg-white text-slate-700 rounded-xl font-semibold hover:bg-slate-50 disabled:opacity-50 transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={handleNext}
          disabled={!canProceed}
          className="w-2/3 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-semibold shadow-soft hover:shadow-elevated disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
        >
          {isGeocoding
            ? <><Loader2 className="w-4 h-4 animate-spin" />Resolving…</>
            : "Next"}
        </button>
      </div>
    </div>
  );
};

export default BirthDetailsStep;
