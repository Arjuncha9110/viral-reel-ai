import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { siteConfig } from "@/lib/siteConfig";
import { collectSeo, isServer } from "@/seo/seoCollector";

type StructuredDataValue = Record<string, unknown> | Array<Record<string, unknown>>;

interface SeoHeadProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
  keywords?: string;
  structuredData?: StructuredDataValue;
}

const ensureMetaTag = (selector: string, attributes: Record<string, string>) => {
  let element = document.head.querySelector(selector) as HTMLMetaElement | null;

  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element?.setAttribute(key, value);
  });
};

const ensureLinkTag = (selector: string, attributes: Record<string, string>) => {
  let element = document.head.querySelector(selector) as HTMLLinkElement | null;

  if (!element) {
    element = document.createElement("link");
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([key, value]) => {
    element?.setAttribute(key, value);
  });
};

export const SeoHead = ({
  title,
  description,
  path,
  image = "/om_logo.jpg?v=3",
  type = "website",
  keywords,
  structuredData,
}: SeoHeadProps) => {
  const location = useLocation();
  const pathname = path ?? location.pathname;
  const canonicalUrl = new URL(pathname, siteConfig.websiteUrl).toString();
  const imageUrl = new URL(image, siteConfig.websiteUrl).toString();

  // During build-time prerendering there is no DOM; report SEO values to the
  // collector so the prerender script can write them into the static <head>.
  if (isServer) {
    collectSeo({ title, description, canonicalUrl, imageUrl, type, keywords, structuredData });
  }

  useEffect(() => {
    document.title = title;

    ensureMetaTag('meta[name="description"]', { name: "description", content: description });
    ensureMetaTag('meta[name="author"]', { name: "author", content: "Divine Panchang" });
    ensureMetaTag('meta[property="og:title"]', { property: "og:title", content: title });
    ensureMetaTag('meta[property="og:description"]', { property: "og:description", content: description });
    ensureMetaTag('meta[property="og:type"]', { property: "og:type", content: type });
    ensureMetaTag('meta[property="og:url"]', { property: "og:url", content: canonicalUrl });
    ensureMetaTag('meta[property="og:image"]', { property: "og:image", content: imageUrl });
    ensureMetaTag('meta[property="og:site_name"]', { property: "og:site_name", content: "Divine Panchang" });
    ensureMetaTag('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
    ensureMetaTag('meta[name="twitter:title"]', { name: "twitter:title", content: title });
    ensureMetaTag('meta[name="twitter:description"]', { name: "twitter:description", content: description });
    ensureMetaTag('meta[name="twitter:image"]', { name: "twitter:image", content: imageUrl });
    ensureLinkTag('link[rel="canonical"]', { rel: "canonical", href: canonicalUrl });

    if (keywords) {
      ensureMetaTag('meta[name="keywords"]', { name: "keywords", content: keywords });
    }

    document.head
      .querySelectorAll('script[data-seo-head="true"]')
      .forEach((node) => node.parentNode?.removeChild(node));

    if (structuredData) {
      const payloads = Array.isArray(structuredData) ? structuredData : [structuredData];

      payloads.forEach((payload) => {
        const script = document.createElement("script");
        script.type = "application/ld+json";
        script.setAttribute("data-seo-head", "true");
        script.textContent = JSON.stringify(payload);
        document.head.appendChild(script);
      });
    }

    return () => {
      document.head
        .querySelectorAll('script[data-seo-head="true"]')
        .forEach((node) => node.parentNode?.removeChild(node));
    };
  }, [canonicalUrl, description, imageUrl, keywords, structuredData, title, type]);

  return null;
};
