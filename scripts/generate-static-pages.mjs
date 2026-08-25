// Post-build step: turn the single-page shell (dist/index.html) into a real
// HTML file per public route, each with its own <title>, meta description,
// canonical URL, Open Graph/Twitter tags and structured data.
//
// The site is a client-rendered SPA, so without this every deep link would
// serve the homepage's <head>. Search engines that render JS eventually see
// the runtime-updated head, but social scrapers and non-JS crawlers do not —
// this gives them correct, per-page metadata straight from the HTML.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { routeSeo, SITE_URL, DEFAULT_IMAGE } from "../src/seo.js";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const distDir = join(scriptDir, "..", "dist");
const templatePath = join(distDir, "index.html");

if (!existsSync(templatePath)) {
  console.warn("[seo] dist/index.html not found — did vite build run? Skipping.");
  process.exit(0);
}

const template = readFileSync(templatePath, "utf8");

// Route path -> output file name (relative to dist/).
const routeFiles = {
  "/": "index.html",
  "/about": "about.html",
  "/projects": "projects.html",
  "/contact": "contact.html",
  "/designing": "designing.html",
  "/supervision": "supervision.html",
  "/consulting": "consulting.html",
  "/geometric-investigation": "geometric-investigation.html",
};

const serviceRoutes = new Set([
  "/designing",
  "/supervision",
  "/consulting",
  "/geometric-investigation",
]);

const canonicalFor = (path) => `${SITE_URL}${path === "/" ? "" : path}`;
// The short page label is everything before the "|" in the title.
const pageLabel = (meta) => meta.title.split("|")[0].trim();

const escapeAttr = (value = "") =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// Replaces a meta tag's content by attribute (name/property), regardless of how
// the source tag is wrapped across lines.
const setMeta = (html, attr, key, value) => {
  const re = new RegExp(`<meta\\s+${attr}="${key}"\\s+content="[\\s\\S]*?"\\s*/>`, "i");
  return re.test(html)
    ? html.replace(re, `<meta ${attr}="${key}" content="${escapeAttr(value)}" />`)
    : html;
};

const FAQ = {
  "@type": "FAQPage",
  "@id": `${SITE_URL}/#faq`,
  mainEntity: [
    {
      "@type": "Question",
      name: "What is a geotechnical report?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A geotechnical report summarizes the soil, rock, groundwater, and foundation conditions of a site and gives technical recommendations for safe design and construction.",
      },
    },
    {
      "@type": "Question",
      name: "When is a geotechnical report required, and when is a geotechnical project needed?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A report is usually needed before design or construction when soil conditions must be confirmed. A geotechnical project is needed when technical solutions such as foundations, retaining systems, slopes, or anchors must be designed.",
      },
    },
    {
      "@type": "Question",
      name: "What is a geotechnical anchor, and do I need the neighbor's consent for installation?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "A geotechnical anchor transfers load into stable ground to support retaining structures or slopes. Consent depends on the project position, property boundary, local regulations, and whether anchors pass under neighboring land.",
      },
    },
    {
      "@type": "Question",
      name: "How can I contact GEOtest Engineering?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Use the contact section to send project information, location, and available documentation. We will review it and respond with the next practical steps.",
      },
    },
  ],
};

const buildRouteJsonLd = (path, meta) => {
  const url = canonicalFor(path);
  const label = pageLabel(meta);
  const graph = [];

  const crumbs = [{ name: "Home", item: `${SITE_URL}/` }];
  if (path !== "/") crumbs.push({ name: label, item: url });
  graph.push({
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: c.item,
    })),
  });

  if (serviceRoutes.has(path)) {
    graph.push({
      "@type": "Service",
      name: label,
      serviceType: label,
      description: meta.description,
      url,
      provider: { "@id": `${SITE_URL}/#business` },
      areaServed: { "@type": "Country", name: "Kosovo" },
    });
  }

  if (path === "/") graph.push(FAQ);

  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
  return `<script type="application/ld+json">${json}</script>`;
};

let written = 0;
for (const [path, file] of Object.entries(routeFiles)) {
  const meta = routeSeo[path];
  if (!meta) continue;

  const url = canonicalFor(path);
  const image = meta.image || DEFAULT_IMAGE;
  let html = template;

  html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${escapeAttr(meta.title)}</title>`);
  html = setMeta(html, "name", "description", meta.description);
  html = setMeta(html, "name", "robots", meta.robots || "index, follow");
  html = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/>/i,
    `<link rel="canonical" href="${url}" />`,
  );
  html = setMeta(html, "property", "og:title", meta.title);
  html = setMeta(html, "property", "og:description", meta.description);
  html = setMeta(html, "property", "og:url", url);
  html = setMeta(html, "property", "og:image", image);
  html = setMeta(html, "name", "twitter:title", meta.title);
  html = setMeta(html, "name", "twitter:description", meta.description);
  html = setMeta(html, "name", "twitter:image", image);

  html = html.replace("</head>", `  ${buildRouteJsonLd(path, meta)}\n  </head>`);

  writeFileSync(join(distDir, file), html, "utf8");
  written += 1;
}

console.log(`[seo] Generated ${written} static route pages.`);
