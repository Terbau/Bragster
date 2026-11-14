import { LinearGradient } from "expo-linear-gradient";
import type { Ref } from "react";
import { Text, View } from "react-native";
import {
  chancePercent,
  formatLabel,
  getGameHighlights,
  getGameStatus,
  getPadelStandings,
  ordinal,
  type PadelMatchHighlight,
  type PadelStanding,
  signed,
} from "@/lib/padel";
import type { PadelGame, PadelMatchRating, PadelPlayer } from "@/lib/types";

/**
 * The leaderboard and the game's highlights as a picture, to share in a
 * chat. It looks the same in light and dark mode, since it's made into an
 * image.
 */

const tabular = { fontVariant: ["tabular-nums" as const] };

/** Second, first and third, from the left */
const PODIUM = [
  { index: 1, height: 64 },
  { index: 0, height: 88 },
  { index: 2, height: 48 },
];

const MEDALS: Record<number, { medal: string; color: string }> = {
  1: { medal: "🥇", color: "#facc15" },
  2: { medal: "🥈", color: "#cbd5e1" },
  3: { medal: "🥉", color: "#f59e0b" },
};

const formatDay = (date: string) =>
  new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));

const names = (players: PadelPlayer[]) =>
  players.map((player) => player.name).join(" & ");

const changeColor = (change: number) =>
  change > 0 ? "#86efac" : change < 0 ? "#fca5a5" : "#c7d2fe";

