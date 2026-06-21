export interface AstrologicalProfile {
  dateOfBirth: string | null; // ISO Date String
  timeOfBirth: string | null; // HH:MM format
  placeOfBirth: string | null;
  latitude: number | null;
  longitude: number | null;
  timezone: string | null;
}
