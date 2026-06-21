/**
 * Divine Panchang — App Design System
 * Shared reusable components for consistent premium spiritual UI.
 * Warm cream palette · Saffron/amber accent · Dark indigo depth
 */
import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

// ─── Section Label ─────────────────────────────────────────────────────────────
interface SectionLabelProps {
  label: string;
  dotColor?: string; // Tailwind bg-* class
  rightText?: string;
  className?: string;
}

export const SectionLabel: React.FC<SectionLabelProps> = ({
  label,
  dotColor = "bg-amber-400",
  rightText,
  className = "",
}) => (
  <div className={`flex items-center gap-2 mb-3 px-1 ${className}`}>
    <span className={`w-2 h-2 rounded-full ${dotColor} flex-shrink-0`} />
    <p className="text-[11px] uppercase tracking-[0.18em] font-bold text-stone-500 flex-1">
      {label}
    </p>
    {rightText && (
      <span className="text-[10px] text-amber-600 font-semibold whitespace-nowrap">
        {rightText}
      </span>
    )}
  </div>
);

// ─── Sacred Dot Pattern (SVG background) ───────────────────────────────────────
export const SacredPattern: React.FC<{ className?: string; opacity?: number }> = ({
  className = "",
  opacity = 0.18,
}) => (
  <svg
    className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
    viewBox="0 0 390 220"
    preserveAspectRatio="xMidYMid slice"
    style={{ opacity }}
  >
    <circle cx="195" cy="-20" r="160" fill="none" stroke="#d4a843" strokeWidth="0.6" />
    <circle cx="195" cy="-20" r="200" fill="none" stroke="#d4a843" strokeWidth="0.4" />
    {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map(deg => {
      const rad = (deg - 90) * Math.PI / 180;
      return (
        <circle
          key={deg}
          cx={195 + 160 * Math.cos(rad)}
          cy={-20 + 160 * Math.sin(rad)}
          r="2.5"
          fill="#d4a843"
        />
      );
    })}
    <line x1="195" y1="-20" x2="195" y2="240" stroke="#d4a843" strokeWidth="0.3" strokeDasharray="4 6" />
    <line x1="-20" y1="100" x2="410" y2="100" stroke="#d4a843" strokeWidth="0.3" strokeDasharray="4 6" />
  </svg>
);

// ─── Stat Pill ─────────────────────────────────────────────────────────────────
interface StatPillProps {
  value: string | number;
  label: string;
  className?: string;
}

export const StatPill: React.FC<StatPillProps> = ({ value, label, className = "" }) => (
  <div className={`flex flex-col items-center px-3 py-2 rounded-2xl bg-white/70 backdrop-blur shadow-sm border border-white/60 ${className}`}>
    <span className="font-display text-[18px] font-bold text-stone-900 leading-none">{value}</span>
    <span className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mt-0.5">{label}</span>
  </div>
);

// ─── Gradient Icon Badge ────────────────────────────────────────────────────────
interface GradientIconBadgeProps {
  icon: React.ElementType;
  gradient?: string; // inline style gradient string
  bgClass?: string;  // Tailwind class alternative
  iconClass?: string;
  size?: "sm" | "md" | "lg";
}

export const GradientIconBadge: React.FC<GradientIconBadgeProps> = ({
  icon: Icon,
  gradient,
  bgClass = "bg-amber-100",
  iconClass = "text-amber-700",
  size = "md",
}) => {
  const sizeMap = {
    sm: { outer: "w-9 h-9", icon: "w-4 h-4", radius: "rounded-xl" },
    md: { outer: "w-11 h-11", icon: "w-5 h-5", radius: "rounded-xl" },
    lg: { outer: "w-14 h-14", icon: "w-6 h-6", radius: "rounded-2xl" },
  };
  const { outer, icon: iconSize, radius } = sizeMap[size];
  return (
    <div
      className={`${outer} ${radius} flex items-center justify-center flex-shrink-0 ${!gradient ? bgClass : ""}`}
      style={gradient ? { background: gradient } : undefined}
    >
      <Icon className={`${iconSize} ${iconClass}`} />
    </div>
  );
};

