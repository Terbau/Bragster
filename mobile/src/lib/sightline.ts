/**
 * How far along the road a bus can be seen from a stop, before it gets there.
 * Worked out once for each platform from the map: the bus's route from Entur,
 * and Kartverket's height models of Norway, one of the bare ground and one of
 * everything on it, like buildings and trees, both in 1 m squares. A bus is in
 * sight when nothing is higher than the line from your eyes to the bus.
 */

const ELEVATION_URL = "https://ws.geonorge.no/hoydedata/v1/datakilder";
/** The ground, and the ground with buildings and trees on it */
const GROUND = "dtm1";
const SURFACE = "dom1";
/** As many as Kartverket takes at a time, and how many are asked for at once */
const ELEVATION_BATCH = 50;
const ELEVATION_PARALLEL = 4;

/** A bus further away than this is too small to pick out */
const MAX_SIGHT_M = 600;
/** A bus this close is always seen */
const MIN_SIGHT_M = 30;
/** How far apart the places the bus is looked for are, along the road */
const STEP_M = 15;
/** How many of them are looked into at a time, until the bus is hidden */
const TARGETS_AT_A_TIME = 6;
/** How far apart the heights are checked, between the stop and the bus */
const SAMPLE_STEP_M = 4;
/** Not checked this close to you or the bus: shelters, signs and cars */
const SAMPLE_CLEARANCE_M = 8;
/** Eyes above the ground, and the part of a bus that's looked for */
const EYE_HEIGHT_M = 1.6;
const BUS_HEIGHT_M = 2.2;
/** Lower than this above the line of sight is a car, a fence or a kerb */
const SURFACE_MARGIN_M = 1.5;
/** You stand at the kerb, this far from the middle of the road */
const KERB_M = 3;
/** A stop further from the route than this isn't on it */
const MAX_STOP_OFFSET_M = 60;
/** A bus further from the route than this is somewhere else */
const MAX_BUS_OFFSET_M = 35;
/** How much further or nearer it's set, when it's said to be wrong */
const CORRECTION_M = 10;

export interface LatLon {
  latitude: number;
  longitude: number;
}

export interface Sightline {
  /** The platform, and the stop before it, as buses come from different roads */
  key: string;
  /**
   * The road to the stop, from the stop and backwards:
   * latitude, longitude, and metres left to the stop
   */
  approach: [number, number, number][];
  /** How many metres before the stop the bus comes into sight */
  distance: number;
  /** What the map says, before it was corrected */
  computedDistance: number;
  /** How many stops there are on `approach`, before yours */
  stopsWithin: number;
  /** Where the bus was, when it was said to be seen, or not to be */
  seenAt: number | null;
  hiddenAt: number | null;
  computedAt: number;
}

type XY = [number, number];

/** Metres east and north of `origin`, good enough within a kilometre */
function toLocal(origin: LatLon) {
  const metresPerLon = 111_320 * Math.cos((origin.latitude * Math.PI) / 180);
  const metresPerLat = 110_574;
  return {
    xy: (point: LatLon): XY => [
      (point.longitude - origin.longitude) * metresPerLon,
      (point.latitude - origin.latitude) * metresPerLat,
    ],
    latLon: ([x, y]: XY): LatLon => ({
      latitude: origin.latitude + y / metresPerLat,
      longitude: origin.longitude + x / metresPerLon,
    }),
  };
}

const distance = (a: XY, b: XY) => Math.hypot(a[0] - b[0], a[1] - b[1]);

/** Google's encoded polyline, which Entur's routes come as */
export function decodePolyline(encoded: string): LatLon[] {
  const points: LatLon[] = [];
  let index = 0;
  let latitude = 0;
  let longitude = 0;
  const next = () => {
    let result = 0;
    let shift = 0;
    let byte: number;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20 && index < encoded.length);
    return result & 1 ? ~(result >> 1) : result >> 1;
  };
  while (index < encoded.length) {
    latitude += next();
    longitude += next();
    points.push({ latitude: latitude / 1e5, longitude: longitude / 1e5 });
  }
  return points;
}

/** The point on the line from `a` to `b` that's closest to `point`, 0-1 */
function closestOnSegment(point: XY, a: XY, b: XY) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const length2 = dx * dx + dy * dy;
  const t =
    length2 === 0
      ? 0
      : Math.max(
          0,
          Math.min(
            1,
            ((point[0] - a[0]) * dx + (point[1] - a[1]) * dy) / length2,
          ),
        );
  const closest: XY = [a[0] + t * dx, a[1] + t * dy];
  return { t, closest, offset: distance(point, closest) };
}

/** A line with how far along it each point is */
interface Path {
  points: XY[];
  along: number[];
}

function toPath(points: XY[]): Path {
  const along = [0];
  for (let i = 1; i < points.length; i++) {
    along.push(along[i - 1] + distance(points[i - 1], points[i]));
  }
  return { points, along };
}

/**
 * Where on the path `point` is, at `from` or later. A route can pass the
 * same place twice, so the first time it's close is the one.
 */
