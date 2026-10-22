"use client";

import {
  getPadelDayRatingChange,
  type PadelPlayerGame,
} from "@/utils/padelStats";
import { cn } from "@/utils/utils";
import { useEffect, useState } from "react";
import { signed } from "../../_components/padelFormat";

const changeClass = (change: number) =>
  change > 0
    ? "text-green-700 dark:text-green-400"
    : change < 0
      ? "text-red-700 dark:text-red-400"
      : "text-muted-foreground";

const formatDay = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(date);

/**
 * The change in rating on the last day played, and in the last game. Days
 * are in the browser's time zone, so the day is only shown once mounted.
 */
export const RatingChange = ({
  rating,
  history,
}: {
  rating: number;
  history: Pick<
    PadelPlayerGame,
    "createdAt" | "ratingBefore" | "ratingChange"
  >[];
}) => {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);

  if (history.length === 0) return null;
  const lastChange = history[0].ratingChange;
  const day = now ? getPadelDayRatingChange({ rating, history }, now) : null;

  return (
    <>
      {day && (
        <p className={cn("text-sm", changeClass(day.change))}>
          {signed(day.change)}{" "}
          <span className="text-muted-foreground">
            {day.isToday ? "today" : formatDay(day.day)}
            {day.games > 1 ? ` · ${day.games} games` : ""}
          </span>
        </p>
      )}
      {(!day || day.games > 1) && (
        <p className={cn("text-sm", changeClass(lastChange))}>
          {signed(lastChange)}{" "}
          <span className="text-muted-foreground">last game</span>
        </p>
      )}
    </>
  );
};
