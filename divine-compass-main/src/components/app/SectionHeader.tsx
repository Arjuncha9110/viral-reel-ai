/**
 * SectionHeader.tsx
 * Large section title with optional badge pill.
 * Used on the Services / Tools page.
 */
import React from "react";
import { cn } from "../../lib/utils";

interface SectionHeaderProps {
  title: string;
  badge?: string;
  badgeColor?: string;  // Tailwind bg-* class, default green
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  badge,
  badgeColor = "bg-green-200 text-green-700",
  className,
}) => (
  <div className={cn("flex items-center gap-3 mb-4", className)}>
    <h2 className="font-display text-[24px] font-bold text-[#0E1A3A] leading-none tracking-tight">
      {title}
    </h2>
    {badge && (
      <span className={cn("rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest", badgeColor)}>
        {badge}
      </span>
    )}
  </div>
);

export default SectionHeader;
