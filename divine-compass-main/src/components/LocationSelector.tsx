import React, { useState, useRef, useEffect } from "react";
import { MapPin, Navigation, Loader2, CheckCircle2 } from "lucide-react";

export interface LocationData {
  name: string;
  stateCode: string;
  countryCode: string;
  lat: number;
  lon: number;
  timezone: string;
}

interface LocationSelectorProps {
  onLocationSelect: (location: LocationData) => void;
  defaultLocation?: LocationData;
  initialCity?: string;
}

// ─── Nominatim suggestion shape ──────────────────────────────────────────────
interface Suggestion {
  displayName: string;
  shortName: string;
  city: string;
  state: string;
  country: string;
  countryCode: string;
  lat: number;
  lon: number;
}

// ─── Timezone estimation (no API key required) ────────────────────────────────
function estimateTimezone(lat: number, lon: number): string {
  if (lon >= 68 && lon <= 98 && lat >= 6 && lat <= 38) return "Asia/Kolkata";
  if (lon >= 80 && lon <= 89 && lat >= 26 && lat <= 31) return "Asia/Kathmandu";
  if (lon >= 79 && lon <= 82 && lat >= 5 && lat <= 10) return "Asia/Colombo";
  if (lon >= 60 && lon <= 78 && lat >= 23 && lat <= 38) return "Asia/Karachi";
  if (lon >= 88 && lon <= 93 && lat >= 20 && lat <= 27) return "Asia/Dhaka";
  if (lon >= 51 && lon <= 60 && lat >= 22 && lat <= 28) return "Asia/Dubai";
  if (lon >= -11 && lon <= 2 && lat >= 49 && lat <= 61) return "Europe/London";
  if (lon >= 2 && lon <= 25 && lat >= 36 && lat <= 56) return "Europe/Paris";
  if (lon >= -82 && lon <= -65 && lat >= 24 && lat <= 50) return "America/New_York";
  if (lon >= -100 && lon <= -82 && lat >= 25 && lat <= 50) return "America/Chicago";
  if (lon >= -125 && lon <= -100 && lat >= 32 && lat <= 50) return "America/Los_Angeles";
  if (lon >= 148 && lon <= 154 && lat >= -38 && lat <= -28) return "Australia/Sydney";
  if (lon >= 100 && lon <= 117 && lat >= 1 && lat <= 7) return "Asia/Singapore";
  const h = Math.round(lon / 15);
  return `Etc/GMT${h >= 0 ? "-" : "+"}${Math.abs(h)}`;
}

const HEADERS = {
  "Accept-Language": "en",
  "User-Agent": "DivinePanchang/1.0 (arjunchandru9110@gmail.com)",
};

async function fetchSuggestions(query: string): Promise<Suggestion[]> {
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
      const countryCode = (addr.country_code || "").toUpperCase();
      const shortName = [city, state && state !== city ? state : "", country]
        .filter(Boolean).join(", ");
      return {
        displayName: item.display_name || query,
        shortName,
        city,
        state,
        country,
        countryCode,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
      };
    });
  } catch {
    return [];
  }
}

async function reverseGeocode(lat: number, lon: number): Promise<Suggestion | null> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;
    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) return null;
    const data: any = await res.json();
    const addr = data.address || {};
    const city = addr.city || addr.town || addr.village || addr.county || "My Location";
    const state = addr.state || "";
    const country = addr.country || "";
    const countryCode = (addr.country_code || "").toUpperCase();
    return {
      displayName: data.display_name || "My Location",
      shortName: [city, state && state !== city ? state : "", country].filter(Boolean).join(", "),
      city, state, country, countryCode,
      lat, lon,
    };
  } catch {
    return null;
  }
}

