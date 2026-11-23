import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatClock,
  metresBetween,
  parseSituations,
  TRONDHEIM,
} from "../bus-utils";
import {
  type ActiveVehicle,
  getBusProgress,
  type TripCall,
  type VehiclePosition,
} from "../entur";
import {
  estimatePlan,
  findBoardedVehicle,
  getNextStop,
  getStep,
  withRide,
} from "../journey-logic";
import { buildReport, replayBaseline } from "../journey-report";
import { getCamera, getDots, getLegShape, getTappedRoute } from "../route-shape";
import {
  computeSightline,
  correctSightline,
  decodePolyline,
  getDistanceToStop,
} from "../sightline";
import type { TripLeg, TripPattern } from "../trip-planner";

function makeCall(
  position: number,
  name: string,
  minuteOffset: number,
  overrides: Partial<TripCall> = {},
): TripCall {
  const base = Date.UTC(2026, 10, 22, 12, 0, 0);
  const t = new Date(base + minuteOffset * 60_000);
  return {
    position,
    quayId: `NSR:Quay:${position}`,
    name,
    platform: null,
    latitude: TRONDHEIM.latitude + position * 0.002,
    longitude: TRONDHEIM.longitude,
    aimedArrival: t,
    expectedArrival: t,
    expectedDeparture: t,
    actualArrival: null,
    actualDeparture: null,
    realtime: true,
    cancelled: false,
    situations: [],
    ...overrides,
  };
}

describe("bus-utils", () => {
  it("computes accurate haversine distance", () => {
    const a = { latitude: 63.4305, longitude: 10.3951 };
    const b = { latitude: 63.4395, longitude: 10.3951 }; // ~1 km north
    const dist = metresBetween(a, b);
    assert.ok(dist > 990 && dist < 1010, `expected ~1000m, got ${dist}`);
  });

  it("formats clock times consistently", () => {
    const d = new Date(2026, 10, 22, 9, 5, 0);
    assert.equal(formatClock(d), "09:05");
    assert.equal(formatClock(d.getTime()), "09:05");
  });

  it("deduplicates and prefers English/Norwegian situations", () => {
    const situations = parseSituations([
      {
        id: "s1",
        summary: [
          { value: "Omkjøring", language: "no" },
          { value: "Detour on line 3", language: "en" },
        ],
        description: [{ value: "Roadworks at Torvet", language: "en" }],
      },
      {
        id: "s1",
        summary: [{ value: "Duplicate", language: "en" }],
      },
    ]);
    assert.equal(situations.length, 1);
    assert.equal(situations[0].summary, "Detour on line 3");
    assert.equal(situations[0].description, "Roadworks at Torvet");
  });
});

describe("getBusProgress", () => {
  const base = Date.UTC(2026, 10, 22, 12, 0, 0);

  it("does not let stale vehicle.atStop overwrite confirmed actualDeparture", () => {
    const calls = [
      makeCall(0, "Start", 0, {
        actualArrival: new Date(base),
        actualDeparture: new Date(base + 10_000),
      }),
      makeCall(1, "Your Stop", 3, {
        actualArrival: new Date(base + 180_000),
        actualDeparture: new Date(base + 195_000),
      }),
    ];
    const staleVehicle: VehiclePosition = {
      lastStopPosition: 1,
      atStop: true,
      progressToNext: 0,
      latitude: calls[1].latitude!,
      longitude: calls[1].longitude!,
      updatedAt: new Date(base + 185_000),
    };
    const progress = getBusProgress(calls, 1, staleVehicle, base + 200_000);
    assert.equal(progress?.status, "departed");
  });

  it("waits to fill progress bar while vehicle is still standing at previousStop", () => {
    const calls = [
      makeCall(0, "Prev", 0, {
        expectedDeparture: new Date(base + 30_000),
        actualArrival: new Date(base),
      }),
      makeCall(1, "Mine", 3),
    ];
    const vehicle: VehiclePosition = {
      lastStopPosition: 0,
      atStop: true,
      progressToNext: 0,
      latitude: calls[0].latitude!,
      longitude: calls[0].longitude!,
      updatedAt: new Date(base + 5_000),
    };
    const progress = getBusProgress(calls, 1, vehicle, base + 5_000);
    assert.equal(progress?.status, "approaching");
    assert.equal(progress?.segment?.start, base + 30_000);
  });

  it("returns cancelled when target stop is cancelled", () => {
    const calls = [
      makeCall(0, "Prev", 0),
      makeCall(1, "Mine", 3, { cancelled: true }),
    ];
    const progress = getBusProgress(calls, 1, null, base);
    assert.equal(progress?.status, "cancelled");
  });
});

