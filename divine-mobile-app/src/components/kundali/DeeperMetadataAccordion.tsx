import type { ReactNode } from "react";
import { Compass, Layers, Lock, Star, Sunrise, UserRound } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { LiveKundliData, LivePanchangData } from "@/lib/astrologyApi";
import type { BirthMetadata } from "@/lib/astro/birthMetadata";
import {
  NAKSHATRA_ATTRIBUTES,
  getNakshatraPersonality,
  getNakshatraSymbolism,
} from "@/lib/pdf/sharedReportModel";

type PersonalDetails = {
  name: string;
  email: string;
  phone: string;
  gender: string;
  dob: string;
  time: string;
  place: string;
  timezone: string;
  lat: number;
  lon: number;
};

type Props = {
  metadata: BirthMetadata | null;
  panchangData: LivePanchangData | null;
  kundliData: LiveKundliData | null;
  personalDetails: PersonalDetails;
};

const KV = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="flex justify-between gap-3 rounded-lg border border-[#e4cfa0]/25 bg-[#fcf7ec]/50 px-3 py-2 text-sm">
    <span className="text-[#5a4025]/75">{label}</span>
    <span className="text-right font-semibold text-[#1c1408]">{value}</span>
  </div>
);

const LiveBadge = () => (
  <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
    Live
  </span>
);

const MixedBadge = () => (
  <span className="rounded-full bg-sky-500/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-700">
    Mixed
  </span>
);

const PreviewBadge = () => (
  <span className="rounded-full bg-[#d4651a]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#a84810]">
    Preview
  </span>
);

const PreviewValue = ({ label = "Full report" }: { label?: string }) => (
  <span className="inline-flex items-center gap-1 rounded-full border border-[#d4651a]/25 bg-[#d4651a]/8 px-2 py-0.5 text-[11px] font-semibold text-[#a84810]">
    <Lock className="h-3 w-3" />
    {label}
  </span>
);

const formatCoordinate = (value: number, positiveLabel: string, negativeLabel: string) => {
  const direction = value >= 0 ? positiveLabel : negativeLabel;
  return `${Math.abs(value).toFixed(4)}° ${direction}`;
};

const normalizeNakshatraKey = (value: string) => {
  const aliases: Record<string, string> = {
    "Mrigashirsha": "Mrigashira",
    "Purva Phalguni": "PoorvaPhalguni",
    "Purva Ashadha": "Poorvashadha",
    "Purva Bhadrapada": "Poorvabhadrapada",
    "Uttara Phalguni": "UttaraPhalguni",
    "Uttara Ashadha": "Uttarashadha",
    "Uttara Bhadrapada": "Uttarabhadrapada",
    "Dhanishtha": "Dhanishta",
  };

  return aliases[value] || value.replace(/\s+/g, "");
};

const findAdditionalInfoValue = (
  info: Record<string, string | null> | undefined,
  patterns: string[],
) => {
  if (!info) return null;

  const normalizedPatterns = patterns.map((pattern) => pattern.toLowerCase());
  for (const [key, value] of Object.entries(info)) {
    if (!value) continue;
    const normalizedKey = key.toLowerCase().replace(/[_-]+/g, " ");
    if (normalizedPatterns.some((pattern) => normalizedKey.includes(pattern))) {
      return value;
    }
  }

  return null;
};

