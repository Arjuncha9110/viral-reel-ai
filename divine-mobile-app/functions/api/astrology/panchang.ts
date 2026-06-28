import {
  asArray,
  asRecord,
  callProkerala,
  errorResponse,
  firstItem,
  formatDateTime,
  formatTimeRange,
  getLocationParams,
  jsonResponse,
  pickFirst,
  resolveEndpointPath,
  unwrapProkeralaData,
  type ProkeralaEnv,
} from "../../_lib/prokerala";

type Env = ProkeralaEnv;

type PanchangField = {
  name: string | null;
  endTime: string | null;
  paksha?: string | null;
  tithiNumber?: number | null;
  lord?: string | null;
  pada?: number | null;
};

const AUSPICIOUS_LABELS: Record<string, string> = {
  abhijitMuhurat: "Abhijit Muhurat",
  abhijit_muhurat: "Abhijit Muhurat",
  amritKaal: "Amrit Kaal",
  amrit_kaal: "Amrit Kaal",
  brahmaMuhurat: "Brahma Muhurat",
  brahma_muhurat: "Brahma Muhurat",
};

const INAUSPICIOUS_LABELS: Record<string, string> = {
  rahuKaal: "Rahu Kaal",
  rahu_kaal: "Rahu Kaal",
  yamagandaKaal: "Yamagandam",
  yamagandam: "Yamagandam",
  yamaganda_kaal: "Yamagandam",
  gulikaKaal: "Gulika Kaal",
  gulika_kaal: "Gulika Kaal",
  durMuhurat: "Dur Muhurat",
  dur_muhurat: "Dur Muhurat",
  varjyam: "Varjyam",
};

const toNumber = (value: unknown): number | null => {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const toText = (value: unknown): string | null => {
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number") return String(value);
  return null;
};

const normalizeField = (
  value: unknown,
  options?: {
    pakshaKeys?: string[];
    numberKeys?: string[];
    lordKeys?: string[];
    padaKeys?: string[];
  }
): PanchangField => {
  const record = asRecord(firstItem(asArray(value)));

  return {
    name: toText(pickFirst(record, ["name", "title", "value"])),
    endTime: formatDateTime(pickFirst(record, ["end", "end_time", "ends_at"]), { timeStyle: "short" }),
    paksha: options?.pakshaKeys ? toText(pickFirst(record, options.pakshaKeys)) : null,
    tithiNumber: options?.numberKeys ? toNumber(pickFirst(record, options.numberKeys)) : null,
    lord: options?.lordKeys ? toText(pickFirst(record, options.lordKeys)) : null,
    pada: options?.padaKeys ? toNumber(pickFirst(record, options.padaKeys)) : null,
  };
};

const buildTimingList = (value: unknown, labels: Record<string, string>) => {
  const timings: string[] = [];
  const record = asRecord(value);

  Object.entries(labels).forEach(([key, label]) => {
    const ranges = asArray(record[key]);
    ranges.forEach((range) => {
      const text = formatTimeRange(range);
      if (text) {
        timings.push(`${label}: ${text}`);
      }
    });
  });

  return Array.from(new Set(timings));
};

const pickTiming = (value: unknown, keys: string[]) => {
  const record = asRecord(value);

  for (const key of keys) {
    const text = formatTimeRange(firstItem(asArray(record[key])));
    if (text) {
      return text;
    }
  }

  return null;
};

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

    const endpoint = resolveEndpointPath(env.PROKERALA_PANCHANG_PATH, "v2/astrology/panchang");
    const payload = await callProkerala(env, endpoint, {
      coordinates: params.coordinates,
      datetime: params.datetime,
      ayanamsa: params.ayanamsa || env.PROKERALA_AYANAMSA || "1",
      result_type: params.resultType || "advanced",
      timezone: params.timezone || "Asia/Kolkata",
      la: params.la || "en",
    });

    const raw = asRecord(unwrapProkeralaData(payload));
    const auspiciousPeriods = pickFirst(raw, ["auspicious_period", "auspiciousPeriod"]);
    const inauspiciousPeriods = pickFirst(raw, ["inauspicious_period", "inauspiciousPeriod"]);
    const selectedDate = new Date(params.datetime);

    const normalized = {
      date: Number.isNaN(selectedDate.getTime())
        ? params.datetime
        : selectedDate.toLocaleDateString("en-IN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
      day:
        toText(pickFirst(asRecord(pickFirst(raw, ["vaara", "vara"])), ["name", "value"])) ||
        selectedDate.toLocaleDateString("en-IN", { weekday: "long" }),
      tithi: normalizeField(pickFirst(raw, ["tithi", "Tithi"]), {
        pakshaKeys: ["paksha"],
        numberKeys: ["id", "number", "tithi_number"],
      }),
      nakshatra: normalizeField(pickFirst(raw, ["nakshatra", "Nakshatra"]), {
        lordKeys: ["nakshatra_lord", "lord"],
        padaKeys: ["pada"],
      }),
      yoga: normalizeField(pickFirst(raw, ["yoga", "Yoga"])),
      karana: normalizeField(pickFirst(raw, ["karana", "Karana"])),
      sunrise: formatDateTime(pickFirst(raw, ["sunrise"]), { timeStyle: "short" }),
      sunset: formatDateTime(pickFirst(raw, ["sunset"]), { timeStyle: "short" }),
      moonrise: formatDateTime(pickFirst(raw, ["moonrise"]), { timeStyle: "short" }),
      moonset: formatDateTime(pickFirst(raw, ["moonset"]), { timeStyle: "short" }),
      rahuKaal: pickTiming(inauspiciousPeriods, ["rahuKaal", "rahu_kaal"]),
      yamagandam: pickTiming(inauspiciousPeriods, ["yamagandaKaal", "yamaganda_kaal", "yamagandam"]),
      gulikaKaal: pickTiming(inauspiciousPeriods, ["gulikaKaal", "gulika_kaal"]),
      abhijitMuhurat: pickTiming(auspiciousPeriods, ["abhijitMuhurat", "abhijit_muhurat"]),
      auspiciousTimings: buildTimingList(auspiciousPeriods, AUSPICIOUS_LABELS),
      inauspiciousTimings: buildTimingList(inauspiciousPeriods, INAUSPICIOUS_LABELS),
    };

    return jsonResponse({
      status: "live",
      source: "prokerala",
      data: normalized,
    });
  } catch (error) {
    return errorResponse(error);
  }
};
