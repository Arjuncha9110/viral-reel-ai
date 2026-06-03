import { LocationData } from "@/components/LocationSelector";

// Default location (Bengaluru)
export const defaultLocation: LocationData = {
  name: "Bengaluru",
  stateCode: "KA",
  countryCode: "IN",
  lat: 12.9716,
  lon: 77.5946,
  timezone: "Asia/Kolkata"
};

const STORAGE_KEY = "divine_panchang_user_location";

/**
 * Persists the user's selected location to localStorage
 */
export const saveLocationToStorage = (location: LocationData): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
  } catch (error) {
    console.error("Failed to save location to localStorage:", error);
  }
};

/**
 * Loads the user's location from localStorage, falling back to defaultLocation
 */
export const loadLocationFromStorage = (): LocationData => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && parsed.name && parsed.lat !== undefined && parsed.lon !== undefined) {
        // Ensure numbers are properly parsed and default timezone is present
        return {
          name: String(parsed.name),
          stateCode: String(parsed.stateCode || "GPS"),
          countryCode: String(parsed.countryCode || "IN"),
          lat: Number(parsed.lat),
          lon: Number(parsed.lon),
          timezone: String(parsed.timezone || "Asia/Kolkata")
        };
      }
    }
  } catch (error) {
    console.error("Failed to load location from localStorage:", error);
  }
  return defaultLocation;
};

/**
 * Requests location access from the browser. Resolves to LocationData on success
 * or rejects on denial/error, allowing manual override.
 */
export const getBrowserLocation = (): Promise<Partial<LocationData>> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  });
};
