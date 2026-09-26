import { createHash } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { basename, dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const projectDir = join(scriptDir, "..");
const snapshotPath = join(projectDir, "public", "cms-snapshot.json");
const mediaDir = join(projectDir, "public", "cms-media");
const stagedMediaDir = join(projectDir, "public", ".cms-media-next");

const supabaseUrl =
  process.env.SUPABASE_URL ||
  process.env.supabase_url ||
  process.env.SUPABASE_AURL ||
  process.env.supabase_aurl ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.VITE_SUPABASE_URL;
const supabaseAnonKey =
  process.env.SUPABASE_ANON_KEY ||
  process.env.supabase_anon_key ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("[cms] Supabase build variables are absent; keeping the existing static snapshot.");
  process.exit(0);
}

const sectionKeys = [
  "inline_text",
  "inline_images",
  "projects.list",
  "projects.filters",
  "list_items.custom",
  "list_items.hidden",
];
const query = new URL(`${supabaseUrl.replace(/\/$/, "")}/rest/v1/website_cards`);
query.searchParams.set("select", "*");
query.searchParams.set("section_key", `in.(${sectionKeys.join(",")})`);
query.searchParams.set("is_published", "eq.true");
query.searchParams.set("order", "sort_order.asc");

const response = await fetch(query, {
  headers: {
    apikey: supabaseAnonKey,
    Authorization: `Bearer ${supabaseAnonKey}`,
  },
  cache: "no-store",
});

if (!response.ok) {
  throw new Error(`[cms] Could not create the static snapshot (${response.status}): ${await response.text()}`);
}

const records = await response.json();
if (!Array.isArray(records)) throw new Error("[cms] Supabase returned an invalid CMS response.");

rmSync(stagedMediaDir, { recursive: true, force: true });
mkdirSync(stagedMediaDir, { recursive: true });
const downloadedUrls = new Map();

const localizeImage = async (sourceUrl, version = "") => {
  if (!sourceUrl || sourceUrl.startsWith("/")) return sourceUrl;
  if (downloadedUrls.has(sourceUrl)) return downloadedUrls.get(sourceUrl);

  const remoteUrl = new URL(sourceUrl);
  if (version) remoteUrl.searchParams.set("cmsv", version);

  const imageResponse = await fetch(remoteUrl, { cache: "no-store" });
  if (!imageResponse.ok) {
    throw new Error(`[cms] Could not download ${sourceUrl} (${imageResponse.status}).`);
  }

  const originalExtension = extname(new URL(sourceUrl).pathname).toLowerCase();
  const extension = [".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"].includes(originalExtension)
    ? originalExtension
    : ".webp";
  const sourceName = basename(new URL(sourceUrl).pathname, originalExtension)
    .replace(/[^a-z0-9-]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(-60) || "cms-image";
  const digest = createHash("sha256").update(`${sourceUrl}:${version}`).digest("hex").slice(0, 12);
  const fileName = `${sourceName}-${digest}${extension}`;
  writeFileSync(join(stagedMediaDir, fileName), Buffer.from(await imageResponse.arrayBuffer()));

  const localUrl = `/cms-media/${fileName}`;
  downloadedUrls.set(sourceUrl, localUrl);
  return localUrl;
};

try {
  for (const record of records) {
    if (record.image_url) {
      record.image_url = await localizeImage(record.image_url, record.updated_at);
    }

    if (Array.isArray(record.metadata?.gallery)) {
      for (const photo of record.metadata.gallery) {
        if (photo?.url) photo.url = await localizeImage(photo.url, record.updated_at);
      }
    }
  }

  rmSync(mediaDir, { recursive: true, force: true });
  renameSync(stagedMediaDir, mediaDir);
  writeFileSync(
    snapshotPath,
    `${JSON.stringify({ generatedAt: new Date().toISOString(), records }, null, 2)}\n`,
  );
  console.log(`[cms] Published ${records.length} records and ${downloadedUrls.size} local images.`);
} catch (error) {
  rmSync(stagedMediaDir, { recursive: true, force: true });
  if (existsSync(snapshotPath)) {
    JSON.parse(readFileSync(snapshotPath, "utf8"));
  }
  throw error;
}
