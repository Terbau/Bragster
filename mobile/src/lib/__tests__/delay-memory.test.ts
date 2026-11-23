import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  type DelayRecord,
  observeCalls,
  observeLeg,
  predictDeparture,
  quantile,
  settle,
} from "../delay-memory";
import type { TripCall } from "../entur";
import { formatWhen, getLeaveBy, getStep } from "../journey-logic";
import { preferTransit, type TripLeg, type TripPattern } from "../trip-planner";

const MIN = 60_000;
/** A Monday, 08:13 local time */
const aimedAt = (daysAgo: number) =>
  new Date(2026, 10, 23 - daysAgo * 7, 8, 13).getTime();

function busLeg(overrides: Partial<TripLeg> = {}): TripLeg {
  const aimed = aimedAt(0);
  return {
    mode: "bus",
    rented: false,
    network: null,
    from: {
      name: "Lerkendal",
      latitude: 63.41,
      longitude: 10.4,
      quayId: "NSR:Quay:73420",
      platform: "4",
    },
    to: {
      name: "Haugnessvingen",
      latitude: 63.39,
      longitude: 10.4,
      quayId: "NSR:Quay:2",
      platform: null,
    },
    start: aimed + 10 * MIN,
    end: aimed + 22 * MIN,
    realtime: true,
    distance: 3300,
    line: "18",
    headsign: "Tiller",
    journeyId: "ATB:ServiceJourney:18_today",
    date: "2026-11-23",
    fromPosition: 12,
    toPosition: 20,
    aimedStart: aimed,
    ...overrides,
  };
}

function walkLeg(start: number, end: number, distance: number): TripLeg {
  return {
    ...busLeg(),
    mode: "foot",
    start,
    end,
    distance,
    line: null,
    headsign: null,
    journeyId: null,
    date: null,
    fromPosition: null,
    toPosition: null,
    aimedStart: null,
  };
}

/** Earlier Mondays: showed `shown` min late 15 min before, left `actual` late */
function learned(shownActual: [number, number][]): DelayRecord[] {
  return shownActual.map(([shown, actual], index) => ({
    journeyId: `ATB:ServiceJourney:18_${index}`,
    date: "2026-11-01",
    fromPosition: 12,
    line: "18",
    quayId: "NSR:Quay:73420",
    stopName: "Lerkendal 4",
    aimed: aimedAt(index + 1),
    snapshots: [
      { lead: 25 * MIN, delay: (shown * MIN) / 2 },
      { lead: 15 * MIN, delay: shown * MIN },
      { lead: 1 * MIN, delay: actual * MIN },
    ],
    actualDelay: actual * MIN,
  }));
}

describe("delay memory", () => {
  it("notes what a bus shows, not more than about once a minute", () => {
    const leg = busLeg();
    const now = leg.start - 15 * MIN;
    let records = observeLeg([], leg, now);
    records = observeLeg(records, leg, now + 20_000);
    assert.equal(records.length, 1);
    assert.equal(records[0].snapshots.length, 1);
    records = observeLeg(
      records,
      { ...leg, start: leg.start + MIN },
      now + MIN,
    );
    assert.equal(records[0].snapshots.length, 2);
    assert.equal(records[0].snapshots[1].delay, 11 * MIN);
    // Not walks, nor buses that are too far off
    assert.equal(observeLeg([], walkLeg(now, now + MIN, 100), now).length, 0);
    assert.equal(observeLeg([], leg, leg.start - 60 * MIN).length, 0);
  });

  it("learns when the bus really left", () => {
    const leg = busLeg();
    const records = observeLeg([], leg, leg.start - 10 * MIN);
    const call = {
      position: 12,
      cancelled: false,
      realtime: true,
      expectedDeparture: new Date(leg.aimedStart! + 3 * MIN),
      actualDeparture: new Date(leg.aimedStart! + 3 * MIN),
    } as TripCall;
    const next = observeCalls(records, leg.journeyId!, [call], leg.start);
    assert.equal(next[0].actualDelay, 3 * MIN);
    // A cancelled one is forgotten
    const cancelled = observeCalls(
      records,
      leg.journeyId!,
      [{ ...call, cancelled: true, actualDeparture: null }],
      leg.start,
    );
    assert.equal(cancelled.length, 0);
  });

  it("takes what it showed just before as when it left, when not known", () => {
    const leg = busLeg({ start: aimedAt(0) + 4 * MIN });
    const records = observeLeg([], leg, leg.start - 60_000);
    assert.equal(settle(records, leg.start + MIN)[0].actualDelay, null);
    assert.equal(settle(records, leg.start + 4 * MIN)[0].actualDelay, 4 * MIN);
    // Never seen close to leaving, it's given up on
    const far = observeLeg([], leg, leg.start - 20 * MIN);
    assert.equal(settle(far, leg.start + 21 * MIN).length, 0);
  });

  it("says a line that makes up its delay leaves earlier than it shows", () => {
    // Showed 10 min late, left 2-4 min late
    const records = learned([
      [10, 3],
      [9, 2],
      [11, 4],
      [10, 3],
    ]);
    const leg = busLeg();
    const likely = predictDeparture(records, leg, leg.start - 15 * MIN);
    assert.ok(likely);
    assert.equal(likely.samples, 4);
    // About a quarter of the 10 min shown, planned for the ones that made up most
    const delay = (likely.time - leg.aimedStart!) / MIN;
    assert.ok(delay > 2 && delay < 3, `delay ${delay}`);
  });

  it("says nothing without enough trips, or when the delays were real", () => {
    const leg = busLeg();
    const now = leg.start - 15 * MIN;
    assert.equal(
      predictDeparture(
        learned([
          [10, 3],
          [10, 3],
        ]),
        leg,
        now,
      ),
      null,
    );
    const real = learned([
      [10, 10],
      [9, 9],
      [11, 10],
    ]);
    assert.equal(predictDeparture(real, leg, now), null);
    // Another line, stop or time of day isn't taken as the same
    const records = learned([
      [10, 3],
      [10, 3],
      [10, 3],
    ]);
    assert.equal(predictDeparture(records, { ...leg, line: "3" }, now), null);
    const evening = busLeg({
      aimedStart: aimedAt(0) + 10 * 60 * MIN,
      start: aimedAt(0) + 10 * 60 * MIN + 10 * MIN,
    });
    assert.equal(predictDeparture(records, evening, now), null);
    // Hardly late, nothing to catch up
    assert.equal(
      predictDeparture(records, { ...leg, start: leg.aimedStart! + MIN }, now),
      null,
    );
  });

  it("quantile goes between the values", () => {
    assert.equal(quantile([4, 1, 3, 2], 0), 1);
    assert.equal(quantile([4, 1, 3, 2], 1), 4);
    assert.equal(quantile([1, 2, 3, 4, 5], 0.25), 2);
  });
});

