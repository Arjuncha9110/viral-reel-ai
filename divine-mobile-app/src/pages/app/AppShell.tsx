import React from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { BottomNav } from "../../components/dashboard/BottomNav";

interface AppShellProps {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
  showBack?: boolean;
}

export const AppShell: React.FC<AppShellProps> = ({
  title,
  eyebrow = "Divine Panchang",
  children,
  showBack = false,
}) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-stone-200 font-body">
      <div className="w-full max-w-[430px] mx-auto min-h-screen bg-[#FFF8F0] relative sm:shadow-[0_0_0_1px_rgba(0,0,0,0.07),0_8px_60px_rgba(0,0,0,0.13)]">
        <header className="sticky top-0 z-20 bg-[#FFF8F0]/95 backdrop-blur border-b border-amber-100 px-5 py-4">
          <div className="flex items-center gap-3">
            {showBack && (
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-9 h-9 rounded-full border border-amber-200 bg-white flex items-center justify-center text-stone-700"
                aria-label="Go back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-amber-600">
                {eyebrow}
              </p>
              <h1 className="font-display text-[24px] font-bold text-stone-900 leading-tight">
                {title}
              </h1>
            </div>
          </div>
        </header>

        <main className="px-4 pt-5 pb-28 space-y-5">
          {children}
        </main>

        <BottomNav />
      </div>
    </div>
  );
};

export default AppShell;
