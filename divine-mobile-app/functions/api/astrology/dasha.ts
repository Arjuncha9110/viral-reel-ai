import {
  asArray,
  asRecord,
  callProkerala,
  errorResponse,
  getLocationParams,
  jsonResponse,
  pickFirst,
  resolveEndpointPath,
  unwrapProkeralaData,
  type ProkeralaEnv,
} from "../../_lib/prokerala";

type Env = ProkeralaEnv;

const toText = (value: unknown): string | null => {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number") return String(value);
  return null;
};

const toDate = (value: unknown): Date | null => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(date.getTime()) ? null : date;
};

const getDuration = (start: Date | null, end: Date | null) => {
  if (!start || !end) {
    return { years: 0, months: 0, days: 0 };
  }

  const totalDays = Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  const years = totalDays / 365.25;
  const months = Math.floor(totalDays / 30.44);
  const days = Math.round(totalDays % 30.44);

  return { years, months, days };
};

const normalizeAntardasha = (value: unknown) =>
  asArray(value).map((entry) => {
    const record = asRecord(entry);
    const start = toDate(pickFirst(record, ["start", "start_date"]));
    const end = toDate(pickFirst(record, ["end", "end_date"]));
    const duration = getDuration(start, end);

    return {
      planet: toText(pickFirst(record, ["name", "planet"])) || "Unknown",
      startDate: start?.toISOString() || new Date().toISOString(),
      endDate: end?.toISOString() || start?.toISOString() || new Date().toISOString(),
      months: duration.months,
      days: duration.days,
    };
  });

export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const params = getLocationParams(request);

    if (!params.coordinates || !params.datetime) {
      return jsonResponse(
        {
          status: "error",
          message: "Missing coordinates or datetime query parameters.",
        },
        { status: 400 }
      );
    }

    const endpoint = resolveEndpointPath(env.PROKERALA_DASHA_PATH, "v2/astrology/dasha-periods");
    const payload = await callProkerala(env, endpoint, {
      coordinates: params.coordinates,
      datetime: params.datetime,
      ayanamsa: params.ayanamsa || env.PROKERALA_AYANAMSA || "1",
      timezone: params.timezone || "Asia/Kolkata",
      la: params.la || "en",
    });

    const raw = asRecord(unwrapProkeralaData(payload));
    const dashaPeriods = asArray(
      pickFirst(raw, ["dasha_periods", "dashaPeriods", "dashas", "periods"])
    ).map((entry) => {
      const record = asRecord(entry);
      const start = toDate(pickFirst(record, ["start", "start_date"]));
      const end = toDate(pickFirst(record, ["end", "end_date"]));
      const duration = getDuration(start, end);

      return {
        planet: toText(pickFirst(record, ["name", "planet"])) || "Unknown",
        startDate: start?.toISOString() || new Date().toISOString(),
        endDate: end?.toISOString() || start?.toISOString() || new Date().toISOString(),
        years: Number(duration.years.toFixed(2)),
        antardashas: normalizeAntardasha(pickFirst(record, ["antardasha", "antar_dasha"])),
      };
    });

    return jsonResponse({
      status: "live",
      source: "prokerala",
      data: {
        dashas: dashaPeriods,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
};