describe("leaving earlier for a bus that catches up", () => {
  const bus = busLeg();
  const walk = walkLeg(bus.start - 10 * MIN, bus.start - MIN, 770);
  const likely = { time: bus.aimedStart! + 3 * MIN, samples: 4 };
  const plan: TripPattern = {
    legs: [walk, { ...bus, likely }],
    start: walk.start,
    end: bus.end,
  };

  it("leaves the walk before when it likely leaves", () => {
    const leaveBy = getLeaveBy(plan);
    assert.equal(leaveBy?.time, likely.time - 9 * MIN);
    assert.equal(getLeaveBy({ ...plan, legs: [walk, bus] }), null);
  });

  it("counts down to it while waiting to leave and walking", () => {
    const base = {
      destination: "Fossegrenda 9",
      plan,
      legIndex: 0,
      isRiding: false,
      location: null,
      staying: null,
      bus: null,
      hasArrived: false,
      problem: null,
    };
    const scheduled = getStep({
      ...base,
      isWaitingToLeave: true,
      scheduled: { mode: "arriveBy", time: bus.end + 5 * MIN },
    });
    assert.equal(scheduled.countdownTo, likely.time - 9 * MIN);
    assert.match(scheduled.detail ?? "", /often leaves/);
    // Before setting off: when to start walking, 770 m at 1.3 m/s before it
    const now = walk.start - 5 * MIN;
    const before = getStep({ ...base, now, walkSpeed: 1.3 });
    assert.equal(before.countdownLabel, "Start walking in");
    assert.equal(before.countdownTo, likely.time - (770 / 1.3) * 1000);
    assert.equal(before.secondaryCountdownTo, likely.time);
    assert.equal(before.secondaryCountdownLabel, "Line 18 likely leaves in");
    // On the way: when you're at the stop, from how far there is left
    const location = {
      latitude: walk.to.latitude,
      longitude: walk.to.longitude,
    };
    const onTheWay = getStep({
      ...base,
      now,
      walkSpeed: 1.3,
      hasSetOff: true,
      location,
    });
    assert.equal(onTheWay.countdownLabel, "At the stop in");
    assert.equal(onTheWay.countdownTo, now);
    assert.equal(onTheWay.secondaryCountdownTo, likely.time);
  });

  it("says when it's tomorrow", () => {
    const now = new Date(2026, 10, 23, 21, 0).getTime();
    assert.equal(
      formatWhen(new Date(2026, 10, 23, 22, 0).getTime(), now),
      "22:00",
    );
    assert.equal(
      formatWhen(new Date(2026, 10, 24, 8, 40).getTime(), now),
      "tomorrow 08:40",
    );
  });
});

describe("mostly by bus", () => {
  const bus = busLeg();
  const route = (walked: number[], withBus = true): TripPattern => ({
    legs: [...walked.map((m) => walkLeg(0, 1, m)), ...(withBus ? [bus] : [])],
    start: 0,
    end: 1,
  });

  it("leaves out walking all the way, and walking a lot more", () => {
    const short = route([240, 50]);
    const long = route([916, 48]);
    const walkOnly = route([2500], false);
    assert.deepEqual(preferTransit([walkOnly, long, short]), [short]);
  });

  it("keeps routes that only walk a little more", () => {
    const short = route([240]);
    const bitMore = route([420]);
    assert.deepEqual(preferTransit([bitMore, short]), [bitMore, short]);
  });

  it("keeps walking when there's no bus", () => {
    const walkOnly = route([2500], false);
    assert.deepEqual(preferTransit([walkOnly]), [walkOnly]);
  });
});
