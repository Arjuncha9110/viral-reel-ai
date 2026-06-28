import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, CalendarDays, Star, Compass, User } from "lucide-react";

const NAV_ITEMS = [
  { label: "Home",     icon: Home,        path: "/dashboard" },
  { label: "Panchang", icon: CalendarDays, path: "/panchang"  },
  { label: "Kundali",  icon: Star,         path: "/kundali"   },
  { label: "Tools",    icon: Compass,      path: "/tools"     },
  { label: "Profile",  icon: User,         path: "/profile"   },
];

export const BottomNav: React.FC = () => {
  const { pathname } = useLocation();

  return (
    /* Centered to match the 430px phone shell on desktop */
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50
                    bg-white border-t border-amber-100
                    shadow-[0_-2px_16px_rgba(180,83,9,0.07)]">
      <div className="flex items-center justify-around px-1 py-2">
        {NAV_ITEMS.map(({ label, icon: Icon, path }) => {
          const active =
            pathname === path ||
            (path !== "/dashboard" && pathname.startsWith(path));
          return (
            <Link
              key={path}
              to={path}
              className="flex flex-col items-center gap-0.5 flex-1 py-1 group"
            >
              <div
                className={`p-1.5 rounded-xl transition-colors ${
                  active ? "bg-amber-100" : "group-hover:bg-amber-50"
                }`}
              >
                <Icon
                  className={`w-[22px] h-[22px] transition-colors ${
                    active
                      ? "text-amber-600"
                      : "text-slate-400 group-hover:text-amber-500"
                  }`}
                  strokeWidth={active ? 2.5 : 1.8}
                />
              </div>
              <span
                className={`text-xs font-semibold tracking-wide transition-colors ${
                  active ? "text-amber-600" : "text-slate-400"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