describe("journey-logic", () => {
  const base = Date.UTC(2026, 10, 22, 12, 0, 0);

  const busLeg: TripLeg = {
    mode: "bus",
    rented: false,
    network: null,
    from: {
      name: "Stop A",
      latitude: TRONDHEIM.latitude,
      longitude: TRONDHEIM.longitude,
      quayId: "NSR:Quay:0",
      platform: "P1",
    },
    to: {
      name: "Stop B",
      latitude: TRONDHEIM.latitude + 0.002,
      longitude: TRONDHEIM.longitude,
      quayId: "NSR:Quay:1",
      platform: null,
    },
    start: base,
    end: base + 180_000,
    realtime: true,
    distance: 500,
    line: "3",
    headsign: "Lohove",
    journeyId: "ATB:ServiceJourney:3_1",
    date: "2026-11-22",
    fromPosition: 0,
    toPosition: 1,
    geometry: "_p~iF~ps|U_ulLnnqC",
    stops: [],
  };

  it("withRide drops stale geometry and preserves platform when extended past original stop", () => {
    const calls = [
      makeCall(0, "Stop A", 0, {
        actualDeparture: new Date(base),
      }),
      makeCall(1, "Stop B", 3, {
        actualDeparture: new Date(base + 180_000),
      }),
      makeCall(2, "Stop C", 6, { platform: "P2" }),
    ];
    const next = getNextStop(busLeg, calls, null, base + 190_000);
    assert.ok(next);
    assert.equal(next.call.position, 2);

    const onwards: TripPattern = {
      start: base + 360_000,
      end: base + 600_000,
      legs: [
        {
          ...busLeg,
          mode: "foot",
          journeyId: null,
          line: null,
          fromPosition: null,
          toPosition: null,
          start: base + 360_000,
          end: base + 600_000,
        },
      ],
    };
    const merged = withRide(busLeg, onwards, next, calls);
    assert.equal(merged.legs[0].to.name, "Stop C");
    assert.equal(merged.legs[0].to.platform, "P2");
    assert.equal(merged.legs[0].geometry, null);
    assert.equal(merged.legs[0].stops?.length, 1);
  });

  it("getStep renders scheduled waiting step and bike vehicleMode", () => {
    const plan: TripPattern = {
      start: base + 900_000,
      end: base + 1_800_000,
      legs: [
        {
          ...busLeg,
          mode: "bicycle",
          rented: true,
          network: "Bysykkel",
          journeyId: null,
          line: null,
        },
      ],
    };
    const scheduledStep = getStep({
      destination: "Gløshaugen",
      plan,
      legIndex: 0,
      isRiding: false,
      location: TRONDHEIM,
      staying: null,
      scheduled: { mode: "arriveBy", time: base + 1_800_000 },
      isWaitingToLeave: true,
      bus: null,
      hasArrived: false,
      problem: null,
    });
    assert.equal(scheduledStep.kind, "scheduled");
    assert.equal(scheduledStep.countdownLabel, "Leave in");

    const bikeStep = getStep({
      destination: "Gløshaugen",
      plan,
      legIndex: 0,
      isRiding: false,
      location: TRONDHEIM,
      staying: null,
      bus: null,
      hasArrived: false,
      problem: null,
    });
    assert.equal(bikeStep.kind, "rental");
    assert.equal(bikeStep.vehicleMode, "bicycle");
  });

  it("estimatePlan detects broken connection when walk arrives after bus departs", () => {
    const walkLeg: TripLeg = {
      ...busLeg,
      mode: "foot",
      journeyId: null,
      line: null,
      start: base,
      end: base + 600_000, // 10 min walk
    };
    const pattern: TripPattern = {
      start: base,
      end: base + 900_000,
      legs: [walkLeg, { ...busLeg, start: base + 300_000, end: base + 900_000 }],
    };
    const result = estimatePlan(
      pattern,
      0,
      false,
      null,
      base,
      () => ({ depart: base + 300_000, arrive: base + 900_000, cancelled: false }),
    );
    assert.ok(result.broken?.includes("won’t make line 3"));
  });

  it("finds another bus near you, but not the planned one", () => {
    const now = base;
    const location = {
      latitude: TRONDHEIM.latitude,
      longitude: TRONDHEIM.longitude,
    };
    const vehicle = (
      journeyId: string,
      offset: number,
      ageMs: number,
      date: string | null = "2026-11-22",
    ): ActiveVehicle => ({
      journeyId,
      date,
      lastStopPosition: 4,
      atStop: false,
      progressToNext: 0.5,
      latitude: TRONDHEIM.latitude + offset,
      longitude: TRONDHEIM.longitude,
      updatedAt: new Date(now - ageMs),
    });
    const planned = vehicle("ATB:ServiceJourney:70_1", 0.0002, 0);
    const other = vehicle("ATB:ServiceJourney:20_1", 0.0012, 0);
    const stale = vehicle("ATB:ServiceJourney:11_1", 0.0001, 31_000);
    const undated = vehicle("ATB:ServiceJourney:3_1", 0.0001, 0, null);

    const match = findBoardedVehicle(
      [planned, other, stale, undated],
      location,
      now,
      { excludeJourneyId: planned.journeyId },
    );
    assert.equal(match?.vehicle.journeyId, other.journeyId);
  });

  it("allows for a bus that has moved since its position was sent", () => {
    const now = base;
    const location = {
      latitude: TRONDHEIM.latitude,
      longitude: TRONDHEIM.longitude,
    };
    const bus = (ageMs: number): ActiveVehicle => ({
      journeyId: "ATB:ServiceJourney:20_1",
      date: "2026-11-22",
      lastStopPosition: 4,
      atStop: false,
      progressToNext: 0.5,
      // About 335 m away, which is too far unless it has been moving
      latitude: TRONDHEIM.latitude + 0.003,
      longitude: TRONDHEIM.longitude,
      updatedAt: new Date(now - ageMs),
    });

    assert.ok(findBoardedVehicle([bus(20_000)], location, now));
    assert.equal(findBoardedVehicle([bus(40_000)], location, now), null);
  });
});

