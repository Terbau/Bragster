import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  type DelaySlot,
  findSlot,
  getOutlook,
  historyPairs,
  type SlotLookup,
  spread,
  suggestFromHistory,
} from "../delay-history";
import type { TripLeg, TripPattern } from "../trip-planner";

/** Tuesday 24 November 2026, local time */
const at = (hm: string) => {
  const [h, m] = hm.split(":").map(Number);
  return new Date(2026, 10, 24, h, m).getTime();
};
const minuteOf = (hm: string) => {
  const [h, m] = hm.split(":").map(Number);
  return h * 60 + m;
};

const place = (name: string, quayId: string | null) => ({
  name,
  latitude: 63.4,
  longitude: 10.4,
  quayId,
  platform: null,
});

function bus(
  line: string,
  from: [string, string],
  to: [string, string],
  dep: string,
  arr: string,
): TripLeg {
  return {
    mode: "bus",
    rented: false,
    network: null,
    from: place(from[0], from[1]),
    to: place(to[0], to[1]),
    start: at(dep),
    end: at(arr),
    realtime: true,
    distance: 3000,
    line,
    lineRef: `ATB:Line:2_${line}`,
    headsign: null,
    journeyId: `ATB:ServiceJourney:${line}_${dep}`,
    date: "2026-11-24",
    fromPosition: 1,
    toPosition: 5,
    aimedStart: at(dep),
    aimedEnd: at(arr),
  };
}

function walk(start: string, end: string): TripLeg {
  return {
    ...bus("x", ["a", "q"], ["b", "q"], start, end),
    mode: "foot",
    line: null,
    lineRef: null,
    journeyId: null,
    date: null,
    fromPosition: null,
    toPosition: null,
    aimedStart: null,
    aimedEnd: null,
  };
}

const route = (...legs: TripLeg[]): TripPattern => ({
  legs,
  start: legs[0].start,
  end: legs[legs.length - 1].end,
});

const LERKENDAL_4 = "NSR:Quay:73420";
const HAUGNESSVINGEN = "NSR:Quay:2";
const BERG = "NSR:Quay:3";
const LERKENDAL_2 = "NSR:Quay:4";
const RATESVINGEN = "NSR:Quay:5";

/** Seconds late: p10, p25, p50, p75, p90 */
function slot(
  line: string,
  quay: string,
  hm: string,
  q: { dep?: number[]; arr?: number[]; snapBack?: number },
): DelaySlot {
  return {
    lineRef: `ATB:Line:2_${line}`,
    quay,
    minute: minuteOf(hm),
    n: 60,
    departure: q.dep ?? null,
    arrival: q.arr ?? null,
    early10: 0,
    snapBack: q.snapBack ?? 0,
  };
}

// From the real history of these departures, 25 Aug - 20 Nov 2026
const SLOTS: DelaySlot[] = [
  slot("18", LERKENDAL_4, "08:14", {
    dep: [150, 190, 246, 323, 389],
    snapBack: 0.18,
  }),
  slot("18", HAUGNESSVINGEN, "08:22", { arr: [144, 200, 258, 340, 456] }),
  slot("18", LERKENDAL_4, "08:24", { dep: [120, 160, 198, 270, 330] }),
  slot("18", HAUGNESSVINGEN, "08:32", { arr: [84, 140, 204, 300, 378] }),
  slot("14", BERG, "08:13", { dep: [102, 170, 246, 340, 462] }),
  slot("14", LERKENDAL_2, "08:16", { arr: [102, 180, 252, 380, 504] }),
  slot("10", LERKENDAL_2, "08:18", { dep: [114, 170, 252, 340, 486] }),
  slot("10", RATESVINGEN, "08:29", { arr: [-24, 40, 132, 250, 408] }),
];
const lookup: SlotLookup = (lineRef, quay) =>
  SLOTS.filter((s) => s.lineRef === lineRef && s.quay === quay);

