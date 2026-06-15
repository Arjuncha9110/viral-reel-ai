import { getUpcomingEclipses } from "./src/lib/calculators/astrology/eclipse.js";

try {
  const result = getUpcomingEclipses(12.97, 77.59, new Date());
  console.log("Success!", result);
} catch (e) {
  console.error("Error executing getUpcomingEclipses:", e);
}
