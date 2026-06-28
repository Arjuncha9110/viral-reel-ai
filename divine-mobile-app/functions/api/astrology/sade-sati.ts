import {
  asArray,
  asRecord,
  callProkerala,
  errorResponse,
  formatDateTime,
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

const toBoolean = (value: unknown): boolean | null => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
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

    const endpoint = resolveEndpointPath(env.PROKERALA_SADE_SATI_PATH, "v2/astrology/sade-sati");
    const payload = await callProkerala(env, endpoint, {
      coordinates: params.coordinates,
      datetime: params.datetime,
      ayanamsa: params.ayanamsa || env.PROKERALA_AYANAMSA || "1",
      timezone: params.timezone || "Asia/Kolkata",
      result_type: params.resultType || "advanced",
    });

    const raw = asRecord(unwrapProkeralaData(payload));
    const transits = asArray(pickFirst(raw, ["transits"])).map((entry) => {
      const record = asRecord(entry);
      return {
        saturnSign: toText(pickFirst(record, ["saturnSign", "saturn_sign", "sign"])),
        phase: toText(pickFirst(record, ["phase", "transitPhase", "transit_phase"])),
        start: formatDateTime(pickFirst(record, ["start", "start_date"]), {
          dateStyle: "medium",
          timeStyle: "short",
        }),
        end: formatDateTime(pickFirst(record, ["end", "end_date"]), {
          dateStyle: "medium",
          timeStyle: "short",
        }),
        isRetrograde: toBoolean(pickFirst(record, ["isRetrograde", "is_retrograde"])),
        description: toText(pickFirst(record, ["description"])),
      };
    });

    return jsonResponse({
      status: "live",
      source: "prokerala",
      data: {
        inSadeSati: toBoolean(pickFirst(raw, ["isInSadeSati", "is_in_sade_sati"])),
        transitPhase: toText(pickFirst(raw, ["transitPhase", "transit_phase", "phase"])),
        description: toText(pickFirst(raw, ["description"])),
        moonSign:
          toText(pickFirst(raw, ["moonSign", "moon_sign", "janmaRasi", "janma_rasi"])) ||
          toText(pickFirst(asRecord(pickFirst(raw, ["rashi"])), ["name"])),
        transits,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
};
