import React from "react";

export interface SadeSatiReportBirthData {
  name: string;
  email: string;
  dob: string;
  tob: string;
  gender: string;
  city: string;
  lat: number;
  lon: number;
  timezone: string;
}

interface Props {
  data: SadeSatiReportBirthData;
  isDemo?: boolean;
  exportMode?: boolean;
}

/** Minimal Sade Sati Report Template */
export const SadeSatiReportTemplate: React.FC<Props> = ({ data, isDemo = false, exportMode = false }) => {
  return (
    <section
      className={`w-full max-w-3xl p-6 rounded-xl border border-[#b59449]/30 bg-[#0b1730] text-[#fdfbf7] ${exportMode ? "bg-white text-black" : ""}`}
    >
      <h2 className="text-2xl font-serif text-[#b59449] mb-4">
        {data.name}'s Sade Sati Report
      </h2>
      {isDemo && (
        <p className="text-xs italic text-[#b59449] mb-2">
          Sample data – real report generated from your birth details.
        </p>
      )}
      <dl className="grid grid-cols-2 gap-4 text-sm">
        <div><dt className="font-medium text-[#b59449]">Date of Birth</dt><dd>{data.dob}</dd></div>
        <div><dt className="font-medium text-[#b59449]">Time of Birth</dt><dd>{data.tob}</dd></div>
        <div><dt className="font-medium text-[#b59449]">Gender</dt><dd>{data.gender}</dd></div>
        <div><dt className="font-medium text-[#b59449]">City</dt><dd>{data.city}</dd></div>
        <div><dt className="font-medium text-[#b59449]">Latitude</dt><dd>{data.lat}</dd></div>
        <div><dt className="font-medium text-[#b59449]">Longitude</dt><dd>{data.lon}</dd></div>
        <div><dt className="font-medium text-[#b59449]">Timezone</dt><dd>{data.timezone}</dd></div>
        <div><dt className="font-medium text-[#b59449]">Email</dt><dd>{data.email}</dd></div>
      </dl>
    </section>
  );
};
