import { motion } from "framer-motion";
import { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
}

export const PageHeader = ({ title, subtitle, icon }: PageHeaderProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center space-y-4 py-8 md:py-12"
    >
      {icon && (
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 text-primary mx-auto"
        >
          {icon}
        </motion.div>
      )}
      <h1 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
        {title}
      </h1>
      {subtitle && (
        <p className="text-muted-foreground text-base md:text-lg max-w-2xl mx-auto">
          {subtitle}
        </p>
      )}
      <div className="flex items-center justify-center gap-2 pt-2">
        <span className="h-1 w-8 rounded-full bg-gradient-to-r from-primary to-accent" />
        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
        <span className="h-1 w-8 rounded-full bg-gradient-to-l from-primary to-accent" />
      </div>
    </motion.div>
  );
};
