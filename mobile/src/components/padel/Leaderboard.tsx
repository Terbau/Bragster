import { View } from "react-native";
import { Text } from "@/components/ui/text";
import { getPadelProgress, getPadelStandings } from "@/lib/padel";
import type { PadelGame } from "@/lib/types";
import { cn } from "@/lib/utils";

const medalClasses: Record<number, { badge: string; text: string }> = {
  1: { badge: "bg-amber-400", text: "text-amber-950" },
  2: { badge: "bg-zinc-300", text: "text-zinc-800" },
  3: { badge: "bg-orange-300", text: "text-orange-950" },
};

export function Leaderboard({ game }: { game: PadelGame }) {
  const standings = getPadelStandings(game.players, game.rounds);
  const { played } = getPadelProgress(game.rounds);
  const hasCompensation = standings.some((s) => s.compensation > 0);
  const unevenGames = standings.some((s) => s.scheduled !== standings[0]?.scheduled);

  return (
    <View className="gap-3">
      <View className="overflow-hidden rounded-xl border border-border bg-card">
        {standings.map((standing, index) => {
          const medal = played > 0 ? medalClasses[standing.rank] : undefined;
          return (
            <View
              key={standing.playerId}
              className={cn(
                "flex-row items-center gap-3 px-4 py-3",
                index > 0 && "border-t border-border",
              )}
            >
              <View
                className={cn(
                  "h-7 w-7 items-center justify-center rounded-full",
                  medal?.badge ?? "bg-muted",
                )}
              >
                <Text
                  className={cn(
                    "text-xs font-semibold",
                    medal?.text ?? "text-muted-foreground",
                  )}
                >
                  {standing.rank}
                </Text>
              </View>
              <View className="min-w-0 flex-1">
                <Text className="text-base font-medium" numberOfLines={1}>
                  {standing.name}
                </Text>
                <Text className="text-xs text-muted-foreground">
                  {standing.played}/{standing.scheduled} played · {standing.wins}{" "}
                  {standing.wins === 1 ? "win" : "wins"} ·{" "}
                  {standing.difference > 0 ? `+${standing.difference}` : standing.difference}
                </Text>
              </View>
              <View className="items-end">
                <Text
                  className="text-xl font-bold"
                  style={{ fontVariant: ["tabular-nums"] }}
                >
                  {standing.total}
                  {standing.compensation > 0 ? "*" : ""}
                </Text>
                {standing.compensation > 0 && (
                  <Text className="text-[11px] text-muted-foreground">
                    {standing.points} + {standing.compensation}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
      {unevenGames && (
        <Text className="text-xs leading-5 text-muted-foreground">
          {hasCompensation ? "* " : ""}Players with one match less get their average score
          for it once they have played all their matches.
        </Text>
      )}
    </View>
  );
}