function locate(path: Path, point: XY, from = 0) {
  const candidates: { along: number; offset: number; closest: XY }[] = [];
  for (let i = 1; i < path.points.length; i++) {
    if (path.along[i] < from) continue;
    const a = path.points[i - 1];
    const b = path.points[i];
    const { t, closest, offset } = closestOnSegment(point, a, b);
    const along = path.along[i - 1] + t * (path.along[i] - path.along[i - 1]);
    if (along >= from) candidates.push({ along, offset, closest });
  }
  if (candidates.length === 0) return null;
  const nearest = Math.min(...candidates.map((candidate) => candidate.offset));
  return candidates.find((candidate) => candidate.offset <= nearest + 15)!;
}

function pointAt(path: Path, along: number): XY {
  for (let i = 1; i < path.points.length; i++) {
    if (path.along[i] >= along) {
      const length = path.along[i] - path.along[i - 1];
      const t = length === 0 ? 0 : (along - path.along[i - 1]) / length;
      const a = path.points[i - 1];
      const b = path.points[i];
      return [a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])];
    }
  }
  return path.points[path.points.length - 1];
}

/** Metres above the sea, from Kartverket. Null where it isn't known. */
async function fetchHeights(
  source: string,
  points: LatLon[],
): Promise<(number | null)[]> {
  const batches: LatLon[][] = [];
  for (let i = 0; i < points.length; i += ELEVATION_BATCH) {
    batches.push(points.slice(i, i + ELEVATION_BATCH));
  }
  const results: (number | null)[][] = [];
  const fetchBatch = async (batch: LatLon[]) => {
    const list = JSON.stringify(
      batch.map((point) => [
        Number(point.longitude.toFixed(6)),
        Number(point.latitude.toFixed(6)),
      ]),
    );
    const response = await fetch(
      `${ELEVATION_URL}/${source}/punkt?koordsys=4258&punkter=${encodeURIComponent(list)}`,
    );
    if (!response.ok) {
      throw new Error(`Couldn't get the heights (${response.status})`);
    }
    const body = (await response.json()) as {
      punkter: { z: number | null }[];
    };
    return batch.map((_, index) => body.punkter[index]?.z ?? null);
  };
  for (let i = 0; i < batches.length; i += ELEVATION_PARALLEL) {
    results.push(
      ...(await Promise.all(
        batches.slice(i, i + ELEVATION_PARALLEL).map(fetchBatch),
      )),
    );
  }
  return results.flat();
}

/** What's been said about it stays when it's worked out again */
export type SightlineCorrections = Pick<Sightline, "seenAt" | "hiddenAt">;

function withCorrections(
  computedDistance: number,
  { seenAt, hiddenAt }: SightlineCorrections,
) {
  let result = computedDistance;
  if (hiddenAt !== null) result = Math.min(result, hiddenAt - CORRECTION_M);
  if (seenAt !== null) result = Math.max(result, seenAt + CORRECTION_M);
  return Math.max(0, Math.round(result));
}

/**
 * Works out how far away a bus can be seen from a stop, on its way there.
 * `stops` are the trip's stops up to and with yours, in order. Null when the
 * trip starts at the stop, or the route doesn't pass it.
 */
