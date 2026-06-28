/**
 * During prerendering (Node, no `document`), SeoHead cannot write to the DOM.
 * Instead it reports its props here, and scripts/prerender.mjs reads the
 * collected values after renderToString() to inject real <head> tags into
 * the static HTML shipped to crawlers.
 */
export interface CollectedSeo {
  title: string;
  description: string;
  canonicalUrl: string;
  imageUrl: string;
  type: "website" | "article";
  keywords?: string;
  structuredData?: Record<string, unknown> | Array<Record<string, unknown>>;
}

let collected: CollectedSeo | null = null;

export const isServer = typeof document === "undefined";

export const collectSeo = (seo: CollectedSeo): void => {
  collected = seo;
};

export const resetCollectedSeo = (): void => {
  collected = null;
};

export const getCollectedSeo = (): CollectedSeo | null => collected;
