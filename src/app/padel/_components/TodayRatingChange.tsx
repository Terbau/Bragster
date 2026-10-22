"use client";

import {
  getPadelDayRatingChange,
  type PadelRecentGame,
} from "@/utils/padelStats";
import { cn } from "@/utils/utils";
import { useEffect, useState } from "react";
import { changeClass, signed } from "./padelFormat";

/**
 * The change in rating today, for players who have played today. Days are in
 * the browser's time zone, so it's only shown once mounted.
 */
export const TodayRatingChange = ({
  rating,
  recentGames,
}: {
  rating: number;
  recentGames: PadelRecentGame[];
}) => {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => setNow(new Date()), []);

  const day = now
    ? getPadelDayRatingChange({ rating, history: recentGames }, now)
    : null;
  if (!day?.isToday) return null;
  return (
    <span
      className={cn("text-xs font-normal", changeClass(day.change))}
      title="Change in rating today"
    >
      {signed(day.change)}
    </span>
  );
};