describe("journey-report", () => {
  const base = Date.UTC(2026, 10, 22, 12, 0, 0);

  it("builds a faster verdict when switching beat the baseline bus", () => {
    const leg: TripLeg = {
      mode: "bus",
      rented: false,
      network: null,
      from: { ...TRONDHEIM, name: "A", quayId: "q0", platform: null },
      to: { ...TRONDHEIM, name: "B", quayId: "q1", platform: null },
      start: base,
      end: base + 600_000,
      realtime: true,
      distance: 1000,
      line: "3",
      headsign: "Lohove",
      journeyId: "ATB:1",
      date: "2026-11-22",
      fromPosition: 0,
      toPosition: 1,
    };
    const calls = [
      makeCall(0, "A", 5, {
        actualDeparture: new Date(base + 300_000),
      }),
      makeCall(1, "B", 15, {
        actualArrival: new Date(base + 900_000),
      }),
    ];
    const baseline = {
      madeAt: base,
      arrival: base + 600_000,
      parts: [{ pattern: { legs: [leg], start: base, end: base + 600_000 }, stayAt: null, stayMinutes: 0 }],
    };
    const replay = replayBaseline(baseline, () => calls);
    assert.equal(replay.isFinal, true);
    assert.equal(replay.arrival, base + 900_000);

    const report = buildReport({
      destination: "B",
      startedAt: base,
      arrivedAt: base + 600_000,
      baseline,
      activities: [{ kind: "ride", text: "Line 10 to B", line: "10", start: base, end: base + 600_000 }],
      changes: [{ at: base + 60_000, kind: "switch", text: "Switched to line 10", reason: "5 min faster" }],
      getCalls: () => calls,
    });
    assert.equal(report.isBetter, true);
    assert.equal(report.differenceMs, -300_000);
  });
});

describe("sightline & route-shape", () => {
  it("ignores outlier earlier stop during computeSightline and compensates GPS lag", async () => {
    // Straight 500m north-south road
    const route = [
      { latitude: 63.430, longitude: 10.395 },
      { latitude: 63.435, longitude: 10.395 },
    ];
    const stops = [
      { latitude: 63.4305, longitude: 10.395 },
      { latitude: 63.480, longitude: 10.500 }, // Bad outlier quay coordinate far off route
      { latitude: 63.4345, longitude: 10.395 },
    ];
    const sightline = await computeSightline(
      "q2/q1",
      route,
      stops,
      { seenAt: null, hiddenAt: null },
      async (_source, pts) => pts.map(() => 10), // flat ground/surface
    );
    assert.ok(sightline);
    assert.ok(sightline.distance >= 400);

    const busPos = { latitude: 63.433, longitude: 10.395 };
    const rawDist = getDistanceToStop(sightline, busPos)!;
    const lagDist = getDistanceToStop(sightline, busPos, {
      ageMs: 10_000,
      atStop: false,
    })!;
    assert.ok(lagDist < rawDist - 70, `expected GPS age compensation: ${rawDist} -> ${lagDist}`);

    const adjusted = correctSightline(sightline, false, 150);
    assert.equal(adjusted.distance, 140);
  });

  it("decodes polylines and builds leg shape & route tap detection", () => {
    const decoded = decodePolyline("_p~iF~ps|U_ulLnnqC_mqNvxq`@");
    assert.equal(decoded.length, 3);

    const leg: TripLeg = {
      mode: "bus",
      rented: false,
      network: null,
      from: { latitude: 63.43, longitude: 10.39, name: "A", quayId: null, platform: null },
      to: { latitude: 63.44, longitude: 10.39, name: "C", quayId: null, platform: null },
      start: 0,
      end: 1000,
      realtime: false,
      distance: 1000,
      line: "3",
      headsign: null,
      journeyId: "j1",
      date: "2026-11-22",
      fromPosition: 0,
      toPosition: 2,
      geometry: null,
      stops: [{ name: "B", latitude: 63.435, longitude: 10.39 }],
    };
    const shape = getLegShape(leg);
    assert.equal(shape.path.length, 3);

    const dots = getDots(shape.path, 200);
    assert.ok(dots.length >= 5);

    const cam = getCamera(shape.path);
    assert.ok(cam && cam.zoom > 10);

    const tapped = getTappedRoute(
      { latitude: 63.435, longitude: 10.40 },
      shape.path,
      [[{ latitude: 63.43, longitude: 10.40 }, { latitude: 63.44, longitude: 10.40 }]],
      50,
    );
    assert.equal(tapped, 0);
  });
});