// ─── Hero Card ─────────────────────────────────────────────────────────────────
interface HeroCardProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  stats?: { value: string | number; label: string }[];
  variant?: "amber" | "indigo" | "slate" | "emerald" | "rose";
  className?: string;
  children?: React.ReactNode;
}

const HERO_VARIANTS = {
  amber:   { bg: "from-[#1c0f02] via-[#2d1a04] to-[#1a0f02]", accent: "#f59e0b", accentLight: "#fcd34d", border: "border-amber-900/50",  glow: "rgba(245,158,11,0.15)" },
  indigo:  { bg: "from-[#0c0e2b] via-[#111540] to-[#090b22]",  accent: "#818cf8", accentLight: "#c7d2fe", border: "border-indigo-900/50", glow: "rgba(99,102,241,0.15)" },
  slate:   { bg: "from-[#0d1117] via-[#161c28] to-[#0a0e18]",  accent: "#94a3b8", accentLight: "#cbd5e1", border: "border-slate-700/50",  glow: "rgba(148,163,184,0.10)" },
  emerald: { bg: "from-[#022c22] via-[#064e3b] to-[#022c22]",  accent: "#34d399", accentLight: "#a7f3d0", border: "border-emerald-900/50",glow: "rgba(52,211,153,0.15)" },
  rose:    { bg: "from-[#1f0010] via-[#3b0020] to-[#1a000f]",  accent: "#fb7185", accentLight: "#fecdd3", border: "border-rose-900/50",   glow: "rgba(251,113,133,0.15)" },
};

export const HeroCard: React.FC<HeroCardProps> = ({
  eyebrow,
  title,
  subtitle,
  icon,
  stats,
  variant = "amber",
  className = "",
  children,
}) => {
  const v = HERO_VARIANTS[variant];
  return (
    <div
      className={`relative overflow-hidden rounded-none px-5 pt-6 pb-8 ${className}`}
      style={{ background: `linear-gradient(135deg, ${v.glow} 0%, transparent 60%), radial-gradient(ellipse at 50% 0%, #fef3d8 0%, #fae8c4 55%, #f5dba8 100%)` }}
    >
      <SacredPattern opacity={0.18} />

      <div className="relative z-10 flex flex-col items-center text-center gap-4">
        {icon && (
          <div className="relative">
            <div className="relative z-10">{icon}</div>
            <div
              className="absolute inset-0 rounded-full -z-0 scale-150"
              style={{ background: `radial-gradient(circle, rgba(251,146,60,0.22) 0%, transparent 70%)` }}
            />
          </div>
        )}

        <div>
          {eyebrow && (
            <p className="text-[10px] uppercase tracking-[0.25em] font-bold text-amber-700/60 mb-1">
              {eyebrow}
            </p>
          )}
          <h1 className="font-display text-[30px] font-bold text-stone-900 leading-tight">{title}</h1>
          {subtitle && (
            <p className="text-[13px] text-stone-500 leading-relaxed mt-2 max-w-[280px] mx-auto">
              {subtitle}
            </p>
          )}
        </div>

        {stats && stats.length > 0 && (
          <div className="flex items-center gap-3 mt-1 flex-wrap justify-center">
            {stats.map(s => (
              <StatPill key={s.label} value={s.value} label={s.label} />
            ))}
          </div>
        )}

        {children}
      </div>
    </div>
  );
};

// ─── Dark Hero Card (for AI, Breathing, etc.) ──────────────────────────────────
interface DarkHeroCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: string;
  stats?: { value: string | number; label: string; iconEl?: React.ReactNode }[];
  gradient?: string;
  children?: React.ReactNode;
  className?: string;
}

