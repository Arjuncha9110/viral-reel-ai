import { Timestamp } from "firebase/firestore";

export interface UserProfile {
  uid: string;
  email: string;
  provider: "google" | "email";
  role: "user" | "admin";
  profileCompleted: boolean;
  subscription: "free" | "premium";
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLogin: Timestamp;
  profile?: {
    displayName: string;
    gender?: string;
    photoURL?: string | null;
  };
  birthDetails?: {
    date: string; // YYYY-MM-DD
    time: string; // HH:mm (24-hour format)
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
  };
  birthDetails2?: {
    label?: string; // e.g. "Partner", "Spouse"
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
  };
  preferences?: {
    language: "en";
    theme: "system" | "light" | "dark";
    notifications: boolean;
  };
}
