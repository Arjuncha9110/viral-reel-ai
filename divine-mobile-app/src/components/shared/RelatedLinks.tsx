import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export interface RelatedLink {
  to: string;
  title: string;
  description: string;
}

interface RelatedLinksProps {
  heading?: string;
  links: RelatedLink[];
}

/**
 * Compact internal-linking block used at the bottom of tool pages and blog
 * posts so related content reinforces each other for search and for readers.
 */
export const RelatedLinks = ({ heading = "Related guides & tools", links }: RelatedLinksProps) => {
  if (!links.length) return null;

  return (
    <section aria-label={heading} className="container mx-auto px-4 pb-14">
      <div className="mx-auto max-w-4xl rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <h2 className="mb-4 font-display text-lg font-semibold text-foreground">{heading}</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="group rounded-xl border border-border/50 bg-background p-4 transition-colors hover:border-primary/40"
            >
              <p className="flex items-center gap-1.5 text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                {link.title}
                <ArrowRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
              </p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{link.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