export const DeeperMetadataAccordion = ({
  metadata,
  panchangData,
  kundliData,
  personalDetails,
}: Props) => {
  if (!metadata) return null;

  const riseSet = {
    sunrise: panchangData?.sunrise || metadata.riseSet.sunrise,
    sunset: panchangData?.sunset || metadata.riseSet.sunset,
    moonrise: panchangData?.moonrise || metadata.riseSet.moonrise,
    moonset: panchangData?.moonset || metadata.riseSet.moonset,
    dayLength: metadata.riseSet.dayLength,
    rahuKaal: panchangData?.rahuKaal || null,
    yamagandam: panchangData?.yamagandam || null,
    gulikaKaal: panchangData?.gulikaKaal || null,
    abhijitMuhurat: panchangData?.abhijitMuhurat || null,
  };

  const hasTimingValues = Object.values(riseSet).some(Boolean);
  const nakshatraAttributes = NAKSHATRA_ATTRIBUTES[normalizeNakshatraKey(metadata.nakshatra)];
  const additionalInfo = kundliData?.additionalInfo;
  const yogiPoint = findAdditionalInfoValue(additionalInfo, ["yogi point", "yogi nakshatra"]);
  const yogiPlanet = findAdditionalInfoValue(additionalInfo, ["yogi planet"]);
  const avayogiPoint = findAdditionalInfoValue(additionalInfo, ["avayogi point", "avayogi star"]);
  const avayogiPlanet = findAdditionalInfoValue(additionalInfo, ["avayogi planet"]);
  const atmaKaraka =
    findAdditionalInfoValue(additionalInfo, ["atma karaka", "atmakaraka"]) || metadata.charaKarakas.atma;
  const amatyaKaraka =
    findAdditionalInfoValue(additionalInfo, ["amatya karaka", "amatyakaraka"]) ||
    metadata.charaKarakas.amatya;
  const bhratriKaraka =
    findAdditionalInfoValue(additionalInfo, ["bhratri karaka", "bhratrikarak"]) || metadata.charaKarakas.bhratri;
  const daraKaraka =
    findAdditionalInfoValue(additionalInfo, ["dara karaka", "darakaraka"]) || metadata.charaKarakas.dara;
  const arudhaLagna =
    findAdditionalInfoValue(additionalInfo, ["arudha lagna", "aruda lagna"]) || metadata.arudha.lagna;
  const dhanaArudha =
    findAdditionalInfoValue(additionalInfo, ["dhana arudha", "a2", "dhana pada"]) || metadata.arudha.dhana;
  const hasYogiLiveValues = Boolean(yogiPoint || yogiPlanet || avayogiPoint || avayogiPlanet);

  return (
    <div className="overflow-hidden rounded-2xl border border-[#e4cfa0]/60 bg-[#fffdf8] shadow-[0_8px_32px_rgba(181,148,73,0.06)]">
      <div className="border-b border-[#e4cfa0]/40 bg-gradient-to-r from-[#fdfbf6] via-[#f9f3e5] to-[#fdfbf6] p-5">
        <h3 className="flex items-center gap-2 font-display text-xl font-bold text-[#1c1408]">
          <Layers className="h-5 w-5 text-[#d4651a]" /> Vedic Birth Details
        </h3>
        <p className="mt-1 text-sm text-[#5a4025]/70">
          Personal details, panchang timings, star qualities, and deeper chart markers for this birth
        </p>
      </div>
      <div className="px-5 pb-2">
        <Accordion type="multiple" defaultValue={["personal", "timings"]} className="w-full">
          <AccordionItem value="personal" className="border-b border-[#e4cfa0]/30 py-1">
            <AccordionTrigger className="hover:no-underline data-[state=open]:text-[#d4651a]">
              <div className="flex items-center gap-3 text-[15px] font-semibold">
                <UserRound className="h-4 w-4" /> Personal Data <LiveBadge />
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-5 pt-2">
              <div className="grid gap-2 sm:grid-cols-2">
                <KV label="Name" value={personalDetails.name || "-"} />
                <KV label="Gender" value={<span className="capitalize">{personalDetails.gender}</span>} />
                <KV label="Date of Birth" value={personalDetails.dob} />
                <KV label="Time of Birth" value={personalDetails.time} />
                <KV label="Place of Birth" value={personalDetails.place} />
                <KV label="Timezone" value={personalDetails.timezone} />
                <KV label="Coordinates" value={`${Math.abs(personalDetails.lat).toFixed(4)}°${personalDetails.lat >= 0 ? "N" : "S"}, ${Math.abs(personalDetails.lon).toFixed(4)}°${personalDetails.lon >= 0 ? "E" : "W"}`} />
                <KV label="Ayanamsa" value={metadata.ayanamsa} />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Panchang Timings */}
          {hasTimingValues && (
            <AccordionItem value="timings" className="border-b border-[#e4cfa0]/30 py-1">
              <AccordionTrigger className="hover:no-underline data-[state=open]:text-[#d4651a]">
                <div className="flex items-center gap-3 text-[15px] font-semibold">
                  <Sunrise className="h-4 w-4" /> Panchang Timings <LiveBadge />
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-5 pt-2">
                <div className="grid gap-2 sm:grid-cols-2">
                  {riseSet.sunrise && <KV label="Sunrise" value={riseSet.sunrise} />}
                  {riseSet.sunset && <KV label="Sunset" value={riseSet.sunset} />}
                  {riseSet.moonrise && <KV label="Moonrise" value={riseSet.moonrise} />}
                  {riseSet.moonset && <KV label="Moonset" value={riseSet.moonset} />}
                  {riseSet.dayLength && <KV label="Day Length" value={riseSet.dayLength} />}
                  {riseSet.rahuKaal && <KV label="Rahu Kaal" value={riseSet.rahuKaal} />}
                  {riseSet.yamagandam && <KV label="Yamagandam" value={riseSet.yamagandam} />}
                  {riseSet.gulikaKaal && <KV label="Gulika Kaal" value={riseSet.gulikaKaal} />}
                  {riseSet.abhijitMuhurat && <KV label="Abhijit Muhurat" value={riseSet.abhijitMuhurat} />}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Nakshatra Qualities */}
          {nakshatraAttributes && (
            <AccordionItem value="nakshatra" className="border-b border-[#e4cfa0]/30 py-1">
              <AccordionTrigger className="hover:no-underline data-[state=open]:text-[#d4651a]">
                <div className="flex items-center gap-3 text-[15px] font-semibold">
                  <Star className="h-4 w-4" /> Star Qualities <MixedBadge />
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-5 pt-2">
                <div className="grid gap-2 sm:grid-cols-2">
                  <KV label="Nakshatra" value={`${metadata.nakshatra} (Pada ${metadata.pada})`} />
                  <KV label="Nakshatra Lord" value={metadata.nakshatraLord} />
                  <KV label="Deity" value={metadata.nakshatraDeity} />
                  <KV label="Gana" value={metadata.nakshatraGana} />
                  <KV label="Symbol" value={metadata.nakshatraSymbol} />
                  {nakshatraAttributes.element && <KV label="Element" value={nakshatraAttributes.element} />}
                  {nakshatraAttributes.quality && <KV label="Quality" value={nakshatraAttributes.quality} />}
                  {nakshatraAttributes.bodyPart && <KV label="Body Part" value={nakshatraAttributes.bodyPart} />}
                </div>
                {getNakshatraPersonality(metadata.nakshatra) && (
                  <p className="mt-3 text-sm text-[#5a4025]/70 leading-relaxed">
                    {getNakshatraPersonality(metadata.nakshatra)}
                  </p>
                )}
              </AccordionContent>
            </AccordionItem>
          )}

          {/* Deeper Markers */}
          <AccordionItem value="markers" className="border-b border-[#e4cfa0]/30 py-1">
            <AccordionTrigger className="hover:no-underline data-[state=open]:text-[#d4651a]">
              <div className="flex items-center gap-3 text-[15px] font-semibold">
                <Compass className="h-4 w-4" /> Chart Markers <PreviewBadge />
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-5 pt-2">
              <div className="grid gap-2 sm:grid-cols-2">
                <KV label="Chara Atma Karaka" value={metadata.charaKarakas.atma || <PreviewValue />} />
                <KV label="Chara Amatya Karaka" value={metadata.charaKarakas.amatya || <PreviewValue />} />
                <KV label="Arudha Lagna" value={metadata.arudha.lagna || <PreviewValue />} />
                <KV label="Dhana Arudha" value={metadata.arudha.dhana || <PreviewValue />} />
                {hasYogiLiveValues ? (
                  <>
                    {yogiPoint && <KV label="Yogi Point" value={yogiPoint} />}
                    {yogiPlanet && <KV label="Yogi Planet" value={yogiPlanet} />}
                    {avayogiPoint && <KV label="Avayogi Point" value={avayogiPoint} />}
                    {avayogiPlanet && <KV label="Avayogi Planet" value={avayogiPlanet} />}
                  </>
                ) : (
                  <>
                    <KV label="Yogi Planet" value={<PreviewValue label="Full report" />} />
                    <KV label="Avayogi Planet" value={<PreviewValue label="Full report" />} />
                  </>
                )}
                {atmaKaraka && <KV label="Atma Karaka" value={atmaKaraka} />}
                {amatyaKaraka && <KV label="Amatya Karaka" value={amatyaKaraka} />}
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Mangal Dosha */}
          {metadata.mangalDosha !== null && (
            <AccordionItem value="mangal" className="py-1">
              <AccordionTrigger className="hover:no-underline data-[state=open]:text-[#d4651a]">
                <div className="flex items-center gap-3 text-[15px] font-semibold">
                  <Layers className="h-4 w-4" /> Mangal Dosha
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-5 pt-2">
                <div className="rounded-lg border border-[#e4cfa0]/30 bg-[#fcf7ec]/50 p-4 text-sm text-[#5a4025]/80">
                  {metadata.mangalDoshaNote}
                </div>
              </AccordionContent>
            </AccordionItem>
          )}
        </Accordion>
      </div>
    </div>
  );
};
