/**
 * Build-time prerendering + sitemap generation.
 *
 * Runs after `vite build` (client) and `vite build --ssr` (server bundle):
 *   1. Renders every route in src/seo/routes.ts to static HTML in dist/,
 *      so crawlers get full content + correct <head> metadata per URL.
 *   2. Generates dist/sitemap.xml (and keeps public/sitemap.xml in sync).
 *   3. Fails the build if any emitted HTML contains mojibake byte patterns.
 *
 * Cloudflare Pages serves these static files directly; the `/* /index.html 200`
 * fallback in public/_redirects still handles non-prerendered routes.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const distDir = path.resolve(root, process.env.DIST_DIR ?? "dist");
const ssrEntry = path.resolve(root, process.env.SSR_DIR ?? "dist-ssr", "entry-server.js");
const SITE_URL = "https://www.divinepanchang.space";

// Minimal DOM polyfills so browser-oriented deps (pdfjs-dist) can be imported
// in Node during prerendering. No PDF code runs at build time.
if (typeof globalThis.DOMMatrix === "undefined") {
  globalThis.DOMMatrix = class DOMMatrix {
    constructor() {
      this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
    }
  };
}
if (typeof globalThis.ImageData === "undefined") {
  globalThis.ImageData = class ImageData { constructor() {} };
}
if (typeof globalThis.Path2D === "undefined") {
  globalThis.Path2D = class Path2D { constructor() {} };
}

const { render, seoRoutes } = await import(pathToFileURL(ssrEntry).href);

const template = fs.readFileSync(path.join(distDir, "index.html"), "utf8");

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const escapeXml = escapeHtml;

const replaceMeta = (html, pattern, replacement) => {
  if (!pattern.test(html)) return html;
  return html.replace(pattern, replacement);
};

const buildPage = (routePath, rendered, seo) => {
  let page = template;

  // Inject prerendered markup.
  page = page.replace('<div id="root"></div>', `<div id="root">${rendered}</div>`);

  if (seo) {
    const title = escapeHtml(seo.title);
    const description = escapeHtml(seo.description);
    const canonical = escapeHtml(seo.canonicalUrl);
    const image = escapeHtml(seo.imageUrl);

    page = replaceMeta(page, /<title>[\s\S]*?<\/title>/, `<title>${title}</title>`);
    page = replaceMeta(
      page,
      /<meta name="description" content="[^"]*" \/>/,
      `<meta name="description" content="${description}" />`
    );
    page = replaceMeta(
      page,
      /<meta property="og:title" content="[^"]*" \/>/,
      `<meta property="og:title" content="${title}" />`
    );
    page = replaceMeta(
      page,
      /<meta property="og:description" content="[^"]*" \/>/,
      `<meta property="og:description" content="${description}" />`
    );
    page = replaceMeta(
      page,
      /<meta property="og:type" content="[^"]*" \/>/,
      `<meta property="og:type" content="${escapeHtml(seo.type ?? "website")}" />`
    );
    page = replaceMeta(
      page,
      /<meta property="og:url" content="[^"]*" \/>/,
      `<meta property="og:url" content="${canonical}" />`
    );
    page = replaceMeta(
      page,
      /<meta property="og:image" content="[^"]*" \/>/,
      `<meta property="og:image" content="${image}" />`
    );
    page = replaceMeta(
      page,
      /<meta name="twitter:title" content="[^"]*" \/>/,
      `<meta name="twitter:title" content="${title}" />`
    );
    page = replaceMeta(
      page,
      /<meta name="twitter:description" content="[^"]*" \/>/,
      `<meta name="twitter:description" content="${description}" />`
    );
    page = replaceMeta(
      page,
      /<meta name="twitter:image" content="[^"]*" \/>/,
      `<meta name="twitter:image" content="${image}" />`
    );

    const extraHead = [];
    extraHead.push(`  <link rel="canonical" href="${canonical}" />`);
    if (seo.keywords) {
      extraHead.push(`  <meta name="keywords" content="${escapeHtml(seo.keywords)}" />`);
    }
    if (seo.structuredData) {
      const payloads = Array.isArray(seo.structuredData) ? seo.structuredData : [seo.structuredData];
      for (const payload of payloads) {
        const json = JSON.stringify(payload).replace(/</g, "\\u003c");
        extraHead.push(`  <script type="application/ld+json">${json}</script>`);
      }
    }
    page = page.replace("</head>", `${extraHead.join("\n")}\n</head>`);
  }

  return page;
};

const outputPathFor = (routePath) => {
  if (routePath === "/") return path.join(distDir, "index.html");
  return path.join(distDir, ...routePath.replace(/^\//, "").split("/"), "index.html");
};

// Mojibake guard: UTF-8 text decoded as Latin-1/cp1252 produces these markers.
const MOJIBAKE_RE = /Ã[-¿€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ¡-¿]|â€[”“˜™¦"']|Â·|Â°|à¥[^ऀ-ॿ]/;

let failures = 0;
const written = [];

// Keep the original index.html as fallback

// Render "/" last so dist/index.html keeps the SPA shell available as the
// template for every other route before being overwritten.
const routes = [...seoRoutes].sort((a, b) => (a.path === "/" ? 1 : b.path === "/" ? -1 : 0));

for (const route of routes) {
  let result;
  try {
    result = render(route.path);
  } catch (error) {
    failures += 1;
    console.error(`✗ Failed to prerender ${route.path}: ${error?.message ?? error}`);
    continue;
  }

  if (!result.html || !result.html.trim()) {
    failures += 1;
    console.error(`✗ Empty render output for ${route.path}`);
    continue;
  }

  const page = buildPage(route.path, result.html, result.seo);

  if (MOJIBAKE_RE.test(page)) {
    failures += 1;
    console.error(`✗ Mojibake detected in prerendered HTML for ${route.path}`);
    continue;
  }

  const outPath = outputPathFor(route.path);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, page, "utf8");
  written.push(route.path);

  if (!result.seo) {
    console.warn(`⚠ ${route.path} rendered without SeoHead metadata (kept template <head>)`);
  }
}

// --- Sitemap -----------------------------------------------------------------
const today = new Date().toISOString().slice(0, 10);
const sitemapEntries = seoRoutes
  .map((route) => {
    const loc = route.path === "/" ? `${SITE_URL}/` : `${SITE_URL}${route.path}`;
    return [
      "  <url>",
      `    <loc>${escapeXml(loc)}</loc>`,
      `    <lastmod>${today}</lastmod>`,
      `    <changefreq>${route.changefreq}</changefreq>`,
      `    <priority>${route.priority.toFixed(1)}</priority>`,
      "  </url>",
    ].join("\n");
  })
  .join("\n");

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries}\n</urlset>\n`;

fs.writeFileSync(path.join(distDir, "sitemap.xml"), sitemap, "utf8");
fs.writeFileSync(path.join(root, "public", "sitemap.xml"), sitemap, "utf8");

console.log(`\nPrerendered ${written.length}/${seoRoutes.length} routes.`);
console.log(`Sitemap written with ${seoRoutes.length} URLs (dist/sitemap.xml + public/sitemap.xml).`);

if (failures > 0) {
  console.error(`\n${failures} route(s) failed to prerender.`);
  process.exit(1);
}
