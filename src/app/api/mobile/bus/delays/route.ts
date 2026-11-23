import { type DelaySlot, getDelaySlots } from "@/lib/busDelays";
import { z } from "zod";
import { readJson, withMobileUser } from "../../_lib/handler";

const DelaysSchema = z.object({
  pairs: z
    .array(
      z.object({
        lineRef: z.string().regex(/^ATB:Line:[\w-]+$/),
        quay: z.string().regex(/^NSR:Quay:\d+$/),
      }),
    )
    .max(60),
  dayKind: z.enum(["weekday", "sat", "sun"]),
});

/** Kept for a while, as the table only changes once a week */
const CACHE_MS = 6 * 60 * 60 * 1000;
const cache = new Map<string, { at: number; slots: DelaySlot[] }>();

/**
 * How late these lines have really been at these stops, minute by minute of
 * the timetable, on the kind of day asked for
 */
export const POST = withMobileUser(async (request) => {
  const { pairs, dayKind } = DelaysSchema.parse(await readJson(request));
  const now = Date.now();
  const missing = pairs.filter((pair) => {
    const hit = cache.get(`${pair.lineRef}|${pair.quay}|${dayKind}`);
    return !hit || now - hit.at > CACHE_MS;
  });
  if (missing.length > 0) {
    const slots = await getDelaySlots(missing, dayKind);
    if (cache.size > 2000) cache.clear();
    for (const pair of missing) {
      cache.set(`${pair.lineRef}|${pair.quay}|${dayKind}`, {
        at: now,
        slots: slots.filter(
          (slot) => slot.lineRef === pair.lineRef && slot.quay === pair.quay,
        ),
      });
    }
  }
  return {
    slots: pairs.flatMap(
      (pair) =>
        cache.get(`${pair.lineRef}|${pair.quay}|${dayKind}`)?.slots ?? [],
    ),
  };
});
