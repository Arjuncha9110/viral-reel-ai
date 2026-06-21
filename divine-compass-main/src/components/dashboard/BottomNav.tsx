import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, CalendarDays, Star, Compass, User } from "lucide-react";

const NAV_ITEMS = [
  { label: "Home",     icon: Home,         path: "/dashboard"   },
  { label: "Panchang", icon: CalendarDays, path: "/app/panchang" },
  { label: "Kundali",  icon: Star,         path: "/kundali"      },
  { label: "Tools",    icon: Compass,      path: "/tools"        },
  { label: "Profile",  icon: User,         path: "/profile"      },
];

export const BottomNav: React.FC = () => {
  const { pathname } = useLocation();

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50"
      style={{
        background: "rgba(255,252,245,0.97)",
        borderTop: "1px solid rgba(251,191,36,0.15)",
        boxShadow: "0 -4px 24px rgba(180,83,9,0.08)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div className="flex items-center justify-around px-2 py-2 pb-3">
        {NAV_ITEMS.map(({ label, icon: Icon, path }) => {
          const active =
            pathname === path ||
            (path !== "/dashboard" && pathname.startsWith(path));

          return (
            <Link
              key={path}
              to={path}
              className="flex flex-col items-center gap-0.5 flex-1 py-0.5"
              style={{ textDecoration: "none" }}
            >
              {/* Icon pill */}
              <div
                className="flex items-center justify-center transition-all duration-200"
                style={{
                  width: active ? 52 : 36,
                  height: 32,
                  borderRadius: 16,
                  background: active
                    ? "linear-gradient(135deg, #F59E0B, #D97706)"
                    : "transparent",
                  boxShadow: active
                    ? "0 2px 10px rgba(217,119,6,0.35)"
                    : "none",
                }}
              >
                <Icon
                  style={{
                    width: 20,
                    height: 20,
                    color: active ? "#FFFFFF" : "#94A3B8",
                    strokeWidth: active ? 2.5 : 1.8,
                    transition: "color 0.2s",
                  }}
                />
              </div>

              {/* Label */}
              <span
                className="text-[10px] font-semibold tracking-wide transition-colors duration-200"
                style={{ color: active ? "#D97706" : "#94A3B8" }}
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
