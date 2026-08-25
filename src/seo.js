// Central SEO configuration and runtime <head> management for the SPA.
//
// The site is client-rendered, so each route must update the document head on
// navigation. Without this every route would inherit index.html's homepage
// title/description, which search engines treat as duplicate content.

export const SITE_URL = "https://geotest-nine.vercel.app";
export const SITE_NAME = "GEOtest Engineering";
export const DEFAULT_IMAGE = `${SITE_URL}/images/geotest-og-image.png`;

// Per-route metadata. Titles are kept ~60 chars, descriptions ~155 chars, and
// each one is unique and keyword-focused.
export const routeSeo = {
  "/": {
    title: "GEOtest Engineering | Geotechnical Investigation & Design",
    description:
      "GEOtest Engineering delivers geotechnical investigations, reports, laboratory testing, design, supervision, consulting and monitoring in Kosovo.",
  },
  "/about": {
    title: "About Us | GEOtest Engineering",
    description:
      "A specialized geotechnical practice built on precise, responsible, site-specific engineering for safe and cost-efficient construction projects.",
  },
  "/projects": {
    title: "Geotechnical Projects | GEOtest Engineering",
    description:
      "Explore geotechnical projects by GEOtest Engineering: site investigations, geotechnical designs and technical monitoring delivered to technical standards.",
  },
  "/contact": {
    title: "Contact | GEOtest Engineering",
    description:
      "Contact GEOtest Engineering to start your geotechnical project. Reach us by email or phone, or send your project location and we'll respond with next steps.",
  },
  "/designing": {
    title: "Geotechnical Designing | GEOtest Engineering",
    description:
      "Geotechnical design services — buildable, efficient foundation, retaining and slope solutions adapted to the real behaviour of the terrain.",
  },
  "/supervision": {
    title: "Geotechnical Supervision | GEOtest Engineering",
    description:
      "Expert on-site supervision ensuring correct implementation of geotechnical recommendations and compliance with technical and safety standards.",
  },
  "/consulting": {
    title: "Geotechnical Consulting | GEOtest Engineering",
    description:
      "Focused geotechnical consulting for investors, designers and contractors during planning, construction and problem solving.",
  },
  "/geometric-investigation": {
    title: "Geometric Investigation | GEOtest Engineering",
    description:
      "Geometric investigation and monitoring — precise field measurement to support safe, data-driven geotechnical decisions.",
  },
  "/edit": {
    title: "Editor | GEOtest Engineering",
    description: "Private content editor for GEOtest Engineering.",
    robots: "noindex, nofollow",
  },
};

const canonicalFor = (path) => `${SITE_URL}${path === "/" ? "" : path}`;

const upsertMeta = (attr, key, content) => {
  if (!content) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
};

const upsertLink = (rel, href) => {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
};

// Applies the metadata for a given route path to the document head.
export const applySeo = (path) => {
  const meta = routeSeo[path] || routeSeo["/"];
  const url = canonicalFor(path);
  const image = meta.image || DEFAULT_IMAGE;

  document.title = meta.title;
  upsertMeta("name", "description", meta.description);
  upsertMeta("name", "robots", meta.robots || "index, follow");
  upsertLink("canonical", url);

  upsertMeta("property", "og:title", meta.title);
  upsertMeta("property", "og:description", meta.description);
  upsertMeta("property", "og:url", url);
  upsertMeta("property", "og:image", image);
  upsertMeta("property", "og:type", meta.type || "website");

  upsertMeta("name", "twitter:title", meta.title);
  upsertMeta("name", "twitter:description", meta.description);
  upsertMeta("name", "twitter:image", image);
};
