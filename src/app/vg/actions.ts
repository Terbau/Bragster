"use server";

import { isKnownVmUrl, isWorldCupHtml } from "./lib";

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

function isAllowedUrl(raw: string): boolean {
  try {
    const { protocol, hostname } = new URL(raw);
    if (protocol !== "https:") return false;
    return ALLOWED_HOSTS.has(hostname) || hostname.endsWith(".vg.no");
  } catch {
    return false;
  }
}

export async function checkArticleSpoiler(
  url: string,
): Promise<{ isWorldCup: boolean }> {
  if (!isAllowedUrl(url)) {
    throw new Error("Invalid URL: domain not allowed");
  }

  const res = await fetch(url, {
    signal: AbortSignal.timeout(8000),
    headers: { "User-Agent": UA },
  });

  if (!res.ok) throw new Error(`Article fetch failed: ${res.status}`);

  // If the article redirected to the VM hub, flag it without parsing HTML
  if (isKnownVmUrl(res.url)) return { isWorldCup: true };

  const html = await res.text();
  return { isWorldCup: isWorldCupHtml(html) };
}
