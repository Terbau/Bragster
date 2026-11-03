"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  getPadelGameTimes,
  getPadelPlayersOnDay,
  type PadelPlayerSummary,
} from "@/utils/padelStats";
import {
  addDays,
  format,
  isSameDay,
  isValid,
  isYesterday,
  parse,
  startOfDay,
} from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PadelPlayersTable } from "./PadelPlayersTable";

/** The day in the URL, like `2026-11-02` */
const DAY_PARAM = "day";
const DAY_FORMAT = "yyyy-MM-dd";

const parseDay = (value: string | null) => {
  if (!value) return null;
  const day = parse(value, DAY_FORMAT, new Date());
  return isValid(day) ? day : null;
};

const dayLabel = (day: Date, today: Date) => {
  if (isSameDay(day, today)) return "Today";
  if (isYesterday(day)) return "Yesterday";
  return format(
    day,
    day.getFullYear() === today.getFullYear() ? "EEE, MMM d" : "MMM d, yyyy",
  );
};

/** A dot under the days with games, white on the selected day */
const playedDayClass =
  "relative font-semibold text-foreground after:absolute after:bottom-1 after:left-1/2 after:h-1 after:w-1 after:-translate-x-1/2 after:rounded-full after:bg-primary aria-selected:text-primary-foreground aria-selected:after:bg-primary-foreground";
const quietDayClass =
  "text-muted-foreground aria-selected:text-primary-foreground";

/**
 * The players list, as it was at the end of a chosen day, with how much each
 * rating changed that day. Days are in the browser's time zone, so the
 * changes only show once mounted. The day is kept in the URL, so it's still
 * chosen when coming back from a player.
 */
export const PadelPlayersByDay = ({
  players,
  basePath,
  highlightKey,
}: {
  players: PadelPlayerSummary[];
  basePath: string;
  highlightKey?: string;
}) => {
  const [isMounted, setIsMounted] = useState(false);
  /** Null for today, which moves on at midnight */
  const [pickedDay, setPickedDay] = useState<Date | null>(null);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setPickedDay(
      parseDay(new URLSearchParams(window.location.search).get(DAY_PARAM)),
    );
  }, []);

  const gameTimes = useMemo(() => getPadelGameTimes(players), [players]);
  const gameDays = useMemo(() => {
    const days: Date[] = [];
    for (const time of gameTimes) {
      const day = startOfDay(time);
      if (!days.some((d) => isSameDay(d, day))) days.push(day);
    }
    return days;
  }, [gameTimes]);

  // Read on every render, so a page left open past midnight moves on
  const today = startOfDay(new Date());
  const firstDay = gameDays[0] ?? today;
  const day =
    pickedDay === null || pickedDay >= today
      ? today
      : pickedDay < firstDay
        ? firstDay
        : pickedDay;
  const isToday = isSameDay(day, today);
  const dayEnd = addDays(day, 1);

  // `day` is a new date on every render, so the memo goes by its time
  const dayTime = day.getTime();
  const rows = useMemo(
    () =>
      isMounted
        ? getPadelPlayersOnDay(
            players,
            new Date(dayTime),
            addDays(new Date(dayTime), 1),
          )
        : players.map((player) => ({ ...player, change: null })),
    [isMounted, players, dayTime],
  );
  const gamesOnDay = gameTimes.filter(
    (time) => time >= day && time < dayEnd,
  ).length;

  const selectDay = (next: Date) => {
    const isNextToday = next >= today;
    setPickedDay(isNextToday ? null : startOfDay(next));
    setIsCalendarOpen(false);
    const url = new URL(window.location.href);
    if (isNextToday) url.searchParams.delete(DAY_PARAM);
    else url.searchParams.set(DAY_PARAM, format(next, DAY_FORMAT));
    window.history.replaceState(window.history.state, "", url);
  };

  const label = isMounted ? dayLabel(day, today) : "Today";
  const note = !isMounted
    ? " "
    : gamesOnDay === 0
      ? `No games ${isToday ? "today" : "this day"}, so no ratings changed.`
      : `${gamesOnDay} ${gamesOnDay === 1 ? "game" : "games"} ${isToday ? "today" : "this day"}. ${
          isToday
            ? "The change in rating is since the start of the day."
            : "Ratings are from the end of the day, with the change during it."
        }`;

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className="shrink-0"
            aria-label="Previous day"
            disabled={!isMounted || day <= firstDay}
            onClick={() => selectDay(addDays(day, -1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="flex-1 sm:flex-none sm:w-48 gap-2"
                disabled={!isMounted}
                aria-label={`Choose a day, ${label} is shown`}
              >
                <CalendarDays className="w-4 h-4 text-muted-foreground" />
                {label}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <Calendar
                mode="single"
                selected={day}
                defaultMonth={day}
                fromDate={firstDay}
                toDate={today}
                weekStartsOn={1}
                modifiers={{
                  played: gameDays,
                  quiet: (date: Date) =>
                    !gameDays.some((gameDay) => isSameDay(gameDay, date)),
                }}
                modifiersClassNames={{
                  played: playedDayClass,
                  quiet: quietDayClass,
                }}
                onSelect={(next) => next && selectDay(next)}
              />
              <div className="flex items-center justify-between gap-4 border-t border-border px-3 py-2">
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  Days with games
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2"
                  disabled={isToday}
                  onClick={() => selectDay(today)}
                >
                  Today
                </Button>
              </div>
            </PopoverContent>
          </Popover>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0"
            aria-label="Next day"
            disabled={!isMounted || isToday}
            onClick={() => selectDay(addDays(day, 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">{note}</p>
      </div>

      <PadelPlayersTable
        players={rows}
        basePath={basePath}
        highlightKey={highlightKey}
        changeTitle={isToday ? "Change in rating today" : `Change on ${label}`}
      />
    </div>
  );
};
