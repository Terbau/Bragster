import AsyncStorage from "@react-native-async-storage/async-storage";

// Port of the website's src/app/vg/lib.ts and actions.ts. The app fetches VG
// directly since native apps aren't limited by CORS.

export type VgArticle = {
  id: string;
  url: string;
  headline: string;
  imageUrl: string | null;
  publishedAt: string | null;
};

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

// Confirmed by scanning VG's front page HTML. Any *.vg.no subdomain is also allowed.
const ALLOWED_HOSTS = new Set([
  "www.vg.no",
  "e24.no",
  "www.tek.no",
  "tv.vg.no",
  "vglive.vg.no",
  "tvguide.vg.no",
  "eavis.vg.no",
]);

function decodeXmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)));
}

export function isKnownVmUrl(url: string): boolean {
  return url.includes("vg.no/spesial/2026/fotball-vm/");
}

export function parseVgRss(xml: string): VgArticle[] {
  const seen = new Set<string>();
  const articles: VgArticle[] = [];

  for (const item of xml.split("<item>").slice(1)) {
    const titleMatch = item.match(/<title>([\s\S]*?)<\/title>/);
    const linkMatch = item.match(/<link>([\s\S]*?)<\/link>/);
    const guidMatch = item.match(/<guid>([\s\S]*?)<\/guid>/);
    const imgMatch = item.match(/<vg:img>([\s\S]*?)<\/vg:img>/);
    const pubMatch = item.match(/<pubDate>([\s\S]*?)<\/pubDate>/);

    if (!titleMatch || !linkMatch || !guidMatch) continue;

    const url = linkMatch[1].trim();
    if (isKnownVmUrl(url)) continue;

    // guid is "https://www.vg.no/i/XXXXX" — last segment is the id
    const id = guidMatch[1].trim().split("/").pop() ?? "";
    if (!id || seen.has(id)) continue;
    seen.add(id);

    articles.push({
      id,
      url,
      headline: decodeXmlEntities(titleMatch[1].trim()),
      imageUrl: imgMatch ? decodeXmlEntities(imgMatch[1].trim()) : null,
      publishedAt: pubMatch ? pubMatch[1].trim() : null,
    });
  }

  return articles;
}

export async function fetchVgFrontPage(): Promise<VgArticle[]> {
  const res = await fetch("https://www.vg.no/rss/feed/?format=rss&limit=50", {
    headers: { "User-Agent": UA, "Cache-Control": "no-cache" },
  });
  if (!res.ok) throw new Error(`VG RSS fetch failed: ${res.status}`);
  return parseVgRss(await res.text());
}

// VG articles use property="article:tag" content="Fotball-VM".
// VGTV uses name="keywords" content="Fotball-VM,...". Both are checked.
export function isWorldCupHtml(html: string): boolean {
  const metaTags = html.match(/<meta[^>]+>/g) ?? [];
  return metaTags.some(
    (tag) =>
      (tag.includes('property="article:tag"') &&
        tag.includes('content="Fotball-VM"')) ||
      (tag.includes('name="keywords"') && /content="[^"]*Fotball-VM/.test(tag)),
  );
}

function isAllowedUrl(raw: string): boolean {
  const match = raw.match(/^https:\/\/([^/?#]+)/);
  if (!match) return false;
  const hostname = match[1].toLowerCase();
  return ALLOWED_HOSTS.has(hostname) || hostname.endsWith(".vg.no");
}

export async function checkArticleSpoiler(url: string): Promise<{ isWorldCup: boolean }> {
  if (!isAllowedUrl(url)) {
    throw new Error("Invalid URL: domain not allowed");
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { "User-Agent": UA },
    });
    if (!res.ok) throw new Error(`Article fetch failed: ${res.status}`);

    // If the article redirected to the VM hub, flag it without parsing HTML
    if (isKnownVmUrl(res.url)) return { isWorldCup: true };

    return { isWorldCup: isWorldCupHtml(await res.text()) };
  } finally {
    clearTimeout(timeout);
  }
}

const CACHE_KEY = "vg-spoiler-cache-v1";

let spoilerCache: Record<string, boolean> | null = null;
let pendingWrite = Promise.resolve();

export async function readSpoilerCache(): Promise<Record<string, boolean>> {
  if (!spoilerCache) {
    try {
      spoilerCache = JSON.parse(
        (await AsyncStorage.getItem(CACHE_KEY)) ?? "{}",
      ) as Record<string, boolean>;
    } catch {
      spoilerCache = {};
    }
  }
  return spoilerCache;
}

export function writeSpoilerCache(url: string, isWorldCup: boolean) {
  // Checks run concurrently, so writes are chained to not lose any results
  pendingWrite = pendingWrite
    .then(async () => {
      const cache = await readSpoilerCache();
      cache[url] = isWorldCup;
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    })
    .catch(() => {
      // storage unavailable — no-op
    });
}
