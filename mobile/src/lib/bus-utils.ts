/**
 * Shared helpers for all Entur / AtB bus features: coordinates, distance,
 * clock formatting, timeouts, GraphQL calls, and service alert extraction.
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

/** Search results are sorted by how close they are to the city centre */
export const TRONDHEIM: Coordinates = { latitude: 63.4305, longitude: 10.3951 };

/** Trøndelag, so stops and places elsewhere in Norway are left out */
export const TRONDELAG_COUNTY = "KVE:TopographicPlace:50";

export const JOURNEY_PLANNER_URL =
  "https://api.entur.io/journey-planner/v3/graphql";

/** Entur asks every client to say who it is */
export const ENTUR_HEADERS = {
  "ET-Client-Name": "bragster-mobile",
  "Content-Type": "application/json",
};

/** A service disruption or notice from AtB / Entur (SIRI-SX) */
export interface ServiceSituation {
  id: string;
  summary: string;
  description: string | null;
}

export interface LocalizedText {
  value: string;
  language?: string | null;
}

/** Metres between two places, as the crow flies */
export function metresBetween(a: Coordinates, b: Coordinates): number {
  const radians = Math.PI / 180;
  const dLat = (b.latitude - a.latitude) * radians;
  const dLon = (b.longitude - a.longitude) * radians;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(a.latitude * radians) *
      Math.cos(b.latitude * radians) *
      Math.sin(dLon / 2) ** 2;
  return 2 * 6_371_000 * Math.asin(Math.sqrt(h));
}

/** Like "14:32", the same on every phone */
export function formatClock(time: Date | number): string {
  const date = typeof time === "number" ? new Date(time) : time;
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
}

/** `fetch` with an AbortController timeout so slow APIs never stall polling */
export async function fetchWithTimeout(
  url: string,
  init: RequestInit = {},
  timeoutMs = 10_000,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error("Request timed out");
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export async function enturGraphql<T>(
  url: string,
  query: string,
  variables: Record<string, unknown>,
  timeoutMs = 10_000,
): Promise<T> {
  const response = await fetchWithTimeout(
    url,
    {
      method: "POST",
      headers: ENTUR_HEADERS,
      body: JSON.stringify({ query, variables }),
    },
    timeoutMs,
  );
  if (!response.ok) {
    throw new Error(`Couldn't reach Entur (${response.status})`);
  }
  const body = (await response.json()) as {
    data?: T;
    errors?: { message: string }[];
  };
  if (!body.data) {
    throw new Error(body.errors?.[0]?.message ?? "Entur sent no data");
  }
  return body.data;
}

/** Picks the best human-readable text from Entur's localized array */
export function pickLocalizedText(
  entries: LocalizedText[] | null | undefined,
): string | null {
  if (!entries || entries.length === 0) return null;
  const nonEmpty = entries.filter((entry) => entry.value.trim().length > 0);
  if (nonEmpty.length === 0) return null;
  const preferred =
    nonEmpty.find((e) => e.language === "en") ??
    nonEmpty.find((e) => e.language === "no" || e.language === "nb") ??
    nonEmpty[0];
  return preferred.value.trim();
}

export interface RawSituation {
  id: string;
  summary?: LocalizedText[] | null;
  description?: LocalizedText[] | null;
}

/** Deduplicates and formats raw Entur situations */
export function parseSituations(
  raw: (RawSituation | null | undefined)[] | null | undefined,
): ServiceSituation[] {
  if (!raw || raw.length === 0) return [];
  const seen = new Set<string>();
  const result: ServiceSituation[] = [];
  for (const item of raw) {
    if (!item || seen.has(item.id)) continue;
    const summary = pickLocalizedText(item.summary);
    const description = pickLocalizedText(item.description);
    if (!summary && !description) continue;
    seen.add(item.id);
    result.push({
      id: item.id,
      summary: summary ?? description!,
      description: summary && description && description !== summary ? description : null,
    });
  }
  return result;
}
