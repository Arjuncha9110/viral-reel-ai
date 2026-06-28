import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

class LocationService {
  private isLoaded: boolean = false;

  constructor() {
    // Empty constructor to prevent SSR crashes
  }

  async initGoogleMaps(): Promise<void> {
    if (typeof window === "undefined") return;
    if (this.isLoaded) return;
    
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
    
    return new Promise((resolve, reject) => {
      let isResolved = false;

      // 5-second timeout fallback
      const timer = setTimeout(() => {
        if (!isResolved) {
          console.warn("Google Maps load timeout. Enabling manual fallback.");
          isResolved = true;
          reject(new Error("Timeout loading Google Maps"));
        }
      }, 5000);

      // Prevent the ugly Google Maps popup
      (window as any).gm_authFailure = () => {
        if (isResolved) return;
        isResolved = true;
        clearTimeout(timer);
        console.warn("Google Maps Auth Failure - Invalid or missing API key");
        reject(new Error("Google Maps Auth Failure"));
      };

      if (!apiKey) {
        isResolved = true;
        clearTimeout(timer);
        reject(new Error("No Google Maps API Key provided"));
        return;
      }

      setOptions({
        apiKey,
        version: "weekly",
      });

      importLibrary("places")
        .then(() => {
          if (isResolved) return;
          isResolved = true;
          clearTimeout(timer);
          this.isLoaded = true;
          resolve();
        })
        .catch((error) => {
          if (isResolved) return;
          isResolved = true;
          clearTimeout(timer);
          console.error("Failed to load Google Maps API", error);
          reject(error);
        });
    });
  }

  async fetchTimezone(lat: number, lng: number, timestamp: number = Math.floor(Date.now() / 1000)): Promise<{
    timezoneId: string;
    timezoneName: string;
    rawOffset: number;
    dstOffset: number;
    utcOffset: string;
  }> {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) throw new Error("Google Maps API key is missing");

    const url = `https://maps.googleapis.com/maps/api/timezone/json?location=${lat},${lng}&timestamp=${timestamp}&key=${apiKey}`;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      const data = await response.json();

      if (data.status !== "OK") {
        throw new Error(data.errorMessage || "Failed to fetch timezone from Google API");
      }

      const totalOffsetSeconds = data.rawOffset + data.dstOffset;
      const hours = Math.floor(Math.abs(totalOffsetSeconds) / 3600);
      const minutes = Math.floor((Math.abs(totalOffsetSeconds) % 3600) / 60);
      const sign = totalOffsetSeconds >= 0 ? "+" : "-";
      const utcOffset = `UTC${sign}${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;

      return {
        timezoneId: data.timeZoneId,
        timezoneName: data.timeZoneName,
        rawOffset: data.rawOffset,
        dstOffset: data.dstOffset,
        utcOffset,
      };
    } catch (err: unknown) {
      console.warn("Timezone fetch failed or timed out:", err);
      // Fallback safely to Asia/Kolkata
      return {
        timezoneId: "Asia/Kolkata",
        timezoneName: "India Standard Time",
        rawOffset: 19800,
        dstOffset: 0,
        utcOffset: "+05:30",
      };
    }
  }

  extractPlaceDetails(place: google.maps.places.PlaceResult) {
    let city = "";
    let state = "";
    let country = "";

    place.address_components?.forEach(component => {
      if (component.types.includes("locality")) city = component.long_name;
      if (component.types.includes("administrative_area_level_1")) state = component.long_name;
      if (component.types.includes("country")) country = component.long_name;
    });

    return {
      googlePlaceId: place.place_id || "",
      formattedAddress: place.formatted_address || "",
      latitude: place.geometry?.location?.lat() || 0,
      longitude: place.geometry?.location?.lng() || 0,
      city,
      state,
      country,
    };
  }
}

export const locationService = new LocationService();