// Lars Onsagers veg 9 to Fossegrenda 9, to be there by 08:40
const via18At0814 = route(
  walk("08:03", "08:14"),
  bus(
    "18",
    ["Lerkendal", LERKENDAL_4],
    ["Haugnessvingen", HAUGNESSVINGEN],
    "08:14",
    "08:22",
  ),
  walk("08:22", "08:27"),
);
const via18At0824 = route(
  walk("08:13", "08:24"),
  bus(
    "18",
    ["Lerkendal", LERKENDAL_4],
    ["Haugnessvingen", HAUGNESSVINGEN],
    "08:24",
    "08:32",
  ),
  walk("08:32", "08:37"),
);
const via14And10 = route(
  walk("08:09", "08:13"),
  bus(
    "14",
    ["Berg studentby", BERG],
    ["Lerkendal", LERKENDAL_2],
    "08:13",
    "08:16",
  ),
  bus(
    "10",
    ["Lerkendal", LERKENDAL_2],
    ["Ratesvingen", RATESVINGEN],
    "08:18",
    "08:29",
  ),
);
const deadline = at("08:40");

describe("history of delays", () => {
  it("finds the same departure by its timetable minute", () => {
    const slots = lookup("ATB:Line:2_18", LERKENDAL_4);
    assert.equal(
      findSlot(slots, at("08:15"), "departure")?.minute,
      minuteOf("08:14"),
    );
    assert.equal(findSlot(slots, at("08:19"), "departure"), null);
    // Not where it only arrives
    assert.equal(findSlot(slots, at("08:14"), "arrival"), null);
  });

  it("spreads quantiles out over the days", () => {
    const days = spread([60, 120, 180, 240, 300]);
    assert.equal(days.length, 10);
    assert.ok(days[0] < 60 && days[9] > 300);
    assert.equal(Math.round((days[4] + days[5]) / 2), 180);
  });

  it("says when you'd usually be there, and how often in time", () => {
    const late = getOutlook(via18At0824, lookup, deadline);
    assert.ok(late?.arrival);
    // 08:37 by the plan, with the bus 3.4 min late
    assert.equal(late.arrival.usual, at("08:37") + 204_000);
    assert.ok(late.onTime! > 0.2 && late.onTime! < 0.8, `${late.onTime}`);
    const early = getOutlook(via18At0814, lookup, deadline);
    assert.equal(early?.onTime, 1);
    assert.equal(early?.legs[0].departure?.usual, 246_000);
    assert.equal(early?.legs[0].snapBack, 0.18);
  });

  it("says how often a change of bus is missed", () => {
    const outlook = getOutlook(via14And10, lookup, deadline);
    assert.equal(outlook?.transfers.length, 1);
    const missed = outlook!.transfers[0].missed;
    assert.ok(missed > 0.2 && missed < 0.7, `${missed}`);
  });

  it("suggests the earlier bus when the planned one is often too late", () => {
    const suggestion = suggestFromHistory(
      via18At0824,
      [via18At0824, via18At0814, via14And10],
      lookup,
      deadline,
    );
    assert.equal(suggestion?.pattern, via18At0814);
    assert.equal(suggestion?.reason, "late");
    assert.ok(suggestion!.current.onTime! < 0.8);
  });

  it("suggests nothing when the route is fine, or isn't known", () => {
    assert.equal(
      suggestFromHistory(
        via18At0814,
        [via18At0814, via18At0824],
        lookup,
        deadline,
      ),
      null,
    );
    const none: SlotLookup = () => [];
    assert.equal(
      suggestFromHistory(
        via18At0824,
        [via18At0824, via18At0814],
        none,
        deadline,
      ),
      null,
    );
  });

  it("looks up each line at the stops it's got on and off at", () => {
    const pairs = historyPairs([via14And10]);
    assert.deepEqual(
      pairs.map((pair) => `${pair.lineRef}|${pair.quay}`).sort(),
      [
        `ATB:Line:2_10|${LERKENDAL_2}`,
        `ATB:Line:2_10|${RATESVINGEN}`,
        `ATB:Line:2_14|${BERG}`,
        `ATB:Line:2_14|${LERKENDAL_2}`,
      ],
    );
  });
});
