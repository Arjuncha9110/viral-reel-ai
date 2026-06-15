import { User } from "lucide-react";
import type { BirthMetadata } from "@/lib/astro/birthMetadata";

export type BirthProfileProps = {
  name: string;
  gender: string;
  dob: string;
  time: string;
  place: string;
  lat: number;
  lon: number;
  timezone: string;
  metadata: BirthMetadata | null;
};

type Row = {
  label: string;
  value: React.ReactNode;
  accent?: boolean;
};

const formatCoordinate = (value: number, positiveLabel: string, negativeLabel: string) => {
  const direction = value >= 0 ? positiveLabel : negativeLabel;
  return `${Math.abs(value).toFixed(4)}° ${direction}`;
};

export const BirthProfileTable = ({
  name,
  gender,
  dob,
  time,
  place,
  lat,
  lon,
  timezone,
  metadata,
}: BirthProfileProps) => {
  const rows: Row[] = [
    { label: "Name", value: name || "-" },
    { label: "Sex", value: <span className="capitalize">{gender}</span> },
    { label: "Date of Birth", value: dob },
    { label: "Time of Birth", value: time },
    { label: "Time Zone", value: timezone },
    { label: "Place of Birth", value: place },
    {
      label: "Longitude & Latitude",
      value: `${formatCoordinate(lon, "E", "W")}, ${formatCoordinate(lat, "N", "S")}`,
    },
    { label: "Ayanamsa", value: metadata?.ayanamsa || "-" },
    { label: "Sun Sign (Rasi)", value: metadata?.sunSign || "-" },
    {
      label: "Birth Star / Pada",
      value: metadata ? `${metadata.nakshatra} - Pada ${metadata.pada}` : "-",
    },
    {
      label: "Birth Rasi (Moon)",
      value: metadata?.moonSign || "-",
      accent: true,
    },
    { label: "Rasi Lord", value: metadata?.moonSignLord || "-" },
    { label: "Weekday (Vara)", value: metadata?.vara || "-" },
    {
      label: "Lagna (Ascendant)",
      value: metadata?.lagna || "-",
      accent: true,
    },
    { label: "Lagna Lord", value: metadata?.lagnaLord || "-" },
    { label: "Tithi", value: metadata?.tithi || "-" },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-[#e4cfa0]/60 bg-[#fffdf8] shadow-[0_8px_32px_rgba(181,148,73,0.06)]">
      <div className="border-b border-[#e4cfa0]/40 bg-gradient-to-r from-[#fdfbf6] via-[#f9f3e5] to-[#fdfbf6] p-5">
        <h3 className="flex items-center gap-2 font-display text-xl font-bold text-[#1c1408]">
          <User className="h-5 w-5 text-[#d4651a]" /> Birth Profile
        </h3>
        <p className="mt-1 text-sm text-[#5a4025]/70">
          Calculated from your exact birth coordinates using Lahiri ayanamsa
        </p>
      </div>

      <div className="overflow-x-auto p-0">
        <table className="w-full border-collapse text-left text-[13px] md:text-sm">
          <tbody className="divide-y divide-[#e4cfa0]/20">
            {rows.map((row, idx) => (
              <tr
                key={row.label}
                className={`transition-colors hover:bg-[#fcf7ec]/40 ${
                  idx % 2 === 1 ? "bg-[#fdfbf6]/50" : ""
                }`}
              >
                <th className="w-[42%] whitespace-nowrap px-5 py-3 align-top font-semibold text-[#5a4025]/80 md:w-[38%]">
                  {row.label}
                </th>
                <td
                  className={`px-5 py-3 ${
                    row.accent ? "font-semibold text-[#d4651a]" : "font-medium text-[#1c1408]"
                  }`}>
                    {row.value}
                  </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
