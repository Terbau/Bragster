/**
 * The colours AtB's own app shows transport in, from AtB's design system
 * (github.com/AtB-AS/design-system, atb-theme): green city buses, teal
 * regional buses, grey walks and so on. Light and dark have their own.
 */

export type TransportKind =
  | "city"
  | "region"
  | "airportExpress"
  | "flexible"
  | "boat"
  | "train"
  | "scooter"
  | "bike"
  | "walk"
  | "other";

export interface TransportColors {
  background: string;
  foreground: string;
}

const LIGHT: Record<TransportKind, TransportColors> = {
  city: { background: "#608000", foreground: "#ffffff" },
  region: { background: "#008099", foreground: "#ffffff" },
  airportExpress: { background: "#576b75", foreground: "#ffffff" },
  flexible: { background: "#c2570a", foreground: "#ffffff" },
  boat: { background: "#00404d", foreground: "#ffffff" },
  train: { background: "#943894", foreground: "#ffffff" },
  scooter: { background: "#2273c3", foreground: "#ffffff" },
  bike: { background: "#c91d39", foreground: "#ffffff" },
  walk: { background: "#c2cfd6", foreground: "#000000" },
  other: { background: "#576b75", foreground: "#ffffff" },
};

const DARK: Record<TransportKind, TransportColors> = {
  city: { background: "#a9d22d", foreground: "#000000" },
  region: { background: "#0095b2", foreground: "#000000" },
  airportExpress: { background: "#8f9ca3", foreground: "#000000" },
  flexible: { background: "#d97126", foreground: "#000000" },
  boat: { background: "#99d9e5", foreground: "#000000" },
  train: { background: "#cd98cd", foreground: "#000000" },
  scooter: { background: "#5c99d6", foreground: "#000000" },
  bike: { background: "#d7425b", foreground: "#000000" },
  walk: { background: "#415058", foreground: "#ffffff" },
  other: { background: "#8f9ca3", foreground: "#000000" },
};

/**
 * What kind of transport it is, from Entur's mode and submode, like "bus"
 * and "regionalBus". A bus without a submode is taken as a city bus.
 */
export function transportKind(
  mode: string | null | undefined,
  submode?: string | null,
): TransportKind {
  switch (mode) {
    case "foot":
      return "walk";
    case "bicycle":
      return "bike";
    case "scooter":
      return "scooter";
    case "rail":
      return "train";
    case "water":
      return "boat";
    case "coach":
      return "region";
    case "tram":
    case "metro":
      return "city";
    case "bus":
    case undefined:
    case null:
      break;
    default:
      return "other";
  }
  switch (submode) {
    case "regionalBus":
    case "expressBus":
      return "region";
    case "airportLinkBus":
      return "airportExpress";
    case "demandAndResponseBus":
      return "flexible";
    default:
      return "city";
  }
}

export function transportColors(kind: TransportKind, isDark: boolean) {
  return (isDark ? DARK : LIGHT)[kind];
}

/** The colours of a part of a route, see `TripLeg` */
export function legColors(
  leg: {
    mode: string;
    submode?: string | null;
    rented: boolean;
    journeyId: string | null;
  },
  isDark: boolean,
) {
  const kind = leg.rented
    ? leg.mode === "bicycle"
      ? "bike"
      : "scooter"
    : leg.journeyId === null
      ? "walk"
      : transportKind(leg.mode, leg.submode);
  return transportColors(kind, isDark);
}
