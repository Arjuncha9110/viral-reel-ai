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

const toBoolean = (value: unknown): boolean | null => {
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;
  }

  return null;
};

const normalizeSign = (value: unknown) => {
  const record = asRecord(value);
  const lordRecord = asRecord(pickFirst(record, ["lord"]));

  return {
    name: toText(pickFirst(record, ["name", "value"])),
    lord: toText(pickFirst(lordRecord, ["name", "vedicName"])) || toText(pickFirst(record, ["lord_name"])),
  };
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

    const endpoint = resolveEndpointPath(
      env.PROKERALA_KUNDLI_PATH || env.PROKERALA_BIRTH_DETAILS_PATH,
      "v2/astrology/birth-details"
    );
    const payload = await callProkerala(env, endpoint, {
      coordinates: params.coordinates,
      datetime: params.datetime,
      ayanamsa: params.ayanamsa || env.PROKERALA_AYANAMSA || "1",
      timezone: params.timezone || "Asia/Kolkata",
      la: params.la || "en",
      result_type: params.resultType || "advanced",
    });

    const raw = asRecord(unwrapProkeralaData(payload));
    const nakshatraDetails = asRecord(
      pickFirst(raw, ["nakshatra_details", "nakshatraDetails"]) || raw
    );
    const nakshatra = asRecord(pickFirst(nakshatraDetails, ["nakshatra"]));
    const chandraRasi = normalizeSign(pickFirst(nakshatraDetails, ["chandra_rasi", "chandraRasi"]));
    const sooryaRasi = normalizeSign(pickFirst(nakshatraDetails, ["soorya_rasi", "sooryaRasi"]));
    const zodiac = asRecord(pickFirst(nakshatraDetails, ["zodiac"]));
    const additionalInfo = asRecord(
      pickFirst(nakshatraDetails, ["additional_info", "additionalInfo"]) ||
        pickFirst(raw, ["additional_info", "additionalInfo"])
    );
    const mangalDosha = asRecord(pickFirst(raw, ["mangal_dosha", "mangalDosha"]));
    const yogaDetails = asArray(pickFirst(raw, ["yoga_details", "yogaDetails"]));

    const normalizedAdditionalInfo = {
      deity: toText(pickFirst(additionalInfo, ["deity", "Deity"])),
      ganam: toText(pickFirst(additionalInfo, ["ganam", "Ganam"])),
      symbol: toText(pickFirst(additionalInfo, ["symbol", "Symbol"])),
      animalSign: toText(pickFirst(additionalInfo, ["animalSign", "animal_sign", "AnimalSign"])),
      nadi: toText(pickFirst(additionalInfo, ["nadi", "Nadi"])),
      color: toText(pickFirst(additionalInfo, ["color", "Color"])),
      bestDirection: toText(pickFirst(additionalInfo, ["bestDirection", "best_direction", "BestDirection"])),
      syllables: toText(pickFirst(additionalInfo, ["syllables", "Syllables"])),
      birthStone: toText(pickFirst(additionalInfo, ["birthStone", "birth_stone", "BirthStone"])),
      gender: toText(pickFirst(additionalInfo, ["gender", "Gender"])),
      planet: toText(pickFirst(additionalInfo, ["planet", "Planet"])),
      enemyYoni: toText(pickFirst(additionalInfo, ["enemyYoni", "enemy_yoni", "EnemyYoni"])),
    };

    return jsonResponse({
      status: "live",
      source: "prokerala",
      data: {
        moonSign: chandraRasi.name,
        moonSignLord: chandraRasi.lord,
        sunSign: sooryaRasi.name,
        sunSignLord: sooryaRasi.lord,
        zodiac: toText(pickFirst(zodiac, ["name", "value"])),
        nakshatra: toText(pickFirst(nakshatra, ["name", "value"])),
        nakshatraLord:
          toText(pickFirst(asRecord(pickFirst(nakshatra, ["lord"])), ["name", "vedicName"])) ||
          toText(pickFirst(nakshatra, ["lord_name"])),
        pada: pickFirst(nakshatra, ["pada"]),
        additionalInfo: normalizedAdditionalInfo,
        hasMangalDosha: toBoolean(pickFirst(mangalDosha, ["hasDosha", "has_dosha"])),
        mangalDoshaDescription: toText(pickFirst(mangalDosha, ["description"])),
        yogaHighlights: yogaDetails
          .map((entry) => toText(pickFirst(asRecord(entry), ["name"])))
          .filter((value): value is string => Boolean(value)),
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
};
