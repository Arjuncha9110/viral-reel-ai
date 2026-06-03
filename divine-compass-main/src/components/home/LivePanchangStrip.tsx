import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sun, ArrowRight } from "lucide-react";

export const LivePanchangStrip = () => {
  return (
    <div className="relative border-y border-[#b59449]/20 bg-gradient-to-r from-[#fdf5e2] via-[#faf0d8] to-[#fdf5e2]">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_100%_at_50%_50%,rgba(196,165,90,0.07),transparent)]" />
      <div className="container relative mx-auto px-4 py-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#b59449]/12 border border-[#b59449]/25">
              <Sun className="h-4.5 w-4.5 text-[#b59449]" />
            </div>
            <div>
              <p className="text-[#3a2c10] font-semibold text-sm leading-tight">
                Today's Auspicious Timings — Muhurta &amp; Hora
              </p>
              <p className="text-[#8a6f35]/70 text-xs mt-0.5">
                Real-time Rahu Kaal, planetary hours &amp; auspicious windows
              </p>
            </div>
          </div>
          <Link
            to="/panchang-live"
            className="shrink-0 group flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#b59449] to-[#8a6f35] text-white text-sm font-bold px-5 py-2.5 transition-all shadow-md shadow-[#b59449]/20 hover:brightness-110 hover:shadow-[#b59449]/35 border border-[#d8bc7a]/30"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-white" />
            </span>
            View Timings
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </motion.div>
      </div>
    </div>
  );
};
