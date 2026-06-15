export type VgArticle = {
  id: string;
  url: string;
  headline: string;
  imageUrl: string | null;
  publishedAt: string | null;
};

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36";

function decodeXmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code: string) =>
      String.fromCharCode(Number(code)),
    );
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

    const headline = decodeXmlEntities(titleMatch[1].trim());
    const imageUrl = imgMatch
      ? decodeXmlEntities(imgMatch[1].trim())
      : null;
    const publishedAt = pubMatch ? pubMatch[1].trim() : null;

    articles.push({ id, url, headline, imageUrl, publishedAt });
  }

  return articles;
}

export async function fetchVgFrontPage(): Promise<VgArticle[]> {
  const res = await fetch("https://www.vg.no/rss/feed/?format=rss&limit=50", {
    cache: "no-store",
    headers: { "User-Agent": UA },
  });
  if (!res.ok) throw new Error(`VG RSS fetch failed: ${res.status}`);
  const xml = await res.text();
  return parseVgRss(xml);
}

export function isKnownVmUrl(url: string): boolean {
  return url.includes("vg.no/spesial/2026/fotball-vm/");
}

// VG articles use property="article:tag" content="Fotball-VM".
// VGTV uses name="keywords" content="Fotball-VM,...". Both are checked.
export function isWorldCupHtml(html: string): boolean {
  const metaTags = html.match(/<meta[^>]+>/g) ?? [];
  return metaTags.some(
    (tag) =>
      (tag.includes('property="article:tag"') &&
        tag.includes('content="Fotball-VM"')) ||
      (tag.includes('name="keywords"') &&
        /content="[^"]*Fotball-VM/.test(tag)),
  );
}
