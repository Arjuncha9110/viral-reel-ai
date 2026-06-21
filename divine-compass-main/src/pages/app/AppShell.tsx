import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "../../components/dashboard/BottomNav";

interface AppShellProps {
  title: string;
  eyebrow?: string;
  eyebrowColor?: string; // Tailwind text-* class
  children: React.ReactNode;
  showBack?: boolean;
  /** Optional element placed in the top-right of the header */
  rightAction?: React.ReactNode;
  /** Skip default px-4 pt-5 pb-28 main padding — used by pages with full-bleed hero */
  noPadding?: boolean;
}

export const AppShell: React.FC<AppShellProps> = ({
  title,
  eyebrow = "Divine Panchang",
  eyebrowColor = "text-amber-600",
  children,
  showBack = false,
  rightAction,
  noPadding = false,
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-stone-200 font-body">
      {/* Phone shell: full-width on mobile, 430 px centered on desktop */}
      <div className="w-full max-w-[430px] mx-auto min-h-screen bg-[#FFF8F0] relative sm:shadow-[0_0_0_1px_rgba(0,0,0,0.07),0_8px_60px_rgba(0,0,0,0.13)]">

        {/* Sticky header */}
        <header className="sticky top-0 z-20 bg-[#FFF8F0]/95 backdrop-blur border-b border-amber-100 px-5 py-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              {showBack && (
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  aria-label="Go back"
                  className="w-9 h-9 rounded-full border border-amber-200 bg-white flex items-center justify-center text-stone-700 shadow-sm flex-shrink-0 active:scale-95 transition-transform"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
              )}
              <div className="min-w-0">
                <p className={`text-[10px] uppercase tracking-[0.22em] font-bold ${eyebrowColor} truncate`}>
                  {eyebrow}
                </p>
                <h1 className="font-display text-[22px] font-bold text-stone-900 leading-tight truncate">
                  {title}
                </h1>
              </div>
            </div>

            {rightAction && (
              <div className="flex-shrink-0">{rightAction}</div>
            )}
          </div>
        </header>

        {/* Main content */}
        <main className={noPadding ? "" : "px-4 pt-5 pb-28 space-y-5"}>
          {children}
        </main>

        <BottomNav />
      </div>
    </div>
  );
};

export default AppShell;