export function ResultsCard({
  ref,
  game,
  matchRatings,
  width,
}: {
  ref?: Ref<View>;
  game: PadelGame;
  matchRatings: Record<string, PadelMatchRating> | undefined;
  width: number;
}) {
  const status = getGameStatus(game);
  const standings = getPadelStandings(game.players, game.rounds);
  const highlights = getGameHighlights(game, matchRatings);
  const change = (standing: PadelStanding) =>
    highlights.ratingChanges.get(standing.playerId);
  const podium = PODIUM.flatMap(({ index, height }) => {
    const standing = standings[index];
    // Players with the same total share the place, and the medal
    return standing
      ? [{ index, height, standing, ...MEDALS[Math.min(standing.rank, 3)] }]
      : [];
  });
  const rest = standings.slice(3);

  return (
    // Not flattened away, so it can be captured
    <View ref={ref} collapsable={false} style={{ width }}>
      <LinearGradient
        colors={["#1e1b4b", "#3730a3", "#4f46e5"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ borderRadius: 24, padding: 20, gap: 20 }}
      >
        <View style={{ gap: 4 }}>
          <View className="flex-row items-center justify-between">
            <Text className="text-xs font-bold tracking-widest text-indigo-200">
              {status.isFinished ? "🏆 FINAL RESULTS" : "🎾 STANDINGS"}
            </Text>
            <Text className="text-xs text-indigo-200">
              {formatDay(game.createdAt)}
            </Text>
          </View>
          <Text className="text-2xl font-bold text-white" numberOfLines={2}>
            {game.name}
          </Text>
          <Text className="text-xs text-indigo-200">
            {formatLabel(game.format)} · {game.players.length} players ·{" "}
            {game.pointsPerMatch} points
            {status.seriesCount > 1 ? ` · ${status.seriesCount} series` : ""}
            {status.isFinished
              ? ""
              : ` · ${status.matchesPlayed} of ${status.matchesTotal} matches played`}
          </Text>
        </View>

        <View className="flex-row items-end gap-2">
          {podium.map(({ index, height, color, medal, standing }) => {
            const ratingChange = change(standing);
            return (
              <View key={index} className="flex-1 items-center gap-1.5">
                <Text style={{ fontSize: index === 0 ? 34 : 26 }}>{medal}</Text>
                <Text
                  className="text-center text-sm font-semibold text-white"
                  numberOfLines={2}
                >
                  {standing.name}
                </Text>
                <View
                  style={{
                    height,
                    backgroundColor: `${color}33`,
                    borderColor: `${color}99`,
                  }}
                  className="w-full items-center justify-center rounded-t-xl border border-b-0"
                >
                  <Text
                    className="text-xl font-bold text-white"
                    style={tabular}
                  >
                    {standing.total}
                  </Text>
                  {ratingChange !== undefined && (
                    <Text
                      className="text-xs font-semibold"
                      style={[tabular, { color: changeColor(ratingChange) }]}
                    >
                      {signed(ratingChange)} rating
                    </Text>
                  )}
                </View>
              </View>
            );
          })}
        </View>

        {rest.length > 0 && (
          <View className="overflow-hidden rounded-2xl bg-white/10">
            {rest.map((standing, index) => {
              const ratingChange = change(standing);
              return (
                <View
                  key={standing.playerId}
                  className="flex-row items-center gap-3 px-4 py-2"
                  style={
                    index > 0
                      ? {
                          borderTopWidth: 1,
                          borderTopColor: "rgba(255,255,255,0.08)",
                        }
                      : undefined
                  }
                >
                  <Text className="w-8 text-sm text-indigo-200" style={tabular}>
                    {ordinal(standing.rank)}
                  </Text>
                  <Text
                    className="flex-1 text-sm font-medium text-white"
                    numberOfLines={1}
                  >
                    {standing.name}
                  </Text>
                  {ratingChange !== undefined && (
                    <Text
                      className="text-xs"
                      style={[tabular, { color: changeColor(ratingChange) }]}
                    >
                      {signed(ratingChange)}
                    </Text>
                  )}
                  <Text
                    className="w-10 text-right text-sm font-semibold text-white"
                    style={tabular}
                  >
                    {standing.total}
                  </Text>
                </View>
              );
            })}
          </View>
        )}

        {(highlights.biggestGain ||
          highlights.matchOfTheDay ||
          highlights.biggestWin) && (
          <View className="gap-2">
            {highlights.biggestGain && (
              <Highlight
                emoji="📈"
                label="Biggest rating gain"
                text={`${highlights.biggestGain.player.name} ${signed(highlights.biggestGain.change)}`}
              />
            )}
            {highlights.matchOfTheDay && (
              <Highlight
                emoji={highlights.matchOfTheDay.isUpset ? "😱" : "🔥"}
                label={
                  highlights.matchOfTheDay.isUpset
                    ? "Upset of the day"
                    : "Closest match"
                }
                text={matchText(highlights.matchOfTheDay)}
                detail={
                  highlights.matchOfTheDay.isUpset &&
                  highlights.matchOfTheDay.chance !== null
                    ? `Only a ${chancePercent(highlights.matchOfTheDay.chance)} chance to win`
                    : undefined
                }
              />
            )}
            {highlights.biggestWin && (
              <Highlight
                emoji="💪"
                label="Biggest win"
                text={matchText(highlights.biggestWin)}
              />
            )}
          </View>
        )}

        <Text className="text-center text-xs font-semibold tracking-widest text-indigo-200">
          BRAGSTER
        </Text>
      </LinearGradient>
    </View>
  );
}

const matchText = (match: PadelMatchHighlight) =>
  `${names(match.winner)} beat ${names(match.loser)} ${match.winnerScore}–${match.loserScore}`;

function Highlight({
  emoji,
  label,
  text,
  detail,
}: {
  emoji: string;
  label: string;
  text: string;
  detail?: string;
}) {
  return (
    <View className="flex-row items-center gap-3 rounded-2xl bg-white/10 px-4 py-3">
      <Text style={{ fontSize: 22 }}>{emoji}</Text>
      <View className="min-w-0 flex-1">
        <Text className="text-xs font-semibold text-indigo-200">{label}</Text>
        <Text className="text-sm font-medium text-white">{text}</Text>
        {detail && <Text className="text-xs text-indigo-200">{detail}</Text>}
      </View>
    </View>
  );
}
