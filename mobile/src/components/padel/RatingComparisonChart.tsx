import { useState } from "react";
import { View } from "react-native";
import Svg, { Circle, G, Line, Path, Text as SvgText } from "react-native-svg";
import { Text } from "@/components/ui/text";
import { useColors } from "@/lib/color-scheme";
import { formatDate } from "@/lib/format";
import type { RatingPoint } from "@/lib/padel";
import { ratingTicks } from "./RatingChart";

const HEIGHT = 170;
/** Room for the rating labels on the left */
const LEFT = 34;
/** Room for the end dots, so they aren't cut off */
const RIGHT = 6;
const TOP = 8;
const BOTTOM = 8;

export interface RatingSeries {
  name: string;
  color: string;
  /** From `getRatingPoints` */
  points: RatingPoint[];
}

/** A rating after a game, at the time of the game */
const timeline = (points: RatingPoint[]) =>
  points.flatMap((point) =>
    point.game
      ? [
          {
            time: new Date(point.game.createdAt).getTime(),
            rating: point.rating,
          },
        ]
      : [],
  );

/**
 * Two or more players' ratings over time. The players play different games,
 * so each line goes by the dates of its own games.
 */
export function RatingComparisonChart({ series }: { series: RatingSeries[] }) {
  const { colors } = useColors();
  const [width, setWidth] = useState(0);
  const lines = series
    .map((line) => ({ ...line, timeline: timeline(line.points) }))
    .filter((line) => line.timeline.length > 0);

  if (lines.length === 0) return null;

  const all = lines.flatMap((line) => line.timeline);
  const ratings = all.map((point) => point.rating);
  const { ticks, low, high } = ratingTicks(
    Math.min(...ratings),
    Math.max(...ratings),
  );
  const first = Math.min(...all.map((point) => point.time));
  const last = Math.max(...all.map((point) => point.time));
  const plotWidth = Math.max(width - LEFT - RIGHT, 1);
  const x = (time: number) =>
    LEFT + (last > first ? (time - first) / (last - first) : 1) * plotWidth;
  const y = (rating: number) =>
    TOP + ((high - rating) / (high - low)) * (HEIGHT - TOP - BOTTOM);

  return (
    <View className="gap-3 rounded-xl border border-border bg-card p-4">
      <View className="flex-row flex-wrap gap-x-4 gap-y-1">
        {lines.map((line) => (
          <View key={line.name} className="flex-row items-center gap-1.5">
            <View
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: line.color }}
            />
            <Text className="text-sm" numberOfLines={1}>
              {line.name}{" "}
              <Text className="text-sm font-semibold">
                {line.timeline[line.timeline.length - 1].rating}
              </Text>
            </Text>
          </View>
        ))}
      </View>

      <View
        style={{ height: HEIGHT }}
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        accessible
        accessibilityLabel={lines
          .map(
            (line) =>
              `${line.name} from ${line.timeline[0].rating} to ${line.timeline[line.timeline.length - 1].rating}`,
          )
          .join(", ")}
      >
        {width > 0 && (
          <Svg width={width} height={HEIGHT}>
            {ticks.map((tick) => (
              <Line
                key={`line-${tick}`}
                x1={LEFT}
                x2={width - RIGHT}
                y1={y(tick)}
                y2={y(tick)}
                stroke={colors.border}
                strokeWidth={1}
              />
            ))}
            {ticks.map((tick) => (
              <SvgText
                key={`label-${tick}`}
                x={LEFT - 8}
                y={y(tick) + 4}
                textAnchor="end"
                fontSize={11}
                fill={colors.mutedForeground}
              >
                {tick}
              </SvgText>
            ))}
            {lines.map((line) => {
              const end = line.timeline[line.timeline.length - 1];
              return (
                <G key={line.name}>
                  {line.timeline.length > 1 && (
                    <Path
                      d={line.timeline
                        .map(
                          (point, i) =>
                            `${i === 0 ? "M" : "L"}${x(point.time)},${y(point.rating)}`,
                        )
                        .join(" ")}
                      fill="none"
                      stroke={line.color}
                      strokeWidth={2}
                      strokeLinejoin="round"
                      strokeLinecap="round"
                    />
                  )}
                  <Circle
                    cx={x(end.time)}
                    cy={y(end.rating)}
                    r={4}
                    fill={line.color}
                    stroke={colors.card}
                    strokeWidth={2}
                  />
                </G>
              );
            })}
          </Svg>
        )}
      </View>

      <View className="flex-row justify-between" style={{ paddingLeft: LEFT }}>
        <Text className="text-xs text-muted-foreground">
          {formatDate(new Date(first))}
        </Text>
        <Text className="text-xs text-muted-foreground">
          {formatDate(new Date(last))}
        </Text>
      </View>
    </View>
  );
}