export const DarkHeroCard: React.FC<DarkHeroCardProps> = ({
  title,
  subtitle,
  icon,
  badge,
  stats,
  gradient = "linear-gradient(135deg, #1a0f30 0%, #221040 50%, #140b26 100%)",
  children,
  className = "",
}) => (
  <div
    className={`relative overflow-hidden rounded-3xl p-5 shadow-xl border border-white/5 ${className}`}
    style={{ background: gradient }}
  >
    {/* Decorative ring */}
    <div className="absolute top-0 right-0 p-3 opacity-8 pointer-events-none">
      <svg className="w-28 h-28 text-amber-500/20" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.8">
        <circle cx="50" cy="50" r="45" />
        <circle cx="50" cy="50" r="30" />
        <circle cx="50" cy="50" r="15" />
      </svg>
    </div>

    <div className="relative z-10">
      {(badge || icon) && (
        <div className="flex items-start justify-between mb-4">
          {icon && <div>{icon}</div>}
          {badge && (
            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              {badge}
            </span>
          )}
        </div>
      )}

      <h3 className="font-display text-xl font-bold text-white mb-1 drop-shadow-md">{title}</h3>
      {subtitle && <p className="text-xs text-white/55 leading-relaxed">{subtitle}</p>}

      {stats && (
        <div className="grid mt-4 bg-black/20 rounded-2xl p-4"
          style={{ gridTemplateColumns: `repeat(${stats.length}, 1fr)` }}>
          {stats.map((s, i) => (
            <div key={s.label} className={`text-center ${i > 0 ? "border-l border-white/10" : ""}`}>
              {s.iconEl && <div className="flex justify-center mb-1">{s.iconEl}</div>}
              <div className="font-bold text-lg text-white">{s.value}</div>
              <p className="text-[10px] text-white/45 uppercase tracking-wider font-bold">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {children}
    </div>
  </div>
);

// ─── Premium CTA Card ──────────────────────────────────────────────────────────
interface PremiumCTACardProps {
  icon?: React.ElementType;
  badge?: string;
  title: string;
  description?: string;
  features?: string[];
  ctaLabel: string;
  onCta?: () => void;
  className?: string;
}

export const PremiumCTACard: React.FC<PremiumCTACardProps> = ({
  icon: Icon,
  badge,
  title,
  description,
  features = [],
  ctaLabel,
  onCta,
  className = "",
}) => (
  <div
    className={`relative overflow-hidden rounded-3xl p-6 text-white shadow-2xl border border-amber-900/30 ${className}`}
    style={{ background: "linear-gradient(145deg, #1c0f02, #2d1805, #1a0e03)" }}
  >
    {/* Decorative */}
    <div className="absolute inset-0 opacity-5 pointer-events-none">
      <svg viewBox="0 0 300 300" className="w-full h-full">
        <circle cx="260" cy="40" r="120" fill="none" stroke="#f59e0b" strokeWidth="1" />
        <circle cx="260" cy="40" r="80" fill="none" stroke="#f59e0b" strokeWidth="0.5" />
      </svg>
    </div>

    <div className="relative z-10">
      {badge && (
        <span className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
          ✦ {badge}
        </span>
      )}

      {Icon && (
        <div className="w-11 h-11 bg-amber-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-amber-500/30">
          <Icon className="w-5 h-5 text-white" strokeWidth={2} />
        </div>
      )}

      <h3 className="font-display text-xl font-bold text-white mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-amber-100/60 leading-relaxed mb-4">{description}</p>
      )}

      {features.length > 0 && (
        <ul className="space-y-2 mb-6">
          {features.map(f => (
            <li key={f} className="flex items-center gap-2.5 text-sm text-amber-100/70">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
              {f}
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={onCta}
        className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 text-stone-900 rounded-2xl font-bold flex items-center justify-between px-5 shadow-lg shadow-amber-500/25 active:scale-[0.98] transition-transform"
      >
        {ctaLabel}
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  </div>
);

// ─── Tool Row Card ─────────────────────────────────────────────────────────────
interface ToolRowCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  iconBg?: string;
  iconColor?: string;
  iconGradient?: string;
  badge?: string;
  badgeVariant?: "new" | "ai" | "premium" | "soon";
  onClick?: () => void;
  href?: string;
  className?: string;
}

const BADGE_STYLES = {
  new:     "bg-emerald-100 text-emerald-700 border-emerald-200",
  ai:      "bg-indigo-100 text-indigo-700 border-indigo-200",
  premium: "bg-amber-100 text-amber-700 border-amber-200",
  soon:    "bg-stone-100 text-stone-500 border-stone-200",
};

export const ToolRowCard: React.FC<ToolRowCardProps> = ({
  title,
  description,
  icon: Icon,
  iconBg = "bg-amber-100",
  iconColor = "text-amber-700",
  iconGradient,
  badge,
  badgeVariant = "new",
  onClick,
  className = "",
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 rounded-2xl border border-amber-100 bg-white px-4 py-3.5 shadow-sm active:scale-[0.99] hover:shadow-md hover:border-amber-200 transition-all text-left ${className}`}
  >
    <div
      className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${!iconGradient ? `${iconBg} ${iconColor}` : ""}`}
      style={iconGradient ? { background: iconGradient } : undefined}
    >
      <Icon className={`w-5 h-5 ${iconGradient ? "text-white" : ""}`} />
    </div>

    <div className="min-w-0 flex-1">
      <div className="flex items-center gap-2">
        <p className="text-sm font-bold text-stone-900 leading-snug">{title}</p>
        {badge && (
          <span className={`text-[9px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md border ${BADGE_STYLES[badgeVariant]}`}>
            {badge}
          </span>
        )}
      </div>
      <p className="text-xs text-stone-400 leading-snug mt-0.5 line-clamp-1">{description}</p>
    </div>

    <ChevronRight className="w-4 h-4 text-stone-300 flex-shrink-0" />
  </button>
);

// ─── Disclaimer Card ───────────────────────────────────────────────────────────
interface DisclaimerCardProps {
  variant?: "default" | "strong";
  text?: string;
  className?: string;
}

const DEFAULT_TEXT =
  "Divine Panchang offers spiritual reflection, cultural learning, and practical guidance. It does not replace medical, legal, financial, relationship, or mental health advice. Use it as guidance, not fixed prediction.";

const STRONG_TEXT =
  "Breathing practices on Divine Panchang are for wellness and relaxation. Stop if dizzy or uncomfortable. Does not replace medical advice. Consult a professional if you have heart, blood pressure, pregnancy, or respiratory concerns.";

export const DisclaimerCard: React.FC<DisclaimerCardProps> = ({
  variant = "default",
  text,
  className = "",
}) => (
  <div
    className={`rounded-2xl border px-4 py-3.5 flex items-start gap-3 ${
      variant === "strong"
        ? "bg-rose-50 border-rose-200"
        : "bg-amber-50 border-amber-200"
    } ${className}`}
  >
    <span className={`text-base mt-0.5 flex-shrink-0 ${variant === "strong" ? "" : ""}`}>
      {variant === "strong" ? "⚠️" : "🙏"}
    </span>
    <p
      className={`text-xs leading-relaxed ${
        variant === "strong" ? "text-rose-700" : "text-amber-800"
      }`}
    >
      {text ?? (variant === "strong" ? STRONG_TEXT : DEFAULT_TEXT)}
    </p>
  </div>
);

// ─── Bottom Safe Spacer ────────────────────────────────────────────────────────
export const BottomSpacer: React.FC<{ size?: "sm" | "md" | "lg" }> = ({ size = "md" }) => {
  const h = size === "sm" ? "h-20" : size === "lg" ? "h-36" : "h-28";
  return <div className={h} />;
};

// ─── Form Input Premium ────────────────────────────────────────────────────────
interface PremiumInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
}

export const PremiumInput: React.FC<PremiumInputProps> = ({ label, hint, className = "", ...props }) => (
  <div className="space-y-1.5">
    {label && <label className="block text-xs font-bold uppercase tracking-wider text-stone-500">{label}</label>}
    <input
      className={`w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-transparent transition-shadow shadow-sm ${className}`}
      {...props}
    />
    {hint && <p className="text-[11px] text-stone-400">{hint}</p>}
  </div>
);

// ─── Primary CTA Button ────────────────────────────────────────────────────────
interface CTAButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: React.ElementType;
  loading?: boolean;
}

export const CTAButton: React.FC<CTAButtonProps> = ({
  variant = "primary",
  size = "md",
  icon: Icon,
  loading,
  children,
  className = "",
  disabled,
  ...props
}) => {
  const sizeClasses = {
    sm: "py-2.5 px-4 text-sm rounded-xl",
    md: "py-3.5 px-5 text-sm rounded-2xl",
    lg: "py-4 px-6 text-base rounded-2xl",
  };

  const variantClasses = {
    primary:   "bg-gradient-to-r from-amber-500 to-orange-500 text-stone-900 shadow-lg shadow-amber-500/25 hover:shadow-amber-500/35",
    secondary: "bg-white border border-amber-200 text-stone-800 shadow-sm hover:border-amber-300",
    ghost:     "text-amber-700 hover:bg-amber-50",
  };

  return (
    <button
      className={`w-full font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : Icon ? (
        <Icon className="w-4 h-4 flex-shrink-0" />
      ) : null}
      {children}
    </button>
  );
};

// ─── Info Row Card ─────────────────────────────────────────────────────────────
interface InfoRowProps {
  label: string;
  value: string | React.ReactNode;
  accent?: boolean;
}

export const InfoRow: React.FC<InfoRowProps> = ({ label, value, accent }) => (
  <div className={`flex items-center justify-between py-2.5 border-b border-amber-100 last:border-0 ${accent ? "bg-amber-50 -mx-4 px-4 rounded-xl" : ""}`}>
    <span className="text-xs font-bold text-stone-500 uppercase tracking-wide">{label}</span>
    <span className="text-sm font-bold text-stone-900 text-right max-w-[60%]">{value}</span>
  </div>
);

// ─── Card shell ────────────────────────────────────────────────────────────────
interface AppCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
}

export const AppCard: React.FC<AppCardProps> = ({ children, className = "", padding = true }) => (
  <div className={`bg-white rounded-2xl border border-amber-100 shadow-sm ${padding ? "p-5" : ""} ${className}`}>
    {children}
  </div>
);

// ─── Empty State ───────────────────────────────────────────────────────────────
interface EmptyStateProps {
  icon?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon = "✦", title, subtitle, action }) => (
  <div className="flex flex-col items-center text-center py-12 px-6">
    <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center text-2xl mb-4 border border-amber-100">
      {icon}
    </div>
    <h3 className="font-display text-lg font-bold text-stone-800 mb-1">{title}</h3>
    {subtitle && <p className="text-sm text-stone-500 leading-relaxed max-w-[260px] mb-4">{subtitle}</p>}
    {action}
  </div>
);

// ─── Service Card (Pastel Illustration Card) ───────────────────────────────────
interface ServiceCardProps {
  title: string;
  subtitle?: string;
  badge?: string;
  badgeBg?: string; // CSS color string
  illustration?: React.ReactNode;
  route: string;
  bg?: string;
  variant?: "wide" | "half";
  className?: string;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({
  title,
  subtitle,
  badge,
  badgeBg = "#f59e0b",
  illustration,
  route,
  bg = "#FFF0C0",
  variant = "half",
  className = "",
}) => (
  <Link
    to={route}
    className={`relative overflow-hidden flex flex-col active:scale-[0.98] transition-transform no-underline ${
      variant === "wide" ? "col-span-2" : "col-span-1"
    } ${className}`}
    style={{
      background: bg,
      borderRadius: 22,
      minHeight: variant === "wide" ? 118 : 148,
      textDecoration: "none",
    }}
  >
    {/* Sparkle dots */}
    <div className="absolute top-3 right-10 w-1.5 h-1.5 rounded-full bg-white/50 pointer-events-none" />
    <div className="absolute top-6 right-5 w-1 h-1 rounded-full bg-white/35 pointer-events-none" />
    <div className="absolute bottom-8 left-5 w-1 h-1 rounded-full bg-white/35 pointer-events-none" />

    <div className="relative z-10 p-4">
      {badge && (
        <span
          className="inline-block px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest text-white mb-2"
          style={{ background: badgeBg }}
        >
          {badge}
        </span>
      )}
      <h3
        className="font-bold leading-tight text-[#0E1A3A]"
        style={{
          fontSize: variant === "wide" ? 17 : 14,
          maxWidth: illustration ? "62%" : "100%",
        }}
      >
        {title}
      </h3>
      {subtitle && (
        <p
          className="text-[11px] text-[#0E1A3A]/45 mt-1 leading-snug"
          style={{ maxWidth: illustration ? "62%" : "100%" }}
        >
          {subtitle}
        </p>
      )}
    </div>

    {illustration && (
      <div className="absolute bottom-0 right-0 pointer-events-none select-none">
        {illustration}
      </div>
    )}
  </Link>
);
