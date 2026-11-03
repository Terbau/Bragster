"use client";

import { formatDate } from "@/utils/date";
import type { PadelRatingPoint } from "@/utils/padelStats";
import { cn } from "@/utils/utils";
import { type KeyboardEvent, useEffect, useRef, useState } from "react";
import { changeClass, signed } from "./padelFormat";

const HEIGHT = 160;
/** Room for the rating labels on the left */
const LEFT = 36;
/** Room for the end dot, so it isn't cut off */
const RIGHT = 6;
const TOP = 8;
const BOTTOM = 8;

/** About three or four round ratings from `min` to `max`, and the range they span */
const ratingTicks = (min: number, max: number) => {
  const span = Math.max(max - min, 20);
  const step =
    [5, 10, 20, 25, 50, 100, 200, 250, 500].find((s) => span / s <= 4) ?? 1000;
  const low = Math.floor(min / step) * step;
  const high = Math.max(Math.ceil(max / step) * step, low + step);
  const ticks: number[] = [];
  for (let tick = low; tick <= high; tick += step) ticks.push(tick);
  return { ticks, low, high };
};

/**
 * The player's rating after each game, oldest first. Hovering, or the arrow
 * keys, show the rating and the game at each point.
 */
export const PadelRatingChart = ({
  points,
}: {
  points: PadelRatingPoint[];
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) =>
      setWidth(entry.contentRect.width),
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  if (points.length < 2) return null;

  const ratings = points.map((point) => point.rating);
  const { ticks, low, high } = ratingTicks(
    Math.min(...ratings),
    Math.max(...ratings),
  );
  const plotWidth = Math.max(width - LEFT - RIGHT, 1);
  const x = (index: number) => LEFT + (index / (points.length - 1)) * plotWidth;
  const y = (rating: number) =>
    TOP + ((high - rating) / (high - low)) * (HEIGHT - TOP - BOTTOM);
  const path = points
    .map((point, i) => `${i === 0 ? "M" : "L"}${x(i)},${y(point.rating)}`)
    .join(" ");

  const last = points.length - 1;
  const shown = selected ?? last;
  const point = points[shown];
  const change = shown > 0 ? point.rating - points[shown - 1].rating : null;

  const select = (clientX: number) => {
    const box = ref.current?.getBoundingClientRect();
    if (!box) return;
    const index = Math.round(
      ((clientX - box.left - LEFT) / plotWidth) * (points.length - 1),
    );
    setSelected(Math.min(Math.max(index, 0), last));
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const step =
      event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : 0;
    if (step === 0) return;
    event.preventDefault();
    setSelected(Math.min(Math.max(shown + step, 0), last));
  };

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-3">
      <div className="flex items-baseline justify-between gap-4 text-sm">
        <p className="min-w-0 truncate" aria-live="polite">
          <span className="font-semibold tabular-nums">{point.rating}</span>
          {change !== null && (
            <span className={cn("ml-1.5 tabular-nums", changeClass(change))}>
              {signed(change)}
            </span>
          )}
          <span className="text-muted-foreground">
            {" · "}
            {point.game ? point.game.name : "Start"}
          </span>
        </p>
        <p className="shrink-0 text-xs text-muted-foreground">
          {point.game
            ? formatDate(new Date(point.game.createdAt))
            : "Before the first game"}
        </p>
      </div>

      {/* A slider through the games, which the chart shows */}
      <div
        ref={ref}
        role="slider"
        tabIndex={0}
        aria-label={`Rating over ${last} games, from ${points[0].rating} to ${points[last].rating}`}
        aria-valuemin={0}
        aria-valuemax={last}
        aria-valuenow={shown}
        aria-valuetext={`${point.rating}${change !== null ? `, ${signed(change)}` : ""}, ${point.game ? point.game.name : "start"}`}
        className="relative touch-pan-y rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{ height: HEIGHT }}
        onPointerMove={(event) => select(event.clientX)}
        onPointerDown={(event) => select(event.clientX)}
        onPointerLeave={() => setSelected(null)}
        onKeyDown={onKeyDown}
        onBlur={() => setSelected(null)}
      >
        {width > 0 && (
          // biome-ignore lint/a11y/noSvgWithoutTitle: the slider around it is labelled, and a title would show a tooltip over the chart
          <svg
            width={width}
            height={HEIGHT}
            className="absolute inset-0 overflow-visible"
            aria-hidden
          >
            {ticks.map((tick) => (
              <g key={tick}>
                <line
                  x1={LEFT}
                  x2={width - RIGHT}
                  y1={y(tick)}
                  y2={y(tick)}
                  className="stroke-border"
                  strokeWidth={1}
                />
                <text
                  x={LEFT - 8}
                  y={y(tick)}
                  textAnchor="end"
                  dominantBaseline="middle"
                  className="fill-muted-foreground text-[11px] tabular-nums"
                >
                  {tick}
                </text>
              </g>
            ))}
            {selected !== null && (
              <line
                x1={x(selected)}
                x2={x(selected)}
                y1={TOP}
                y2={HEIGHT - BOTTOM}
                className="stroke-muted-foreground/50"
                strokeWidth={1}
              />
            )}
            <path
              d={path}
              fill="none"
              className="stroke-foreground"
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <circle
              cx={x(shown)}
              cy={y(point.rating)}
              r={4}
              className="fill-foreground stroke-card"
              strokeWidth={2}
            />
          </svg>
        )}
      </div>

      <div
        className="flex justify-between text-xs text-muted-foreground"
        style={{ paddingLeft: LEFT }}
      >
        <span>
          {points[1].game && formatDate(new Date(points[1].game.createdAt))}
        </span>
        <span>
          {points[last].game &&
            formatDate(new Date(points[last].game.createdAt))}
        </span>
      </div>
    </div>
  );
};
