import { useState } from "react";
import { View } from "react-native";
import Svg, { Circle, Line, Path, Text as SvgText } from "react-native-svg";
import { Text } from "@/components/ui/text";
import { useColors } from "@/lib/color-scheme";
import { formatDate } from "@/lib/format";
import { type RatingPoint, signed } from "@/lib/padel";
import { cn } from "@/lib/utils";

const HEIGHT = 150;
/** Room for the rating labels on the left */
const LEFT = 34;
/** Room for the end dot, so it isn't cut off */
const RIGHT = 6;
const TOP = 8;
const BOTTOM = 8;

const tabular = { fontVariant: ["tabular-nums" as const] };

const changeClass = (change: number) =>
  change > 0
    ? "text-green-700 dark:text-green-400"
    : change < 0
      ? "text-red-700 dark:text-red-400"
      : "text-muted-foreground";

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
 * The player's rating after each game, oldest first. Touching the chart, and
 * sliding sideways, shows the rating and the game at each point.
 */
export function RatingChart({ points }: { points: RatingPoint[] }) {
  const { colors } = useColors();
  const [width, setWidth] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);

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

  const select = (locationX: number) => {
    const index = Math.round(
      ((locationX - LEFT) / plotWidth) * (points.length - 1),
    );
    setSelected(Math.min(Math.max(index, 0), last));
  };

  return (
    <View className="gap-3 rounded-xl border border-border bg-card p-4">
      <View className="flex-row items-baseline justify-between gap-3">
        <Text className="min-w-0 flex-1 text-sm" numberOfLines={1}>
          <Text className="text-sm font-semibold" style={tabular}>
            {point.rating}
          </Text>
          {change !== null && (
            <Text
              className={cn("text-sm", changeClass(change))}
              style={tabular}
            >
              {"  "}
              {signed(change)}
            </Text>
          )}
          <Text className="text-sm text-muted-foreground">
            {" · "}
            {point.game ? point.game.name : "Start"}
          </Text>
        </Text>
        <Text className="text-xs text-muted-foreground">
          {point.game ? formatDate(point.game.createdAt) : "Before game 1"}
        </Text>
      </View>

      {/* A vertical swipe is left to the scroll view, which ends the touch */}
      <View
        style={{ height: HEIGHT }}
        onLayout={(event) => setWidth(event.nativeEvent.layout.width)}
        accessible
        accessibilityRole="adjustable"
        accessibilityLabel={`Rating over ${last} games, from ${points[0].rating} to ${points[last].rating}`}
        accessibilityValue={{
          text: `${point.rating}${change !== null ? `, ${signed(change)}` : ""}, ${point.game ? point.game.name : "start"}`,
        }}
        onAccessibilityAction={(event) => {
          const step =
            event.nativeEvent.actionName === "increment"
              ? 1
              : event.nativeEvent.actionName === "decrement"
                ? -1
                : 0;
          setSelected(Math.min(Math.max(shown + step, 0), last));
        }}
        accessibilityActions={[{ name: "increment" }, { name: "decrement" }]}
        onStartShouldSetResponder={() => true}
        onResponderGrant={(event) => select(event.nativeEvent.locationX)}
        onResponderMove={(event) => select(event.nativeEvent.locationX)}
        onResponderRelease={() => setSelected(null)}
        onResponderTerminate={() => setSelected(null)}
      >
        {width > 0 && (
          <Svg width={width} height={HEIGHT} pointerEvents="none">
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
            {selected !== null && (
              <Line
                x1={x(selected)}
                x2={x(selected)}
                y1={TOP}
                y2={HEIGHT - BOTTOM}
                stroke={colors.mutedForeground}
                strokeOpacity={0.5}
                strokeWidth={1}
              />
            )}
            <Path
              d={path}
              fill="none"
              stroke={colors.foreground}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            <Circle
              cx={x(shown)}
              cy={y(point.rating)}
              r={4}
              fill={colors.foreground}
              stroke={colors.card}
              strokeWidth={2}
            />
          </Svg>
        )}
      </View>

      <View className="flex-row justify-between" style={{ paddingLeft: LEFT }}>
        <Text className="text-xs text-muted-foreground">
          {points[1].game && formatDate(points[1].game.createdAt)}
        </Text>
        <Text className="text-xs text-muted-foreground">
          {points[last].game && formatDate(points[last].game.createdAt)}
        </Text>
      </View>
    </View>
  );
}
