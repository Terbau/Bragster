import { decodePolyline } from "./sightline";
import type {
  Coordinates,
  TripLeg,
  TripPattern,
  TripStop,
} from "./trip-planner";

/**
 * The shapes of routes, to draw them on a map: the way each leg goes, the
 * stops the buses pass, where the map should look, and which route a tap
 * on the map is on.
 */

/** Metres on the ground, flat, which is near enough within a city */
interface XY {
  x: number;
  y: number;
}

const METRES_PER_DEGREE = 111_320;

function toXY(point: Coordinates, latitude: number): XY {
  return {
    x:
      point.longitude *
      METRES_PER_DEGREE *
      Math.cos((latitude * Math.PI) / 180),
    y: point.latitude * METRES_PER_DEGREE,
  };
}

/** Metres from `point` to the line from `a` to `b` */
function distanceToSegment(point: XY, a: XY, b: XY) {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = dx * dx + dy * dy;
  const t =
    length === 0
      ? 0
      : Math.max(
          0,
          Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / length),
        );
  return Math.hypot(point.x - (a.x + t * dx), point.y - (a.y + t * dy));
}

/** Metres from `point` to the nearest bit of `path` */
export function distanceToPath(point: Coordinates, path: Coordinates[]) {
  if (path.length === 0) return Number.POSITIVE_INFINITY;
  const at = toXY(point, point.latitude);
  const xy = path.map((p) => toXY(p, point.latitude));
  if (xy.length === 1) return Math.hypot(at.x - xy[0].x, at.y - xy[0].y);
  let nearest = Number.POSITIVE_INFINITY;
  for (let i = 1; i < xy.length; i++) {
    nearest = Math.min(nearest, distanceToSegment(at, xy[i - 1], xy[i]));
  }
  return nearest;
}

/** The index of the point of `path` nearest to `point`, from `from` on */
function nearestIndex(path: Coordinates[], point: Coordinates, from = 0) {
  let best = from;
  let bestDistance = Number.POSITIVE_INFINITY;
  const at = toXY(point, point.latitude);
  for (let i = from; i < path.length; i++) {
    const xy = toXY(path[i], point.latitude);
    const distance = Math.hypot(at.x - xy.x, at.y - xy.y);
    if (distance < bestDistance) {
      best = i;
      bestDistance = distance;
    }
  }
  return best;
}

/** A leg as drawn: the way it goes, and the stops a bus passes on it */
export interface LegShape {
  leg: TripLeg;
  path: Coordinates[];
  stops: TripStop[];
}

/**
 * The way a leg goes, from where it starts to where it ends. A ride cut
 * short, like when you get off earlier than planned, still has the shape of
 * the whole ride, so it's cut to its stops here.
 */
export function getLegShape(leg: TripLeg): LegShape {
  const from = { latitude: leg.from.latitude, longitude: leg.from.longitude };
  const to = { latitude: leg.to.latitude, longitude: leg.to.longitude };
  const points = leg.geometry ? decodePolyline(leg.geometry) : [];
  if (points.length < 2) return { leg, path: [from, to], stops: [] };
  const start = nearestIndex(points, from);
  const end = Math.max(start + 1, nearestIndex(points, to, start));
  const path = points.slice(start, end + 1);
  const stops = (leg.stops ?? []).filter((stop) => {
    const index = nearestIndex(points, stop);
    return index > start && index < end;
  });
  return { leg, path, stops };
}

/** Every point of every leg of a route, in order */
export const getRoutePath = (shapes: LegShape[]) =>
  shapes.flatMap((shape) => shape.path);

/**
 * Where on `path` to put a label, like how much later it gets there: the
 * point furthest from `others`, where the route goes its own way. Null when
 * it doesn't, as it's then hidden under the others.
 */