export async function computeSightline(
  key: string,
  route: LatLon[],
  stops: LatLon[],
  corrections: SightlineCorrections = { seenAt: null, hiddenAt: null },
): Promise<Sightline | null> {
  const stop = stops.at(-1);
  if (!stop || stops.length < 2 || route.length < 2) return null;
  const { xy, latLon } = toLocal(stop);
  const path = toPath(route.map(xy));

  // Each stop comes after the one before, so the right pass of a route that
  // loops is found
  let from = 0;
  const stopsAlong: number[] = [];
  let stopPlace: NonNullable<ReturnType<typeof locate>> | null = null;
  for (const [index, point] of stops.entries()) {
    const place = locate(path, xy(point), from);
    if (!place) return null;
    from = place.along;
    stopsAlong.push(place.along);
    if (index === stops.length - 1) stopPlace = place;
  }
  if (!stopPlace || stopPlace.offset > MAX_STOP_OFFSET_M) return null;
  const length = Math.min(MAX_SIGHT_M, stopPlace.along);
  if (length < MIN_SIGHT_M) return null;

  // Where the bus is looked for, from the stop and backwards
  const targets: { point: XY; left: number }[] = [];
  for (let left = STEP_M; left <= length; left += STEP_M) {
    targets.push({ point: pointAt(path, stopPlace.along - left), left });
  }
  const approach: Sightline["approach"] = [
    { point: stopPlace.closest, left: 0 },
    ...targets,
  ].map(({ point, left }) => {
    const { latitude, longitude } = latLon(point);
    return [
      Number(latitude.toFixed(6)),
      Number(longitude.toFixed(6)),
      Math.round(left),
    ];
  });

  // You step up to the kerb to look for the bus
  const stopXY = xy(stop);
  const eye: XY =
    stopPlace.offset <= KERB_M
      ? stopXY
      : [
          stopPlace.closest[0] +
            ((stopXY[0] - stopPlace.closest[0]) * KERB_M) / stopPlace.offset,
          stopPlace.closest[1] +
            ((stopXY[1] - stopPlace.closest[1]) * KERB_M) / stopPlace.offset,
        ];

  // The ground under you and under the bus, at each place
  const ground = await fetchHeights(
    GROUND,
    [eye, ...targets.map((target) => target.point)].map(latLon),
  );
  const eyeGround = ground[0];
  if (eyeGround === null) throw new Error("The stop isn't on Kartverket's map");
  const eyeHeight = eyeGround + EYE_HEIGHT_M;

  // In sight until two places in a row are hidden, so one tree doesn't end
  // it. Looked into a few places at a time, as most stops see a short way.
  let computedDistance = 0;
  let hidden = 0;
  search: for (let i = 0; i < targets.length; i += TARGETS_AT_A_TIME) {
    const group = targets.slice(i, i + TARGETS_AT_A_TIME);
    const samples: XY[] = [];
    const lines = group.map((target) => {
      const span = distance(eye, target.point);
      const start = samples.length;
      const distances: number[] = [];
      for (
        let d = SAMPLE_CLEARANCE_M;
        d <= span - SAMPLE_CLEARANCE_M;
        d += SAMPLE_STEP_M
      ) {
        distances.push(d);
        samples.push([
          eye[0] + ((target.point[0] - eye[0]) * d) / span,
          eye[1] + ((target.point[1] - eye[1]) * d) / span,
        ]);
      }
      return { span, start, distances };
    });
    const surface = await fetchHeights(SURFACE, samples.map(latLon));

    for (const [index, target] of group.entries()) {
      const { span, start, distances } = lines[index];
      const busGround = ground[i + index + 1];
      let isHidden = false;
      if (busGround !== null) {
        const busHeight = busGround + BUS_HEIGHT_M;
        // Two in a row, as one alone is a lamp post or a passing lorry
        let above = 0;
        for (const [n, d] of distances.entries()) {
          const height = surface[start + n];
          const line = eyeHeight + ((busHeight - eyeHeight) * d) / span;
          above =
            height !== null && height > line + SURFACE_MARGIN_M ? above + 1 : 0;
          if (above === 2) {
            isHidden = true;
            break;
          }
        }
      }
      if (!isHidden) {
        computedDistance = target.left;
        hidden = 0;
      } else if (++hidden === 2) break search;
    }
  }
  computedDistance = Math.max(MIN_SIGHT_M, Math.round(computedDistance));

  // The stops the bus still has to get to while it's on the approach
  const stopAlong = stopPlace.along;
  const stopsWithin = stopsAlong
    .slice(0, -1)
    .filter((along) => along > stopAlong - length).length;

  return {
    key,
    approach,
    distance: withCorrections(computedDistance, corrections),
    computedDistance,
    stopsWithin,
    ...corrections,
    computedAt: Date.now(),
  };
}

/**
 * How many metres the bus has left to the stop along the road, or null when
 * it isn't on the last stretch of it
 */
export function getDistanceToStop(
  sightline: Sightline,
  bus: LatLon,
): number | null {
  const [latitude, longitude] = sightline.approach[0];
  const { xy } = toLocal({ latitude, longitude });
  const point = xy(bus);
  let best: { offset: number; left: number } | null = null;
  for (let i = 1; i < sightline.approach.length; i++) {
    const [aLat, aLon, aLeft] = sightline.approach[i - 1];
    const [bLat, bLon, bLeft] = sightline.approach[i];
    const { t, offset } = closestOnSegment(
      point,
      xy({ latitude: aLat, longitude: aLon }),
      xy({ latitude: bLat, longitude: bLon }),
    );
    if (!best || offset < best.offset) {
      best = { offset, left: aLeft + t * (bLeft - aLeft) };
    }
  }
  if (!best || best.offset > MAX_BUS_OFFSET_M) return null;
  return best.left;
}

/**
 * The sightline after you've said whether you see a bus that has
 * `distanceToStop` metres left. What was said the other way before is
 * forgotten when the two don't fit.
 */
export function correctSightline(
  sightline: Sightline,
  isSeen: boolean,
  distanceToStop: number,
): Sightline {
  const at = Math.round(distanceToStop);
  let { seenAt, hiddenAt } = sightline;
  if (isSeen) {
    seenAt = Math.max(seenAt ?? 0, at);
    if (hiddenAt !== null && hiddenAt <= seenAt + 2 * CORRECTION_M) {
      hiddenAt = null;
    }
  } else {
    hiddenAt = Math.min(hiddenAt ?? Number.POSITIVE_INFINITY, at);
    if (seenAt !== null && seenAt >= hiddenAt - 2 * CORRECTION_M) seenAt = null;
  }
  return {
    ...sightline,
    seenAt,
    hiddenAt,
    distance: withCorrections(sightline.computedDistance, { seenAt, hiddenAt }),
  };
}