// ─── Component ────────────────────────────────────────────────────────────────
export const LocationSelector: React.FC<LocationSelectorProps> = ({
  onLocationSelect,
  defaultLocation,
}) => {
  const [query, setQuery] = useState(defaultLocation?.name ?? "");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [isGeolocating, setIsGeolocating] = useState(false);
  const [confirmed, setConfirmed] = useState<Suggestion | null>(null);
  const [geoError, setGeoError] = useState("");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node))
        setShowDropdown(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleChange = (value: string) => {
    setQuery(value);
    setConfirmed(null);
    setGeoError("");
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) { setSuggestions([]); setShowDropdown(false); return; }
    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      const results = await fetchSuggestions(value);
      setSuggestions(results);
      setShowDropdown(results.length > 0);
      setIsSearching(false);
    }, 350);
  };

  const confirmSuggestion = (s: Suggestion) => {
    setQuery(s.shortName);
    setConfirmed(s);
    setSuggestions([]);
    setShowDropdown(false);
    onLocationSelect({
      name: s.city,
      stateCode: s.state.slice(0, 3).toUpperCase(),
      countryCode: s.countryCode,
      lat: s.lat,
      lon: s.lon,
      timezone: estimateTimezone(s.lat, s.lon),
    });
  };

  const handleGPS = async () => {
    if (!navigator.geolocation) {
      setGeoError("GPS not supported by your browser. Please type your city.");
      return;
    }
    setIsGeolocating(true);
    setGeoError("");
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
        })
      );
      const { latitude: lat, longitude: lon } = pos.coords;
      const geo = await reverseGeocode(lat, lon);
      if (geo) {
        confirmSuggestion(geo);
      } else {
        // Fallback: use raw coords
        const tz = estimateTimezone(lat, lon);
        setQuery(`${lat.toFixed(4)}, ${lon.toFixed(4)}`);
        onLocationSelect({ name: "My Location", stateCode: "", countryCode: "", lat, lon, timezone: tz });
      }
    } catch (err: any) {
      if (err?.code === 1) setGeoError("Location access denied. Please allow GPS or type your city.");
      else setGeoError("Could not detect location. Please type your city name.");
    } finally {
      setIsGeolocating(false);
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full space-y-2">
      {/* Input row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d4651a] pointer-events-none" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleChange(e.target.value)}
            onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
            placeholder="Type city or place of birth…"
            autoComplete="off"
            className="w-full h-11 rounded-xl border border-input bg-white/70 pl-9 pr-10 text-[14px] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#d4651a]/30 focus:border-[#d4651a]/60 transition-all placeholder:text-muted-foreground/50"
          />
          {/* Status icon right side */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            {isSearching && <Loader2 className="h-4 w-4 text-[#d4651a] animate-spin" />}
            {!isSearching && confirmed && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
          </div>
        </div>

        {/* GPS button */}
        <button
          type="button"
          onClick={handleGPS}
          disabled={isGeolocating}
          title="Detect my location"
          className="h-11 w-11 shrink-0 flex items-center justify-center rounded-xl border border-[#d4651a]/30 bg-[#fff8f0] text-[#d4651a] hover:bg-[#d4651a]/10 hover:border-[#d4651a]/60 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {isGeolocating
            ? <Loader2 className="h-4 w-4 animate-spin" />
            : <Navigation className="h-4 w-4" />}
        </button>
      </div>

      {/* Confirmed display */}
      {confirmed && (
        <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50/60 px-3 py-2">
          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5 shrink-0" />
          <div className="min-w-0">
            <p className="text-[12px] font-semibold text-emerald-800 truncate">{confirmed.shortName}</p>
            <p className="text-[11px] text-emerald-600/70">
              {confirmed.lat.toFixed(4)}°, {confirmed.lon.toFixed(4)}° · {estimateTimezone(confirmed.lat, confirmed.lon)}
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {geoError && (
        <p className="text-[12px] text-red-600 flex items-center gap-1.5">
          <span className="h-3.5 w-3.5 rounded-full bg-red-100 flex items-center justify-center text-[10px] font-bold shrink-0">!</span>
          {geoError}
        </p>
      )}

      {/* Hint */}
      {!confirmed && !geoError && (
        <p className="text-[11.5px] text-[#b09070]">
          Type your birth city or tap <Navigation className="inline h-3 w-3 text-[#d4651a]" /> to detect automatically.
        </p>
      )}

      {/* Suggestions dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute z-50 left-0 right-0 top-[calc(100%+4px)] max-h-56 overflow-y-auto rounded-xl border border-[#e8d5b0]/80 bg-white shadow-[0_8px_24px_rgba(122,91,40,0.12)] divide-y divide-[#f0e4c8]/60">
          {suggestions.map((s, i) => (
            <li key={i}>
              <button
                type="button"
                className="w-full text-left px-4 py-3 hover:bg-[#fff8f0] transition-colors flex items-start gap-3 group"
                onMouseDown={(e) => { e.preventDefault(); confirmSuggestion(s); }}
              >
                <MapPin className="h-3.5 w-3.5 text-[#d4651a] shrink-0 mt-0.5 group-hover:text-[#a84810]" />
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-[#2a1a08] truncate">{s.shortName}</p>
                  <p className="text-[11px] text-[#b09070] truncate">{s.displayName}</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
