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