export function getLabelPoint(path: Coordinates[], others: Coordinates[]) {
  if (path.length === 0) return null;
  // Every few points is enough, and keeps it quick
  const step = Math.max(1, Math.floor(path.length / 60));
  const sampledOthers = others.filter(
    (_, index) => index % Math.max(1, Math.floor(others.length / 200)) === 0,
  );
  let best: Coordinates | null = null;
  let bestDistance = 40;
  for (let i = 0; i < path.length; i += step) {
    const distance = distanceToPath(path[i], sampledOthers);
    if (distance > bestDistance) {
      best = path[i];
      bestDistance = distance;
    }
  }
  return best;
}

/**
 * Where the map should look to show all of `points`, with a bit of room
 * around them. The zoom is the one expo-maps goes by: the map is
 * 360 / 2^zoom degrees wide and tall.
 */
export function getCamera(points: Coordinates[]) {
  if (points.length === 0) return null;
  let north = -90;
  let south = 90;
  let east = -180;
  let west = 180;
  for (const point of points) {
    north = Math.max(north, point.latitude);
    south = Math.min(south, point.latitude);
    east = Math.max(east, point.longitude);
    west = Math.min(west, point.longitude);
  }
  const span = Math.max(north - south, east - west, 0.004) * 1.35;
  return {
    coordinates: {
      latitude: (north + south) / 2,
      longitude: (east + west) / 2,
    },
    zoom: Math.log2(360 / span),
  };
}

/** How many metres one point on the screen is at a zoom, on a map this wide */
export function metresPerPoint(zoom: number, width: number, latitude: number) {
  const degrees = 360 / 2 ** zoom;
  return (
    (degrees * METRES_PER_DEGREE * Math.cos((latitude * Math.PI) / 180)) /
    Math.max(1, width)
  );
}

/**
 * Which route a tap on the map is on: the index of one of `others`, or
 * null when it's on the chosen one or on none. Where they go the same way,
 * it's the chosen one, so a tap there doesn't switch.
 */
export function getTappedRoute(
  tap: Coordinates,
  chosen: Coordinates[],
  others: Coordinates[][],
  reach: number,
) {
  const onChosen = distanceToPath(tap, chosen);
  let best: number | null = null;
  let bestDistance = reach;
  others.forEach((path, index) => {
    const distance = distanceToPath(tap, path);
    if (distance < bestDistance) {
      best = index;
      bestDistance = distance;
    }
  });
  if (best === null || onChosen <= bestDistance + reach / 3) return null;
  return best;
}

/** The legs of a route that are still to come */
export const getShapes = (pattern: TripPattern, fromLeg = 0) =>
  pattern.legs.slice(fromLeg).map(getLegShape);

/**
 * Points every `spacing` metres along `path`, to draw a walk as dots. At
 * most `max`, further apart when there would be more.
 */
export function getDots(path: Coordinates[], spacing: number, max = 200) {
  if (path.length === 0) return [];
  const latitude = path[0].latitude;
  const xy = path.map((point) => toXY(point, latitude));
  let length = 0;
  for (let i = 1; i < xy.length; i++) {
    length += Math.hypot(xy[i].x - xy[i - 1].x, xy[i].y - xy[i - 1].y);
  }
  const step = Math.max(spacing, length / max, 1);
  const dots: Coordinates[] = [path[0]];
  // How far along the path the next dot is
  let next = step;
  let walked = 0;
  for (let i = 1; i < xy.length; i++) {
    const a = path[i - 1];
    const b = path[i];
    const segment = Math.hypot(xy[i].x - xy[i - 1].x, xy[i].y - xy[i - 1].y);
    while (segment > 0 && next <= walked + segment) {
      const t = (next - walked) / segment;
      dots.push({
        latitude: a.latitude + (b.latitude - a.latitude) * t,
        longitude: a.longitude + (b.longitude - a.longitude) * t,
      });
      next += step;
    }
    walked += segment;
  }
  return dots;
}

/** The point halfway along `path`, to put a label on it */
export function getMidpoint(path: Coordinates[]) {
  const dots = getDots(path, 1, 2);
  return dots[1] ?? path[0] ?? null;
}
