import { type PadelRecord, padelPointShare } from "@/utils/padelStats";

/** 1st, 2nd, 3rd, 4th, ... 11th, 12th, 13th, ... 21st */
export const ordinal = (n: number) => {
  const teen = n % 100 >= 11 && n % 100 <= 13;
  const suffix =
    !teen && n % 10 === 1
      ? "st"
      : !teen && n % 10 === 2
        ? "nd"
        : !teen && n % 10 === 3
          ? "rd"
          : "th";
  return `${n}${suffix}`;
};

export const signed = (value: number) =>
  value > 0 ? `+${value}` : value < 0 ? `−${Math.abs(value)}` : "±0";

/** Green for a gain, red for a loss */
export const changeClass = (change: number) =>
  change > 0
    ? "text-green-700 dark:text-green-400"
    : change < 0
      ? "text-red-700 dark:text-red-400"
      : "text-muted-foreground";

/** A chance like "74%", never quite 0% or 100% */
export const chancePercent = (chance: number) =>
  chance < 0.005
    ? "<1%"
    : chance > 0.995
      ? ">99%"
      : `${Math.round(chance * 100)}%`;

export const percent = (part: number, whole: number) =>
  whole > 0 ? `${Math.round((part / whole) * 100)}%` : "–";

/** Points won minus lost, per match, like "+2.5" */
export const differencePerMatch = (record: PadelRecord) =>
  record.matches > 0
    ? signed(
        Math.round(
          ((record.pointsWon - record.pointsLost) / record.matches) * 10,
        ) / 10,
      )
    : "–";

export const pointShare = (record: PadelRecord) =>
  `${Math.round(padelPointShare(record) * 100)}%`;

/** `basePath` is the players list, private or shared */
export const playerHref = (key: string, basePath: string) =>
  `${basePath}/${encodeURIComponent(key)}`;

/** A space's page. Its players list is at `/players`, a new game at `/new`. */
export const padelSpacePath = (spaceId: string) => `/padel/spaces/${spaceId}`;

export const padelPlayersPath = (spaceId: string) =>
  `${padelSpacePath(spaceId)}/players`;

/** The shared players list, which anyone with the token can see */
export const padelPlayersLivePath = (token: string) =>
  `/padel/live/players/${token}`;

/** A player key from a URL */
export const decodeKey = (value: string) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};
