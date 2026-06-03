import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SpiritualCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hover?: boolean;
}

export const SpiritualCard = ({ 
  children, 
  className, 
  delay = 0,
  hover = true 
}: SpiritualCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
      className={cn(
        "bg-card rounded-2xl border border-border/50 p-6 shadow-card transition-shadow duration-300",
        hover && "hover:shadow-elevated",
        className
      )}
    >
      {children}
    </motion.div>
  );
};
