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

export const playerHref = (key: string) =>
  `/padel/players/${encodeURIComponent(key)}`;

/** A time in a video, like "4:05" or "1:02:09" */
export const formatClock = (seconds: number) => {
  const total = Math.max(0, Math.floor(seconds));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const rest = String(total % 60).padStart(2, "0");
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, "0")}:${rest}`
    : `${minutes}:${rest}`;
};

/** The length of a rally, like "14 s" */
export const formatRallyLength = (seconds: number) =>
  `${Math.round(seconds)} s`;

/** A longer time, like "9 min" or "1 h 12 min" */
export const formatPlayTime = (seconds: number) => {
  const minutes = Math.round(seconds / 60);
  return minutes < 60
    ? `${minutes} min`
    : `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
};

export const videoHref = (
  gameId: string,
  recordingId: string,
  { matchId, rallyId }: { matchId?: string; rallyId?: string } = {},
) => {
  const query = new URLSearchParams();
  if (matchId) query.set("match", matchId);
  if (rallyId) query.set("rally", rallyId);
  const search = query.toString();
  return `/padel/${gameId}/videos/${recordingId}${search ? `?${search}` : ""}`;
};
